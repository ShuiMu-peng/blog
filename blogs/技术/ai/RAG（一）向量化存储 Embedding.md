---
title: 'RAG（一）向量化存储 Embedding'
date: 2024-12-13
author: "shuiMu"
categories:
  - 技术
tags:
  - ai
---
# RAG（一）向量化存储 Embedding

> 基于本地Ollama模型测试，这个模型的安装非常简单
>
> 官网地址：https://ollama.com/
>
> 下载安装后运行：
>
> ```shell
> # 拉取向量模型
> ollama pull nomic-embed-text:v1.5
> # 启动服务
> ollama serve
> # 非必要，这个可以启动chat模型的对话
> ollama run llama3:8b
> ```

## Redis

> 使用redis作为向量数据库存储
>
> **注意：**
>
> - 安装redis使用带有 向量检索功能的
>
> **docker方式(我本地电脑是m1芯片，所以用的arm64版本，镜像选择需要根据本地环境切换)：**
>
> ```shell
> docker run -p 6379:6379 redis/redis-stack-server:6.2.6-v17-arm64
> ```

### **pom.xml**

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.0.0.M1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement
  
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-redis-store-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>5.1.0</version>
</dependency>
```

### application.yml

```yaml
spring:
  ai:
    ollama:
      chat:
        model: llama3:8b
      embedding:
        model: nomic-embed-text:v1.5
    #      base-url: http://localhost:11434
    vectorstore:
      redis:
        index: test_index
        uri: redis://localhost:6379
```

### DucumentService.java

> 向量化存储、检索操作类

```java
@Component
public class DocumentService {
    @Value("classpath:meituan-qa.txt")
    private Resource resource;
    @Autowired
    private RedisVectorStore redisVectorStore;

    /**
     * 检索
     */
    public List<Document> search(String message) {
        // 简单字符串搜索，复杂场景可以传递 SearchRequest 对象
        return redisVectorStore.similaritySearch(message);
    }

    /**
     * 加载文件数据，向量化后存储到redis
     */
    public List<Document> loadText() throws IOException {
        String document = StreamUtils.copyToString(this.resource.getInputStream(), Charset.defaultCharset());

        // 切分文档，并且只将问题向量化处理，答案存储到对应元数据中
        List<Document> documentList = split(document).stream().map(a -> {
            String[] split = a.replace("Q：", "").split("\n");
            // Document 对象只有第一个参数会做向量化处理
            return new Document(split[0], Map.of("key", split[1]));
        }).toList();
        // 存储到redis中
        redisVectorStore.add(documentList);
        return documentList;
    }
  
    public String[] split(String text) {
        return text.split("\\s*\\R\\s*\\R\\s*");
    }
}
```

**metuan-qa.txt 内容如下：**

```tex
Q：在线支付取消订单后钱怎么返还？
订单取消后，款项会在一个工作日内，直接返还到您的美团账户余额。

Q：怎么查看退款是否成功？
退款会在一个工作日之内到美团账户余额，可在“账号管理——我的账号”中查看是否到账。

Q：美团账户里的余额怎么提现？
余额可到美团网（meituan.com）——“我的美团→美团余额”里提取到您的银行卡或者支付宝账号，另外，余额也可直接用于支付外卖订单（限支持在线支付的商家）。

Q：余额提现到账时间是多久？
1-7个工作日内可退回您的支付账户。由于银行处理可能有延迟，具体以账户的到账时间为准。

Q：申请退款后，商家拒绝了怎么办？
申请退款后，如果商家拒绝，此时回到订单页面点击“退款申诉”，美团客服介入处理。
```

