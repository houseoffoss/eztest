'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface SearchableUserSelectProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  onUserSelect: (user: User) => void;
  excludeUserIds?: string[];
  disabled?: boolean;
  value?: string;
}

/**
 * Searchable user select component with dropdown
 * Fetches available users and filters them in real-time
 */
export const SearchableUserSelect = ({
  label = 'Select User Email *',
  placeholder = 'Search by email or name...',
  helperText = 'Start typing to search for users',
  onUserSelect,
  excludeUserIds = [],
  disabled = false,
  value = '',
}: SearchableUserSelectProps) => {
  const [searchInput, setSearchInput] = useState(value);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch available users on mount
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          const allUsers = data.data || [];
          // Filter out excluded users
          const filtered = allUsers.filter((user: User) => !excludeUserIds.includes(user.id));
          setAvailableUsers(filtered);
          setFilteredUsers(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch available users:', err);
      }
    };

    fetchAvailableUsers();
  }, [excludeUserIds]);

  const handleSearch = (searchValue: string) => {
    setSearchInput(searchValue);
    if (!searchValue.trim()) {
      setFilteredUsers([]);
      setShowDropdown(false);
      return;
    }

    const filtered = availableUsers.filter(user =>
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUsers(filtered);
    setShowDropdown(true);
  };

  const handleSelectUser = (user: User) => {
    setSearchInput(user.email);
    setShowDropdown(false);
    onUserSelect(user);
  };

  const handleInputFocus = () => {
    if (searchInput.trim()) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="space-y-2 relative">
      {label && <Label htmlFor="user-select">{label}</Label>}
      <div className="relative">
        <Input
          id="user-select"
          type="text"
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          disabled={disabled}
          required
        />

        {/* Dropdown */}
        {showDropdown && searchInput.trim() && (
          <div className="absolute top-full left-0 right-0 bg-[#1a2332] border border-white/10 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-500/20 border-b border-white/5 transition-colors"
                >
                  <div className="font-medium text-sm text-white">{user.name}</div>
                  <div className="text-xs text-white/60">{user.email}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-white/60">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
};
