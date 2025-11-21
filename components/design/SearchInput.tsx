'use client';

import { Input } from '@/elements/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/elements/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
      <Input
        variant="glass"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-white/50 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
