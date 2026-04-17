import request from "@/utils/request"

/**
 * 通用文件上传
 * @param {File} file - 文件对象
 * @param {String} bizType - 业务类型 (如：image, document, video 等)
 */
export function uploadFile(file, bizType) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("bizType", bizType)

    return request.post("/api/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

/**
 * 上传/更新用户头像
 * @param {File} file - 头像文件
 * @param {String} bizType - 业务类型 (默认：avatar)
 */
export function uploadAvatar(file, bizType = "avatar") {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("bizType", bizType)

    return request.post("/api/avatar/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}