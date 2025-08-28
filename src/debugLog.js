import { shell } from "electron";
import { createServer as createHttpServer } from "http";
import { createServer as creatNetServer } from "net";
import superjson from "superjson";
import clientJS from "../dist/client.js_raw";
import clientHTML from "./debug.html";

global.cacheLogs = [];
let pendingResponses = [];

class Logs {
  constructor(logName) {
    this.logName = logName;
    return this.log.bind(this);
  }
  log(...args) {
    console.log(`[${this.logName}]`, ...args);
    pushLog([`[${this.logName}]`, ...args]);
  }
}

function pushLog(entry) {
  global.cacheLogs.push(entry);
  if (pendingResponses.length > 0) {
    const log = superjson.stringify(global.cacheLogs);
    global.cacheLogs = [];
    for (const res of pendingResponses) {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
      res.end(log);
    }
    pendingResponses = [];
  }
}

class WebLog {
  constructor() {
    this.server = createHttpServer(this.httpHandel.bind(this));
    this.port;
  }
  httpHandel(req, res) {
    if (req.url === "/" && req.method === "GET") {
      if (global.cacheLogs.length > 0) {
        const log = superjson.stringify(global.cacheLogs);
        global.cacheLogs = [];
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
        res.end(log);
      } else {
        pendingResponses.push(res);
        req.on("close", () => {
          pendingResponses = pendingResponses.filter((r) => r !== res);
        });
        setTimeout(() => {
          pendingResponses = pendingResponses.filter((r) => r !== res);
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
          res.end("[]");
        }, 30000);
      }
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
  pushLog(["[send]", ...args]);
}

function ipcOnLog(args) {
  pushLog(["[receive]", ...args]);
}

export { Logs, webLog, ipcSendLog, ipcOnLog };
