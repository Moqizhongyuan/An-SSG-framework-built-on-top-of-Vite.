import {
  CLIENT_ENTRY_PATH,
  EXTERNALS,
  MASK_SPLITTER,
  PACKAGE_ROOT,
  SERVER_ENTRY_PATH,
  createVitePlugins
} from "./chunk-FP5IHPDT.mjs";
import {
  preview
} from "./chunk-TF4XUG75.mjs";
import {
  resolveConfig
} from "./chunk-YF5UCQ4B.mjs";

// src/node/cli.ts
import { cac } from "cac";

// src/node/build.ts
import { build as viteBuild } from "vite";
import path, { dirname, join } from "path";
import fs from "fs-extra";
var CLIENT_OUTPUT = "build";
async function bundle(root, config) {
  const resolveViteConfig = async (isServer) => ({
    mode: "production",
    root,
    plugins: await createVitePlugins(config, void 0, isServer),
    ssr: {
      noExternal: ["react-router-dom", "lodash-es"]
    },
    build: {
      minify: false,
      ssr: isServer,
      outDir: isServer ? path.join(root, ".temp") : path.join(root, CLIENT_OUTPUT),
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm"
        },
        external: EXTERNALS
      }
    }
  });
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(await resolveViteConfig(false)),
      // server build
      viteBuild(await resolveViteConfig(true))
    ]);
    const publicDir = join(root, "public");
    if (fs.pathExistsSync(publicDir)) {
      await fs.copy(publicDir, join(root, CLIENT_OUTPUT));
    }
    await fs.copy(join(PACKAGE_ROOT, "vendors"), join(root, CLIENT_OUTPUT));
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}
async function buildIslands(root, islandPathToMap) {
  const islandsInjectCode = `
    ${Object.entries(islandPathToMap).map(
    ([islandName, islandPath]) => `import { ${islandName} } from '${islandPath}'`
  ).join("")}
window.ISLANDS = { ${Object.keys(islandPathToMap).join(", ")} };
window.ISLAND_PROPS = JSON.parse(
  document.getElementById('island-props').textContent
);
  `;
  const injectId = "island:inject";
  return viteBuild({
    mode: "production",
    esbuild: {
      jsx: "automatic"
    },
    build: {
      outDir: path.join(root, ".temp"),
      rollupOptions: {
        input: injectId,
        external: EXTERNALS
      }
    },
    plugins: [
      {
        name: "island:inject",
        enforce: "post",
        resolveId(id) {
          if (id.includes(MASK_SPLITTER)) {
            const [originId, importer] = id.split(MASK_SPLITTER);
            return this.resolve(originId, importer, { skipSelf: true });
          }
          if (id === injectId) {
            return id;
          }
        },
        load(id) {
          if (id === injectId) {
            return islandsInjectCode;
          }
        },
        generateBundle(_, bundle2) {
          for (const name in bundle2) {
            if (bundle2[name].type === "asset") {
              delete bundle2[name];
            }
          }
        }
      }
    ]
  });
}
async function renderPages(render, routes, root, clientBundle) {
  console.log("Rendering page in server side...");
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  return Promise.all(
    [
      ...routes,
      {
        path: "/404"
      }
    ].map(async (route) => {
      const routePath = route.path;
      const helmetContext = {
        context: {}
      };
      const {
        appHtml,
        islandToPathMap,
        islandProps = []
      } = await render(routePath, helmetContext.context);
      const styleAssets = clientBundle.output.filter(
        (chunk) => chunk.type === "asset" && chunk.fileName.endsWith(".css")
      );
      const islandBundle = await buildIslands(root, islandToPathMap);
      const islandsCode = islandBundle.output[0].code;
      const normalizeVendorFilename = (fileName2) => fileName2.replace(/\//g, "_") + ".js";
      const { helmet } = helmetContext.context;
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    ${helmet?.title?.toString() || ""}
    ${helmet?.meta?.toString() || ""}
    ${helmet?.link?.toString() || ""}
    ${helmet?.style?.toString() || ""}
    <meta name="description" content="xxx">
    ${styleAssets.map((item) => `<link rel="stylesheet" href="/${item.fileName}">`).join("\n")}
    <script type="importmap">
      {
        "imports": {
          ${EXTERNALS.map(
        (name) => `"${name}": "/${normalizeVendorFilename(name)}"`
      ).join(",")}
        }
      }
    </script>
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module">${islandsCode}</script>
    <script type="module" src="/${clientChunk?.fileName}"></script>
    <script id="island-props">${JSON.stringify(islandProps)}</script>
  </body>
</html>`.trim();
      const fileName = routePath.endsWith("/") ? `${routePath}index.html` : `${routePath}.html`;
      await fs.ensureDir(join(root, "build", dirname(fileName)));
      await fs.writeFile(join(root, "build", fileName), html);
    })
  );
}
async function build(root = process.cwd(), config) {
  const [clientBundle] = await bundle(root, config);
  const serverEntryPath = join(root, ".temp", "ssr-entry.js");
  const { render, routes } = await import(serverEntryPath);
  try {
    await renderPages(render, routes, root, clientBundle);
  } catch (e) {
    console.log("Render page error.\n", e);
  }
}

// src/node/cli.ts
import { resolve } from "path";
var version = "0.0.1";
var cli = cac("island").version(version).help();
cli.command("dev [root]", "start dev server").action(async (root) => {
  const createServer = async () => {
    const { createDevServer } = await import("./dev.mjs");
    const server = await createDevServer(root, async () => {
      await server.close();
      await createServer();
    });
    await server.listen();
    server.printUrls();
  };
  await createServer();
});
cli.command("build [root]", "build for production").action(async (root) => {
  try {
    root = resolve(root);
    const config = await resolveConfig(root, "build", "production");
    await build(root, config);
  } catch (e) {
    console.log(e);
  }
});
cli.command("preview [root]", "preview production build").option("--port <port>", "port to use for preview server").action(async (root, { port }) => {
  try {
    root = resolve(root);
    await preview(root, { port });
  } catch (e) {
    console.log(e);
  }
});
cli.parse();
