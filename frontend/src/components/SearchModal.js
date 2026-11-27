import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchModal({ categories, onClose, onSearch }) {
  const [filters, setFilters] = useState({
    keyword: '',
    description: '',
    locationName: '',
    categoryId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Search size={18}/> Find an Item
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keywords / Title</label>
            <input 
              type="text" 
              placeholder="e.g. iPhone, black wallet..."
              value={filters.keyword} 
              onChange={e => setFilters({...filters, keyword: e.target.value})} 
              className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input 
              type="text" 
              placeholder="Any specific details..."
              value={filters.description} 
              onChange={e => setFilters({...filters, description: e.target.value})} 
              className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
              <input 
                type="text" 
                placeholder="e.g. Library, Cafe..."
                value={filters.locationName} 
                onChange={e => setFilters({...filters, locationName: e.target.value})} 
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select 
                value={filters.categoryId} 
                onChange={e => setFilters({...filters, categoryId: e.target.value ? parseInt(e.target.value) : ''})} 
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm">
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}