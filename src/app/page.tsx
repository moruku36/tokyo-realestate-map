"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import MapComponent, { FlyToTarget } from '@/components/Map';
import PropertyPanel from '@/components/PropertyPanel';
import FilterBar from '@/components/FilterBar';
import { PROPERTIES } from '@/data/properties';
import type { Property, RoomsFilterValue, MaxWalkValue } from '@/types/property';

type Category = Property['priceCategory'];

function normalizeRooms(rooms: string): RoomsFilterValue {
  if (rooms === '1R') return '1R';
  if (rooms === '1K') return '1K';
  if (rooms === '1LDK' || rooms === '1DK') return '1LDK';
  if (/^2/.test(rooms)) return '2LDK';
  return '3LDK+';
}

export default function Home() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(['cheap', 'mid', 'expensive'])
  );
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [apiProperties, setApiProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomsFilter, setRoomsFilter] = useState<Set<RoomsFilterValue>>(new Set());
  const [maxWalk, setMaxWalk] = useState<MaxWalkValue>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, visible: true });
    toastTimerRef.current = setTimeout(
      () => setToast((prev) => ({ ...prev, visible: false })),
      3000
    );
  }, []);

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Property[]) => {
        setApiProperties(data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error('API fetch failed:', e);
        setIsLoading(false);
      });
  }, []);

  const allProperties = useMemo(
    () => [...PROPERTIES, ...apiProperties],
    [apiProperties]
  );

  const filteredProperties = useMemo(
    () => allProperties.filter((p) => {
      if (!activeCategories.has(p.priceCategory)) return false;
      if (roomsFilter.size > 0 && !roomsFilter.has(normalizeRooms(p.rooms))) return false;
      if (maxWalk !== null && (p.timeToStation === undefined || p.timeToStation > maxWalk)) return false;
      return true;
    }),
    [allProperties, activeCategories, roomsFilter, maxWalk]
  );

  const handleRoomsFilterChange = useCallback((value: RoomsFilterValue) => {
    setRoomsFilter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'jp');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Nominatim ${res.status}`);

      const results = await res.json() as Array<{ lat: string; lon: string }>;
      if (results.length === 0) {
        showToast(`「${query}」が見つかりませんでした`);
        return;
      }

      setFlyTo({
        longitude: parseFloat(results[0].lon),
        latitude: parseFloat(results[0].lat),
        zoom: 13,
      });
    } catch (e) {
      console.error('Geocoding error:', e);
      showToast('検索エラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  }, [showToast]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('位置情報がサポートされていません');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTo({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
          zoom: 14,
        });
      },
      () => {
        showToast('現在地を取得できませんでした');
      }
    );
  }, [showToast]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <FilterBar
        activeCategories={activeCategories}
        onChange={setActiveCategories}
        onSearch={handleSearch}
        isSearching={isSearching}
        propertyCount={filteredProperties.length}
        isLoading={isLoading}
        roomsFilter={roomsFilter}
        onRoomsFilterChange={handleRoomsFilterChange}
        maxWalk={maxWalk}
        onMaxWalkChange={setMaxWalk}
        onGeolocate={handleGeolocate}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <MapComponent
          properties={filteredProperties}
          selectedProperty={selectedProperty}
          onPropertyClick={setSelectedProperty}
          flyTo={flyTo}
        />
        <PropertyPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
        {toast.visible && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg pointer-events-none toast-enter"
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
