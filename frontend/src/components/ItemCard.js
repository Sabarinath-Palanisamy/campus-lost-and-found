import React, { useState } from 'react';
import { Edit2, Trash2, MessageSquare, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppState } from '../context/AppState';
import defaultPlaceholder from '../assets/images/icons/defaultplaceholder_noimageavailable.png'; 

export default function ItemCard({ item, onEdit, onDelete, onContact }) {
  const { auth } = useAppState();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isOwner = auth.isLoggedIn && auth.user.id === item.user?.id;

  const validImages = (item.images || [])
    .map(img => img.imageUrl)
    .filter(url => url && !url.startsWith('blob:'));

  const imagesToDisplay = validImages.length > 0 ? validImages : [defaultPlaceholder];

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % imagesToDisplay.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + imagesToDisplay.length) % imagesToDisplay.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group flex flex-col">
      
      {/* IMAGE SLIDER HEADER */}
      <div className="h-48 bg-slate-100 relative overflow-hidden group/slider">
        <img 
          src={imagesToDisplay[currentImgIndex]} 
          alt={`${item.title} (${currentImgIndex + 1} of ${imagesToDisplay.length})`}
          className="w-full h-full object-cover transition-all duration-300"
          onError={(e) => { e.target.src = defaultPlaceholder; }}
        />

        {/* Item Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${item.itemType === 'F' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {item.itemType === 'F' ? 'FOUND' : 'LOST'}
          </span>
        </div>

        {/* Carousel Controls */}
        {imagesToDisplay.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/40 text-white hover:bg-slate-900/70 backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity z-10"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>

            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/40 text-white hover:bg-slate-900/70 backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity z-10"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>

            {/* Pagination Indicators (Dots) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {imagesToDisplay.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CARD DETAILS BODY */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">{item.title}</h3>
        </div>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{item.description}</p>
        
        <div className="mt-auto space-y-2 mb-6">
          <div className="flex items-center text-xs text-slate-500 gap-2">
            <MapPin size={14} className="text-rose-500" />
            <span className="truncate">{item.locationName}</span>
          </div>
          <div className="flex items-center text-xs text-slate-500 gap-2">
            <Clock size={14} className="text-slate-400" />
            <span>{new Date(item.eventDate).toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
          {isOwner ? (
            <>
              <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Edit Item">
                <Edit2 size={18} />
              </button>
              <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete Item">
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <button onClick={onContact} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-sm font-bold rounded-lg border border-slate-200 hover:border-blue-200 transition">
              <MessageSquare size={16} />
              Message {item.user?.fullName?.split(' ')[0] || 'User'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}