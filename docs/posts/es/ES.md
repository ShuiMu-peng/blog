---
title: 'ElasticSearch'
date: 2021-08-20
author: "shuiMu"
categories: 
  - 技术
tags:
  - elasticSearch
---
## docker 启动安装

```shell
# es 单机启动 
docker run --name es -p 9200:9200 -p 9300:9300 \
-e discovery.type=single-node \
-e ES_JAVA_OPTS="-Xms256m -Xmx256m" \
-d elasticsearch:7.16.2 \
-v /Users/lipeng/docker/elasticsearch/plugins:/usr/share/elasticsearch/plugins \

# kibana 启动
docker run --name kibana -e ELASTICSEARCH_HOSTS=http://localhost:9200 -p 5601:5601 \
-d kibana:7.16.2
```

### docker-compose.yaml

```yaml
version: '3.1'
services:
  es:
    image: elasticsearch:7.16.2
    container_name: es
    ports:
      - 9200:9200
      - 9300:9300
    volumes:
       - /Users/lipeng/docker/elasticsearch/plugins:/usr/share/elasticsearch/plugins
       - /Users/lipeng/docker/elasticsearch/data:/usr/share/elasticsearch/data
    environment:
      - "ES_JAVA_OPTS=-Xms256m -Xmx256m"
      - discovery.type=single-node
    networks:
      es:
        aliases:
          - es
  kibana:
    image: kibana:7.16.2
    container_name: kibana
    ports:
      - 5601:5601
    environment:
      - I18N_LOCALE=zh-CN
      - ELASTICSEARCH_HOSTS=http://es:9200
    networks:
      es:
        aliases:
          - kibana
networks:
  es:
    name: es
    driver: bridge
```



## 集群维护

```properties
# 优雅停止 es 服务
kill -SIGTERM pid
# 查看集群中索引的状态，可查看到 yello 状态的索引
http://10.8.128.40:9200/_cluster/health?level=indices
# 具体到分片
http://10.8.128.40:9200/_cluster/health?level=shards
# 整个集群所处于的状态
http://10.8.128.40:9200/_cluster/health
# 查找到未分配的索引分片信息
http://10.8.128.40:9200/_cluster/allocation/explain
# 索引设置
http://10.8.128.40:9200/adtracking_collector_v1_20220806/_settings

```



## 常用命令

