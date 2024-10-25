---
title: 'sentinel 源码分析'
date: 2024-05-07
author: "shuiMu"
categories: 
  - 技术
tags:
  - sentinel
---
## SentinelResourceAspect

> 通过`spring-cloud-starter-alibaba-sentinel`下的自动配置加载
>
> ![image-20241023143337773](/Sentinel.assets/image-20241023143337773.png)

### **大体调用流程如下：**

> 基于`@SentinelResource`的aop机制，校验链条处理中，只要存在不通过，则直接抛出sentinel定义的异常
>
> 限流的入口方法是`SphU.entry`方法

![image-20241023173901947](/Sentinel.assets/image-20241023173901947.png)

### **核心slot逻辑分析**

#### **统计计算StatisticSlot**

entry逻辑：

```java
public void entry(Context context, ResourceWrapper resourceWrapper, DefaultNode node, int count,
                  boolean prioritized, Object... args) throws Throwable {
    try {
        // 因为异常指标需要其他规则处理完才能统计，所以优先执行后续规则判断
        fireEntry(context, resourceWrapper, node, count, prioritized, args);

        // 说明请求通过，增加线程数、QPS
        node.increaseThreadNum();
        node.addPassRequest(count);
				// ...
    } catch (PriorityWaitException ex) {
       // ...
    } catch (BlockException e) {
        // 设置异常
        // Blocked, set block exception to current entry.
        context.getCurEntry().setBlockError(e);
        // 增加异常指标
        // Add block count.
        node.increaseBlockQps(count);
        if (context.getCurEntry().getOriginNode() != null) {
            context.getCurEntry().getOriginNode().increaseBlockQps(count);
        }

        // ... 抛出异常
        throw e;
    } catch (Throwable e) {
        // Unexpected internal error, set error to current entry.
        context.getCurEntry().setError(e);
        throw e;
    }
}
```

exit逻辑：

```java
public void exit(Context context, ResourceWrapper resourceWrapper, int count, Object... args) {
    Node node = context.getCurNode();

    if (context.getCurEntry().getBlockError() == null) {
        // 计算响应时间指标
        // Calculate response time (use completeStatTime as the time of completion).
        long completeStatTime = TimeUtil.currentTimeMillis();
        context.getCurEntry().setCompleteTimestamp(completeStatTime);
        long rt = completeStatTime - context.getCurEntry().getCreateTimestamp();

        Throwable error = context.getCurEntry().getError();

        // Record response time and success count.
        recordCompleteFor(node, count, rt, error);
        recordCompleteFor(context.getCurEntry().getOriginNode(), count, rt, error);
        if (resourceWrapper.getEntryType() == EntryType.IN) {
            recordCompleteFor(Constants.ENTRY_NODE, count, rt, error);
        }
    }

    // Handle exit event with registered exit callback handlers.
    Collection<ProcessorSlotExitCallback> exitCallbacks = StatisticSlotCallbackRegistry.getExitCallbacks();
    for (ProcessorSlotExitCallback handler : exitCallbacks) {
        handler.onExit(context, resourceWrapper, count, args);
    }

    // fix bug https://github.com/alibaba/Sentinel/issues/2374
    fireExit(context, resourceWrapper, count, args);
}

private void recordCompleteFor(Node node, int batchCount, long rt, Throwable error) {
    if (node == null) {
        return;
    }
    // 统计指标
    node.addRtAndSuccess(rt, batchCount);
    // 释放线程数指标
    node.decreaseThreadNum();

    if (error != null && !(error instanceof BlockException)) {
        node.increaseExceptionQps(batchCount);
    }
}
```



#### **授权规则校验AuthoritySlot**

