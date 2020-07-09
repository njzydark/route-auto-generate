import fs from 'fs';
import appRoot from 'app-root-path';
import fg from 'fast-glob';
import chokidar from 'chokidar';
import prettier from 'prettier';

import vueTemplate from './vueTemplate';
import reactTemplate from './reactTemplate';
import { Options, RouteConfig } from '../types';

const options: Options = {
  routerLibraryName: 'vue-router',
  template: vueTemplate,
  routerPath: appRoot + '/src/router.js',
  pagesPath: appRoot + '/src/views',
  pagesAlias: '',
  routePrefix: '/',
  watch: true,
  asyncRoute: true,
  coverRoutes: [],
  redirectPath: '',
  chunkNamePrefix: 'pages'
};

function generateRouter(newOptions: Partial<Options> = {}) {
  Object.assign(options, newOptions);

  if (newOptions.template === undefined) {
    // set route template
    options.template = options.routerLibraryName === 'vue-router' ? vueTemplate : reactTemplate;
  }

  const { routerLibraryName, watch, pagesPath, routerPath } = options;

  const watcher = watch && chokidar.watch(['**/*'], { cwd: pagesPath, ignoreInitial: true });

  // set fast-glob pattern
  const patterns =
    routerLibraryName === 'vue-router'
      ? ['*.vue', '*.jsx', '*.tsx', '**/index.vue', '**/index.jsx', '**/index.tsx']
      : ['*.js', '*.jsx', '*.ts', '*.tsx', '**/index.js', '**/index.jsx', '**/index.ts', '**/index.tsx'];

  // get all files path
  const filesPath = new Set(fg.sync(patterns, { cwd: pagesPath }));

  // get routes from files path
  let routes = getRoutes(filesPath);
  let routesCode = getRoutesCode(routes);
  // write routes code to router file
  fs.writeFileSync(routerPath, getRouterFileCode(routesCode, routes));

  const standardFileFLag =
    routerLibraryName === 'vue-router'
      ? /(\/index\.vue$)|(^[a-zA-Z0-9-_:?$]*\.vue$)/
      : /(\/index\.(js|jsx|ts|tsx)$)|(^[a-zA-Z0-9-_:?$]*\.(js|jsx|ts|tsx)$)/;

  watcher &&
    watcher
      .on('add', filePath => {
        if (standardFileFLag.test(filePath)) {
          filesPath.add(filePath);
          routes = getRoutes(filesPath);
          routesCode = getRoutesCode(routes);
          fs.writeFileSync(routerPath, getRouterFileCode(routesCode, routes));
        }
      })
      .on('unlink', filePath => {
        if (standardFileFLag.test(filePath)) {
          filesPath.delete(filePath);
          routes = getRoutes(filesPath);
          routesCode = getRoutesCode(routes);
          fs.writeFileSync(routerPath, getRouterFileCode(routesCode, routes));
        }
      });

  return true;
}

function getRoutes(filesPath: Set<string>): RouteConfig[] {
  const { routePrefix, pagesAlias, pagesPath, chunkNamePrefix, coverRoutes, redirectPath, asyncRoute } = options;
  let filesPathArr = [...filesPath].sort();
  const routes = filesPathArr.map(filePath => {
    // filePath example: /about/index.vue or /about/index-id.vue or /about-id.vue
    const routeName = getRouteName(filePath, asyncRoute);
    const routePath = getRoutePath(filePath, routePrefix);
    const routeComponent = pagesAlias ? pagesAlias + filePath : pagesPath + '/' + filePath;
    const routeConfig: RouteConfig = {
      name: routeName,
      path: routePath,
      component: routeComponent,
      chunkNamePrefix,
      asyncRoute
    };
    return routeConfig;
  });
  if (coverRoutes.length) {
    const newRoutes = coverRoutes.map(item => {
      const { name = '', path, component, chunkNamePrefix: itemChunkNamePrefix, asyncRoute: itemAsyncRoute } = item;
      const routeConfig: RouteConfig = {
        name,
        path,
        component,
        chunkNamePrefix: itemChunkNamePrefix || chunkNamePrefix,
        asyncRoute: itemAsyncRoute !== undefined ? itemAsyncRoute : asyncRoute
      };
      return routeConfig;
    });
    routes.unshift(...newRoutes);
  }
  if (redirectPath) {
    routes.push({ path: redirectPath });
  }
  return routes;
}

function getRoutesCode(routes: RouteConfig[]) {
  const { template, routerLibraryName } = options;
  const routesCode = routes.map(item => template.routeTpl(item));
  return routesCode.join(routerLibraryName === 'vue-router' ? ',\n' : '\n');
}

function getRouterFileCode(routesCode: string, routes: RouteConfig[] = []) {
  const { template } = options;
  let syncRoutesImportCode = '';
  const syncRoutes = routes.filter(route => !route.asyncRoute);
  syncRoutesImportCode = syncRoutes
    .map(item => {
      return `import ${item.name} from "${item.component}"`;
    })
    .join('\n');
  return prettier.format(template.fileTpl(routesCode, syncRoutesImportCode), { parser: 'babel' });
}

function getRouteName(filePath: string, asyncRoute: boolean) {
  let routeName = filePath
    .split('.')[0]
    .split('/')
    .map((item, index) => {
      // remove parameters
      if (item.split('-').length > 1) {
        item = item.split('-')[0];
      } else if (item.split(':').length > 1) {
        item = item.split(':')[0];
      }
      // exclude this format: /about/index
      if (item === 'index' && index !== 0) {
        return '';
      } else {
        return item;
      }
    })
    .filter(item => !!item)
    .join('-');
  if (!asyncRoute) {
    if (/^([0-9])/.test(routeName)) {
      routeName = '_' + routeName;
    }
    routeName = routeName.replace('-', '');
  }
  return routeName;
}

function getRoutePath(filePath: string, routePrefix: string) {
  const routePath =
    routePrefix +
    filePath
      .split('.')[0]
      .split('/')
      .map(item => {
        if (item.split('-').length > 1) {
          item = item
            .split('-')
            .map(item => item.replace('$', '?'))
            .join('/:');
        } else if (item.split(':').length > 1) {
          item = item.split(':').join('/:');
        }
        return item === 'index' ? '' : item;
      })
      .filter(item => !!item)
      .join('/');
  return routePath;
}

function slash(filepath: string) {
  filepath.replace(/\\/g, '/');
}

export default generateRouter;
