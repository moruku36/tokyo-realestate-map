"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import MapComponent, { FlyToTarget } from '@/components/Map';
import PropertyPanel from '@/components/PropertyPanel';
import FilterBar from '@/components/FilterBar';
import { PROPERTIES } from '@/data/properties';
import type { Property } from '@/types/property';

type Category = Property['priceCategory'];

export default function Home() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(['cheap', 'mid', 'expensive'])
  );
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [apiProperties, setApiProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    () => allProperties.filter((p) => activeCategories.has(p.priceCategory)),
    [allProperties, activeCategories]
  );

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
        alert('場所が見つかりませんでした');
        return;
      }

      // 毎回新オブジェクトを生成して useEffect を発火させる
      setFlyTo({
        longitude: parseFloat(results[0].lon),
        latitude: parseFloat(results[0].lat),
        zoom: 13,
      });
    } catch (e) {
      console.error('Geocoding error:', e);
      alert('検索エラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <FilterBar
        activeCategories={activeCategories}
        onChange={setActiveCategories}
        onSearch={handleSearch}
        isSearching={isSearching}
        propertyCount={filteredProperties.length}
        isLoading={isLoading}
      />
      <div className="flex flex-1 overflow-hidden">
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
      </div>
    </div>
  );
}
