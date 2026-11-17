import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  size = 'sm', // 'xs', 'sm', 'md'
  variant = 'default',
  disabled = false,
  fullWidth = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  // Find currently selected option
  const selectedOption = options.find((opt) => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const displayLabel = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder;

  // Filter options based on search
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const label = typeof opt === 'object' ? opt.label : String(opt);
    const sublabel = typeof opt === 'object' ? (opt.sublabel || '') : '';
    return (
      label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sublabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Size styling
  const sizeStyles = {
    xs: 'h-7 px-2.5 text-[11px]',
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-3 text-xs',
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative select-none ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold transition-all outline-none ${
          sizeStyles[size] || sizeStyles.sm
        } ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:border-slate-300'
        } ${isOpen ? 'ring-2 ring-brand-500/10 border-brand-600' : ''} ${buttonClassName}`}
      >
        <span className="truncate text-left flex items-center gap-1.5 flex-1 min-w-0">
          <span className={`truncate ${!selectedOption && placeholder ? 'text-slate-400 font-normal' : ''}`}>
            {displayLabel}
          </span>
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`} 
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute left-0 mt-1.5 w-full min-w-[200px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 ${menuClassName}`}
        >
          {/* Optional Search Bar */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/60 sticky top-0 z-10 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-xs bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-3 text-center text-[11px] font-semibold text-slate-400">
                No matching results
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const optSublabel = typeof opt === 'object' ? opt.sublabel : null;
                const isSelected = optVal === value;

                return (
                  <button
                    key={String(optVal)}
                    type="button"
                    onClick={() => {
                      onChange(optVal);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-brand-50 text-brand-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="truncate flex-1 min-w-0">
                      <span className="truncate block leading-tight">{optLabel}</span>
                      {optSublabel && (
                        <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                          {optSublabel}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

