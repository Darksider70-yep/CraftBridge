const { spawn } = require("node:child_process");
const http = require("node:http");
const readline = require("node:readline");
const qrcode = require("qrcode-terminal");

const metroPort = process.env.EXPO_METRO_PORT || "8081";
const expoProcess = spawn(
  "npx",
  [
    "expo",
    "start",
    "--tunnel",
    "--port",
    metroPort,
    "--clear",
  ],
  {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
    env: process.env,
  },
);

let qrPrinted = false;
let manifestPollStarted = false;

function maybePrintQr(line) {
  if (qrPrinted) {
    return;
  }

  const match = line.match(/exp:\/\/[^\s]+/);
  if (!match) {
    return;
  }

  const expoUrl = match[0];
  qrPrinted = true;

  console.log("\n=== Expo Go QR (Docker) ===");
  console.log(expoUrl);
  qrcode.generate(expoUrl, { small: true });
  console.log("===========================\n");
}

function printQrFromHostUri(hostUri) {
  if (qrPrinted || !hostUri) {
    return;
  }
  const expoUrl = `exp://${hostUri}`;
  qrPrinted = true;
  console.log("\n=== Expo Go QR (Docker) ===");
  console.log(expoUrl);
  qrcode.generate(expoUrl, { small: true });
  console.log("===========================\n");
}

function pollManifestForQr() {
  if (manifestPollStarted || qrPrinted) {
    return;
  }
  manifestPollStarted = true;

  const interval = setInterval(() => {
    if (qrPrinted) {
      clearInterval(interval);
      return;
    }

    const request = http.get(
      {
        host: "127.0.0.1",
        port: Number(metroPort),
        path: "/",
        timeout: 1500,
      },
      (response) => {
        let raw = "";
        response.on("data", (chunk) => {
          raw += chunk.toString();
        });
        response.on("end", () => {
          try {
            const manifest = JSON.parse(raw);
            const hostUri =
              manifest?.extra?.expoClient?.hostUri || manifest?.extra?.expoGo?.debuggerHost;
            if (hostUri) {
              printQrFromHostUri(hostUri);
              clearInterval(interval);
            }
          } catch {
            // Ignore until manifest becomes available.
          }
        });
      },
    );

    request.on("error", () => {
      // Ignore connection errors while Metro is booting.
    });
    request.on("timeout", () => {
      request.destroy();
    });
  }, 2000);
}

const stdoutReader = readline.createInterface({ input: expoProcess.stdout });
stdoutReader.on("line", (line) => {
  console.log(line);
  maybePrintQr(line);
  if (line.includes("Logs for your project will appear below.")) {
    pollManifestForQr();
  }
});

const stderrReader = readline.createInterface({ input: expoProcess.stderr });
stderrReader.on("line", (line) => {
  console.error(line);
});

expoProcess.on("close", (code) => {
  process.exit(code ?? 1);
});

process.on("SIGINT", () => {
  expoProcess.kill("SIGINT");
});

process.on("SIGTERM", () => {
  expoProcess.kill("SIGTERM");
});
