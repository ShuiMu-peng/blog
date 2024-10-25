import{_ as n,c as a,e as p,o as l}from"./app-C7ucYrat.js";const e="/blog/ES.assets/image-20220120083350759.png",t="/blog/ES.assets/image-20220120083647907.png",i="/blog/ES.assets/image-20220120084057942.png",c={};function o(u,s){return l(),a("div",null,s[0]||(s[0]=[p(`<h2 id="docker-启动安装" tabindex="-1"><a class="header-anchor" href="#docker-启动安装"><span>docker 启动安装</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line"><span class="token comment"># es 单机启动 </span></span>
<span class="line"><span class="token function">docker</span> run <span class="token parameter variable">--name</span> es <span class="token parameter variable">-p</span> <span class="token number">9200</span>:9200 <span class="token parameter variable">-p</span> <span class="token number">9300</span>:9300 <span class="token punctuation">\\</span></span>
<span class="line"><span class="token parameter variable">-e</span> <span class="token assign-left variable">discovery.type</span><span class="token operator">=</span>single-node <span class="token punctuation">\\</span></span>
<span class="line"><span class="token parameter variable">-e</span> <span class="token assign-left variable">ES_JAVA_OPTS</span><span class="token operator">=</span><span class="token string">&quot;-Xms256m -Xmx256m&quot;</span> <span class="token punctuation">\\</span></span>
<span class="line"><span class="token parameter variable">-d</span> elasticsearch:7.16.2 <span class="token punctuation">\\</span></span>
<span class="line"><span class="token parameter variable">-v</span> /Users/lipeng/docker/elasticsearch/plugins:/usr/share/elasticsearch/plugins <span class="token punctuation">\\</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># kibana 启动</span></span>
<span class="line"><span class="token function">docker</span> run <span class="token parameter variable">--name</span> kibana <span class="token parameter variable">-e</span> <span class="token assign-left variable">ELASTICSEARCH_HOSTS</span><span class="token operator">=</span>http://localhost:9200 <span class="token parameter variable">-p</span> <span class="token number">5601</span>:5601 <span class="token punctuation">\\</span></span>
<span class="line"><span class="token parameter variable">-d</span> kibana:7.16.2</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="docker-compose-yaml" tabindex="-1"><a class="header-anchor" href="#docker-compose-yaml"><span>docker-compose.yaml</span></a></h3><div class="language-yaml line-numbers-mode" data-highlighter="prismjs" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="line"><span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token string">&#39;3.1&#39;</span></span>
<span class="line"><span class="token key atrule">services</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token key atrule">es</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> elasticsearch<span class="token punctuation">:</span>7.16.2</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> es</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> 9200<span class="token punctuation">:</span><span class="token number">9200</span></span>
<span class="line">      <span class="token punctuation">-</span> 9300<span class="token punctuation">:</span><span class="token number">9300</span></span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">       <span class="token punctuation">-</span> /Users/lipeng/docker/elasticsearch/plugins<span class="token punctuation">:</span>/usr/share/elasticsearch/plugins</span>
<span class="line">       <span class="token punctuation">-</span> /Users/lipeng/docker/elasticsearch/data<span class="token punctuation">:</span>/usr/share/elasticsearch/data</span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;ES_JAVA_OPTS=-Xms256m -Xmx256m&quot;</span></span>
<span class="line">      <span class="token punctuation">-</span> discovery.type=single<span class="token punctuation">-</span>node</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">es</span><span class="token punctuation">:</span></span>
<span class="line">        <span class="token key atrule">aliases</span><span class="token punctuation">:</span></span>
<span class="line">          <span class="token punctuation">-</span> es</span>
<span class="line">  <span class="token key atrule">kibana</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> kibana<span class="token punctuation">:</span>7.16.2</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> kibana</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> 5601<span class="token punctuation">:</span><span class="token number">5601</span></span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> I18N_LOCALE=zh<span class="token punctuation">-</span>CN</span>
<span class="line">      <span class="token punctuation">-</span> ELASTICSEARCH_HOSTS=http<span class="token punctuation">:</span>//es<span class="token punctuation">:</span><span class="token number">9200</span></span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">es</span><span class="token punctuation">:</span></span>
<span class="line">        <span class="token key atrule">aliases</span><span class="token punctuation">:</span></span>
<span class="line">          <span class="token punctuation">-</span> kibana</span>
<span class="line"><span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token key atrule">es</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">name</span><span class="token punctuation">:</span> es</span>
<span class="line">    <span class="token key atrule">driver</span><span class="token punctuation">:</span> bridge</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="集群维护" tabindex="-1"><a class="header-anchor" href="#集群维护"><span>集群维护</span></a></h2><div class="language-properties line-numbers-mode" data-highlighter="prismjs" data-ext="properties" data-title="properties"><pre class="language-properties"><code><span class="line"><span class="token comment"># 优雅停止 es 服务</span></span>
<span class="line"><span class="token key attr-name">kill</span> <span class="token value attr-value">-SIGTERM pid</span></span>
<span class="line"><span class="token comment"># 查看集群中索引的状态，可查看到 yello 状态的索引</span></span>
<span class="line"><span class="token key attr-name">http</span><span class="token punctuation">:</span><span class="token value attr-value">//10.8.128.40:9200/_cluster/health?level=indices</span></span>
<span class="line"><span class="token comment"># 具体到分片</span></span>
<span class="line"><span class="token key attr-name">http</span><span class="token punctuation">:</span><span class="token value attr-value">//10.8.128.40:9200/_cluster/health?level=shards</span></span>
<span class="line"><span class="token comment"># 整个集群所处于的状态</span></span>
<span class="line"><span class="token key attr-name">http</span><span class="token punctuation">:</span><span class="token value attr-value">//10.8.128.40:9200/_cluster/health</span></span>
<span class="line"><span class="token comment"># 查找到未分配的索引分片信息</span></span>
<span class="line"><span class="token key attr-name">http</span><span class="token punctuation">:</span><span class="token value attr-value">//10.8.128.40:9200/_cluster/allocation/explain</span></span>
<span class="line"><span class="token comment"># 索引设置</span></span>
<span class="line"><span class="token key attr-name">http</span><span class="token punctuation">:</span><span class="token value attr-value">//10.8.128.40:9200/adtracking_collector_v1_20220806/_settings</span></span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="常用命令" tabindex="-1"><a class="header-anchor" href="#常用命令"><span>常用命令</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line"><span class="token comment"># 创建指定分片数量、副本数量的索引</span></span>
<span class="line">PUT /job_idx_shard_temp</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;mappings&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;properties&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;id&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;long&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;area&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;exp&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;edu&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;salary&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;job_type&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;cmp&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;pv&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;text&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;jd&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;text&quot;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span>,</span>
<span class="line">    <span class="token string">&quot;settings&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;number_of_shards&quot;</span><span class="token builtin class-name">:</span> <span class="token number">3</span>,</span>
<span class="line">        <span class="token string">&quot;number_of_replicas&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 查看分片、主分片、副本分片</span></span>
<span class="line">GET /_cat/indices?v</span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 分词测试</span></span>
<span class="line">POST _analyze</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;analyzer&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;standard&quot;</span>,</span>
<span class="line"><span class="token string">&quot;text&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;我爱你中国&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">POST _analyze</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;analyzer&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ik_smart&quot;</span>,</span>
<span class="line"><span class="token string">&quot;text&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;中华人民共和国&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 最大粒度分词</span></span>
<span class="line">POST _analyze</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;analyzer&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;ik_max_word&quot;</span>,</span>
<span class="line"><span class="token string">&quot;text&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;我爱你中国&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 创建索引，并指定 默认分词器</span></span>
<span class="line">PUT /idx</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;settings&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;analysis.analyzer.default.type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ik_max_word&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 查询索引</span></span>
<span class="line">GET /idx</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 删除索引</span></span>
<span class="line">DELETE /idx</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 插入数据</span></span>
<span class="line">POST /idx/_doc</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张三&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,</span>
<span class="line">    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span>,</span>
<span class="line">    <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州天河公园&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">POST /idx/_doc</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;李四&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,</span>
<span class="line">    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">28</span>,</span>
<span class="line">    <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州荔湾大厦&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java assistant&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">POST /idx/_doc/1</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;阿飞&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0</span>,</span>
<span class="line">    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">26</span>,</span>
<span class="line">    <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州白云山公园&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;php developer&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 查询文档</span></span>
<span class="line">GET /idx/_search</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 查询文档</span></span>
<span class="line">GET /idx/_doc/1</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 修改数据</span></span>
<span class="line">PUT /idx/_doc/1</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;阿飞&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0</span>,</span>
<span class="line">    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">26</span>,</span>
<span class="line">    <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州白云山公园&quot;</span>,</span>
<span class="line">    <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;php developer&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 修改数据，注意 更新所有字段</span></span>
<span class="line">POST /idx/_doc/1</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">30</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 删除文档</span></span>
<span class="line">DELETE /idx/_doc/1</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 查询</span></span>
<span class="line">GET /idx/_mget</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;docs&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;PTy1bX4BTvAIMsNa4RPO&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span>,</span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;_id&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;Pjy2bX4BTvAIMsNa4xNN&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">]</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 批量操作 创建</span></span>
<span class="line">POST _bulk</span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;create&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;idx&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:3,<span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;白起老师1&quot;</span>,<span class="token string">&quot;content&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;白起老师666&quot;</span>,<span class="token string">&quot;tags&quot;</span>:<span class="token punctuation">[</span><span class="token string">&quot;java&quot;</span>, <span class="token string">&quot;面向对象&quot;</span><span class="token punctuation">]</span>,<span class="token string">&quot;create_time&quot;</span>:1554015482530<span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;create&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;idx&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:4<span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:4,<span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;白起老师2&quot;</span>,<span class="token string">&quot;content&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;白起老师NB&quot;</span>,<span class="token string">&quot;tags&quot;</span>:<span class="token punctuation">[</span><span class="token string">&quot;java&quot;</span>, <span class="token string">&quot;面向对象&quot;</span><span class="token punctuation">]</span>,<span class="token string">&quot;create_time&quot;</span>:1554015482530<span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 批量操作 全量替换</span></span>
<span class="line">POST _bulk</span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;index&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;idx&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:3,<span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;图灵徐庶老师(一)&quot;</span>,<span class="token string">&quot;content&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;图灵学院徐庶老师666&quot;</span>,<span class="token string">&quot;tags&quot;</span>:<span class="token punctuation">[</span><span class="token string">&quot;java&quot;</span>, <span class="token string">&quot;面向对象&quot;</span><span class="token punctuation">]</span>,<span class="token string">&quot;create_time&quot;</span>:1554015482530<span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;index&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;idx&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:4<span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:4,<span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;图灵诸葛老师(二)&quot;</span><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 批量操作 修改匹配到的字段</span></span>
<span class="line">POST _bulk</span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;update&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;idx&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;doc&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;title&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;ES大法必修内功&quot;</span><span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 批量操作 删除</span></span>
<span class="line">POST _bulk </span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;delete&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:3<span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">{</span><span class="token string">&quot;delete&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;_index&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;article&quot;</span>, <span class="token string">&quot;_type&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;_doc&quot;</span>, <span class="token string">&quot;_id&quot;</span>:4<span class="token punctuation">}</span><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 无条件查询</span></span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;match_all&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 关键词分词查询</span></span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州大厦&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 前缀匹配查询</span></span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;prefix&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 精准匹配查询</span></span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州大厦&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 字段存在查询</span></span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;exists&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;field&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;address&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 组合查询</span></span>
<span class="line">POST /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;from&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0</span>,</span>
<span class="line">    <span class="token string">&quot;size&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span>, </span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;must&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;广州&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;exists&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;field&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;name&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">]</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 多字段模糊 包含一个</span></span>
<span class="line">POST /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;multi_match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张三&quot;</span>,</span>
<span class="line">            <span class="token string">&quot;fields&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token string">&quot;address&quot;</span>, </span>
<span class="line">                <span class="token string">&quot;name&quot;</span></span>
<span class="line">            <span class="token punctuation">]</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 不指定字段，匹配，还可以切换为and</span></span>
<span class="line">POST /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;query_string&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;张三 OR 李四&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 指定字段匹配</span></span>
<span class="line">POST /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;query_string&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;admin OR 长沙&quot;</span>,</span>
<span class="line">            <span class="token string">&quot;fields&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token string">&quot;name&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;address&quot;</span></span>
<span class="line">            <span class="token punctuation">]</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 综合查询，排序、分页、指定返回字段</span></span>
<span class="line">POST /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;range&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;gte&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span>,</span>
<span class="line">                <span class="token string">&quot;lte&quot;</span><span class="token builtin class-name">:</span> <span class="token number">28</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span>,</span>
<span class="line">    <span class="token string">&quot;from&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0</span>,</span>
<span class="line">    <span class="token string">&quot;size&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span>,</span>
<span class="line">    <span class="token string">&quot;_source&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">        <span class="token string">&quot;name&quot;</span>,</span>
<span class="line">        <span class="token string">&quot;age&quot;</span>,</span>
<span class="line">        <span class="token string">&quot;book&quot;</span></span>
<span class="line">    <span class="token punctuation">]</span>,</span>
<span class="line">    <span class="token string">&quot;sort&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;desc&quot;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># filter 查询，不打分，缓存，效率更高</span></span>
<span class="line">POST /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;filter&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 乐观锁机制</span></span>
<span class="line">POST /es_sc/_search</span>
<span class="line">DELETE /es_sc</span>
<span class="line">POST /es_sc/_doc/1</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token string">&quot;id&quot;</span><span class="token builtin class-name">:</span> <span class="token number">1</span>,</span>
<span class="line">  <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;图灵学院&quot;</span>,</span>
<span class="line">  <span class="token string">&quot;desc&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;图灵学院白起老师&quot;</span>,</span>
<span class="line">  <span class="token string">&quot;create_date&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;2021-02-24&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">POST /es_sc/_update/1</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token string">&quot;doc&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;图灵教育666&quot;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">POST /es_sc/_update/1/?if_seq_no<span class="token operator">=</span><span class="token number">1</span><span class="token operator">&amp;</span><span class="token assign-left variable">if_primary_term</span><span class="token operator">=</span><span class="token number">1</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token string">&quot;doc&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">  	<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;图灵学院1&quot;</span></span>
<span class="line">  <span class="token punctuation">}</span>    </span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">POST /es_sc/_update/1/?if_seq_no<span class="token operator">=</span><span class="token number">1</span><span class="token operator">&amp;</span><span class="token assign-left variable">if_primary_term</span><span class="token operator">=</span><span class="token number">1</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token string">&quot;doc&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">  	<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;图灵学院2&quot;</span></span>
<span class="line">  <span class="token punctuation">}</span>    </span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 精准查询，控制 必须同时包含两个词</span></span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java abc&quot;</span>,</span>
<span class="line">        <span class="token string">&quot;operator&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;and&quot;</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="概念" tabindex="-1"><a class="header-anchor" href="#概念"><span>概念</span></a></h2><p><strong>3.1 索引 index</strong></p><p>一个索引就是一个拥有几分相似特征的文档的集合。比如说，可以有一个客户数据的索引，另一个产品目录的索引，还有一个订单数据的索引</p><p>一个索引由一个名字来标识（必须全部是小写字母的），并且当我们要对对应于这个索引中的文档进行索引、搜索、更新和删除的时候，都要使用到这个名字</p><p><strong>3.2 映射 mapping</strong></p><p><strong>ElasticSearch中的映射（Mapping）用来定义一个文档</strong></p><p>mapping是处理数据的方式和规则方面做一些限制，如某个字段的数据类型、默认值、分词器、是否被索引等等，这些都是映射里面可以设置的</p><p><strong>3.3 字段Field</strong></p><p>相当于是数据表的字段|列</p><p><strong>3.4 字段类型 Type</strong></p><p>每一个字段都应该有一个对应的类型，例如：Text、Keyword、Byte等</p><p><strong>3.5 文档 document</strong></p><p>一个文档是一个可被索引的基础信息单元，类似一条记录。文档以JSON（Javascript Object Notation）格式来表示；</p><p><strong>3.6 集群 cluster</strong></p><p>一个集群就是由一个或多个节点组织在一起，它们共同持有整个的数据，并一起提供索引和搜索功能</p><p><strong>3.7 节点 node</strong></p><p>一个节点是集群中的一个服务器，作为集群的一部分，它存储数据，参与集群的索引和搜索功能</p><p>一个节点可以通过配置集群名称的方式来加入一个指定的集群。默认情况下，每个节点都会被安排加入到一个叫做“elasticsearch”的集群中</p><p>这意味着，如果在网络中启动了若干个节点，并假定它们能够相互发现彼此，它们将会自动地形成并加入到一个叫做“elasticsearch”的集群中</p><p>在一个集群里，可以拥有任意多个节点。而且，如果当前网络中没有运行任何Elasticsearch节点，这时启动一个节点，会默认创建并加入一个叫做“elasticsearch”的集群。</p><p><strong>3.8 分片和副本 shards&amp;replicas</strong></p><p><strong>3.8.1 分片</strong></p><ul><li><p>一个索引可以存储超出单个结点硬件限制的大量数据。比如，一个具有10亿文档的索引占据1TB的磁盘空间，而任一节点都没有这样大的磁盘空间；或者单个节点处理搜索请求，响应太慢</p></li><li><p>为了解决这个问题，Elasticsearch提供了将索引划分成多份的能力，这些份就叫做分片</p></li><li><p>当创建一个索引的时候，可以指定你想要的分片的数量</p></li><li><p>每个分片本身也是一个功能完善并且独立的“索引”，这个“索引”可以被放置到集群中的任何节点上</p></li><li><p>分片很重要，主要有两方面的原因</p></li></ul><p>​ 允许水平分割/扩展你的内容容量</p><p>​ 允许在分片之上进行分布式的、并行的操作，进而提高性能/吞吐量</p><ul><li>至于一个分片怎样分布，它的文档怎样聚合回搜索请求，是完全由Elasticsearch管理的，对于作为用户来说，这些都是透明的</li></ul><p><strong>3.8.2 副本</strong></p><ul><li><p>在一个网络/云的环境里，失败随时都可能发生，在某个分片/节点不知怎么的就处于离线状态，或者由于任何原因消失了，这种情况下，有一个故障转移机制是非常有用并且是强烈推荐的。为此目的，Elasticsearch允许你创建分片的一份或多份拷贝，这些拷贝叫做副本分片，或者直接叫副本</p></li><li><p>副本之所以重要，有两个主要原因</p></li></ul><p>​ (1) 在分片/节点失败的情况下，提供了高可用性。</p><p>​ 注意到复制分片从不与原/主要（original/primary）分片置于同一节点上是非常重要的</p><p>​ (2) 扩展搜索量/吞吐量，因为搜索可以在所有的副本上并行运行</p><p>​ 每个索引可以被分成多个分片。一个索引有0个或者多个副本</p><p>​ 一旦设置了副本，每个索引就有了主分片和副本分片，分片和副本的数量可以在索引</p><p>​ 创建的时候指定</p><p>​ 在索引创建之后，可以在任何时候动态地改变副本的数量，但是不能改变分片的数量</p><h2 id="查询方法" tabindex="-1"><a class="header-anchor" href="#查询方法"><span>查询方法</span></a></h2><p><strong>3.1 叶子条件查询(单字段查询条件)</strong></p><p><strong>3.1.1 模糊匹配</strong></p><p>模糊匹配主要是针对文本类型的字段，文本类型的字段会对内容进行分词，对查询时，也会对搜索条件进行分词，然后通过倒排索引查找到匹配的数据，模糊匹配主要通过match等参数来实现</p><ul><li>match : 通过match关键词模糊匹配条件内容 <ul><li>multi_match：多字段模糊包含一个即可</li></ul></li><li>prefix : 前缀匹配</li><li>regexp : 通过正则表达式来匹配数据</li></ul><h3 id="match的复杂用法" tabindex="-1"><a class="header-anchor" href="#match的复杂用法"><span><strong>match的复杂用法</strong></span></a></h3><p>match条件还支持以下参数：</p><ul><li>query : 指定匹配的值</li><li>operator : 匹配条件类型</li><li><ul><li>and : 条件分词后都要匹配</li><li>or : 条件分词后有一个匹配即可(默认)</li></ul></li><li>minmum_should_match : 指定最小匹配的数量</li></ul><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json" data-title="json"><pre class="language-json"><code><span class="line"># 精准查询，控制 必须同时包含两个词</span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token property">&quot;remark&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token string">&quot;java abc&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;operator&quot;</span><span class="token operator">:</span> <span class="token string">&quot;and&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;minmum_should_match&quot;</span><span class="token operator">:</span><span class="token number">2</span> <span class="token comment">//指定百分比 或 匹配数量</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"># 类似于下面效果</span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;bool&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token property">&quot;should&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;remark&quot;</span><span class="token operator">:</span> <span class="token string">&quot;java&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;remark&quot;</span><span class="token operator">:</span> <span class="token string">&quot;abc&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">]</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token property">&quot;minimum_should_match&quot;</span><span class="token operator">:</span> <span class="token number">2</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="match-的底层转换" tabindex="-1"><a class="header-anchor" href="#match-的底层转换"><span>match 的底层转换</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 转换后</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;should&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                            <span class="token string">&quot;value&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;developer&quot;</span></span>
<span class="line">                        <span class="token punctuation">}</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">]</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span></span>
<span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span>,</span>
<span class="line"><span class="token string">&quot;operator&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;and&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">转换后是：</span>
<span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;must&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                            <span class="token string">&quot;value&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;developer&quot;</span></span>
<span class="line">                        <span class="token punctuation">}</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">]</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java architect assistant&quot;</span>,</span>
<span class="line"><span class="token string">&quot;minimum_should_match&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;68%&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">转换后为：</span>
<span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;should&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;architect&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;assistant&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">]</span>,</span>
<span class="line">            <span class="token string">&quot;minimum_should_match&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="精确匹配" tabindex="-1"><a class="header-anchor" href="#精确匹配"><span><strong>精确匹配</strong></span></a></h3><ul><li>term : 单个条件相等</li><li>terms : 单个字段属于某个值数组内的值</li><li>range : 字段属于某个范围内的值</li><li>exists : 某个字段的值是否存在</li><li>ids : 通过ID批量查询</li></ul><p><strong>3.2 组合条件查询(多条件查询)</strong></p><p>组合条件查询是将叶子条件查询语句进行组合而形成的一个完整的查询条件</p><ul><li><p>bool : 各条件之间有and,or或not的关系</p></li><li><ul><li>must : 各个条件都必须满足，即各条件是and的关系</li><li>should : 各个条件有一个满足即可，即各条件是or的关系</li><li>must_not : 不满足所有条件，即各条件是not的关系</li><li>filter : 不计算相关度评分，它不计算_score即相关度评分，效率更高</li></ul></li><li><p>constant_score : 不计算相关度评分</p></li></ul><p><strong>must/filter/shoud/must_not</strong> 等的子条件是通过 <strong>term/terms/range/ids/exists/match</strong> 等叶子条件为参数的</p><p>注：以上参数，当只有一个搜索条件时，must等对应的是一个对象，当是多个条件时，对应的是一个数组</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token string">&quot;should&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">          <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span>,</span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">          <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;abc&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">]</span>,</span>
<span class="line">      <span class="token string">&quot;minimum_should_match&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="boost权重控制" tabindex="-1"><a class="header-anchor" href="#boost权重控制"><span><strong>boost权重控制</strong></span></a></h3><p>搜索document中remark字段中包含java的数据，如果remark中包含developer或architect，则包含architect的document优先显示。（就是将architect数据匹配时的相关度分数增加）。</p><p>一般用于搜索时相关度排序使用。如：电商中的综合排序。将一个商品的销量，广告投放，评价值，库存，单价比较综合排序。在上述的排序元素中，广告投放权重最高，库存权重最低。</p><div class="language-shel line-numbers-mode" data-highlighter="prismjs" data-ext="shel" data-title="shel"><pre class="language-shel"><code><span class="line">GET /es_db/_search</span>
<span class="line">{</span>
<span class="line">    &quot;query&quot;: {</span>
<span class="line">        &quot;bool&quot;: {</span>
<span class="line">            &quot;must&quot;: [</span>
<span class="line">                {</span>
<span class="line">                    &quot;match&quot;: {</span>
<span class="line">                        &quot;remark&quot;: &quot;java&quot;</span>
<span class="line">                    }</span>
<span class="line">                }</span>
<span class="line">            ],</span>
<span class="line">            &quot;should&quot;: [</span>
<span class="line">                {</span>
<span class="line">                    &quot;match&quot;: {</span>
<span class="line">                        &quot;remark&quot;: {</span>
<span class="line">                            &quot;query&quot;: &quot;developer&quot;,</span>
<span class="line">                            &quot;boost&quot;: 1</span>
<span class="line">                        }</span>
<span class="line">                    }</span>
<span class="line">                },</span>
<span class="line">                {</span>
<span class="line">                    &quot;match&quot;: {</span>
<span class="line">                        &quot;remark&quot;: {</span>
<span class="line">                            &quot;query&quot;: &quot;architect&quot;,</span>
<span class="line">                            &quot;boost&quot;: 3</span>
<span class="line">                        }</span>
<span class="line">                    }</span>
<span class="line">                }</span>
<span class="line">            ]</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="dis-max" tabindex="-1"><a class="header-anchor" href="#dis-max"><span>dis_max</span></a></h3><p><strong>基于dis_max实现best fields策略进行多字段搜索</strong></p><p>best fields策略： 搜索的document中的某一个field，尽可能多的匹配搜索条件。与之相反的是，尽可能多的字段匹配到搜索条件（most fields策略）。如百度搜索使用这种策略。</p><p><strong>优点：精确匹配的数据可以尽可能的排列在最前端，且可以通过minimum_should_match来去除长尾数据，避免长尾数据字段对排序结果的影响。</strong></p><p>​ 长尾数据比如说我们搜索4个关键词，但很多文档只匹配1个，也显示出来了，这些文档其实不是我们想要的</p><p><strong>缺点：相对排序不均匀。</strong></p><p><strong>dis_max语法： 直接获取搜索的多条件中的，单条件query相关度分数最高的数据，以这个数据做相关度排序。</strong></p><blockquote><p>下述的案例中，就是找name字段中rod匹配相关度分数或remark字段中java developer匹配相关度分数，哪个高，就使用哪一个相关度分数进行结果排序。</p></blockquote><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;dis_max&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;queries&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;rod&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">]</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>基于tie_breaker参数优化dis_max搜索效果</strong></p><p>dis_max是将多个搜索query条件中相关度分数最高的用于结果排序，忽略其他query分数，在某些情况下，可能还需要其他query条件中的相关度介入最终的结果排序，这个时候可以使用tie_breaker参数来优化dis_max搜索。tie_breaker参数代表的含义是：将其他query搜索条件的相关度分数乘以参数值，再参与到结果排序中。如果不定义此参数，相当于参数值为0。所以其他query条件的相关度分数被忽略。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;dis_max&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;queries&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;rod&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">]</span>,</span>
<span class="line">            <span class="token string">&quot;tie_breaker&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0.5</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5.6、使用multi_match简化dis_max+tie_breaker</strong></p><p>ES中相同结果的搜索也可以使用不同的语法语句来实现。不需要特别关注，只要能够实现搜索，就是完成任务！</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;dis_max&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;queries&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;rod&quot;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span>,</span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                            <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span>,</span>
<span class="line">                            <span class="token string">&quot;boost&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span>,</span>
<span class="line">                            <span class="token string">&quot;minimum_should_match&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span></span>
<span class="line">                        <span class="token punctuation">}</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">]</span>,</span>
<span class="line">            <span class="token string">&quot;tie_breaker&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0.5</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">#使用multi_match语法为：其中type常用的有best_fields和most_fields。^n代表权重，相当于&quot;boost&quot;:n。</span></span>
<span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;multi_match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;rod java developer&quot;</span>,</span>
<span class="line">            <span class="token string">&quot;fields&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span></span>
<span class="line">                <span class="token string">&quot;name&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;remark^2&quot;</span></span>
<span class="line">            <span class="token punctuation">]</span>,</span>
<span class="line">            <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;best_fields&quot;</span>,</span>
<span class="line">            <span class="token string">&quot;tie_breaker&quot;</span><span class="token builtin class-name">:</span> <span class="token number">0.5</span>,</span>
<span class="line">            <span class="token string">&quot;minimum_should_match&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;50%&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="cross-fields搜索" tabindex="-1"><a class="header-anchor" href="#cross-fields搜索"><span><strong>cross fields搜索</strong></span></a></h3><blockquote><p>多个字段结果，自动拼接到 某个字段中，类似etl处理</p><p>cross fields ： 一个唯一的标识，分部在多个fields中，使用这种唯一标识搜索数据就称为cross fields搜索。如：人名可以分为姓和名，地址可以分为省、市、区县、街道等。那么使用人名或地址来搜索document，就称为cross fields搜索。</p><p>实现这种搜索，一般都是使用most fields搜索策略。因为这就不是一个field的问题。</p><p>Cross fields搜索策略，是从多个字段中搜索条件数据。默认情况下，和most fields搜索的逻辑是一致的，计算相关度分数是和best fields策略一致的。一般来说，如果使用cross fields搜索策略，那么都会携带一个额外的参数operator。用来标记搜索条件如何在多个字段中匹配。</p><p>当然，在ES中也有cross fields搜索策略。具体语法如下：</p></blockquote><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET /es_db/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;multi_match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java developer&quot;</span>,</span>
<span class="line"><span class="token string">&quot;fields&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span><span class="token string">&quot;name&quot;</span>, <span class="token string">&quot;remark&quot;</span><span class="token punctuation">]</span>,</span>
<span class="line"><span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;cross_fields&quot;</span>,</span>
<span class="line"><span class="token string">&quot;operator&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;and&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="match-phrase" tabindex="-1"><a class="header-anchor" href="#match-phrase"><span><strong>match phrase</strong></span></a></h3><blockquote><p>短语搜索。就是搜索条件不分词。代表搜索条件不可分割。</p><p>如果hello world是一个不可分割的短语，我们可以使用前文学过的短语搜索match phrase来实现。语法如下：</p></blockquote><p><strong>slop:</strong></p><p>可移动分词数量</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET _search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;match_phrase&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java assistant&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">GET /idx/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;match_phrase&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token string">&quot;remark&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;java like&quot;</span>,</span>
<span class="line">            <span class="token string">&quot;slop&quot;</span><span class="token builtin class-name">:</span> <span class="token number">2</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="经验分享" tabindex="-1"><a class="header-anchor" href="#经验分享"><span><strong>经验分享</strong></span></a></h3><p>使用match和proximity search实现召回率和精准度平衡。</p><p>召回率：召回率就是搜索结果比率，如：索引A中有100个document，搜索时返回多少个document，就是召回率（recall）。</p><p>精准度：就是搜索结果的准确率，如：搜索条件为hello java，在搜索结果中尽可能让短语匹配和hello java离的近的结果排序靠前，就是精准度（precision）。</p><p>如果在搜索的时候，只使用match phrase语法，会导致召回率底下，因为搜索结果中必须包含短语（包括proximity search）。</p><p>如果在搜索的时候，只使用match语法，会导致精准度底下，因为搜索结果排序是根据相关度分数算法计算得到。</p><p>那么如果需要在结果中兼顾召回率和精准度的时候，就需要将match和proximity search混合使用，来得到搜索结果。</p><p>测试案例：</p><h3 id="连接查询-多文档合并查询" tabindex="-1"><a class="header-anchor" href="#连接查询-多文档合并查询"><span>连接查询(多文档合并查询)</span></a></h3><ul><li>父子文档查询：parent/child</li><li>嵌套文档查询: nested</li></ul><p>3.4 DSL查询语言中存在两种：查询DSL（query DSL）和过滤DSL（filter DSL）</p><p>它们两个的区别如下图：</p><p>​ <img src="https://note.youdao.com/yws/public/resource/7fffae927f3bc06aab2fdc663ec5cad3/xmlnote/8D3E163FE35B4B13BA19196C26AF8027/3368" alt="0"></p><p><strong>query DSL</strong></p><p>在查询上下文中，查询会回答这个问题——“这个文档匹不匹配这个查询，它的相关度高么？”</p><p>如何验证匹配很好理解，如何计算相关度呢？ES中索引的数据都会存储一个_score分值，分值越高就代表越匹配。另外关于某个搜索的分值计算还是很复杂的，因此也需要一定的时间。</p><p><strong>filter DSL</strong></p><p>在过滤器上下文中，查询会回答这个问题——“这个文档匹不匹配？”</p><p>答案很简单，是或者不是。它不会去计算任何分值，也不会关心返回的排序问题，因此效率会高一点。</p><p>过滤上下文 是在使用filter参数时候的执行环境，比如在bool查询中使用must_not或者filter</p><p>另外，经常使用过滤器，ES会自动的缓存过滤器的内容，这对于查询来说，会提高很多性能。</p><p>一些过滤的情况：</p><p>​</p><p><strong>3.5 Query方式查询:案例</strong></p><ul><li><p>根据名称精确查询姓名 term, term查询不会对字段进行分词查询，会采用精确匹配</p><p>注意: 采用term精确查询, 查询字段映射类型属于为keyword.</p></li></ul><p><strong>总结:</strong></p><p><strong>1. match</strong></p><p>match：模糊匹配，需要指定字段名，但是输入会进行分词，比如&quot;hello world&quot;会进行拆分为hello和world，然后匹配，如果字段中包含hello或者world，或者都包含的结果都会被查询出来，也就是说match是一个部分匹配的模糊查询。查询条件相对来说比较宽松。</p><p><strong>2. term</strong></p><p>term: 这种查询和match在有些时候是等价的，比如我们查询单个的词hello，那么会和match查询结果一样，但是如果查询&quot;hello world&quot;，结果就相差很大，因为这个输入不会进行分词，就是说查询的时候，是查询字段分词结果中是否有&quot;hello world&quot;的字样，而不是查询字段中包含&quot;hello world&quot;的字样。当保存数据&quot;hello world&quot;时，elasticsearch会对字段内容进行分词，&quot;hello world&quot;会被分成hello和world，不存在&quot;hello world&quot;，因此这里的查询结果会为空。这也是term查询和match的区别。</p><p><strong>3. match_phase</strong></p><p>match_phase：会对输入做分词，但是需要结果中也包含所有的分词，而且顺序要求一样。以&quot;hello world&quot;为例，要求结果中必须包含hello和world，而且还要求他们是连着的，顺序也是固定的，hello that world不满足，world hello也不满足条件。</p><p><strong>4. query_string</strong></p><p>query_string：和match类似，但是match需要指定字段名，query_string是在所有字段中搜索，范围更广泛。</p><h2 id="文档映射" tabindex="-1"><a class="header-anchor" href="#文档映射"><span><strong>文档映射</strong></span></a></h2><p>1.ES中映射可以分为动态映射和静态映射</p><p>动态映射：</p><p>在关系数据库中，需要事先创建数据库，然后在该数据库下创建数据表，并创建表字段、类型、长度、主键等，最后才能基于表插入数据。而Elasticsearch中不需要定义Mapping映射（即关系型数据库的表、字段等），在文档写入Elasticsearch时，会根据文档字段自动识别类型，这种机制称之为动态映射。</p><p>动态映射规则如下：</p><p>​ <img src="https://note.youdao.com/yws/public/resource/7fffae927f3bc06aab2fdc663ec5cad3/xmlnote/WEBRESOURCE5476d97139ea4a7c20bdb4e913fa508c/3228" alt="0"></p><p>静态映射：</p><p>静态映射是在Elasticsearch中也可以事先定义好映射，包含文档的各字段类型、分词器等，这种方式称之为静态映射。</p><p>2 动态映射</p><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json" data-title="json"><pre class="language-json"><code><span class="line"><span class="token comment">// 自动创建映射结构</span></span>
<span class="line">PUT /idx/_doc/<span class="token number">1</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Jack&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;sex&quot;</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;age&quot;</span><span class="token operator">:</span> <span class="token number">25</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;book&quot;</span><span class="token operator">:</span> <span class="token string">&quot;java入门至精通&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;address&quot;</span><span class="token operator">:</span> <span class="token string">&quot;广州小蛮腰&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>获取映射结构：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line">GET /idx/_mapping			</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>静态映射</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line"><span class="token comment"># 设置 索引结构</span></span>
<span class="line">PUT /es_db</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;mappings&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;properties&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true, // 是否分词</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span> // 是否存储此字段值</span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;integer&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;integer&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;book&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;text&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;analyzer&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ik_smart&quot;</span>,  // 存储分词器</span>
<span class="line">                <span class="token string">&quot;search_analyzer&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ik_smart&quot;</span> // 查询分词器</span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;text&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="核心类型-core-datatype" tabindex="-1"><a class="header-anchor" href="#核心类型-core-datatype"><span><strong>核心类型（Core datatype）</strong></span></a></h2><p>字符串：string，string类型包含 text 和 keyword。</p><p>text：该类型被用来索引长文本，在创建索引前会将这些文本进行分词，转化为词的组合，建立索引；允许es来检索这些词，text类型不能用来排序和聚合。</p><p>keyword：该类型不能分词，可以被用来检索过滤、排序和聚合，keyword类型不可用text进行分词模糊检索。</p><p>数值型：long、integer、short、byte、double、float</p><p>日期型：date</p><p>布尔型：boolean</p><h2 id="索引重建" tabindex="-1"><a class="header-anchor" href="#索引重建"><span>索引重建</span></a></h2><blockquote><p>对已存在的mapping映射进行修改 具体方法 1）如果要推倒现有的映射, 你得重新建立一个静态索引 2）然后把之前索引里的数据导入到新的索引里 3）删除原创建的索引 4）为新索引起个别名, 为原索引名</p></blockquote><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="line"><span class="token comment"># 设置 索引结构</span></span>
<span class="line">PUT /idx2</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;mappings&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;properties&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;keyword&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true, // 是否分词</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span> // 是否存储此字段值</span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;sex&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;integer&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;integer&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token function">tr</span></span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;book&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;text&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;analyzer&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ik_smart&quot;</span>,  // 存储分词器</span>
<span class="line">                <span class="token string">&quot;search_analyzer&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ik_smart&quot;</span> // 查询分词器</span>
<span class="line">            <span class="token punctuation">}</span>,</span>
<span class="line">            <span class="token string">&quot;address&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token string">&quot;type&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;text&quot;</span>,</span>
<span class="line">                <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> true,</span>
<span class="line">                <span class="token string">&quot;store&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 数据迁移到新的索引库中</span></span>
<span class="line">POST _reindex</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token string">&quot;source&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;idx&quot;</span></span>
<span class="line">    <span class="token punctuation">}</span>,</span>
<span class="line">    <span class="token string">&quot;dest&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token string">&quot;index&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;idx2&quot;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">DELETE /idx</span>
<span class="line"><span class="token comment"># 起别名</span></span>
<span class="line">PUT /db_index_2/_alias/db_index</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="工作流程" tabindex="-1"><a class="header-anchor" href="#工作流程"><span>工作流程</span></a></h2><p>存储原理</p><blockquote><ol><li><p><code>client</code>选择某个节点，发送存储数据的请求，此时被选择节点，作为<code>coordinating node</code>协调节点</p></li><li><p>协调节点 计算要存储的分片id，再找到该分片 <code>primary shard</code>主分片所在的节点，转发请求</p><p>shard = hash(routing) % number_of_primary_shards routing 是一个可变值，默认是文档的 _id</p></li><li><p><code>primary shard</code>接收请求，写入数据到索引库中，并将数据同步到<code>replica shard</code>副本分片</p></li><li><p>主分片、副本分片都保存成功后，响应客户端</p></li></ol></blockquote><p><img src="`+e+'" alt="image-20220120083350759"></p><p>查询原理</p><blockquote><ol><li><code>client</code>发送请求给随机节点，此节点将作为<code>coordinating node</code>协调节点，接收到请求</li><li>协调节点将查询信息广播到所有节点，各个节点根据查询信息，对所包含分片信息进行查新，将满足条件的数据放到队列中，并将这些数据的文档id、分片信息、节点信息返回给协调节点</li><li>协调节点将结果汇总，并进行全局的排序</li><li>协调节点 根据 汇总信息，对各个数据节点发送 get 请求，获取数据，再响应给<code>client</code></li></ol></blockquote><p><img src="'+t+'" alt="image-20220120083647907"></p><p>节点中写入数据</p><blockquote><ol><li><p><strong>节点接收到请求时，先写到内存中</strong>，然后生成<code>segment</code>，并刷新到文件系统缓存中，数据可以被检索</p><ol><li>文件系统缓存每1秒刷新一次</li></ol></li><li><p><strong>数据刷盘</strong></p><ol><li>每30分钟会将文件系统缓存中的数据，持久化到磁盘中</li></ol></li><li><p>**translog日志：**文件系统缓存基于内存，为防止故障数据丢失， 在写入到内存中的同时，也会记录translog日志，在refresh期间出现异常，会根据translog来进行数据恢复</p><p>等到文件系统缓存中的segment数据都刷到磁盘中，清空translog文件</p></li><li><p><strong>segment合并</strong></p><p>Segment太多时，ES定期会将多个segment合并成为大的segment，减少索引查询时IO开销，此阶段ES会真正的物理删除（之前执行过的delete的数据）</p></li></ol></blockquote><p><img src="'+i+`" alt="image-20220120084057942"></p><h2 id="ik分词器" tabindex="-1"><a class="header-anchor" href="#ik分词器"><span>ik分词器</span></a></h2><h3 id="安装" tabindex="-1"><a class="header-anchor" href="#安装"><span>安装</span></a></h3><blockquote><p>https://github.com/medcl/elasticsearch-analysis-ik/releases</p><p>plugins 下 创建 ik目录</p><p>./plugins/ik</p><p>放到 此目录下，解压即可</p><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="line"><span class="token comment">// 分词测试</span></span>
<span class="line"><span class="token constant">POST</span> _analyze</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token string-property property">&quot;analyzer&quot;</span><span class="token operator">:</span> <span class="token string">&quot;ik_smart&quot;</span><span class="token punctuation">,</span></span>
<span class="line"><span class="token string-property property">&quot;text&quot;</span><span class="token operator">:</span> <span class="token string">&quot;中华人民共和国&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></blockquote><h3 id="热更新" tabindex="-1"><a class="header-anchor" href="#热更新"><span>热更新</span></a></h3><blockquote><p>更新 plugins</p></blockquote><div class="language-xml line-numbers-mode" data-highlighter="prismjs" data-ext="xml" data-title="xml"><pre class="language-xml"><code><span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>properties</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>comment</span><span class="token punctuation">&gt;</span></span>IK Analyzer 扩展配置<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>comment</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">	<span class="token comment">&lt;!--用户可以在这里配置自己的扩展字典 --&gt;</span></span>
<span class="line">	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>entry</span> <span class="token attr-name">key</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>ext_dict<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>location<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>entry</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">	 <span class="token comment">&lt;!--用户可以在这里配置自己的扩展停止词字典--&gt;</span></span>
<span class="line">	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>entry</span> <span class="token attr-name">key</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>ext_stopwords<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>location<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>entry</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">	<span class="token comment">&lt;!--用户可以在这里配置远程扩展字典 --&gt;</span></span>
<span class="line">	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>entry</span> <span class="token attr-name">key</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>remote_ext_dict<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>words_location<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>entry</span><span class="token punctuation">&gt;</span></span> </span>
<span class="line">	<span class="token comment">&lt;!--用户可以在这里配置远程扩展停止词字典--&gt;</span></span>
<span class="line">	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>entry</span> <span class="token attr-name">key</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>remote_ext_stopwords<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>words_location<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>entry</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>properties</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="聚合查询" tabindex="-1"><a class="header-anchor" href="#聚合查询"><span>聚合查询</span></a></h2><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json" data-title="json"><pre class="language-json"><code><span class="line">GET /cars/_search</span>
<span class="line"></span>
<span class="line">GET /cars/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> </span>
<span class="line">  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 分组结果返回名称</span></span>
<span class="line">    <span class="token property">&quot;group_by_color&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// group by 字段</span></span>
<span class="line">        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;color&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;order&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token comment">// 引用 aggs 中的名称</span></span>
<span class="line">          <span class="token property">&quot;avg_by_price&quot;</span><span class="token operator">:</span> <span class="token string">&quot;asc&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;avg_by_price&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token comment">// 聚合方式</span></span>
<span class="line">          <span class="token property">&quot;sum&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 聚合字段</span></span>
<span class="line">            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">,</span></span>
<span class="line">        <span class="token comment">// 对当前结果再次聚合，内层 名称</span></span>
<span class="line">        <span class="token property">&quot;group_by_brand&quot;</span><span class="token operator">:</span><span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;brand&quot;</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token property">&quot;order&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">              <span class="token property">&quot;avg_by_price&quot;</span><span class="token operator">:</span> <span class="token string">&quot;desc&quot;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">          <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">          <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;avg_by_price&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">              <span class="token property">&quot;avg&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span></span>
<span class="line">              <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">GET /cars/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token property">&quot;color&quot;</span><span class="token operator">:</span> <span class="token string">&quot;金色&quot;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;group_by_color&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;color&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;order&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;max_price&quot;</span><span class="token operator">:</span> <span class="token string">&quot;desc&quot;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;max_price&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;max&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;min_price&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;min&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;sum_price&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;sum&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">GET /cars/_search</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">4</span><span class="token punctuation">,</span> </span>
<span class="line">  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token property">&quot;brand&quot;</span><span class="token operator">:</span> <span class="token string">&quot;大众&quot;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;count_last_year&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token property">&quot;filter&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;range&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;sold_date&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;gte&quot;</span><span class="token operator">:</span> <span class="token string">&quot;now-12M&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;sum_of_price_last_year&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token property">&quot;sum&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="javaapi" tabindex="-1"><a class="header-anchor" href="#javaapi"><span>javaAPI</span></a></h2><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre class="language-java"><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">EsServiceImplTest</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ElasticsearchClient</span> restClient<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">EsServiceImplTest</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">RestClientBuilder</span> builder <span class="token operator">=</span> <span class="token class-name">RestClient</span><span class="token punctuation">.</span><span class="token function">builder</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">HttpHost</span><span class="token punctuation">(</span><span class="token string">&quot;127.0.0.1&quot;</span><span class="token punctuation">,</span> <span class="token number">9200</span><span class="token punctuation">,</span> <span class="token string">&quot;http&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token class-name">ElasticsearchTransport</span> transport <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RestClientTransport</span><span class="token punctuation">(</span>builder<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token keyword">new</span> <span class="token class-name">JacksonJsonpMapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        restClient <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ElasticsearchClient</span><span class="token punctuation">(</span>transport<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token annotation punctuation">@SneakyThrows</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">list</span><span class="token punctuation">(</span><span class="token class-name">String</span> idx<span class="token punctuation">,</span> <span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> clazz<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">SearchResponse</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> search <span class="token operator">=</span> restClient<span class="token punctuation">.</span><span class="token function">search</span><span class="token punctuation">(</span>builder <span class="token operator">-&gt;</span> builder<span class="token punctuation">.</span><span class="token function">index</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">query</span><span class="token punctuation">(</span>q <span class="token operator">-&gt;</span> q<span class="token punctuation">.</span><span class="token function">matchAll</span><span class="token punctuation">(</span>builder1 <span class="token operator">-&gt;</span> builder1<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> clazz<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// SearchResponse&lt;T&gt; search = restClient.search(s -&gt;</span></span>
<span class="line">        <span class="token comment">//                 s.index(idx)</span></span>
<span class="line">        <span class="token comment">//                         .query(q -&gt;</span></span>
<span class="line">        <span class="token comment">//                                 q.term(t -&gt; t.field(&quot;name&quot;)</span></span>
<span class="line">        <span class="token comment">//                                         .value(v -&gt; v.stringValue(&quot;Jack&quot;))</span></span>
<span class="line">        <span class="token comment">//                                 ))</span></span>
<span class="line">        <span class="token comment">//         , clazz);</span></span>
<span class="line">        <span class="token keyword">return</span> search<span class="token punctuation">.</span><span class="token function">hits</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">hits</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">stream</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span><span class="token class-name">Hit</span><span class="token operator">::</span><span class="token function">source</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">collect</span><span class="token punctuation">(</span><span class="token class-name">Collectors</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token annotation punctuation">@SneakyThrows</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">list</span><span class="token punctuation">(</span><span class="token class-name">String</span> idx<span class="token punctuation">,</span> <span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> clazz<span class="token punctuation">,</span> <span class="token class-name">Function</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Query<span class="token punctuation">.</span>Builder</span><span class="token punctuation">,</span> <span class="token class-name">ObjectBuilder</span><span class="token punctuation">&lt;</span><span class="token class-name">Query</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> fn<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">SearchResponse</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> search <span class="token operator">=</span> restClient<span class="token punctuation">.</span><span class="token function">search</span><span class="token punctuation">(</span>q <span class="token operator">-&gt;</span> q<span class="token punctuation">.</span><span class="token function">index</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">query</span><span class="token punctuation">(</span>fn<span class="token punctuation">)</span><span class="token punctuation">,</span> clazz<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> search<span class="token punctuation">.</span><span class="token function">hits</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">hits</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">stream</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span><span class="token class-name">Hit</span><span class="token operator">::</span><span class="token function">source</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">collect</span><span class="token punctuation">(</span><span class="token class-name">Collectors</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token annotation punctuation">@SneakyThrows</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">T</span> <span class="token function">getById</span><span class="token punctuation">(</span><span class="token class-name">String</span> idx<span class="token punctuation">,</span> <span class="token class-name">String</span> id<span class="token punctuation">,</span> <span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> clazz<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">GetResponse</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> jsonGetResponse <span class="token operator">=</span> restClient<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>builder <span class="token operator">-&gt;</span> builder<span class="token punctuation">.</span><span class="token function">index</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">,</span> clazz<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> jsonGetResponse<span class="token punctuation">.</span><span class="token function">source</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token annotation punctuation">@SneakyThrows</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">IndexResponse</span> <span class="token function">insert</span><span class="token punctuation">(</span><span class="token class-name">String</span> idx<span class="token punctuation">,</span> <span class="token class-name">String</span> id<span class="token punctuation">,</span> <span class="token class-name">Idx</span> idxClass<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> restClient<span class="token punctuation">.</span><span class="token function">index</span><span class="token punctuation">(</span>a <span class="token operator">-&gt;</span> a<span class="token punctuation">.</span><span class="token function">index</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">document</span><span class="token punctuation">(</span>idxClass<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token annotation punctuation">@SneakyThrows</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">UpdateResponse</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span> <span class="token keyword">extends</span> <span class="token class-name">Idx</span><span class="token punctuation">&gt;</span></span> <span class="token function">update</span><span class="token punctuation">(</span><span class="token class-name">String</span> idx<span class="token punctuation">,</span> <span class="token class-name">String</span> id<span class="token punctuation">,</span> <span class="token class-name">Idx</span> idxClass<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> restClient<span class="token punctuation">.</span><span class="token function">update</span><span class="token punctuation">(</span>a <span class="token operator">-&gt;</span> a<span class="token punctuation">.</span><span class="token function">index</span><span class="token punctuation">(</span>idx<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">doc</span><span class="token punctuation">(</span>idxClass<span class="token punctuation">)</span><span class="token punctuation">,</span> idxClass<span class="token punctuation">.</span><span class="token function">getClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token annotation punctuation">@Test</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">demo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// List&lt;Idx&gt; idx = list(&quot;idx&quot;, Idx.class);</span></span>
<span class="line">        <span class="token comment">// idx.forEach(System.out::println);</span></span>
<span class="line">        <span class="token comment">// System.out.println(getById(&quot;idx&quot;, &quot;1&quot;, Idx.class));</span></span>
<span class="line">        <span class="token comment">// System.out.println(insert(&quot;idx&quot;, &quot;4&quot;, new Idx(&quot;山东&quot;, &quot;百科全书&quot;, &quot;yase&quot;, 1, 20)).result());</span></span>
<span class="line">        <span class="token comment">// UpdateResponse&lt;? extends Idx&gt; update = update(&quot;idx&quot;, &quot;4&quot;, new Idx(&quot;山东&quot;, &quot;百科全书2&quot;, &quot;jeff&quot;, 1, 20));</span></span>
<span class="line">        <span class="token comment">// System.out.println(update.result());</span></span>
<span class="line">        <span class="token comment">// List&lt;Idx&gt; list = list(&quot;idx&quot;, Idx.class, q -&gt; q.term(t -&gt; t.field(&quot;name&quot;).value(f -&gt; f.stringValue(&quot;jeff&quot;))));</span></span>
<span class="line">        <span class="token comment">// List&lt;Idx&gt; list = list(&quot;idx&quot;, Idx.class, q -&gt; q.match(m -&gt; m.field(&quot;address&quot;).query(f -&gt; f.stringValue(&quot;山东&quot;))));</span></span>
<span class="line">        <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Idx</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> <span class="token function">list</span><span class="token punctuation">(</span><span class="token string">&quot;idx&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Idx</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> q <span class="token operator">-&gt;</span> q<span class="token punctuation">.</span><span class="token function">match</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MatchQuery<span class="token punctuation">.</span>Builder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">field</span><span class="token punctuation">(</span><span class="token string">&quot;address&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">query</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">FieldValue<span class="token punctuation">.</span>Builder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">stringValue</span><span class="token punctuation">(</span><span class="token string">&quot;山东&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        list<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token operator">::</span><span class="token function">println</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,167)]))}const d=n(c,[["render",o],["__file","ES.html.vue"]]),k=JSON.parse('{"path":"/blogs/jishu/es/ES.html","title":"ElasticSearch","lang":"en-US","frontmatter":{"title":"ElasticSearch","date":"2021-08-20T00:00:00.000Z","author":"shuiMu","categories":["技术"],"tags":["elasticSearch"]},"headers":[{"level":2,"title":"docker 启动安装","slug":"docker-启动安装","link":"#docker-启动安装","children":[{"level":3,"title":"docker-compose.yaml","slug":"docker-compose-yaml","link":"#docker-compose-yaml","children":[]}]},{"level":2,"title":"集群维护","slug":"集群维护","link":"#集群维护","children":[]},{"level":2,"title":"常用命令","slug":"常用命令","link":"#常用命令","children":[]},{"level":2,"title":"概念","slug":"概念","link":"#概念","children":[]},{"level":2,"title":"查询方法","slug":"查询方法","link":"#查询方法","children":[{"level":3,"title":"match的复杂用法","slug":"match的复杂用法","link":"#match的复杂用法","children":[]},{"level":3,"title":"match 的底层转换","slug":"match-的底层转换","link":"#match-的底层转换","children":[]},{"level":3,"title":"精确匹配","slug":"精确匹配","link":"#精确匹配","children":[]},{"level":3,"title":"boost权重控制","slug":"boost权重控制","link":"#boost权重控制","children":[]},{"level":3,"title":"dis_max","slug":"dis-max","link":"#dis-max","children":[]},{"level":3,"title":"cross fields搜索","slug":"cross-fields搜索","link":"#cross-fields搜索","children":[]},{"level":3,"title":"match phrase","slug":"match-phrase","link":"#match-phrase","children":[]},{"level":3,"title":"经验分享","slug":"经验分享","link":"#经验分享","children":[]},{"level":3,"title":"连接查询(多文档合并查询)","slug":"连接查询-多文档合并查询","link":"#连接查询-多文档合并查询","children":[]}]},{"level":2,"title":"文档映射","slug":"文档映射","link":"#文档映射","children":[]},{"level":2,"title":"核心类型（Core datatype）","slug":"核心类型-core-datatype","link":"#核心类型-core-datatype","children":[]},{"level":2,"title":"索引重建","slug":"索引重建","link":"#索引重建","children":[]},{"level":2,"title":"工作流程","slug":"工作流程","link":"#工作流程","children":[]},{"level":2,"title":"ik分词器","slug":"ik分词器","link":"#ik分词器","children":[{"level":3,"title":"安装","slug":"安装","link":"#安装","children":[]},{"level":3,"title":"热更新","slug":"热更新","link":"#热更新","children":[]}]},{"level":2,"title":"聚合查询","slug":"聚合查询","link":"#聚合查询","children":[]},{"level":2,"title":"javaAPI","slug":"javaapi","link":"#javaapi","children":[]}],"git":{"createdTime":1729153375000,"updatedTime":1729235013000,"contributors":[{"name":"peng.li","email":"lip.app@qq.com","commits":1}]},"filePathRelative":"blogs/技术/es/ES.md"}');export{d as comp,k as data};
