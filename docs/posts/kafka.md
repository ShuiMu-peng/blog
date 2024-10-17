---
title: 'Kafka'
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

### producer

#### 拦截器：

> - onSend：分区路由选择之前，调用此方法
> - onAcknowledgement：callback方法之前
> - close：producer 客户端调用close之后
> - configure：可以拿到客户端的所有配置
> 
> 可以使用此方式，做一些值统一处理，或者日志信息打印等

```java
public class MyProducerInterceptor implements ProducerInterceptor<String, String> {
    private volatile long successCount = 0;
    private volatile long failCount = 0;

    // 增加 value 前缀
    @Override
    public ProducerRecord<String, String> onSend(ProducerRecord<String, String> record) {
        String newValue = "new-- " + record.value();
        return new ProducerRecord<>(record.topic(), record.partition(), record.key(), newValue, record.headers());
    }

    @Override
    public void onAcknowledgement(RecordMetadata metadata, Exception exception) {
        if (Objects.isNull(exception)) {
            System.out.println("发送成功");
        } else {
            System.out.println("发送失败");
            // TODO: 2021/6/9  
        }
    }

    @Override
    public void close() {
        System.out.println("");
    }

    @Override
    public void configure(Map<String, ?> configs) {

    }
}

// 配置, 多个拦截器 逗号隔开，按顺序执行
props.put(ProducerConfig.INTERCEPTOR_CLASSES_CONFIG, MyProducerInterceptor.class.getName());
```

#### 消息路由：

选择`partition`机制为：

- 如果指定`partition`，直接使用
- 未指定`partition`，但指定了`key`,对`key 进行 hash（MurmurHash2）`,与总的分区数取模`%`，计算出`partition`
- `partition` 和 `key`都未指定，轮询方式发送至可用分区

> 注意：如果key不为null，会选择所有分区中的某一个，如果key为null，会选择可用分区的某一个
> 
> 参考：`org.apache.kafka.clients.producer.internals.DefaultPartitioner`

```java
// org.apache.kafka.clients.producer.internals.DefaultPartitioner#partition
        private int partition(ProducerRecord<K, V> record, byte[] serializedKey, byte[] serializedValue, Cluster cluster) {
        Integer partition = record.partition();
        return partition != null ?
                partition :
                partitioner.partition(
                        record.topic(), record.key(), serializedKey, record.value(), serializedValue, cluster);
    }


// org.apache.kafka.clients.producer.internals.DefaultPartitioner#partition
    public int partition(String topic, Object key, byte[] keyBytes, Object value, byte[] valueBytes, Cluster cluster) {
        if (keyBytes == null) {
            return stickyPartitionCache.partition(topic, cluster);
        } 
        List<PartitionInfo> partitions = cluster.partitionsForTopic(topic);
        int numPartitions = partitions.size();
        // hash the keyBytes to choose a partition
        return Utils.toPositive(Utils.murmur2(keyBytes)) % numPartitions;
    }


// org.apache.kafka.clients.producer.internals.StickyPartitionCache#nextPartition
     while (newPart == null || newPart.equals(oldPart)) {
         Integer random = Utils.toPositive(ThreadLocalRandom.current().nextInt());
         newPart = availablePartitions.get(random % availablePartitions.size()).partition();
     }
```

#### JAVA客户端使用：

