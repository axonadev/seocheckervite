// Script per invio automatico report PDF via Resend
// Da pianificare ogni 25 del mese
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAuthToken } from "./auth.mjs";
import { SERVERAPI, AZIENDA } from "./env.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// INSERISCI QUI LA TUA API KEY RESEND
const resend = new Resend("re_8TTB2zGr_FhEp4Sgn4iLq6p6C8PLb3m5H");

// Funzione per formattare le date (equivalente a FormatDate nel frontend)
function FormatDate(date, format) {
  const d = new Date(date);
  if (format === "yyyyMMdd") {
    return (
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0")
    );
  } else if (format === "dd-MM-yyyy") {
    return (
      String(d.getDate()).padStart(2, "0") +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      d.getFullYear()
    );
  }
  return d.toISOString();
}

// Funzione per caricare un'immagine locale come base64
function loadLocalImageAsBase64(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️ [IMAGE] File non trovato: ${imagePath}`);
      return null;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString("base64");
    console.log(
      `✅ [IMAGE] Immagine locale caricata: ${path.basename(imagePath)} (${Math.round((base64.length * 0.75) / 1024)} KB)`
    );

    // Determina il formato dall'estensione
    const ext = path.extname(imagePath).toLowerCase();
    const imageFormat = ext === ".png" ? "PNG" : "JPEG";

    return {
      data: base64,
      format: imageFormat,
    };
  } catch (error) {
    console.log(
      `❌ [IMAGE] Errore nel caricamento immagine locale ${imagePath}: ${error.message}`
    );
    return null;
  }
}

// Funzione per convertire PDF in Base64 (Node.js compatible)
async function convertPdfToBase64(pdfDoc) {
  try {
    // Get PDF as array buffer
    const pdfArrayBuffer = pdfDoc.output("arraybuffer");
    // Convert to Buffer and then to base64
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    return pdfBuffer.toString("base64");
  } catch (error) {
    console.error("Error converting PDF to base64:", error);
    throw error;
  }
}

// Funzione per uploadare il PDF sul server
async function uploadPdfReport(projectId, token, base64, fileName, reportDate) {
  try {
    let dateStr = reportDate;
    if (reportDate instanceof Date) {
      dateStr = reportDate.toISOString().split("T")[0];
    }

    const UpdPj = {
      b64: base64,
      estensione: ".pdf",
      nomefile: fileName,
      cartellasalvataggio: `reports/${projectId}/${dateStr}`,
      pathiisdaregistro: "true",
    };

    const formData = {
      Token: token,
      Idobj: projectId,
      Modulo: "Upload B64",
      Classe: "axo_funzioni",
      DB: "",
      Funzione: "salvaDocumento",
      Parametri: "[" + JSON.stringify(UpdPj) + "]",
    };

    const response = await fetch(SERVERAPI + "/api/axo_sel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `Server responded with status: ${response.status}`,
        };
      }
      console.error("PDF upload error response:", errorData);
      throw new Error(
        errorData.message || `Errore upload PDF (status: ${response.status})`
      );
    }

    console.log(
      `✅ PDF caricato con successo sul server per progetto ${projectId}`
    );
    return true;
  } catch (error) {
    console.error("PDF upload fetch error:", error);
    throw new Error(`Errore di rete durante upload PDF: ${error.message}`);
  }
}

// Funzione per generare automaticamente il PDF usando le keywords di una data specifica
async function generateAutoPdfReport(project, keywords, dateString) {
  try {
    if (!keywords || keywords.length === 0) {
      console.warn(
        `PDF Generation: No keywords data available for project ${project.IDOBJ}`
      );
      return null;
    }

    console.log(
      `🔍 Analizzando ${keywords.length} keywords per progetto ${project.IDOBJ}:`
    );

    const filteredKeywords = keywords.filter((kw) => {
      const pos =
        kw.posizione || kw.position || kw.Posizione || kw.KeywordSerp_Posizione;
      return (
        pos &&
        ((typeof pos === "number" && pos >= 1 && pos <= 10) ||
          (typeof pos === "string" &&
            parseInt(pos) >= 1 &&
            parseInt(pos) <= 10))
      );
    });

    console.log(
      `📊 Keywords found in positions 1-10: ${filteredKeywords.length} su ${keywords.length}`
    );

    if (filteredKeywords.length === 0) {
      console.warn(
        `No keywords found in positions 1-10 for project ${project.IDOBJ} on date ${dateString}`
      );
      return null;
    }

    console.log(
      `Generating PDF for project ${project.IDOBJ} with ${filteredKeywords.length} keywords in top 10`
    );

    // Carica le immagini locali
    console.log(`📷 [PDF] Caricamento immagini locali dal progetto...`);

    const publicPath = path.join(__dirname, "..", "public");
    const logoPath = path.join(publicPath, "icon", "logo.png");
    const posizionamentoPath = path.join(publicPath, "posizionamento.png");

    console.log(`📁 [PDF] Directory public: ${publicPath}`);

    const logoImage = loadLocalImageAsBase64(logoPath);
    const posizionamentoImage = loadLocalImageAsBase64(posizionamentoPath);

    const doc = new jsPDF.jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const selectedDate = dateString
      ? FormatDate(new Date(dateString), "dd-MM-yyyy")
      : FormatDate(new Date(), "dd-MM-yyyy");
    const filenameBase = `report_${project?.ProgettiSerp_Nome || project.IDOBJ}_${selectedDate}_pos1-10`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const drawHeader = () => {
      try {
        const logoHeight = 15;
        const logoWidth = 50;
        const logoX = pageWidth / 2 - logoWidth / 2;
        const logoY = margin - 5;

        if (logoImage) {
          console.log(`📷 [PDF] Aggiunta logo al header`);
          doc.addImage(
            `data:image/${logoImage.format.toLowerCase()};base64,${logoImage.data}`,
            logoImage.format,
            logoX,
            logoY,
            logoWidth,
            logoHeight
          );
        } else {
          // Fallback: solo testo se il logo non è disponibile
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text("AM Partners", pageWidth / 2, logoY + 7, {
            align: "center",
          });
        }
      } catch (error) {
        console.error("Error drawing PDF header:", error);
      }
    };

    const drawFooter = () => {
      const footerY = pageHeight - margin - 5;
      const colWidth = (pageWidth - 2 * margin) / 4;
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.setLineWidth(0.2);
      doc.setDrawColor(120, 180, 70);
      doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
      doc.setFont(undefined, "bold");
      doc.text("HUB", margin, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("VIA COSIMO DEL FRATE, 16", margin, footerY + 5);
      doc.text("LEGNANO (MI)", margin, footerY + 8);
      const col2X = margin + colWidth;
      doc.setFont(undefined, "bold");
      doc.text("CUBE [CORE] ROOM", col2X, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("VIA MONTE NAPOLEONE, 22", col2X, footerY + 5);
      doc.text("MILANO", col2X, footerY + 8);
      const col3X = margin + colWidth * 2;
      doc.setFont(undefined, "bold");
      doc.text("SEDE LEGALE", col3X, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("VIA I BOSSI, 46", col3X, footerY + 5);
      doc.text("RESCALDINA (MI)", col3X, footerY + 8);
      const col4X = margin + colWidth * 3;
      doc.setFont(undefined, "bold");
      doc.text("www.ampartners.info", col4X, footerY + 2);
      doc.setFont(undefined, "normal");
      doc.text("info@ampartners.info", col4X, footerY + 5);
    };

    // Page 1: Cover
    drawHeader();
    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text("REPORT", pageWidth / 2, margin + 25, { align: "center" });
    doc.setFontSize(26);
    doc.text("POSIZIONAMENTO KEYWORD", pageWidth / 2, margin + 38, {
      align: "center",
    });

    // Aggiungi immagine posizionamento se disponibile
    if (posizionamentoImage) {
      console.log(
        `📷 [PDF] Aggiunta immagine posizionamento alla prima pagina`
      );
      const imgWidth = 140;
      const imgHeight = 70;
      const imgX = pageWidth / 2 - imgWidth / 2;
      const imgY = margin + 50;
      doc.addImage(
        `data:image/${posizionamentoImage.format.toLowerCase()};base64,${posizionamentoImage.data}`,
        posizionamentoImage.format,
        imgX,
        imgY,
        imgWidth,
        imgHeight
      );
    }

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const reportText = `REPORT PAROLE CHIAVE ${selectedDate}`;
    const reportTextWidth = doc.getTextWidth(reportText);
    doc.text(
      reportText,
      pageWidth - margin - reportTextWidth,
      pageHeight - margin - 20
    );
    drawFooter();

    // Page 2: Table
    doc.addPage();
    const tableColumn = [
      "PAROLA CHIAVE",
      "POSIZIONE SU GOOGLE",
      "PAGINA SITO POSIZIONATA",
    ];
    const tableRows = filteredKeywords.map((kw) => [
      kw.keyword || kw.KeywordSerp_Keyword || "",
      (kw.posizione || kw.KeywordSerp_Posizione) ?? "",
      kw.urlkey || kw.KeywordSerp_URL || "",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: margin + 20,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5, valign: "middle" },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: "auto", halign: "left" },
      },
      didDrawPage: (data) => {
        drawHeader();
        drawFooter();
      },
      margin: {
        top: margin + 10,
        bottom: margin + 15,
        left: margin,
        right: margin,
      },
    });

    // Page 3: Legend and Contacts
    doc.addPage();
    drawHeader();
    drawFooter();
    let yPosition = margin + 25;
    const leftMargin = margin + 5;
    const lineHeight = 6;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("Breve legenda delle voci del report:", leftMargin, yPosition);
    yPosition += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("PAROLA CHIAVE:", leftMargin, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(
      'con il termine "parole chiave" (keywords), si identificano le ricerche che gli utenti effettuano sui motori di ricerca per trovare una risposta a un',
      leftMargin + 35,
      yPosition
    );
    yPosition += lineHeight - 1;
    doc.text(
      "bisogno specifico. ... Le query sono un insieme di parole, domande o frasi, digitate nel motore di ricerca, che racchiudono un'intenzione di ricerca.",
      leftMargin,
      yPosition
    );
    yPosition += lineHeight * 2;
    doc.setFont(undefined, "bold");
    doc.text("POSIZIONE SU GOOGLE.IT:", leftMargin, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(
      "nel report vengono proposte le parole chiave che hanno raggiunto le prime 10 posizioni nelle pagine del motore di ricerca",
      leftMargin + 45,
      yPosition
    );
    yPosition += lineHeight - 1;
    doc.text(
      "(Google.it), ovvero che occupano la Prima Pagina di Google.",
      leftMargin,
      yPosition
    );
    yPosition += lineHeight * 2;
    doc.setFont(undefined, "bold");
    doc.text("PAGINA SITO POSIZIONATA:", leftMargin, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(
      'è la pagina del sito che Google ha intercettato e "premiato". Diverse pagine posizionate indicano che il motore di ricerca ha',
      leftMargin + 52,
      yPosition
    );
    yPosition += lineHeight - 1;
    doc.text(
      '"recepito" correttamente i vari contenuti del sito.',
      leftMargin,
      yPosition
    );
    yPosition += lineHeight * 3;
    doc.setFont(undefined, "bold");
    doc.text("IL VOSTRO TEAM DEL PROGETTO", leftMargin, yPosition);
    yPosition += lineHeight * 1.5;
    const teamData = [
      ["Chiara: SEO E CONTENT", "chiara@ampartners.info"],
      ["Camilla: GRAFICA E WEBDESIGN", "camilla@ampartners.info"],
      ["Marco: PROJECT MANAGER", "marco@ampartners.info"],
      ["Antonio: DIREZIONE", "antonio@ampartners.info"],
    ];
    const emailColumnX = leftMargin + 80;
    teamData.forEach((member, index) => {
      const currentY = yPosition + index * lineHeight * 1.2;
      doc.setFont(undefined, "bold");
      doc.text(member[0], leftMargin, currentY);
      doc.setFont(undefined, "normal");
      doc.text(member[1], emailColumnX, currentY);
    });
    yPosition += lineHeight * 7;
    doc.setFont(undefined, "bold");
    doc.text("PROMEMORIA", leftMargin, yPosition);
    yPosition += lineHeight * 1.2;
    doc.setFont(undefined, "normal");
    doc.text(
      "Vi ricordiamo di segnalarci eventuali prodotti/servizi/ o parole chiave importanti da inserire all'interno del piano editoriale di content marketing.",
      leftMargin,
      yPosition
    );

    // Convert to base64 and upload to server
    const token = await getAuthToken();
    if (!token) {
      console.error("Cannot upload PDF: missing auth token");
      return null;
    }

    const base64PDF = await convertPdfToBase64(doc);
    const reportDate = dateString ? new Date(dateString) : new Date();

    console.log(
      `Uploading PDF for project ${project.IDOBJ}, filename: ${filenameBase}`
    );
    await uploadPdfReport(
      project.IDOBJ,
      token,
      base64PDF,
      filenameBase,
      reportDate
    );

    // Return the attachment object for email
    return {
      filename: `${filenameBase}.pdf`,
      content: base64PDF,
      type: "application/pdf",
      disposition: "attachment",
    };
  } catch (error) {
    console.error(`Error generating PDF for project ${project.IDOBJ}:`, error);
    return null;
  }
}

// Funzione per ottenere i progetti con AutoSend attivo dal database
async function getProjectsWithAutoSend() {
  try {
    console.log("🔍 [STEP 1] Inizio recupero progetti con AutoSend attivo...");

    const token = await getAuthToken();
    if (!token) {
      console.error("❌ [STEP 1] ERRORE: Token di autenticazione non valido");
      return [];
    }
    console.log("✅ [STEP 1] Token di autenticazione ottenuto con successo");

    const url = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggi`;
    console.log(`📡 [STEP 1] Chiamata API: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ [STEP 1] ERRORE HTTP: ${response.status}`);
      return [];
    }
    console.log("✅ [STEP 1] Risposta API ricevuta con successo");

    const data = await response.json();
    console.log(
      `📊 [STEP 1] Dati ricevuti - Progetti totali: ${data?.Itemset?.v_progettiserp?.length || 0}`
    );

    if (data?.Itemset?.v_progettiserp) {
      // Filtra solo progetti con AutoSend = 1 e AutoSendMail valida
      const allProjects = data.Itemset.v_progettiserp;
      console.log(
        `🔍 [STEP 1] Analisi di ${allProjects.length} progetti per filtro AutoSend...`
      );

      const projectsWithAutoSend = allProjects.filter((project) => {
        const hasAutoSend = project.ProgettiSerp_AutoSend === 1;
        const hasValidEmail =
          project.ProgettiSerp_AutoSendMail &&
          project.ProgettiSerp_AutoSendMail.trim() !== "" &&
          project.ProgettiSerp_AutoSendMail.includes("@");

        if (hasAutoSend && hasValidEmail) {
          console.log(
            `✅ [STEP 1] Progetto qualificato: ${project.ProgettiSerp_Nome} (ID: ${project.IDOBJ}) - Email: ${project.ProgettiSerp_AutoSendMail}`
          );
        } else if (hasAutoSend && !hasValidEmail) {
          console.log(
            `⚠️ [STEP 1] Progetto con AutoSend ma email non valida: ${project.ProgettiSerp_Nome} (ID: ${project.IDOBJ})`
          );
        }

        return hasAutoSend && hasValidEmail;
      });

      console.log(
        `✅ [STEP 1] COMPLETATO - Trovati ${projectsWithAutoSend.length} progetti con AutoSend attivo e email valida`
      );

      const mappedProjects = projectsWithAutoSend.map((project) => ({
        IDOBJ: project.IDOBJ,
        azienda: AZIENDA,
        email: project.ProgettiSerp_AutoSendMail,
        ProgettiSerp_Nome:
          project.ProgettiSerp_Nome || `Progetto ${project.IDOBJ}`,
      }));

      console.log("📋 [STEP 1] Lista progetti finali:");
      mappedProjects.forEach((p, index) => {
        console.log(
          `   ${index + 1}. ${p.ProgettiSerp_Nome} (ID: ${p.IDOBJ}) → ${p.email}`
        );
      });

      return mappedProjects;
    }

    console.log(
      "⚠️ [STEP 1] Nessun dato di progetti trovato nella risposta API"
    );
    return [];
  } catch (error) {
    console.error("❌ [STEP 1] ERRORE nel recupero progetti AutoSend:", error);
    return [];
  }
}

