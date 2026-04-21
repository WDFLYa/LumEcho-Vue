import axios from "axios";

const request = axios.create({
    baseURL: "http://47.116.108.205:8080",
    timeout: 5000
});

// 保持你原有的配置 (如果需要跨域携带 Cookie)
request.defaults.withCredentials = true;

request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('user_token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        console.error('❌ [Axios] 请求拦截器错误:', error);
        return Promise.reject(error);
    }
);


export default request;