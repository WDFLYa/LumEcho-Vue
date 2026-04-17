import request from '@/utils/request'

// 获取活动列表 ✅ 修复：支持 搜索 + 筛选 + 分页
export function getActivityList(status, keyword, pageNum, pageSize) {
    return request({
        url: '/api/activity/list',
        method: 'get',
        params: {
            status,
            keyword,
            pageNum,
            pageSize
        }
    })
}

// 创建活动
export function createActivity(data) {
    return request({
        url: '/api/activity/create',
        method: 'POST',
        data
    })
}

// 省市区
export function getAllProvince() {
    return request.get('/api/address/getallprovince')
}

export function getCitiesByProvince(provinceId) {
    return request.get('/api/address/getallcity', { params: { provinceId } })
}

export function getDistrictsByCity(cityId) {
    return request.get('/api/address/getalldistrict', { params: { cityId } })
}

export function getActivityDetail(id) {
    return request({
        url: '/api/activity/detail/' + id,
        method: 'get'
    })
}

export function applyActivity(activityId) {
    return request({
        url: `/api/activityapplication/${activityId}/apply`,
        method: 'post'
    })
}

// 取消报名
export function cancelApplication(applicationId) {
    return request({
        url: `/api/activityapplication/applications/${applicationId}/cancel`,
        method: 'post'
    })
}

// 审核通过
export function approveApplication(applicationId) {
    return request({
        url: `/api/activityapplication/applications/${applicationId}/approve`,
        method: 'post'
    })
}

// 审核拒绝
export function rejectApplication(applicationId) {
    return request({
        url: `/api/activityapplication/applications/${applicationId}/reject`,
        method: 'post'
    })
}

// 获取所有报名记录
export function listAllApplications() {
    return request({
        url: '/api/activityapplication/applications/listall',
        method: 'get'
    })
}
// 查询我的报名状态
export function getMyApplicationStatus(activityId) {
    return request({
        url: `/api/activityapplication/my-status/${activityId}`,
        method: 'get'
    })
}

// 查询活动所有报名
export function getApplicationListByActivityId(activityId) {
    return request({
        url: `/api/activityapplication/list/${activityId}`,
        method: 'get'
    })
}

export function applyActivityDirect(activityId) {
    return request({
        url: `/api/activityapplication/${activityId}/apply-direct`,
        method: 'post'
    })
}

// 活动签到
export function activityCheckIn(data) {
    return request({
        url: '/api/activity/checkin',
        method: 'post',
        data
    })
}

// 获取待审核/待开始活动列表（带类型筛选）
export function getPendingActivityList(type = null) {
    return request({
        url: '/api/admin/activity/pending',
        method: 'get',
        params: { type }
    })
}

// 获取某个活动的报名列表
export function getActivityApplyList(activityId) {
    return request({
        url: `/api/admin/activity/apply/list/${activityId}`,
        method: 'get'
    })
}

// 管理员通过报名
export function approveApply(applicationId) {
    return request({
        url: `/api/admin/activity/apply/approve/${applicationId}`,
        method: 'post'
    })
}

// 管理员拒绝报名
export function rejectApply(applicationId) {
    return request({
        url: `/api/admin/activity/apply/reject/${applicationId}`,
        method: 'post'
    })
}