```java
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092,localhost:9093,localhost:9094");
         /*
         发出消息持久化机制参数
        （1）acks=0： 表示producer不需要等待任何broker确认收到消息的回复，就可以继续发送下一条消息。性能最高，但是最容易丢消息。
        （2）acks=1： 至少要等待leader已经成功将数据写入本地log，但是不需要等待所有follower是否成功写入。就可以继续发送下一
             条消息。这种情况下，如果follower没有成功备份数据，而此时leader又挂掉，则消息会丢失。
        （3）acks=-1或all： 需要等待 min.insync.replicas(默认为1，推荐配置大于等于2) 这个参数配置的副本个数都成功写入日志，这种策略会保证
            只要有一个备份存活就不会丢失数据。这是最强的数据保证。一般除非是金融级别，或跟钱打交道的场景才会使用这种配置。
         */
        props.put(ProducerConfig.ACKS_CONFIG, "1");
        // 发送失败会重试，默认重试间隔100ms，重试能保证消息发送的可靠性，但是也可能造成消息重复发送，比如网络抖动，所以需要在
        // 接收者那边做好消息接收的幂等性处理
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        //重试间隔设置
        props.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 300);
        //设置发送消息的本地缓冲区，如果设置了该缓冲区，消息会先发送到本地缓冲区，可以提高消息发送性能，默认值是33554432，即32MB
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
        // kafka本地线程会从缓冲区取数据，批量发送到broker，
        // 设置批量发送消息的大小，默认值是16384，即16kb，就是说一个batch满了16kb就发送出去
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        // 默认值是0，意思就是消息必须立即被发送，但这样会影响性能
        // 一般设置10毫秒左右，就是说这个消息发送完后会进入本地的一个batch，如果10毫秒内，这个batch满了16kb就会随batch一起被发送出去
        // 如果10毫秒内，batch没满，那么也必须把消息发送出去，不能让消息的发送延迟时间太长
        props.put(ProducerConfig.LINGER_MS_CONFIG, 10);
        //把发送的key从字符串序列化为字节数组
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        //把发送消息value从字符串序列化为字节数组
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.INTERCEPTOR_CLASSES_CONFIG, MyProducerInterceptor.class.getName());
        Producer<String, String> producer = new KafkaProducer<>(props);

        int msgNum = 5;
        final CountDownLatch countDownLatch = new CountDownLatch(msgNum);
        for (int i = 1; i <= msgNum; i++) {
            //指定发送分区
            // ProducerRecord<String, String> producerRecord = new ProducerRecord<String, String>(TOPIC_NAME
            //         , 0, order.getOrderId().toString(), JSON.toJSONString(order));
            //未指定发送分区，具体发送的分区计算公式：hash(key)%partitionNum
            ProducerRecord<String, String> producerRecord = new ProducerRecord<>(TOPIC_NAME, "hhh:" + i);

            //等待消息发送成功的同步阻塞方法
            /*RecordMetadata metadata = producer.send(producerRecord).get();
            System.out.println("同步方式发送消息结果：" + "topic-" + metadata.topic() + "|partition-"
                    + metadata.partition() + "|offset-" + metadata.offset());*/

            //异步回调方式发送消息
            producer.send(producerRecord, (metadata, exception) -> {
                if (exception != null) {
                    System.err.println("发送消息失败：" + Arrays.toString(exception.getStackTrace()));

                }
                if (metadata != null) {
                    System.out.println("异步方式发送消息结果：" + "topic-" + metadata.topic() + "|partition-"
                            + metadata.partition() + "|offset-" + metadata.offset());
                }
                countDownLatch.countDown();
            });
        }
        countDownLatch.await(5, TimeUnit.SECONDS);
        producer.close();
```

#### 原理图：

![企业微信截图_612a3d0d-2731-42a6-8c3d-1219647a3ab3](/kafka.assets/企业微信截图_612a3d0d-2731-42a6-8c3d-1219647a3ab3.png)

- `org.apache.kafka.clients.producer.internals.RecordAccumulator`
  - 消息累加器，本地消息的缓存
  - `ConcurrentMap<TopicPartition, Deque<ProducerBatch>> batches`
    - key：分区
    - value：双端队列，保存消息`ProducerBatch`
  - ProducerBatch：一批`ProducerRecord` ,默认 16kb
- `org.apache.kafka.clients.producer.internals.Sender`
  - `implements Runnable`异步线程，从`RecordAccumulator`中获取消息
  - 封装成`clientRequest`
    - 封装成`inFlightRequest`对象，缓存到到：`org.apache.kafka.clients.InFlightRequests#requests`
      - Map<BrokerId，InFlightRequest>
    - `selector.send(send)`
- `org.apache.kafka.clients.InFlightRequests`
  - 请求发出时缓存，收到响应 或者 检测到超时后，会进行清理
  - **作用：**
    - 控制每个broker节点，正在运行请求的个数，默认5,超过此个数，则循环阻塞，配置参数：`max.in.flight.requests.per.connection`
    - 同步集群元数据流程和正常发送消息类似，也是封装 `MetadataRequest`，并且缓存在此，`InFlightRequests`缓存中，可以找到压力最小的 `broker`节点，使用此节点来进行元数据的同步

#### 元数据同步

> 客户端超过`metadata.max.age.ms`配置时间元数据没有更新，则会触发元数据同步
> 
> 元数据是指 Kafka 集群的元数据，这些元数据具体记录了集群中有哪些主题，这些主题有哪些分区，每个分区的 leader副本分配在哪个节点上， follower 副本分配在哪些节点上，哪些副本在 AR ISR 等集合中，集群中有哪些节点，控制器节点又是哪一个等信息。

#### 写入流程：

- `producer`从`zk`中找到`partition`的`leader`节点
  ![image-20210601090513559](/kafka.assets/image-20210601090513559.png)
- 将消息发送至`leader`节点
- `leader`将消息写入本地log
- `follower`从 `leader  pull`消息，写入本地后，向`leader`发送`Ack`
- `leader`收到所有 `ISR` 中节点的`Ack`后，增加`HW(hign watemark)`

#### `HW`和`LEO`

`HW`高水位，HighWatemark的缩写，取一个`partition`对应的`ISR中最小的LEO(log-end-offset)作为HW`,`consumer`最多只能消费到`HW`所在的位置

过程如下：

![image-20210602090739069](/kafka.assets/image-20210602090739069.png)

为什么这么设计？

- 保证各个副本`可消费`数据一致性

#### 问题：

**producer 发送套路**

