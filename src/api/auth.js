
import request from "@/utils/request";

export function registerByAccount(data) {
    return request.post("/api/auth/register/account", data);
}

export function sendCodeByPhone(data) {
    return request.post("/api/message/register/sendcode", data);
}

export function sendLoginCode(data) {
    return request.post("/api/message/login/sendcode", data);
}

export function registerByPhone(data) {
    return request.post("/api/auth/register/phone", data);
}

export function loginByAccount(data) {
    return request.post("/api/user/login/account", data);
}

export function loginByPhone(data) {
    return request.post("api/user/login/phone", data);
}

export function getHomePosts(params) {
    return request.get("/api/post/select/all", { params });
}

export function getCurrentUserInfo() {
    return request.get("/api/user/getuserinfo");
}