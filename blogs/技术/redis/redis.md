---
title: 'Redis'
date: 2021-07-01
author: "shuiMu"
categories: 
  - 技术
tags:
  - Redis
---
## Redis 为什么这么快？

> reactor 模式：反应器模式

- 

## 扩展数据结构

#### HyperLogLog

> 计算uv值，但并不准确

### rax树

> trie树

## 哨兵

### 主从同步原理

![image-20220109204259035](/redis.assets/image-20220109204259035.png)

### 从节点挂掉后重新启动

![image-20220109215341652](/redis.assets/image-20220109215341652.png)

## 集群机构

![image-20220109224555616](/redis.assets/image-20220109224555616.png)



## 扫描没有ttl的数据

```shell
db_ip=172.30.5.172
db_port=6381
cursor=0
cnt=100
new_cursor=0
export PATH=/home/hadoop/redis_6381/bin/:$PATH

redis-cli -h $db_ip -p $db_port scan $cursor count $cnt > scan_tmp_result
new_cursor=`sed -n '1p' scan_tmp_result`
sed -n '2,$p' scan_tmp_result > scan_result
cat scan_result |while read line
do
    ttl_result=`redis-cli -h $db_ip -p $db_port ttl $line`
    if [[ $ttl_result == -1 ]];then
        echo $line >> no_ttl.log
    fi
done

while [ $cursor -ne $new_cursor ]
do
    redis-cli -h $db_ip -p $db_port scan $new_cursor count $cnt > scan_tmp_result
    new_cursor=`sed -n '1p' scan_tmp_result`
    sed -n '2,$p' scan_tmp_result > scan_result
    cat scan_result |while read line
    do
        ttl_result=`redis-cli -h $db_ip -p $db_port ttl $line`
        if [[ $ttl_result == -1 ]];then
            echo $line >> no_ttl.log
        fi
    done
done
rm -rf scan_tmp_result
rm -rf scan_result
```

## 删除redis-key

```shell
db_ip=172.30.5.172
db_port=6381

export PATH=/home/hadoop/redis_6381/bin/:$PATH

cat no_ttl_6381.log | while read line
do  
    echo "delete key:"$line
    redis-cli -h $db_ip -p $db_port del $line
done
```