```java
public enum ApiKeys {
    // producer 发送数据
    PRODUCE(0, "Produce"),
    // 元数据请求
    METADATA(3, "Metadata"),
    // consumer offset 提交
    OFFSET_COMMIT(8, "OffsetCommit"),
    // consumer offset 获取
    OFFSET_FETCH(9, "OffsetFetch"),
    // consumer 加入消费组
    JOIN_GROUP(11, "JoinGroup"),
    // consumer 心跳
    HEARTBEAT(12, "Heartbeat"),
    // 消费组离开 group
    LEAVE_GROUP(13, "LeaveGroup"),
    // 消费组 同步消费组内的分区方案
    SYNC_GROUP(14, "SyncGroup"),
    //...... more
}
```

**producer Ack1，hw没有更新，能消费到么？**

- 不能

**metadata 更新时机：**

> ```java
> MetadataResponseData(throttleTimeMs=0, 
> brokers=[
>  MetadataResponseBroker(nodeId=0, host='172.30.105.131', port=9092, rack=null), 
>  MetadataResponseBroker(nodeId=2, host='172.30.105.131', port=9094, rack=null), 
>  MetadataResponseBroker(nodeId=1, host='172.30.105.131', port=9093, rack=null)
> ], 
> clusterId='M8qSCCTbR1OV0FTd_rm_PA', controllerId=0, 
> topics=[
>  MetadataResponseTopic(errorCode=0, name='test5', isInternal=false, 
>                        partitions=[
>                          MetadataResponsePartition(errorCode=0, partitionIndex=0, leaderId=0, leaderEpoch=0, replicaNodes=[0, 2, 1], isrNodes=[0, 2, 1], offlineReplicas=[]),
>                          MetadataResponsePartition(errorCode=0, partitionIndex=1, leaderId=1, leaderEpoch=0, replicaNodes=[1, 0, 2], isrNodes=[1, 0, 2], offlineReplicas=[]), 
>                          MetadataResponsePartition(errorCode=0, partitionIndex=2, leaderId=2, leaderEpoch=0, replicaNodes=[2, 1, 0], isrNodes=[2, 1, 0], offlineReplicas=[])], 
> topicAuthorizedOperations=-2147483648)],
> clusterAuthorizedOperations=-2147483648)
> ```

- `send` 方法时，强制等待更新一次
  
  - 设置`needUpdate` 为`true`
    
    ```java
    public synchronized void awaitUpdate(final int lastVersion, final long maxWaitMs) throws InterruptedException {
      if (maxWaitMs < 0) {
        throw new IllegalArgumentException("Max time to wait for metadata updates should not be < 0 milli seconds");
      }
      long begin = System.currentTimeMillis();
      // metadata.fetch.timeout.ms 元数据更新等待最大时间
      long remainingWaitMs = maxWaitMs;
      // 没有更新，则一直 wait
      while (this.version <= lastVersion) {
        if (remainingWaitMs != 0)
          wait(remainingWaitMs);
        long elapsed = System.currentTimeMillis() - begin;
        if (elapsed >= maxWaitMs)
          throw new TimeoutException("Failed to update metadata after " + maxWaitMs + " ms.");
        remainingWaitMs = maxWaitMs - elapsed;
      }
    }
    
    // sender 更新成功后，调用此方法
    public synchronized void update(Cluster cluster, long now) {
      this.needUpdate = false;
      this.lastRefreshMs = now;
      this.lastSuccessfulRefreshMs = now;
        // version 变化
      this.version += 1;
    
      for (Listener listener: listeners)
        listener.onMetadataUpdate(cluster);
    
      // Do this after notifying listeners as subscribed topics' list can be changed by listeners
      this.cluster = this.needMetadataForAllTopics ? getClusterForCurrentTopics(cluster) : cluster;
      // 唤醒 wait 线程
      notifyAll();
      log.debug("Updated cluster metadata version {} to {}", this.version, this.cluster);
    }
    ```

