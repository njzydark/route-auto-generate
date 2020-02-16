const fs = require("fs");
const appRoot = require("app-root-path");
const fg = require("fast-glob");
const chokidar = require("chokidar");
const prettier = require("prettier");

const reactTemplate = require("./reactTemplate");
const vueTemplate = require("./vueTemplate");

function generateRoute(options = {}) {
  const {
    // 框架
    framework = "vue",
    // 路由文件地址
    routerPath = appRoot + "/src/router.js",
    // 页面文件地址
    pagesPath = appRoot + "/src/views",
    // 项目目录别名 例如@代表src/
    pagesAlias = null,
    // 路由公共前缀
    routePrefix = "/",
    // 模板 routeTpl fileTpl
    template = framework === "vue" ? vueTemplate : reactTemplate,
    // 是否监听页面文件夹目录结构变化
    watch = true,
    // 需要覆盖的路由 {name path component}
    coverRoutes = []
  } = options;

  const standardFileFLag =
    framework === "vue"
      ? /(\/index\.vue$)|(^[a-zA-Z0-9-_:?$]*\.vue$)/
      : /(\/index\.(js|jsx)$)|(^[a-zA-Z0-9-_:?$]*\.(js|jsx)$)/;
  const patterns = framework === "vue" ? ["*.vue", "**/index.vue"] : ["*.js", "*.jsx", "**/index.js", "**/index.jsx"];
  const watcher = watch && chokidar.watch(["**/*"], { cwd: pagesPath, ignoreInitial: true });

  // 获取所有页面入口文件路径
  const files = new Set(fg.sync(patterns, { cwd: pagesPath }));

  let routes = filesToRoutes(files, routePrefix, pagesPath, pagesAlias, framework, coverRoutes, template);
  fs.writeFileSync(routerPath, setRouterTemplate(routes, template));

  watch &&
    watcher
      .on("add", file => {
        if (standardFileFLag.test(file)) {
          files.add(file);
          routes = filesToRoutes(files, routePrefix, pagesPath, pagesAlias, framework, coverRoutes, template);
          fs.writeFileSync(routerPath, setRouterTemplate(routes, template));
        }
      })
      .on("unlink", file => {
        if (standardFileFLag.test(file)) {
          files.delete(file);
          routes = filesToRoutes(files, routePrefix, pagesPath, pagesAlias, framework, coverRoutes, template);
          fs.writeFileSync(routerPath, setRouterTemplate(routes, template));
        }
      });
  return true;
}

// 根据获取的页面文件地址输出路由代码
function filesToRoutes(files, routePrefix, pagesPath, pagesAlias, framework, coverRoutes, template) {
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
    const component = pagesAlias ? pagesAlias + file : pagesPath + "/" + file;
    return template.routeTpl(name, path, component);
  });
  if (coverRoutes.length) {
    const temp = coverRoutes.map(item => {
      const { name = "", path, component } = item;
      return template.routeTpl(name, path, component);
    });
    routes.unshift(...temp);
  }
  return routes.join(framework === "vue" ? ",\n" : "\n");
}

// 根据获取的路由代码完成路由文件并格式化代码
function setRouterTemplate(routes, template) {
  return prettier.format(template.fileTpl(routes), { parser: "babel" });
}

function slash(filepath) {
  filepath.replace(/\\/g, "/");
}

module.exports = generateRoute;
