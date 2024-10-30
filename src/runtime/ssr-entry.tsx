import { App } from './App';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

// For ssr component render
// 增加路由传参
export function render(pagePath: string) {
  return renderToString(
    <StaticRouter location={pagePath}>
      <App />
    </StaticRouter>
  );
}

// 导出路由数据
export { routes } from 'island:routes';
