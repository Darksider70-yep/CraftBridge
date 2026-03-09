const { spawn } = require("node:child_process");
const readline = require("node:readline");
const qrcode = require("qrcode-terminal");

const expoProcess = spawn(
  "npx",
  [
    "expo",
    "start",
    "--tunnel",
    "--port",
    "8081",
    "--clear",
  ],
  {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
    env: process.env,
  },
);

let qrPrinted = false;

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

const stdoutReader = readline.createInterface({ input: expoProcess.stdout });
stdoutReader.on("line", (line) => {
  console.log(line);
  maybePrintQr(line);
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
