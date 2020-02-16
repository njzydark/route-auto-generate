# route-auto-generate

webpack插件，根据页面所在目录的结构自动生成路由文件

## 特色

- 根据页面目录结构自动生成
- 支持基础路由和动态路由
- 支持vue和react
- 路由生成模板支持自定义
- 热更新

## 使用

这里以vue-cli生成的项目为例

```bash
npm install --save-dev route-auto-generate
```

在webpack配置文件中引入，如果是vue-cli生成的项目请在vue.config.js引入

```js
const path = require("path");
const RouteAutoGenerateWebpackPlugin = require("route-auto-generate");

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/")
      }
    },
    plugins: [
      new RouteAutoGenerateWebpackPlugin({
        routerPath: path.resolve(__dirname, "./src/router.js"),
        pagesPath: path.resolve(__dirname, "./src/views"),
        pagesAlias: "@/views/"
      })
    ]
  }
};
```

## 选项

初始化插件时可以进行以下配置：

| 名称         | 类型    | 默认值                     | 描述                                                         |
| ------------ | :------ | -------------------------- | ------------------------------------------------------------ |
| framework    | string  | vue                        | 所使用的框架                                                 |
| routerPath   | string  | appRoot + "/src/router.js" | 路由文件路径 必须是绝对路径                                  |
| pagesPath    | string  | appRoot + "/src/views"     | 页面文件夹路径 必须是绝对路径                                |
| pagesAlias   | string  | null                       | 项目路径别名 比如@/views/代表src/views/ 如果不实用别名，路由的path将使用绝对路径 |
| routerPrefix | string  | /                          | 路由公共前缀                                                 |
| template     | object  | vueTemplate\|reactTemplate | 路由生成模板                                                 |
| watch        | boolean | true                       | 是否监听文件目录变化                                         |
| coverRoutes  | Array   | []                         | 需要覆盖的路由                                               |

## 目录文件夹命名格式

用`-`符分割参数，`$`符表示参数可选

页面目录结构：

```json
pages/
--| tag-id/
-----| index.vue
--| category-id$/
-----| index.vue
--| home.vue
--| index.vue
```

生成的路由文件

```js
routes: [
  {
    path: "/cateory/:id?",
    name: "cateory",
    component: () => import(/* webpackChunkName: "pages-cateory" */ "@/views/cateory-id$/index.vue")
  },
  {
    path: "/home",
    name: "home",
    component: () => import(/* webpackChunkName: "pages-home" */ "@/views/home.vue")
  },
  {
    path: "/",
    name: "index",
    component: () => import(/* webpackChunkName: "pages-index" */ "@/views/index.vue")
  },
  {
    path: "/tag/:id",
    name: "tag",
    component: () => import(/* webpackChunkName: "pages-tag" */ "@/views/tag-id/index.vue")
  }
]
```

## 路由生成模板

### reactTemplate

```js
const tpl = {
  routeTpl: (name, path, component) => `<Route
  exact
  path="${path}"
  component={Loadable(() => import(/* webpackChunkName: "pages-${name}" */ "${component}"))}
/>`,
  fileTpl: routes => `import React, { Component } from 'react';
  import { Switch, Route } from 'react-router-dom';
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

### vueTemplate

```js
const tpl = {
  routeTpl: (name, path, component) => `{
    path: "${path}",
    name: "${name}",
    component:() => import(/* webpackChunkName: "pages-${name}" */ "${component}")
  }`,
  fileTpl: routes => `import Vue from "vue";
  import Router from "vue-router";

  Vue.use(Router);

  export default new Router({
    routes: [${routes}]
  });`
};

module.exports = tpl;
```

### 自定义

你可以根据自己的实际需求编写自己的template文件，然后初始化插件时配置template即可

## 注意事项

1. 在react项目中使用时@loadable/component和react-router-dom需要自行安装
2. 在vue项目中vue-router需要自行安装
3. watch默认打开，如果需要打包部署生产时请手动关闭，不然不会自动退出

## TODO

- 嵌套路由
