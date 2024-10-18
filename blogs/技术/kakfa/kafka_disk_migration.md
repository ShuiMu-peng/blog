---
title: 'Kafka-磁盘迁移'
date: 2021-06-03
author: "shuiMu"
categories: 
  - 技术
tags:
  - kafka
---


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

