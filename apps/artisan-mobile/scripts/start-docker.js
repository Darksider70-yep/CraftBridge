const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const readline = require("node:readline");
const qrcode = require("qrcode-terminal");

const metroPort = process.env.EXPO_METRO_PORT || "8081";
const requestedMode = (
  process.env.EXPO_DOCKER_START_MODE ||
  process.env.EXPO_START_MODE ||
  "lan"
).toLowerCase();
const expoMode = ["lan", "tunnel", "localhost"].includes(requestedMode)
  ? requestedMode
  : "lan";
const isDockerRuntime =
  process.env.EXPO_DOCKER_QR === "1" ||
  process.env.RUNNING_IN_DOCKER === "true" ||
  fs.existsSync("/.dockerenv");

console.log(
  `[start-docker] Launching Expo with --${expoMode} on port ${metroPort}`,
);
const expoProcess = spawn(
  "npx",
  [
    "expo",
    "start",
    `--${expoMode}`,
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
  if (!isDockerRuntime || qrPrinted) {
    return;
  }

  const normalizedLine = line.replace(/\u001b\[[0-9;]*m/g, "");
  const match = normalizedLine.match(/exp:\/\/[^\s]+/);
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
  if (!isDockerRuntime || qrPrinted || !hostUri) {
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
  if (!isDockerRuntime || manifestPollStarted || qrPrinted) {
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
            const hostUriMatch = raw.match(/"hostUri"\s*:\s*"([^"]+)"/);
            const hostUri = hostUriMatch?.[1];
            if (hostUri) {
              printQrFromHostUri(hostUri);
              clearInterval(interval);
            }
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
  if (
    line.includes("Logs for your project will appear below.") ||
    line.includes("Starting Metro Bundler")
  ) {
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
