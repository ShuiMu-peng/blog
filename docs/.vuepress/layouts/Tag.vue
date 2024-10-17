<script setup>
import {useBlogCategory, useBlogType} from '@vuepress/plugin-blog/client'
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
import ArticleList from "../components/ArticleList.vue";
import {useRoute} from "vuepress/client";
import {toRef} from "vue";

const route = useRoute()
const tagMap = useBlogCategory('tag')
const articles = useBlogType('article')
let currentItems = toRef(articles.value.items);

function filterItem(tag) {
    currentItems.value = tagMap.value.map[tag].items
}

</script>

<template>
    <ParentLayout>
        <template #page>
            <main class="page">
                <div class="tag-wrapper">
                    <router-link
                        v-for="(value,key) in tagMap.map"
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
@use '@vuepress/theme-default/styles/mixins';

.page {
    padding-top: 57px;
    background-color: #f8f8f8;
}

.tag-wrapper {
    @include mixins.content_wrapper;

    padding-top: 1rem !important;
    padding-bottom: 0 !important;

    font-size: 14px;

    a {
        color: inherit;
    }

    .tag {
        box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.75);
        display: inline-block;
        vertical-align: middle;
        overflow: hidden;
        margin: 0.3rem 0.6rem 0.8rem;
        padding: 0.4rem 0.8rem;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: background 0.3s,
        color 0.3s;

        @media (max-width: 419px) {
            font-size: 0.9rem;
        }

        .tag-num {
            color: white;
            display: inline-block;
            background-color: #8e5cd9;
            min-width: 1rem;
            height: 1.2rem;
            margin-inline-start: 0.2em;
            padding: 0 0.1rem;
            border-radius: 50%;
            font-size: 0.7rem;
            line-height: 1.2rem;
            text-align: center;
        }

        &.router-link-active {
            background: #32cf0f;
            color: black;
        }
    }
}
</style>
