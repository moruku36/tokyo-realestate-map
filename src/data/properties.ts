import { Property } from '../types/property';

export const PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: '渋谷コンパクトスタジオ',
    monthlyRent: 95000,
    size: 22,
    rooms: '1K',
    address: '渋谷区道玄坂1丁目',
    latitude: 35.6580,
    longitude: 139.7016,
    priceCategory: 'cheap',
  },
  {
    id: 'p2',
    name: '新宿モダン1LDK',
    monthlyRent: 145000,
    size: 38,
    rooms: '1LDK',
    address: '新宿区西新宿2丁目',
    latitude: 35.6896,
    longitude: 139.6917,
    priceCategory: 'mid',
  },
  {
    id: 'p3',
    name: '六本木ラグジュアリー2LDK',
    monthlyRent: 280000,
    size: 72,
    rooms: '2LDK',
    address: '港区六本木3丁目',
    latitude: 35.6628,
    longitude: 139.7314,
    priceCategory: 'expensive',
  },
  {
    id: 'p4',
    name: '中目黒リバービュー',
    monthlyRent: 185000,
    size: 48,
    rooms: '1LDK',
    address: '目黒区上目黒1丁目',
    latitude: 35.6437,
    longitude: 139.6980,
    priceCategory: 'mid',
  },
  {
    id: 'p5',
    name: '秋葉原テックフラット',
    monthlyRent: 78000,
    size: 19,
    rooms: '1R',
    address: '千代田区外神田3丁目',
    latitude: 35.7022,
    longitude: 139.7741,
    priceCategory: 'cheap',
  },
  {
    id: 'p6',
    name: '青山デザイナーズロフト',
    monthlyRent: 320000,
    size: 85,
    rooms: '2LDK',
    address: '港区南青山4丁目',
    latitude: 35.6649,
    longitude: 139.7175,
    priceCategory: 'expensive',
  },
  {
    id: 'p7',
    name: '上野ファミリー2DK',
    monthlyRent: 115000,
    size: 52,
    rooms: '2DK',
    address: '台東区上野5丁目',
    latitude: 35.7141,
    longitude: 139.7774,
    priceCategory: 'mid',
  },
  {
    id: 'p8',
    name: '下北沢居心地1K',
    monthlyRent: 82000,
    size: 24,
    rooms: '1K',
    address: '世田谷区北沢2丁目',
    latitude: 35.6614,
    longitude: 139.6679,
    priceCategory: 'cheap',
  },
];

export function getPriceColor(category: Property['priceCategory']): [number, number, number, number] {
  switch (category) {
    case 'cheap':     return [34, 197, 94, 220];   // 緑
    case 'mid':       return [234, 179, 8, 220];   // 黄
    case 'expensive': return [239, 68, 68, 220];   // 赤
  }
}
