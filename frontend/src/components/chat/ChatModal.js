import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader, MapPin, CheckCircle, Handshake } from 'lucide-react';
import { chatApi } from '../../services/chatApi';
import defaultPlaceholder from '../../assets/images/icons/defaultplaceholder_noimageavailable.png';

export default function ChatModal({ item, currentUserId, otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [itemStatus, setItemStatus] = useState(item.status || 'OP'); 
  const [initiatorId, setInitiatorId] = useState(item.returnInitiatorId);
  const messagesEndRef = useRef(null);

  const receiverId = otherUser.id;
  const receiverName = otherUser.fullName;
  const isResolved = itemStatus === 'RE';

  const validImages = (item.images || []).map(i => i.imageUrl).filter(url => url && !url.startsWith('blob:'));
  const itemImage = validImages.length > 0 ? validImages[0] : defaultPlaceholder;

  const fetchMessages = useCallback(async () => {
    try {
      const data = await chatApi.getConversation(item.id, receiverId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [item.id, receiverId]); 

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!input.trim() || isResolved) return;
    try {
      await chatApi.sendMessage(item.id, receiverId, input, 'TEXT');
      setInput('');
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported by browser.");
    navigator.geolocation.getCurrentPosition(async (position) => {
      const locString = `${position.coords.latitude},${position.coords.longitude}`;
      await chatApi.sendMessage(item.id, receiverId, locString, 'LOCATION');
      fetchMessages();
    }, () => alert("Could not fetch location. Please allow permissions."));
  };

  const handleHandshake = async (action) => {
    try {
      const res = await chatApi.processHandshake(item.id, receiverId, action);
      setItemStatus(res.status);
      if (action === 'INITIATE') setInitiatorId(currentUserId);
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col h-[550px]">
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            {receiverName} {isResolved && <CheckCircle size={16} className="text-emerald-300" />}
          </h3>
          <p className="text-xs text-blue-100 opacity-90 truncate">{item.title}</p>
        </div>
        <button onClick={onClose} className="text-blue-100 hover:text-white transition"><X size={20}/></button>
      </div>

      {/* Handshake Status Bar */}
      {!isResolved && (
        <div className="bg-slate-100 border-b border-slate-200 p-3 text-sm flex justify-between items-center">
          {itemStatus === 'OP' ? (
            <span className="text-slate-600 flex-1">Ready to return?</span>
          ) : initiatorId === currentUserId ? (
            <span className="text-amber-600 font-semibold flex-1">Waiting for their acknowledgment...</span>
          ) : (
            <span className="text-emerald-600 font-semibold flex-1">They initiated a return.</span>
          )}
          
          {itemStatus === 'OP' && (
            <button onClick={() => handleHandshake('INITIATE')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded shadow-sm text-xs transition">
              <Handshake size={14} /> Initiate Return
            </button>
          )}
          {itemStatus === 'PR' && initiatorId !== currentUserId && (
            <button onClick={() => handleHandshake('ACKNOWLEDGE')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded shadow-sm text-xs transition">
              <CheckCircle size={14} /> Acknowledge
            </button>
          )}
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
        
        {/* ITEM CONTEXT CARD - Shows at the top of the chat */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex gap-3 shadow-sm items-center">
           <img src={itemImage} alt="Item Context" className="w-12 h-12 object-cover rounded-lg" />
           <div className="flex-1">
              <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.title}</h4>
              <p className="text-[10px] font-semibold mt-1 text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded">
                {item.itemType === 'F' ? 'FOUND ITEM' : 'LOST ITEM'}
              </p>
           </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-4 text-slate-400"><Loader className="animate-spin" /></div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.id === currentUserId;
            
            if (msg.messageType === 'SYSTEM') {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">{msg.content}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`max-w-[80%] p-3 rounded-xl text-sm ${isMe ? 'bg-blue-600 text-white self-end rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 self-start rounded-bl-sm'}`}>
                {msg.messageType === 'LOCATION' ? (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${msg.content}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold underline decoration-blue-300">
                    <MapPin size={16} /> View Shared Location
                  </a>
                ) : (
                  msg.content
                )}
                <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.createdOn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <button onClick={handleShareLocation} disabled={isResolved} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition disabled:opacity-50" title="Share Location">
          <MapPin size={18} />
        </button>
        <form onSubmit={handleSendText} className="flex-1 flex gap-2">
          <input 
            type="text" value={input} onChange={e => setInput(e.target.value)}
            disabled={isResolved}
            placeholder={isResolved ? "Chat closed." : "Type a message..."} 
            className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
          />
          <button type="submit" disabled={!input.trim() || isResolved} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}