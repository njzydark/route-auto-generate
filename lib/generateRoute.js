const fs = require("fs");
const appRoot = require("app-root-path");
const fg = require("fast-glob");
const chokidar = require("chokidar");
const prettier = require("prettier");

function generateRoute(options = {}) {
  const {
    // 框架
    framework = "vue",
    // 路由文件地址
    routerPath = appRoot + "/src/router.js",
    // 页面文件地址
    pagesPath = appRoot + "/src/views",
    // 路由公共前缀
    routePrefix = "/"
  } = options;

  const patterns = framework === "vue" ? ["*.vue", "**/index.vue"] : ["*.js", "*.jsx", "**/index.js", "**/index.jsx"];
  const watcher = chokidar.watch(patterns, { cwd: pagesPath, ignoreInitial: true });

  // 获取所有vue文件路径
  const files = new Set(fg.sync(patterns, { cwd: pagesPath }));

  let routes = filesToRoutes(files, routePrefix, pagesPath, framework);
  fs.writeFileSync(routerPath, setRouterTemplate(routes, framework));

  watcher
    .on("add", file => {
      files.add(file);
      routes = filesToRoutes(files, routePrefix, pagesPath, framework);
      fs.writeFileSync(routerPath, setRouterTemplate(routes, framework));
    })
    .on("unlink", file => {
      files.delete(file);
      routes = filesToRoutes(files, routePrefix, pagesPath, framework);
      fs.writeFileSync(routerPath, setRouterTemplate(routes, framework));
    });
}

// 根据获取的页面文件地址输出路由代码
function filesToRoutes(files, routePrefix, pagesPath, framework) {
  files = [...files].sort();
  const routes = files.map(file => {
    // 获取路由名称
    const name = file
      .split(".")[0]
      .split("/")
      .map((item, index) => {
        if (item.split("-").length > 1) {
          item = item.split("-")[0];
        } else if (item.split(":").length > 1) {
          item = item.split(":")[0];
        }
        if (item === "index" && index !== 0) {
          return "";
        } else {
          return item;
        }
      })
      .filter(item => !!item)
      .join("-");
    // 获取路由地址
    const path =
      routePrefix +
      file
        .split(".")[0]
        .split("/")
        .map(item => {
          if (item.split("-").length > 1) {
            item = item
              .split("-")
              .map(item => item.replace("$", "?"))
              .join("/:");
          } else if (item.split(":").length > 1) {
            item = item.split(":").join("/:");
          }
          return item === "index" ? "" : item;
        })
        .filter(item => !!item)
        .join("/");
    // 获取路由文件地址
    const component = pagesPath + "/" + file;
    return framework === "vue"
      ? `{ name: "${name}", path: "${path}", component: () => import("${component}") }`
      : `<Route
    exact
    path="${path}"
    component={Loadable({
      loader: () => import("${component}"),
      loading: Loading,
      delay: 300
    })}
  />`;
  });
  return routes.join(framework === "vue" ? ",\n" : "\n");
}

// 根据获取的路由代码完成路由文件并格式化代码
function setRouterTemplate(routes, framework) {
  if (framework === "vue") {
    return prettier.format(`
    import Vue from "vue";
    import Router from "vue-router";
    Vue.use(Router);
    export default new Router({
      routes: [
        ${routes}
      ]
    });
    `);
  } else {
    return prettier.format(`
    import React, { Component } from 'react';
    import { Switch, Route } from 'react-router-dom';
    import Loadable from 'react-loadable';
    const Loading = () => {
      return (
        <div />
      );
    };
    export default class RouteView extends Component {
      render() {
        return (
          <Switch>
            ${routes}
          </Switch>
        )
      }
    };
    `);
  }
}

function slash(filepath) {
  filepath.replace(/\\/g, "/");
}

module.exports = generateRoute;
