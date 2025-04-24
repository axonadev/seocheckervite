import { useEffect, useState } from 'react';
import useEnv from '../hooks/useEnv';
import { Leggi } from '../utility/callFetch';

export default function useKeywordCount(token) {
  const { SERVERAPI, AZIENDA } = useEnv();
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const filtro = `WHERE AZIENDA='${AZIENDA}'`;
        const response = await Leggi(
          SERVERAPI,
          token,
          'SEO_STATKEYWORDS',
          filtro
        );
        console.log("DEBUG keywords response", response);
        const keywords = response?.Itemset?.SEO_STATKEYWORDS;
        let count = 0;
        if (Array.isArray(keywords) && keywords.length === 1 && keywords[0].count) {
          count = keywords[0].count;
        } else if (Array.isArray(keywords)) {
          count = keywords.length;
        } else if (typeof keywords === 'number') {
          count = keywords;
        }
        setCount(count);
      } catch (e) {
        setCount(0);
      }
    };
    if (token) fetchCount();
  }, [SERVERAPI, AZIENDA, token]);

  return count;
}
