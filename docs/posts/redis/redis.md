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

## Redisson

### demo

```java
Config config = new Config();
config.useSingleServer().setAddress("redis://10.8.0.78:6369");
// 拿到客户端
RedissonClient redisson = Redisson.create();

// 普通互斥锁
RLock lock = redisson.getLock("abc");
try {
    // 加锁
    lock.lock();
    ThreadUtil.sleep(1, TimeUnit.SECONDS);
    System.out.println("abc");
} finally {
    // 释放锁
    lock.unlock();
}

// 读写锁，读写互斥，写写互斥，读读可同时进行
RReadWriteLock readWriteLock = redisson.getReadWriteLock("readWrite");
RLock rLock = readWriteLock.readLock();
rLock.lock();
// ....
```

### java信号量机制

```java
// 创建共有n个许可的信号量器
Semaphore semaphore = new Semaphore(2);
for (int i = 0; i < 10; i++) {
    int finalI = i;
    Thread thread = new Thread(() -> {
        try {
            // 获取1个许可
            semaphore.acquire();
            System.out.println("start thread id " + finalI);
            ThreadUtil.sleep(2, TimeUnit.SECONDS);
            // 执行完成后，释放许可
            semaphore.release();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    });
    thread.start();
}
```



### 源码分析

#### 加锁逻辑

```java
// lua脚本，因为需要记录 key、threadid:uuid、重入锁次数，所以采用了 hash(map) 结构
// 不存在 key时，存储 并设置过期时间为 30s，存在时，判断是否为当前线程设置的key，是的话判定为自增，自增标识 +1，并重新设置过期时间为30s
// 否则 返回 当前key的ttl
<T> RFuture<T> tryLockInnerAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, command,
            "if (redis.call('exists', KEYS[1]) == 0) then " +
                    "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return nil; " +
                    "end; " +
                    "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                    "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return nil; " +
                    "end; " +
                    "return redis.call('pttl', KEYS[1]);",
            Collections.singletonList(getRawName()), unit.toMillis(leaseTime), getLockName(threadId));
}
```

#### 续命

```java
// org.redisson.RedissonBaseLock#scheduleExpirationRenewal
// org.redisson.RedissonBaseLock#renewExpiration
// 异步线程每10s执行一次，续命30s
private void renewExpiration() {
    ExpirationEntry ee = EXPIRATION_RENEWAL_MAP.get(getEntryName());
    if (ee == null) {
        return;
    }
    // 定时任务，10s后执行
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
        @Override
        public void run(Timeout timeout) throws Exception {
            ExpirationEntry ent = EXPIRATION_RENEWAL_MAP.get(getEntryName());
            if (ent == null) {
                return;
            }
            Long threadId = ent.getFirstThreadId();
            if (threadId == null) {
                return;
            }
            // 看下面方法
            RFuture<Boolean> future = renewExpirationAsync(threadId);
            future.onComplete((res, e) -> {
                if (e != null) {
                    log.error("Can't update lock " + getRawName() + " expiration", e);
                    EXPIRATION_RENEWAL_MAP.remove(getEntryName());
                    return;
                }

                if (res) {
                    // 加锁成功后，递归调用此方法，也就是10s后，再次续命
                    // reschedule itself
                    renewExpiration();
                } else {
                    cancelExpirationRenewal(null);
                }
            });
        }
    }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);

    ee.setTimeout(task);
}

// 判断key依然存在，且为当前线程id加锁，则重新设置超时时间为 30s
protected RFuture<Boolean> renewExpirationAsync(long threadId) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return 1; " +
                    "end; " +
                    "return 0;",
            Collections.singletonList(getRawName()),
            internalLockLeaseTime, getLockName(threadId));
}
```

#### 未获取到锁

