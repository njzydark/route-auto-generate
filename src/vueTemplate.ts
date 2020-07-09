import { RouteConfig } from "../types";

function routeTpl(config: RouteConfig) {
  const { name, path, component, chunkNamePrefix, asyncRoute } = config;
  let tpl;
  if (name === undefined) {
    // prettier-ignore
    tpl = `{
      path:"*",
      redirect:"${path}"
    }`;
  } else if (asyncRoute) {
    // prettier-ignore
    tpl = `{
      path: "${path}",
      name: "${name}",
      component: () => import(${chunkNamePrefix &&`/* webpackChunkName: "${chunkNamePrefix}-${name}" */`} "${component}")
    }`;
  } else {
    // prettier-ignore
    tpl = `{
      path: "${path}",
      name: "${name}",
      component: ${name}
    }`;
  }
  return tpl;
}

function fileTpl(routesCode: string, syncRoutesImportCode?: string) {
  // prettier-ignore
  return `
    import Vue from "vue";
    import Router from "vue-router";
    ${syncRoutesImportCode}

    Vue.use(Router);

    export default new Router({
      routes: [${routesCode}]
    });`;
}

export default {
  routeTpl,
  fileTpl
};