```shell
# 创建指定分片数量、副本数量的索引
PUT /job_idx_shard_temp
{
    "mappings": {
        "properties": {
            "id": {
                "type": "long",
                "store": true
            },
            "area": {
                "type": "keyword",
                "store": true
            },
            "exp": {
                "type": "keyword",
                "store": true
            },
            "edu": {
                "type": "keyword",
                "store": true
            },
            "salary": {
                "type": "keyword",
                "store": true
            },
            "job_type": {
                "type": "keyword",
                "store": true
            },
            "cmp": {
                "type": "keyword",
                "store": true
            },
            "pv": {
                "type": "keyword",
                "store": true
            },
            "title": {
                "type": "text",
                "store": true
            },
            "jd": {
                "type": "text"
            }
        }
    },
    "settings": {
        "number_of_shards": 3,
        "number_of_replicas": 2
    }
}

# 查看分片、主分片、副本分片
GET /_cat/indices?v


# 分词测试
POST _analyze
{
"analyzer":"standard",
"text":"我爱你中国"
}

POST _analyze
{
"analyzer": "ik_smart",
"text": "中华人民共和国"
}

# 最大粒度分词
POST _analyze
{
"analyzer":"ik_max_word",
"text":"我爱你中国"
}

# 创建索引，并指定 默认分词器
PUT /idx
{
    "settings": {
        "index": {
            "analysis.analyzer.default.type": "ik_max_word"
        }
    }
}

# 查询索引
GET /idx

# 删除索引
DELETE /idx

# 插入数据
POST /idx/_doc
{
    "name": "张三",
    "sex": 1,
    "age": 25,
    "address": "广州天河公园",
    "remark": "java developer"
}

POST /idx/_doc
{
    "name": "李四",
    "sex": 1,
    "age": 28,
    "address": "广州荔湾大厦",
    "remark": "java assistant"
}

POST /idx/_doc/1
{
    "name": "阿飞",
    "sex": 0,
    "age": 26,
    "address": "广州白云山公园",
    "remark": "php developer"
}

# 查询文档
GET /idx/_search

# 查询文档
GET /idx/_doc/1

# 修改数据
PUT /idx/_doc/1
{
    "name": "阿飞",
    "sex": 0,
    "age": 26,
    "address": "广州白云山公园",
    "remark": "php developer"
}

# 修改数据，注意 更新所有字段
POST /idx/_doc/1
{
    "age": 30
}

# 删除文档
DELETE /idx/_doc/1

# 查询
GET /idx/_mget
{
    "docs": [
        {
            "_id": "PTy1bX4BTvAIMsNa4RPO"
        },
        {
            "_id": "Pjy2bX4BTvAIMsNa4xNN"
        }
    ]
}

# 批量操作 创建
POST _bulk
{"create":{"_index":"idx", "_type":"_doc", "_id":3}}
{"id":3,"title":"白起老师1","content":"白起老师666","tags":["java", "面向对象"],"create_time":1554015482530}
{"create":{"_index":"idx", "_type":"_doc", "_id":4}}
{"id":4,"title":"白起老师2","content":"白起老师NB","tags":["java", "面向对象"],"create_time":1554015482530}

# 批量操作 全量替换
POST _bulk
{"index":{"_index":"idx", "_type":"_doc", "_id":3}}
{"id":3,"title":"图灵徐庶老师(一)","content":"图灵学院徐庶老师666","tags":["java", "面向对象"],"create_time":1554015482530}
{"index":{"_index":"idx", "_type":"_doc", "_id":4}}
{"id":4,"title":"图灵诸葛老师(二)"}

# 批量操作 修改匹配到的字段
POST _bulk
{"update":{"_index":"idx", "_type":"_doc", "_id":3}}
{"doc":{"title":"ES大法必修内功"}}

# 批量操作 删除
POST _bulk 
{"delete":{"_index":"article", "_type":"_doc", "_id":3}}
{"delete":{"_index":"article", "_type":"_doc", "_id":4}}

# 无条件查询
GET /idx/_search
{
    "query": {
        "match_all": {}
    }
}

# 关键词分词查询
GET /idx/_search
{
    "query": {
        "match": {
            "address": "广州大厦"
        }
    }
}

# 前缀匹配查询
GET /idx/_search
{
    "query": {
        "prefix": {
            "address": "广州"
        }
    }
}

# 精准匹配查询
GET /idx/_search
{
    "query": {
        "term": {
            "address": "广州大厦"
        }
    }
}

# 字段存在查询
GET /idx/_search
{
    "query": {
        "exists": {
            "field": "address"
        }
    }
}

# 组合查询
POST /idx/_search
{
    "from": 0,
    "size": 2, 
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "address": "广州"
                    }
                },
                {
                    "exists": {
                        "field": "name"
                    }
                }
            ]
        }
    }
}

# 多字段模糊 包含一个
POST /idx/_search
{
    "query": {
        "multi_match": {
            "query": "张三",
            "fields": [
                "address", 
                "name"
            ]
        }
    }
}

# 不指定字段，匹配，还可以切换为and
POST /idx/_search
{
    "query": {
        "query_string": {
            "query": "张三 OR 李四"
        }
    }
}

# 指定字段匹配
POST /idx/_search
{
    "query": {
        "query_string": {
            "query": "admin OR 长沙",
            "fields": [
                "name",
                "address"
            ]
        }
    }
}

# 综合查询，排序、分页、指定返回字段
POST /idx/_search
{
    "query": {
        "range": {
            "age": {
                "gte": 25,
                "lte": 28
            }
        }
    },
    "from": 0,
    "size": 2,
    "_source": [
        "name",
        "age",
        "book"
    ],
    "sort": {
        "age": "desc"
    }
}

# filter 查询，不打分，缓存，效率更高
POST /idx/_search
{
    "query": {
        "bool": {
            "filter": {
                "term": {
                    "age": 25
                }
            }
        }
    }
}

# 乐观锁机制
POST /es_sc/_search
DELETE /es_sc
POST /es_sc/_doc/1
{
  "id": 1,
  "name": "图灵学院",
  "desc": "图灵学院白起老师",
  "create_date": "2021-02-24"
}

POST /es_sc/_update/1
{
  "doc": {
    "name": "图灵教育666"
  }
}


POST /es_sc/_update/1/?if_seq_no=1&if_primary_term=1
{
  "doc": {
  	"name": "图灵学院1"
  }    
}

POST /es_sc/_update/1/?if_seq_no=1&if_primary_term=1
{
  "doc": {
  	"name": "图灵学院2"
  }    
}


# 精准查询，控制 必须同时包含两个词
GET /idx/_search
{
  "query": {
    "match": {
      "remark": {
        "query": "java abc",
        "operator": "and"
      }
    }
  }
}


```

## 概念

