const generateRoute = require("./lib/generateRoute");

const pluginName = "RouteAutoGenerateWebpackPlugin";

class RouteAutoGenerateWebpackPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.afterPlugins.tap(pluginName, () => {
      generateRoute(this.options);
    });
  }
}

module.exports = RouteAutoGenerateWebpackPlugin;
