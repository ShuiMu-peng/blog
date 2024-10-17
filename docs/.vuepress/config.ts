import {viteBundler} from '@vuepress/bundler-vite'
import {defaultTheme} from '@vuepress/theme-default'
import {defineUserConfig} from 'vuepress'
import {blogPlugin} from "@vuepress/plugin-blog";

export default defineUserConfig({
    base: '/blog/',
    bundler: viteBundler(),
    lang: 'zh-CN',
    title: '水木',
    description: '欢迎来到我的空间。',
    theme: defaultTheme({
        logo: '/logo.jpg',
        // home: 'Home',
        navbar: [
            '/',
            {
                text: '文章',
                link: '/article/',
            },
            {
                text: '标签',
                link: '/tag/',
            },
            {
                text: '分类',
                link: '/category/',
            },
            {
                text: '时间线',
                link: '/timeline/',
            },
        ]
    }),

    plugins: [
        blogPlugin({
            // Only files under posts are articles
            filter: ({filePathRelative}) =>
                filePathRelative ? filePathRelative.startsWith('posts/') : false,

            // Getting article info
            getInfo: ({frontmatter, title, data}) => {
                // 获取页面信息
                const info: Record<string, unknown> = {
                    title: title || '',
                    author: frontmatter.author || '',
                    categories: frontmatter.categories || [],
                    category: frontmatter.categories || [],
                    date: frontmatter.date || git.createdTime || null,
                    tags: frontmatter.tags || [],
                    excerpt: data.excerpt || '',
                }
                console.info('info:', info)
                return info
            }
            ,
            // Generate excerpt for all pages excerpt those users choose to disable
            excerptFilter: ({frontmatter}) =>
                !frontmatter.home &&
                frontmatter.excerpt !== false &&
                typeof frontmatter.excerpt !== 'string',
            category: [
                {
                    key: 'category',
                    getter: (page) => page.frontmatter.categories || [],
                    layout: 'Category',
                    itemLayout: 'Category',
                    frontmatter: () => ({
                        title: 'Categories',
                        sidebar: false,
                    }),
                    itemFrontmatter: (name) => ({
                        title: `Category ${name}`,
                        sidebar: false,
                    }),
                },
                {
                    key: 'tag',
                    getter: ({frontmatter}) => {
                        console.log(frontmatter.tags)
                        return frontmatter.tags || []
                    },
                    path: '/tag/',
                    layout: 'Tag',
                    frontmatter: () => ({title: '标签页', sidebar: false}),
                    itemPath: '/tag/:name/',
                    itemLayout: 'TagList',
                    itemFrontmatter: (name) => ({title: `${name}标签`, sidebar: false}),
                },
            ],

            type: [
                {
                    key: 'article',
                    // filter: (page) => !page.frontmatter.archive,
                    layout: 'Article',
                    frontmatter: () => ({
                        title: '文章',
                        sidebar: false
                    }),
                    // Sort pages with time and sticky
                    sorter: (pageA, pageB) => {
                        if (!pageB.frontmatter.date) return 1
                        if (!pageA.frontmatter.date) return -1

                        return (
                            new Date(pageB.frontmatter.date).getTime() -
                            new Date(pageA.frontmatter.date).getTime()
                        )
                    },
                },
                {
                    key: 'timeline',
                    // Only article with date should be added to timeline
                    filter: (page) => page.frontmatter.date instanceof Date,
                    // Sort pages with time
                    sorter: (pageA, pageB) =>
                        new Date(pageB.frontmatter.date).getTime() -
                        new Date(pageA.frontmatter.date).getTime(),
                    layout: 'Timeline',
                    frontmatter: () => ({
                        title: 'Timeline',
                        sidebar: false,
                    }),
                },
            ],
            hotReload: true,
        }),
    ],
})