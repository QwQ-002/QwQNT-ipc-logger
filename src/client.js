import superjson from "superjson";

window.superjson = superjson;

const port = location.port;
console.log("通信端口", port);

async function poll() {
  try {
    let logs = superjson.parse(await (await fetch(`http://localhost:${port}/`)).text());

    if (logs && logs.length) {
      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        if (log?.[4]?.[1]?.[0] === "info" || log?.[2]?.eventName === "ns-LoggerApi-2") {
          continue;
        }
        switch (log[0]) {
          case "[send]":
            log[0] = `%c[send]`;
            log.splice(1, 0, "background:#87e8de;color:#000000D9;padding:2px 4px;border-radius: 4px;width:56px;");
            break;
          case "[receive]":
            log[0] = `%c[receive]`;
            log.splice(1, 0, "background:#b7eb8f;color:#000000D9;padding:2px 4px;border-radius: 4px;width:56px;");
            break;
          default:
            log[0] = `%c${log[0]}`;
            log.splice(1, 0, "background:#ffdc00;color:#000000D9;padding:2px 4px;border-radius: 4px;");
        }
        console.log(...log);
      }
    }
  } catch (err) {
    if (err.message === "Failed to fetch") {
      console.log("=========已断开连接=========");
      return; // 断线后不再轮询
    } else {
      console.log("解码出错", err.message);
    }
  }
  // 请求完成后立即再次发起
  poll();
}

poll();
