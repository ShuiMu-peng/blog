## Hbase概述

> Apache Hbase 是以HDFS存储的，一种分布式、可扩展的NoSql数据库

### 数据模型

Hbase的设计理念，依据Google的BigTable论文（BigTable是一个`稀疏的`、`分布式的`、`持久的`多维排序map）

> map：`key-Value`，该映射，由行键、列键和时间戳索引；映射的每个值，都是一个未解释的字节数组（序列化后的byte）。

`Hbase` 关于数据模型和`BigTable`的对应关系如下：

> `Hbase` 使用的与`BigTable`非常相似的数据模型。用户将数据行存储在带标签的表中，数据行具有可排序的键和任意数量的列，该表存储稀疏，因此如果有用户喜欢，同一表中的行，可以具有疯狂变化的列

最终理解`Hbase`数据模型的关键在于：`稀疏`、`分布式`、`多维`、`排序`的`key-Value`结构

#### 逻辑结构

Hbase可以用于存储多种结构的数据，以 JSON 为例，存储的数据原貌为：

> 注意：
>
> - `rowkey`的ASCII码排序，小的在前大的在后
> - 每个列族下，字段可任意删减增加

```json
{
    "row_key1": {
        "user_info": {
            "name": "zhangsan",
            "age": "23",
            "sex": "男"
        },
        "office_info": {
            "address": "beijing",
            "tel": "010-111111",
            "company_name": "腾云天下"
        }
    },
    "row_key11": {
        "user_info": {
            "name": "lisi",
            "age": "23"
        },
        "office_info": {
            "address": "beijing",
            "company_name": "腾云天下"
        }
    },
    "row_key2": {
        "user_info": {
            "name": "wangwu"
        },
        "office_info": {
            "address": "beijing"
        }
    }
    .......
}
```

可以看到，每个列族下，字段可为空，稀疏存储

![image-20221128213442507](./Hbase.assets/image-20221128213442507.png)

#### 物理结构：

物理存储结构即为数据的映射关系，在逻辑视图中的空单元格，底层实际根本不存储

每个表的，每个列族存储为一个 `StoreFile`

![image-20221128213727752](./Hbase.assets/image-20221128213727752.png)

#### 数据模型：

##### name space

> 命名空间，类似 `database`的概念，有两个自带的命名空间，分别是`habse`和`default`，`hbase`中存放的是Hbase内置表，`default` 是用户默认使用的命名空间

##### Table

> 关系型数据库中表的概念，不同的是，表声明时，只需要声明列族即可，不需要声明具体的列，因为数据存储时为稀疏的，字段可以动态指定，因此，Hbase 更能应对字段变更的场景

##### Row

> Hbase表中每行数据都有一个RowKey 和 多个 Column组成，数据时按照RwoKey的字典序顺序存储，并且查询数据时，只能根据RowKey进行检索，所以RwoKey的存储十分重要

##### Column

>  Hbase每个列都由`Column Family(列族)` 和 `Column Qualifier（列名）`进行限定，如：info:name，info:age,建表时，只需要指定列族即可

##### Time Stamp

用户标识不同版本，每条数据写入时，系统会自动增加该字段

##### Cell

数据上的value值，由`{rowkey,column Family:column Qualifier,timestamp}`唯一确定的单元，cell中的数据，全是字节码形式存储

### 基本架构

![image-20221214171119216](./Hbase.assets/image-20221214171119216.png)

#### 架构角色

##### Zookeeper

> - Hbase 通过 zookeeper 来实现master的高可用，记录RegionServer 的部署信息，并且存储所有表的位置信息
> - Hbase对于数据的读写操作，都需要先访问 zookeeper，获取到表所在的regionServer，然后进行通信

##### Master

> 负责监控集群中所有的`regionServer`实例，主要作用如下：
>
> - 管理元数据表格：hbase:meta，接收用户对表格ddl操作命令，并执行
> - 监控Region是否需要进行负载均衡，故障转移和region的拆分，通过启动多个后台线程来实现上述功能
>   - LoadBlance：负载均衡器
>     - 周期性的监控region 在regionServer上面的分布是否均衡
>   - CatalogJanitor：元数据管理器
>     - 定期检查和清理hbase:meta中的数据，
>   - MasterProWAL master 预写日志处理器
>     - 将master需要执行的任务，记录到预写日志WAL中（HDFS），如果master宕机，则由backupMaster读取日志，继续执行

