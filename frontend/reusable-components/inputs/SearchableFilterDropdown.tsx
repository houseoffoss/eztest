'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Filter } from 'lucide-react';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { cn } from '@/lib/utils';

export interface SearchableFilterDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allLabel?: string;
  searchPlaceholder?: string;
  className?: string;
}

/**
 * 検索付きフィルタプルダウン。冒頭に検索入力があり、項目が多い場合に絞り込める。
 */
export function SearchableFilterDropdown({
  value,
  onValueChange,
  options,
  placeholder = '選択',
  allLabel = 'すべて',
  searchPlaceholder = '検索...',
  className = '',
}: SearchableFilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties>({});
  const panelRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.trim().toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lower));
  }, [options, search]);

  const displayLabel = value === '' || value === 'all' ? placeholder : value;

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === '' || selectedValue === allLabel ? '' : selectedValue);
    setOpen(false);
    setSearch('');
  };

  React.useEffect(() => {
    if (!open || !containerRef.current || typeof document === 'undefined') return;
    const rect = containerRef.current.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 200),
      zIndex: 9999,
    });
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownPanel = open && (
    <div
      ref={panelRef}
      style={panelStyle}
      className="rounded-lg border border-white/20 bg-[#101a2b] p-0 shadow-xl backdrop-blur-xl"
    >
      <div className="p-2 border-b border-white/10">
        <Input
          type="text"
          variant="glass"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm"
          autoFocus
        />
      </div>
      <div className="min-h-[120px] max-h-60 overflow-y-auto custom-scrollbar p-1">
        <button
          type="button"
          onClick={() => handleSelect('')}
          className={cn(
            'w-full px-3 py-2 text-left text-sm rounded-md transition-colors',
            (value === '' || value === 'all') ? 'bg-primary/20 text-primary' : 'hover:bg-white/10 text-white/90'
          )}
        >
          {allLabel}
        </button>
        {filteredOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSelect(opt)}
            className={cn(
              'w-full px-3 py-2 text-left text-sm rounded-md transition-colors',
              value === opt ? 'bg-primary/20 text-primary' : 'hover:bg-white/10 text-white/90'
            )}
          >
            {opt}
          </button>
        ))}
        {filteredOptions.length === 0 && search.trim() && (
          <div className="px-3 py-4 text-sm text-white/50">該当なし</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('relative min-w-0', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full min-w-0 items-center gap-2 rounded-full border border-white/15 bg-[#101a2b]/70 px-4 py-2 text-sm text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 outline-none cursor-pointer"
      >
        <Filter className="w-4 h-4 shrink-0 text-white/60" />
        <span className="flex-1 text-left truncate min-w-0 block">{displayLabel}</span>
        <ChevronDown className={cn('w-4 h-4 shrink-0 text-white/60 transition-transform', open && 'rotate-180')} />
      </button>
      {typeof document !== 'undefined' && createPortal(dropdownPanel, document.body)}
    </div>
  );
}
