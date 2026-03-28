import { NextResponse } from 'next/server';
import { getMunicipalityCoords } from '@/data/municipalities';
import { generateProperties } from '@/data/generated-properties';
import type { Property } from '@/types/property';

const PREFECTURES = ['13', '14', '11', '12'];

// 取得対象の取引種別
const TARGET_TYPES = new Set(['中古マンション等', '新築マンション等']);

interface MlitRecord {
  Type: string;
  MunicipalityCode: string;
  Prefecture: string;
  Municipality: string;
  DistrictName: string;
  NearestStation: string;
  TimeToNearestStation: string;
  TradePrice: string;
  FloorPlan: string;
  Area: string;
  BuildingYear: string;
  Structure: string;
  Period: string;
}

function parseEraYear(s: string): number | undefined {
  const eraMap: Record<string, number> = { 昭和: 1925, 平成: 1988, 令和: 2018 };
  const m = s?.match(/^(昭和|平成|令和)(\d+)年$/);
  if (m) return eraMap[m[1]] + parseInt(m[2]);
  const m2 = s?.match(/^(\d{4})年$/);
  if (m2) return parseInt(m2[1]);
  return undefined;
}

function deriveCategory(rent: number): Property['priceCategory'] {
  if (rent < 100_000) return 'cheap';
  if (rent < 200_000) return 'mid';
  return 'expensive';
}

async function fetchPrefecture(prefCode: string): Promise<MlitRecord[]> {
  // 2021〜2024年の4年分を取得
  const periods = [
    { from: '20211', to: '20214' },
    { from: '20221', to: '20224' },
    { from: '20231', to: '20234' },
    { from: '20241', to: '20244' },
  ];
  const allRecords: MlitRecord[] = [];
  for (const { from, to } of periods) {
    const url = `https://www.land.mlit.go.jp/webland/api/TradeListSearch?from=${from}&to=${to}&area=${prefCode}`;
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const json = await res.json() as { status: string; data: MlitRecord[] };
      if (json.status === 'OK' && Array.isArray(json.data)) {
        allRecords.push(...json.data);
      }
    } catch {
      // ネットワーク不可 → 後続で生成データで補完
    }
  }
  return allRecords;
}

export async function GET() {
  // 外部APIを並列取得
  const results = await Promise.allSettled(PREFECTURES.map(fetchPrefecture));
  const apiRecords = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  const apiProperties: Property[] = [];
  let counter = 0;

  apiRecords.forEach((r, idx) => {
    if (!TARGET_TYPES.has(r.Type)) return;
    if (!r.TradePrice || r.TradePrice.includes('〜')) return;
    const price = parseInt(r.TradePrice.replace(/[^\d]/g, ''), 10);
    if (isNaN(price) || price < 1_000_000 || price > 500_000_000) return;

    const monthlyRent = Math.round(price * 0.04 / 12);
    if (monthlyRent < 20_000) return;

    const baseCoords = getMunicipalityCoords(r.MunicipalityCode);
    const seed = idx * 2.3999;
    const latOffset = Math.sin(seed) * 0.025;
    const lonOffset = Math.cos(seed) * 0.025;

    const timeRaw = parseInt(r.TimeToNearestStation, 10);
    counter++;
    apiProperties.push({
      id: `mlit-${counter}`,
      name: `${r.Municipality}${r.DistrictName ? ' ' + r.DistrictName : ''} マンション`,
      monthlyRent,
      size: parseFloat(r.Area) || 0,
      rooms: r.FloorPlan || '不明',
      address: `${r.Prefecture}${r.Municipality}${r.DistrictName ?? ''}`,
      latitude: baseCoords[0] + latOffset,
      longitude: baseCoords[1] + lonOffset,
      priceCategory: deriveCategory(monthlyRent),
      nearestStation: r.NearestStation || undefined,
      timeToStation: isNaN(timeRaw) ? undefined : timeRaw,
      buildingYear: parseEraYear(r.BuildingYear ?? ''),
    });
  });

  // APIデータと生成データを常に統合して物件数を最大化
  const generated = generateProperties();

  // APIデータが十分ある場合は生成データと統合、少ない場合は生成データのみ
  const combined = apiProperties.length >= 100
    ? [...apiProperties, ...generated]
    : generated;

  return NextResponse.json(combined);
}
