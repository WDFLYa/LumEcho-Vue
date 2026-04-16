import request from "@/utils/request";
export function submitPhotographerApplication(data) {
    return request.post("/api/photographerapplication/apply", data);
}

export function getPhotographerApplication() {
    return request.get("/api/photographerapplication/get");
}

export function getPhotographerList() {
    return request({
        url: '/api/photographerapplication/admin/list',
        method: 'get'
    })
}

// 审核申请
export function reviewPhotographer(id, status, rejectReason) {
    return request({
        url: `/api/photographerapplication/admin/review/${id}`,
        method: 'put',
        data: {
            status: status,
            rejectReason: rejectReason // 即使是通过，后端也能接收到 null，或者你可以根据 status 判断是否传参
        }
    })
}