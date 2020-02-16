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
