import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader, ChevronRight } from 'lucide-react';
import { chatApi } from '../../services/chatApi';
import defaultPlaceholder from '../../assets/images/icons/defaultplaceholder_noimageavailable.png';

export default function ChatInbox({ onOpenChat }) {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chatApi.getConversations()
      .then(data => setThreads(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

  if (threads.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm mt-8">
        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No Messages Yet</h3>
        <p className="text-slate-500">When you contact someone or they contact you, chats will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Your Conversations</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {threads.map((thread, idx) => {
          // Extract valid image for preview
          const validImages = (thread.item.images || []).map(i => i.imageUrl).filter(url => url && !url.startsWith('blob:'));
          const imgUrl = validImages.length > 0 ? validImages[0] : defaultPlaceholder;

          return (
            <div 
              key={idx} 
              onClick={() => onOpenChat(thread.item, thread.otherUser)}
              className="p-4 hover:bg-slate-50 cursor-pointer transition flex items-center gap-4"
            >
              <img src={imgUrl} alt="Item" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-sm">{thread.otherUser.fullName}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(thread.lastMessageTime).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-semibold mb-1">{thread.item.title}</p>
                <p className="text-sm text-slate-500 line-clamp-1">{thread.lastMessage}</p>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </div>
          );
        })}
      </div>
    </div>
  );
}