import { RouteConfig } from '../types';

function routeTpl(config: RouteConfig) {
  const { name, path, component, chunkNamePrefix } = config;
  let tpl;
  if (name === 'redirectPath') {
    tpl = `<Redirect to="${path}" />`;
  } else if (chunkNamePrefix === null) {
    tpl = `
    <Route
      exact
      path="${path}"
      component={Loadable(() => import("${component}"))}
    />`;
  } else {
    tpl = `
    <Route
      exact
      path="${path}"
      component={Loadable(() => import(/* webpackChunkName: "${chunkNamePrefix}-${name}" */ "${component}"))}
    />`;
  }
  return tpl;
}

function fileTpl(routes: string) {
  return `
    import React, { Component } from 'react';
    import { Switch, Route, Redirect } from 'react-router-dom';
    import Loadable from '@loadable/component'

    export default class RouteView extends Component {
      render() {
        return (
          <Switch>
            ${routes}
          </Switch>
        )
      }
    };`;
}

export default {
  routeTpl,
  fileTpl
};