> 两件事
>
> - 利用Redis发布订阅机制，监听 `redisson_lock__channel_{key}`队列，当收到`UNLOCK_MESSAGE` 消息时，利用java中信号量机制调用`value.getLatch().release();`唤醒阻塞等待的线程
>   ```java
>   // org.redisson.RedissonLock#lock(long, java.util.concurrent.TimeUnit, boolean)
>   // RFuture<RedissonLockEntry> future = subscribe(threadId);
>   // return pubSub.subscribe(getEntryName(), getChannelName());
>   // RedisPubSubListener<Object> listener = createListener(channelName, value);
>   private RedisPubSubListener<Object> createListener(String channelName, E value) {
>       RedisPubSubListener<Object> listener = new BaseRedisPubSubListener() {
>   
>           @Override
>           public void onMessage(CharSequence channel, Object message) {
>               if (!channelName.equals(channel.toString())) {
>                   return;
>               }
>   
>               PublishSubscribe.this.onMessage(value, (Long) message);
>           }
>   
>           @Override
>           public boolean onStatus(PubSubType type, CharSequence channel) {
>               if (!channelName.equals(channel.toString())) {
>                   return false;
>               }
>   
>               if (type == PubSubType.SUBSCRIBE) {
>                   value.getPromise().trySuccess(value);
>                   return true;
>               }
>               return false;
>           }
>   
>       };
>       return listener;
>   }
>   
>   // redis 发布订阅机制中的消费者
>   protected void onMessage(RedissonLockEntry value, Long message) {
>       if (message.equals(UNLOCK_MESSAGE)) {
>           Runnable runnableToExecute = value.getListeners().poll();
>           if (runnableToExecute != null) {
>               runnableToExecute.run();
>           }
>   				// 唤醒等待的线程
>           value.getLatch().release();
>       } else if (message.equals(READ_UNLOCK_MESSAGE)) {
>           while (true) {
>               Runnable runnableToExecute = value.getListeners().poll();
>               if (runnableToExecute == null) {
>                   break;
>               }
>               runnableToExecute.run();
>           }
>   
>           value.getLatch().release(value.getLatch().getQueueLength());
>       }
>   }
>   ```
>
> - 死循环，利用 java 中信号量机制，等待 key 的`ttl`到期后，重新尝试获取锁，直到获取成功
>   ```java
>   try {
>       while (true) {
>           // 尝试获取一次锁，ttl 为 null，表示获取成功
>           ttl = tryAcquire(-1, leaseTime, unit, threadId);
>           // lock acquired
>           if (ttl == null) {
>               break;
>           }
>   
>           // waiting for message
>           if (ttl >= 0) {
>               try {
>                   // 信号量机制，阻塞等待 ttl 时长
>                   future.getNow().getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
>               } catch (InterruptedException e) {
>                   if (interruptibly) {
>                       throw e;
>                   }
>                   future.getNow().getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
>               }
>           } else {
>               if (interruptibly) {
>                   future.getNow().getLatch().acquire();
>               } else {
>                   future.getNow().getLatch().acquireUninterruptibly();
>               }
>           }
>       }
>   } finally {
>       // 取消订阅
>       unsubscribe(future, threadId);
>   }
>   ```

#### 锁释放

```java
// org.redisson.RedissonBaseLock#unlockAsync(long)
// 判断 key、uuuid：线程id，锁重入次数：
// == 0，表示锁已经释放，直接返回
// -1，如果还>0,则表示当前为重入的逻辑，继续重置过期时间
// 否则说明可以真正的释放锁了，删除此key，并发送释放锁的消息到 队列中
protected RFuture<Boolean> unlockInnerAsync(long threadId) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            "if (redis.call('hexists', KEYS[1], ARGV[3]) == 0) then " +
                    "return nil;" +
                    "end; " +
                    "local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +
                    "if (counter > 0) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[2]); " +
                    "return 0; " +
                    "else " +
                    "redis.call('del', KEYS[1]); " +
                    "redis.call('publish', KEYS[2], ARGV[1]); " +
                    "return 1; " +
                    "end; " +
                    "return nil;",
            Arrays.asList(getRawName(), getChannelName()), LockPubSub.UNLOCK_MESSAGE, internalLockLeaseTime, getLockName(threadId));
}
```

#### 问题：

- redisson是公平锁么？

  - 默认非公平

- redisson 中的key为自定义，加锁时的数据结构是什么？value 是什么？

  - 数据结构为：hash（也就是java中的map），因为还需要存储 锁重入次数，所以使用的此结构
  - value：uuid + threadId，因为不同jvm虚拟机中，可能会出现threadId相同的情况

- 默认的锁超时时间，续命时间是多少？

  - 默认超时时间：30s，每10秒再次设置过期时间为30s；通过异步线程来实现

- 未获取到锁的线程是怎样等待的？

  - 拿到加锁key的ttl，while死循环尝试获取锁，但每次获取后，会利用 信号量机制 阻塞等待 ttl 的时长，减少无用的获取锁逻辑
  - 订阅一个消息通知队列，当锁释放时，会向此队列中发送消息；收到消息后，利用信号量机制，唤醒上面阻塞等待的线程

  

  
