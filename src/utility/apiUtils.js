/**
 * Uploads the project logo.
 * @param {string} projectId - The ID of the project.
 * @param {string} token - The authentication token.
 * @param {string} SERVERAPI - The base URL of the server API.
 * @param {string} base64 - The base64 encoded image data.
 * @param {string} estensione - The file extension (e.g., "png").
 * @returns {Promise<void>} A promise that resolves on success or rejects on error.
 */
export const uploadProjectLogo = async (projectId, token, SERVERAPI, base64, estensione) => {
  const UpdPj = {
    b64: base64,
    estensione: "." + estensione,
    nomefile: "logo_" + projectId,
    cartellasalvataggio: "logo",
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

  try {
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
          // If response is not JSON
          errorData = { message: `Server responded with status: ${response.status}` };
      }
      console.error("Logo upload error response:", errorData);
      throw new Error(errorData.message || `Errore sconosciuto durante il caricamento del logo (status: ${response.status})`);
    }
    // If response is OK, resolve the promise
    return; // Indicate success
  } catch (error) {
    console.error("Logo upload fetch error:", error);
    // Re-throw the error to be caught by the caller
    throw new Error(`Errore di rete durante il caricamento del logo: ${error.message}`);
  }
};

/**
 * Uploads a PDF report to the server.
 * @param {string} projectId - The ID of the project.
 * @param {string} token - The authentication token.
 * @param {string} SERVERAPI - The base URL of the server API.
 * @param {string} base64 - The base64 encoded PDF data (without data:application/pdf;base64, prefix).
 * @param {string} fileName - The file name to use for the saved PDF.
 * @param {Date|string} reportDate - The date of the report (used for organizing files).
 * @returns {Promise<void>} A promise that resolves on success or rejects on error.
 */
export const uploadPdfReport = async (projectId, token, SERVERAPI, base64, fileName, reportDate) => {
  let dateStr = reportDate;
  if (reportDate instanceof Date) {
    // Format the date as YYYY-MM-DD
    dateStr = reportDate.toISOString().split('T')[0];
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

  try {
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
          // If response is not JSON
          errorData = { message: `Server responded with status: ${response.status}` };
      }
      console.error("PDF upload error response:", errorData);
      throw new Error(errorData.message || `Errore sconosciuto durante il caricamento del PDF (status: ${response.status})`);
    }
    
    // Also update the project with the last report date
    await updateProjectLastReport(projectId, token, SERVERAPI, dateStr);
    
    return; // Indicate success
  } catch (error) {
    console.error("PDF upload fetch error:", error);
    throw new Error(`Errore di rete durante il caricamento del PDF: ${error.message}`);
  }
};

/**
 * Updates the project's last report date.
 * @param {string} projectId - The ID of the project.
 * @param {string} token - The authentication token.
 * @param {string} SERVERAPI - The base URL of the server API.
 * @param {string} reportDate - The date of the report in YYYY-MM-DD format.
 * @returns {Promise<void>} A promise that resolves on success.
 */
export const updateProjectLastReport = async (projectId, token, SERVERAPI, reportDate) => {
  try {
    const UpdPj = {
      IDOBJ: projectId,
      ProgettiSerp_UltimoReport: reportDate
    };
    
    const formData = {
      Token: token,
      Idobj: projectId,
      Modulo: "progettiserp",
      Classe: "axo_funzioni",
      DB: "progettiserp",
      Funzione: "salvaDocumento",
      Parametri: "[" + JSON.stringify(UpdPj) + "]",
    };
    
    await fetch(SERVERAPI + "/api/axo_sel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } catch (error) {
    console.error("Error updating project last report date:", error);
    // Don't throw here to avoid failing the main PDF upload operation
  }
};

// You might add other API utility functions here, like Scrivi, Fai, etc.
// Example: Re-exporting Scrivi if it's defined elsewhere or defining it here
// export { Scrivi } from './callFetch'; // If Scrivi is in callFetch.js
