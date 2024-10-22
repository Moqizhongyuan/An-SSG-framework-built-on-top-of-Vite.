import { cac } from "cac";
import { createDevServer } from "./dev";

const version = require("../../package.json").version;

const cli = cac("island").version(version).help();

cli
  .command("dev [root]", "start dev server")
  .action(async (root: string) => {
    // 添加以下逻辑
    const server = await createDevServer(root);
    await server.listen();
    server.printUrls();
  });

cli
  .command("build [root]", "build for production")
  .action(async (root: string) => {
    console.log("build", root);
  });

cli.parse();
