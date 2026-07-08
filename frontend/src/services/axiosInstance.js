import axios from "axios";
const api = axios.create({
    baseURL: "http://localhost:8080"
});


api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    // Chỉ gửi token nếu có, không ép buộc
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url || "";
        const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/google");

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        // 403: token hết hạn hoặc không hợp lệ → xóa token, không redirect
        if (error.response?.status === 403 && !isAuthRequest) {
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export default api;
