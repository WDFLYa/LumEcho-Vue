import request from "@/utils/request"

/**
 * 上传图片
 * @param {File} file - 图片文件
 * @param {String} bizType - 业务类型 (POST_IMAGE / AVATAR 等)
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