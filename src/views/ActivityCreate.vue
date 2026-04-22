<template>
  <div class="activity-create-page">
    <!-- 新导航栏 -->
    <ActivityCreateNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @profile="goProfile"
    />

    <main class="create-container">
      <!-- 🔒 权限不足提示 -->
      <div v-if="!isPhotographer" class="forbidden-card">
        <div class="forbidden-icon">🔒</div>
        <h3>权限不足</h3>
        <p>仅认证摄影师或管理员可发起摄影活动</p>
        <button class="back-btn" @click="goBack">返回活动列表</button>
      </div>

      <!-- ✅ 有权限才显示表单 -->
      <div v-else class="create-card">
        <div class="card-header">
          <h2>✨ 发起摄影活动</h2>
          <p>分享你的摄影创作，吸引同好一起参与</p>
        </div>

        <div class="form-box">

          <!-- 封面上传 -->
          <div class="form-item">
            <label>🖼️ 活动封面</label>
            <div class="upload-box" @click="$refs.fileInput.click()" :class="{ 'has-preview': coverPreview }">
              <img v-if="coverPreview" :src="coverPreview" class="cover-img" alt="预览"/>
              <div v-else class="upload-placeholder">
                <span class="icon">📷</span>
                <span class="text">点击上传封面（建议16:9，≤5MB）</span>
              </div>
              <input ref="fileInput" type="file" accept="image/*" hidden @change="handleCoverUpload"/>
            </div>
            <div v-if="uploadingCover" class="upload-status">⏳ 图片上传中...</div>
            <div v-if="coverError" class="upload-error">❌ {{ coverError }}</div>
          </div>

          <div class="form-item">
            <label>活动标题</label>
            <input
                v-model="form.title"
                placeholder="请输入活动标题"
                class="form-input"
            />
          </div>

          <div class="form-item">
            <label>活动描述</label>
            <textarea
                v-model="form.description"
                rows="4"
                placeholder="详细介绍活动内容、亮点、注意事项"
                class="form-textarea"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-item flex-1">
              <label>开始时间</label>
              <input v-model="form.startTime" type="datetime-local" class="form-input date-input"/>
            </div>
            <div class="form-item flex-1">
              <label>结束时间</label>
              <input v-model="form.endTime" type="datetime-local" class="form-input date-input"/>
            </div>
          </div>

          <div class="form-item">
            <label>活动地点</label>
            <div class="address-select-row">
              <select v-model="provinceId" @change="fetchCities" class="form-select">
                <option value="">选择省份</option>
                <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>

              <select v-model="cityId" @change="fetchDistricts" class="form-select">
                <option value="">选择城市</option>
                <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>

              <select v-model="districtId" class="form-select">
                <option value="">选择区县</option>
                <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>

            <input
                v-model="detailAddress"
                placeholder="详细地址（街道/门牌号）"
                class="form-input mt-8"
            />
          </div>

          <div class="form-item">
            <label>最大参与人数</label>
            <input
                v-model.number="form.maxParticipants"
                type="number"
                min="1"
                class="form-input"
            />
          </div>

          <div class="form-item">
            <label>报名是否需要审核</label>
            <div class="radio-group">
              <label class="radio-item">
                <input v-model="form.requireAudit" type="radio" :value="true"/>
                <span>需要审核</span>
              </label>
              <label class="radio-item">
                <input v-model="form.requireAudit" type="radio" :value="false"/>
                <span>免审核直接参与</span>
              </label>
            </div>
          </div>

          <div class="action-box">
            <button class="submit-btn" :disabled="loading" @click="submit">
              {{ loading ? '提交中...' : '✅ 确认发起活动' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
/* eslint-disable */
import ActivityCreateNavBar from "@/components/NavBar/ActivityCreateNavBar.vue";
import {
  getAllProvince,
  getCitiesByProvince,
  getDistrictsByCity,
  createActivity
} from "@/api/activity.js";
import { uploadFile } from "@/api/file";
import { ElMessage } from 'element-plus';
import { getCurrentUserInfo } from "@/api/auth";

export default {
  name: "ActivityCreate",
  components: { ActivityCreateNavBar },
  data() {
    return {
      currentUserAvatar: 'http://47.116.108.205:9000/lumecho/avatar.png',
      currentUserName: '摄影师',

      uploadingCover: false,
      coverError: '',
      coverPreview: '',

      form: {
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        maxParticipants: 20,
        requireAudit: true,
        coverUrl: "",
      },

      provinceId: "",
      cityId: "",
      districtId: "",
      detailAddress: "",

      provinces: [],
      cities: [],
      districts: [],
      loading: false,
    };
  },

  computed: {
    isPhotographer() {
      const role = (localStorage.getItem('user_role') || '').trim().toUpperCase();
      return role === 'ADMIN' || role === 'PHOTOGRAPHER';
    },
  },

  mounted() {
    if (!this.isPhotographer) {
      ElMessage.warning('🔒 仅摄影师/管理员可创建活动');
      return;
    }
    this.fetchProvinces();
    this.fetchUserInfo();
  },

  methods: {
    // 获取用户信息（头像昵称）
    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) {
          this.currentUserAvatar = data.avatar || this.currentUserAvatar;
          this.currentUserName = data.username || this.currentUserName;
        }
      } catch (e) {
        console.warn("获取用户信息失败");
      }
    },

    goBack() {
      this.$router.push('/activity');
    },
    goProfile() {
      this.$router.push("/profile");
    },

    // 封面上传
    async handleCoverUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.coverError = '仅支持图片格式';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.coverError = '图片大小不能超过5MB';
        return;
      }

      this.uploadingCover = true;
      this.coverError = '';
      try {
        const res = await uploadFile(file, 'ACTIVITY_COVER');
        const url = res.data?.data || res.data;
        if (res.data?.code === 200 || res.code === 200) {
          this.form.coverUrl = url;
          this.coverPreview = URL.createObjectURL(file);
          ElMessage.success('🖼️ 封面上传成功');
        } else {
          throw new Error(res.data?.message || '上传失败');
        }
      } catch (err) {
        this.coverError = err.message || '上传失败';
      } finally {
        this.uploadingCover = false;
        e.target.value = '';
      }
    },

    async fetchProvinces() {
      try {
        const { data } = await getAllProvince();
        this.provinces = data;
      } catch (e) {
        console.log("获取省份失败", e);
      }
    },

    async fetchCities() {
      this.cityId = "";
      this.districtId = "";
      this.cities = [];
      this.districts = [];
      if (!this.provinceId) return;

      try {
        const { data } = await getCitiesByProvince(this.provinceId);
        this.cities = data;
      } catch (e) {
        console.log("获取城市失败", e);
      }
    },

    async fetchDistricts() {
      this.districtId = "";
      this.districts = [];
      if (!this.cityId) return;

      try {
        const { data } = await getDistrictsByCity(this.cityId);
        this.districts = data;
      } catch (e) {
        console.log("获取区县失败", e);
      }
    },

    async submit() {
      if (!this.isPhotographer) {
        ElMessage.warning('🔒 权限不足');
        return;
      }

      if (!this.form.coverUrl) {
        ElMessage.warning('请上传活动封面');
        return;
      }

      const p = this.provinces.find(item => item.id == this.provinceId)?.name || ''
      const c = this.cities.find(item => item.id == this.cityId)?.name || ''
      const d = this.districts.find(item => item.id == this.districtId)?.name || ''
      const fullLocation = [p, c, d, this.detailAddress].filter(Boolean).join(' ')

      this.form.location = fullLocation;

      if (!this.form.title) {
        ElMessage.warning('请输入活动标题');
        return;
      }
      if (!this.form.location) {
        ElMessage.warning('请完善活动地点');
        return;
      }
      if (!this.form.startTime || !this.form.endTime) {
        ElMessage.warning('请选择开始/结束时间');
        return;
      }

      this.loading = true;
      try {
        await createActivity(this.form);
        ElMessage.success('活动发起成功！');
        setTimeout(() => {
          this.$router.push("/activity");
        }, 800);
      } catch (err) {
        ElMessage.error('创建失败：' + (err.response?.data?.message || '请重试'));
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.activity-create-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff8e1 0%, #fff 100%);
  font-family: 'Nunito', sans-serif;
}

.create-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.forbidden-card {
  background: #fff;
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
}
.forbidden-icon {
  font-size: 50px;
  margin-bottom: 20px;
}
.forbidden-card h3 {
  font-size: 22px;
  color: #6a1b9a;
  margin: 0 0 10px;
}
.forbidden-card p {
  color: #888;
  margin-bottom: 24px;
}
.back-btn {
  padding: 12px 30px;
  border-radius: 12px;
  background: #6a1b9a;
  color: #fff;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.create-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-header h2 {
  font-size: 28px;
  font-weight: 900;
  color: #6a1b9a;
  margin: 0 0 8px;
}

.card-header p {
  color: #9c73ab;
  margin: 0;
  font-size: 15px;
}

.form-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 700;
  color: #4a148c;
  font-size: 15px;
}

