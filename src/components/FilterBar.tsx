"use client";

import React, { useState } from 'react';
import { Property, RoomsFilterValue, MaxWalkValue } from '../types/property';

type Category = Property['priceCategory'];

interface FilterBarProps {
  activeCategories: Set<Category>;
  onChange: (categories: Set<Category>) => void;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  propertyCount?: number;
  isLoading?: boolean;
  roomsFilter: Set<RoomsFilterValue>;
  onRoomsFilterChange: (v: RoomsFilterValue) => void;
  maxWalk: MaxWalkValue;
  onMaxWalkChange: (v: MaxWalkValue) => void;
  onGeolocate: () => void;
}

const CATEGORIES: { key: Category; label: string; color: string; activeColor: string }[] = [
  { key: 'cheap',     label: '〜¥10万',   color: 'border-green-400 text-green-700',   activeColor: 'bg-green-500 text-white border-green-500' },
  { key: 'mid',       label: '¥10〜20万',  color: 'border-yellow-400 text-yellow-700', activeColor: 'bg-yellow-400 text-white border-yellow-400' },
  { key: 'expensive', label: '¥20万〜',    color: 'border-red-400 text-red-700',       activeColor: 'bg-red-500 text-white border-red-500' },
];

const ROOMS_OPTIONS: RoomsFilterValue[] = ['1R', '1K', '1LDK', '2LDK', '3LDK+'];

const WALK_OPTIONS: Array<{ label: string; value: MaxWalkValue }> = [
  { label: '徒歩指定なし', value: null },
  { label: '〜5分',        value: 5    },
  { label: '〜10分',       value: 10   },
  { label: '〜15分',       value: 15   },
];

export default function FilterBar({
  activeCategories,
  onChange,
  onSearch,
  isSearching,
  propertyCount,
  isLoading,
  roomsFilter,
  onRoomsFilterChange,
  maxWalk,
  onMaxWalkChange,
  onGeolocate,
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
    <div className="flex flex-col bg-white border-b border-gray-200 shadow-sm shrink-0">

      {/* ── 1行目: ロゴ・価格帯・件数 ────────────────── */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-2">

        {/* ロゴ */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold leading-none">東</span>
          </div>
          {/* タイトルはsmサイズ以上で表示 */}
          <span className="text-sm font-bold text-gray-800 tracking-tight hidden sm:inline">東京賃貸マップ</span>
          <span className="h-4 w-px bg-gray-300 mx-0.5 hidden sm:inline" />
        </div>

        {/* 価格帯フィルター */}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:inline">価格帯：</span>
        {CATEGORIES.map(({ key, label, color, activeColor }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`px-2.5 py-1 rounded-full border-2 text-xs font-semibold transition-all whitespace-nowrap ${
              activeCategories.has(key) ? `${activeColor} shadow-sm` : `bg-white ${color} hover:shadow-sm`
            }`}
          >
            {label}
          </button>
        ))}

        {/* 件数 */}
        {isLoading ? (
          <span className="text-xs text-blue-500 animate-pulse">読み込み中…</span>
        ) : propertyCount !== undefined ? (
          <span className="text-xs text-gray-400 tabular-nums">{propertyCount.toLocaleString()}件</span>
        ) : null}

        {/* 現在地ボタン・検索 (右寄せ、モバイルでは次の行に折り返し) */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onGeolocate}
            title="現在地を表示"
            className="px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm shrink-0"
            aria-label="現在地"
          >
            📍
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="地名・住所で検索…"
            className="text-sm border border-gray-200 bg-gray-50 rounded-full px-3 py-1 w-36 sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-300 transition-colors placeholder:text-gray-400"
            disabled={isSearching}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="text-sm px-3 py-1 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 disabled:opacity-40 transition-all whitespace-nowrap shadow-sm"
          >
            {isSearching ? '…' : '移動'}
          </button>
        </div>
      </div>

      {/* ── 2行目: 間取り・徒歩フィルター（横スクロール対応） ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-gray-100 bg-gray-50/60 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap shrink-0">間取り：</span>
        {ROOMS_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => onRoomsFilterChange(r)}
            className={`px-2.5 py-0.5 text-xs rounded-full border transition-all whitespace-nowrap shrink-0 ${
              roomsFilter.has(r)
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {r}
          </button>
        ))}

        <span className="h-4 w-px bg-gray-300 mx-0.5 shrink-0" />

        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap shrink-0">徒歩：</span>
        <select
          value={maxWalk ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onMaxWalkChange(v === '' ? null : (Number(v) as MaxWalkValue));
          }}
          className="text-xs border border-gray-300 rounded-md px-2 py-0.5 bg-white text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer shrink-0"
        >
          {WALK_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