##### Region Server

> - 负责cell数据的处理，例如数据写入 put，数据查询 get 等
> - 拆分合并 region的实际执行者，由master监控，由regionServer实际执行

##### Region

> - 类似mysql表中横向切分，每个region 维护 startRowKey ~ stopRowKey 范围内的数据
> - 当内部数据达到拆分条件时，会自动拆分

##### Store

> - Region 下，会按照列族拆分存储数据，每个列族就是一个Store
> - Hfile 为真实存储数据的文件

## 快速入门

### 安装部署

```shell
# 因依赖框架较多，流程复杂，目前先使用docker方式安装，切记暴露所有的端口，否则javaApi可能连接不成功
# 目前部署地址：http://172.23.4.32:16011/master-status
```

### HBase-shell

#### DDL

```sql
# 链接shell
./bin/hbase shell
# 查看帮助
help
# 查看创建命名空间帮助
help 'create_namespace'
# 查看 所有 namespace
create_namespace 'test'
list_namespace
# 创建表,namespace:table,列族1 => 保留版本,列族2 => 保留版本
create 'student', {NAME => 'info', VERSIONS => 5}, {NAME => 'company', VERSIONS => 5}
# 查看表结构
describe 'test:student'
# 禁用表
disable 'test:student'
# 删除表
drop 'test:student'
# 修改表
alter 'test:student',{NAME => 'company', VERSIONS => '3'}
# 删除表字段
alter 'test:student1', 'delete' => 'f1'
```

#### DML

```sql
# 插入数据 ,重复插入会一直覆盖，保留多个版本
# put 'ns1:t1', 'r1', 'c1', 'value'
put 'test:student','1001','info:age','12'

# 获取数据，通过 rowKey
# get 'ns1:t1', 'r1'
# get 't1', 'r1', {COLUMN => ['c1', 'c2', 'c3']}
get 'test:student','1001'

# 扫描数据,后面都是可选参数
# scan 'ns1:t1', {COLUMNS => ['c1', 'c2'], LIMIT => 10, STARTROW => 'xyz',STOPROW => ''}
# 注意：STARTROW 为 闭区间，STOPROW 为开区间，不包含此值
scan 'dmp_order_202303', {COLUMNS => ['custom:orderid'], STARTROW => '1001',STOPROW => '1004'}
# 指定字段过滤
scan 'dmp_order_202304', {COLUMNS => ['custom:orderId','campaign:sdk_package_id'], STARTROW => '50471701683244813',STOPROW => '50471701683241213',FILTER=>"SingleColumnValueFilter('campaign','sdk_package_id',=,'binary:53475983')"}

# 删除数据
# 删除一个版本：delete 'ns1:t1', 'r1', 'c1', ts1，删除后再次get，获取到的就是上一个版本
delete 'test:student','1001','info:age'
# 删除所有版本：deleteall 'ns1:t1', 'r1'
deleteall 'test:student','1001','info:age'
```

## API使用

#### connection介绍：

**很多初次使用connection的小伙伴，受其他数据库的影响，可能会陷入以下几个误区：**

1. 封装连接池，每次使用，从连接池中获取一个
2. 多线程使用时，每个线程持有一个connection链接对象
3. 每次访问Hbase时，临时创建connection对象，使用完成后调用close方法，关闭链接

**参考Hbase技术社区文章发现：**

1. HBase客户端中的connection对象并不是简单对应一个socket连接
2. HBase客户端的connection包含了对Zookeeper、HBase Master、HBase RegionServer三种socket连接的封装。因此，connection对象每次被创建出来的开销是很大的，使用完毕之后断开，会带来严重的性能损耗。
3. 在HBase中connection类已经实现了对连接的管理功能，所以我们不需要自己在connection之上再做额外的管理。另外，connection是线程安全的，而Table和Admin则不是线程安全的，因此正确的做法是，在一个JVM进程中共用一个connection对象，而在不同的线程中使用单独的Table和Admin对象。

#### DDL

