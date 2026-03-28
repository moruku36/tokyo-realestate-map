"use client";

import React, { useState } from 'react';
import { Property } from '../types/property';

type Category = Property['priceCategory'];

interface FilterBarProps {
  activeCategories: Set<Category>;
  onChange: (categories: Set<Category>) => void;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  propertyCount?: number;
  isLoading?: boolean;
}

const CATEGORIES: { key: Category; label: string; color: string; activeColor: string }[] = [
  { key: 'cheap',     label: '〜¥10万',   color: 'border-green-400 text-green-700',   activeColor: 'bg-green-500 text-white border-green-500' },
  { key: 'mid',       label: '¥10〜20万',  color: 'border-yellow-400 text-yellow-700', activeColor: 'bg-yellow-400 text-white border-yellow-400' },
  { key: 'expensive', label: '¥20万〜',    color: 'border-red-400 text-red-700',       activeColor: 'bg-red-500 text-white border-red-500' },
];

export default function FilterBar({
  activeCategories,
  onChange,
  onSearch,
  isSearching,
  propertyCount,
  isLoading,
}: FilterBarProps) {
  const [query, setQuery] = useState('');

  const toggle = (key: Category) => {
    const next = new Set(activeCategories);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const handleSearch = () => {
    if (query.trim() && onSearch) onSearch(query.trim());
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shadow-sm h-14 shrink-0">
      <div className="flex items-center gap-1.5 mr-2 shrink-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold leading-none">東</span>
        </div>
        <span className="text-sm font-bold text-gray-800 tracking-tight">東京賃貸マップ</span>
        <span className="h-4 w-px bg-gray-300 mx-1" />
      </div>

      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">価格帯：</span>
      {CATEGORIES.map(({ key, label, color, activeColor }) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all whitespace-nowrap ${
            activeCategories.has(key) ? `${activeColor} shadow-sm` : `bg-white ${color} hover:shadow-sm`
          }`}
        >
          {label}
        </button>
      ))}

      {isLoading ? (
        <span className="text-xs text-blue-500 animate-pulse ml-1">データ読み込み中…</span>
      ) : propertyCount !== undefined ? (
        <span className="text-xs text-gray-400 ml-1 tabular-nums">{propertyCount.toLocaleString()}件表示</span>
      ) : null}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="地名・住所で検索…"
          className="text-sm border border-gray-200 bg-gray-50 rounded-full px-4 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-300 transition-colors placeholder:text-gray-400"
          disabled={isSearching}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="text-sm px-4 py-1.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 disabled:opacity-40 transition-all whitespace-nowrap shadow-sm"
        >
          {isSearching ? '検索中…' : '移動'}
        </button>
      </div>
    </div>
  );
}
