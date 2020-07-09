export type RouteConfig = {
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path: string;
  /** 路由文件地址 */
  component?: string;
  /** 自定义webpack chunkname */
  chunkNamePrefix?: string;
  /** 是否开启路由懒加载 */
  asyncRoute?: boolean;
};

type RouteTpl = (config: RouteConfig) => string;
type FileTpl = (routesCode: string, syncRoutesImportCode: string) => string;

export interface Options {
  /**
   * 路由库名称
   *
   * 默认为 vue-router
   */
  routerLibraryName: 'vue-router' | 'react-router';
  /**
   * 路由生成模板
   *
   * 默认为内置的 vueTemplate
   */
  template: {
    routeTpl: RouteTpl;
    fileTpl: FileTpl;
  };
  /**
   * 路由文件地址
   *
   * 默认为项目下的 src/router.js
   */
  routerPath: string;
  /**
   * 页面文件地址
   *
   * 默认为项目的 src/views目录
   */
  pagesPath: string;
  /**
   * 项目目录别名
   *
   * 例如 @代表src/
   *
   * 默认不使用目录别名
   */
  pagesAlias: string;
  /**
   * 路由公共前缀
   *
   * 默认不带有任何前缀
   */
  routePrefix: string;
  /**
   * 是否监听页面文件夹目录结构变化
   *
   * 在打包时请关闭此选项，不然不会自动退出打包流程
   *
   * 默认为 true
   */
  watch: boolean;
  /**
   * 是否开启路由懒加载
   *
   * 默认为 true
   */
  asyncRoute: boolean;
  /**
   * 需要覆盖的路由
   *
   * 此数组内配置的路由会放到所有路由的最前面
   *
   * 默认为空
   */
  coverRoutes: RouteConfig[];
  /**
   * 路由无法匹配时重定向路径
   *
   * 如果需要配置的话一定要配置一个存在的路径，不然会进入死循环
   *
   * 默认为空
   */
  redirectPath: string;
  /**
   * 自定义webpack chunkname
   *
   * 默认为 pages
   */
  chunkNamePrefix: string;
}