```java
public class DemoDdl {
    @SneakyThrows
    public static void main(String[] args) {
        Connection connection = HbaseUtil.getConnection();
        Admin admin = connection.getAdmin();
        String namespace = "test";
        String tableName = "student";
        // 创建namespace
        createNamespace(admin, namespace);
        // 打印namespace
        printNamespace(admin);
        // 创建表
        createTable(admin, tableName);
        // 打印table详情
        printTableDescribe(admin, tableName);
        // 修改表
        updateTable(admin, tableName);
        // 打印table详情
        printTableDescribe(admin, tableName);
        admin.close();
        HbaseUtil.close();
    }

    @SneakyThrows
    private static void updateTable(Admin admin, String tableName) {
        TableName oldTable = TableName.valueOf(tableName);
        if (!admin.tableExists(oldTable)) {
            System.out.println("table not exists"l);
            return;
        }
        TableDescriptor descriptor = admin.getDescriptor(oldTable);
        TableDescriptorBuilder builder = TableDescriptorBuilder.newBuilder(descriptor);
        builder.modifyColumnFamily(ColumnFamilyDescriptorBuilder.newBuilder(Bytes.toBytes("info")).setMaxVersions(5).build());
        admin.modifyTable(builder.build());
    }

    @SneakyThrows
    private static void printTableDescribe(Admin admin, String tableName) {
        TableDescriptor descriptor = admin.getDescriptor(TableName.valueOf(tableName));
        System.out.println("table----" + descriptor);
    }

    @SneakyThrows
    private static void createTable(Admin admin, String tableName) {
        TableName name = TableName.valueOf(tableName);
        if (admin.tableExists(name)) {
            return;
        }
        TableDescriptorBuilder builder = TableDescriptorBuilder.newBuilder(name);
        builder.setColumnFamily(ColumnFamilyDescriptorBuilder.of("info"));
        builder.setColumnFamily(ColumnFamilyDescriptorBuilder.of("student"));
        admin.createTable(builder.build());
    }

    @SneakyThrows
    private static void createNamespace(Admin admin, String namespace) {
        NamespaceDescriptor test = NamespaceDescriptor.create(namespace).build();
        NamespaceDescriptor test1 = admin.getNamespaceDescriptor(namespace);
        if (Objects.isNull(test1)) {
            admin.createNamespace(test);
        }
    }

    private static void printNamespace(Admin admin) throws IOException {
        NamespaceDescriptor[] namespaceDescriptors = admin.listNamespaceDescriptors();
        for (NamespaceDescriptor namespaceDescriptor : namespaceDescriptors) {
            System.out.println(namespaceDescriptor.getName());
        }
    }
}

public class HbaseUtil {
    private static final Connection CONNECTION;

    static {
        Configuration configuration = new Configuration();
        configuration.set("hbase.zookeeper.quorum", "172.23.4.33:12181");
        // configuration.set("hbase.zookeeper.property.clientPort", "12181");
        try {
            CONNECTION = ConnectionFactory.createConnection(configuration);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection getConnection() {
        return CONNECTION;
    }

    public static void close() {
        IoUtil.close(CONNECTION);
    }
}


```

#### DML

```java
public class DemoDml {
    @SneakyThrows
    public static void main(String[] args) {
        Connection connection = HbaseUtil.getConnection();
        TableName student = TableName.valueOf("student");
        Table table = connection.getTable(student);
        String rowKey = "1001";
        // 添加数据
        insertData(table, rowKey);
        // get查询
        getData(table, rowKey);
        // scan查询
        scanData(table);

        // 关闭链接
        table.close();
        HbaseUtil.close();
    }

    @SneakyThrows
    private static void scanData(Table table) {
        Scan scan = new Scan();
        scan.addFamily(Bytes.toBytes("info"));
        //  设置startRowKey
        scan.withStartRow(Bytes.toBytes("1001"));
        //  设置stopRowKey
        scan.withStopRow(Bytes.toBytes("1005"));
        // 设置过滤器条件
        FilterList filterList = new FilterList();
        // 单个字段比较
        SingleColumnValueFilter filter = new SingleColumnValueFilter(Bytes.toBytes("info"), Bytes.toBytes("age"), CompareOperator.EQUAL, Bytes.toBytes("1004"));
        filterList.addFilter(filter);
        scan.setFilter(filterList);
        ResultScanner scanner = table.getScanner(scan);
        for (Result result : scanner) {
            Cell[] cells = result.rawCells();
            for (Cell cell : cells) {
                System.out.println(new String(CellUtil.cloneRow(cell)) + "---" + new String(CellUtil.cloneFamily(cell))
                        + "---" + new String(CellUtil.cloneQualifier(cell))
                        + "---" + new String(CellUtil.cloneValue(cell)));
            }
        }
    }

    @SneakyThrows
    private static void getData(Table table, String rowKey) {
        Get get = new Get(Bytes.toBytes(rowKey));
        Result result = table.get(get);
        Cell[] cells = result.rawCells();
        for (Cell cell : cells) {
            System.out.println(new String(CellUtil.cloneValue(cell)));
        }
    }

    private static void insertData(Table table, String rowKey) throws IOException {
        for (Integer a : Arrays.asList(1004, 1002, 1003)) {
            Delete delete = new Delete(Bytes.toBytes(a));
            table.delete(delete);
            Put put = new Put(Bytes.toBytes(String.valueOf(a)));
            put.addColumn(Bytes.toBytes("info"), Bytes.toBytes("name"), Bytes.toBytes("alice"));
            put.addColumn(Bytes.toBytes("info"), Bytes.toBytes("age"), Bytes.toBytes(String.valueOf(a)));
            table.put(put);
        }
    }
}

```

