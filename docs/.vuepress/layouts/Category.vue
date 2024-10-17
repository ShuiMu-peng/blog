<script setup>
import {useBlogCategory, useBlogType} from '@vuepress/plugin-blog/client'
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
import {useRoute} from 'vuepress/client'
import ArticleList from '../components/ArticleList.vue'
import {toRef} from "vue";

const route = useRoute()
const categoryMap = useBlogCategory('category')
console.log(categoryMap.value)
const articles = useBlogType('article')
let currentItems = toRef(articles.value.items);

function filterItem(category) {
    currentItems.value = categoryMap.value.map[category].items
}
</script>

<template>
    <ParentLayout>
        <template #page>
            <main class="page">
                <div class="tag-wrapper">
                    <router-link
                        v-for="(value,key) in categoryMap.map"
                        :key="key"
                        :to="value.path"
                        :active="route.path === value.path"
                        @click="filterItem(key)"
                        class="tag"
                    >
                        {{ key }}
                        <span class="tag-num">
                            {{ value.items.length }}
                        </span>
                    </router-link>
                </div>
                <ArticleList :items="currentItems"/>
            </main>
        </template>
    </ParentLayout>
</template>

<style lang="scss">
</style>
