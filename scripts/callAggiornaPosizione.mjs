import { aggiornaPosizioneProgetto } from "./aggiornaposizioneProgetto.mjs";

// Leggi i parametri dalla riga di comando
const IDOBJ = process.argv[2]; // Primo parametro: IDOBJ
const idStato = process.argv[3]; // Secondo parametro: idStato
//const pathFile = process.argv[4] || "C:/Axona/fileimport/" + idStato; // Terzo parametro: pathFile (opzionale)

try {
  console.error("[IDOBJ: " + IDOBJ + "] [idStato: " + idStato + "] ");
} catch (error) {}

try {
  console.error(process.argv);
} catch (error) {}

if (!IDOBJ || !idStato) {
  console.error("Errore: Devi specificare IDOBJ e idStato come parametri.");
  process.exit(1);
}

// Richiama la funzione principale
aggiornaPosizioneProgetto(IDOBJ, idStato);
