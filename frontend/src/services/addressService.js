import api from "./axiosInstance";

const addressService = {
  getProvinces: async () => {
    const response = await api.get("/api/shipping/provinces");
    return response.data;
  },

  getDistricts: async (provinceCode) => {
    if (!provinceCode) return [];
    const response = await api.get("/api/shipping/districts", {
      params: { provinceId: provinceCode },
    });
    return response.data || [];
  },

  getWards: async (districtCode) => {
    if (!districtCode) return [];
    const response = await api.get("/api/shipping/wards", {
      params: { districtId: districtCode },
    });
    return response.data || [];
  },
};

export default addressService;
