"use client";

import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as ReactMap } from 'react-map-gl/maplibre';
import { ScatterplotLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import type { MapViewState, PickingInfo } from '@deck.gl/core';
import { Property } from '../types/property';
import { getPriceColor } from '../data/properties';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 139.730,
  latitude: 35.672,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

const mapStyle = {
  version: 8,
  sources: {
    'gsi-std': {
      type: 'raster',
      tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
    },
  },
  layers: [
    {
      id: 'gsi-std-layer',
      type: 'raster',
      source: 'gsi-std',
      minzoom: 0,
      maxzoom: 18,
    },
  ],
};

export interface FlyToTarget {
  longitude: number;
  latitude: number;
  zoom?: number;
}

interface MapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertyClick: (property: Property) => void;
  flyTo?: FlyToTarget | null;
}

export default function MapComponent({ properties, selectedProperty, onPropertyClick, flyTo }: MapProps) {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!flyTo) return;
    setViewState((prev) => ({
      ...prev,
      longitude: flyTo.longitude,
      latitude: flyTo.latitude,
      zoom: flyTo.zoom ?? 13,
      transitionInterpolator: new FlyToInterpolator({ speed: 1.5 }),
      transitionDuration: 'auto' as const,
    }));
  }, [flyTo]);

  const layers = [
    new ScatterplotLayer<Property>({
      id: 'properties-layer',
      data: properties,
      getPosition: (d) => [d.longitude, d.latitude],
      getFillColor: (d) => getPriceColor(d.priceCategory),
      getRadius: 12,
      radiusUnits: 'pixels',
      pickable: true,
      stroked: true,
      getLineColor: (d) =>
        d.id === selectedProperty?.id ? [255, 255, 255, 255] : [0, 0, 0, 0],
      getLineWidth: (d) => (d.id === selectedProperty?.id ? 3 : 0),
      lineWidthUnits: 'pixels',
      onClick: ({ object }: PickingInfo<Property>) => {
        if (object) onPropertyClick(object);
      },
      onHover: ({ object, x, y }: PickingInfo<Property>) => {
        setHoveredProperty(object ?? null);
        setPointerPos({ x: x ?? 0, y: y ?? 0 });
      },
      updateTriggers: {
        getLineColor: [selectedProperty?.id],
        getLineWidth: [selectedProperty?.id],
      },
    }),
  ];

  return (
    <div className="relative w-full h-full bg-slate-100">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as MapViewState)}
        controller={true}
        layers={layers}
        style={{ width: '100%', height: '100%' }}
        getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'grab')}
      >
        <ReactMap
          mapStyle={mapStyle as Parameters<typeof ReactMap>[0]['mapStyle']}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {/* 地図凡例: モバイルでボトムシートに隠れないよう上部に配置 */}
      <div className="absolute top-3 left-3 md:bottom-6 md:top-auto md:left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 pointer-events-none">
        <p className="font-semibold text-gray-700 text-xs mb-1.5">賃料</p>
        {[
          { color: 'bg-green-500',  label: '〜¥10万' },
          { color: 'bg-yellow-400', label: '¥10〜20万' },
          { color: 'bg-red-500',    label: '¥20万〜' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
            <span className="text-gray-600 text-xs">{label}</span>
          </div>
        ))}
      </div>

      {hoveredProperty && (
        <div
          className="absolute z-20 bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3 pointer-events-none text-sm min-w-[160px]"
          style={{ left: pointerPos.x + 12, top: pointerPos.y - 10 }}
        >
          <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">{hoveredProperty.name}</div>
          <div className="text-blue-600 font-semibold text-sm tabular-nums">推定¥{hoveredProperty.monthlyRent.toLocaleString()}/月</div>
          {hoveredProperty.nearestStation && (
            <div className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
              <span>📍</span>
              <span>{hoveredProperty.nearestStation}駅</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