**3.1  索引 index**

 一个索引就是一个拥有几分相似特征的文档的集合。比如说，可以有一个客户数据的索引，另一个产品目录的索引，还有一个订单数据的索引

 一个索引由一个名字来标识（必须全部是小写字母的），并且当我们要对对应于这个索引中的文档进行索引、搜索、更新和删除的时候，都要使用到这个名字

 

**3.2  映射 mapping**

 **ElasticSearch中的映射（Mapping）用来定义一个文档**

 mapping是处理数据的方式和规则方面做一些限制，如某个字段的数据类型、默认值、分词器、是否被索引等等，这些都是映射里面可以设置的

**3.3  字段Field**

相当于是数据表的字段|列

**3.4  字段类型 Type**

每一个字段都应该有一个对应的类型，例如：Text、Keyword、Byte等

**3.5  文档 document**

一个文档是一个可被索引的基础信息单元，类似一条记录。文档以JSON（Javascript Object Notation）格式来表示；

**3.6  集群 cluster**

一个集群就是由一个或多个节点组织在一起，它们共同持有整个的数据，并一起提供索引和搜索功能

**3.7  节点 node**

一个节点是集群中的一个服务器，作为集群的一部分，它存储数据，参与集群的索引和搜索功能

 一个节点可以通过配置集群名称的方式来加入一个指定的集群。默认情况下，每个节点都会被安排加入到一个叫做“elasticsearch”的集群中

这意味着，如果在网络中启动了若干个节点，并假定它们能够相互发现彼此，它们将会自动地形成并加入到一个叫做“elasticsearch”的集群中

 在一个集群里，可以拥有任意多个节点。而且，如果当前网络中没有运行任何Elasticsearch节点，这时启动一个节点，会默认创建并加入一个叫做“elasticsearch”的集群。

**3.8  分片和副本 shards&replicas**

**3.8.1  分片**

- 一个索引可以存储超出单个结点硬件限制的大量数据。比如，一个具有10亿文档的索引占据1TB的磁盘空间，而任一节点都没有这样大的磁盘空间；或者单个节点处理搜索请求，响应太慢

- 为了解决这个问题，Elasticsearch提供了将索引划分成多份的能力，这些份就叫做分片

- 当创建一个索引的时候，可以指定你想要的分片的数量

- 每个分片本身也是一个功能完善并且独立的“索引”，这个“索引”可以被放置到集群中的任何节点上

- 分片很重要，主要有两方面的原因

​        允许水平分割/扩展你的内容容量

​         允许在分片之上进行分布式的、并行的操作，进而提高性能/吞吐量

- 至于一个分片怎样分布，它的文档怎样聚合回搜索请求，是完全由Elasticsearch管理的，对于作为用户来说，这些都是透明的

**3.8.2  副本**

- 在一个网络/云的环境里，失败随时都可能发生，在某个分片/节点不知怎么的就处于离线状态，或者由于任何原因消失了，这种情况下，有一个故障转移机制是非常有用并且是强烈推荐的。为此目的，Elasticsearch允许你创建分片的一份或多份拷贝，这些拷贝叫做副本分片，或者直接叫副本

- 副本之所以重要，有两个主要原因

​             (1)  在分片/节点失败的情况下，提供了高可用性。

​                   注意到复制分片从不与原/主要（original/primary）分片置于同一节点上是非常重要的

​             (2)  扩展搜索量/吞吐量，因为搜索可以在所有的副本上并行运行

​                  每个索引可以被分成多个分片。一个索引有0个或者多个副本

​                  一旦设置了副本，每个索引就有了主分片和副本分片，分片和副本的数量可以在索引

​                 创建的时候指定

​                在索引创建之后，可以在任何时候动态地改变副本的数量，但是不能改变分片的数量

## 查询方法

**3.1 叶子条件查询(单字段查询条件)**

**3.1.1 模糊匹配**

模糊匹配主要是针对文本类型的字段，文本类型的字段会对内容进行分词，对查询时，也会对搜索条件进行分词，然后通过倒排索引查找到匹配的数据，模糊匹配主要通过match等参数来实现

- match : 通过match关键词模糊匹配条件内容
  - multi_match：多字段模糊包含一个即可
- prefix : 前缀匹配
- regexp : 通过正则表达式来匹配数据

### **match的复杂用法**

match条件还支持以下参数：

- query : 指定匹配的值
- operator : 匹配条件类型
- - and : 条件分词后都要匹配
  - or : 条件分词后有一个匹配即可(默认)
- minmum_should_match : 指定最小匹配的数量