## 原理进阶

### Master

> 主要进程，具体实现类是`HMaster`，通常部署在`namenode`上

负载均衡：通过读取meata表，了解Region 的分配，通过ZK了解Region Server的节点状态，5分钟调控一次，分配均衡

- meta表，本质上和Hbase的其他表格相同
  ![image-20221214164053080](./Hbase.assets/image-20221214164053080.png)
  ![image-20221214164134193](./Hbase.assets/image-20221214164134193.png)
  - RowKey：table,region start key,region id（表名，region的起始rowKey和regionID）
  - info：regioninfo 为region 信息，存储一个HRegionInfo对象
  - info：server 为当前region 所处的`RegionServer` 信息，包含端口号
  - info：serverstartcode 为当前region被分到RegionServer的起始时间
- 元数据表管理：存储在Hdfs上，元数据表路径：`/hbase/data/hbase/meta`
- MasterProcWAL：管理Master自己的预写日志，如果宕机后，让BackUpMaster读取日志数据，继续执行命令，本质写数据到HDFS，32M或1H滚动，当操作执行到meta表之后删除WAL，WAL数据文件路径：`/hbase/MasterData/WALs`
- 客户端在对元数据进行操作的时间才会连接master，如果对数据进行读写，直接链接zk，读取目录`/hbase/meta-region-server`节点信息，会记录meta表格的位置，直接读取即可，不需要访问master，可以减轻master的压力

### Region Server

> 主要进程，具体实现类为`HRegionServer`，通常部署在 `dataNode` 上

![image-20221215102036139](./Hbase.assets/image-20221215102036139.png)

#### MemStore

> 写入缓存，由于HFile中的数据要求为有序的，所以数据时优先存储在内存MemStore中，排序完成后，达到刷写时机，才会写入到HFile中，每次刷写会形成一个新的HFile，写入到对应的文件夹store中

#### WAL

> 由于数据在MemStore中，需要存储一段时间才会持久化，为保证数据不丢失，数据会首先写入到Hdfs 路径下，在写入到MemStore中，当系统出现故障重启后，会从Hdfs路径下进行恢复

#### BlockCache

> 读缓存，每次查询的数据会缓存，方便下次的查询

### 数据写入流程

写入流程如下图所示：

![image-20221216102421800](./Hbase.assets/image-20221216102421800.png)

> 在数据写入到 `Mem Story` 后，就会跟客户端响应 `ACK`

##### MemStore flush

> 数据刷盘

- 当某个MemStore 大小达到(hbase.hregion.memstore.flush.size（默认值 128M))，其所在region的所有MemStore都会刷盘
- 当regionServer中，memStore 的总大小达到低水位线，会按照所有memeStore的大小顺序，由大到小进行刷写，直到regionServer中所有的memstore的总大小减少到这个值以下
  - regionServer中 MemStore的总大小：hbase.regionserver.global.memstore.size（默认值0.4）
  - 低水位：达到MemStore总大小的：95%，通过参数设置：hbase.regionserver.global.memstore.size.lower.limit（默认值0.95)
  - 高水位：达到MemStore的总大小，100%，会阻止往所有的MemStore中写入数据
