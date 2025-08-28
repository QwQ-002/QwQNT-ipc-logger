import { Logs, webLog, ipcSendLog, ipcOnLog } from "./debugLog.js";

const log = new Logs("ipc_logger");
log("已加载");

function onBrowserWindowCreated(window) {
  try {
    if (global.IpcInterceptor) {
      registerShortcut(window);
      global.Logs = Logs;
      IpcInterceptor.onIpcSend(ipcSendLog);
      IpcInterceptor.onIpcReceive(ipcOnLog);
    } else {
      throw new Error("未找到 IpcInterceptor，请安装前置插件 QWQNT-IpcInterceptor");
    }
  } catch (err) {
    log("出现错误" + err.message);
  }
}

function registerShortcut(window) {
  window.webContents.on("before-input-event", async (event, input) => {
    if (input.key == "F2" && input.type == "keyUp") {
      webLog.start();
    }
  });
}

if (global.qwqnt) {
  qwqnt.main.hooks.whenBrowserWindowCreated.peek(onBrowserWindowCreated);
}

module.exports = { onBrowserWindowCreated };
