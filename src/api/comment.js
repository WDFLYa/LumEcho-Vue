import request from "@/utils/request";


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
