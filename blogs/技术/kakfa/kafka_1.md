---
title: 'Kafka 入门'
date: 2021-05-02
author: "shuiMu"
categories: 
  - 技术
tags:
  - kafka
---
## Kafka简介：

Kafka是最初由Linkedin公司开发，是一个分布式、支持分区的（partition）、多副本的（replica），基于zookeeper协调的分布式消息系统，它的最大的特性就是可以实时的处理大量数据以满足各种需求场景：比如基于hadoop的批处理系统、低延迟的实时系统、Storm/Spark流式处理引擎，web/nginx日志、访问日志，消息服务等等，用scala语言编写，Linkedin于2010年贡献给了Apache基金会并成为顶级开源 项目。

## 安装维护

### 命令操作

```shell
# zk 安装
wget https://mirror.bit.edu.cn/apache/zookeeper/zookeeper‐3.5.8/apache‐zookeeper‐3.5.8‐bin.tar.gz 
tar ‐zxvf apache‐zookeeper‐3.5.8‐bin.tar.gz
cd apache‐zookeeper‐3.5.8‐bin 
cp conf/zoo_sample.cfg conf/zoo.cfg 
# 启动zookeeper 
bin/zkServer.sh start 
bin/zkCli.sh 
#查看zk的根目录相关节点
ls / 

# kafka 安装
# 2.11是scala的版本，2.4.1是kafka的版本 
wget https://mirror.bit.edu.cn/apache/kafka/2.4.1/kafka_2.11‐2.4.1.tgz 
tar ‐xzf kafka_2.11‐2.4.1.tgz 
cd kafka_2.11‐2.4.1
#broker.id属性在kafka集群中必须要是唯一 
broker.id=0 
#kafka部署的机器ip和提供服务的端口号
listeners=PLAINTEXT://localhost:9092 
#kafka的消息存储文件 
log.dir=/usr/local/data/kafka‐logs 
#kafka连接zookeeper的地址 
zookeeper.connect=localhost:2181
# 启动kafka，运行日志在logs目录的server.log文件里 
bin/kafka‐server‐start.sh ‐daemon config/server.properties 
#后台启动，不会打印日志到控制台 3 或者用 
bin/kafka‐server‐start.sh config/server.properties & 
# 我们进入zookeeper目录通过zookeeper客户端查看下zookeeper的目录树 
bin/zkCli.sh 
ls / #查看zk的根目录kafka相关节点 
ls /brokers/ids #查看kafka节点 
# 停止kafka 
bin/kafka‐server‐stop.sh
#创建名为 test 的 topic,通过手工的方式创建Topic，当producer发布一个消息到某个指定的Topic，这个Topic如果不存在，就自动创建
#partitions 分区数
#replication-factor 副本数
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 3 --partitions 3 --topic topic_test2
#查看kafka中目前存在的topic
bin/kafka-topics.sh --list --zookeeper localhost:2181
#删除主题
bin/kafka-topics.sh --delete --topic test --zookeeper localhost:2181
#发送消息,每行都是一条消息
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test 
>this is a msg
>this is a another msg 
#消费消息
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test
#如果想要消费之前的消息可以通过--from-beginning参数指定，如下命令：
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 
--topic test 
#消费多主题
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --whitelist "test|test-2"
#单播消费,一条消息只能被某一个消费者消费的模式，类似queue模式，只需让所有消费者在同一个消费组里即可
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092  --consumer-property group.id=testGroup --topic test
#多播消费 发布订阅模式，指定到不同的消费组中
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --consumer-property group.id=testGroup-2 --topic test
#查看消费组名称
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list 
#查看消费组的消费偏移量
#current-offset：当前消费组的已消费偏移量
#log-end-offset：主题对应分区消息的结束偏移量(HW)
#lag：当前消费组未消费的消息数
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group testGroup-2
#增加 partitions 数量
bin/kafka-topics.sh -alter --partitions 3 --zookeeper localhost:2181 --topic test5
#查看 topic 状态
bin/kafka-topics.sh --describe --zookeeper 172.23.4.32:2181/kafka/product/kafka821 --topic topic_test2

#临时设置日志存储时间
bin/kafka-configs.sh  --zookeeper 172.23.4.32:2181/kafka/product/kafka821 --alter --add-config 'retention.ms=4320000' --entity-name topic_tset2 --entity-type topics
#删除设置
bin/kafka-configs.sh  --zookeeper 172.23.4.32:2181/kafka/product/kafka821 --alter --delete-config 'retention.ms' --entity-name topic_tset2 --entity-type topics

# 如果是java客户端，查看消费offset偏移量时，需要带上 --new-consumer 参数
bin/kafka-consumer-groups.sh --new-consumer --bootstrap-server 172.23.4.32:9092,172.23.4.33:9092,172.23.4.33:9093 --group nike_callback_consumer3 --describe
```

