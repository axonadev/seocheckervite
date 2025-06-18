import cron from "node-cron";
import fs from "fs";

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