```java
void checkBlackWhiteAuthority(ResourceWrapper resource, Context context) throws AuthorityException {
		...
    // 针对这个资源的多个授权规则，循环校验
    for (AuthorityRule rule : rules) {
        if (!AuthorityRuleChecker.passCheck(rule, context)) {
            throw new AuthorityException(context.getOrigin(), rule);
        }
    }
}

// 校验逻辑
static boolean passCheck(AuthorityRule rule, Context context) {
    // 获取调用方
    String requester = context.getOrigin();
    // 初次判断是否存在于配置中
    int pos = rule.getLimitApp().indexOf(requester);
    boolean contain = pos > -1;

    // 循环判断，是否确定存在，感觉可以优化成set存储，更方便判断？
    if (contain) {
        boolean exactlyMatch = false;
        String[] appArray = rule.getLimitApp().split(",");
        for (String app : appArray) {
            if (requester.equals(app)) {
                exactlyMatch = true;
                break;
            }
        }
        contain = exactlyMatch;
    }

    int strategy = rule.getStrategy();
    // 黑名单策略，存在则拦截
    if (strategy == RuleConstant.AUTHORITY_BLACK && contain) {
        return false;
    }
    // 白名单策略，不存在则拦截
    if (strategy == RuleConstant.AUTHORITY_WHITE && !contain) {
        return false;
    }
    return true;
}
```

#### **系统规则校验SystemSlot**

```java
public static void checkSystem(ResourceWrapper resourceWrapper, int count) throws BlockException {
    // count 固定为1，QPS校验
    double currentQps = Constants.ENTRY_NODE.passQps();
    if (currentQps + count > qps) {
        throw new SystemBlockException(resourceWrapper.getName(), "qps");
    }

    // 线程数校验
    int currentThread = Constants.ENTRY_NODE.curThreadNum();
    if (currentThread > maxThread) {
        throw new SystemBlockException(resourceWrapper.getName(), "thread");
    }
    // RT校验
    double rt = Constants.ENTRY_NODE.avgRt();
    if (rt > maxRt) {
        throw new SystemBlockException(resourceWrapper.getName(), "rt");
    }

    // load 校验
    if (highestSystemLoadIsSet && getCurrentSystemAvgLoad() > highestSystemLoad) {
        if (!checkBbr(currentThread)) {
            throw new SystemBlockException(resourceWrapper.getName(), "load");
        }
    }

    // cpu使用率校验
    if (highestCpuUsageIsSet && getCurrentCpuUsage() > highestCpuUsage) {
        throw new SystemBlockException(resourceWrapper.getName(), "cpu");
    }
}
```

#### **流控规则处理 FlowSlot**

快速失败逻辑：

>com.alibaba.csp.sentinel.slots.block.flow.controller.DefaultController#canPass(com.alibaba.csp.sentinel.node.Node, int, boolean)

```java
public boolean canPass(Node node, int acquireCount, boolean prioritized) {
    // 根据规则，获取到当前值，线程数或qps
    int curCount = avgUsedTokens(node);
    // acquireCount固定是1，超出阈值则返回false
    if (curCount + acquireCount > count) {
        // ...
        return false;
    }
    return true;
}

// 根据规则配置，获取当前线程数或qps
private int avgUsedTokens(Node node) {
    if (node == null) {
        return DEFAULT_AVG_USED_TOKENS;
    }
    return grade == RuleConstant.FLOW_GRADE_THREAD ? node.curThreadNum() : (int)(node.passQps());
}

// node.passQps() 实现
// com.alibaba.csp.sentinel.node.StatisticNode#passQps
// 滑动窗口算法
public double passQps() {
    // 秒计数器中，所有window值的和 / 窗口秒数
    return rollingCounterInSecond.pass() / rollingCounterInSecond.getWindowIntervalInSec();
}

// rollingCounterInSecond.pass() 实现
public long pass() {
    data.currentWindow();
    long pass = 0;
    // 会根据当前时间戳，获取到未过期的所有窗口
    List<MetricBucket> list = data.values();

    // 窗口 QPS 求和，值的增加统计在 StatisticSlot
    for (MetricBucket window : list) {
        pass += window.pass();
    }
    return pass;
}

public long pass() {
    return get(MetricEvent.PASS);
}

public long get(MetricEvent event) {
    return counters[event.ordinal()].sum();
}

// 每个窗口中，通过数组 counters 来存储所有需要计算的指标
public enum MetricEvent {

    /**
     * Normal pass.
     */
    PASS,
    /**
     * Normal block.
     */
    BLOCK,
    EXCEPTION,
    SUCCESS,
    RT,
    /**
     * Passed in future quota (pre-occupied, since 1.5.0).
     */
    OCCUPIED_PASS
}
```

#### **熔断 DegradeSlot**

