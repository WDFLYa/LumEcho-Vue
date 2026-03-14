import request from "@/utils/request";

/**
 * 获取帖子详情
 * @param {Number} id - 帖子 ID
 */
export function getPostById(id) {
    return request.get(`/api/post/selectById/${id}`);
}


export function publishPost(data) {
    return request.post("/api/post/publish", data)
}

/**
 * 获取所有帖子（首页用）
 * @param {Object} params - 查询参数
 */
export function getHomePosts(params) {
    return request.get("/api/post/select/all", { params });
}

/**
 * 发布帖子
 * @param {Object} data - 帖子数据
 */
export function createPost(data) {
    return request.post("/api/post/create", data);
}



/**
 * 取消点赞
 * @param {Number} id - 帖子 ID
 */
export function unlikePost(id) {
    return request.post(`/api/post/unlike/${id}`);
}

export function getLikeStatus(id) {
    return request.get(`/api/post/${id}/like-status`);
}

export function getLikeStatuses(ids) {
    return request.post('/api/post/likes/statuses', ids);
}

export function toggleLike(postId) {
    return request.post(`/api/post/${postId}/like`);
}

export function getUserPostsApi(params) {
    return request.get('/api/post/select/user', { params });
}