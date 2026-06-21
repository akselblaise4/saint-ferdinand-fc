import fs from "fs";
import path from "path";

const LOG_DIR = "data/logs";
fs.mkdirSync(LOG_DIR, { recursive: true });

const logFile = path.join(LOG_DIR, `bot-${new Date().toISOString().split("T")[0]}.log`);
const detailedLogFile = path.join(LOG_DIR, `bot-detailed-${Date.now()}.log`);

function timestamp() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function writeLog(level, msg) {
  const line = `[${timestamp()}] [${level}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + "\n");
}

export const logger = {
  info: (msg) => writeLog("INFO", msg),
  warn: (msg) => writeLog("WARN", msg),
  error: (msg) => writeLog("ERROR", msg),
  debug: (msg) => writeLog("DEBUG", msg),
  success: (msg) => writeLog("OK", msg),

  detailed: (label, data) => {
    const line = `[${timestamp()}] [DETAIL] ${label}: ${JSON.stringify(data).substring(0, 2000)}`;
    fs.appendFileSync(detailedLogFile, line + "\n");
  },

  saveReport: (name, data, dir = "data") => {
    const p = `${dir}/${name}`;
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    logger.success(`${name} (${(fs.statSync(p).size / 1024).toFixed(0)} KB)`);
    return p;
  },

  getLogPath: () => logFile,
  getDetailedLogPath: () => detailedLogFile,
};