// Funzione per ottenere le date di estrazione disponibili per un progetto
async function getProjectExtractionDates(projectId) {
  try {
    const token = await getAuthToken();
    if (!token) return [];

    const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${projectId}`;
    const keywordsResponse = await fetch(keywordsUrl);

    if (!keywordsResponse.ok) {
      console.error(`Errore nel recupero keywords per progetto ${projectId}`);
      return [];
    }

    const keywordsData = await keywordsResponse.json();

    if (keywordsData?.Itemset?.v_keywords) {
      const dates = keywordsData.Itemset.v_keywords
        .map((item) => item.dataestrazione)
        .filter((date, index, self) => date && self.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a)); // Ordina dal più recente al più vecchio

      return dates;
    }

    return [];
  } catch (error) {
    console.error(
      `Errore nel recupero date estrazione per progetto ${projectId}:`,
      error
    );
    return [];
  }
}

// Funzione per ottenere il PDF più recente dal server, o generarlo se non esiste
async function getLatestPdfFromServer(projectId, latestDate, projectName) {
  try {
    // Formato: reports/{projectId}/{dateStr}/report_{projectName}_{date}_pos1-10.pdf
    const dateStr = latestDate.split("T")[0]; // Converte in formato YYYY-MM-DD
    const pdfPath = `reports/${projectId}/${dateStr}`;
    const formattedDate = FormatDate(new Date(latestDate), "dd-MM-yyyy");
    const expectedFileName = `report_${projectName}_${formattedDate}_pos1-10.pdf`;

    console.log(`� [PDF] Tentativo di recupero PDF esistente...`);
    console.log(`   📁 Path server: ${pdfPath}`);
    console.log(`   📄 Nome file atteso: ${expectedFileName}`);

    // Prima prova a scaricare il PDF esistente dal server
    try {
      const token = await getAuthToken();
      if (!token) {
        console.error("❌ [PDF] Impossibile ottenere token di autenticazione");
        return null;
      }

      // Tenta di scaricare il PDF esistente
      const downloadUrl = `${SERVERAPI}/files/${pdfPath}/${expectedFileName}`;
      console.log(`📡 [PDF] Tentativo download da: ${downloadUrl}`);

      const downloadResponse = await fetch(downloadUrl);
      if (downloadResponse.ok) {
        const pdfBuffer = await downloadResponse.arrayBuffer();
        const base64PDF = Buffer.from(pdfBuffer).toString("base64");
        const fileSizeKB = Math.round((base64PDF.length * 0.75) / 1024);

        console.log(`✅ [PDF] PDF esistente trovato e scaricato!`);
        console.log(`   📏 Dimensione: ${fileSizeKB} KB`);
        console.log(`   📄 Nome file: ${expectedFileName}`);

        return {
          filename: expectedFileName,
          content: base64PDF,
          type: "application/pdf",
          disposition: "attachment",
        };
      } else {
        console.log(
          `⚠️ [PDF] PDF non trovato sul server (HTTP ${downloadResponse.status})`
        );
      }
    } catch (downloadError) {
      console.log(
        `⚠️ [PDF] Errore nel download PDF esistente: ${downloadError.message}`
      );
    }

    // Se il PDF non esiste, lo generiamo automaticamente
    console.log(`� [PDF] Generazione automatica PDF...`);
    console.log(`   📊 Progetto ID: ${projectId}`);
    console.log(`   📅 Data target: ${latestDate}`);

    // Ottieni le keywords per quella data specifica
    console.log(`🔍 [PDF] Recupero keywords per la data...`);
    const keywords = await getKeywordsForDate(projectId, latestDate);

    if (!keywords || keywords.length === 0) {
      console.log(
        `❌ [PDF] Nessuna keyword trovata per progetto ${projectId} alla data ${latestDate}`
      );
      return null;
    }

    console.log(
      `✅ [PDF] Trovate ${keywords.length} keywords per la generazione`
    );

    // Genera il PDF automaticamente
    const project = {
      IDOBJ: projectId,
      ProgettiSerp_Nome: projectName,
    };

    console.log(`🔨 [PDF] Avvio generazione PDF automatica...`);
    const pdfAttachment = await generateAutoPdfReport(
      project,
      keywords,
      latestDate
    );

    if (pdfAttachment) {
      const fileSizeKB = Math.round(
        (pdfAttachment.content.length * 0.75) / 1024
      );
      console.log(`✅ [PDF] PDF generato automaticamente con successo!`);
      console.log(`   📄 Nome file: ${pdfAttachment.filename}`);
      console.log(`   📏 Dimensione: ${fileSizeKB} KB`);
      return pdfAttachment;
    } else {
      console.log(
        `❌ [PDF] Impossibile generare PDF per progetto ${projectId}`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `❌ [PDF] Errore nel recupero/generazione PDF per progetto ${projectId}:`
    );
    console.error(`   💥 Messaggio: ${error.message}`);
    return null;
  }
}

// Funzione per ottenere le keywords di una data specifica
async function getKeywordsForDate(projectId, targetDate) {
  try {
    console.log(`🔍 [KEYWORDS] Recupero keywords per progetto ${projectId}...`);

    const token = await getAuthToken();
    if (!token) {
      console.error("❌ [KEYWORDS] Token di autenticazione non disponibile");
      return [];
    }

    const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${projectId}`;
    console.log(`📡 [KEYWORDS] Chiamata API: ${keywordsUrl}`);

    const keywordsResponse = await fetch(keywordsUrl);

    if (!keywordsResponse.ok) {
      console.error(
        `❌ [KEYWORDS] Errore HTTP ${keywordsResponse.status} nel recupero keywords`
      );
      return [];
    }

    const keywordsData = await keywordsResponse.json();
    console.log(`✅ [KEYWORDS] Risposta API ricevuta`);

    if (keywordsData?.Itemset?.v_keywords) {
      const allKeywords = keywordsData.Itemset.v_keywords;
      console.log(
        `📊 [KEYWORDS] Keywords totali nel database: ${allKeywords.length}`
      );

      // Filtra le keywords per la data target
      const targetDateStr = targetDate.split("T")[0]; // YYYY-MM-DD format
      console.log(`🎯 [KEYWORDS] Filtro per data target: ${targetDateStr}`);

      const filteredKeywords = allKeywords.filter((kw) => {
        if (!kw.dataestrazione) return false;
        const kwDate = kw.dataestrazione.split("T")[0];
        return kwDate === targetDateStr;
      });

      console.log(
        `✅ [KEYWORDS] Keywords filtrate per data: ${filteredKeywords.length}/${allKeywords.length}`
      );

      if (filteredKeywords.length > 0) {
        // Analisi delle posizioni per debug
        const positionsAnalysis = filteredKeywords.reduce(
          (acc, kw) => {
            const pos =
              kw.posizione ||
              kw.position ||
              kw.Posizione ||
              kw.KeywordSerp_Posizione;
            if (pos) {
              const posNum = parseInt(pos);
              if (posNum >= 1 && posNum <= 10) acc.top10++;
              else if (posNum <= 20) acc.top20++;
              else if (posNum <= 50) acc.top50++;
              else acc.beyond50++;
            } else {
              acc.noPosition++;
            }
            return acc;
          },
          { top10: 0, top20: 0, top50: 0, beyond50: 0, noPosition: 0 }
        );

        console.log(`📈 [KEYWORDS] Analisi posizioni:`);
        console.log(`   🥇 Posizioni 1-10: ${positionsAnalysis.top10}`);
        console.log(`   🥈 Posizioni 11-20: ${positionsAnalysis.top20}`);
        console.log(`   🥉 Posizioni 21-50: ${positionsAnalysis.top50}`);
        console.log(`   📉 Oltre 50: ${positionsAnalysis.beyond50}`);
        console.log(`   ❓ Senza posizione: ${positionsAnalysis.noPosition}`);
      }

      return filteredKeywords;
    }

    console.log(
      "⚠️ [KEYWORDS] Nessun dato keywords trovato nella risposta API"
    );
    return [];
  } catch (error) {
    console.error(
      `❌ [KEYWORDS] Errore nel recupero keywords per progetto ${projectId}:`
    );
    console.error(`   💥 Messaggio: ${error.message}`);
    return [];
  }
}