- `sender`线程中，`long metadataTimeout = metadataUpdater.maybeUpdate(now);`
  
  ```java
  @Override
  public long maybeUpdate(long now) {
    // 
    long timeToNextMetadataUpdate = metadata.timeToNextUpdate(now);
    // （上次没有可用Node的时间 + 重试间隔 - 当前时间）一般为负数
    long timeToNextReconnectAttempt = Math.max(this.lastNoNodeAvailableMs + metadata.refreshBackoff() - now, 0);
    // 是否存在已发送元数据更新请求，但没有返回结果？
    long waitForMetadataFetch = this.metadataFetchInProgress ? Integer.MAX_VALUE : 0;
    // 取最大值
    long metadataTimeout = Math.max(Math.max(timeToNextMetadataUpdate, timeToNextReconnectAttempt),
                                    waitForMetadataFetch);
    // 为0，执行可能更新方法
    if (metadataTimeout == 0) {
      // 获取最空闲的节点
      Node node = leastLoadedNode(now);
      maybeUpdate(now, node);
    }
  
    return metadataTimeout;
  }
  
  public synchronized long timeToNextUpdate(long nowMs) {
    // 强制更新？0: Math.max((上次更新时间 + 刷新元数据的间隔时间 - 当前时间),0)
    long timeToExpire = needUpdate ? 0 : Math.max(this.lastSuccessfulRefreshMs + this.metadataExpireMs - nowMs, 0);
    // （上次请求时间 + 重试间隔 - 当前时间）一般为负数
    long timeToAllowUpdate = this.lastRefreshMs + this.refreshBackoffMs - nowMs;
    return Math.max(timeToExpire, timeToAllowUpdate);
  }
  
  - `leastLoadedNode`：最空闲的节点
    
      public Node leastLoadedNode(long now) {
          List<Node> nodes = this.metadataUpdater.fetchNodes();
          int inflight = Integer.MAX_VALUE;
          Node found = null;
  
          int offset = this.randOffset.nextInt(nodes.size());
          for (int i = 0; i < nodes.size(); i++) {
              int idx = (offset + i) % nodes.size();
              Node node = nodes.get(idx);
              int currInflight = this.inFlightRequests.inFlightRequestCount(node.idString());
              if (currInflight == 0 && this.connectionStates.isConnected(node.idString())) {
                  // if we find an established connection with no in-flight requests we can stop right away
                  return node;
              } else if (!this.connectionStates.isBlackedOut(node.idString(), now) && currInflight < inflight) {
                  // otherwise if this is the best we have found so far, record that
                  inflight = currInflight;
                  found = node;
              }
          }
  
          return found;
      }
  ```
  

### consumer

kafka中的消费，是以组为单位：

```shell
#查看消费组的消费偏移量
#current-offset：当前消费组的已消费偏移量
#log-end-offset：主题对应分区消息的结束偏移量(HW)
#lag：当前消费组未消费的消息数
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group testGroup-2
```

![image-20210601084800343](/kafka.assets/image-20210601084800343.png)

#### 消费模式：

- 点对点：所有的`consumer`位于同一个`consumer group`
- 发布订阅模式：每个`consumer`都有自己唯一的`consumer group`

![image-20210531084930672](/kafka.assets/image-20210531084930672.png)

说明：由两个`broker`组成的kafka集群，某个`topic`共有4个`partition`,共有两个`consumer group`去消费，`consumer group 1`有两个`consumer `,`consumer group 2` 有5个`consumer `

> 注意：`consumer group` 中如果`consumer `的数量 `大于`分区`partition`的数量，则会存在`consumer `消费不到数据的情况，不过多出来的可以用作`容灾备份`

#### 消费顺序：

Kafka只在`partition`的范围内保证消费的局部顺序性，不能再同一个`topic`的多个`partition`中保证总的消费顺序性，

> 如果非要保证总体上的顺序消费，可以将`topic`的`partition`数量设置为1，将`consumer group`中的`consumer `数量也设置为1

#### 消费者客户端

##### 必要的参数配置：

> `org.apache.kafka.clients.consumer.ConsumerConfig`

- `bootstrap.servers`：host1:port1,host2:port2
- `group.id`：消费组
- `key.deserializer`：
- `value.deserializer`：

##### 订阅主题与分区

> Tips：同一种订阅模式重复订阅会覆盖，不同模式会报错

```java
// SubscriptionType.AUTO_TOPICS
// 指定topic
public void subscribe(Collection<String> topics, ConsumerRebalanceListener listener);
public void subscribe(Collection<String> topics);

// SubscriptionType.AUTO_PATTERN
// 正则匹配topicName
public void subscribe(Pattern pattern, ConsumerRebalanceListener listener);
public void subscribe(Pattern pattern);

// SubscriptionType.USER_ASSIGNED
// 指定topic + 分区
public void assign(Collection<TopicPartition> partitions) 


  // 再均衡监听器
  consumer.subscribe(Collections.singletonList(TOPIC_NAME), new ConsumerRebalanceListener() {
    @Override
    public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
      // partitions 再均衡之前分配的分区信息
      // 可以做位移提交操作
    }

    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
      // 再均衡之后，分配到的分区信息
    }
  });
```

##### 反序列化

```java
public interface Deserializer<T> extends Closeable {

    default void configure(Map<String, ?> configs, boolean isKey) {
    }

    T deserialize(String topic, byte[] data);

    default T deserialize(String topic, Headers headers, byte[] data) {
        return deserialize(topic, data);
    }

    @Override
    default void close() {
    }
}

// 默认的 字符串反序列化实现
public class StringDeserializer implements Deserializer<String> {
    private String encoding = "UTF8";
    // .....

    @Override
    public String deserialize(String topic, byte[] data) {
        try {
            if (data == null)
                return null;
            else
                return new String(data, encoding);
        } catch (UnsupportedEncodingException e) {
            throw new SerializationException("Error when deserializing byte[] to string due to unsupported encoding " + encoding);
        }
    }
  // ....
}
```

##### 位移提交

