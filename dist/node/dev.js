"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevServer = createDevServer;
const vite_1 = require("vite");
const indexHtml_1 = require("./plugin-island/indexHtml");
const plugin_react_1 = require("@vitejs/plugin-react");
async function createDevServer(root = process.cwd()) {
    return (0, vite_1.createServer)({
        root,
        plugins: [(0, indexHtml_1.pluginIndexHtml)(), (0, plugin_react_1.default)()]
    });
}
