---
title: 'zookeeper'
date: 2022-06-21
author: "shuiMu"
categories:
  - 技术
tags:
  - zookeeper
---

## Zookeeper

> 官网地址：https://zookeeper.apache.org/
>
>
ZooKeeper本质上是一个分布式的小文件存储系统（Zookeeper=文件系统+监听机制）。提供基于类似于文件系统的目录树方式的数据存储，并且可以对树中的节点进行有效管理，从而用来维护和监控存储的数据的状态变化。通过监控这些数据状态的变化，从而可以达到基于数据的集群管理、统一命名服务、分布式配置管理、分布式消息队列、分布式锁、分布式协调等功能。
>
> Zookeeper从设计模式角度来理解：是一个基于观察者模式设计的分布式服务管理框架，它负责存储和管理大家都关心的数据，然后接受观察者的注册，一旦这些数据的状态发生变化，Zookeeper
> 就将负责通知已经在Zookeeper上注册的那些观察者做出相应的反应。

### 维护部署：

#### 配置文件

> zoo.cfg

```properties
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between
syncLimit=5
# 数据存储地址，同时还会存储 Myid文件
dataDir=/Users/lipeng/tool/zk/apache-zookeeper-3.6.3-bin/data
# the port at which the clients will connect
clientPort=2181
# the maximum number of client connections.
# 最大客户端连接数，-1 表示无限制
maxClientCnxns=60
# 集群配置，server.{id}={ip}:{port1}:{port2}
# {id} 需要跟myid文件中的值相同；{ip} 节点的 ip地址，{port1} 数据交互 {port2} 选举投票端口
server.1=192.168.1.2:2888:3888
server.2=192.168.1.2:2889:3889
server.3=192.168.1.2:2890:3890
```

#### 服务启停

```shell
# 启动服务端
./bin/zkServer.sh start
# 查看机器状态
./bin/zkServer.sh status
# 停止服务
./bin/zkServer.sh stop
```

#### 客户端命令

> https://zookeeper.apache.org/doc/r3.8.0/zookeeperCLI.html，支持的客户端操作

```shell
# 查看支持的命令
help
# 使用 ls 命令来查看当前 znode 的子节点，可监听
# -s 状态（时间戳、版本号、数据大小等)
# -w 监听子节点变化
# -R: 表示递归的获取
ls [-s] [-w] [-R] path

# 创建节点
# -s : 创建有序节点。
# -e : 创建临时节点。
# -c : 创建一个容器节点。
# t ttl] : 创建一个TTL节点， -t 时间（单位毫秒）。
# data：节点的数据，可选，如果不使用时，节点数据就为null。
# acl：访问控制
create [-s] [-e] [-c] [-t ttl] path [data] [acl]

# 获取节点数据信息
# -s: 节点状态信息（时间戳、版本号、数据大小等）
# -w: 监听节点变化
get [-s] [-w] path

# 设置节点数据
# -s:表示节点为顺序节点
# -v: 指定版本号
set [-s] [-v version] path data

# 获取节点的访问控制信息
# -s 状态（时间戳、版本号、数据大小等)
getAcl [-s] path

# 设置节点的访问控制列表
# -s:节点状态信息（时间戳、版本号、数据大小等）
# -v:指定版本号
# -R:递归的设置
setAcl [-s] [-v version] [-R] path acl

# 查看节点状态信息
stat [-w] path

# 删除某一节点，只能删除无子节点的节点。
delete [-v version] path

#递归的删除某一节点及其子节点
deleteall path

# 对节点增加限制
# n:表示子节点的最大个数
# b:数据值的最大长度，-1表示无限制
setquota -n|-b val path
```

### 数据结构

> ZooKeeper 数据模型的结构与 Unix 文件系统很类似，整体上可以看作是一棵树，每个节点称做一个 ZNode。

​    ![0](https://note.youdao.com/yws/public/resource/f0549278905bb988c831d6910c54143a/xmlnote/42FE45D9612741FE9120F6054B97AA6D/45253)

ZooKeeper的数据模型是层次模型，层次模型常见于文件系统。层次模型和key-value模型是两种主流的数据模型。ZooKeeper使用文件系统模型主要基于以下两点考虑:

1. 文件系统的树形结构便于表达数据之间的层次关系
2. 文件系统的树形结构便于为不同的应用分配独立的命名空间( namespace )

ZooKeeper的层次模型称作Data Tree，Data Tree的每个节点叫作Znode。不同于文件系统，每个节点都可以保存数据，每一个 ZNode 默认能够存储
1MB 的数据，每个 ZNode 都可以通过其路径唯一标识，每个节点都有一个版本(version)，版本从0开始计数。

```java
public class DataTree {
    private final ConcurrentHashMap<String, DataNode> nodes =
            new ConcurrentHashMap<String, DataNode>();


    private final WatchManager dataWatches = new WatchManager();
    private final WatchManager childWatches = new WatchManager();

}

public class DataNode implements Record {
    byte data[];
    Long acl;
    public StatPersisted stat;
    private Set<String> children = null;
} 
```

#### **节点分类**

**一个znode可以使持久性的，也可以是临时性的:**

1. 持久节点(PERSISTENT): 这样的znode在创建之后即使发生ZooKeeper集群宕机或者client宕机也不会丢失。
2. 临时节点(EPHEMERAL ): client宕机或者client在指定的timeout时间内没有给ZooKeeper集群发消息，这样的znode就会消失。

**如果上面两种znode具备顺序性，又有以下两种znode :**

3. 持久顺序节点(PERSISTENT_SEQUENTIAL): znode除了具备持久性znode的特点之外，znode的名字具备顺序性。
4. 临时顺序节点(EPHEMERAL_SEQUENTIAL): znode除了具备临时性znode的特点之外，zorde的名字具备顺序性。

zookeeper主要用到的是以上4种节点。

5. Container节点 (3.5.3版本新增)：Container容器节点，当容器中没有任何子节点，该容器节点会被zk定期删除（定时任务默认60s
   检查一次)。 和持久节点的区别是 ZK 服务端启动后，会有一个单独的线程去扫描，所有的容器节点，当发现容器节点的子节点数量为 0
   时，会自动删除该节点。可以用于 leader 或者锁的场景中。

