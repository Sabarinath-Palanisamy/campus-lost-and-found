import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

export default function ItemFormModal({ item, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: item ? item.title : '',
    description: item ? item.description : '',
    locationName: item ? item.locationName : '',
    itemType: item ? item.itemType : 'L',
    categoryId: item && item.category ? item.category.id : (categories && categories.length > 0 ? categories[0].id : 1),
    imageUrls: item && item.images ? item.images.filter(img => img.isActive === 'Y' || img.isactive === true).map(img => img.imageUrl) : [], 
    eventDate: item && item.eventDate ? item.eventDate.slice(0, 16) : new Date().toISOString().slice(0, 16)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, !!item, item ? item.id : null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-bold">{item ? 'Edit Listing' : 'Report New Item'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select value={formData.itemType} onChange={e => setFormData({...formData, itemType: e.target.value})} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500">
                <option value="L">Lost</option>
                <option value="F">Found</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: parseInt(e.target.value)})} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500">
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  <option value="" disabled>Loading...</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location Name</label>
            <input required type="text" value={formData.locationName} onChange={e => setFormData({...formData, locationName: e.target.value})} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date & Time</label>
            <input required type="datetime-local" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500" />
          </div>

          <ImageUploader 
            images={formData.imageUrls} 
            onImagesChange={(urls) => setFormData({...formData, imageUrls: urls})} 
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500"></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm">
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}