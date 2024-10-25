---
title: 'RabbitMq'
date: 2021-05-11
author: "shuiMu"
categories:
  - 技术
tags:
  - mq
  - RabbitMq
---
## RabbitMQ VS kafka VS RocketMQ

| RabbitMQ   | Kafka                                                        | RocketMQ                                                     |                                                              |
| :--------- | :----------------------------------------------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| 协议       | AMQP https://www.rabbitmq.com/tutorials/amqp-concepts.html   | 一套自行设计的基于 TCP 的二进制协议                          | 自己定义的一 套(社区提供 JMS)https://www.jianshu.com/p/d2e3fd77c4f4 |
| 消息可靠性 | 通过配置不丢数据                                             | 通过配置不丢数据                                             | 通过配置不丢数据                                             |
| 延迟       | 微秒                                                         | 毫秒                                                         | 毫秒                                                         |
| 吞吐量     | 万级 QPS                                                     | 百万级 QPS                                                   | 十万级 QPS                                                   |
| 可用性     | 高，但不支持 动态扩容                                        | 非常高                                                       | 非常高                                                       |
| 消费模型   | pull/push                                                    | pull                                                         | pull/push                                                    |
| 语言       | erlang                                                       | scala                                                        | java                                                         |
| 适用用场景 | 数据量不是很大，对消息的实时性、要求很高                     | 日志采集、适合产生大量数据的互联网服务的数据收集业务等场景   | 几乎全场景                                                   |
| 缺点       | 1、集群 不支持动态扩展 2、消息吞吐能力有限  3、消息堆积时，性能会明显 降低。 4、erlang语言开发，出现问题只能依赖社区，不利于二次开发维护 | 1、Kafka单机超过64个队列/分区，Load会发生明显的飙高现象，队列越多，load越高，发送消息响应时间变长 2、仅支持的简单的消费模式 | 1、使用者较少，生态不够 完善 2、消息堆积与吞吐量 上与 kafka 还是有差距。 3、客户端支持 java及c++，c++不成熟 |

## AMQP协议

> （Advanced Message Queuing Protocol，高级消息队列协议）

### **工作过程**：

消息（message）被发布者（publisher）发送给交换机（exchange），交换机常常被比喻成邮局或者邮箱。然后交换机将收到的消息根据路由规则分发给绑定的队列（queue）。最后AMQP代理会将消息投递给订阅了此队列的消费者，或者消费者按照需求自行获取

![image-20241025155910047](/rabbitMQ.assets/image-20241025155910047.png)

### 组件介绍

- **Publisher**：消息发布者
- **Exchanage**：交换机，消息代理服务器，通过一定的路由规则，将消息发送至队列中,存储有不同RoutingKey到queue的规则
    - **默认交换机**（default exchange）：举个栗子：当你声明了一个名为search-indexing-online的队列，AMQP代理会自动将其绑定到默认交换机上，绑定（binding）的路由键名称也是为search-indexing-online。因此，当携带着名为search-indexing-online的路由键的消息被发送到默认交换机的时候，此消息会被默认交换机路由至名为search-indexing-online的队列中，
        - Publisher 发送消息时，指定 queue
    - **直连交换机**（direct exchange）：Exchange和queue之间通过RoutingKey来建立binding关系，发送消息时，指定RoutingKey发送到Exchange，Exchange通过RoutingKey转发到相应的queue；
        - 直连交换机经常用来循环分发任务给多个工作者，这样做：消息的负载均衡是发生在消费者之间，并非队列之间
        - Publisher 发送消息时，指定 Exchange、RoutingKey
    - **扇形交换机**（funout exchange）：发布订阅模式，Exchange 和 queue之间直接 binding
        - Publisher 发送消息时，定Exchange，不用指定RoutingKey,Exchange 会将消息转发给所有绑定的queue
    - **主题交换机**（topic exchange）：类似于直连交换机，RoutingKey支持规则匹配
        - Publisher 发送消息时，指定 Exchange、RoutingKey
    - **头交换机**（headers exchange）：类似于直连交换机，不同点是direct exchange是通过 RoutingKey绑定关系，headers exchange 可以通过多个属性来绑定关系
        - Publisher 发送消息时，指定 Exchange、Map(多个属性)
