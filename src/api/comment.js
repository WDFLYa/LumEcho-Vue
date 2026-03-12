import request from "@/utils/request";

/**
 * 获取帖子评论列表（树形结构）
 * @param {Number} postId - 帖子 ID
 * @param {Object} params - 分页参数 { page, size }
 */
export function getComments(postId, params) {
    return request.get(`/api/comment/${postId}/comments`, { params });
}

/**
 * 发表评论
 * @param {Object} data - 评论数据 { postId, content, parentId }
 */
export function createComment(data) {
    return request.post("/api/comment/createcomment", data);
}

/**
 * 删除评论
 * @param {Number} id - 评论 ID
 */
export function deleteComment(id) {
    return request.delete(`/api/comment/${id}`);
}

/**
 * 点赞评论
 * @param {Number} id - 评论 ID
 */
export function likeComment(id) {
    return request.post(`/api/comment/like/${id}`);
}
