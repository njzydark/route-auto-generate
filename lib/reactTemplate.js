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
