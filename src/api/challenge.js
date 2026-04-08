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

export function createChallenge(data) {
    return request({
        url: '/api/challenge/create',
        method: 'post',
        data
    })
}

export function applyChallenge(challengeId) {
    return request({
        url: `/api/challengeapplication/${challengeId}/apply`,
        method: 'post'
    })
}

export function getApplyStatus(challengeId) {
    return request({
        url: `/api/challengeapplication/status/${challengeId}`,
        method: 'get'
    })
}

export function getApplicationByUserAndChallenge(params) {
    return request({
        url: '/api/challengeapplication/getByUserAndChallenge',
        method: 'get',
        params: params
    })
}

export function submitScore(data) {
    return request({
        url: '/api/challenge/score/submit',
        method: 'post',
        data
    })
}

// 2. 获取作品所有评分记录
export function getScoreList(submissionId) {
    return request({
        url: `/api/challenge/score/list/${submissionId}`,
        method: 'get'
    })
}

// 3. 获取平均分
export function getAvgScore(submissionId) {
    return request({
        url: `/api/challenge/score/avg/${submissionId}`,
        method: 'get'
    })
}

// 4. 检查当前用户是否已打分
export function checkHasScored(submissionId) {
    return request({
        url: `/api/challenge/score/check/${submissionId}`,
        method: 'get'
    })
}