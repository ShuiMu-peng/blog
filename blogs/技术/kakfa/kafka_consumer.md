---
title: 'Kafka-Consumer'
date: 2021-06-02
author: "shuiMu"
categories: 
  - 技术
tags:
  - kafka
---

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
