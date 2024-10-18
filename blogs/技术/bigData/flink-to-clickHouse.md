---
title: 'Flink SQL 批模式下 ClickHouse 批量写入'
date: 2022-05-02
author: "shuiMu"
categories:
  - 技术
tags:
  - flink
  - clickHouse
---

> 内置使用`JdbcBatchingOutputFormat` 批量处理类

##### pom依赖

```xml

<dependency>
    <groupId>ru.yandex.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.3.1-patch</version>
</dependency>
<dependency>
<groupId>org.apache.flink</groupId>
<artifactId>flink-connector-jdbc_2.11</artifactId>
<version>${flink.version}</version>
</dependency>
<dependency>
<groupId>cn.hutool</groupId>
<artifactId>hutool-all</artifactId>
<version>${hutool.version}</version>
</dependency>
<dependency>
<groupId>mysql</groupId>
<artifactId>mysql-connector-java</artifactId>
<version>${mysql.version}</version>
</dependency>
```

##### clickHouse数据源需要的扩展类：

###### 工厂类

```java
public class ClickHouseDynamicTableFactory implements DynamicTableSinkFactory {
    public static final String IDENTIFIER = "clickhouse";

    private static final String DRIVER_NAME = "ru.yandex.clickhouse.ClickHouseDriver";

    public static final ConfigOption<String> URL = ConfigOptions
            .key("url")
            .stringType()
            .noDefaultValue()
            .withDescription("the jdbc database url.");

    public static final ConfigOption<String> TABLE_NAME = ConfigOptions
            .key("table-name")
            .stringType()
            .noDefaultValue()
            .withDescription("the jdbc table name.");

    public static final ConfigOption<String> USERNAME = ConfigOptions
            .key("username")
            .stringType()
            .noDefaultValue()
            .withDescription("the jdbc user name.");

    public static final ConfigOption<String> PASSWORD = ConfigOptions
            .key("password")
            .stringType()
            .noDefaultValue()
            .withDescription("the jdbc password.");

    public static final ConfigOption<String> FORMAT = ConfigOptions
            .key("format")
            .stringType()
            .noDefaultValue()
            .withDescription("the format.");

    @Override
    public String factoryIdentifier() {
        return IDENTIFIER;
    }

    @Override
    public Set<ConfigOption<?>> requiredOptions() {
        Set<ConfigOption<?>> requiredOptions = new HashSet<>();
        requiredOptions.add(TABLE_NAME);
        requiredOptions.add(URL);
        return requiredOptions;
    }

    @Override
    public Set<ConfigOption<?>> optionalOptions() {
        return new HashSet<>();
    }

    @Override
    public DynamicTableSink createDynamicTableSink(Context context) {

        // either implement your custom validation logic here ...
        final FactoryUtil.TableFactoryHelper helper = FactoryUtil.createTableFactoryHelper(this, context);

        final ReadableConfig config = helper.getOptions();

        // validate all options
        helper.validate();

        // get the validated options
        JdbcOptions jdbcOptions = getJdbcOptions(config);

        // derive the produced data type (excluding computed columns) from the catalog table
        final DataType dataType = context.getCatalogTable().getResolvedSchema().toPhysicalRowDataType();

        // table sink
        return new ClickHouseDynamicTableSink(jdbcOptions, dataType);
    }

    private JdbcOptions getJdbcOptions(ReadableConfig readableConfig) {
        final String url = readableConfig.get(URL);
        final JdbcOptions.Builder builder = JdbcOptions.builder()
                .setDriverName(DRIVER_NAME)
                .setDBUrl(url)
                .setTableName(readableConfig.get(TABLE_NAME))
                .setDialect(new ClickHouseDialect());

        readableConfig.getOptional(USERNAME).ifPresent(builder::setUsername);
        readableConfig.getOptional(PASSWORD).ifPresent(builder::setPassword);
        return builder.build();
    }
}

```

###### 方言类

```java
public class ClickHouseDialect implements JdbcDialect {

    private static final long serialVersionUID = 1L;

    @Override
    public String dialectName() {
        return "ClickHouse";
    }

    @Override
    public boolean canHandle(String url) {
        return url.startsWith("jdbc:clickhouse:");
    }

    @Override
    public JdbcRowConverter getRowConverter(RowType rowType) {
        return new ClickHouseRowConverter(rowType);
    }

    @Override
    public String getLimitClause(long l) {
        return "limit num : " + l;
    }

    @Override
    public Optional<String> defaultDriverName() {
        return Optional.of(ClickHouseDriver.class.getName());
    }

    @Override
    public String quoteIdentifier(String identifier) {
        return "`" + identifier + "`";
    }
}
```

