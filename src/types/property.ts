export interface Property {
  id: string;
  name: string;
  monthlyRent: number;      // 円
  size: number;             // m²
  rooms: string;            // 例: "1LDK"
  address: string;
  latitude: number;
  longitude: number;
  priceCategory: 'cheap' | 'mid' | 'expensive';
  nearestStation?: string;
  timeToStation?: number;   // 徒歩分
  buildingYear?: number;    // 建築年 (西暦)
}
