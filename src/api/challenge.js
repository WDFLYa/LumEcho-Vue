import request from '@/utils/request'

// 获取挑战列表
export function getChallengeList(params) {
    return request.get('/api/challenge/list', {
        params
    })
}
export function getChallengeDetail(id) {
    return request({
        url: `/api/challenge/detail/${id}`,
        method: "get"
    })
}

export function getChallengeSubmissions(challengeId) {
    return request({
        url: `/api/challenge/${challengeId}/submission/list`,
        method: "get"
    })
}