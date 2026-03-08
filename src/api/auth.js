
import request from "@/utils/request";

export function registerByAccount(data) {
    return request.post("/api/auth/register/account", data);
}

export function sendCodeByPhone(data) {
    return request.post("/api/message/register/sendcode", data);
}

export function registerByPhone(data) {
    return request.post("/api/auth/register/phone", data);
}