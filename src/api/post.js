import request from "@/utils/request";

/**
 * 获取帖子详情
 * @param {Number} id - 帖子 ID
 */
export function getPostById(id) {
    return request.get(`/api/post/selectById/${id}`);
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
 * 点赞帖子
 * @param {Number} id - 帖子 ID
 */
export function likePost(id) {
    return request.post(`/api/post/like/${id}`);
}

/**
 * 取消点赞
 * @param {Number} id - 帖子 ID
 */
export function unlikePost(id) {
    return request.post(`/api/post/unlike/${id}`);
}