```json
# 精准查询，控制 必须同时包含两个词
GET /idx/_search
{
  "query": {
    "match": {
      "remark": {
        "query": "java abc",
        "operator": "and",
        "minmum_should_match":2 //指定百分比 或 匹配数量
      }
    }
  }
}
# 类似于下面效果
GET /idx/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "remark": "java"
          }
        },
        {
          "match": {
            "remark": "abc"
          }
        }
      ],
      "minimum_should_match": 2
    }
  }
}
```

### match 的底层转换

```shell
GET /es_db/_search
{
"query": {
"match": {
"remark": "java developer"
}
}
}

# 转换后

{
    "query": {
        "bool": {
            "should": [
                {
                    "term": {
                        "remark": "java"
                    }
                },
                {
                    "term": {
                        "remark": {
                            "value": "developer"
                        }
                    }
                }
            ]
        }
    }
}
=======================================
GET /es_db/_search
{
"query": {
"match": {
"remark": {
"query": "java developer",
"operator": "and"
}
}
}
}

转换后是：
GET /es_db/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "term": {
                        "remark": "java"
                    }
                },
                {
                    "term": {
                        "remark": {
                            "value": "developer"
                        }
                    }
                }
            ]
        }
    }
}


GET /es_db/_search
{
"query": {
"match": {
"remark": {
"query": "java architect assistant",
"minimum_should_match": "68%"
}
}
}
}

转换后为：
GET /es_db/_search
{
    "query": {
        "bool": {
            "should": [
                {
                    "term": {
                        "remark": "java"
                    }
                },
                {
                    "term": {
                        "remark": "architect"
                    }
                },
                {
                    "term": {
                        "remark": "assistant"
                    }
                }
            ],
            "minimum_should_match": 2
        }
    }
}
```



### **精确匹配**

- term : 单个条件相等
- terms : 单个字段属于某个值数组内的值
- range : 字段属于某个范围内的值
- exists : 某个字段的值是否存在
- ids : 通过ID批量查询

**3.2 组合条件查询(多条件查询)**

组合条件查询是将叶子条件查询语句进行组合而形成的一个完整的查询条件

- bool : 各条件之间有and,or或not的关系

- - must : 各个条件都必须满足，即各条件是and的关系
  - should : 各个条件有一个满足即可，即各条件是or的关系
  - must_not : 不满足所有条件，即各条件是not的关系
  - filter : 不计算相关度评分，它不计算_score即相关度评分，效率更高

- constant_score : 不计算相关度评分

**must/filter/shoud/must_not** 等的子条件是通过 **term/terms/range/ids/exists/match** 等叶子条件为参数的

注：以上参数，当只有一个搜索条件时，must等对应的是一个对象，当是多个条件时，对应的是一个数组

```shell
GET /idx/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "remark": "java"
          }
        },
        {
          "match": {
            "remark": "abc"
          }
        }
      ],
      "minimum_should_match": 2
    }
  }
}
```

### **boost权重控制**

搜索document中remark字段中包含java的数据，如果remark中包含developer或architect，则包含architect的document优先显示。（就是将architect数据匹配时的相关度分数增加）。

一般用于搜索时相关度排序使用。如：电商中的综合排序。将一个商品的销量，广告投放，评价值，库存，单价比较综合排序。在上述的排序元素中，广告投放权重最高，库存权重最低。

```shel
GET /es_db/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "remark": "java"
                    }
                }
            ],
            "should": [
                {
                    "match": {
                        "remark": {
                            "query": "developer",
                            "boost": 1
                        }
                    }
                },
                {
                    "match": {
                        "remark": {
                            "query": "architect",
                            "boost": 3
                        }
                    }
                }
            ]
        }
    }
}
```

### dis_max

**基于dis_max实现best fields策略进行多字段搜索**

best fields策略： 搜索的document中的某一个field，尽可能多的匹配搜索条件。与之相反的是，尽可能多的字段匹配到搜索条件（most fields策略）。如百度搜索使用这种策略。

**优点：精确匹配的数据可以尽可能的排列在最前端，且可以通过minimum_should_match来去除长尾数据，避免长尾数据字段对排序结果的影响。**

​              长尾数据比如说我们搜索4个关键词，但很多文档只匹配1个，也显示出来了，这些文档其实不是我们想要的

**缺点：相对排序不均匀。**

**dis_max语法： 直接获取搜索的多条件中的，单条件query相关度分数最高的数据，以这个数据做相关度排序。**

> 下述的案例中，就是找name字段中rod匹配相关度分数或remark字段中java developer匹配相关度分数，哪个高，就使用哪一个相关度分数进行结果排序。