/* 上传封面 */
.upload-box {
  width: 100%; height: 180px; border: 2px dashed #E1BEE7; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: #FAFAFA; transition: all 0.3s; overflow: hidden;
}
.upload-box:hover { border-color: #AB47BC; background: #FCE4EC; }
.upload-box.has-preview { border-style: solid; border-color: #AB47BC; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; color: #8E24AA; }
.upload-placeholder .icon { font-size: 32px; margin-bottom: 8px; }
.upload-status { font-size: 13px; color: #AB47BC; margin-top: 6px; }
.upload-error { font-size: 13px; color: #E53935; margin-top: 6px; }

.form-input,
.form-textarea,
.form-select {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e1bee7;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #ffb300;
  box-shadow: 0 0 0 3px rgba(255, 179, 0, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 {
  flex: 1;
}

.address-select-row {
  display: flex;
  gap: 10px;
}

.address-select-row select {
  flex: 1;
}

.mt-8 {
  margin-top: 8px;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.action-box {
  margin-top: 10px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffb300, #ff8f00);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 15px rgba(255, 179, 0, 0.2);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

input[type="datetime-local"] {
  color: #6a1b9a;
  font-weight: 600;
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  width: 20px;
  height: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23AB47BC'%3E%3Cpath d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 18px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236a1b9a'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
  padding-right: 40px;
}
</style>