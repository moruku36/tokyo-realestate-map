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
  // 空状態: デスクトップのみサイドバーとして表示（モバイルでは非表示）
  if (!property) {
    return (
      <div className="hidden md:flex md:w-80 md:shrink-0 bg-white border-l border-gray-200 flex-col items-center justify-center gap-4">
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
    <>
      {/* モバイル: タップで閉じる背景オーバーレイ */}
      <div
        className="fixed inset-0 z-20 bg-black/20 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* パネル本体
          - モバイル: 画面下部から出るボトムシート (fixed)
          - デスクトップ: 右サイドバー (relative, w-80)
      */}
      <div className="
        fixed inset-x-0 bottom-0 z-30 max-h-[72vh] rounded-t-2xl
        md:relative md:inset-auto md:bottom-auto md:max-h-none md:h-full md:w-80 md:shrink-0 md:rounded-none
        bg-white border-t border-gray-200 md:border-t-0 md:border-l
        overflow-y-auto flex flex-col shadow-2xl md:shadow-none
      ">
        {/* ドラッグハンドル（モバイルのみ） */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ── ヘッダーゾーン（ダークグラデーション） ── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pt-4 pb-5 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-sm font-bold text-white leading-snug pr-2">{property.name}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl leading-none shrink-0 transition-colors p-1 -mr-1 -mt-1"
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

        {/* ── 詳細ゾーン ── */}
        <div className="px-5 py-4 flex-1">
          <div className="space-y-0 text-sm">
            {property.rooms && property.rooms !== '不明' && (
              <div className="flex justify-between border-b border-gray-100 py-2.5">
                <span className="text-gray-400 text-xs uppercase tracking-wide">間取り</span>
                <span className="font-semibold text-gray-800">{property.rooms}</span>
              </div>
            )}
            {property.size > 0 && (
              <div className="flex justify-between border-b border-gray-100 py-2.5">
                <span className="text-gray-400 text-xs uppercase tracking-wide">広さ</span>
                <span className="font-semibold text-gray-800">{property.size} m²</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 py-2.5">
              <span className="text-gray-400 text-xs uppercase tracking-wide">住所</span>
              <span className="font-semibold text-gray-800 text-right max-w-[60%]">{property.address}</span>
            </div>
            {property.nearestStation && (
              <div className="flex justify-between border-b border-gray-100 py-2.5">
                <span className="text-gray-400 text-xs uppercase tracking-wide">最寄駅</span>
                <span className="font-semibold text-gray-800 text-right">
                  {property.nearestStation}駅
                  {property.timeToStation != null ? ` 徒歩${property.timeToStation}分` : ''}
                </span>
              </div>
            )}
            {property.size > 0 && (
              <div className="flex justify-between border-b border-gray-100 py-2.5">
                <span className="text-gray-400 text-xs uppercase tracking-wide">価格/m²</span>
                <span className="font-semibold text-gray-800">¥{Math.round(property.monthlyRent / property.size).toLocaleString()}/m²</span>
              </div>
            )}
            {property.buildingYear && (
              <div className="flex justify-between py-2.5">
                <span className="text-gray-400 text-xs uppercase tracking-wide">築年数</span>
                <span className="font-semibold text-gray-800">{2026 - property.buildingYear}年（{property.buildingYear}年築）</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
