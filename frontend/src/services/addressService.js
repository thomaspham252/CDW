import axios from "axios";

const addressApi = axios.create({
  baseURL: "https://provinces.open-api.vn/api",
});

const addressService = {
  getProvinces: async () => {
    const response = await addressApi.get("/p/");
    return response.data;
  },

  getDistricts: async (provinceCode) => {
    if (!provinceCode) return [];
    const response = await addressApi.get(`/p/${provinceCode}`, {
      params: { depth: 2 },
    });
    return response.data.districts || [];
  },

  getWards: async (districtCode) => {
    if (!districtCode) return [];
    const response = await addressApi.get(`/d/${districtCode}`, {
      params: { depth: 2 },
    });
    return response.data.wards || [];
  },
};

export default addressService;