// Funzione per inviare email con allegato PDF
async function sendReportEmail({ to, subject, text, attachments = [] }) {
  try {
    console.log(`📧 [EMAIL] Preparazione invio email...`);
    console.log(`   📬 Destinatario: ${to}`);
    console.log(`   📋 Subject: ${subject}`);
    console.log(`   📎 Allegati: ${attachments.length}`);

    const emailData = {
      from: "test@axonamail.net",
      to,
      subject,
      text,
    };

    // Aggiungi allegati se presenti
    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments;
      attachments.forEach((att, index) => {
        const sizeKB = Math.round((att.content.length * 0.75) / 1024);
        console.log(
          `   📎 Allegato ${index + 1}: ${att.filename} (${sizeKB} KB)`
        );
      });
    }

    console.log(`📡 [EMAIL] Invio tramite Resend...`);
    const startTime = new Date();
    const response = await resend.emails.send(emailData);
    const endTime = new Date();
    const sendTime = endTime - startTime;

    console.log(`✅ [EMAIL] Email inviata con successo!`);
    console.log(`   📄 Response ID: ${response.data?.id || "N/A"}`);
    console.log(`   ⏱️ Tempo invio: ${sendTime}ms`);

    return response;
  } catch (error) {
    console.error(`❌ [EMAIL] Errore nell'invio email:`);
    console.error(`   💥 Messaggio: ${error.message}`);
    console.error(`   📬 Destinatario: ${to}`);
    console.error(`   📋 Subject: ${subject}`);
    throw error;
  }
}