## 组件介绍

![image-20210531093311879](/kafka.assets/image-20210531093311879.png)

| **名称**        | **解释**                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Broker        | 消息中间件处理节点，一个Kafka节点就是一个broker，一个或者多个Broker可以组成一个Kafka集群                                              |
| Topic         | Kafka根据topic对消息进行归类，发布到Kafka集群的每条消息都需要指定一个topic                                                      |
| Producer      | 消息生产者，向Broker发送消息的客户端                                                                                |
| Consumer      | 消息消费者，从Broker读取消息的客户端                                                                                |
| ConsumerGroup | 每个Consumer属于一个特定的Consumer Group，一条消息可以被多个不同的Consumer Group消费，但是一个Consumer Group中只能有一个Consumer能够消费该消息 |
| Partition     | 物理上的概念，一个topic可以分为多个partition，每个partition内部消息是有序的                                                    |

### server.properties 主要配置

```http
#配置文档地址
http://kafka.apache.org/documentation/#brokerconfigs
```

| **Property**               | **Default**                | **Description**                                                                                                                                      |
| -------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| broker.id                  | 0                          | 每个broker都可以用一个唯一的非负整数id进行标识；这个id可以作为broker的`名字`，你可以选择任意你喜欢的数字作为id，只要id是唯一的即可。                                                                        |
| log.dirs                   | /tmp/kafka-logs            | kafka存放数据的路径。这个路径并不是唯一的，可以是多个，路径之间只需要使用逗号分隔即可；每当创建新partition时，都会选择在包含最少partitions的路径下进行。                                                             |
| listeners                  | PLAINTEXT://localhost:9092 | server接受客户端连接的端口，ip配置kafka本机ip即可                                                                                                                     |
| zookeeper.connect          | localhost:2181             | zooKeeper连接字符串的格式为：hostname:port，此处hostname和port分别是ZooKeeper集群中某个节点的host和port；zookeeper如果是集群，连接方式为 hostname1:port1, hostname2:port2, hostname3:port3 |
| log.retention.hours        | 168                        | 每个日志文件删除之前保存的时间。默认数据保存时间对所有topic都一样。                                                                                                                 |
| num.partitions             | 1                          | 创建topic的默认分区数                                                                                                                                        |
| default.replication.factor | 1                          | 自动创建topic的默认副本数量，建议设置为大于等于2                                                                                                                          |
| min.insync.replicas        | 1                          | 当producer设置acks为-1时，min.insync.replicas指定replicas的最小数目（必须确认每一个repica的写数据都是成功的），如果这个数目没有达到，producer发送消息会产生异常                                          |

## 使用：

### Controller

> 在Kafka早期版本，对于分区和副本的状态的管理依赖于zookeeper的Watcher和队列：每一个broker都会在zookeeper注册Watcher，所以zookeeper就会出现大量的Watcher, 假设某个broker宕机，且此broker上的partition很多比较多，会造成多个Watcher触发，造成集群内大规模调整；每一个replica都要去再次zookeeper上注册监视器，当集群规模很大的时候，zookeeper负担很重。这种设计很容易出现脑裂和羊群效应以及zookeeper集群过载