> offset：Topic每个分区下每条消息唯一的`offset`值
> 
> 存储：kafka 提供了一个内部 topic `_consumer_offsets` 来存储所有`consumerGroup`的offset信息，默认50个分区，可以通过`offsets.topic.num.partitions`指定
> 
> ```shell
> # 存储的分区计算：
> Math.abs("consumerGropuID".hashCode()) % 50
> # 查看提交记录
> bin/kafka-simple-consumer-shell.sh --topic __consumer_offsets --partition 49 --broker-list 172.20.39.2:9092 --formatter "kafka.coordinator.GroupMetadataManager\$OffsetsMessageFormatter" 
> ```
> 
> ![image-20210805192328049](/kafka.assets/image-20210805192328049.png)
> 
> 消费者消费完消息后，进行消息的提交,提交的 `offset` 值为当前消费的`最大offset +1  `
> 
> ![image-20210806082425949](/kafka.assets/image-20210806082425949.png)

###### `offset`提交流程：

- consumer执行poll时，先请求服务端，获取当前（consummerGroup、topic、partition）需要消费的`offset`值，且本地缓存`Map<TopicPartition, TopicPartitionState> `
- 当`poll`拉取到消息后，更新本地缓存的`TopicPartitionState 中的 position`值为最后一条record 的 offset值
- 自动提交(默认)：
  - 每隔 5s(可配置)，将拉取到的各个分区的最大位移值进行提交，且为异步提交方式
    - 消息丢失：位移已经提交，消费消费出现异常
    - 消息重复消费：有五秒延时，已消费完成部分数据，但未提交时，出现异常
- 手动提交：
  - 显示执行：consumer.commitSync(); 或者 consumer.commitAsync();
  - consumer.commitSync()
    - 会阻塞，性能略差，如果程序消费至一半，出现异常，没有提交位移，则会发生重复消费的问题
  - consumer.commitAsync()
    - 异步提交方式，可以提供callback参数，对提交结果做相应处理，但是如果真的提交失败了，依然会存在一些问题：比如同时两个异步提交的请求，第一个失败了，第二个成功了，代码中对失败的处理为重试，第一个失败后重试又成功了，则会覆盖第二次的提交offse，所以并没有完美的解决方案；更何况一般情况下位移提交也不会失败。

###### 配置参数：

- `enable.auto.commit`: 是否自动提交 true/false

- `auto.commit.interval.ms`: 为自动提交时，自动提交的时间间隔

#### 指定位移消费

> `auto.offset.reset`:
> 
> - latest（默认）:只消费自己启动之后发送到主题的消息
> - earliest：第一次从头开始消费，以后按照消费消费组offset记录继续消费，这个需要区别于consumer.seekToBeginning(每次都从头开始消费)
> - none：当前消费组没有消费位移记录时，抛出异常`NoOffsetForPartitionException`

```java
// api 优先于 auto.offset.reset
// 从头开始消费
consumer.seekToBeginning(Arrays.asList(new TopicPartition(TOPIC_NAME, 0)));

// 指定位移消费
consumer.seek(new TopicPartition(TOPIC_NAME, 0), 10);

// 0.11.x 版本增加：从指定时间点开始消费
List<PartitionInfo> topicPartitions = consumer.partitionsFor(TOPIC_NAME);
// 从1小时前开始消费
long fetchDataTime = new Date().getTime() - 1000 * 60 * 60;
Map<TopicPartition, Long> map = new HashMap<>();
for (PartitionInfo par : topicPartitions) {
  map.put(new TopicPartition(topicName, par.partition()), fetchDataTime);
}
// 根据时间拿到 offset值
Map<TopicPartition, OffsetAndTimestamp> parMap = consumer.offsetsForTimes(map);
for (Map.Entry<TopicPartition, OffsetAndTimestamp> entry : parMap.entrySet()) {
  TopicPartition key = entry.getKey();
  OffsetAndTimestamp value = entry.getValue();
  if (key == null || value == null) continue;
  Long offset = value.offset();
  System.out.println("partition-" + key.partition() + "|offset-" + offset);
  //根据消费里的timestamp确定offset
  if (value != null) {
    consumer.assign(Arrays.asList(key));
        // 指定位移消费
    consumer.seek(key, offset);
  }
}
```

#### Rebalance机制

> 指的是当消费组中的消费者数量发生变化或者消费的topic分区数发生变化时，kafka重新分配消费者消费分区的关系；比如：消费组中某个消费者挂掉了，此时会将分配给它的分区交给其他消费者，如果它又重启了，则又会把一些分区分配给它

##### **触发`Rebalance`机制：**

- 有新的消费者加入消费组
- 有消费者宕机下线，也可能并非真正的下线，如遇到网络延迟情况，长时间未和`GroupCoordinator`发送心跳，`GroupCoordinator`会认为消费者下线
- 有消费者主动退出消费组,比如调用`unsubscribe()`
- 消费组对应的`GroupCoordinator`节点发生变化
- 订阅的主题或主题的分区发生变化

**注意**：

- 如果消费者通过`assign` Api指定分区消费，则此消费者不会`Rebalance`
- `Rebalance`过程中，消费者无法从kafka消费消息，所以应当避免高峰期`Rebalance`发生

