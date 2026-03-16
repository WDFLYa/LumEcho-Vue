import request from "@/utils/request";
export function submitPhotographerApplication(data) {
    return request.post("/api/photographerapplication/apply", data);
}