在`kafka`集群中，会有一个或多个`broker`，其中一个`broker`被选为`控制器(Controller)`，主要职责：

- `partition leader` 选举
- 主题管理（创建、删除、增加分区）
  - 这里的主题管理，就是指控制器帮助我们完成对 Kafka，主题的创建、删除以及分区增加的操作；
- 分区重分配
  - 当某个`Topic`增加分区时，负责新分区 被其他`broker`感知到
- 集群成员管理
  - 自动检测新增 Broker、Broker 主动关闭及被动宕机，监听`/brokers/ids`子节点的数据变更
- 数据服务
  - 向其他 Broker 提供数据服务
  - 所有主题信息。包括具体的分区信息，比如领导者副本是谁，ISR 集合中有哪些副本等。
  - 所有 Broker 信息。包括当前都有哪些运行中的 Broker，哪些正在关闭中的 Broker 等。
  - 所有涉及运维任务的分区。包括当前正在进行`leader`选举以及分区重分配的分区列表。
  - 值得注意的是，这些数据其实在 ZooKeeper 中也保存了一份。每当控制器初始化时，它都会从 ZooKeeper 上读取对应的元数据并填充到自己的缓存中。有了这些数据，控制器就能对外提供数据服务了。这里的对外主要是指对其他 Broker 而言，控制器通过向这些 Broker 发送请求的方式将这些数据同步到其他 Broker 上

#### Controller选举机制

- 每个`broker`会尝试在zk创建`/controller` `临时`节点，谁创建成功，就会成为集群的总控制器`controller`
  
  ```shell
  {"version":1,"brokerid":0,"timestamp":"1622977268033"}
  ```

- 集群中的其他`broker`都会一直监听`/controller`，如果`controller`所在的broker宕机，临时节点消失，则会竞争再次创建`/controller`临时节点，选举出新的`controller`

- 每个`broker`内存中还会记录有`activeControllerId`,如果某个broker之前是`ctonrller`,由于网络等原因，导致集群中的`controller`重新选举，网络恢复后，获取到`/controler`节点中记录的和自身`brokerId`不同，则会进行`退位`操作,比如关闭相应资源，关闭一些zk监听节点等

- 可以通过手动删除zk下`/controller`节点，来触发`Controller`的选举

#### Controller唯一性

- `controller_epoch`:用于记录`controller`的变更次数，保存在zk`/controller_epoch`中，初始值为1，控制器发生变更时，此值增加1，也称作`控制器的纪元`
- `broker`会存储最新`/controller_epoch`的值，控制器的每次交互，都会携带上`controller_epoch`这个字段，收到`controller`的命令之后，会拿到`controller_epoch`进行比较，如果小于内存中的`controller_epoch`，则忽略此命令

### Topic和partition

#### 概念：

可以理解Topic是一个类别的名称，同类消息发送到同一个Topic下面。对于每一个Topic，下面可以有多个分区(Partition)日志文件:

Partition是一个有序的message序列，这些message按顺序添加到一个叫做commit log的文件中。每个partition中的消息都有一个唯一的编号，称之为offset，用来唯一标示某个分区中的message。 
每个partition，都对应一个commit log文件。一个partition中的message的offset都是唯一的，但是不同的partition中的message的offset可能是相同的。

每个partition，存在1个`leader` ,  0个或多个`followers`,**leader处理所有的针对这个partition的读写请求，followers被动复制leader的结果，不提供读写，如果某个leader宕机，其中的一个follower将会自动变成新的leader**。可以看到每个`partition`的`leader`及`follower`，均匀的分布在不同的`broker`,且一个`broker`不可能出现某个`partition`的多个副本

```shell
#查看 topic 状态
bin/kafka-topics.sh --describe --zookeeper localhost:2181 --topic topic_test2
```

![image-20210523183408179](/kafka.assets/image-20210523183408179.png)