##### **Rebalance 策略：**

假设当前10个分区(0~9) , 消费组下3个 consumer

- **range**(默认): m = 分区数 % 消费者数 = 1；n = 分区数 / 消费者数 = 3，则前 m 个消费者 消费分区 n+1 个，剩余消费者消费分区n
  - 分区 0~3 分配给consumer1；4~6 分配给consumer2；7~9分配给consumer3
- **round-robin**：轮询分配方式
  - 0、3、6、9 分配给consumer1；1、4、7分配给consumer2；2、5、8分配给consumer3
- **sticky**：0.11.x版本增加，类似黏性的`range`
  - 原则：
    - 分配尽可能均匀    
    - 分配尽可能与上次分配保持相同
  - 如：分区 0~3 分配给consumer1；4~6 分配给consumer2；7~9分配给consumer3，当 consumer3 挂掉后
    - `rang`：0~4 分配给consumer1，5~9 分配给consumer2
    - `sticky`：0~3 、7 分配给 consumer1，4~6、8、9 分配给 consumer2（尽量保持和上次分配相同）

##### **Rebalance 过程**：

###### 组件：

**组协调器`GroupCoordinator`**：每个consumer group都会选择一个broker作为自己的组协调器coordinator，负责监控这个消费组里的所有消费者的心跳，以及判断是否宕机，然后开启消费者rebalance

**消费者协调器`ConsumerCoordinator`**：每个consumer都会构造自己的协调器，与`GroupCoordinator`进行交互，形成消费者和服务端之间的桥梁

> 消费者协调器主要负责如下工作：
>
> - 更新消费者缓存的MetaData
>
> - 查找组协调器
> - 向组协调器申请加入组
> - 请求离开消费组
>
> - 向组协调器提交偏移量
>
> - 通过心跳，保持组协调器的连接感知。
>
> - 被组协调器选为leader的消费者的协调器，负责消费者分区分配。分配结果发送给组协调器。
>
> - 非leader的消费者，通过消费者协调器和组协调器同步分配结果。

###### 过程

![image-20220127114954375](/kafka.assets/image-20220127114954375.png)

1. 找到`GroupCoordinator`

   - 向集群中的某个节点发送`FindCoordinatorRequest`

     - 非随机节点，是之前提到过的`leastLoadedNode`

   - 当前消费组`offset`所要提交至`_consumer_offset`topic的哪个分区，则此分区的 `leader`节点broker，就是当前消费组的`GroupCoordinator`
2. 加入消费组`JOIN Group` & 分区方案制定

   - 在成功找到消费组所对应的 `GroupCoordinator` 之后就进入加入消费组的阶段，在此阶段的消费者会向 `GroupCoordinator` 发送 `JoinGroupRequest` 请求，并处理响应。然后GroupCoordinator 从一个consumer group中选择第一个加入group的consumer作为`leader`，把consumer group情况发送给这个leader，接着这个leader会负责制定分区方案。
     - 如果消费组内的`leader`由于某些情况退出了消费组，则在消费组内的消费者列表中，随机选择一个作为`leader`
   - 做一些其他事情
     - 如果为自动提交，则在发送`JoinGroupRequest` 之前，需要同步提交`offset`
     - 如果配置了`ConsumerRebalanceListener`,需要调用`onPartitionsRevoked`
3. 同步分区数据`SYNC_GROUP`
   - consumer leader通过给`GroupCoordinator`发送 `SyncGroupRequest`，同时将分区方案，发送至 `GropCoordinator`
   - 非 leader consumer 也向` GroupCoordinator` 发送 `SyncGroupRequest`
   - `SyncGroupResponseHandler`响应中，返回 分区方案，并更新本地分区方案数据
   - 再根据指定分区的leader broker进行网络连接以及消息消费。
   - 如果配置了`ConsumerRebalanceListener`,需要调用`onPartitionsAssigned`

