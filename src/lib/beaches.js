export const BEACHES = [
  { name: 'Ақтау — Достық жағажайы', lat: 43.641, lng: 51.158 },
  { name: 'Ақтау — Нұрлы жағажай', lat: 43.66, lng: 51.145 },
  { name: 'Ақтау — 11 шағын аудан', lat: 43.651, lng: 51.17 },
  { name: 'Кендірлі', lat: 42.762, lng: 52.55 },
  { name: 'Форт-Шевченко', lat: 44.509, lng: 50.262 },
  { name: 'Баутино', lat: 44.54, lng: 50.25 },
  { name: 'Атырау — Жайық жағалауы', lat: 47.105, lng: 51.92 },
];

export const findBeach = (name) => BEACHES.find((b) => b.name === name);