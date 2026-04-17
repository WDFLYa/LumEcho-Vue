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

// ========== 管理员报名管理 ==========
// 获取待开始挑战赛
export function listPendingChallenges() {
    return request({
        url: '/api/challenge/admin/pending',
        method: 'get'
    })
}

// 根据挑战赛ID获取报名列表（带用户信息）
export function getChallengeApplyList(challengeId) {
    return request({
        url: `/api/challengeapplication/admin/list/${challengeId}`,
        method: 'get'
    })
}

// 管理员审核通过
export function approveApply(applicationId) {
    return request({
        url: `/api/challengeapplication/applications/${applicationId}/approve`,
        method: 'post'
    })
}

// 管理员拒绝（带备注）
export function rejectApplyWithRemark(applicationId, remark) {
    return request({
        url: `/api/challengeapplication/admin/reject/${applicationId}`,
        method: 'post',
        params: { remark }
    })
}