- leader节点负责给定partition的所有读写请求
- replicas 表示某个partition在哪几个broker上存在备份。不管这个几点是不是`leader`，甚至这个节点挂了，也会列出。
- isr 是replicas的一个子集，它只列出当前还存活着的，并且**已同步备份**了该partition的节点。
  - 节点必须能够维护与ZooKeeper的会话(通过ZooKeeper的心跳机制)
  - 副本能复制leader上的所有写操作，并且不能落后太多
    - 与leader副本同步滞后的副本，是由 `replica.lag.time.max.ms` 配置决定的，超过这个时间都没有跟leader同步过的一次的副本会被移出ISR列表

> 当kill broker.id =0 的节点之后，再查看 topic的信息：
> 
> ![image-20210523184704038](/kafka.assets/image-20210523184704038.png)

#### Leader选举机制

- `controller`是什么?
- `controller`感知到分区`leader`所在的`broker`挂了(controller 通过监听zk节点)
- `unclean.leader.election.enable=false`，`controller`会根据`AR`集合的顺序，并且在`ISR`列表中存活的作为`leader`「优先副本」
  - 优先副本：replicas 中的第一个
- 如果参数`unclean.leader.election.enable=true`，则可以在`ISR`以外的列表中选择`leader`,这种可以提高可用性，但是选择的`leader`可能数据缺失比较多

#### 分区自动平衡

> `broker` 自平衡

**执行下面步骤**

- kill  `broker2`，此时`partition0`、`partition1` 的 leader都在broker0

![image-20210609214557490](/kafka.assets/image-20210609214557490.png)

- 启动`broker2`，刚启动时，`partition0`、`partition1` 的 leader都在broker0

![image-20210609214455036](/kafka.assets/image-20210609214455036.png)

- 注意：此时 broker0 的平衡率= `非优先副本的leader个数(partition0)` /`总分区数(3)` =33.33%,大于默认的10%
- 五分钟后：partition0, leader 重新选举为 broker2

![image-20210609214824009](/kafka.assets/image-20210609214824009.png)

> 通过上面现象可知：分区自平衡，是自动帮助broker均衡压力的一种机制
> 
> 注意：生产环境建议关闭自动平衡，因为自平衡过程中，势必造成业务阻塞，频繁超时情况，所以建议手动平衡

```properties
#是否开启自动平衡
auto.leader.rebalance.enabl:true
#broker中的不平衡率 = 非优先副本的leader个数 / 分区总数
#优先副本：replicas 中的第一个
#不平衡率 > 此配置(%)，则需要出发自动平衡策略，将优先副本设置为leader
leader.imbalance.per.broker.percentage=10
#执行周期 300s,五分钟
leader.imbalance.check.interval.seconds=300

#手动执行
bin/kafka-preferred-replica-election.sh --zookeeper localhost:2181
```

#### 如何选择合适的分区数？

##### 性能测试工具

```shell
# num-records 数据条数
# record-size 每条数据大小
# throughput 小于0，表示不限速，大于0，每秒限速(kb/s)
# acks 0直接返回，1 leader持久化后返回，-1 或 all 所有副本持久化后返回
# print-metrics 额外打印一些指标信息
bin/kafka-producer-perf-test.sh --topic topic_test --num-records 1000 --record-size 1024 --throughput -1 --producer-props bootstrap.servers=localhost:9092 acks=1 --print-metrics

# records/sec 每秒发送的数据条数
# MB/sec 每秒发送大小
# avg latency 每条消息处理平均时长
# max latency 每条消息处理最大时长
# 10 ms 50th, 15 ms 95th, 15 ms 99th, 134 ms 99.9th，表示 50%、95% 等消息处理时长
```

<img src="/kafka.assets/image-20210608094154665.png" alt="image-20210608094154665" style="zoom:150%;" />

当设置 `throughput 100 时`

<img src="/kafka.assets/image-20210608094230053.png" alt="image-20210608094230053" style="zoom:150%;" />

##### 分区数越多吞吐量越高吗?

- 首先分别创建分区数为 20、50、100、200、500、1000 topic，对应 主题名称分别为 topic-1、topic 20、topic-50、topic-100、topic-200、topic-500、topic-1000 ，所有主题的副本因子都设置为 0

