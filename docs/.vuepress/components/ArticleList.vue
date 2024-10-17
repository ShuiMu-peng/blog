<script setup>
defineProps({
    /** Article items */
    items: {
        type: Array,
        required: true,
    },
    /** Whether is timeline or not */
    isTimeline: Boolean,
})
</script>

<template>
    <div class="article-wrapper">
        <div v-if="!items.length">Nothing in here.</div>

        <article
            v-for="{ info, path } in items"
            :key="path"
            class="article"
            @click="$router.push(path)"
        >
            <header class="title">
                {{
                    (isTimeline ? `${new Date(info.date).toLocaleDateString('en-CA')}: ` : '') +
                    info.title
                }}
            </header>
            <hr/>
            <div v-if="info.excerpt && !isTimeline" class="excerpt" v-html="info.excerpt"/>
            <div class="article-info">
                <span v-if="info.author" class="author"> {{ info.author }}</span>
                <span v-if="info.date" class="date">{{ new Date(info.date).toLocaleDateString('en-CA') }}</span>
                <span v-if="info.category" class="category">分类: {{ info.category.join(', ') }}</span>
                <span v-if="info.tags" class="tag">标签: {{ info.tags.join(', ') }}</span>
            </div>
        </article>
    </div>
</template>

<style lang="scss" scoped>
@use '@vuepress/theme-default/styles/mixins';

.article-wrapper {
    @include mixins.content_wrapper;
    text-align: center;
    //background-color: #eee;
}

.article {
    position: relative;
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.75);
    background-color: white;
    box-sizing: border-box;
    width: 100%;
    margin: 0 auto 1.25rem;
    padding: 1rem 1.25rem;
    border-radius: 0.4rem;
    color: var(--c-text);

    text-align: start;

    @media (max-width: 419px) {
        border-radius: 0;
    }

    &:hover {
        cursor: pointer;
    }

    .title {
        position: relative;
        display: inline-block;
        font-size: 1.28rem;
        line-height: 2rem;
        color: #3eaf7c;

        &::after {
            content: '';

            position: absolute;
            bottom: 0;
            inset-inline-start: 0;

            width: 100%;
            height: 2px;

            background: var(--c-brand);

            visibility: hidden;

            transition: transform 0.3s ease-in-out;
            transform: scaleX(0);
        }

        &:hover {
            &::after {
                visibility: visible;
                transform: scaleX(1);
            }
        }

        a {
            color: inherit;
        }
    }

    .article-info {
        display: flex;
        flex-shrink: 0;
        margin-bottom: -10px;

        > span {
            margin-inline-end: 0.5em;
            line-height: 1.8;
            font-style: italic;
            font-size: 14px;
            color: #545454;
        }
    }

    .excerpt {
        max-height: 250px;
        overflow: hidden;

        h1 {
            display: none;
        }

        h2 {
            font-size: 1.2em;
        }

        h3 {
            font-size: 1.15em;
        }
    }

}
</style>