> 熔断器状态有三种：
>
> 1. close：可正常放行
> 2. open：拦截，熔断降级处理
> 3. half_open：半开，允许放行一次请求，通过了状态改为open，否则改为close
>
> ![image-20241024152902393](/Sentinel.assets/image-20241024152902393.png)

entry 逻辑：

```java
void performChecking(Context context, ResourceWrapper r) throws BlockException {
    // 根据资源名称，获取配置熔断规则
    List<CircuitBreaker> circuitBreakers = DegradeRuleManager.getCircuitBreakers(r.getName());
    // ...
    // 循环规则校验
    for (CircuitBreaker cb : circuitBreakers) {
        if (!cb.tryPass(context)) {
            throw new DegradeException(cb.getRule().getLimitApp(), cb.getRule());
        }
    }
}

// 这里直接根据熔断器状态判断，那熔断器的状态如何更新？请看exit方法
public boolean tryPass(Context context) {
    // 熔断器关闭，则放行
    if (currentState.get() == State.CLOSED) {
        return true;
    }
    // 熔断器打开，则判断是否达到下一次重试时间，如果达到了，更改open -> half_open
    if (currentState.get() == State.OPEN) {
        // For half-open state we allow a request for probing.
        return retryTimeoutArrived() && fromOpenToHalfOpen(context);
    }
    // half_open 则放行一次
    return false;
}
```

exit 逻辑：

```java
public void exit(Context context, ResourceWrapper r, int count, Object... args) {
    // ...
    if (curEntry.getBlockError() == null) {
        // 循环执行所有规则的 onRequestComplete 方法
        for (CircuitBreaker circuitBreaker : circuitBreakers) {
            circuitBreaker.onRequestComplete(context);
        }
    }
    fireExit(context, r, count, args);
}
```

ExceptionCircuitBreaker 异常熔断处理

> ResponseTimeCircuitBreaker 处理类似

```java
public void onRequestComplete(Context context) {
    Entry entry = context.getCurEntry();
    if (entry == null) {
        return;
    }
    // 业务执行是否抛出异常
    Throwable error = entry.getError();
    // 获取当前时间窗，并增加计数
    SimpleErrorCounter counter = stat.currentWindow().value();
    if (error != null) {
        counter.getErrorCount().add(1);
    }
    counter.getTotalCount().add(1);
    // 根据指标阈值更新熔断器状态
    handleStateChangeWhenThresholdExceeded(error);
}

private void handleStateChangeWhenThresholdExceeded(Throwable error) {
    // 熔断器open状态下，直接返回。
    if (currentState.get() == State.OPEN) {
        return;
    }
    // half_open
    if (currentState.get() == State.HALF_OPEN) {
        // In detecting request
        if (error == null) {
            // 没有异常，改为close
            fromHalfOpenToClose();
        } else {
            // 异常，改为open
            fromHalfOpenToOpen(1.0d);
        }
        return;
    }

    // close 状态下，基于异常比例或数量，熔断器状态修改为 open
    List<SimpleErrorCounter> counters = stat.values();
    long errCount = 0;
    long totalCount = 0;
    for (SimpleErrorCounter counter : counters) {
        errCount += counter.errorCount.sum();
        totalCount += counter.totalCount.sum();
    }
    if (totalCount < minRequestAmount) {
        return;
    }
    double curCount = errCount;
    if (strategy == DEGRADE_GRADE_EXCEPTION_RATIO) {
        // Use errorRatio
        curCount = errCount * 1.0d / totalCount;
    }
    if (curCount > threshold) {
        transformToOpen(curCount);
    }
}
```

## **SentinelWebInterceptor**

> controller 接口会被sentinel默认标记为资源，是基于spring mvc的interceptor机制实现
>
> 通过springBoot自动装配机制，SentinelWebAutoConfiguration 加载到spring中，且默认拦截路径为：`/**`

com.alibaba.csp.sentinel.adapter.spring.webmvc.AbstractSentinelInterceptor#preHandle

