// src/api/ai.js
import request from '@/utils/request'

// AI 文本润色接口
export function aiPolish(content) {
    return request({
        url: '/ai/polish',
        method: 'post',
        data: { content }
    })
}
// AI 摄影师对话
export function sendChat(content) {
    return request({
        url: '/ai/chat',
        method: 'post',
        data: { content }
    })
}

export function getChatHistory(photographerId) {
    return request({
        url: '/ai/chat-history',
        method: 'post',
        data: { photographerId }
    })
}