```java
// 客户端、服务端 交互关键类
org.apache.kafka.common.protocol.ApiKeys

// 消费者拉取过程
		// 循环 确保协调器准备好了 GroupCoordinator
    poll(org.apache.kafka.common.utils.Timer, boolean)
        // 更新topic、partition 信息
        updateAssignmentMetadataIfNeeded(timer, false);
            coordinator.poll(timer, waitForJoinGroup)
                // 查找组协调器，设置 AbstractCoordinator.this.coordinator value
                ensureCoordinatorReady(timer)
                    lookupCoordinator()
                        // 构造FindCoordinatorRequest,放到缓存中
                        unsent.put(node, clientRequest);
                    // 拉取 unset 中的数据，发送请求
                    client.poll(future, timer)
                // 判断是否需要 join group
                rejoinNeededOrPending()
                // 加入组
                ensureActiveGroup(waitForJoinGroup ? timer : time.timer(0L)
                    // 启动 心跳线程
                    startHeartbeatThreadIfNeeded()
                    // 加入消费组
                    joinGroupIfNeeded(timer)
                        // 分区变化前的方法调用
                        onJoinPrepare(generation.generationId, generation.memberId);
                        // 构造加入请求
                        initiateJoinGroup()
                        // 发送加入请求，并等待加入完成
                        client.poll(future, timer);
                            // 加入成功之后的回调
                            JoinGroupResponseHandler#handle
                                // 如果当前节点为 leader，进行分区 和 consumer 绑定划分
                                // 非leader节点，也发送 syncGroupRequest
                                onJoinLeader(joinResponse).chain(future)
                                    // 完成分区分配后，发送 SyncGroup,回调 SyncGroupResponseHandler
                                    client.send(coordinator, requestBuilder).compose(new SyncGroupResponseHandler())
                                    // 同步回调方法
                                    SyncGroupResponseHandler#handle
                                        // 将分区分配信息，赋值给 future 对象，此future 对象就是 joinGroup时，生成的
                                        future.complete(ByteBuffer.wrap(syncResponse.data.assignment()))

                        // 加入完成方法
                        onJoinComplete(
                            // 更新本地消费的topic分区信息
                            subscriptions.assignFromSubscribed(assignedPartitions);
                            // 调用分区变更后的方法
                            firstException.compareAndSet(
        // 更新本地 offset                    
        updateFetchPositions(timer)                        
				// 拉取数据
        pollForFetches(timer)
            // 请求真正的业务数据
            fetcher.sendFetches();
                // 按每个分区循环发送数据请求，因为分区不同，leader不同，请求的节点不同
                prepareFetchRequests();
            // 接收响应数据,
            client.poll(
            // 按最大数量，拉取缓存中的数据
            fetcher.fetchedRecords()
```

**旧版客户端存在问题**：

在zk中维护的节点信息：

- 消费组：`/consumers/<group>/ids`
- broker：`brokers/ids/<id>`
- Topic：`/brokers/topics/<topic>`
- partition：`/brokers/topics/<topic>/partitions/<partition>/state`
- ......

因为zk中很多节点信息发生变化时，都会触发再均衡操作，所以每个消费者都需要在每条相关路径注册`Watcher`,这种严重依赖zk集群的做法有两个严重的问题：

- **羊群效应**：指的是zk中一个被监听的节点发生变化，大量的`Watcher`通知被发送至客户端，导致其他操作将被延迟，也可能发生类似死锁的情况
- **脑裂问题**：消费者进行再均衡操作时每个消费者都与zk通信，以判断消费者或broker变化的情况，由于zk自身的特性，可能导致在同一时刻各个消 费者获取的状态不一致，这样会导致异常问题发生。

#### 多线程实现

- `producer` 是线程安全的，多个线程可以同时一个`producer`实例使用发送信息
- `consumer` 非线程安全
  - `acquireAndEnsureOpen();`判断如果有多个线程在操作，会抛出异常
- 多线程实现方式：
  - 每个线程，实例化一个 `KafkaConsumer`对象，就相当于启动了 多个`consumer`节点
  - 一个`KafkaConsumer`对象去`poll`消息，处理消息使用多线程
    - 这样方式下，因为多线程之间无序处理， `手动提交offset`会变得比较复杂，最好使用`自动提交offset`

#### 重要的消费者参数

- `fetch.min.bytes` 和  `fetch.max.wait.ms`：调用`poll()`方法，需要拉取到的最小数据量，`fetch.min.bytes(默认1B)`；当kafka返回给consumer的数据量小于此值，则会继续等待，直到数据量大于等于此配置，或超过 `fetch.max.wait.ms（默认500）`配置的时间；适当调大此参数可以提高一定的吞吐量，但是也会有一定延迟
- `enable.auto.commit`：是否自动提交，默认`是`
- `auto.commit.interval.ms`：自动提交时，时间间隔,默认`5000`
- `auto.offset.reset`: 
  - latest（默认）:只消费自己启动之后发送到主题的消息
  - earliest：第一次从头开始消费，以后按照消费offset记录继续消费，这个需要区别于consumer.seekToBeginning(每次都从头开始消费)
  - none：当前消费组没有消费位移记录时，抛出异常`NoOffsetForPartitionException`
- `heartbeat.interval.ms`: consumer  和 group coordinator 心跳的间隔时间，若发生了 rebalance，consumer 收到的响应中会包含REBALANCE_IN_PROGRESS.
  - 必须小于`session.timeout.ms`
  - 默认`3000`
- `session.timeout.ms`: 多长时间未感知到心跳，则认为`consumer`挂掉了，会将其踢出消费组
  - 0.10.1 版本之前是 `30000`
  - 0.10.1 版本之后是 `10000`
- `max.poll.interval.ms`：0.10.1版本后才有，在这之前`发送心跳包`和`消息处理逻辑`这2个过程是耦合在一起的，试想：如果一条消息处理时长要5min，而session.timeout.ms=3000ms，那么等 kafka consumer处理完消息，因为只有一个线程，在消息处理过程中就无法向group coordinator发送心跳包，超过3000ms未发送心跳包，group coordinator就将该consumer移出group了；而将二者分开，一个线程负责执行消息处理逻辑，一个线程负责发送心跳包，那么：就算一条消息需要处理5min，只要heartbeat线程在session.timeout.ms 向 group coordinator发送了心跳包，那consumer可以继续处理消息，而不用担心被移出group了，所以 0.10.1 版本后，`session.timeout.ms` 默认值发生变化
- `max.poll.records`：每次`poll`最大拉取条数，默认 `500`

