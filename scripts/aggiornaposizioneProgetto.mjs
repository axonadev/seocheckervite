import { leggi, fai } from "./fRest.mjs"; // Funzione per leggere dal database
import ZenRowsConnection from "./zenrows.mjs"; // Classe per gestire ZenRows
import { SERVERAPI, AZIENDA } from "./env.mjs"; // Importa le variabili di ambiente
import { getAuthToken } from "./auth.mjs"; // Importa la funzione di login

const DB = "ProgettiSERP"; // Nome del database

export async function aggiornaPosizioneProgetto(IDOBJ, idStato) {
  // Ottieni il token di autenticazione
  const TOKEN = await getAuthToken(); // Funzione per ottenere il token di autenticazione

  if (!TOKEN) {
    console.error("Token di autenticazione non valido.");
    return;
  }

  const in_CtrlAzienda = AZIENDA;

  let max_SearchPage = 50;

  try {
    // 📥 1. Recupera Registro
    const dtReg = await leggi(
      SERVERAPI,
      TOKEN,
      "Registro",
      "Where Azienda='{AZIENDA}' AND Registro_Ambito='ProgettiSerp'"
    );

    // 📥 2. Recupera Progetto + Keywords
    const dtProgetto = await leggi(
      SERVERAPI,
      TOKEN,
      "SEO_AggiornaPosizione",
      `Where AZIENDA='{AZIENDA}' AND IDKEYW>0 AND IDProgetto=${IDOBJ} AND ProgettiSerp_Stato=${idStato}`
    );

    if (!dtProgetto || dtProgetto.Itemset.SEO_AggiornaPosizione.length === 0) {
      console.warn("Nessun progetto trovato per l'elaborazione.");
      return;
    }

    // 🧠 4. Estrai parametri da dtReg
    const maxPageFromReg = getRegistroValore(dtReg, "max_SearchPage");
    const ZenRows_Key = getRegistroValore(dtReg, "ZenRows_Key");

    console.log("DEBUG maxPageFromReg", maxPageFromReg);
    console.log("DEBUG ZenRows_Key", ZenRows_Key);

    if (maxPageFromReg) max_SearchPage = parseInt(maxPageFromReg);

    // 🔧 5. Processa le parole chiave
    const conn_zenrows = new ZenRowsConnection(ZenRows_Key);
    conn_zenrows.in_ctrlAzienda = in_CtrlAzienda;
    conn_zenrows.idStato = idStato;

    const drProgetto = dtProgetto.Itemset.SEO_AggiornaPosizione;

    for (const [i, row] of drProgetto.entries()) {
      const idKeyw = row.IDKEYW;

      for (let y = 0; y <= max_SearchPage; y += 10) {
        const zenRows = new ZenRowsConnection(ZenRows_Key, {});
        await zenRows.ControllaParola(
          row.ProgettiSerpKeyWords_Parole, // Parola chiave
          y, // Pagina di ricerca
          row.ProgettiSerp_DNS, // DNS del progetto
          idKeyw, // ID della parola chiave
          row.ProgettiSerp_GoogleRegione // Regione di Google
        );
      }
    }

    // ✅ 7. Reset stato progetto
    await resetStatoProgetto(SERVERAPI, TOKEN, DB, in_CtrlAzienda, IDOBJ);
  } catch (err) {
    console.error("Errore durante l'elaborazione del progetto:", err.message);
    await resetStatoProgetto(SERVERAPI, TOKEN, DB, in_CtrlAzienda, IDOBJ);
  }
}

// Funzione per estrarre un valore dal registro
function getRegistroValore(dtReg, chiave) {
  const reg = dtReg.Itemset.Registro;

  console.log("DEBUG reg", reg);

  console.warn("entra.");

  const row = reg.find((r) => r.Registro_Chiave == chiave);
  return row ? row.Registro_Valore : null;
}

// Funzione per resettare lo stato del progetto
async function resetStatoProgetto(SERVERAPI, TOKEN, DB, azienda, IDOBJ) {
  try {
    const jsonParametri = {
      sql: `UPDATE ProgettiSerp SET ProgettiSerp_Stato=0 WHERE Azienda='${azienda}' AND IDOBJ=${IDOBJ}`,
    };

    await fai(
      SERVERAPI,
      TOKEN,
      "axo_funzioni",
      "updateSql",
      jsonParametri,
      "ProgettiSerp"
    );
  } catch (err) {
    console.error(
      "Errore durante il reset dello stato del progetto:",
      err.message
    );
  }
}
