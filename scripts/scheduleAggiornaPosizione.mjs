import { getAuthToken } from "./auth.mjs"; // Importa la funzione di login
import { leggi, scrivi } from "./fRest.mjs"; // Importa la funzione di lettura del DB
import { SERVERAPI } from "./env.mjs"; // Importa le variabili di ambiente
import { spawn } from "child_process"; // Per eseguire script in parallelo
import fs from "fs";

export async function parallelUpdateSchedule(manuale = false) {
  const Token = await getAuthToken(); // Ottieni il token di autenticazione
  const logFilePath = "C:\\axona\\log\\testcron.txt";
  try {
    // Leggi i dati dal database con stato > 99

    if (manuale) {
      const dtM = await leggi(
        SERVERAPI,
        Token,
        "ProgettiSERP",
        "WHERE AZIENDA='{AZIENDA}' AND ProgettiSerp_Stato = 10 ORDER BY ProgettiSerp_UltimoReport DESC"
      );

      try {
        if (
          dtM?.Itemset?.ProgettiSERP[0]?.IDOBJ == null ||
          dtM?.Itemset?.ProgettiSERP[0]?.IDOBJ == undefined
        ) {
          console.log("Nessun progetto trovato con stato = 10.");
          return;
        }
      } catch (error) {
        return;
      }

      //ciclo per aggiornare i progetti con stato = 10 in stato ProgettiSerp_Stato + 1000
      const progettiM = dtM.Itemset.ProgettiSERP;

      for (const progetto of progettiM) {
        const idProgetto = progetto?.IDOBJ || 0;
        console.log(
          `Aggiorno stato progetto IDOBJ: ${idProgetto} da 10 a +1000`
        );

        if (idProgetto > 0) {
          const resp = await scrivi(
            SERVERAPI,
            Token,
            idProgetto,
            "ProgettiSERP",
            "ProgettiSERPSel",
            {
              IDOBJ: idProgetto,
              ProgettiSerp_Stato: idProgetto + 1000,
            }
          );
        }
      }
    }

    const whereCondition = manuale
      ? "WHERE AZIENDA='{AZIENDA}' AND ProgettiSerp_Stato > 1000 ORDER BY ProgettiSerp_UltimoReport DESC"
      : "WHERE AZIENDA='{AZIENDA}' AND ProgettiSerp_Stato > 99 AND ProgettiSerp_Stato < 1000 ORDER BY ProgettiSerp_UltimoReport DESC";

    const dt = await leggi(SERVERAPI, Token, "ProgettiSERP", whereCondition);

    if (!dt?.Itemset?.ProgettiSERP) {
      console.log("Nessun progetto trovato con stato > 99.");
      return;
    }

    console.log("DEBUG dt", dt.Itemset.ProgettiSERP);

    const progetti = dt.Itemset.ProgettiSERP;

    const now = new Date().toLocaleString();
    const logLine = `[${now}] DEBUG dt ${JSON.stringify(progetti)}\n`;

    fs.appendFile(logFilePath, logLine, (err) => {
      if (err) {
        console.error("Errore nella scrittura del file:", err);
      } else {
        console.log("Log scritto con successo:", logLine.trim());
      }
    });

    // Esegui callAggiornamentoPosizione.mjs in parallelo per ogni progetto
    const promises = (Array.isArray(progetti) ? progetti : [progetti]).map(
      (progetto) => {
        return new Promise((resolve, reject) => {
          const idProgetto = progetto.IDOBJ;
          const statoProgetto = progetto.ProgettiSerp_Stato;

          if (!idProgetto || !statoProgetto) {
            console.warn(
              `Progetto con IDOBJ: ${idProgetto} o stato: ${statoProgetto} non valido.`
            );
            return resolve(); // Continua con il prossimo progetto
          }

          console.log(
            `Eseguo callAggiornamentoPosizione.mjs per IDOBJ: ${idProgetto}, Stato: ${statoProgetto}`
          );

          fs.appendFile(
            logFilePath,
            `Eseguo callAggiornamentoPosizione.mjs per IDOBJ: ${idProgetto}, Stato: ${statoProgetto}` +
              "\n",
            (err) => {
              if (err) {
                console.error("Errore nella scrittura del file:", err);
              } else {
                console.log("Log scritto con successo:", logLine.trim());
              }
            }
          );

          // Esegui lo script callAggiornamentoPosizione.mjs
          const process = spawn("node", [
            "C:\\siti\\scriptNodejs\\scripts\\callAggiornaPosizione.mjs",
            idProgetto,
            statoProgetto,
          ]);

          process.stdout.on("data", (data) => {
            console.log(`Output [IDOBJ: ${idProgetto}]: ${data}`);
          });

          process.stderr.on("data", (data) => {
            console.error(`Errore [IDOBJ: ${idProgetto}]: ${data}`);
            fs.appendFile(
              logFilePath,
              `Errore [IDOBJ: ${idProgetto}]: ${data}` + "\n",
              (err) => {
                if (err) {
                  console.error("Errore nella scrittura del file:", err);
                } else {
                  console.log("Log scritto con successo:", logLine.trim());
                }
              }
            );
          });

          process.on("close", (code) => {
            if (code === 0) {
              console.log(`Completato [IDOBJ: ${idProgetto}] con successo.`);
              resolve();
            } else {
              console.error(
                `Errore [IDOBJ: ${idProgetto}] con codice: ${code}`
              );
              reject(new Error(`Processo terminato con codice: ${code}`));
            }
          });
        });
      }
    );

    // Attendi che tutti i processi siano completati
    await Promise.all(promises);
    console.log("Tutti i processi completati con successo.");
  } catch (error) {
    console.error("Errore in parallelUpdateSchedule:", error);
  }
}
