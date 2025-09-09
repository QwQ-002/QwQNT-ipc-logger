import { Logs, webLog, ipcSendLog, ipcOnLog } from "./debugLog.js";
global.Logs = Logs;

const log = new Logs("ipc_logger");
log("已加载");

IpcInterceptor.onIpcSend(ipcSendLog);
IpcInterceptor.onIpcReceive(ipcOnLog);

function onBrowserWindowCreated(window) {
  try {
    registerShortcut(window);
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
