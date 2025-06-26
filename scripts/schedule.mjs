import cron from "node-cron";
import fs from "fs";
import { spawn } from "child_process";

import { updateSchedule } from "./updateSchedule.mjs";
import { parallelUpdateSchedule } from "./scheduleAggiornaPosizione.mjs"; // Importa la funzione per l'aggiornamento parallelo
import { updateImgSite } from "./updateImgSite.mjs"; // Importa la funzione per l'aggiornamento delle immagini

const logFilePath = "C:\\axona\\log\\testcron.txt";

// Funzione per eseguire l'aggiornamento in parallelo
cron.schedule("10 4 * * *", () => {
  const now = new Date().toLocaleString();
  console.log("AVVIO SCHEDULE", new Date().toLocaleString());
  updateSchedule();

  const logLine = `[${now}] "AVVIO SCHEDULE"\n`;

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error("Errore nella scrittura del file:", err);
    } else {
      console.log("Log scritto con successo:", logLine.trim());
    }
  });
});

// Pianifica ogni giorno alle 05:00
cron.schedule("0 5 * * *", () => {
  const now = new Date().toLocaleString();
  console.log("Esecuzione pianificata di parallelUpdateSchedule alle 05:00.");
  parallelUpdateSchedule();

  const logLine = `[${now}] "Esecuzione pianificata di parallelUpdateSchedule"\n`;

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error("Errore nella scrittura del file:", err);
    } else {
      console.log("Log scritto con successo:", logLine.trim());
    }
  });
});

// Pianifica ogni giorno alle 03:00
cron.schedule("0 6 * * *", () => {
  // Esegui la funzione
  const now = new Date().toLocaleString();
  console.log("AVVIO UPDIMG", `[${now}] \n`);
  updateImgSite();

  const logLine = `[${now}] "AVVIO UPDIMG"\n`;

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error("Errore nella scrittura del file:", err);
    } else {
      console.log("Log scritto con successo:", logLine.trim());
    }
  });
});

// 📧 INVIO AUTOMATICO REPORT PDF - Ogni 5 minuti (TEST)
cron.schedule("*/2 * * * *", () => {
  const now = new Date().toLocaleString();
  console.log("🚀 AVVIO INVIO AUTOMATICO REPORT PDF", now);

  const logLine = `[${now}] "AVVIO INVIO AUTOMATICO REPORT PDF"\n`;

  // Esegui il script sendAutoReports.js
  const reportProcess = spawn("node", ["scripts/sendAutoReports.js"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  reportProcess.on("close", (code) => {
    const endTime = new Date().toLocaleString();
    const endLogLine = `[${endTime}] "FINE INVIO AUTOMATICO REPORT PDF - Exit code: ${code}"\n`;
    console.log(`✅ Script invio report completato con exit code: ${code}`);

    fs.appendFile(logFilePath, endLogLine, (err) => {
      if (err) {
        console.error("Errore nella scrittura del file log finale:", err);
      }
    });
  });

  reportProcess.on("error", (err) => {
    const errorTime = new Date().toLocaleString();
    const errorLogLine = `[${errorTime}] "ERRORE INVIO AUTOMATICO REPORT PDF: ${err.message}"\n`;
    console.error("❌ Errore nell'esecuzione script invio report:", err);

    fs.appendFile(logFilePath, errorLogLine, (err) => {
      if (err) {
        console.error("Errore nella scrittura del file log errore:", err);
      }
    });
  });

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error("Errore nella scrittura del file:", err);
    } else {
      console.log("Log scritto con successo:", logLine.trim());
    }
  });
});

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

// Pianifica ogni 1 minuti
cron.schedule("*/1 * * * *", () => {
  const now = new Date().toLocaleString();
  const logLine = `[${now}] Esecuzione cron ogni 1 minuti\n`;
  parallelUpdateSchedule(true);
});
