import axios from 'axios';

// 创建axios实例
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api', // 后端API基础URL
    timeout: 10000, // 请求超时时间
    withCredentials: true, // 新增：跨域携带cookie（支付必备）
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
    config => {
        // 从本地存储获取token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        console.error('请求错误:', error);
        // 新增：401未授权处理
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            alert('登录态已失效，请重新登录');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;