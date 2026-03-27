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
      getRadius: 8,
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
    <div className="relative w-full h-full">
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

      {hoveredProperty && (
        <div
          className="absolute z-20 bg-white/95 border border-gray-200 rounded-md shadow-md px-3 py-2 pointer-events-none text-sm"
          style={{ left: pointerPos.x + 12, top: pointerPos.y - 10 }}
        >
          <div className="font-semibold">{hoveredProperty.name}</div>
          <div className="text-gray-600">推定¥{hoveredProperty.monthlyRent.toLocaleString()}/月</div>
          {hoveredProperty.nearestStation && (
            <div className="text-gray-500 text-xs">{hoveredProperty.nearestStation}駅</div>
          )}
        </div>
      )}
    </div>
  );
}
