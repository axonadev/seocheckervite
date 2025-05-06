import fs from "fs";
import path from "path";
import { leggi, fai } from "./fRest.mjs"; // Funzione per leggere dal database
import ZenRowsConnection from "./zenrows.mjs"; // Classe per gestire ZenRows
import { SERVERAPI, AZIENDA } from "./env.mjs"; // Importa le variabili di ambiente
import { getAuthToken } from "./auth.mjs"; // Importa la funzione di login

const DB = "NomeDelDatabase";

export async function aggiornaPosizioneProgetto(IDOBJ, idStato, pathFile) {
  // Ottieni il token di autenticazione
  const TOKEN = await getAuthToken(); // Funzione per ottenere il token di autenticazione

  if (!TOKEN) {
    console.error("Token di autenticazione non valido.");
    return;
  }

  const in_CtrlAzienda = AZIENDA;
  const fileImport = pathFile || "";
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

    // 🧱 3. Crea directory necessarie
    creaDirectory([
      "C:/Axona/fileimport",
      `C:/Axona/fileimport/${idStato}`,
      "C:/Axona/fileimport/elaborati",
      `C:/Axona/fileimport/${idStato}/elaborati`,
      fileImport,
    ]);

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
        const logLine = `[CONTROLLA PAROLA] [IDOBJ];${idKeyw};${i}/${drProgetto.length - 1} - ${y}/${max_SearchPage}\n`;
        scriviLog(fileImport, IDOBJ, logLine);

        const zenRows = new ZenRowsConnection(ZenRows_Key, {});
        await zenRows.ControllaParola(
          row.ProgettiSerpKeyWords_Parole, // Parola chiave
          y, // Pagina di ricerca
          row.ProgettiSerp_DNS, // DNS del progetto
          idKeyw, // ID della parola chiave
          IDOBJ, // ID del progetto
          row.ProgettiSerp_GoogleRegione, // Regione di Google
          fileImport // Percorso del file
        );

        /* await conn_zenrows.ControllaParola(
          row.ProgettiSerpKeyWords_Parole, // Parola chiave
          y, // Pagina di ricerca
          row.ProgettiSerp_DNS, // DNS del progetto
          idKeyw, // ID della parola chiave
          IDOBJ, // ID del progetto
          row.ProgettiSerp_GoogleRegione, // Regione di Google
          fileImport // Percorso del file
        ); */
      }
    }

    // 📁 6. Sposta file nella directory padre
    spostaFile(fileImport, IDOBJ, idStato);

    // ✅ 7. Reset stato progetto
    await resetStatoProgetto(SERVERAPI, TOKEN, DB, in_CtrlAzienda, IDOBJ);
  } catch (err) {
    console.error("Errore durante l'elaborazione del progetto:", err.message);
  }
}

// Funzione per creare directory
function creaDirectory(directories) {
  for (const dir of directories) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      console.warn(
        `Errore nella creazione della directory ${dir}:`,
        err.message
      );
    }
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

// Funzione per scrivere log
function scriviLog(fileImport, IDOBJ, logLine) {
  try {
    const logPath = path.join(fileImport, `${IDOBJ}.txt`);
    fs.appendFileSync(logPath, logLine);
  } catch (err) {
    console.error("Errore durante la scrittura del log:", err.message);
  }
}

// Funzione per spostare file
function spostaFile(fileImport, IDOBJ, idStato) {
  try {
    const oldPath = path.join(fileImport, `${IDOBJ}.txt`);
    const newPath = path.join(
      fileImport.replace(`\\${idStato}`, ""),
      `${IDOBJ}.txt`
    );
    fs.renameSync(oldPath, newPath);

    // Attendi finché il file non esiste nella nuova posizione
    while (!fs.existsSync(newPath)) {
      setTimeout(() => {}, 500);
    }
  } catch (err) {
    console.error("Errore durante lo spostamento del file:", err.message);
  }
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
