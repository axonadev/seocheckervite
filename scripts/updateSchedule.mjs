import cron from "node-cron";
import { getAuthToken } from "./auth.mjs"; // Importa la funzione di login
import { leggi, fai } from "./fRest.mjs"; // Importa la funzione di lettura del DB
import { SERVERAPI } from "./env.mjs"; // Importa le variabili di ambiente

async function updateSchedule() {
  const Token = await getAuthToken(); // Ottieni il token di autenticazione

  const dtMax = await leggi(
    SERVERAPI,
    Token,
    "SEO_MaxGruppoUpdate",
    "WHERE AZIENDA='{AZIENDA}'"
  );

  try {
    // Leggi i dati dal database
    const dt = await leggi(
      SERVERAPI,
      Token,
      "ProgettiSERP",
      "WHERE AZIENDA='{AZIENDA}' and ProgettiSerp_Stato<>2  ORDER BY ProgettiSerp_UltimoReport DESC"
    );

    if (!dt || dt.length === 0) {
      console.log("Nessun progetto trovato.");
      return;
    }

    console.log("DEBUG dt", dt);

    const progetti = dt.Itemset.ProgettiSERP;

    // Calcola il nuovo gruppo
    let ultimoGruppo = progetti[0].ProgettiSerp_GruppoUpdate || 0;
    ultimoGruppo += 1;

    if (
      new Date().getDate() < 20 &&
      ultimoGruppo > dtMax.Itemset.SEO_MaxGruppoUpdate[0].maxGruppo
    ) {
      ultimoGruppo = 1;
    }

    // Esegui l'aggiornamento sul database
    const queryClasse = `
      UPDATE ProgettiSerp
      SET ProgettiSerp_Stato=100 + IDOBJ,
          ProgettiSerp_UltimoReport='${new Date().toISOString()}'
      WHERE AZIENDA='{AZIENDA}' AND ProgettiSerp_Stato=0
        AND ProgettiSerp_GruppoUpdate=${ultimoGruppo}
    `;

    console.log("DEBUG queryClasse", queryClasse);

    const UpdPj = {
      Sql: queryClasse,
    };

    const response = await fai(
      SERVERAPI,
      Token,
      "axo_funzioni",
      "updateSql",
      UpdPj
    );

    if (response.error) {
      console.error("Errore durante l'aggiornamento:", response.error);
    } else {
      console.log("Aggiornamento completato con successo.");
    }
  } catch (error) {
    console.error("Errore in updateSchedule:", error);
  }
}

// Pianifica ogni giorno alle 03:00
cron.schedule("0 4 * * *", () => {
  // Esegui la funzione
  updateSchedule();
});
