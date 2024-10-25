---
title: 'sentinel 入门'
date: 2024-05-01
author: "shuiMu"
categories: 
  - 技术
tags:
  - sentinel
---
# Sentinel

## 1. 服务雪崩及其解决方案

1. 当服务访问量达到一定程度，流量扛不住的时候，该如何处理？
2. 服务之间相互依赖，当服务A出现响应时间过长，影响到服务B的响应，进而产生连锁反应，直至影响整个依赖链上的所有服务，该如何处理？

> 如何保证微服务运行期间的稳定性，这是分布式、微服务开发不可避免的问题。

### 1.1 什么是服务雪崩

在一个高度服务化的系统中,我们实现的一个业务逻辑通常会依赖多个服务,比如:商品详情展示服务会依赖商品服务, 价格服务, 商品评论服务. 如图所示:

![img](/Sentinel.assets/74023.png)

调用三个依赖服务会共享商品详情服务的线程池. 如果其中的商品评论服务不可用, 就会出现线程池里所有线程都因等待响应而被阻塞, 从而造成服务雪崩. 如图所示:

![img](/Sentinel.assets/74024.png)

在微服务调用链路中，因服务提供者的不可用导致服务调用者的不可用,并将不可用逐渐放大的过程，就叫服务雪崩效应。

![img](/Sentinel.assets/74475.png)

**导致服务不可用的原因：**

- **程序有Bug**：代码循环调用的逻辑问题，资源未释放引起的内存泄漏等问题；
- **大流量请求**：在秒杀和大促开始前,如果准备不充分,瞬间大量请求会造成服务提供者的不可用；
- **硬件故障**：可能为硬件损坏造成的服务器主机宕机, 网络硬件故障造成的服务提供者的不可访问；
- **缓存击穿**：一般发生在缓存应用重启, 缓存失效时高并发，所有缓存被清空时,以及短时间内大量缓存失效时。大量的缓存不命中, 使请求直击后端,造成服务提供者超负荷运行,引起服务不可用。

在服务提供者不可用的时候，会出现大量重试的情况：用户重试、代码逻辑重试，这些重试最终导致：进一步加大请求流量。所以归根结底导致雪崩效应的最根本原因是：大量请求线程同步等待造成的资源耗尽。当服务调用者使用同步调用时, 会产生大量的等待线程占用系统资源。一旦线程资源被耗尽,服务调用者提供的服务也将处于不可用状态, 于是服务雪崩效应产生了。

### 1.2 解决方案

- 超时机制：设定超时时间，请求超过一定时间没有响应就返回错误信息，不会无休止地等待。
- 服务限流：限制业务访问的QPS，避免服务因为流量的突增而故障。这种是从预防层面来解决雪崩问题。
- 舱壁隔离(资源隔离)：限定每个业务能使用的线程数，避免耗尽整个线程池的资源。它是通过划分线程池的线程，让每个业务最多使用n个线程，进而提高容灾能力。但是这种模式会导致一定的资源浪费，比如，服务C已经宕机，但每次还是会尝试让服务A去向服务C发送请求
  ![img](/Sentinel.assets/74025.png)
- 服务熔断降级：这种模式主要是参考电路熔断，如果一条线路电压过高，保险丝会熔断，防止火灾。放到我们的系统中，如果某个目标服务调用慢或者有大量超时，此时，熔断该服务的调用，对于后续调用请求，不在继续调用目标服务，直接返回，快速释放资源。如果目标服务情况好转则恢复调用。
    - 有服务熔断，必然要有服务降级。所谓降级，就是当某个服务熔断之后，服务将不再被调用，此时客户端可以自己准备一个本地的fallback（回退）回调，返回一个缺省值。 例如：(备用接口/缓存/mock数据) 。这样做，虽然服务水平下降，但好歹可用，比直接挂掉要强，当然这也要看适合的业务场景。

## 2. 流量治理组件Sentinel实战

### 2.1 Sentinel 是什么

> 随着微服务的流行，服务和服务之间的稳定性变得越来越重要。Sentinel 是面向分布式、多语言异构化服务架构的流量治理组件，主要以流量为切入点，从流量路由、流量控制、流量整形、熔断降级、系统自适应过载保护、热点流量防护等多个维度来帮助开发者保障微服务的稳定性。
>
> 官方文档：  https://sentinelguard.io/zh-cn/docs/introduction.html

Sentinel具有以下特征:

