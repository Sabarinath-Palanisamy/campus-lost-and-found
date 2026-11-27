import React from 'react';
import { Upload, X } from 'lucide-react';

export default function ImageUploader({ images = [], onImagesChange }) {
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Convert each selected file to a permanent Base64 data string
    const base64Promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Yields "data:image/png;base64,..."
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(base64Promises)
      .then(newBase64Strings => {
        // Append new Base64 strings to the existing images array
        onImagesChange([...images, ...newBase64Strings]);
      })
      .catch(err => console.error("Error converting images to Base64:", err));
  };

  const handleRemove = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onImagesChange(updated);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Item Images (Max 3)
      </label>
      
      <div className="grid grid-cols-3 gap-3 mb-2">
        {images.map((imgUrl, index) => (
          <div key={index} className="relative h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <img src={imgUrl} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < 3 && (
          <label className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition">
            <Upload size={20} className="text-slate-400 mb-1" />
            <span className="text-xs text-slate-500 font-medium font-semibold">Upload</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileSelect} 
              className="hidden" 
            />
          </label>
        )}
      </div>
    </div>
  );
}