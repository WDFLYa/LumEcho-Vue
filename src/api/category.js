import request from '@/utils/request'

// 获取所有分类
export function getAllCategories() {
    return request.get('/api/category/getAllCategories')
}