- **Queue**：存储消息
- **Binding**：是exchange将消息路由给queue所遵循的规则，可结合exchange的几种类型，Binding信息被保存到Exchange中的查询表中，用于message的分发依据
- **Consumer**：消息消费者
    - 消息确认机制
        - 自动确认：消费端收到消息，就会自动确认
        - 手动确认：显式提交确认
- **Virtual host**：多租户概念，类似mysql中的数据库，之间相互隔离
- **Connection**：publisher／consumer 和 broker 之间的 TCP 连接
- **Channel**： 如果每一次访问 RabbitMQ 都建立一个 Connection，在消息量大的时候建立 TCP Connection的开销将是巨大的，效率也较低。Channel 是在 connection 内部建立的逻辑连接，如果应用程序支持多线程，通常每个thread创建单独的 channel 进行通讯，AMQP method 包含了channel id 帮助客户端和message broker 识别 channel，所以 channel 之间是完全隔离的。Channel 作为轻量级的 Connection 极大减少了操作系统建立 TCP connection 的开销

## 基础架构

![image-20241025160053800](/rabbitMQ.assets/image-20241025160053800.png)
### 常用模式

> 官网地址: https://www.rabbitmq.com/getstarted.html
>
> 主要介绍下面五种

#### Simple

>![image-20241025160444633](/rabbitMQ.assets/image-20241025160444633.png)
>
>不用配置`Exchange`，会有默认的`Exchange`，生产者定向发送至队列，消费者从队列中消费

#### Work queues

> ![image-20241025160456926](/rabbitMQ.assets/image-20241025160456926.png)
>
> 工作队列模式
>
> 类似`Simple`模式，多消费者 消费。
>
> 注意: 消息仅能被一个消费者消费,消息的负载均衡是发生在消费者之间，并非队列之间
>
> 不同与 kafka 中，partition 被多个消费者消费时，每个消费者有着自己的offset，也就是说每条消息可以被多个消费者所消费

#### Publish/Subscribe

> ![image-20241025160509795](/rabbitMQ.assets/image-20241025160509795.png)
>
> 广播模式
>
> `Exchange`配置为`fanout`，`Exchange` 绑定队列，生产者发送消息时，指定`Exchange`，消息将会发送到该交换机绑定的所有队列中，被监听队列的消费者消费

#### Routing

> ![image-20241025160524082](/rabbitMQ.assets/image-20241025160524082.png)
>
> 路由模式
>
> `Exchange`配置为`direct`
>
> `Exchange`和`queue`之间通过`RoutingKey`来建立关系，发送消息时，指定`RoutingKey`发送到`Exchange`，`Exchange`通过`RoutingKey`转发到相应的`queue`，
>
> 注意：`RoutingKey`精确匹配

#### Topics

> ![image-20241025160544256](/rabbitMQ.assets/image-20241025160544256.png)
>
> 主题模式
>
> `Exchange`配置为`topic`，过程类似`RoutingKey`，不同的是 支持 `RoutingKey`的模糊匹配
> `#`多个字符；`*`单个字符



## 高级特性

### 生产者：

> 整个消息投递的路径：
>
> `producer`  > `exchange`  > `queue` > `consumer`
>
> -  confirm
     >
     >    - 消息到达`exchange`时，进行回调
>
> -  return
     >
     >    - 消息从`exchange` > `queue`投递`失败`时，回调
>
> 利用这两个回调机制，当消息发送失败时，做一些补偿策略，重试，或者记录下来，人为控制

### 消费者：

> 默认模式为自动签收，表示一旦被consumer接收到，则自动签收，但实际中，可能会出现业务代码执行异常的情况，导致消息没有被真正消费掉(消息丢失)。
>
> - 手动签收
    >   - 通过业务代码的执行状态，进行签收或者拒绝签收控制，拒绝签收后，mq会再次发送消息，也应该设置重试次数，超过阈值后，记录到数据库中，人工调控，防止无限重试

### 消费端限流

> 举个栗子：服务器A、B各启动了一个消费者，500个消息，默认每个消费者会拉取250条缓存到本地，去消费处理，如果A机器效率很高，就会发生A很快处理完成，闲置状态，B一直做工的状态；如果配置`prefetch`各为5，则每个消费者会预取5条消息，缓存到本地，每处理完成签收一条消息，就会再接收服务端的一条新消息，始终保持本地缓存5条消息的状态，最终达到的效果就是 效率高的机器，处理消息多，充分利用所有机器的性能。
>
> 原理：消费者客户端，本地会有个缓存队列 ，用来存储从服务端拉取的消息，大小就是`prefetch`，如果没有设置，默认为`250`,可查看类`BlockingQueueConsumer`。
>
> 配置注意点：
>
> - 消费端的确认模式一定为手动确认
>
> - `prefetch`表示每个消费者端拉取(缓存)的消息数量，循环串行化处理，并非并行处理
> - `concurrency`当前客户端启动的消费者数量。举例：设置为2，表示两个消息并行处理