- 时间条件，避免数据长时间处于内存中，5min刷新一次
- 当WAL文件的数据量超过`hbase.regionserver.max.logs`，也会执行刷写，直到数据量减小为 32

### 数据读取流程：

#### HFile：

> HFile 就是最终Region下存储的 store 数据，也就是要读取查询的数据
>
> - 每个Hfile还会维护一个布隆过滤器，get 查询的时候可以判断某个RowKey是否存储在当前File下
>
> 可以通过下面命令查看HDFS 上存储的 Hfile的具体信息
>
> ```shell
> # ./bin/hbase hfile -m -f /hbase/data/{namespace}/{table}/{regionId}/{列族}/{HFile文件名称}
> ./bin/hbase hfile -m -f /adt_hbase/data/default/dmp_install_202211/1f972f37d3a24c96e3bb8840b5ca0943/campaign/fb7293e3b3294a2eb3f207f7c8bc32e4
> ```

#### 读流程

![image-20221216102443647](./Hbase.assets/image-20221216102443647.png)<u></u>

> 不管第6步是否能够读取到数据，都会进行第7步读取，因为缓存中的数据可能不是最新的，最终会将读取到的所有数据，合并版本，按照get的要求返回即可

#### 合并读取优化

每次读取数据都需要读取三个位置，最后进行版本的合并。效率会非常低，所有系统需要对此优化。

- HFile带有索引文件，读取对应的RowKey数据会比较快
- Block Cache 会缓存之前读取的内容和元数据信息，如果HFile没有发生变化(记录在HFile尾信息中)，则不需要再次读取
- HFile外面有一层布隆过滤器，能够快速判断当前RowKey的数据是否在当前文件中，不存在则不用继续读取数据

### StoreFile Compaction：

> 每次MemStore刷写，都会生成一个新的HFile，文件过多读取不方便，所以会进行文件的合并，清理掉过期和删除的数据，会进行StoreFile Compaction
>
> Compaction分为两种，分别是`Minor Compaction` 和 `Major Compaction`
>
> - **Minor Compaction** 是指选取一些小的、相邻的StoreFile将他们合并成一个更大的StoreFile，在这个过程中不会处理已经Deleted或Expired的Cell。一次Minor Compaction的结果是更少并且更大的StoreFile
> - **Major Compaction** 是指将所有的StoreFile合并成一个StoreFile，这个过程还会清理三类无意义数据：被删除的数据、TTL过期数据、版本号超过设定版本号的数据。MajorCompaction 时对系统的压力还是很大的，所以建议关闭自动MajorCompaction，采用手动触发的方式，定期进行 MajorCompaction

![image-20221215120226253](./Hbase.assets/image-20221215120226253.png)

### Region Split

>每个region都是有 `startRowKey`  和 `endRowKey` ，插入数据时，根据当前数据的rowKey，找到负责管理的region
>
>Region切分规则
>
>- 自定义分区
>  - 可以将数据所要投放的分区提前大致的规划好，以提高HBase的性能，类似HashMap提前指定大小，防止扩容带来的性能问题
>- 系统默认的切分规则，避免单个Region的数据量过大

#### 自定义分区

```shell
# splits 
# create 'ns1:t1', 'f1', SPLITS => ['10', '20', '30', '40']
create 'score','info',SPLITS=> ['10', '20', '30', '40']
```

![image-20221216101710212](./Hbase.assets/image-20221216101710212.png)

#### 系统拆分

> Region的拆分是由HRegionServer完成的
>
> 2.0版本之后 => SteppingSplitPolicy
>
> - 如果当前RegionServer上该表只有1个Region，则按照阈值为 2 * `hbase.hregion.memstore.flush.size(128M)`分裂，否则按照 `hbase.hregion.max.filesize(10G)`分裂



## 优化使用

### RowKey设计

> - 数据存储于哪个分区，取决于rowkey处于哪个region的分区范围内，所以rowkey的设计，目的也是为了让数据均匀的分布在不同的region上，一定程度上防止数据倾斜
> - hbase的查询，必须依赖rowKey，所以好的rowkey设计，可以在查询时，扫描更小的数据范围，效率更高

#### 常用的设计方式

- 生成随机数、hash、散列值
- 时间戳反转（默认rowKey按正序排列，但实际中最新的数据是会频繁读写查询的）
- 字符串拼接