- **丰富的应用场景**： Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀（即突发流量控制在系统容量可以承受的范围）、消息削峰填谷、实时熔断下游不可用应用等。
- **完备的实时监控**： Sentinel 同时提供实时的监控功能。您可以在控制台中看到接入应用的单台机器秒级数据，甚至 500 台以下规模的集群的汇总运行情况。
- **广泛的开源生态**： Sentinel 提供开箱即用的与其它开源框架/库的整合模块，例如与 Spring Cloud、Dubbo、gRPC 的整合。您只需要引入相应的依赖并进行简单的配置即可快速地接入 Sentinel。
- **完善的 SPI 扩展点**： Sentinel 提供简单易用、完善的 SPI 扩展点。您可以通过实现扩展点，快速的定制逻辑。例如定制规则管理、适配数据源等。

### 2.2 Sentinel核心概念

#### **资源（Resource）**

资源是 Sentinel 的关键概念。它可以是 Java 应用程序中的任何内容，例如，由应用程序提供的服务，或由应用程序调用的其它应用提供的服务，甚至可以是一段代码。在接下来的文档中，我们都会用资源来描述代码块。

**只要通过 Sentinel API 定义的代码，就是资源，能够被 Sentinel 保护起来。**大部分情况下，可以使用方法签名，URL，甚至服务名称作为资源名来标示资源。

#### **规则(Rule)**

围绕资源的实时状态设定的规则，可以包括流量控制规则、熔断降级规则以及系统保护规则。所有规则可以动态实时调整。

## 3 Sentinel快速开始

### 基于原始方式

**1.引入依赖**

```xml
<dependency>
     <groupId>com.alibaba.csp</groupId>
     <artifactId>sentinel-core</artifactId>
     <version>1.8.6</version>
</dependency>
```

**2.定义受保护的资源和流控规则**

```java
@RestController
@Slf4j
public class HelloController {

    private static final String RESOURCE_NAME = "HelloWorld";

    @RequestMapping(value = "/hello")
    public String hello() {
        try (Entry entry = SphU.entry(RESOURCE_NAME)) {
            // 被保护的逻辑
            log.info("hello world");
            return "hello world";
        } catch (BlockException ex) {
            // 处理被流控的逻辑
            log.info("block!");
            return "被流控了";
        }
    
    }
    /**
     * 定义流控规则
     */
    @PostConstruct
    private static void initFlowRules(){
        List<FlowRule> rules = new ArrayList<>();
        FlowRule rule = new FlowRule();
        //设置受保护的资源
        rule.setResource(RESOURCE_NAME);
        // 设置流控规则 QPS
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        // 设置受保护的资源阈值
        // Set limit QPS to 20.
        rule.setCount(1);
        rules.add(rule);
        // 加载配置好的规则
        FlowRuleManager.loadRules(rules);
    }
}
```

**3. 测试结果**

> 结果如下，可以看到，每秒只有一个请求成功

![image-20241018170118466](/Sentinel.assets/image-20241018170118466.png)



### 微服务集成

