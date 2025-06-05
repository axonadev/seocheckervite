import { getAuthToken } from "./auth.mjs"; // Importa la funzione di login
import { leggi } from "./fRest.mjs"; // Importa la funzione di lettura del DB
import { SERVERAPI } from "./env.mjs"; // Importa le variabili di ambiente
import { spawn } from "child_process"; // Per eseguire script in parallelo

export async function parallelUpdateSchedule() {
  const Token = await getAuthToken(); // Ottieni il token di autenticazione

  try {
    // Leggi i dati dal database con stato > 99
    const dt = await leggi(
      SERVERAPI,
      Token,
      "ProgettiSERP",
      "WHERE AZIENDA='{AZIENDA}' AND ProgettiSerp_Stato > 99 ORDER BY ProgettiSerp_UltimoReport DESC"
    );

    if (!dt?.Itemset?.ProgettiSERP) {
      console.log("Nessun progetto trovato con stato > 99.");
      return;
    }

    console.log("DEBUG dt", dt.Itemset.ProgettiSERP);

    const progetti = dt.Itemset.ProgettiSERP;

    // Esegui callAggiornamentoPosizione.mjs in parallelo per ogni progetto
    const promises = progetti.map((progetto) => {
      return new Promise((resolve, reject) => {
        const idProgetto = progetto.IDOBJ;
        const statoProgetto = progetto.ProgettiSerp_Stato;

        console.log(
          `Eseguo callAggiornamentoPosizione.mjs per IDOBJ: ${idProgetto}, Stato: ${statoProgetto}`
        );

        // Esegui lo script callAggiornamentoPosizione.mjs
        const process = spawn("node", [
          "scripts/callAggiornaPosizione.mjs",
          idProgetto,
          statoProgetto,
        ]);

        process.stdout.on("data", (data) => {
          console.log(`Output [IDOBJ: ${idProgetto}]: ${data}`);
        });

        process.stderr.on("data", (data) => {
          console.error(`Errore [IDOBJ: ${idProgetto}]: ${data}`);
        });

        process.on("close", (code) => {
          if (code === 0) {
            console.log(`Completato [IDOBJ: ${idProgetto}] con successo.`);
            resolve();
          } else {
            console.error(`Errore [IDOBJ: ${idProgetto}] con codice: ${code}`);
            reject(new Error(`Processo terminato con codice: ${code}`));
          }
        });
      });
    });

    // Attendi che tutti i processi siano completati
    await Promise.all(promises);
    console.log("Tutti i processi completati con successo.");
  } catch (error) {
    console.error("Errore in parallelUpdateSchedule:", error);
  }
}
