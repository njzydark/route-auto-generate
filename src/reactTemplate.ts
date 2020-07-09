import { RouteConfig } from '../types';

function routeTpl(config: RouteConfig) {
  const { name, path, component, chunkNamePrefix, asyncRoute } = config;
  let tpl;
  if (name === undefined) {
    // prettier-ignore
    tpl = `<Redirect to="${path}" />`;
  } else if (asyncRoute) {
    // prettier-ignore
    tpl = `
    <Route
      exact
      path="${path}"
      component={Loadable(() => import(${chunkNamePrefix &&`/* webpackChunkName: "${chunkNamePrefix}-${name}" */`} "${component}"))}
    />`;
  } else {
    // prettier-ignore
    tpl = `
    <Route exact path="${path}" component={${name}} />`;
  }
  return tpl;
}

function fileTpl(routesCode: string, syncRoutesImportCode?: string) {
  // prettier-ignore
  return `
    import React, { Component } from 'react';
    import { Switch, Route, Redirect } from 'react-router-dom';
    import Loadable from '@loadable/component'
    ${syncRoutesImportCode}

    export default class RouteView extends Component {
      render() {
        return (
          <Switch>
            ${routesCode}
          </Switch>
        )
      }
    };`;
}

export default {
  routeTpl,
  fileTpl
};
