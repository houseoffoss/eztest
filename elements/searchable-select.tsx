'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  id: string;
  label: string;
  subtitle?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  id?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxResults?: number;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  label,
  id,
  searchPlaceholder = 'Type to search...',
  emptyMessage = 'No results found',
  maxResults = 10,
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [search, setSearch] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<SearchableSelectOption | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Find selected option when value changes
  React.useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.id === value);
      if (option) {
        setSelectedOption(option);
        setSearch(`${option.label}${option.subtitle ? ` - ${option.subtitle}` : ''}`);
      }
    } else {
      setSelectedOption(null);
      setSearch('');
    }
  }, [value, options]);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    
    const searchLower = search.toLowerCase();
    return options.filter(opt => {
      const labelMatch = opt.label.toLowerCase().includes(searchLower);
      const subtitleMatch = opt.subtitle?.toLowerCase().includes(searchLower);
      return labelMatch || subtitleMatch;
    });
  }, [options, search]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SearchableSelectOption) => {
    setSelectedOption(option);
    setSearch(`${option.label}${option.subtitle ? ` - ${option.subtitle}` : ''}`);
    setIsOpen(false);
    onValueChange?.(option.id);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearch('');
    setIsOpen(false);
    onValueChange?.('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      setSelectedOption(null);
      onValueChange?.('');
    }
  };

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {label && (
        <Label htmlFor={id} className={disabled ? 'opacity-50' : ''}>
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={cn(
            'bg-[#101a2b]/70 border-white/15 text-white/90 backdrop-blur-xl pr-8',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
        {selectedOption && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white/90 transition-colors z-10"
            tabIndex={-1}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && search && !disabled && (
        <div className="relative">
          {filteredOptions.length > 0 ? (
            <div className="absolute top-0 left-0 right-0 z-50 bg-[#101a2b]/95 border border-white/20 backdrop-blur-xl rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar p-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
              {filteredOptions.slice(0, maxResults).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2.5 text-left hover:bg-accent/10 focus:bg-accent/10 transition-colors rounded-md outline-hidden"
                >
                  <div className="font-medium text-sm text-white/90">{option.label}</div>
                  {option.subtitle && (
                    <div className="text-xs text-muted-foreground truncate">{option.subtitle}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="absolute top-0 left-0 right-0 z-50 bg-[#101a2b]/95 border border-white/20 backdrop-blur-xl rounded-lg shadow-lg px-4 py-3 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
              <div className="text-xs text-muted-foreground">
                {emptyMessage} &quot;{search}&quot;
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected indicator */}
      {selectedOption && (
        <div className="text-xs text-green-400 flex items-center gap-1">
          <span>✓</span>
          <span>Selected: {selectedOption.label}</span>
        </div>
      )}
    </div>
  );
}
