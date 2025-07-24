import { shell } from "electron";
import { createServer as createHttpServer } from "http";
import { createServer as creatNetServer } from "net";
import superjson from "superjson";
import clientJS from "../dist/client.js_raw";
import clientHTML from "./debug.html";

let cacheLogs = [];
class Logs {
  constructor(logName) {
    this.logName = logName;
    return this.log.bind(this);
  }
  log(...args) {
    console.log(`[${this.logName}]`, ...args);
    cacheLogs.push([`[${this.logName}]`, ...args]);
  }
}
class WebLog {
  constructor() {
    this.server = createHttpServer(this.httpHandel.bind(this));
    this.port;
  }
  httpHandel(req, res) {
    // 处理日志请求
    if (req.url === "/" && req.method === "GET") {
      // 读取日志文件内容
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
      const log = superjson.stringify(cacheLogs);
      cacheLogs = [];
      res.end(log);
    } else if (req.url === "/debug" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" });
      res.end(clientHTML);
    } else if (req.url === "/debug.js" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(clientJS);
    } else {
      // 处理其他请求
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
      res.end("Not Found");
    }
  }
  start() {
    if (!this.server.listening) {
      this.port = (() => {
        const server = creatNetServer();
        server.listen(0);
        const { port } = server.address();
        server.close();
        return port;
      })();
      this.server.listen(this.port, () => {
        shell.openExternal(`http://localhost:${this.port}/debug`);
      });
    } else {
      shell.openExternal(`http://localhost:${this.port}/debug`);
    }
  }
  stop() {
    if (this.server.listening) {
      this.server.closeAllConnections();
      this.server.closeIdleConnections();
      this.server.close();
    }
  }
}
const webLog = new WebLog();

function ipcSendLog(args) {
  cacheLogs.push(["[send]", ...args]);
}

function ipcOnLog(args) {
  cacheLogs.push(["[receive]", ...args]);
}

export { Logs, webLog, ipcSendLog, ipcOnLog };
