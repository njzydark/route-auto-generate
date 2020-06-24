import fs from 'fs';
import appRoot from 'app-root-path';
import fg from 'fast-glob';
import chokidar from 'chokidar';
import prettier from 'prettier';

import vueTemplate from './vueTemplate';
import reactTemplate from './reactTemplate';
import { Options } from '../types';

const options: Options = {
  framework: 'vue',
  template: vueTemplate,
  routerPath: appRoot + '/src/router.js',
  pagesPath: appRoot + '/src/views',
  pagesAlias: null,
  routePrefix: '/',
  watch: true,
  coverRoutes: [],
  redirectPath: '',
  chunkNamePrefix: 'pages'
};

function generateRoute(newOptions: Partial<Options> = {}) {
  Object.assign(options, newOptions);
  options.template = options.framework === 'vue' ? vueTemplate : reactTemplate;

  const { framework, watch, pagesPath, routerPath } = options;

  const patterns =
    framework === 'vue'
      ? ['*.vue', '**/index.vue']
      : ['*.js', '*.jsx', '*.ts', '*.tsx', '**/index.js', '**/index.jsx', '**/index.ts', '**/index.tsx'];

  const watcher = watch && chokidar.watch(['**/*'], { cwd: pagesPath, ignoreInitial: true });

  // 获取所有页面入口文件路径
  const files = new Set(fg.sync(patterns, { cwd: pagesPath }));

  let routes = filesToRoutes(files);
  fs.writeFileSync(routerPath, setRouterTemplate(routes));

  const standardFileFLag =
    framework === 'vue'
      ? /(\/index\.vue$)|(^[a-zA-Z0-9-_:?$]*\.vue$)/
      : /(\/index\.(js|jsx|ts|tsx)$)|(^[a-zA-Z0-9-_:?$]*\.(js|jsx|ts|tsx)$)/;

  watcher &&
    watcher
      .on('add', file => {
        if (standardFileFLag.test(file)) {
          files.add(file);
          routes = filesToRoutes(files);
          fs.writeFileSync(routerPath, setRouterTemplate(routes));
        }
      })
      .on('unlink', file => {
        if (standardFileFLag.test(file)) {
          files.delete(file);
          routes = filesToRoutes(files);
          fs.writeFileSync(routerPath, setRouterTemplate(routes));
        }
      });
  return true;
}

// 根据获取的页面文件地址输出路由代码
function filesToRoutes(files: Set<string>) {
  const {
    routePrefix,
    pagesAlias,
    pagesPath,
    chunkNamePrefix,
    coverRoutes,
    template,
    redirectPath,
    framework
  } = options;
  let filesArr = [...files].sort();
  const routes = filesArr.map(file => {
    // 获取路由名称
    const name = file
      .split('.')[0]
      .split('/')
      .map((item, index) => {
        if (item.split('-').length > 1) {
          item = item.split('-')[0];
        } else if (item.split(':').length > 1) {
          item = item.split(':')[0];
        }
        if (item === 'index' && index !== 0) {
          return '';
        } else {
          return item;
        }
      })
      .filter(item => !!item)
      .join('-');
    // 获取路由地址
    const path =
      routePrefix +
      file
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
    // 获取路由文件地址
    const component = pagesAlias ? pagesAlias + file : pagesPath + '/' + file;
    return template.routeTpl({ name, path, component, chunkNamePrefix });
  });
  if (coverRoutes.length) {
    const temp = coverRoutes.map(item => {
      const { name = '', path, component } = item;
      return template.routeTpl({ name, path, component, chunkNamePrefix });
    });
    routes.unshift(...temp);
  }
  if (redirectPath) {
    routes.push(
      template.routeTpl({
        name: 'redirectPath',
        path: redirectPath
      })
    );
  }
  return routes.join(framework === 'vue' ? ',\n' : '\n');
}

// 根据获取的路由代码完成路由文件并格式化代码
function setRouterTemplate(routes: string) {
  const { template } = options;
  return prettier.format(template.fileTpl(routes), { parser: 'babel' });
}

function slash(filepath: string) {
  filepath.replace(/\\/g, '/');
}

export default generateRoute;
