import { useState, useEffect } from 'react';
import { itemApi } from '../services/api';

export function useItems(currentUserId) {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const data = await itemApi.fetchAll();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch API:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSaveItem = async (payload, isEditing, id) => {
    try {
      const completePayload = { ...payload, userId: currentUserId };
      await itemApi.save(completePayload, isEditing, id);
      await fetchItems();
      return true; // Success flag
    } catch (error) {
      console.error("Failed to save item.", error);
      return false;
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await itemApi.delete(id);
      await fetchItems();
      return true;
    } catch (error) {
      console.error("Failed to delete item.", error);
      return false;
    }
  };

  return { items, handleSaveItem, handleDeleteItem, refreshItems: fetchItems };
}