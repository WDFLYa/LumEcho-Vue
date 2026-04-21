
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

export function getUserById(id) {
    return request.get(`/api/user/getuserinfo/${id}`);
}

export function getCurrentUserDetail() {
    return request.get("/api/user/getuser")
}

export function getUserPosts(userId, page = 1, size = 10) {
    return request.get("/api/post/user", {
        params: { userId, page, size }
    });
}

export function updateUserProfile(data) {
    return request.post("/api/user/update", data)
}

export function completeAccount(data) {
    return request.post('/api/user/complete/account',data)
}

// 完善手机 (针对账号登录用户)
export function completePhone(data) {
    return request.post('/api/user/complete/phone',data)
}

// 发送验证码
export function sendCompleteCode(data) {
    return request.post('/api/message/complete/sendcode', data)
}

export function updateUserAvatar(data) {
    return request.post('/api/user/updateuseravatar', data)
}


export function followUser(targetId) {
    return request.post(`/api/userfollow/follow/${targetId}`)
}


export function unfollowUser(targetId) {
    return request.post(`/api/userfollow/unfollow/${targetId}`)
}


export function getFollowStatus(targetId) {
    return request.post(`/api/userfollow/isFollowed/${targetId}`)
}

// 获取用户关注列表
export function getFollowingList (userId) {
    return request.get(`/api/userfollow/follow/list/${userId}`)
}

// 获取用户粉丝列表
export function getFollowersList(userId) {
    return request.get(`/api/userfollow/follower/list/${userId}`)
}



export function getUserList(params) {
    return request.get("/api/user/list", { params });
}

export function updateUserStatus(account, status) {
    return request.put(`/api/user/status/${account}`, { status });
}
export function logout() {
    return request({
        url: '/api/auth/logout',
        method: 'post',
        headers: {
            // 自动从本地拿token
            'Authorization': localStorage.getItem('token') || ''
        }
    })
}