6. TTL节点:  带过期时间节点，默认禁用，需要在zoo.cfg中添加 extendedTypesEnabled=true 开启。 注意：ttl不能用于临时节点

```shell
#创建持久节点
create /servers  xxx
#创建临时节点
create -e /servers/host  xxx
#创建临时有序节点
create -e -s /servers/host  xxx
#创建容器节点
create -c /container xxx
# 创建ttl节点
create -t 10 /ttl
```

**节点状态信息**

![image-20230522215952151](Zookeeper.assets/image-20230522215952151.png)

- cZxid：节点创建的事务id
- ctime：节点创建的时间戳
- mZxid：节点修改的事务id，每次对zNode的修改，都会更新mZxid
    - 对于zk来说，每次的变化都会产生一个唯一的事务id，zxid（ZooKeeper Transaction
      Id），通过zxid，可以确定更新操作的先后顺序。例如，如果zxid1小于zxid2，说明zxid1操作先于zxid2发生，zxid对于整个zk都是唯一的，即使操作的是不同的znode。
- mtime：节点修改的事件戳
-
pZxid：表示该节点的子节点列表最后一次修改的事务ID，添加子节点或删除子节点就会影响子节点列表，但是修改子节点的数据内容则不影响该ID（注意:
只有子节点列表变更了才会变更pzxid，子节点内容变更不会影响pzxid）
- cversion：子节点的版本号。当znode的子节点有变化时，cversion 的值就会增加1
- dataVersion：数据版本号，每次对节点进行set操作，dataVersion的值都会增加1（即使设置的是相同的数据），可有效避免了数据更新时出现的先后顺序问题。
- ephemeralOwner：如果为临时节点，值为与临时节点绑定的session id，否则为0
- dataLength：数据长度
- numChildren：子节点个数，仅通知直接子节点个数

#### **监听通知（watcher）机制**

- 一个Watch事件是一个一次性的触发器，当被设置了Watch的数据发生了改变的时候，则服务器将这个改变发送给设置了Watch的客户端，以便通知它们。
- Zookeeper采用了 Watcher机制实现数据的发布订阅功能，多个订阅者可同时监听某一特定主题对象，当该主题对象的自身状态发生变化时例如节点内容改变、节点下的子节点列表改变等，会实时、主动通知所有订阅者。
- watcher机制事件上与观察者模式类似，也可看作是一种观察者模式在分布式场景下的实现方式。
- Zookeeper中的watch机制，必须客户端先去服务端注册监听，这样事件发送才会触发监听，通知给客户端。

##### watcher的过程：

1. 客户端向服务端注册watcher
2. 服务端发生事件，触发watcher
3. 客户端回调watcher得到触发事件情况

##### 支持的事件类型：

- None: 连接建立事件
- NodeCreated： 节点创建
- NodeDeleted： 节点删除
- NodeDataChanged：节点数据变化
- NodeChildrenChanged：子节点列表变化
- DataWatchRemoved：节点监听被移除
- ChildWatchRemoved：子节点监听被移除

##### 特性：

- 一次性触发：watcher是一次性的，一旦被触发就会移除，再次使用时需要重新注册
- 客户端顺序回调：watcher回调是顺序串行执行的，只有回调后客户端才能看到最新的数据状态。一个watcher回调逻辑不应该太多，以免影响别的watcher执行
- 轻量级：WatchEvent是最小的通信单位，结构上只包含通知状态、事件类型和节点路径，并不会告诉数据节点变化前后的具体内容
- 时效性：watcher只有在当前session彻底失效时才会无效，若在session有效期内快速重连成功，则watcher依然存在，仍可接收到通知；

```shell
#监听节点数据的变化
get -w path 
stat -w path
#监听子节点增减的变化 
ls -w path 
```

ZAB协议：

- 原子广播协议
- 崩溃恢复协议