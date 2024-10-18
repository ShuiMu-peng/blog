---
title: 'Kafka-Producer'
date: 2021-06-02
author: "shuiMu"
categories: 
  - 技术
tags:
  - kafka
---

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
  