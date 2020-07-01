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
