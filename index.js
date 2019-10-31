const generateRoute = require("./lib/generateRoute");

const pluginName = "RouteAutoGenerateWebpackPlugin";

class RouteAutoGenerateWebpackPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.afterPlugins.tap(pluginName, () => {
      console.log(this.options);
      generateRoute(this.options);
    });
  }
}

module.exports = RouteAutoGenerateWebpackPlugin;