```shell
GET /es_db/_search
{
    "query": {
        "dis_max": {
            "queries": [
                {
                    "match": {
                        "name": "rod"
                    }
                },
                {
                    "match": {
                        "remark": "java developer"
                    }
                }
            ]
        }
    }
}
```

**基于tie_breaker参数优化dis_max搜索效果**

dis_max是将多个搜索query条件中相关度分数最高的用于结果排序，忽略其他query分数，在某些情况下，可能还需要其他query条件中的相关度介入最终的结果排序，这个时候可以使用tie_breaker参数来优化dis_max搜索。tie_breaker参数代表的含义是：将其他query搜索条件的相关度分数乘以参数值，再参与到结果排序中。如果不定义此参数，相当于参数值为0。所以其他query条件的相关度分数被忽略。

```shell
GET /es_db/_search
{
    "query": {
        "dis_max": {
            "queries": [
                {
                    "match": {
                        "name": "rod"
                    }
                },
                {
                    "match": {
                        "remark": "java developer"
                    }
                }
            ],
            "tie_breaker": 0.5
        }
    }
}
```

**5.6、使用multi_match简化dis_max+tie_breaker**

ES中相同结果的搜索也可以使用不同的语法语句来实现。不需要特别关注，只要能够实现搜索，就是完成任务！

```shell
GET /es_db/_search
{
    "query": {
        "dis_max": {
            "queries": [
                {
                    "match": {
                        "name": "rod"
                    }
                },
                {
                    "match": {
                        "remark": {
                            "query": "java developer",
                            "boost": 2,
                            "minimum_should_match": 2
                        }
                    }
                }
            ],
            "tie_breaker": 0.5
        }
    }
}

#使用multi_match语法为：其中type常用的有best_fields和most_fields。^n代表权重，相当于"boost":n。
GET /es_db/_search
{
    "query": {
        "multi_match": {
            "query": "rod java developer",
            "fields": [
                "name",
                "remark^2"
            ],
            "type": "best_fields",
            "tie_breaker": 0.5,
            "minimum_should_match": "50%"
        }
    }
}
```



### **cross fields搜索**

> 多个字段结果，自动拼接到 某个字段中，类似etl处理
>
> cross fields ： 一个唯一的标识，分部在多个fields中，使用这种唯一标识搜索数据就称为cross fields搜索。如：人名可以分为姓和名，地址可以分为省、市、区县、街道等。那么使用人名或地址来搜索document，就称为cross fields搜索。
>
> 实现这种搜索，一般都是使用most fields搜索策略。因为这就不是一个field的问题。
>
> Cross fields搜索策略，是从多个字段中搜索条件数据。默认情况下，和most fields搜索的逻辑是一致的，计算相关度分数是和best fields策略一致的。一般来说，如果使用cross fields搜索策略，那么都会携带一个额外的参数operator。用来标记搜索条件如何在多个字段中匹配。
>
> 当然，在ES中也有cross fields搜索策略。具体语法如下：

```shell
GET /es_db/_search
{
"query": {
"multi_match": {
"query": "java developer",
"fields": ["name", "remark"],
"type": "cross_fields",
"operator" : "and"
}
}
}
```



### **match phrase**

>短语搜索。就是搜索条件不分词。代表搜索条件不可分割。
>
>如果hello world是一个不可分割的短语，我们可以使用前文学过的短语搜索match phrase来实现。语法如下：

**slop:**

可移动分词数量

```shell
GET _search
{
    "query": {
        "match_phrase": {
            "remark": "java assistant"
        }
    }
}

GET /idx/_search
{
    "query": {
        "match_phrase": {
          "remark": {
            "query": "java like",
            "slop": 2
          }
        }
    }
}
```

### **经验分享**

使用match和proximity search实现召回率和精准度平衡。

召回率：召回率就是搜索结果比率，如：索引A中有100个document，搜索时返回多少个document，就是召回率（recall）。

精准度：就是搜索结果的准确率，如：搜索条件为hello java，在搜索结果中尽可能让短语匹配和hello java离的近的结果排序靠前，就是精准度（precision）。

如果在搜索的时候，只使用match phrase语法，会导致召回率底下，因为搜索结果中必须包含短语（包括proximity search）。

如果在搜索的时候，只使用match语法，会导致精准度底下，因为搜索结果排序是根据相关度分数算法计算得到。

那么如果需要在结果中兼顾召回率和精准度的时候，就需要将match和proximity search混合使用，来得到搜索结果。

测试案例：

### 连接查询(多文档合并查询)

- 父子文档查询：parent/child
- 嵌套文档查询: nested

3.4 DSL查询语言中存在两种：查询DSL（query DSL）和过滤DSL（filter DSL）

它们两个的区别如下图：

