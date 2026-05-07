import api from "../axiosInstance";

export const register = async(fullName,email,password)=>{
    const res= await api.post("/auth/register",{fullName, email, password});
    return res.data;
};

export const login = async (email,password)=>{
    const res = await api.post("/auth/login",{email, password});
    localStorage.setItem("token",res.data.token);
    return res.data;
};

export const loginGoogle= async (idToken)=>{
    const res = await api.post("/auth/google",{idToken});
    localStorage.setItem("token" , res.data.token);
    return res.data;
};

export const logout = () => {
    localStorage.removeItem("token");
};