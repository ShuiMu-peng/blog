## RocketMQ

官网：
http://rocketmq.apache.org/docs/order-example/

> 注意：
>
> java中jar包版本 和 rocket 版本 保持一致，否则不能自动创建topic
>
> 大部分列子官网上已经存在，此处记录 出问题的一些点

三个地方同步异步：

- 主从
- 刷盘

### 常用的几种模式:

- 简单
- 有序：通过id或固定值，取模，添加到固定队列中；同一个队列中 消费是有序的
- 延时：

  1. 先到延时队列中
  2. 到时间后才会存储到真正的队列中
  3. org.apache.rocketmq.store.config.MessageStoreConfig#
     messageDelayLevel = "1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h";
- 过滤：通过 标签 或者 自定义属性进行 数据过滤展示

  - 如果开启属性过滤，需要设置：
    开启 sql92 方式过滤:`enablePropertyFilter=true`
- 事务：

```java

/**
*  消息 生产者
*/
public class TransactionProducer {
    public static void main(String[] args) throws MQClientException, InterruptedException {
        TransactionListener transactionListener = new TransactionListenerImpl();
        TransactionMQProducer producer = new TransactionMQProducer("please_rename_unique_group_name");
        producer.setNamesrvAddr("192.168.3.132:9876");

        ExecutorService executorService = new ThreadPoolExecutor(2, 5, 100, TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(2000), new ThreadFactory() {
            @Override
            public Thread newThread(Runnable r) {
                Thread thread = new Thread(r);
                thread.setName("client-transaction-msg-check-thread");
                return thread;
            }
        });

        producer.setExecutorService(executorService);
        producer.setTransactionListener(transactionListener);
        producer.start();

        String[] tags = new String[] {"TagA", "TagB", "TagC", "TagD", "TagE"};
        for (int i = 0; i < 5; i++) {
            try {
                Message msg =
                    new Message("TopicTest1234", tags[i % tags.length], "KEY" + i,
                        ("Hello RocketMQ " + tags[i % tags.length]).getBytes(RemotingHelper.DEFAULT_CHARSET));
                SendResult sendResult = producer.sendMessageInTransaction(msg, null);
                System.out.printf("%s%n", sendResult);
                Thread.sleep(10);
            } catch (MQClientException | UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        }
        TimeUnit.SECONDS.sleep(Integer.MAX_VALUE);
        producer.shutdown();
    }
}

/**
 * 事务消息的 监听 者
 */
public class TransactionListenerImpl implements TransactionListener {
    private AtomicInteger transactionIndex = new AtomicInteger(0);

    private ConcurrentHashMap<String, Integer> localTrans = new ConcurrentHashMap<>();

    //执行业务代码
    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        String tags = msg.getTags();
        switch (tags){
            case "TagA":
                //提交
                return LocalTransactionState.COMMIT_MESSAGE;
            case "TagB":
                //未知
                return LocalTransactionState.UNKNOW;
            default:
                //回滚
                return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }
    /**
     * 当 业务执行方法 为 {@link LocalTransactionState#UNKNOW} 此状态时，mq 需要 重复获取 此业务的状态 ，来判断 该消息应该回滚 还是提交
     */
    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        System.out.printf("%s %s 事务校验;校验结果:%s %n", new String(msg.getBody()), DateUtils.getTime(),LocalTransactionState.UNKNOW);
        return LocalTransactionState.COMMIT_MESSAGE;
    }
}

```