// Funzione principale per inviare tutti i report automatici
async function sendAllAutoReports() {
  console.log("=== INIZIO INVIO AUTOMATICO REPORT ===");
  console.log(`🕐 Data/ora esecuzione: ${new Date().toLocaleString("it-IT")}`);
  console.log(`🌍 Server API: ${SERVERAPI}`);
  console.log(`🏢 Azienda: ${AZIENDA}`);

  const projects = await getProjectsWithAutoSend();

  if (projects.length === 0) {
    console.log("❌ [RISULTATO] Nessun progetto con AutoSend attivo trovato.");
    return;
  }

  console.log(
    `\n📋 [STEP 2] Elaborazione di ${projects.length} progetti qualificati:`
  );
  projects.forEach((p, index) => {
    console.log(
      `   ${index + 1}. ${p.ProgettiSerp_Nome} (ID: ${p.IDOBJ}) → ${p.email}`
    );
  });

  let successCount = 0;
  let errorCount = 0;
  const emailResults = [];

  for (const project of projects) {
    try {
      const projectStartTime = new Date();
      console.log(
        `\n🔄 [STEP 3.${projects.indexOf(project) + 1}] === INIZIO ELABORAZIONE PROGETTO ===`
      );
      console.log(`📊 Nome: ${project.ProgettiSerp_Nome}`);
      console.log(`🔑 ID: ${project.IDOBJ}`);
      console.log(`📧 Email destinatario: ${project.email}`);
      console.log(
        `⏰ Inizio elaborazione: ${projectStartTime.toLocaleTimeString("it-IT")}`
      );

      // Ottieni le date di estrazione disponibili
      console.log(
        `🔍 [STEP 3.${projects.indexOf(project) + 1}.1] Recupero date di estrazione...`
      );
      const extractionDates = await getProjectExtractionDates(project.IDOBJ);

      if (extractionDates.length === 0) {
        console.log(
          `⚠️ [STEP 3.${projects.indexOf(project) + 1}.1] Nessuna data di estrazione trovata`
        );

        const emailSubject = `Report SEO ${project.ProgettiSerp_Nome} - Nessun dato disponibile`;
        console.log(
          `📧 [STEP 3.${projects.indexOf(project) + 1}.2] Invio email informativa senza dati...`
        );
        console.log(`   📋 Subject: ${emailSubject}`);
        console.log(`   📬 Destinatario: ${project.email}`);

        // Invia email senza allegato informando della mancanza di dati
        const response = await sendReportEmail({
          to: project.email,
          subject: emailSubject,
          text: `Gentile Cliente,\n\nNon sono disponibili dati di posizionamento per il progetto "${project.ProgettiSerp_Nome}".\nTi invitiamo a contattarci per maggiori informazioni.\n\nCordiali saluti,\nTeam SEO`,
        });

        console.log(
          `✅ [STEP 3.${projects.indexOf(project) + 1}.2] Email informativa inviata con successo`
        );
        console.log(`   📄 Response ID: ${response.data?.id || "N/A"}`);

        emailResults.push({
          project: project.ProgettiSerp_Nome,
          email: project.email,
          subject: emailSubject,
          status: "SUCCESS (NO DATA)",
          responseId: response.data?.id || "N/A",
        });

        successCount++;
        continue;
      }

      const latestDate = extractionDates[0]; // La data più recente
      console.log(
        `✅ [STEP 3.${projects.indexOf(project) + 1}.1] Trovate ${extractionDates.length} date di estrazione`
      );
      console.log(`   📅 Data più recente: ${latestDate}`);
      console.log(
        `   📅 Date disponibili: ${extractionDates.slice(0, 3).join(", ")}${extractionDates.length > 3 ? "..." : ""}`
      );

      // Prova a recuperare o generare il PDF
      console.log(
        `📄 [STEP 3.${projects.indexOf(project) + 1}.2] Recupero/generazione PDF...`
      );
      const pdfAttachment = await getLatestPdfFromServer(
        project.IDOBJ,
        latestDate,
        project.ProgettiSerp_Nome
      );

      let emailText = `Gentile Cliente,\n\nin allegato il report SEO aggiornato per il progetto "${project.ProgettiSerp_Nome}".\n\nData ultimo aggiornamento: ${new Date(latestDate).toLocaleDateString("it-IT")}\n\nCordiali saluti,\nTeam SEO`;
      const emailSubject = `Report SEO ${project.ProgettiSerp_Nome} - ${new Date().toLocaleDateString("it-IT")}`;
      const attachments = [];

      if (pdfAttachment) {
        attachments.push(pdfAttachment);
        console.log(
          `✅ [STEP 3.${projects.indexOf(project) + 1}.2] PDF disponibile per allegato`
        );
        console.log(`   📎 Nome file: ${pdfAttachment.filename}`);
        console.log(
          `   📏 Dimensione: ${Math.round((pdfAttachment.content.length * 0.75) / 1024)} KB circa`
        );
      } else {
        // Se non c'è PDF, modifica il testo
        emailText = `Gentile Cliente,\n\nQuesto è il report automatico per il progetto "${project.ProgettiSerp_Nome}".\n\nData ultimo aggiornamento: ${new Date(latestDate).toLocaleDateString("it-IT")}\n\nIl report dettagliato sarà disponibile a breve.\n\nCordiali saluti,\nTeam SEO`;
        console.log(
          `⚠️ [STEP 3.${projects.indexOf(project) + 1}.2] Nessun PDF disponibile - invio senza allegato`
        );
      }

      // Invia l'email
      console.log(
        `📧 [STEP 3.${projects.indexOf(project) + 1}.3] Invio email...`
      );
      console.log(`   📋 Subject: ${emailSubject}`);
      console.log(`   📬 Destinatario: ${project.email}`);
      console.log(
        `   📎 Allegati: ${attachments.length > 0 ? `${attachments.length} file` : "Nessuno"}`
      );

      const response = await sendReportEmail({
        to: project.email,
        subject: emailSubject,
        text: emailText,
        attachments: attachments,
      });

      const projectEndTime = new Date();
      const processingTime = projectEndTime - projectStartTime;

      console.log(
        `✅ [STEP 3.${projects.indexOf(project) + 1}.3] Email inviata con successo!`
      );
      console.log(`   📄 Response ID: ${response.data?.id || "N/A"}`);
      console.log(`   ⏱️ Tempo elaborazione: ${processingTime}ms`);
      console.log(
        `   ⏰ Fine elaborazione: ${projectEndTime.toLocaleTimeString("it-IT")}`
      );

      emailResults.push({
        project: project.ProgettiSerp_Nome,
        email: project.email,
        subject: emailSubject,
        status:
          attachments.length > 0 ? "SUCCESS (WITH PDF)" : "SUCCESS (NO PDF)",
        responseId: response.data?.id || "N/A",
        processingTime: `${processingTime}ms`,
      });

      successCount++;
    } catch (error) {
      console.error(
        `❌ [STEP 3.${projects.indexOf(project) + 1}] ERRORE nell'elaborazione progetto ${project.IDOBJ}:`
      );
      console.error(`   💥 Messaggio: ${error.message}`);
      console.error(`   📊 Progetto: ${project.ProgettiSerp_Nome}`);
      console.error(`   📧 Email: ${project.email}`);

      emailResults.push({
        project: project.ProgettiSerp_Nome,
        email: project.email,
        subject: "N/A",
        status: "ERROR",
        responseId: "N/A",
        error: error.message,
      });

      errorCount++;
    }
  }

  console.log("\n📊 === RIEPILOGO FINALE INVIO AUTOMATICO REPORT ===");
  console.log(
    `🕐 Data/ora completamento: ${new Date().toLocaleString("it-IT")}`
  );
  console.log(`📊 Progetti elaborati: ${projects.length}`);
  console.log(`✅ Email inviate con successo: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(
    `📈 Tasso di successo: ${projects.length > 0 ? Math.round((successCount / projects.length) * 100) : 0}%`
  );

  if (emailResults.length > 0) {
    console.log("\n📋 === DETTAGLIO RISULTATI EMAIL ===");
    emailResults.forEach((result, index) => {
      console.log(`${index + 1}. 📊 ${result.project}`);
      console.log(`   📧 Email: ${result.email}`);
      console.log(`   📋 Subject: ${result.subject}`);
      console.log(`   📊 Status: ${result.status}`);
      console.log(`   📄 Response ID: ${result.responseId}`);
      if (result.processingTime) {
        console.log(`   ⏱️ Tempo elaborazione: ${result.processingTime}`);
      }
      if (result.error) {
        console.log(`   💥 Errore: ${result.error}`);
      }
      console.log("");
    });
  }

  console.log("🏁 === FINE INVIO AUTOMATICO REPORT ===");
}

// Esegui lo script
console.log("Avvio script invio automatico report...");
sendAllAutoReports().catch((error) => {
  console.error("Errore generale nello script:", error);
  process.exit(1);
});
