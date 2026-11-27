export const applyItemFilters = (items, currentView, searchFilters, currentUserId) => {
  if (currentView === 'MY_ITEMS') {
    return items.filter(item => item.user && item.user.id === currentUserId);
  }
  
  if (currentView === 'SEARCH_RESULTS' && searchFilters) {
    return items.filter(item => {
      const matchKeyword = searchFilters.keyword 
        ? item.title?.toLowerCase().includes(searchFilters.keyword.toLowerCase())
        : true;
        
      const matchLoc = searchFilters.locationName
        ? item.locationName?.toLowerCase().includes(searchFilters.locationName.toLowerCase())
        : true;
        
      const matchCat = searchFilters.categoryId 
        ? item.category?.id === searchFilters.categoryId 
        : true;

      return !(item.user && item.user.id === currentUserId) && item.itemType === 'F' && matchCat && (matchKeyword || matchLoc);
    });
  }

  return items; 
};