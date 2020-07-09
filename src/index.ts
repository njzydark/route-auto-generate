import { Compiler } from 'webpack';
import generateRouter from './generateRoute';
import { Options } from '../types';

class RouteAutoGenerateWebpackPlugin {
  private options: Partial<Options>;

  constructor(options: Partial<Options>) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.afterPlugins.tap('RouteAutoGenerateWebpackPlugin', () => {
      generateRouter(this.options);
    });
  }
}

export { RouteAutoGenerateWebpackPlugin };
