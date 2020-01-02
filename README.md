# route-auto-generate

webpack插件，根据页面所在目录自动生成路由文件

## 特色

- 根据页面目录自动生成
- 支持基础路由和动态路由
- 支持vue和react
- 路由生成模板支持自定义
- 热更新

## 使用

```bash
npm install --save-dev route-auto-generate
```

创建路由模板文件

```javascript
const tpl = {
  routeTpl: (path, component) => `<Route
  exact
  path="${path}"
  component={Loadable(() => import("${component}"))}
/>`,
  fileTpl: routes => `import React, { Component } from 'react';
  import { Switch, Route } from 'react-router-dom';
  // import Loadable from 'react-loadable';
  import Loadable from '@loadable/component'
  export default class RouteView extends Component {
    render() {
      return (
        <Switch>
          ${routes}
        </Switch>
      )
    }
  };`
};

module.exports = tpl;
```

在webpack配置文件中引入，如果是vue-cli生成的项目请在vue.config.js引入

```js
const path = require("path");
const RouteAutoGenerateWebpackPlugin = require("route-auto-generate");
// 引入路由模板
const RouterViewTpl = require("./src/routerView.template");

module.exports = {
  ...
  configureWebpack: {
    ...
    plugins: [
      new RouteAutoGenerateWebpackPlugin({
        framework: "react",
        routerPath: path.resolve(__dirname, "./src/routeView.js"),
        pagesPath: path.resolve(__dirname, "./src/pages"),
        template: RouterViewTpl,
        coverRoutes: [
          {
            path: "/",
            component: "./pages/home-tabType$"
          },
          {
            path: "/index",
            component: "./pages/index"
          },
          {
            path: "/index/:channel",
            component: "./pages/home-tabType$"
          }
        ]
      }),
    ]
    ...
  }
  ...
};
```

## 参数

初始化插件时可以传入以下参数：

| 参数         | 可选                                       | 默认值                     | 描述             |
| ------------ | :----------------------------------------- | -------------------------- | ---------------- |
| framework    | vue/react                                  | vue                        | 框架             |
| routerPath   | path.resolve(__dirname, "./src/router.js") | appRoot + "/src/router.js" | 路由文件地址     |
| pagesPath    | path.resolve(__dirname, "./src/views")     | appRoot + "/src/views"     | 页面地址         |
| routerPrefix | /                                          | /                          | 路由前缀         |
| template     |                                            | {}                         | 路由文件生成模板 |
| coverRoutes  |                                            | []                         | 需要覆盖的路由   |

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
