# route-auto-generate

webpack插件，根据页面所在目录自动生成路由文件

## 特色

- 根据页面目录自动生成
- 支持基础路由和动态路由
- 支持vue和react
- 热更新

## 使用

```bash
npm install --save-dev route-auto-generate
```

在webpack配置文件中引入，如果是vue-cli生成的项目请在vue.config.js引入

```js
const path = require("path");
const RouteAutoGenerateWebpackPlugin = require("route-auto-generate");

module.exports = {
  ...
  configureWebpack: {
    ...
    plugins: [
      new RouteAutoGenerateWebpackPlugin({
        framework: "vue",
        routerPath: path.resolve(__dirname, "./src/router.js"),
        pagesPath: path.resolve(__dirname, "./src/views"),
        routePrefix: "/"
      })
    ]
    ...
  }
  ...
};
```

## 参数

初始化插件时可以传入以下参数：

| 参数         | 可选                                       | 默认值                     |
| ------------ | :----------------------------------------- | -------------------------- |
| framework    | vue/react                                  | vue                        |
| routerPath   | path.resolve(__dirname, "./src/router.js") | appRoot + "/src/router.js" |
| pagesPath    | path.resolve(__dirname, "./src/views")     | appRoot + "/src/views"     |
| routerPrefix | /                                          | /                          |

## 路由格式

用`-`符分割参数，`$`符表示参数可选

页面目录结构：

```json
pages/
--| tag-id$/
-----| index.vue
--| blog-id/
-----| index.vue
--| about:id?/
-----| index.vue
--| index.vue
```

生成的路由文件

```js
routes: [
    {
      name: 'index',
      path: '/',
      component: 'pages/index.vue'
    },
    {
      name: 'blog',
      path: '/blog/:id',
      component: 'pages/blog/index.vue'
    },
    {
      name: 'tag',
      path: '/tag/:id?',
      component: 'pages/tag/index.vue'
    },
    {
      name: 'about',
      path: '/about/:id?',
      component: 'pages/tag/index.vue'
    }
  ]
```

## TODO

- 嵌套路由
