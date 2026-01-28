'use client';

import React from 'react';
import { Platform } from '../types';

interface PlatformsCheckboxGroupProps {
  values: Platform[];
  onChange: (values: Platform[]) => void;
}

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'IOS', label: 'iOS' },
  { value: 'ANDROID', label: 'Android' },
  { value: 'WEB', label: 'Web' },
];

export function PlatformsCheckboxGroup({
  values,
  onChange,
}: PlatformsCheckboxGroupProps) {
  const handleToggle = (platform: Platform) => {
    if (values.includes(platform)) {
      // Remove platform if already selected
      onChange(values.filter(p => p !== platform));
    } else {
      // Add platform if not selected
      onChange([...values, platform]);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {PLATFORM_OPTIONS.map((option) => {
        const isChecked = values.includes(option.value);
        return (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`platform-${option.value}`}
              checked={isChecked}
              onChange={() => handleToggle(option.value)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor={`platform-${option.value}`}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}