```java
public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
    throws Exception {
    try {
				// ...
        // 核心方法，也是调用到了这里：
        Entry entry = SphU.entry(resourceName, ResourceTypeConstants.COMMON_WEB, EntryType.IN);
        request.setAttribute(baseWebMvcConfig.getRequestAttributeName(), entry);
        return true;
    } catch (BlockException e) {
        try {
            handleBlockException(request, response, e);
        } finally {
            ContextUtil.exit();
        }
        return false;
    }
}

public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                            Object handler, Exception ex) throws Exception {
    if (increaseReferece(request, this.baseWebMvcConfig.getRequestRefName(), -1) != 0) {
        return;
    }

    Entry entry = getEntryInRequest(request, baseWebMvcConfig.getRequestAttributeName());
    if (entry == null) {
        // should not happen
        RecordLog.warn("[{}] No entry found in request, key: {}",
                getClass().getSimpleName(), baseWebMvcConfig.getRequestAttributeName());
        return;
    }
		// 调用 entry.exit 方法
    traceExceptionAndExit(entry, ex);
    removeEntryInRequest(request);
    ContextUtil.exit();
}
```
## 算法

### 滑动窗口

> 比如需要实现某个用户，1分钟只能请求10次的需求

**简单实现：**

```java
// 限制次数
static int limit = 10;
static int count = 0;
// 窗口开始时间
static long start = System.currentTimeMillis();
// 窗口时长
static long window = TimeUnit.SECONDS.toMillis(60);

public static boolean pass() {
    long now = System.currentTimeMillis();
    if (start + window > now) {
        count++;
        return count < limit;
    } else {
        start = now;
        count = 0;
    }
    return true;
}
```

**这样实现会有什么问题？**

> 按照上面实现，在w1、w2两个窗口内，都是没有达到阈值，但是从中间部分看，所在的一分钟内已经达到了16次请求，却没有被限制住，这就涉及到滑动窗格的概念
>
> ![image-20241024165304664](/Sentinel.assets/image-20241024165304664.png)

滑动窗口算法

> 下图中，整个红色的矩形框表示一个时间窗口，在我们的例子中，一个时间窗口就是一分钟。然后我们将时间窗口进行划分，比如图中，我们就将滑动窗口划成了6格，所以每格代表的是10秒钟。每过10秒钟，我们的时间窗口就会往右滑动一格。每一个格子都有自己独立的计数器counter，比如当一个请求 在0:35秒的时候到达，那么0:30~0:39对应的counter就会加1。
>
> 计数器算法其实就是滑动窗口算法。只是它没有对时间窗口做进一步地划分，所以只有1格。
>
> 由此可见，当滑动窗口的格子划分的越多，那么滑动窗口的滚动就越平滑，限流的统计就会越精确。
>
> ![image-sliding window](/Sentinel.assets/87952-9762486-9762490.png)

**sample 实现如下**

```java
static int limit = 5;
static int count = 0;
static long window = TimeUnit.SECONDS.toMillis(1);
static int windowSize = 10;
private static LinkedList<Integer> list = new LinkedList<>();

@Test
public void demo1() {
    // 异步线程滚动窗格，
    new Thread(SlideWindowTest::rollWindow).start();

    while (true) {
        ThreadUtil.sleep(100);
        if (pass2()) {
            System.out.println(STR."time:\{LocalDateTime.now()}__pass");
        } else {
            System.out.println(STR."time:\{LocalDateTime.now()}__fail");
        }
    }
}

public static void rollWindow() {
    while (true) {
        // 每次都将最新的count值添加进去
        list.addLast(count);
        // 只保留10个元素，来实现窗口滑动
        if (list.size() > windowSize) {
            list.removeFirst();
        }
        ThreadUtil.sleep(window / windowSize);
    }
}

public static boolean pass2() {
    // last - first 就是这几个窗格总的请求次数
    if (list.getLast() - list.getFirst() < limit) {
        count++;
        return true;
    }
    return false;
}
```

### 漏桶

> 漏桶算法，又称leaky bucket
>
> 整个算法其实十分简单。首先，我们有一个固定容量的桶，有水流进来，也有水流出去。对于流进来的水来说，我们无法预计一共有多少水会流进来，也无法预计水流的速度。但是对于流出去的水来说，这个桶可以固定水流出的速率。而且，当桶满了之后，多余的水将会溢出。
>
> 我们将算法中的水换成实际应用中的请求，我们可以看到漏桶算法天生就限制了请求的速度。当使用了漏桶算法，我们可以保证接口会以一个常速速率来处理请求。所以漏桶算法天生不会出现临界问题。
>
> ![image-leaky bucket](/Sentinel.assets/87969.png)

未完待续。。。

### 令牌桶

未完待续。。。