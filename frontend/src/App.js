import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ItemCard from './components/ItemCard';
import ItemFormModal from './components/ItemFormModal';
import ChatModal from './components/chat/ChatModal'; // Updated import
import ConfirmModal from './components/ConfirmModal';
import HomeMenu from './components/HomeMenu';
import SearchModal from './components/SearchModal';
import LoginModal from './components/LoginModal';
import { ArrowLeft } from 'lucide-react';
import ChatInbox from './components/chat/ChatInbox';
import { useMasterData } from './hooks/useMasterData';
import { useItems } from './hooks/useItems';
import { applyItemFilters } from './utils/filterUtils';
import { useAppState } from './context/AppState';
import { chatApi } from './services/chatApi';

export default function App() {
  const { auth } = useAppState();
  const masterData = useMasterData();
  
  const activeUserId = auth.user ? auth.user.id : null;
  const { items, handleSaveItem, handleDeleteItem } = useItems(activeUserId);
  
  const [currentView, setCurrentView] = useState('HOME');
  const [searchFilters, setSearchFilters] = useState(null);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, itemId: null });
  const [chatReceiver, setChatReceiver] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filter Logic
  const displayedItems = useMemo(
    () => applyItemFilters(items, currentView, searchFilters, activeUserId), 
    [items, currentView, searchFilters, activeUserId]
  );

  // Guard Clauses
  const handleSearchAction = () => {
    if (!auth.isLoggedIn) { setIsLoginOpen(true); return; }
    setIsSearchOpen(true);
  };

  const handleReportAction = () => {
    if (!auth.isLoggedIn) { setIsLoginOpen(true); return; }
    setSelectedItem(null); 
    setIsFormOpen(true);
  };

  const handleMyItemsAction = () => {
    if (!auth.isLoggedIn) { setIsLoginOpen(true); return; }
    setCurrentView('MY_ITEMS');
  };

  const handleContactAction = (item) => {
  if (!auth.isLoggedIn) { setIsLoginOpen(true); return; }
  setSelectedItem(item);
  setChatReceiver(item.user);
  setIsChatOpen(true);
  };

  const onSaveClick = async (payload, isEditing, id) => {
    const success = await handleSaveItem(payload, isEditing, id);
    if (success) setIsFormOpen(false);
  };

  const onDeleteConfirm = async () => {
    if (!deleteModalState.itemId) return;
    await handleDeleteItem(deleteModalState.itemId);
    setDeleteModalState({ isOpen: false, itemId: null });
  };

  const executeSearch = (filters) => {
    setSearchFilters(filters);
    setIsSearchOpen(false);
    setCurrentView('SEARCH_RESULTS');
  };

  useEffect(() => {
    if (!auth.isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    
    const fetchUnread = async () => {
      try {
        const data = await chatApi.getUnreadCount();
        setUnreadCount(data.count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();
    // Poll every 5 seconds. When a user opens a chat, the backend marks messages 
    // as read, and the next poll will automatically decrease the badge counter!
    const interval = setInterval(fetchUnread, 5000); 
    return () => clearInterval(interval);
  }, [auth.isLoggedIn]);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Header 
          onAddClick={handleReportAction}
          onLoginClick={() => setIsLoginOpen(true)}
          onSignupClick={() => setIsSignupOpen(true)}
          onMyReportsClick={handleMyItemsAction}
          onInboxClick={() => { if(auth.isLoggedIn) setCurrentView('MESSAGES'); else setIsLoginOpen(true); }}
          unreadCount={unreadCount}
        />
        {currentView === 'MESSAGES' ? (
          <div className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setCurrentView('HOME')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium">
              <ArrowLeft size={18} /> Back to Menu
            </button>
          </div>
          <ChatInbox onOpenChat={(item, otherUser) => {
            setSelectedItem(item);
            setChatReceiver(otherUser);
            setIsChatOpen(true);
          }} />
          </div>
        ) : currentView === 'HOME' ? (
          <HomeMenu 
            onSearchClick={handleSearchAction}
            onReportClick={handleReportAction}
            onMyItemsClick={handleMyItemsAction}
          />
        ) : (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentView('HOME')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium">
                <ArrowLeft size={18} /> Back to Menu
              </button>
              <h2 className="text-xl font-bold text-slate-800">
                {currentView === 'MY_ITEMS' ? 'My Reported Items' : 'Search Results'}
              </h2>
            </div>

            {displayedItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                No items found matching this criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onEdit={() => { setSelectedItem(item); setIsFormOpen(true); }}
                    onDelete={() => setDeleteModalState({ isOpen: true, itemId: item.id })}
                    onContact={() => handleContactAction(item)}  
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {isSearchOpen && <SearchModal categories={masterData.categories} onClose={() => setIsSearchOpen(false)} onSearch={executeSearch} />}
        {isFormOpen && <ItemFormModal item={selectedItem} categories={masterData.categories} onClose={() => setIsFormOpen(false)} onSave={onSaveClick} />}
        
        {/* Render ChatModal when isChatOpen is true */}
        {isChatOpen && selectedItem && chatReceiver && (
        <ChatModal 
          item={selectedItem} 
          currentUserId={activeUserId} 
          otherUser={chatReceiver} 
          onClose={() => setIsChatOpen(false)} 
        />
        )}
        
        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} isSignup={false} />}
        {isSignupOpen && <LoginModal onClose={() => setIsSignupOpen(false)} isSignup={true} />}

        <ConfirmModal
          isOpen={deleteModalState.isOpen}
          title="Delete Item"
          message="Are you sure you want to delete this listing? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          onConfirm={onDeleteConfirm}
          onClose={() => setDeleteModalState({ isOpen: false, itemId: null })}
        />
      </div>
    </div>
  );
}