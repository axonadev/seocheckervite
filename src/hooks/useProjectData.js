import { useState, useEffect, useCallback } from "react";

const useProjectData = (projectId, token, SERVERAPI, AZIENDA) => {
  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [uniqueExtractionDates, setUniqueExtractionDates] = useState([]);
  const [projectLogo, setProjectLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progImg, setProgImg] = useState(0); // State to trigger logo refetch

  const fetchData = useCallback(async () => {
    if (!projectId || !token || !SERVERAPI) {
      setError("Project ID, token, or SERVERAPI is missing.");
      setLoading(false);
      setProject(null);
      setKeywords([]);
      setUniqueExtractionDates([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch project details
      const projectUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggi/${projectId}`;
      const projectResponse = await fetch(projectUrl);
      if (!projectResponse.ok) {
        throw new Error(
          `HTTP error fetching project! status: ${projectResponse.status}`
        );
      }
      const projectData = await projectResponse.json();
      if (projectData?.Itemset?.v_progettiserp?.length > 0) {
        setProject(projectData.Itemset.v_progettiserp[0]);
      } else {
        throw new Error("Project not found");
      }

      // Fetch keywords
      const keywordsUrl = `${SERVERAPI}/api/axo_sel/${token}/progettiserp/progettiserpsel/leggiKeyWords/${projectId}`;
      const keywordsResponse = await fetch(keywordsUrl);
      if (!keywordsResponse.ok) {
        console.error(
          `HTTP error fetching keywords! status: ${keywordsResponse.status}`
        );
        setKeywords([]);
        setUniqueExtractionDates([]);
        // Don't throw error here, project might exist without keywords yet
      } else {
        const keywordsData = await keywordsResponse.json();
        console.log("Raw keywords response:", keywordsData);

        /*      const keywordsWithId = (keywordsData?.Itemset?.v_keywords || []).map(
          (kw, index) => ({
            id: kw.idobj || kw.IDOBJ || `temp-${index}-${Date.now()}`, // prioritize lowercase idobj
            idobj: kw.idobj, // store original lowercase idobj
            IDOBJ: kw.IDOBJ, // store original uppercase IDOBJ if available
            KeywordSerp_Keyword: kw.keyword || kw.KeywordSerp_Keyword || kw.Keyword || "",
            KeywordSerp_Posizione: kw.posizione || kw.KeywordSerp_Posizione || kw.Posizione || null,
            KeywordSerp_Variazione: kw.variazione || kw.KeywordSerp_Variazione || kw.Variazione || null,
            KeywordSerp_URL: kw.urlkey || kw.KeywordSerp_URL || kw.url || kw.URL || "",
          })

          
        ); */

        const keywordsWithId = (keywordsData?.Itemset?.v_keywords || []).map(
          (kw, index) => ({
            id: kw.IDOBJ || `temp-${index}-${Date.now()}`,
            KeywordSerp_Keyword:
              kw.KeywordSerp_Keyword || kw.keyword || kw.Keyword || "",
            KeywordSerp_Posizione:
              kw.KeywordSerp_Posizione || kw.posizione || kw.Posizione || null,
            KeywordSerp_Variazione:
              kw.KeywordSerp_Variazione ||
              kw.variazione ||
              kw.Variazione ||
              null,
            KeywordSerp_URL:
              kw.urlkey || kw.KeywordSerp_URL || kw.url || kw.URL || "",
          })
        );
        setKeywords(keywordsWithId);

        const dates = keywordsData?.Itemset?.v_keywords
          ?.map((item) => item.dataestrazione)
          .filter((date, index, self) => date && self.indexOf(date) === index)
          .sort((a, b) => new Date(b) - new Date(a));
        setUniqueExtractionDates(dates || []);
      }
    } catch (err) {
      console.error("Error loading project details:", err);
      setError(err.message);
      setProject(null); // Reset state on error
      setKeywords([]);
      setUniqueExtractionDates([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, token, SERVERAPI]);

  const fetchLogo = useCallback(() => {
    if (!projectId || !AZIENDA) return;
    // Fetch logo - uses progImg in dependency array indirectly via reloadLogo

    console.log(
      "Fetching logo for projectId:",
      `/personal/${AZIENDA}/doc/logo/logo_${projectId}.png?v=${progImg}`
    );
    setProjectLogo(
      `/personal/${AZIENDA}/doc/logo/logo_${projectId}.png?v=${progImg}`
    );

    /*     fetch(`/personal/${AZIENDA}/doc/logo/logo_${projectId}.png?v=${progImg}`) // Use progImg for cache busting
      .then(async (res) => {
        if (res.ok) {
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setProjectLogo(
              `/personal/${AZIENDA}/doc/logo/logo_${projectId}.png?v=${progImg}`
            );
          };
          reader.readAsDataURL(blob);
        } else {
          setProjectLogo(null); // Reset if logo not found or error
        }
      })
      .catch((err) => {
        console.error("Error fetching project logo:", err);
        setProjectLogo(null);
      }); */
  }, [projectId, AZIENDA, progImg]); // Add progImg dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run fetchData when dependencies change

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]); // Run fetchLogo when its dependencies change (including progImg)

  // Function to trigger logo refetch
  const reloadLogo = () => {
    setProgImg((prev) => prev + 1);
  };

  return {
    project,
    keywords,
    uniqueExtractionDates,
    projectLogo,
    loading,
    error,
    reloadLogo,
    setProject,
    reloadProjectData: fetchData,
  }; // Expose fetchData as reloadProjectData
};

export default useProjectData;
