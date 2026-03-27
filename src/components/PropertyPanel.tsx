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
      <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-400 text-sm text-center px-6">
          地図上の物件マーカーを<br />クリックして詳細を表示
        </p>
      </div>
    );
  }

  const category = CATEGORY_LABELS[property.priceCategory];
  const isApiData = property.id.startsWith('mlit-');

  return (
    <div className="w-80 shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 leading-snug pr-2">{property.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="text-3xl font-bold text-gray-900 mb-1">
          ¥{property.monthlyRent.toLocaleString()}
          <span className="text-base font-normal text-gray-500">/月</span>
        </div>
        {isApiData && (
          <p className="text-xs text-gray-400 mb-2">※取引価格より推定（参考値）</p>
        )}

        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-4 ${category.className}`}>
          {category.label}
        </span>

        <div className="space-y-2 text-sm">
          {property.rooms && property.rooms !== '不明' && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">間取り</span>
              <span className="font-medium">{property.rooms}</span>
            </div>
          )}
          {property.size > 0 && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">広さ</span>
              <span className="font-medium">{property.size} m²</span>
            </div>
          )}
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">住所</span>
            <span className="font-medium text-right">{property.address}</span>
          </div>
          {property.nearestStation && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">最寄駅</span>
              <span className="font-medium text-right">
                {property.nearestStation}駅
                {property.timeToStation != null ? ` 徒歩${property.timeToStation}分` : ''}
              </span>
            </div>
          )}
          {property.buildingYear && (
            <div className="flex justify-between">
              <span className="text-gray-500">建築年</span>
              <span className="font-medium">{property.buildingYear}年</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