### TTL

> - TTL 全称 Time To Live（存活时间/过期时间）
> - 当消息到达存活时间后，还没有被消费，会被自动清除
> - RabbitMQ可以对消息设置过期时间，也可以对整个队列（Queue）设置过期时间
    >   - 如果队列和消息都设置了过期时间，以时间短的为准

### 死信队列

>死信队列，英文缩写：DLX  。Dead Letter Exchange（死信交换机），当消息成为Dead message后，可以被重新发送到另一个交换机，这个交换机就是DLX
>
>![image-20241025160718447](/rabbitMQ.assets/image-20241025160718447.png)
>
>**成为死信队列的条件：**
>
>- 队列消息长度到达限制
>- 消费者拒接消费消息，basicNack/basicReject,并且不把消息重新放入原目标队列,requeue=false
>- 原队列存在消息过期设置，消息到达超时时间未被消费

### 延时队列

> 延迟队列，即消息进入队列后不会立即被消费，只有到达指定时间后，才会被消费
>
> 需求：下单后，三十分钟未支付，取消订单，库存回滚
>
> ttl + 死信队列，达到延时队列的效果，如上图所示。

### 幂等性保证

> 消息保证不丢失，但无法保证重复性消费，所以消费端需要增加幂等性处理
>
> 处理方式很多：业务代码是否消费判断、redis缓存判断、mysql乐观锁等

### 消息积压

> 产生原因：
>
> - 消费者宕机积压
> - 消费者消费能力不足积压
>
> 解决方案:
>
> - 上线更多的消费者
> - 将消息先批量取出来,记录数据库或其他地方,再慢慢处理

## 集群模式

> 官网地址：https://www.rabbitmq.com/clustering.html

### 默认集群模式

> RabbitMQ集群仅会同步四种类型的内部元数据：
>
> - 队列元数据：队列名称和它的属性
> - 交换器元数据：交换器名称、类型和属性
> - 绑定元数据：一张简单的表格展示了如何将消息路由到队列
> - vhost元数据：为vhost内的队列、交换器和绑定提供命名空间和安全属性
>
> 无法实现高可用，单节点宕机后，此节点的数据就无法被访问到

### 镜像集群模式

> 这种模式，生产级别的高可用模式
>
> 每个节点上都有`queue`的完整镜像，包含有全部数据

可以通过两种方式配置：

- 管理界面
  ![image-20241025160829682](/rabbitMQ.assets/image-20241025160829682.png)

- 命令行

  ```shell
   #格式：rabbitmqctl set_policy [-p Vhost] Name Pattern Definition [Priority]
   #第1种
   rabbitmqctl set_policy policy3 "^" '{"ha-mode":"all"}'
   #第2种
   rabbitmqctl set_policy policy2 "^" '{"ha-mode":"all","ha-sync-mode":"automatic"}'
   #第3种
   rabbitmqctl set_policy -p "/" policy3 "^QUEUE" '{"ha-mode":"nodes","ha-params":["rabbit@mq-002","rabbit@mq-003"],"ha-sync-mode":"automatic"}'
  ```

- **参数说明：**

  ```shell
  Virtual host:
  Pattern:正则匹配队列 如:^NAME_ 表示 以NAME开头;^ 表示所有
  ha-mode:指明镜像队列的模式，有效值为 all/exactly/nodes
    #all:表示在集群中所有的节点上进行镜像
    #exactly:表示在指定个数的节点上进行镜像，节点的个数由ha-params指定
    #nodes:表示在指定的节点上进行镜像，节点名称通过ha-params指定
  ha-params:ha-mode模式需要用到的参数
  ha-sync-mode:进行队列中消息的同步方式，有效值为 automatic 和 manual
  priority:可选参数，policy的优先级，请注意一个事实，镜像配置的pattern 采用的是正则表达式匹配，也就是说会匹配一组。如果配置了多个，则匹配的顺序
  ```

  

  