#### 问题

- 内部topic默认几个副本
  - 跟随 server端配置的默认副本数 `default.replication.factor`,默认为 1

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

## 实践

### 磁盘迁移

> 背景介绍：Kafka搭建时，配置的磁盘过大，成本过高，所以需要迁移到小容量磁盘
>
> **原kakfa配置：**
>
> - log.dirs=/data1/kafka/var/kafka-logs/1,/data2/kafka/var/kafka-logs/1 `(kafka磁盘可以支持多磁盘配置，提高吞吐量)`
> - log.retention.hours=168
>
> **修改后的kafka配置：**
>
> - log.dirs=/data3/kafka-logs,/data4/kafka-logs
> - log.retention.hours=72

#### 1.修改topic存储时间

> 适量减少topic存储时间，可以加快迁移节奏，如果本身日志量不大，不超过100G，则没必要执行此步骤
>
> 并且可以预估出调整后的磁盘占用大小

```shell
# retention.ms=21600000 表示此设置topic 数据保存的时间，单位：毫秒，21600000 = 1000*60*60*6 = 6 小时
# 线上可以提前写好 sh脚本，批量处理topic
sh /home/hadoop/kafka_2.11-0.9.0.1/bin/kafka-configs.sh  --zookeeper {zk配置地址} --alter --add-config 'retention.ms=21600000' --entity-type topics --entity-name {topic_name}
```

> 观察`kafkaServer.out`日志，正常`broker`每5分钟触发一次删除任务，等看到日志中出现 `...delete...`日志，并且观察磁盘文件大小，已经变成预估空间大小，则说明已经删除完成

#### 2.停止kafka服务

```shell
./bin/kafka-server-stop.sh stop
```

观察日志，出现 `shutdown complete`字样的日志时，并且使用 `jps -m` 命令，找不到kafka的进程之后，表示停止完成

#### 3.执行数据拷贝

```shell
mkdir -p /data3/kafka-logs
mkdir -p /data4/kafka-logs
mkdir -p /home/hadoop/kafka_2.11-0.9.0.1/logs

# 注意使用异步拷贝，防止当前shell窗口过期
nohup cp -r /data1/kafka/var/kafka-logs/1/* /data3/kafka-logs/ &
nohup cp -r /data2/kafka/var/kafka-logs/1/* /data4/kafka-logs/ &
# 后续可以使用此命令，查看是否拷贝完成
ps -ef | grep kafka-logs
df -h
```

当观察到 新旧磁盘空间大小一致，且 `ps -ef | grep kafka-logs` 没有进程之后，说明拷贝完成

```shell
# 拷贝完成后，修改原目录名称
mv /data1/kafka /data1/kafka_bak
mv /data2/kafka /data2/kafka_bak
```

#### 4.修改配置

```shell
# 修改kafka 配置文件
vim /home/hadoop/kafka_2.11-0.9.0.1/config/server.properties

# 找到下面配置，并更改
log.dirs=/data3/kafka-logs,/data4/kafka-logs
log.retention.hours=72

# 修改gc日志配置，默认的会一直打印gc日志
vim /home/hadoop/kafka_2.11-0.9.0.1/bin/kafka-run-class.sh
# 找到下面配置，并更改
KAFKA_GC_LOG_OPTS=" "
```

#### 5.启动kafka服务

```shell
./bin/kafka-server-start.sh -daemon config/server.properties

# 观察日志：查看到启动完成，并且 集群中没有未同步副本时，说明此kafka已经完全启动
tail -f ./logs/kafkaServer.out

# 观察旧的磁盘目录下，没有新文件产生，说明迁移成功
ls -lrth /data1
ls -lrth /data2
```

#### 6.恢复topic存储时间

> 千万不要忘了这一步。。。

```shell
sh ./bin/kafka-configs.sh  --zookeeper {zk配置地址} --alter --delete-config 'retention.ms' --entity-type topics --entity-name {topic_name}
```

#### 备注:

- 为什么要拷贝磁盘文件，而不是直接修改配置，重启kafka？
  - 如果新的broker启动，加入集群，需要同步topic的数据；同步过程中，会占满带宽或磁盘IO，如果数据量过大，同步时间过长，会造成kakfa长时间不可用，线上数据淤积，影响业务
  - kakfa会在数据磁盘下生成：`recovery-point-offset-checkpoint`，`replication-offset-checkpoint`这俩文件，会记录当前磁盘下topic数据存储offset信息，拷贝过去之后会根据这俩文件同步数据，不会造成数据错乱问题
  - 所以拷贝磁盘数据在数据量较大时，会是较优的方案

