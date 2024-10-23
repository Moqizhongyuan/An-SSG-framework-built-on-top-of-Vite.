import { cac } from 'cac';
import { createDevServer } from './dev';
import { build } from './build';
import { resolve } from 'path';

const version = '0.0.1';

const cli = cac('island').version(version).help();

cli.command('dev [root]', 'start dev server').action(async (root: string) => {
  // 添加以下逻辑
  const server = await createDevServer(root);
  await server.listen();
  server.printUrls();
});

cli
  .command('build [root]', 'build for production')
  .action(async (root: string) => {
    try {
      root = resolve(root);
      await build(root);
    } catch (e) {
      console.log(e);
    }
  });

cli.parse();
