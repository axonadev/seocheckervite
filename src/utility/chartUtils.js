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
    const position = k.KeywordSerp_Posizione;
    if (position >= 1 && position <= 10) {
      positionData.pos1_10++;
    } else if (position >= 11 && position <= 20) {
      positionData.pos11_20++;
    } else if (position >= 21 && position <= 50) {
      positionData.pos21_50++;
    } else if (position > 50) {
      positionData.pos_gt_50++;
    } else {
      // Includes null, undefined, "", 0, or negative values
      positionData.pos_undefined++;
    }
  });

  const totalKeywords = keywords.length;

  return { positionData, totalKeywords };
};