> Sentinel 提供一个轻量级的开源[控制台](https://github.com/alibaba/Sentinel/wiki/控制台#2-启动控制台)，它提供机器发现以及健康情况管理、监控（单机和集群），规则管理和推送的功能。
>
> 注意：Sentinel 控制台目前仅支持单机部署

**启动Sentinel控制台**

1. 下载sentinel控制台jar包：
   https://github.com/alibaba/Sentinel/releases/download/1.8.6/sentinel-dashboard-1.8.6.jar

2. 启动

   ```shell
   java -Dserver.port=8080 -jar sentinel-dashboard-1.8.6.jar
   ```

3. 访问http://localhost:8080/#/login ,默认用户名密码： sentinel/sentinel
   ![image-20241018175524859](/Sentinel.assets/image-20241018175524859.png)

**微服务整合Sentinel**

1、**引入依赖：**

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

2、**业务代码中配置需要保护的资源**

> 当 SpringBoot 应用接入 Sentinel starter 后，可以针对某个 URL 进行流控。所有的 URL 就自动成为 Sentinel 中的埋点资源，可以针对某个 URL 进行流控。或者使用@SentinelResource 注解用来标识资源是否被限流、降级。

```java
// mvc接口方法自动埋点
@GetMapping("/info/{id}")
public String info(@PathVariable Long id) {
    log.info("info id: {}", id);
    return "hello " + id;
}

// 使用@SentinelResource 注解用来标识资源是否被限流、降级
@SentinelResource(value = "getUser",blockHandler = "handleException")
public UserEntity getById(Integer id) {
    return userDao.getById(id);
}

public UserEntity handleException(Integer id, BlockException ex) {
    UserEntity userEntity = new UserEntity();
    userEntity.setUsername("===被限流降级啦===");
    return userEntity;
}
```

3、**添加yml配置，为微服务设置sentinel控制台地址**

> spring.cloud.sentinel.transport.port 端口配置会在应用对应的机器上启动一个 Http Server，该 Server 会与 Sentinel 控制台做交互。比如 Sentinel 控制台添加了一个限流规则，会把规则数据 push 给这个 Http Server 接收，Http Server 再将规则注册到 Sentinel 中。
>
> 注意：sentinel控制台中，需要接口有过请求，才会展示资源，如果请求过也没有资源，可以增加启动参数：`-Dcsp.sentinel.dashboard.server=localhost:8080`
> ![image-20241022103657772](/Sentinel.assets/image-20241022103657772.png)

```yaml
server:
  port: 8000
spring:
  application:
    name: consumer
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        # 指定应用与Sentinel控制台交互的端口，应用会起一个HttpServer占用该端口
        # port: 8720
```

4、**启动sentinel控制台，在sentinel控制台中设置流控规则**

> - **资源名**:  接口的API
> - **针对来源**:  默认是default，当多个微服务都调用这个资源时，可以配置微服务名来对指定的微服务设置阈值
> - **阈值类型**: 分为QPS和线程数 假设阈值为10
> - **QPS类型**: 只得是每秒访问接口的次数>1就进行限流
> - **线程数**: 为接受请求该资源分配的线程数>1就进行限流

![img](/Sentinel.assets/74688.png)

5、**测试：**

> http://localhost:8800/user/info/1 因为QPS是1，所以1秒内多次访问会出现如下情形，每秒只有一个请求能够成功

![image-20241018182829249](/Sentinel.assets/image-20241018182829249.png)

### 通过Sentinel 对外暴露的 Endpoint查看相关的配置

> Sentinel Endpoint 里暴露的信息包括当前应用的所有规则信息、日志目录、当前实例的 IP，Sentinel Dashboard 地址应用与 Sentinel Dashboard 的心跳频率等等信息

1. 引入依赖

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-actuator</artifactId>
   </dependency>
   ```

2. **暴露监控端点**,application.yml中配置

   ```yaml
   #暴露actuator端点   
   management:
     endpoints:
       web:
         exposure:
           include: '*'
   ```

3. 访问地址：`http://localhost:8080/actuator/sentinel`

4. 流控规则：
   ![image-20241022183958734](/Sentinel.assets/image-20241022183958734.png)

### RestTemplate整合Sentinel

> Spring Cloud Alibaba Sentinel 支持对 RestTemplate 的服务调用使用 Sentinel 进行保护，在构造 RestTemplate bean的时候需要加上 @SentinelRestTemplate 注解。
>
> @SentinelRestTemplate 注解的属性支持限流(blockHandler, blockHandlerClass)和降级(fallback, fallbackClass  BlockException中的DegradeException)的处理。

#### **1、RestTemplate添加@SentinelRestTemplate注解**

```java
@Bean
@LoadBalanced
@SentinelRestTemplate
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

#### **2、使用`restTemplate`调用微服务接口**

```java
@GetMapping("/info/{id}")
public String info(@PathVariable Integer id) {
    log.info("info id: {}", id);
    // String s = memberFeignService.memberInfo(id);
    String s = restTemplate.getForObject("http://member/member/info/" + id, String.class);
    return "hello " + s;
}
```

#### **3、可以看到，对`restTemplate`支持两种粒度的配置**

> 整个微服务的路径
>
> 某个接口路径

![image-20241023105548639](/Sentinel.assets/image-20241023105548639.png)

#### **4、流控配置**

![image-20241023105734887](/Sentinel.assets/image-20241023105734887.png)

#### **5、测试结果**

> 当超过阈值时，展示如下异常

![image-20241023105926394](/Sentinel.assets/image-20241023105926394.png)

### OpenFeign整合Sentinel

#### **1、yaml开启sentinel对feign的支持**

```yaml
feign:
  sentinel:
    enabled: true  #开启Sentinel 对 Feign 的支持
```

#### **2、配置feign客户端类**

```java
@FeignClient(value = "member", path = "/member", fallbackFactory = FallbackMemberFeignService.class)
public interface MemberFeignService {

    @RequestMapping("/info/{userId}")
    String memberInfo(@PathVariable("userId") Integer userId);
}

@Component
public class FallbackMemberFeignService implements FallbackFactory<MemberFeignService> {
    @Override
    public MemberFeignService create(Throwable cause) {
        return new MemberFeignService() {
            @Override
            public String memberInfo(Integer userId) {
                return "被降级了";
            }
        };
    }
}
```

#### **3、测试，并生成调用资源链路**

![image-20241023110411685](/Sentinel.assets/image-20241023110411685.png)

#### **4、配置流控规则**

![image-20241023110513419](/Sentinel.assets/image-20241023110513419.png)

#### **5、测试结果**

![image-20241023110606290](/Sentinel.assets/image-20241023110606290.png)

#### **6、关闭`member`服务，再次请求测试，降级依旧生效**

![image-20241023110717840](/Sentinel.assets/image-20241023110717840.png)