"use client";

import React from 'react';
import { Property } from '../types/property';

interface PropertyPanelProps {
  property: Property | null;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<Property['priceCategory'], { label: string; className: string }> = {
  cheap:     { label: '〜¥10万',   className: 'bg-green-100 text-green-800' },
  mid:       { label: '¥10〜20万', className: 'bg-yellow-100 text-yellow-800' },
  expensive: { label: '¥20万〜',   className: 'bg-red-100 text-red-800' },
};

export default function PropertyPanel({ property, onClose }: PropertyPanelProps) {
  if (!property) {
    return (
      <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">
          🗺️
        </div>
        <div className="text-center px-6">
          <p className="text-sm font-semibold text-gray-600 mb-1">物件を選択してください</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            地図上の物件マーカーを<br />クリックして詳細を表示
          </p>
        </div>
      </div>
    );
  }

  const category = CATEGORY_LABELS[property.priceCategory];
  const isApiData = property.id.startsWith('mlit-');

  return (
    <div className="w-80 shrink-0 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-sm font-bold text-white leading-snug pr-2">{property.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none shrink-0 transition-colors"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="text-3xl font-bold text-white mb-1">
          ¥{property.monthlyRent.toLocaleString()}
          <span className="text-base font-normal text-slate-400">/月</span>
        </div>
        {isApiData && (
          <p className="text-xs text-slate-500 mb-2">※取引価格より推定（参考値）</p>
        )}

        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${category.className}`}>
          {category.label}
        </span>
      </div>

      <div className="p-5 flex-1">
        <div className="space-y-0 text-sm">
          {property.rooms && property.rooms !== '不明' && (
            <div className="flex justify-between border-b border-gray-100 py-2.5 last:border-b-0">
              <span className="text-gray-400 text-xs uppercase tracking-wide">間取り</span>
              <span className="font-semibold text-gray-800">{property.rooms}</span>
            </div>
          )}
          {property.size > 0 && (
            <div className="flex justify-between border-b border-gray-100 py-2.5 last:border-b-0">
              <span className="text-gray-400 text-xs uppercase tracking-wide">広さ</span>
              <span className="font-semibold text-gray-800">{property.size} m²</span>
            </div>
          )}
          <div className="flex justify-between border-b border-gray-100 py-2.5 last:border-b-0">
            <span className="text-gray-400 text-xs uppercase tracking-wide">住所</span>
            <span className="font-semibold text-gray-800 text-right">{property.address}</span>
          </div>
          {property.nearestStation && (
            <div className="flex justify-between border-b border-gray-100 py-2.5 last:border-b-0">
              <span className="text-gray-400 text-xs uppercase tracking-wide">最寄駅</span>
              <span className="font-semibold text-gray-800 text-right">
                {property.nearestStation}駅
                {property.timeToStation != null ? ` 徒歩${property.timeToStation}分` : ''}
              </span>
            </div>
          )}
          {property.buildingYear && (
            <div className="flex justify-between py-2.5">
              <span className="text-gray-400 text-xs uppercase tracking-wide">建築年</span>
              <span className="font-semibold text-gray-800">{property.buildingYear}年</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