- 每个topic都发送 1000000条，size=1024的数据，结果如下：
  
  <img src="/kafka.assets/image-20210608095811782.png" alt="image-20210608095811782"  />

> 注意：此结果比较片面，跟硬件环境有一定关系，只是能说明一种现象，并非随着分区数增加，吞吐量一直增加

##### 分区数如何设置

> 最好的答案是：视具体情况而定
> 
> 如上述实验，合适的分区数增加，能够在一定程度上提高吞吐量，但是超过一定阈值后，不升反降，所以如果对吞吐量有一定要求，最好的方案是：投入生产环境之前，模拟线上硬件环境、数据量，做一个完整的吞吐量测试，以找到合适的分区数阈值，同时尽量设置分区数为集群内broker节点的倍数；如 3个broker，可以设定分区数3、6、9等，倍数的选定，可以参考预估的吞吐量。但是broker数量很多的几十上百，则这种方式也不适用，进一步考虑基础架构的参考因素
> 
> 分区数上限：受到系统文件描述符限制
> 
> ```shell
> #软限制
> ulimit -Sn
> #硬限制
> ulimit -Hn
> ```

#### **为什么要对Topic下数据进行分区存储？**

- commit log文件会受到所在机器的文件系统大小的限制，分区之后可以将不同的分区放在不同的机器上，相当于对数据做了分布式存储，理论上一个topic可以处理任意数量的数据。
- 提高可用性
- 提高并行度

### 日志存储

#### 文件目录布局

kafka会根据配置的日志保留时间(`log.retention.hours`)确认消息多久被删除，默认保留最近一周的日志消息

一个分区的消息数据对应存储在一个文件夹下，以topic名称+分区号命名，消息在分区内是分段(segment)存储，每个段的消息都存储在不一样的log文件里，这种特性方便old segment file快速被删除，kafka规定了一个段位的 log 文件最大为 1G，做这个限制目的是为了方便把 log 文件加载到内存去操作：

```shell
# 文件名称表示当前文件offset的开始值
# 部分消息的offset索引文件，kafka每次往分区发4K(log.index.interval.bytes)消息就会记录一条当前消息的offset到index文件
# 如果要定位消息的offset会先在这个文件里快速定位，再去log文件里找具体消息
00000000000000000000.index
# 消息存储文件，主要存offset和消息体
00000000000000000000.log
# 消息的发送时间索引文件，kafka每次往分区发4K(log.index.interval.bytes)消息就会记录一条当前消息的发送时间戳与对应的offset到timeindex文件，
# 如果需要按照时间来定位消息的offset，会先在这个文件里查找
00000000000000000000.timeindex
00000000000005367851.index
00000000000005367851.log
00000000000005367851.timeindex

00000000000009936472.index
00000000000009936472.log
00000000000009936472.timeindex
```

我们知道consumer提交的offset是保存在内部topic`_consumer_offset`中，初始情况下，这个主题并不存在，当第一次有消费者消费消息时，会自动创建这个主题

#### 消息压缩

### Zookeeper存储