###### Sink输出类（重点）

```java
public class ClickHouseDynamicTableSink implements DynamicTableSink {

    private final JdbcOptions jdbcOptions;
    private final DataType dataType;
    private static final JdbcExecutionOptions DEFAULT_EXECUTION_OPTIONS = JdbcExecutionOptions.builder()
            // 写入触发数据量阈值
            .withBatchSize(2000)
            // 写入触发时间阈值
            .withBatchIntervalMs(1000)
            // 重试次数
            .withMaxRetries(3)
            .build();

    public ClickHouseDynamicTableSink(JdbcOptions jdbcOptions, DataType dataType) {
        this.jdbcOptions = jdbcOptions;
        this.dataType = dataType;
    }

    @Override
    public ChangelogMode getChangelogMode(ChangelogMode requestedMode) {
        return requestedMode;
    }

    @SneakyThrows
    @Override
    public SinkRuntimeProvider getSinkRuntimeProvider(Context context) {
        ClickHouseTableEnum tableEnum = ClickHouseTableEnum.valueOf(jdbcOptions.getTableName());
        TableService tableService = new TableServiceImpl(dataType, tableEnum);
        return SinkFunctionProvider.of(new GenericJdbcSinkFunction<>(
                new JdbcBatchingOutputFormat<>(
                        new SimpleJdbcConnectionProvider(jdbcOptions),
                        DEFAULT_EXECUTION_OPTIONS,
                        thisContext -> JdbcBatchStatementExecutor.simple(
                                tableService.getInsertSql(),
                                tableService.getStatementBuilder(),
                                Function.identity()),
                        // 批模式下，数据对象重复利用，会发生覆盖问题，需要深拷贝对象
                        new RowDataConventFunction())));
    }

    @Override
    public DynamicTableSink copy() {
        return new ClickHouseDynamicTableSink(jdbcOptions, dataType);
    }

    @Override
    public String asSummaryString() {
        return "ClickHouse Table Sink";
    }

    @Slf4j
    static class RowDataConventFunction implements JdbcBatchingOutputFormat.RecordExtractor<RowData, RowData>, Serializable {
        @Override
        public RowData apply(RowData rowData) {
            BoxedWrapperRowData newRowData = null;
            try {
                newRowData = new BoxedWrapperRowData(rowData.getArity());
                // 利用反射拷贝旧对象的值
                Field field = ReflectUtil.getField(BoxedWrapperRowData.class, "fields");
                Object[] fields = (Object[]) ReflectUtil.getFieldValue(rowData, field);
                Object[] newFields = new Object[fields.length];
                for (int i = 0; i < fields.length; i++) {
                    newFields[i] = Objects.isNull(fields[i]) ? null : ReflectUtil.invoke(fields[i], "copy");
                }
                ReflectUtil.setFieldValue(newRowData, "fields", newFields);
            } catch (Exception e) {
                log.error("convert error,data:{},", rowData, e);
            }
            return newRowData;
        }
    }
}
```

###### 转换类

```java
public class ClickHouseRowConverter extends AbstractJdbcRowConverter {
    private static final long serialVersionUID = 1L;

    public ClickHouseRowConverter(RowType rowType) {
        super(rowType);
    }

    @Override
    public String converterName() {
        return "ClickHouse";
    }
}
```

支持序列化的`BiFunction`

```java

@FunctionalInterface
public interface MyBiFunction<T, U, R> extends Serializable {
    R apply(T t, U u);
}
```

###### sql 生成类

