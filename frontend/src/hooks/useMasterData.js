import { useState, useEffect } from 'react';
import { itemApi } from '../services/api';
import { saveMasterDataToIDB, getMasterDataFromIDB } from '../utils/indexedDB';

export function useMasterData() {
  const [masterData, setMasterData] = useState({ categories: [], itemTypes: {}, statuses: {} });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cachedData = await getMasterDataFromIDB();
        if (cachedData) {
          setMasterData(cachedData);
          return;
        }
        const data = await itemApi.fetchMasterData();
        setMasterData(data);
        await saveMasterDataToIDB(data);
      } catch (error) {
        console.error("Master data load failed:", error);
      }
    };
    loadData();
  }, []);

  return masterData;
}