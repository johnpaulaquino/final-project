const BASE_URL = 'https://psgc.gitlab.io/api';

export type GeoNode = {
  code: string;
  name: string;
};

export const psgcService = {
  getRegions: async (): Promise<GeoNode[]> => {
    const res = await fetch(`${BASE_URL}/regions/`);
    if (!res.ok) throw new Error('Failed to fetch regions');
    return res.json();
  },

  getProvincesByRegion: async (regionCode: string): Promise<GeoNode[]> => {
    const res = await fetch(`${BASE_URL}/regions/${regionCode}/provinces/`);
    if (!res.ok) throw new Error('Failed to fetch provinces');
    return res.json();
  },

  getCitiesByRegion: async (regionCode: string): Promise<GeoNode[]> => {
    const res = await fetch(`${BASE_URL}/regions/${regionCode}/cities-municipalities/`);
    if (!res.ok) throw new Error('Failed to fetch cities for region');
    return res.json();
  },

  getCitiesByProvince: async (provinceCode: string): Promise<GeoNode[]> => {
    const res = await fetch(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
  },

  getBarangaysByCity: async (cityCode: string): Promise<GeoNode[]> => {
    const res = await fetch(`${BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
    if (!res.ok) throw new Error('Failed to fetch barangays');
    return res.json();
  }
};