​    ![0](https://note.youdao.com/yws/public/resource/7fffae927f3bc06aab2fdc663ec5cad3/xmlnote/8D3E163FE35B4B13BA19196C26AF8027/3368)

**query DSL**

在查询上下文中，查询会回答这个问题——“这个文档匹不匹配这个查询，它的相关度高么？”

如何验证匹配很好理解，如何计算相关度呢？ES中索引的数据都会存储一个_score分值，分值越高就代表越匹配。另外关于某个搜索的分值计算还是很复杂的，因此也需要一定的时间。

 

**filter DSL**

在过滤器上下文中，查询会回答这个问题——“这个文档匹不匹配？”

答案很简单，是或者不是。它不会去计算任何分值，也不会关心返回的排序问题，因此效率会高一点。

过滤上下文 是在使用filter参数时候的执行环境，比如在bool查询中使用must_not或者filter

另外，经常使用过滤器，ES会自动的缓存过滤器的内容，这对于查询来说，会提高很多性能。

一些过滤的情况：

​	

**3.5 Query方式查询:案例**

- 根据名称精确查询姓名 term, term查询不会对字段进行分词查询，会采用精确匹配 

  注意: 采用term精确查询, 查询字段映射类型属于为keyword.

**总结:**

**1. match**

match：模糊匹配，需要指定字段名，但是输入会进行分词，比如"hello world"会进行拆分为hello和world，然后匹配，如果字段中包含hello或者world，或者都包含的结果都会被查询出来，也就是说match是一个部分匹配的模糊查询。查询条件相对来说比较宽松。

**2. term**

term:  这种查询和match在有些时候是等价的，比如我们查询单个的词hello，那么会和match查询结果一样，但是如果查询"hello world"，结果就相差很大，因为这个输入不会进行分词，就是说查询的时候，是查询字段分词结果中是否有"hello world"的字样，而不是查询字段中包含"hello world"的字样。当保存数据"hello world"时，elasticsearch会对字段内容进行分词，"hello world"会被分成hello和world，不存在"hello world"，因此这里的查询结果会为空。这也是term查询和match的区别。

**3. match_phase**

match_phase：会对输入做分词，但是需要结果中也包含所有的分词，而且顺序要求一样。以"hello world"为例，要求结果中必须包含hello和world，而且还要求他们是连着的，顺序也是固定的，hello that world不满足，world hello也不满足条件。

**4. query_string**

query_string：和match类似，但是match需要指定字段名，query_string是在所有字段中搜索，范围更广泛。

## **文档映射** 

1.ES中映射可以分为动态映射和静态映射

动态映射： 

在关系数据库中，需要事先创建数据库，然后在该数据库下创建数据表，并创建表字段、类型、长度、主键等，最后才能基于表插入数据。而Elasticsearch中不需要定义Mapping映射（即关系型数据库的表、字段等），在文档写入Elasticsearch时，会根据文档字段自动识别类型，这种机制称之为动态映射。

动态映射规则如下：

​    ![0](https://note.youdao.com/yws/public/resource/7fffae927f3bc06aab2fdc663ec5cad3/xmlnote/WEBRESOURCE5476d97139ea4a7c20bdb4e913fa508c/3228)

 静态映射： 

 静态映射是在Elasticsearch中也可以事先定义好映射，包含文档的各字段类型、分词器等，这种方式称之为静态映射。

2 动态映射

```json
// 自动创建映射结构
PUT /idx/_doc/1
{
    "name": "Jack",
    "sex": 1,
    "age": 25,
    "book": "java入门至精通",
    "address": "广州小蛮腰"
}
```

获取映射结构：

```shell
GET /idx/_mapping			
```

静态映射

```shell
# 设置 索引结构
PUT /es_db
{
    "mappings": {
        "properties": {
            "name": {
                "type": "keyword",
                "index": true, // 是否分词
                "store": true // 是否存储此字段值
            },
            "sex": {
                "type": "integer",
                "index": true,
                "store": true
            },
            "age": {
                "type": "integer",
                "index": true,
                "store": true
            },
            "book": {
                "type": "text",
                "index": true,
                "store": true,
                "analyzer": "ik_smart",  // 存储分词器
                "search_analyzer": "ik_smart" // 查询分词器
            },
            "address": {
                "type": "text",
                "index": true,
                "store": true
            }
        }
    }
}
```



## **核心类型（Core datatype）**

字符串：string，string类型包含 text 和 keyword。

text：该类型被用来索引长文本，在创建索引前会将这些文本进行分词，转化为词的组合，建立索引；允许es来检索这些词，text类型不能用来排序和聚合。

keyword：该类型不能分词，可以被用来检索过滤、排序和聚合，keyword类型不可用text进行分词模糊检索。

数值型：long、integer、short、byte、double、float

日期型：date

布尔型：boolean

## 索引重建

>对已存在的mapping映射进行修改
>具体方法
>1）如果要推倒现有的映射, 你得重新建立一个静态索引		
>2）然后把之前索引里的数据导入到新的索引里		
>3）删除原创建的索引		
>4）为新索引起个别名, 为原索引名	

```shell
# 设置 索引结构
PUT /idx2
{
    "mappings": {
        "properties": {
            "name": {
                "type": "keyword",
                "index": true, // 是否分词
                "store": true // 是否存储此字段值
            },
            "sex": {
                "type": "integer",
                "index": true,
                "store": true
            },
            "age": {
                "type": "integer",
                "index": true,
                "store": tr
            },
            "book": {
                "type": "text",
                "index": true,
                "store": true,
                "analyzer": "ik_smart",  // 存储分词器
                "search_analyzer": "ik_smart" // 查询分词器
            },
            "address": {
                "type": "text",
                "index": true,
                "store": true
            }
        }
    }
}

# 数据迁移到新的索引库中
POST _reindex
{
    "source": {
        "index": "idx"
    },
    "dest": {
        "index": "idx2"
    }
}

DELETE /idx
# 起别名
PUT /db_index_2/_alias/db_index
```

## 工作流程

存储原理

> 1. `client`选择某个节点，发送存储数据的请求，此时被选择节点，作为`coordinating node`协调节点
>
> 2. 协调节点  计算要存储的分片id，再找到该分片 `primary shard`主分片所在的节点，转发请求
>
>    shard = hash(routing) % number_of_primary_shards
>    routing 是一个可变值，默认是文档的 _id
>
> 3. `primary shard`接收请求，写入数据到索引库中，并将数据同步到`replica shard`副本分片
>
> 4. 主分片、副本分片都保存成功后，响应客户端

![image-20220120083350759](ES.assets/image-20220120083350759.png)

查询原理

> 1. `client`发送请求给随机节点，此节点将作为`coordinating node`协调节点，接收到请求
> 2. 协调节点将查询信息广播到所有节点，各个节点根据查询信息，对所包含分片信息进行查新，将满足条件的数据放到队列中，并将这些数据的文档id、分片信息、节点信息返回给协调节点
> 3. 协调节点将结果汇总，并进行全局的排序
> 4. 协调节点 根据 汇总信息，对各个数据节点发送 get 请求，获取数据，再响应给`client`

![image-20220120083647907](ES.assets/image-20220120083647907.png)

节点中写入数据

> 1. **节点接收到请求时，先写到内存中**，然后生成`segment`，并刷新到文件系统缓存中，数据可以被检索
>
>    1. 文件系统缓存每1秒刷新一次
>
> 2. **数据刷盘**
>
>    1. 每30分钟会将文件系统缓存中的数据，持久化到磁盘中
>
> 3. **translog日志：**文件系统缓存基于内存，为防止故障数据丢失， 在写入到内存中的同时，也会记录translog日志，在refresh期间出现异常，会根据translog来进行数据恢复
>
>    等到文件系统缓存中的segment数据都刷到磁盘中，清空translog文件
>
> 4. **segment合并**
>
>     Segment太多时，ES定期会将多个segment合并成为大的segment，减少索引查询时IO开销，此阶段ES会真正的物理删除（之前执行过的delete的数据）

![image-20220120084057942](ES.assets/image-20220120084057942.png)

## ik分词器

### 安装

> https://github.com/medcl/elasticsearch-analysis-ik/releases
>
> plugins 下 创建 ik目录
>
> ./plugins/ik
>
> 放到 此目录下，解压即可
>
> ```js
> // 分词测试
> POST _analyze
> {
> "analyzer": "ik_smart",
> "text": "中华人民共和国"
> }
> ```

### 热更新

> 更新 plugins 

```xml
<properties>
	<comment>IK Analyzer 扩展配置</comment>
	<!--用户可以在这里配置自己的扩展字典 -->
	<entry key="ext_dict">location</entry>
	 <!--用户可以在这里配置自己的扩展停止词字典-->
	<entry key="ext_stopwords">location</entry>
	<!--用户可以在这里配置远程扩展字典 -->
	<entry key="remote_ext_dict">words_location</entry> 
	<!--用户可以在这里配置远程扩展停止词字典-->
	<entry key="remote_ext_stopwords">words_location</entry>
</properties>
```

## 聚合查询

```json
GET /cars/_search

GET /cars/_search
{
  "size": 0, 
  "aggs": {
    // 分组结果返回名称
    "group_by_color": {
      "terms": {
        // group by 字段
        "field": "color",
        "order": {
          // 引用 aggs 中的名称
          "avg_by_price": "asc"
        }
      },
      "aggs": {
        "avg_by_price": {
          // 聚合方式
          "sum": {
            // 聚合字段
            "field": "price"
          }
        }
        ,
        // 对当前结果再次聚合，内层 名称
        "group_by_brand":{
          "terms": {
            "field": "brand",
            "order": {
              "avg_by_price": "desc"
            }
          },
          "aggs": {
            "avg_by_price": {
              "avg": {
                "field": "price"
              }
            }
          }
        }
      }
    }
  }
}

GET /cars/_search
{
  "size": 0,
  "query": {
    "match": {
      "color": "金色"
    }
  },
  "aggs": {
    "group_by_color": {
      "terms": {
        "field": "color",
        "order": {
          "max_price": "desc"
        }
      },
      "aggs": {
        "max_price": {
          "max": {
            "field": "price"
          }
        },
        "min_price": {
          "min": {
            "field": "price"
          }
        },
        "sum_price": {
          "sum": {
            "field": "price"
          }
        }
      }
    }
  }
}


GET /cars/_search
{
  "size": 4, 
  "query": {
    "match": {
      "brand": "大众"
    }
  },
  "aggs": {
    "count_last_year": {
      "filter": {
        "range": {
          "sold_date": {
            "gte": "now-12M"
          }
        }
      },
      "aggs": {
        "sum_of_price_last_year": {
          "sum": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

## javaAPI

```java
public class EsServiceImplTest {
    private final ElasticsearchClient restClient;

    public EsServiceImplTest() {
        RestClientBuilder builder = RestClient.builder(new HttpHost("127.0.0.1", 9200, "http"));
        ElasticsearchTransport transport = new RestClientTransport(builder.build(), new JacksonJsonpMapper());
        restClient = new ElasticsearchClient(transport);
    }

    @SneakyThrows
    public <T> List<T> list(String idx, Class<T> clazz) {
        SearchResponse<T> search = restClient.search(builder -> builder.index(idx).query(q -> q.matchAll(builder1 -> builder1)), clazz);
        // SearchResponse<T> search = restClient.search(s ->
        //                 s.index(idx)
        //                         .query(q ->
        //                                 q.term(t -> t.field("name")
        //                                         .value(v -> v.stringValue("Jack"))
        //                                 ))
        //         , clazz);
        return search.hits().hits().stream().map(Hit::source).collect(Collectors.toList());
    }

    @SneakyThrows
    public <T> List<T> list(String idx, Class<T> clazz, Function<Query.Builder, ObjectBuilder<Query>> fn) {
        SearchResponse<T> search = restClient.search(q -> q.index(idx).query(fn), clazz);
        return search.hits().hits().stream().map(Hit::source).collect(Collectors.toList());
    }

    @SneakyThrows
    public <T> T getById(String idx, String id, Class<T> clazz) {
        GetResponse<T> jsonGetResponse = restClient.get(builder -> builder.index(idx).id(id), clazz);
        return jsonGetResponse.source();
    }

    @SneakyThrows
    public IndexResponse insert(String idx, String id, Idx idxClass) {
        return restClient.index(a -> a.index(idx).id(id).document(idxClass));
    }

    @SneakyThrows
    public UpdateResponse<? extends Idx> update(String idx, String id, Idx idxClass) {
        return restClient.update(a -> a.index(idx).id(id).doc(idxClass), idxClass.getClass());
    }

    @Test
    public void demo() {
        // List<Idx> idx = list("idx", Idx.class);
        // idx.forEach(System.out::println);
        // System.out.println(getById("idx", "1", Idx.class));
        // System.out.println(insert("idx", "4", new Idx("山东", "百科全书", "yase", 1, 20)).result());
        // UpdateResponse<? extends Idx> update = update("idx", "4", new Idx("山东", "百科全书2", "jeff", 1, 20));
        // System.out.println(update.result());
        // List<Idx> list = list("idx", Idx.class, q -> q.term(t -> t.field("name").value(f -> f.stringValue("jeff"))));
        // List<Idx> list = list("idx", Idx.class, q -> q.match(m -> m.field("address").query(f -> f.stringValue("山东"))));
        List<Idx> list = list("idx", Idx.class, q -> q.match(new MatchQuery.Builder().field("address").query(new FieldValue.Builder().stringValue("山东").build()).build()));

        list.forEach(System.out::println);


    }

}

```

