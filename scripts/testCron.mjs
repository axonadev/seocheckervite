import cron from "node-cron";
import fs from "fs";
import path from "path";

const logFilePath = "C:\\axona\\log\\testcron.txt";

// Pianifica ogni 5 minuti
cron.schedule("*/5 * * * *", () => {
  const now = new Date().toLocaleString();
  const logLine = `[${now}] Esecuzione cron ogni 5 minuti\n`;

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error("Errore nella scrittura del file:", err);
    } else {
      console.log("Log scritto con successo:", logLine.trim());
    }
  });
});

console.log("Scheduler avviato (ogni 5 minuti). Rimarrà in esecuzione...");
