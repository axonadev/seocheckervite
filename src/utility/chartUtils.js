/**
 * Calculates the distribution of keyword positions.
 * @param {Array} keywords - The array of keyword objects. Each object should have a 'KeywordSerp_Posizione' property.
 * @returns {Object} An object containing positionData (counts per range) and totalKeywords.
 */
export const calculateKeywordPositionData = (keywords = []) => {
  if (!Array.isArray(keywords)) {
    console.error("calculateKeywordPositionData expects an array, received:", keywords);
    keywords = []; // Default to empty array to prevent errors
  }

  const positionData = {
    pos1_10: 0,
    pos11_20: 0,
    pos21_50: 0,
    pos_gt_50: 0,
    pos_undefined: 0,
  };

  keywords.forEach((k) => {
    // Gestisce sia il formato corrente (KeywordSerp_Posizione) che quello storico (posizione)
    const position = parseInt(k.KeywordSerp_Posizione || k.posizione);
    
    if (!isNaN(position) && position > 0) {
      if (position <= 10) {
        positionData.pos1_10++;
      } else if (position <= 20) {
        positionData.pos11_20++;
      } else if (position <= 50) {
        positionData.pos21_50++;
      } else {
        positionData.pos_gt_50++;
      }
    } else {
      // Include null, undefined, "", 0, o valori negativi
      positionData.pos_undefined++;
    }
  });

  const totalKeywords = keywords.length;

  return { positionData, totalKeywords };
};
