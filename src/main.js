import { Logs, webLog, ipcSendLog, ipcOnLog } from "./debugLog.js";

const log = new Logs("ipc_logger");
console.log("插件已加载");

function onBrowserWindowCreated(window) {
  try {
    registerShortcut(window);
    proxyIpcMessage(window);
    proxySend(window);
  } catch (err) {
    log("出现错误" + err.message);
  }
  return window;
}

function registerShortcut(window) {
  window.webContents.on("before-input-event", async (event, input) => {
    if (input.key == "F2" && input.type == "keyUp") {
      webLog.start();
    }
  });
}

function proxyIpcMessage(window) {
  const ipc_message_proxy =
    window.webContents._events["-ipc-message"]?.[0] || window.webContents._events["-ipc-message"];
  const proxyIpcMsg = new Proxy(ipc_message_proxy, {
    apply(target, thisArg, args) {
      ipcOnLog(args);
      return target.apply(thisArg, args);
    },
  });
  if (window.webContents._events["-ipc-message"]?.[0]) {
    window.webContents._events["-ipc-message"][0] = proxyIpcMsg;
  } else {
    window.webContents._events["-ipc-message"] = proxyIpcMsg;
  }
}

function proxySend(window) {
  // 复写并监听ipc通信内容
  const originalSend = window.webContents.send;
  window.webContents.send = (...args) => {
    ipcSendLog(args);
    originalSend.call(window.webContents, ...args);
  };
}

if (global.qwqnt) {
  qwqnt.main.hooks.whenBrowserWindowCreated.on(onBrowserWindowCreated);
}

module.exports = { onBrowserWindowCreated };