### Demo

> 有以下用户数据：如何设计rowKey，可以方便的实现需求的快速查询

![image-20221216110931369](./Hbase.assets/image-20221216110931369.png)

**需求一：统计张三在2021年12月份消费的总金额**

```properties
# rowKey：格式：user + date => zhangsan2022-01-04 09:08:00
# 日期的月份日期的下一位为：-，startRow 闭区间，stopRow为开区间，所以找到ascii中，「-」的下一位「.」
scan 'order',{STARTROW=>'zhangsan2021-12',STOPROW=>'zhangsan2021-12.'}

```

![image-20221216114414110](./Hbase.assets/image-20221216114414110.png)

**需求2：统计所有人在2021年12月份消费的总金额**

```properties
# RowKey设计格式：date + user => 2022-01-04 09:08:00zhangsanfeng
scan 'order',{STARTROW=>'2021-12',STOPROW=>'2021-12.'}
```

**需求3：同时满足需求1+需求2的设计**

> 调整的原则：可枚举的放在前面

```properties
# RowKey设计格式：yyyyMM + user + dd HH:mm:ss
# 2022-01zhangsanfeng-04 09:08:00
# **需求一：统计张三在2021年12月份消费的总金额**
scan 'order',{STARTROW=>'2021-12zhangsan',STOPROW=>'2021-12zhangsan.'}
# 需求2：统计所有人在2021年12月份消费的总金额
scan 'order',{STARTROW=>'2021-12',STOPROW=>'2021-12.'}
```

### 预分区优化

> 预分区优化，同样要遵守rowKey的scan原则，rowKey的最前面部分，用作定位分区
>
> 现有系统的处理逻辑：每个月一张表，且每张表 9个分区

![image-20221216130059810](./Hbase.assets/image-20221216130059810.png)

```java
public static String buildBorderRow(Long pid, Long time, String appKey) {
  // 首位为分区号
  return  new StringBuilder( ).append( computePartitionCode(appKey) )
    .append(  formatLong( pid, PRODUCT_ID_FORMAT) )
    .append( time / 1000 ).toString();
}

private static byte computePartitionCode(String appKey) {
  // appkey 的hashCode % 分区数
  byte partition= (byte) Math.abs(appKey.hashCode() % PARTITION_NUM);
  return partition;
}
```

## 参数优化

- 超时时间
- 手动控制 major merge
- 优化 HStore 文件大小
- 优化HBase客户端缓存
  - 默认：2M
- 指定scan.next 扫描Hbase所获取的行数
  - 默认int的maxValue （21亿）
- RegionServer中的读写缓存 0.4
- lars Hofhansl （拉斯·霍夫汉斯）推荐：region设置为20G，刷写大小设置为128M（默认如此），其他默认

## JVM调优

> 防患于未然，早洗澡轻松

- 设置CMS收集器（并发垃圾回收）
- 保证新生代尽量小，尽早开启GC
  - 70%回收
  - 减小新生代大小
- 清理的都是读缓存

## Hbase使用经验法则

- Region大小控制 10 - 50G，默认10G
- cell大小不要超过 100K，某则切换为mob类型
- 1张表，有1~3个列族，不要设计太多，最好就1个，如果使用多个，尽量保证不会同事读取多个列族
- 1到2个列族的表格，设计 10~100个Region
  - 每个region都有自己的写缓存
- 列族的名称尽量短，不用模仿RDBMS数据库
- 如果RowKey设计，时间在最前面，会导致有大量的旧数据存储在不活跃的Region中，使用的时候，仅仅会操作少数的活动Region，建议增加更多的Region个数
- 如果只有一个列族用于写入数据，分配内存资源的时候可以做出调整，即写缓存不会占用太多的内存

## Phoenix简介

> 是HBase的开源SQL提供，可以使用标准的JDBC API 代替HBase客户端API来创建表，插入数据和查询Hbase数据

### 为什么使用？

> 不会减慢速度，而且会对sql有大量的优化手段

### 安装部署

> phoenix.apache.org

### 已有表，创建映射

> Create table ...
>
> create view ....

### 数字存储到额问题

> 存在的问题

JDBC-API连接

> Java 代码连接

### 二级索引：

#### 全局索引

#### 本地索引

## 集成Hive