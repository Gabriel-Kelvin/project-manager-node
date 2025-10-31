import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from 'lodash';

const TaskSearch = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search tasks...",
  debounceMs = 300 
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    onSearchChange(term);
  }, debounceMs);

  // Update local state when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      
      <input
        type="text"
        value={localSearchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      
      {localSearchTerm && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={handleClearSearch}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskSearch;
