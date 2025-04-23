import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FormatDate } from "./FormatDate"; // Ensure FormatDate.js exists and exports FormatDate correctly

/**
 * Generates and saves a CSV report for keywords.
 * @param {Object} project - The project object, containing ProgettiSerp_Nome.
 * @param {Array} keywords - Array of keyword objects.
 * @param {string|null} dateString - The selected date string for the report filename, or null for current date.
 */
export const generateCsvReport = (project, keywords, dateString) => { // Ensure 'export const' is used
  if (!keywords || keywords.length === 0) {
      console.warn("CSV Export: No keywords to export.");
      alert("Nessuna keyword da esportare.");
      return;
  }

  const headers = ["Keyword", "Posizione", "Variazione", "URL"];
  const csvRows = [
    headers.join(";"),
    ...keywords.map((row) =>
      [
        `"${(row.KeywordSerp_Keyword || "").replace(/"/g, '""')}"`,
        row.KeywordSerp_Posizione ?? "",
        row.KeywordSerp_Variazione === -999 || row.KeywordSerp_Variazione === "-999" || row.KeywordSerp_Variazione == null ? "-" : row.KeywordSerp_Variazione ?? "",
        `"${(row.KeywordSerp_URL || "").replace(/"/g, '""')}"`,
      ].join(";")
    ),
  ];
  const csvString = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  const selectedDate = dateString ? FormatDate(new Date(dateString), "yyyyMMdd") : FormatDate(new Date(), "yyyyMMdd");
  const filename = `keywords_${project?.ProgettiSerp_Nome || "export"}_${selectedDate}.csv`;
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates and saves a PDF report for keywords in top 10 positions.
 * @param {Object} project - The project object, containing ProgettiSerp_Nome.
 * @param {Array} keywords - Array of keyword objects.
 * @param {string|null} dateString - The selected date string for the report, or null for current date.
 * @param {string|null} logoImageDataUrl - Base64 encoded logo image.
 * @param {string|null} posizionamentoImageDataUrl - Base64 encoded positioning image.
 */
export const generatePdfReport = (project, keywords, dateString, logoImageDataUrl, posizionamentoImageDataUrl) => { // Ensure 'export const' is used
  if (!keywords || keywords.length === 0) {
      console.warn("PDF Export: No keywords data available.");
      alert("Nessuna keyword disponibile per generare il PDF.");
      return;
  }

  const filteredKeywords = keywords.filter(kw => {
    const pos = kw.KeywordSerp_Posizione;
    return typeof pos === 'number' && pos >= 1 && pos <= 10;
  });

  if (filteredKeywords.length === 0) {
    alert("Nessuna keyword trovata nelle posizioni 1-10 per questa data.");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const selectedDate = dateString ? FormatDate(new Date(dateString), "dd-MM-yyyy") : FormatDate(new Date(), "dd-MM-yyyy");
  const filenameBase = `report_${project?.ProgettiSerp_Nome || "export"}_${selectedDate}_pos1-10`;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  const drawHeader = () => {
    try {
      const logoHeight = 15; const logoWidth = 50;
      const logoX = pageWidth / 2 - logoWidth / 2; const logoY = margin - 5;
      if (logoImageDataUrl) doc.addImage(logoImageDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight);
      else { doc.setFontSize(12); doc.setTextColor(100, 100, 100); doc.text("AM Partners", pageWidth / 2, logoY + 7, { align: "center" }); }
    } catch (error) { console.error("Error drawing PDF header:", error); }
  };

  const drawFooter = () => {
    const footerY = pageHeight - margin - 5; const colWidth = (pageWidth - 2 * margin) / 4;
    doc.setFontSize(7); doc.setTextColor(80, 80, 80); doc.setLineWidth(0.2); doc.setDrawColor(120, 180, 70);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
    doc.setFont(undefined, "bold"); doc.text("HUB", margin, footerY + 2);
    doc.setFont(undefined, "normal"); doc.text("VIA COSIMO DEL FRATE, 16", margin, footerY + 5); doc.text("LEGNANO (MI)", margin, footerY + 8);
    const col2X = margin + colWidth; doc.setFont(undefined, "bold"); doc.text("CUBE [CORE] ROOM", col2X, footerY + 2);
    doc.setFont(undefined, "normal"); doc.text("VIA MONTE NAPOLEONE, 22", col2X, footerY + 5); doc.text("MILANO", col2X, footerY + 8);
    const col3X = margin + colWidth * 2; doc.setFont(undefined, "bold"); doc.text("SEDE LEGALE", col3X, footerY + 2);
    doc.setFont(undefined, "normal"); doc.text("VIA I BOSSI, 46", col3X, footerY + 5); doc.text("RESCALDINA (MI)", col3X, footerY + 8);
    const col4X = margin + colWidth * 3; doc.setFont(undefined, "bold"); doc.text("www.ampartners.info", col4X, footerY + 2);
    doc.setFont(undefined, "normal"); doc.text("info@ampartners.info", col4X, footerY + 5);
  };

  // Page 1: Cover
  drawHeader();
  doc.setFontSize(22); doc.setFont(undefined, "bold"); doc.text("REPORT", pageWidth / 2, margin + 25, { align: "center" });
  doc.setFontSize(26); doc.text("POSIZIONAMENTO KEYWORD", pageWidth / 2, margin + 38, { align: "center" });
  if (posizionamentoImageDataUrl) { const imgWidth = 140; const imgHeight = 70; const imgX = pageWidth / 2 - imgWidth / 2; const imgY = margin + 50; doc.addImage(posizionamentoImageDataUrl, "PNG", imgX, imgY, imgWidth, imgHeight); }
  doc.setFontSize(10); doc.setFont(undefined, "normal"); const reportText = `REPORT PAROLE CHIAVE ${selectedDate}`; const reportTextWidth = doc.getTextWidth(reportText); doc.text(reportText, pageWidth - margin - reportTextWidth, pageHeight - margin - 20);
  drawFooter();

  // Page 2: Table
  doc.addPage();
  const tableColumn = ["PAROLA CHIAVE", "POSIZIONE SU GOOGLE", "PAGINA SITO POSIZIONATA"];
  const tableRows = filteredKeywords.map(kw => [kw.KeywordSerp_Keyword || "", kw.KeywordSerp_Posizione ?? "", kw.KeywordSerp_URL || ""]);
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: margin + 20,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 1.5, valign: "middle" },
    headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, halign: "center" },
    columnStyles: { 0: { cellWidth: "auto", halign: "left" }, 1: { cellWidth: 30, halign: "center" }, 2: { cellWidth: "auto", halign: "left" } },
    didDrawPage: (data) => { drawHeader(); drawFooter(); },
    margin: { top: margin + 10, bottom: margin + 15, left: margin, right: margin }
  });

  // Page 3: Legend and Contacts
  doc.addPage();
  drawHeader(); drawFooter();
  let yPosition = margin + 25; const leftMargin = margin + 5; const lineHeight = 6;
  doc.setFontSize(9); doc.setFont(undefined, "normal"); doc.text("Breve legenda delle voci del report:", leftMargin, yPosition);
  yPosition += lineHeight; doc.setFont(undefined, "bold"); doc.text("PAROLA CHIAVE:", leftMargin, yPosition); doc.setFont(undefined, "normal"); doc.text('con il termine "parole chiave" (keywords), si identificano le ricerche che gli utenti effettuano sui motori di ricerca per trovare una risposta a un', leftMargin + 35, yPosition); yPosition += lineHeight - 1; doc.text("bisogno specifico. ... Le query sono un insieme di parole, domande o frasi, digitate nel motore di ricerca, che racchiudono un'intenzione di ricerca.", leftMargin, yPosition);
  yPosition += lineHeight * 2; doc.setFont(undefined, "bold"); doc.text("POSIZIONE SU GOOGLE.IT:", leftMargin, yPosition); doc.setFont(undefined, "normal"); doc.text("nel report vengono proposte le parole chiave che hanno raggiunto le prime 10 posizioni nelle pagine del motore di ricerca", leftMargin + 45, yPosition); yPosition += lineHeight - 1; doc.text("(Google.it), ovvero che occupano la Prima Pagina di Google.", leftMargin, yPosition);
  yPosition += lineHeight * 2; doc.setFont(undefined, "bold"); doc.text("PAGINA SITO POSIZIONATA:", leftMargin, yPosition); doc.setFont(undefined, "normal"); doc.text('è la pagina del sito che Google ha intercettato e "premiato". Diverse pagine posizionate indicano che il motore di ricerca ha', leftMargin + 52, yPosition); yPosition += lineHeight - 1; doc.text('"recepito" correttamente i vari contenuti del sito.', leftMargin, yPosition);
  yPosition += lineHeight * 3; doc.setFont(undefined, "bold"); doc.text("IL VOSTRO TEAM DEL PROGETTO", leftMargin, yPosition); yPosition += lineHeight * 1.5;
  const teamData = [ ["Chiara: SEO E CONTENT", "chiara@ampartners.info"], ["Camilla: GRAFICA E WEBDESIGN", "camilla@ampartners.info"], ["Marco: PROJECT MANAGER", "marco@ampartners.info"], ["Antonio: DIREZIONE", "antonio@ampartners.info"] ];
  const emailColumnX = leftMargin + 80; teamData.forEach((member, index) => { const currentY = yPosition + index * lineHeight * 1.2; doc.setFont(undefined, "bold"); doc.text(member[0], leftMargin, currentY); doc.setFont(undefined, "normal"); doc.text(member[1], emailColumnX, currentY); });
  yPosition += lineHeight * 7; doc.setFont(undefined, "bold"); doc.text("PROMEMORIA", leftMargin, yPosition); yPosition += lineHeight * 1.2; doc.setFont(undefined, "normal"); doc.text("Vi ricordiamo di segnalarci eventuali prodotti/servizi/ o parole chiave importanti da inserire all'interno del piano editoriale di content marketing.", leftMargin, yPosition);

  // Save the PDF
  doc.save(`${filenameBase}.pdf`);
};
