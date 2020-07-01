export type RouteConfig = {
  name: string;
  path: string;
  component?: string;
  chunkNamePrefix?: null | string;
};

type RouteTpl = (config: RouteConfig) => string;
type FileTpl = (routes: string) => string;

export interface Options {
  /** 框架 */
  framework: 'vue' | 'react';
  /** 路由生成模板 */
  template: {
    routeTpl: RouteTpl;
    fileTpl: FileTpl;
  };
  /** 路由文件地址 */
  routerPath: string;
  /** 页面文件地址 */
  pagesPath: string;
  /** 项目目录别名 例如@代表src/ */
  pagesAlias: null | string;
  /** 路由公共前缀 */
  routePrefix: string;
  /** 是否监听页面文件夹目录结构变化 */
  watch: boolean;
  /** 需要覆盖的路由 {name path component} */
  coverRoutes: {
    name: string;
    path: string;
    component: string;
  }[];
  /** 路由无法匹配时重定向路径 */
  redirectPath: null | string;
  /** 自定义webpack chunkname */
  chunkNamePrefix: null | string;
}
