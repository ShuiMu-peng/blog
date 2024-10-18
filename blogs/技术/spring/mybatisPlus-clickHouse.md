---
title: 'mybatis-plus 动态数据源 clickHouse集群'
date: 2021-12-01
author: "shuiMu"
categories: 
  - 技术
tags:
  - mybatis-plus
  - clickhouse
---
### 背景：

> 当前项目使用的 `mybatis-plus` 多数据源框架，使用方式可参考：
>
> https://mp.baomidou.com/guide/dynamic-datasource.html#%E6%96%87%E6%A1%A3-documentation
>
> 默认多数据源配置，并不支持clickHouse 多节点信息，可通过如下方式扩展：

### pom.xml

```xml
...

<mybatis.plus.version>3.4.3.4</mybatis.plus.version>
<dynamic.datasource.version>3.4.1</dynamic.datasource.version>
<clickhouse.version>0.3.1-patch</clickhouse.version>

...
<dependency>
   <groupId>ru.yandex.clickhouse</groupId>
   <artifactId>clickhouse-jdbc</artifactId>
   <version>${clickhouse.version}</version>
</dependency>
<dependency>
  <groupId>com.baomidou</groupId>
  <artifactId>mybatis-plus-boot-starter</artifactId>
  <version>${mybatis.plus.version}</version>
</dependency>
<dependency>
  <groupId>com.baomidou</groupId>
  <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
  <version>${dynamic.datasource.version}</version>
</dependency>
```



### Java代码：

> 增加自定义的动态数据源配置

```java
// 保证执行顺序在前面，否则 会被其他加载器给创建，导致自定义的加载器执行不到
@Order(0)
@Configuration
public class DynamicDataSourceConfig extends AbstractDataSourceCreator implements DataSourceCreator {
    protected DynamicDataSourceConfig(DynamicDataSourceProperties dynamicDataSourceProperties) {
        super(dynamicDataSourceProperties);
    }

    @Override
    public DataSource doCreateDataSource(DataSourceProperty dataSourceProperty) {
        // 如果需要其他参数，自行加入，可以在配置文件配置，此处从dataSourceProperty获取，并填充
        Properties properties = new Properties();
        // 使用clickHouse
        return new BalancedClickhouseDataSource(dataSourceProperty.getUrl(), properties);
    }

    @Override
    public boolean support(DataSourceProperty dataSourceProperty) {
        // 适配器模式，判断是否需要使用当前动态数据源创建
        Class<? extends DataSource> type = dataSourceProperty.getType();
        if (Objects.isNull(type)) {
            return Boolean.FALSE;
        }
        return StringUtils.equals(type.getName(), BalancedClickhouseDataSource.class.getName());
    }
}
```

> 使用方式

```java
// 标注此 mapper 查询使用 clickHouse 数据源，和 配置文件中名称对应
@DS("clickHouse")
public interface TestMapper extends BaseMapper<TestEntity> {

}
```



### application.yaml

```yaml
spring:
  datasource:
    dynamic:
      primary: master #指定默认数据源
      strict: true
      datasource:
        master:
          driver-class-name: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://xxxx:3306/xxx?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&zeroDateTimeBehavior=convertToNull
          username: xx
          password: xx
          hikari:
            minimum-idle: 5
            idle-timeout: 600000
            maximum-pool-size: 20
            max-lifetime: 1800000
            connection-timeout: 6000
            connection-test-query: SELECT 1
        clickHouse:
          # 此处type 主要用作 java代码中适配器的判断
          type: ru.yandex.clickhouse.BalancedClickhouseDataSource
          driver-class-name: ru.yandex.clickhouse.ClickHouseDriver
          # jdbc:clickhouse://ip:port,ip:port/xxx 配置格式
          url: jdbc:clickhouse://xxxx:8123,xxxx:8123/xxx
```

### 原理解析

#### BalancedClickhouseDataSource.class

> 此数据源为`clickHouse`jdbc提供的集群`DataSource`
>
> 所以我们要做的就是使用此数据源来创建`DataSource`

```java

    /**
     * create Datasource for clickhouse JDBC connections
     *
     * @param url address for connection to the database
     *            must have the next format {@code jdbc:clickhouse://<first-host>:<port>,<second-host>:<port>/<database>?param1=value1&param2=value2 }
     *            for example, {@code jdbc:clickhouse://localhost:8123,localhost:8123/database?compress=1&decompress=2 }
     * @throws IllegalArgumentException if param have not correct format, or error happens when checking host availability
     */
    public BalancedClickhouseDataSource(final String url) {
        this(splitUrl(url), getFromUrl(url));
    }
```

#### com.baomidou.dynamic.datasource.creator.DefaultDataSourceCreator

> 源码中，通过此类来初始化配置文件中的 数据源

```java
@Slf4j
@Setter
public class DefaultDataSourceCreator {
	  // 默认的实现类中，BasicDataSourceCreator 的 support方法始终为true，所以自定义的动态数据源配置，必须在 BasicDataSourceCreator 之前执行，需要设置 @Order
    private List<DataSourceCreator> creators;

    public DataSource createDataSource(DataSourceProperty dataSourceProperty) {
        DataSourceCreator dataSourceCreator = null;
        for (DataSourceCreator creator : this.creators) {
            // 适配器判断，是否使用此数据源
            if (creator.support(dataSourceProperty)) {
                dataSourceCreator = creator;
                break;
            }
        }
        if (dataSourceCreator == null) {
            throw new IllegalStateException("creator must not be null,please check the DataSourceCreator");
        }
        // 创建数据源
        return dataSourceCreator.createDataSource(dataSourceProperty);
    }

}
```
