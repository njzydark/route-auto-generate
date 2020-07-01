# route-auto-generate

WebpackPlugin

## 特色

- 根据页面目录结构自动生成路由文件
- 支持基础路由和动态路由
- 支持 vue-router 和 react-router
- 可配置路由前缀
- 可以进行路由覆盖
- 可以配置重定向路由
- 可自定义 WebpackChunkName
- 路由生成模板支持自定义
- 自动监听目录结构变化并更新路由文件

## 使用

这里以 vue-cli 生成的项目为例

```bash
npm install --save-dev route-auto-generate
```

在 webpack 配置文件中引入，如果是 vue-cli 生成的项目请在 vue.config.js 引入

```js
const path = require("path");
const { RouteAutoGenerateWebpackPlugin } = require("route-auto-generate");

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/"),
      },
    },
    plugins: [
      new RouteAutoGenerateWebpackPlugin({
        routerPath: path.resolve(__dirname, "./src/router.js"),
        pagesPath: path.resolve(__dirname, "./src/views"),
        pagesAlias: "@/views/",
      }),
    ],
  },
};
```

## 选项

初始化插件时可以进行以下配置：

| 名称            | 类型             | 默认值                     | 描述                                                         |
| --------------- | :--------------- | -------------------------- | ------------------------------------------------------------ |
| framework       | vue \| react | vue                        | 所使用的框架                                                 |
| routerPath      | string           | appRoot + "/src/router.js" | 路由文件路径 必须是绝对路径                                  |
| pagesPath       | string           | appRoot + "/src/views"     | 页面文件夹路径 必须是绝对路径                                |
| pagesAlias      | null \| string   | null                       | 项目路径别名 比如@/views/代表src/views/ 如果不实用别名，路由的path将使用绝对路径 |
| routerPrefix    | string           | /                          | 路由公共前缀                                                 |
| template        | object           | vueTemplate \| reactTemplate | 路由生成模板  |
| watch           | boolean          | true                       | 是否监听文件目录变化                                         |
| coverRoutes     | Array            | [{name,path,component}]    | 需要覆盖的路由                                               |
| redirectPath    | null \| string           | null                 | 当路由无法匹配时进行重定向的路径         |
| chunkNamePrefix | string           | pages                      | webpack chunk name 前缀，null则不生成chunkname               |

## 命名格式

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

```ts
import { RouteConfig } from "../types";

function routeTpl(config: RouteConfig) {
  const { name, path, component, chunkNamePrefix } = config;
  let tpl;
  if (name === 'redirectPath') {
    tpl = `{
      path:"*",
      redirect:"${path}"
    }`;
  } else if (chunkNamePrefix === null) {
    tpl = `{
      path: "${path}",
      name: "${name}",
      component:() => import("${component}")
    }`;
  } else {
    tpl = `{
      path: "${path}",
      name: "${name}",
      component:() => import(/* webpackChunkName: "${chunkNamePrefix}-${name}" */ "${component}")
    }`;
  }
  return tpl;
}

function fileTpl(routes: string) {
  return `
    import Vue from "vue";
    import Router from "vue-router";

    Vue.use(Router);

    export default new Router({
      routes: [${routes}]
    });`;
}

export default {
  routeTpl,
  fileTpl
};
```

### vueTemplate

```ts
import { RouteConfig } from '../types';

function routeTpl(config: RouteConfig) {
  const { name, path, component, chunkNamePrefix } = config;
  let tpl;
  if (name === 'redirectPath') {
    tpl = `{
      path:"*",
      redirect:"${path}"
    }`;
  } else if (chunkNamePrefix === null) {
    tpl = `{
      path: "${path}",
      name: "${name}",
      component:() => import("${component}")
    }`;
  } else {
    tpl = `{
      path: "${path}",
      name: "${name}",
      component:() => import(/* webpackChunkName: "${chunkNamePrefix}-${name}" */ "${component}")
    }`;
  }
  return tpl;
}

function fileTpl(routes: string) {
  return `
    import Vue from "vue";
    import Router from "vue-router";

    Vue.use(Router);

    export default new Router({
      routes: [${routes}]
    });`;
}

export default {
  routeTpl,
  fileTpl
};
```

### 自定义

你可以根据自己的实际需求编写自己的 template 文件，然后初始化插件时配置 template 即可

## 路由覆盖

某些情况下自动生成的路由顺序你可能不满意，需要调整，那么你可以使用`coverRoutes`这个配置项来自定义你需要覆盖的路由，也就是把他们放到最前面，其中`name`,`path`,`component`都是必填项，用来定义路由名称，路由路径和路由文件所在位置

```js
new RouteAutoGenerateWebpackPlugin({
  routerPath: path.resolve(__dirname, "./src/router.js"),
  pagesPath: path.resolve(__dirname, "./src/views"),
  pagesAlias: "@/views/",
  coverRoutes: [
    {
      name: 'index',
      path: '/',
      component: '@/views/about/index.vue'
    }
  ],
})
```

## 注意事项

1. 在 React 项目中使用时`@loadable/component`和`react-router-dom`需要自行安装
2. 在 Vue 项目中`vue-router`需要自行安装
3. watch 默认打开，如果需要打包部署生产环境时请手动关闭，不然不会自动退出

## TODO

- 嵌套路由
