<template>
  <div class="submission-page">
    <ChallengeNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
    />

    <div class="form-wrapper">
      <div class="page-header">
        <h2>📝 提交作品</h2>
        <p>提交你的精彩创作，参与评选</p>
      </div>

      <div class="form-card">
        <div class="form-group">
          <label class="form-label">作品标题 <span>*</span></label>
          <input
              v-model="form.title"
              type="text"
              placeholder="请输入作品标题"
              maxlength="50"
              class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">作品描述 <span>*</span></label>
          <textarea
              v-model="form.content"
              rows="5"
              placeholder="简单介绍一下你的作品..."
              class="form-input form-textarea"
          ></textarea>
        </div>

        <!-- 拍摄地区 -->
        <div class="form-group">
          <label class="form-label">拍摄地区 <span>*</span></label>
          <div class="address-row">
            <div class="select-item">
              <select v-model="provinceId" @change="handleProvinceChange">
                <option value="">请选择省份</option>
                <option v-for="p in provinceList" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <div class="select-item" :class="{ show: provinceId }">
              <select v-model="cityId" @change="handleCityChange" :disabled="!provinceId">
                <option value="">请选择城市</option>
                <option v-for="c in cityList" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="select-item" :class="{ show: cityId }">
              <select v-model="districtId" :disabled="!cityId">
                <option value="">请选择区域</option>
                <option v-for="d in districtList" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 作品上传 -->
        <div class="form-group">
          <label class="form-label">作品上传 <span>*</span></label>
          <div class="upload-box" @click="triggerUpload" v-if="!form.fileUrl">
            <div class="upload-icon">📷</div>
            <p>点击上传作品图片 / 视频</p>
            <input
                ref="fileInput"
                type="file"
                accept="image/*,video/*"
                style="display: none"
                @change="handleFileUpload"
            />
          </div>

          <div class="preview-box" v-if="form.fileUrl">
            <img :src="form.fileUrl" alt="预览" v-if="isImage" />
            <video :src="form.fileUrl" controls v-if="isVideo"></video>
            <div class="remove-btn" @click="removeFile">×</div>
          </div>
        </div>

        <button class="submit-btn" :disabled="loading" @click="submit">
          {{ loading ? '提交中...' : '提交作品' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ChallengeNavBar from "@/components/NavBar/ChallengeNavBar.vue";
import {
  getAllProvince,
  getCityByProvinceId,
  getDistrictByCityId,
  submitWork
} from '@/api/submission'
import { getCurrentUserInfo } from "@/api/auth";
import { uploadFile } from "@/api/file";
import { getApplicationByUserAndChallenge } from "@/api/challenge";

export default {
  name: 'SubmissionCreate',
  components: { ChallengeNavBar },
  data() {
    return {
      challengeId: '',
      form: {
        applicationId: null,
        title: '',
        content: '',
        location: '',
        fileUrl: '',
        userId: ''
      },
      loading: false,
      provinceId: '',
      cityId: '',
      districtId: '',
      provinceList: [],
      cityList: [],
      districtList: [],
      currentUserAvatar: localStorage.getItem('user_avatar') || 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: localStorage.getItem('user_name') || '用户'
    }
  },
  computed: {
    isImage() {
      return this.form.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(this.form.fileUrl)
    },
    isVideo() {
      return this.form.fileUrl && /\.(mp4|mov|avi|flv)$/i.test(this.form.fileUrl)
    }
  },
  async mounted() {
    // ✅ FIX 1：路由是 params，不是 query！！！
    this.challengeId = this.$route.params.challengeId;

    if (!this.challengeId) {
      this.$message.error("比赛ID不存在");
      return;
    }

    await this.loadUserInfo();
    await this.loadApplicationId();
    this.loadProvinceData();
  },
  methods: {
    async loadUserInfo() {
      try {
        const res = await getCurrentUserInfo()
        if (res.data.code === 200 || res.data.success) {
          const user = res.data.data
          if (user) {
            this.form.userId = user.id || user.userId || ''
            this.currentUserName = user.username || '用户'
            this.currentUserAvatar = user.avatar || 'http://localhost:9000/lumecho/avatar.png'
          }
        }
      } catch (e) {
        console.error('获取用户信息失败', e)
      }
    },

    async loadApplicationId() {
      if (!this.form.userId || !this.challengeId) {
        this.$message.warning("缺少比赛信息或用户未登录");
        return;
      }
      try {
        const res = await getApplicationByUserAndChallenge({
          userId: this.form.userId,
          challengeId: this.challengeId
        });
        if (res.data.code === 200 && res.data.data) {
          this.form.applicationId = res.data.data.id;
          console.log("✅ 成功获取报名ID：", this.form.applicationId);
        } else {
          this.$message.warning("您尚未报名该比赛");
        }
      } catch (e) {
        this.$message.error("获取报名信息失败");
      }
    },

    async loadProvinceData() {
      try {
        this.provinceList = await getAllProvince()
      } catch (e) {
        console.error("加载省份失败", e)
      }
    },

    async handleProvinceChange() {
      this.cityId = ''
      this.districtId = ''
      this.cityList = []
      this.districtList = []
      try {
        const list = await getCityByProvinceId(this.provinceId)
        setTimeout(() => {
          this.cityList = list
        }, 80)
      } catch (e) {
        console.error("加载城市失败", e)
      }
    },

    async handleCityChange() {
      this.districtId = ''
      this.districtList = []
      try {
        const list = await getDistrictByCityId(this.cityId)
        setTimeout(() => {
          this.districtList = list
        }, 80)
      } catch (e) {
        console.error("加载区县失败", e)
      }
    },

    triggerUpload() {
      this.$refs.fileInput.click()
    },

    async handleFileUpload(e) {
      const f = e.target.files[0]
      if (!f) return

      if (f.size > 20 * 1024 * 1024) {
        this.$message.error('文件不能超过 20MB')
        return
      }

      try {
        // ✅ 这里改成比赛作品专用类型
        const res = await uploadFile(f, "CHALLENGE_SUBMISSION_IMAGE")

        if (res.data.code === 200) {
          this.form.fileUrl = res.data.data
          this.$message.success('上传成功')
        } else {
          this.$message.error(res.data.msg || '上传失败')
        }
      } catch (err) {
        console.error(err)
        this.$message.error('上传失败')
      }
    },

    removeFile() {
      this.form.fileUrl = ''
    },

    async submit() {
      // ✅ FIX 2：如果还没拿到，就再获取一次
      if (!this.form.applicationId) {
        await this.loadApplicationId();
        if (!this.form.applicationId) {
          this.$message.warning('缺少报名ID');
          return;
        }
      }

      if (!this.form.userId) {
        return this.$message.warning('请先登录')
      }

      if (!this.form.title || !this.form.content || !this.districtId || !this.form.fileUrl) {
        return this.$message.warning('请完善所有必填项')
      }

      const p = this.provinceList.find(i => i.id == this.provinceId)?.name || ''
      const c = this.cityList.find(i => i.id == this.cityId)?.name || ''
      const d = this.districtList.find(i => i.id == this.districtId)?.name || ''
      this.form.location = `${p} ${c} ${d}`

      this.loading = true
      try {
        await submitWork(this.form)
        this.$message.success('提交成功！')
        this.$router.back()
      } catch (err) {
        this.$message.error('提交失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.submission-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F3E5F5 0%, #FFFFFF 100%);
  font-family: 'Nunito', sans-serif;
  color: #4A148C;
  padding: 0;
}
.form-wrapper {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}
.page-header {
  text-align: center;
  margin-bottom: 30px;
}
.page-header h2 {
  font-size: 2.2rem;
  margin: 0 0 8px 0;
  color: #6A1B9A;
  font-weight: 900;
}
.page-header p {
  color: #8E24AA;
  margin: 0;
}
.form-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #F3E5F5;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  font-size: 14px;
  font-weight: 700;
  color: #6A1B9A;
}
.form-label span {
  color: #e91e63;
}
.form-input {
  padding: 14px 18px;
  border: 2px solid #E1BEE7;
  border-radius: 16px;
  font-size: 15px;
  color: #4A148C;
  background: #fafafa;
  transition: all 0.3s ease;
  outline: none;
}
.form-input:focus {
  border-color: #AB47BC;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(171,71,188,0.15);
}
.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.address-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
}
.select-item {
  flex: 1;
  display: flex;
  align-items: center;
  height: 52px;
  opacity: 0.4;
  transition: opacity 0.28s ease;
}
.select-item.show {
  opacity: 1;
}
.select-item select {
  width: 100%;
  height: 52px;
  line-height: 52px;
  padding: 0 18px;
  border: 2px solid #E1BEE7;
  border-radius: 16px;
  font-size: 15px;
  color: #4A148C;
  background: #fafafa;
  outline: none;
  cursor: pointer;
  appearance: none;
  box-sizing: border-box;
  display: block;
  transition: all 0.25s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23AB47BC' viewBox='0 0 16 16'%3E%3Cpath d='M8 11l4-4H4l4 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}
.select-item select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.select-item select:hover:not(:disabled) {
  border-color: #AB47BC;
  background-color: #fefaff;
}
.select-item select:focus {
  border-color: #AB47BC;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(171,71,188,0.15);
}

.upload-box {
  border: 2px dashed #CE93D8;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.upload-box:hover {
  border-color: #AB47BC;
  background: rgba(243,229,245,0.3);
}
.upload-icon {
  font-size: 30px;
  margin-bottom: 10px;
}
.preview-box {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.preview-box img,
.preview-box video {
  width: 100%;
  border-radius: 16px;
}
.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.submit-btn {
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #AB47BC, #8E24AA);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 6px 20px rgba(142,36,170,0.2);
  cursor: pointer;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(142,36,170,0.3);
}
.submit-btn:disabled {
  opacity: 0.65;
  background: #B39DDB;
  cursor: not-allowed;
}
</style>