![img](https://note.youdao.com/yws/public/resource/d9fed88c81ff75e6c0e6364012d19fef/xmlnote/2F76FF53FBF643E785B18CD0F0C2D3D2/83219)

## 扩展

### EFAK

> 参考：https://www.cnblogs.com/smartloli/p/9371904.html
> 
> 下载：http://download.smartloli.org/
> 
> 配置环境变量：
> 
> ```shell
> export KE_HOME=/home/hadoop/kafka/kafka-eagle-bin-2.0.8/efak-web-2.0.8
> export PATH=$PATH:$KE_HOME/bin
> ```
> 
> 修改配置文件
> 
> ```properties
> ######################################
> # multi zookeeper & kafka cluster list
> # Settings prefixed with 'kafka.eagle.' will be deprecated, use 'efak.' instead
> ######################################
> efak.zk.cluster.alias=cluster1
> cluster1.zk.list=172.20.39.2:2181/kafka/product/kafka281
> 
> ######################################
> # zookeeper enable acl
> ######################################
> #cluster1.zk.acl.enable=false
> #cluster1.zk.acl.schema=digest
> #cluster1.zk.acl.username=test
> #cluster1.zk.acl.password=test123
> 
> ######################################
> # broker size online list
> ######################################
> cluster1.efak.broker.size=20
> 
> ######################################
> # zk client thread limit
> ######################################
> kafka.zk.limit.size=32
> 
> ######################################
> # EFAK webui port
> ######################################
> efak.webui.port=8048
> 
> ######################################
> # kafka jmx acl and ssl authenticate
> ######################################
> cluster1.efak.jmx.acl=false
> cluster1.efak.jmx.user=keadmin
> cluster1.efak.jmx.password=keadmin123
> cluster1.efak.jmx.ssl=false
> cluster1.efak.jmx.truststore.location=/data/ssl/certificates/kafka.truststore
> cluster1.efak.jmx.truststore.password=ke123456
> 
> ######################################
> # kafka offset storage
> ######################################
> cluster1.efak.offset.storage=kafka
> #cluster2.efak.offset.storage=zk
> 
> ######################################
> cluster1.efak.jmx.uri=service:jmx:rmi:///jndi/rmi://%s/jmxrmi
> 
> ######################################
> # kafka metrics, 15 days by default
> ######################################
> efak.metrics.charts=true
> efak.metrics.retain=15
> # kafka sql topic records max
> ######################################
> efak.sql.topic.records.max=5000
> efak.sql.topic.preview.records.max=10
> 
> ######################################
> # delete kafka topic token
> ######################################
> efak.topic.token=keadmin
> 
> ######################################
> # kafka sasl authenticate
> ######################################
> cluster1.efak.sasl.enable=false
> cluster1.efak.sasl.protocol=SASL_PLAINTEXT
> cluster1.efak.sasl.mechanism=SCRAM-SHA-256
> cluster1.efak.sasl.client.id=
> cluster1.efak.blacklist.topics=
> cluster1.efak.sasl.cgroup.enable=false
> cluster1.efak.sasl.cgroup.topics=
> cluster2.efak.sasl.enable=false
> cluster2.efak.sasl.protocol=SASL_PLAINTEXT
> cluster2.efak.sasl.mechanism=PLAIN
> cluster2.efak.sasl.client.id=
> cluster2.efak.blacklist.topics=
> cluster2.efak.sasl.cgroup.enable=false
> cluster2.efak.sasl.cgroup.topics=
> 
> ######################################
> # kafka ssl authenticate
> ######################################
> cluster3.efak.ssl.enable=false
> cluster3.efak.ssl.protocol=SSL
> cluster3.efak.ssl.truststore.location=
> cluster3.efak.ssl.truststore.password=
> cluster3.efak.ssl.keystore.location=
> cluster3.efak.ssl.keystore.password=
> cluster3.efak.ssl.key.password=
> cluster3.efak.ssl.endpoint.identification.algorithm=https
> cluster3.efak.blacklist.topics=
> cluster3.efak.ssl.cgroup.enable=false
> cluster3.efak.ssl.cgroup.topics=
> 
> ######################################
> # kafka sqlite jdbc driver address
> ######################################
> #efak.driver=org.sqlite.JDBC
> #efak.url=jdbc:sqlite:/hadoop/kafka-eagle/db/ke.db
> #efak.username=root
> #efak.password=www.kafka-eagle.org
> 
> ######################################
> # kafka mysql jdbc driver address
> ######################################
> efak.driver=com.mysql.cj.jdbc.Driver
> efak.url=jdbc:mysql://172.20.48.2:3306/ke?useUnicode=true&characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull
> efak.username=appcpa
> efak.password=appcpa
> ```
> 
> 启动：
> 
> ```shell
> ke.sh start    
> ke.sh stop    
> ke.sh restart    
> ke.sh status    
> ke.sh stats    
> ke.sh find [ClassName]    
> ```