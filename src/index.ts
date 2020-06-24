import { Compiler } from 'webpack';
import generateRoute from './generateRoute';
import { Options } from '../types';

const pluginName = 'RouteAutoGenerateWebpackPlugin';

class RouteAutoGenerateWebpackPlugin {
  private options: Partial<Options>;

  constructor(options: Partial<Options> = {}) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.afterPlugins.tap(pluginName, () => {
      generateRoute(this.options);
    });
  }
}

export { RouteAutoGenerateWebpackPlugin };
