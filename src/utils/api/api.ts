
export type Shift = {
  id: string;
  logo?: string;
  coordinates?: { longitude: number; latitude: number };
  address?: string;
  companyName?: string;
  dateStartByCity?: string;
  timeStartByCity?: string;
  timeEndByCity?: string;
  currentWorkers?: number;
  planWorkers?: number;
  workTypes?: Array<{ id:number; name:string }>;
  priceWorker?: number;
  customerFeedbacksCount?: string | null;
  customerRating?: number | null;
  [key:string]: any;
};

const BASE = 'https://mobile.handswork.pro/api';

export async function getShiftsByCoords(latitude:number, longitude:number): Promise<Shift[]> {
  const url = `${BASE}/shifts/map-list-unauthorized?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  if (json && Array.isArray(json.data)) return json.data as Shift[];
  return [];
}
