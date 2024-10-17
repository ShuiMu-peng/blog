---
title: '分布式调度框架调研'
date: 2022-09-02
author: "shuiMu"
categories: 
  - 技术
tags:
  - quartz
  - dolphinScheduler
  - xxl-job
---
## quartz

> 参考资料：[Quartz原理解密 - Dorae - 博客园](https://www.cnblogs.com/Dorae/p/9357180.html)

### 架构图

> 去中心化设计，各个节点之间并无感知
>
> 通过 `mysql for update` 锁，保证任务不重复调用

<img title="" src="https://img-blog.csdn.net/20150519231230428" alt="" data-align="inline" width="608">

### 调度原理

**大概逻辑如下：**

![image-20220216191905877](/scheduler.assets/image-20220216191905877.png)

### 调度源码

> 核心调度类：`QuartzSchedulerThread`
> 
> 主要代码如下：

```java
// 获取可用线程
int availThreadCount = qsRsrcs.getThreadPool().blockForAvailableThreads();

// 获取待执行任务列表
triggers = qsRsrcs.getJobStore().acquireNextTriggers(
                                now + idleWaitTime, Math.min(availThreadCount, qsRsrcs.getMaxBatchSize()), qsRsrcs.getBatchTimeWindow());

// 加锁，并循环处理待执行任务,更新任务的下次执行时间
List<TriggerFiredResult> res = qsRsrcs.getJobStore().triggersFired(triggers);

// 异步执行任务
qsRsrcs.getThreadPool().runInThread(shell)
```

## elastic-job

> 参考资料：[概览 :: ElasticJob](https://shardingsphere.apache.org/elasticjob/current/cn/overview/#elasticjob-lite)

### 架构图

> - 节点功能：
>   - 注册到zk（通过zk协调任务分配）
>   - 任务定时调度（通过quartz）
>   - leader选举（curator框架提供的LeaderLatch，一种抢占的方式来决定选主。各个节点通过在zk上指定目录下建立临时顺序节点，然后对列表进行排序，排在第一个就是leader）
>     - leader 进行任务分片
>   - 任务分片执行
>     - 比如 A 任务需要处理100 条数据，为了快速执行，将任务切分为 3 片并行执行
>       - 分片1 处理 id % 3 ==0 的数据
>       - 分片2 处理 id % 3 ==1 的数据
>       - 分片3 处理 id % 3 ==2 的数据
>   - 日志输出
> - console 控制台项目，获取任务执行信息

<img title="" src="https://shardingsphere.apache.org/elasticjob/current/img/architecture/elasticjob_lite.png" alt="" data-align="inline" width="697">

<img src="/scheduler.assets/image-20220215223336024.png" alt="image-20220215223336024" style="zoom:50%;" />

### 调度原理

![image-20220217085340221](/scheduler.assets/image-20220217085340221.png)

### 集成方式：

#### pom.xml

```xml
<dependency>
  <groupId>org.apache.shardingsphere.elasticjob</groupId>
  <artifactId>elasticjob-lite-spring-boot-starter</artifactId>
  <version>${project.version}</version>
</dependency>
```

#### application.yml

```yaml
spring:
  profiles:
    active: dev
server:
  port: ${port:8080}
elasticjob:
  regCenter:
	  # zk地址
    serverLists: localhost:2181 
    #空间，相互独立隔离
    namespace: elasticjob-lite-springboot 
  jobs:
  	# job名称
    simpleJob: 
    	# 执行类
      elasticJobClass: org.apache.shardingsphere.elasticjob.lite.example.job.SpringBootSimpleJob
      # 定时表达式
      cron: 1/5 * * * * ?
      # 总分片数量
      shardingTotalCount: 3
      # 分片参数，分片的执行方法中，可以拿到
      shardingItemParameters: 0=Beijing,1=Shanghai,2=Guangzhou
```

#### java代码

```java
@Component
public class SpringBootSimpleJob implements SimpleJob {
    
    private final Logger logger = LoggerFactory.getLogger(SpringBootSimpleJob.class);
    
    @Autowired
    private FooRepository fooRepository;
    
    @Override
    public void execute(final ShardingContext shardingContext) {
        logger.info("Item: {} | Time: {} | Thread: {} | {}",
                // 当前分片值
                shardingContext.getShardingItem()
               , new SimpleDateFormat("HH:mm:ss").format(new Date())
               , Thread.currentThread().getId(), "SIMPLE");
      	// 根据自己的业务需要，根据分片参数，做相应的数据处理
        List<Foo> data = fooRepository.findTodoData(shardingContext.getShardingParameter(), 10);
        for (Foo each : data) {
            fooRepository.setCompleted(each.getId());
        }
    }
}
```



### 调度源码

> 因为底层基于`quartz`，所以任务触发核心依旧是：`QuartzSchedulerThread`
> 
> 对接底层`quartz`的job执行类为：`LiteJob.class`
> 
> 涉及类过多，此处仅展示调用关键流程，细节可查看具体源码

<img src="file:///Users/lipeng/Library/Application%20Support/marktext/images/2022-01-05-22-03-21-image.png" title="" alt="" width="742">

## xxl-job

> 参考资料：[分布式任务调度平台XXL-JOB](https://www.xuxueli.com/xxl-job/#%E3%80%8A%E5%88%86%E5%B8%83%E5%BC%8F%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6%E5%B9%B3%E5%8F%B0XXL-JOB%E3%80%8B)

### 架构图

> - 调度器、执行器 分离，去中心化，可动态伸缩
> - 数据中心：表示系统中会涵盖的所有数据信息

<img title="在这里输入图片标题" src="https://www.xuxueli.com/doc/static/xxl-job/images/img_Qohm.png" alt="输入图片说明" width="732">

### 调度原理

<img title="" src="file:///Users/lipeng/Library/Application%20Support/marktext/images/2022-01-05-22-07-36-image.png" alt="" width="835">

### 集成方式

#### admin

> 修改数据库配置，直接启动

#### executor

##### pom.xml

```xml
<!-- xxl-job-core -->
<dependency>
  <groupId>com.xuxueli</groupId>
  <artifactId>xxl-job-core</artifactId>
  <version>${project.parent.version}</version>
</dependency>
```

##### application.properties

```properties
### xxl-job admin address list, such as "http://address" or "http://address01,http://address02"
xxl.job.admin.addresses=http://127.0.0.1:8081/xxl-job-admin,http://127.0.0.1:8079/xxl-job-admin
### 注册的某个应用下
xxl.job.executor.appname=xxl-job-executor-sample
### 和admin交互的端口
xxl.job.executor.port=9999
### xxl-job executor log-path
xxl.job.executor.logpath=./data/applogs/xxl-job/jobhandler
### xxl-job executor log-retention-days
xxl.job.executor.logretentiondays=30
```

##### java代码

```java
/**
 * xxl job 配置
*/
@Configuration
public class XxlJobConfig {
    private final Logger logger = LoggerFactory.getLogger(XxlJobConfig.class);

    @Value("${xxl.job.admin.addresses}")
    private String adminAddresses;

    @Value("${xxl.job.accessToken}")
    private String accessToken;

    @Value("${xxl.job.executor.appname}")
    private String appname;

    @Value("${xxl.job.executor.address}")
    private String address;

    @Value("${xxl.job.executor.ip}")
    private String ip;

    @Value("${xxl.job.executor.port}")
    private int port;

    @Value("${xxl.job.executor.logpath}")
    private String logPath;

    @Value("${xxl.job.executor.logretentiondays}")
    private int logRetentionDays;


    @Bean
    public XxlJobSpringExecutor xxlJobExecutor() {
        logger.info(">>>>>>>>>>> xxl-job config init.");
        XxlJobSpringExecutor xxlJobSpringExecutor = new XxlJobSpringExecutor();
        xxlJobSpringExecutor.setAdminAddresses(adminAddresses);
        xxlJobSpringExecutor.setAppname(appname);
        xxlJobSpringExecutor.setAddress(address);
        xxlJobSpringExecutor.setIp(ip);
        xxlJobSpringExecutor.setPort(port);
        xxlJobSpringExecutor.setAccessToken(accessToken);
        xxlJobSpringExecutor.setLogPath(logPath);
        xxlJobSpringExecutor.setLogRetentionDays(logRetentionDays);

        return xxlJobSpringExecutor;
    }

}

@Slf4j
@Component
@RequiredArgsConstructor
public class SampleXxlJob {
    private final RestTemplate restTemplate;

    /**
     * 1、简单任务示例（Bean模式）
     */
    @XxlJob("demoJobHandler")
    public void demoJobHandler() throws Exception {
        log.info("===============");
        TimeUnit.SECONDS.sleep(5);
        // String forObject1 = restTemplate.getForObject("http://ADT-CAMPAIGN-PORTAL-METADATA-TEST/rest/dataAnalysisTask.json/get/897eb7c0-61a6-4b76-90eb-db9e23cdcc2e?id=90", String.class);
        // System.out.println(forObject1);
        //
        // String url = XxlJobHelper.getJobParam();
        // log.info("******====={}", url);
        // XxlJobHelper.log("XXL-JOB, Hello World.");
        // Assert.notNull(url, "url 不能为空");
        // String forObject = restTemplate.getForObject(url, String.class);
        // log.info(forObject);
    }
```

### Admin 调度源码

> 核心调度类：`JobScheduleHelper`
> 
> 主要代码如下：

```java
// 获取数据库🔐
preparedStatement = conn.prepareStatement(  "select * from xxl_job_lock where lock_name = 'schedule_lock' for update" );

// 查询下次执行事件 <= 未来5s的时间
List<XxlJobInfo> scheduleList = XxlJobAdminConfig.getAdminConfig().getXxlJobInfoDao().scheduleJobQuery(nowTime + PRE_READ_MS, preReadCount);

// 触发任务执行
JobTriggerPoolHelper.trigger(jobInfo.getId(), TriggerTypeEnum.CRON, -1, null, null, null);

// 更新下次执行时间
refreshNextValidTime(jobInfo, new Date());

// 提交事务，释放🔐
conn.commit();
```

## DolphinScheduler

> 参考资料：[调度框架dolphinscheduler](https://dolphinscheduler.apache.org/zh-cn/docs/latest/user_doc/About_DolphinScheduler/About_DolphinScheduler.html)
>
> 更贴合大数据的分布式调度框架

### 简介

#### 关于DolphinScheduler

> Apache 顶级开源项目，DolphinScheduler是一个分布式易扩展的可视化DAG工作流任务调度开源系统。解决数据研发ETL 错综复杂的依赖关系，不能直观监控任务健康状态等问题。DolphinScheduler以DAG流式的方式将Task组装起来，可实时监控任务的运行状态，同时支持重试、从指定节点恢复失败、暂停及Kill任务等操作
>
> **DAG：** 有向无环图。工作流中的Task任务以有向无环图的形式组装起来，从入度为零的节点进行拓扑遍历，直到无后继节点为止。举例如下图：
>
> ![dag示例](https://dolphinscheduler.apache.org/img/dag_examples_cn.jpg)

#### 特性：

##### 简单易用

> DAG监控界面，所有流程定义都是可视化，通过拖拽任务定制DAG，通过API方式与第三方系统对接, 一键部署

##### 高可靠性

> 去中心化的多Master和多Worker, 自身支持HA功能, 采用任务队列来避免过载，不会造成机器卡死

##### 丰富的使用场景

> 支持暂停恢复操作.支持多租户，更好的应对大数据的使用场景. 支持更多的任务类型，如 spark,flink, hive, mr, python, sub_process, shell

##### 高扩展性

> 支持自定义任务类型，调度器使用分布式调度，调度能力随集群线性增长，Master和Worker支持动态上下线

#### 用户

> [信息来源](https://dolphinscheduler.apache.org/zh-cn/user/index.html)

![image-20220212200323617](/scheduler.assets/image-20220212200323617-4667410.png)

### 功能介绍

#### 名词解释：

- **流程定义**：通过拖拽任务节点并建立任务节点的关联所形成的可视化**DAG**
- **流程实例**：流程实例是流程定义的实例化，可以通过手动启动或定时调度生成,流程定义每运行一次，产生一个流程实例
- **任务实例**：任务实例是流程定义中任务节点的实例化，标识着具体的任务执行状态
- **任务类型**：目前支持有SHELL、SQL、SUB_PROCESS(子流程)、PROCEDURE、MR、SPARK、PYTHON、DEPENDENT(依赖)、，同时计划支持动态插件扩展，注意：其中子 **SUB_PROCESS** 也是一个单独的流程定义，是可以单独启动执行的
- **调度方式**：系统支持基于cron表达式的定时调度和手动调度。命令类型支持：启动工作流、从当前节点开始执行、恢复被容错的工作流、恢复暂停流程、从失败节点开始执行、补数、定时、重跑、暂停、停止、恢复等待线程。 其中 **恢复被容错的工作流** 和 **恢复等待线程** 两种命令类型是由调度内部控制使用，外部无法调用
- **定时调度**：系统采用 **quartz** 分布式调度器，并同时支持cron表达式可视化的生成
- **依赖**：系统不单单支持 **DAG** 简单的前驱和后继节点之间的依赖，同时还提供**任务依赖**节点，支持**流程间的自定义任务依赖**
- **优先级** ：支持流程实例和任务实例的优先级，如果流程实例和任务实例的优先级不设置，则默认是先进先出
- **邮件告警**：支持 **SQL任务** 查询结果邮件发送，流程实例运行结果邮件告警及容错告警通知
- **失败策略**：对于并行运行的任务，如果有任务失败，提供两种失败策略处理方式，**继续**是指不管并行运行任务的状态，直到流程失败结束。**结束**是指一旦发现失败任务，则同时Kill掉正在运行的并行任务，流程失败结束
- **补数**：补历史数据，支持**区间并行和串行**两种补数方式



> Spark 任务日志：
>
> ![image-20220211105825056](/scheduler.assets/image-20220211105825056.png)

### 架构设计

> 参考资料：[架构设计](https://dolphinscheduler.apache.org/zh-cn/docs/latest/user_doc/architecture/design.html)
>
> **去中心化设计**

![img](https://dolphinscheduler.apache.org/img/architecture-1.3.0.jpg)



#### 模块功能

![Start process activity diagram](https://dolphinscheduler.apache.org/img/master-process-2.0-zh_cn.png)

##### API

>参考资料：https://dolphinscheduler.apache.org/zh-cn/docs/latest/user_doc/guide/open-api.html
>
>- 负责元数据的管理
>
>- api调用方式

##### MasterServer

> - MasterServer采用分布式无中心设计理念
> - 根据工作流元数据，负责 DAG 任务切分，触发任务调度，任务执行监控
> - 监听zk中注册的 `MasterServer` 和 `WorkerServer`节点
> - 根据zk中记录的 `WorkerServer`节点信息，按路由策略，选择`WorkerServer`，通过`Netty`发送调度信息
> - 根据`WorkerServer` 返回的执行状态信息，更新任务的状态
>
> ###### 包含服务:
>
> - **Quartz**分布式调度组件，主要负责定时任务的启停操作，当quartz调起任务后，Master内部会有线程池具体负责处理任务的后续操作
> - **MasterRegistryClient** 注册到zk中，并监听worker、master 注册的目录
> - **MasterSchedulerService**是一个扫描线程，定时扫描数据库中的 **command** 表，生成工作流实例，根据不同的**命令类型**进行不同的业务操作
> - **WorkflowExecuteThread**主要是负责DAG任务切分、任务提交、各种不同命令类型的逻辑处理，处理任务状态和工作流状态事件
> - **EventExecuteService**处理master负责的工作流实例所有的状态变化事件，使用线程池处理工作流的状态事件
> - **StateWheelExecuteThread**处理依赖任务和超时任务的定时状态更新
> - **FailoverExecuteThread** 任务容错处理
>
> **源码解析**
>
> **入口方法：**`org.apache.dolphinscheduler.server.master.MasterServer#run`
>
> springBoot 启动完成后，利用事件发布机制，调用此方法
>
> ```java
> // 下面仅列出关键执行方法
> 
> // 启动 NettyServer，用于和 WorkerServer 交互
> this.nettyRemotingServer.start();
> 
> // 注册到zk，并监听 zk 中的 /nodes/ 目录，当worker、master发生变化时，同步到内存中
> this.masterRegistryClient.start();
> 
> // 负责工作流实例中的状态变化
> this.eventExecuteService.start();
> 
> // 扫描线程，定时扫描数据库中的的command表，并启动StateWheelExecuteThread、 WorkflowExecuteThread 
> this.masterSchedulerService.start();
> 
> // 容错恢复线程，查找未成功的任务 且调度者为自身或已经挂掉的节点数据，对失败任务进行重新处理
> this.failoverExecuteThread.start();
> 
> // quartz 启动
> QuartzExecutors.getInstance().start();
> ```
>

##### WorkerServer

>- WorkerServer也采用分布式无中心设计理念，服务启动时向Zookeeper注册临时节点；
>
>- 接收`MasterServer`调度请求，进行任务执行（所以woker所在服务，需要准备好任务执行所需的各种环境，比如spark、flink）；并响应执行结果
>
>
>**包含服务**
>
>- **WorkerManagerThread**主要通过netty领取master发送过来的任务，并根据不同任务类型调用**TaskExecuteThread**对应执行器。
>- **RetryReportTaskStatusThread**主要通过netty向master汇报任务状态
>
>**源码解析：**
>
>**入口方法**：`org.apache.dolphinscheduler.server.worker.WorkerServer#run`
>
>```java
>// spring bean实例化后，调用的初始化方法
>@PostConstruct
>public void run() {
>  
>  // 启动nettyServer，并
>  this.nettyRemotingServer.start();
>
>  // 注册zk
>  this.workerRegistryClient.registry();
>
>  // 启动worker处理线程
>  this.workerManagerThread.start();
>
>  // 向master发送任务状态
>  this.retryReportTaskStatusThread.start();
>}

##### Alert

>- 告警管理，查询数据库中需要告警的数据，进行发送
>- sql 类型任务，发送邮件也会通过此服务
>
>源码仅支持单机服务

##### LoggerServer

> 日志服务，给`API`服务调用查看日志

####  `quartz` 整合原理

- `API` 服务在定时任务启动时，会将定时信息，按照`quartz`需要的格式，插入到数据库中
- `quartz` 定时触发时，`org.apache.dolphinscheduler.service.quartz.ProcessScheduleJob`类，会将任务信息，插入到表`t_ds_command`

### 运维

> 参考资料：[运维手册](https://dolphinscheduler.apache.org/zh-cn/docs/latest/user_doc/guide/installation/cluster.html)
>
> 注意：若需要支持 动态扩容、缩容；需要 docker 部署方式

### 二次开发

> 参考资料：[开发者指南](https://dolphinscheduler.apache.org/zh-cn/development/development-environment-setup.html)

#### 技术栈

- quartz（2.3.0）
- mysql（5.7.13）
- springBoot（2.5.6）
- [mybatisPlus](https://baomidou.com/pages/24112f/)（3.2.0）
- zookeeper(3.4.6+)
- 统一资源管理 : 共享存储支持[ `HDFS`、`S3A`、`MinIO`]
- 前端：VUE

#### 源码模块

- dolphinscheduler-alert 告警模块，提供 AlertServer 服务。
- dolphinscheduler-api web应用模块，提供 ApiServer 服务。
- dolphinscheduler-common 通用的常量枚举、工具类、数据结构或者基类
- dolphinscheduler-dao 提供数据库访问等操作。
- dolphinscheduler-remote 基于 netty 的客户端、服务端
- dolphinscheduler-server MasterServer 和 WorkerServer 服务
- dolphinscheduler-service service模块，包含Quartz、Zookeeper、日志客户端访问服务，便于server模块和api模块调用
- dolphinscheduler-ui 前端模块

#### spi机制

> service provider interface：java 提供的服务发现机制

**例如 告警插件的扩展：**

> 1、项目启动时，会找到所有告警插件，插入到数据库中
>
> 2、告警发送时，根据配置的告警类型，找到实现类进行发送

```java
// 告警渠道工厂 接口类
public interface AlertChannelFactory {
    String name();

    AlertChannel create();
    /**
     * Returns the configurable parameters that this plugin needs to display on the web ui
     */
    List<PluginParams> params();
}

// 告警渠道发送接口
public interface AlertChannel {
    AlertResult process(AlertInfo info);
}

// http 发送工厂
// @AutoService 是google提供的便捷spi方式，类似lombok;
// 编译后在目录：target/classes/META-INF/services/org.apache.dolphinscheduler.alert.api.AlertChannelFactory 文件
@AutoService(AlertChannelFactory.class)
public final class HttpAlertChannelFactory implements AlertChannelFactory {
    @Override
    public String name() {
        return "Http";
    }

    @Override
    public List<PluginParams> params() {
       .......
    }

    @Override
    public AlertChannel create() {
        return new HttpAlertChannel();
    }
}

// http 发送实现类
public final class HttpAlertChannel implements AlertChannel {
    @Override
    public AlertResult process(AlertInfo alertInfo) {
        AlertData alertData = alertInfo.getAlertData();
        Map<String, String> paramsMap = alertInfo.getAlertParams();
        if (null == paramsMap) {
            return new AlertResult("false", "http params is null");
        }

        return new HttpSender(paramsMap).send(alertData.getContent());
    }
}
```

### 实践

> **ADT如何应用？**（还没有实现）
>
> - HTTP调度服务：特点：需要通过 `微服务名称`方式调用（不直接使用域名）
>   - 现有方式：使用的`quartz`框架，并且注册至注册中心，所以可以通过服务名称进行调用
>   - DS方式：需要增加一个能够调用微服务接口的桥梁接口，DS携带真实请求路径访问中间接口，桥梁接口转发真实调用请求
> - **归因引擎**：特点：`有序的 3 个 flink`任务
>   - 现有方式：3个jenkins任务使用 shell 脚本 去调用flink任务，java代码 发起 jenkins，并轮询获取jenkins执行状态，第一个成功后，发起第二个任务调用，依次调用完成
>   - DS方式：
>     - 定义flink任务执行的 dag图，flink 任务执行结束后，增加 Http任务节点（可以检验返回值，保证稳定调用成功），或者连接数据库直接更新数据的状态
>     - java代码 调用 DS的接口，发起任务调用

### FAQ

https://dolphinscheduler.apache.org/zh-cn/docs/release/faq.html

### 其他资料：

![image-20220210081901024](/scheduler.assets/image-20220210081901024.png)

![image-20220210082252183](/scheduler.assets/image-20220210082252183.png)

## 对比

|                    | xxl-job                                                   | elastic-job                                                  | quzrtz | dolphinscheduler                                             |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------ | ------ | ------------------------------------------------------------ |
| 集群依赖           | mysql                                                     | zookeeper                                                    | mysql  | mysql、zookeeper                                             |
| 动态扩容           | 支持                                                      | 支持                                                         | 支持   | master、worker支持                                           |
| 任务分片，并行处理 | 支持                                                      | 支持                                                         |        | 不支持                                                       |
| 管理界面           | 非常完善                                                  | 完善，需要单独部署项目， 但是如果需要新增加定时任务，需要二次开发 |        | 非常完善                                                     |
| 日志追溯           | 支持                                                      | 支持                                                         |        | 支持                                                         |
| 任务失败处理策略   | 内置邮件告警， 可轻易扩展其他告警方式，如：钉钉、企业微信 | 内置：邮件、企业微信、钉钉                                   |        | 内置：邮件、企业微信、钉钉、飞书、http......<br />且支持扩展 |
| 集成困难度         | 简单                                                      | 简单                                                         | 简单   | 略复杂                                                       |
| 支持DAG            | 不支持，未来计划支持                                      | 不支持，未来计划支持                                         |        | 支持                                                         |

## 选择

一定要按照实际需求

- 基础业务调用，不需要`dag`；且对大数据任务需求较少
  - 建议选择 `xxl-job`
  - 因为：基础功能强大，简单易用，环境依赖，架构简单，易维护
- else：
  - 选择`Dolphinscheduler`