```java
public class TableServiceImpl {
    private final List<LogicalType> logicalTypeList;
    private final String insertSql;

    public TableServiceImpl(DataType dataType, ClickHouseTableEnum tableEnum) {
        this.logicalTypeList = dataType.getLogicalType().getChildren();
        this.insertSql = initInsertSql(tableEnum);
    }

    private static final Map<Class<? extends LogicalType>, MyBiFunction<RowData, Integer, Object>> FUNCTION_MAP = Maps.newHashMap();

    static {
        // 我的业务中用到的类型，可根据自己的业务，进行增加
        FUNCTION_MAP.put(IntType.class, RowData::getInt);
        FUNCTION_MAP.put(VarCharType.class, RowData::getString);
        FUNCTION_MAP.put(DoubleType.class, RowData::getDouble);
        FUNCTION_MAP.put(BigIntType.class, RowData::getLong);
        FUNCTION_MAP.put(CharType.class, RowData::getString);
    }

    public String getInsertSql() {
        return insertSql;
    }

    public JdbcStatementBuilder<RowData> getStatementBuilder() {
        return (statement, value) -> {
            for (int i = 0; i < logicalTypeList.size(); i++) {
                LogicalType logicalType = logicalTypeList.get(i);
                Object realValue = FUNCTION_MAP.get(logicalType.getClass()).apply(value, i);
                statement.setObject(i + 1, realValue);
            }
        };
    }

    // 根据枚举字段配置，生成 insert sql
    public static String initInsertSql(ClickHouseTableEnum tableEnum) {
        List<String> columns = tableEnum.getColumns().stream().map(ClickHouseTableEnum.ColumnObj::getColumnName).collect(Collectors.toList());
        return String.format("insert into %s (%s) values (%s)"
                , tableEnum.name()
                , StrUtil.join(",", columns)
                , StrUtil.repeatAndJoin("?", columns.size(), ","));
    }

    public static void main(String[] args) {
        System.out.println(initInsertSql(ClickHouseTableEnum.attr_order_group));
    }
}
```

###### clickHouseTable 枚举类

```java

@Getter
public enum ClickHouseTableEnum {
    /**
     * 测试表，因为业务需要，我定义的 ColumnObj 类，实际用个字符串就ok
     */
    test(Lists.newArrayList(
            ColumnObj.of("name")
            , ColumnObj.of("age")
    )),
    ;
    private final List<ColumnObj> columns;

    ClickHouseTableEnum(List<ColumnObj> columns) {
        this.columns = columns;
    }

    @Getter
    @Setter
    @ToString
    public static class ColumnObj {
        /**
         * clickHouse 中字段名称
         */
        private String columnName;
        /**
         * flink sql 中获取字段的key
         */
        private String sqlColumnKey;

        /**
         * 两个值相同的情况，使用此构造函数
         */
        private ColumnObj(String columnName) {
            this.columnName = columnName;
            this.sqlColumnKey = columnName;
        }
    }
}
```

###### Spi 配置自定义的工厂

> `resources` 目录下，创建 `META-INF/services` 目录
>
> 创建文件：`org.apache.flink.table.factories.Factory`

内容如下：指向自己的工厂类全路径

```tex
com.xxx.xxx.xxx.ClickHouseDynamicTableFactory
```

![image-20220914113440704](/Users/lipeng/Documents/git-file/my_file/lipeng/学习/spring-cloud/Flink SQL 批模式下 ClickHouse 批量写入.assets/image-20220914113440704.png)

##### 输出测试

```java
public class Test {
    public static void main(String[] args) {
        // 初始化 批模式环境
        EnvironmentSettings settings = EnvironmentSettings.newInstance().inBatchMode().build();
        Configuration configuration = settings.toConfiguration();
        configuration.set(CoreOptions.DEFAULT_PARALLELISM, 5);
        TableEnvironment tableEnv = TableEnvironment.create(configuration);

        // 创建 clickHouse 输出表
        // 注意，WITH 后面的参数，table-name 需要跟 clickHouseTable 枚举类中对应上
        tableEnv.executeSql("CREATE TABLE out_table_test (\n" +
                "  `name` STRING,\n" +
                "  `age` INT\n" +
                ")  WITH (\n" +
                "   'connector' = 'clickhouse',\n" +
                "   'url' = 'jdbc:clickhouse://172.23.4.32:8123/test',\n" +
                "   'table-name' = 'test'\n" +
                ")");

        Table table = tableEnv.sqlQuery("select 'alice',18 ");
        table.executeInsert("out_table_test");
        // 打印日志
        printLog(tableEnv, table, "test");
    }

    private static void printLog(TableEnvironment tableEnv, Table endTable, String outTableName) {
        String outPrint = "consolePrint_" + outTableName;
        tableEnv.executeSql("CREATE TABLE " + outPrint + " " + endTable.getResolvedSchema() + " WITH (\n" +
                "  'connector' = 'print'\n" +
                ")");
        endTable.executeInsert(outPrint);

        Table countTable = tableEnv.sqlQuery("select count(*) from " + endTable);
        tableEnv.executeSql("CREATE TABLE " + outPrint + "_count " + countTable.getResolvedSchema() + " WITH (\n" +
                "  'connector' = 'print'\n" +
                ")");
        countTable.executeInsert(outPrint + "_count");
    }
}
```



