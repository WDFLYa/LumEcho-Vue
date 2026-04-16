import request from '@/utils/request'

// 获取所有省份
export async function getAllProvince() {
    const res = await request({
        url: '/api/address/getallprovince',
        method: 'get'
    })
    return res.data
}

// 根据省份ID获取城市
export async function getCityByProvinceId(provinceId) {
    const res = await request({
        url: '/api/address/getallcity',
        method: 'get',
        params: { provinceId }
    })
    return res.data
}

// 根据城市ID获取区县
export async function getDistrictByCityId(cityId) {
    const res = await request({
        url: '/api/address/getalldistrict',
        method: 'get',
        params: { cityId }
    })
    return res.data
}

// 提交作品
export function submitWork(data) {
    return request({
        url: '/api/challenge/submission/submit',
        method: 'post',
        data
    })
}

// 查询我的提交记录
export function getMySubmission(applicationId) {
    return request({
        url: `/api/challenge/submission/my/${applicationId}`,
        method: 'get'
    })
}