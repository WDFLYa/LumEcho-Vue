<template>
  <div class="profile-edit-container">
    <!-- 专用导航栏 -->
    <EditNavBar
        :user-name="currentUserName"
        :user-avatar="currentUserAvatar"
        :is-photographer="formData.role === 'PHOTOGRAPHER'"
        @profile="goProfile"
        @application-success="handleAppSuccess"
    />

    <main class="edit-wrapper">
      <div class="edit-card glass-panel">

        <!-- 1. 头部：身份卡片 -->
        <div class="identity-header">
          <div class="avatar-section">
            <!-- 头像上传框 -->
            <div class="avatar-upload-box" @click="triggerAvatarUpload">
              <img :src="formData.avatar || defaultAvatar" class="current-avatar" alt="Avatar" />

              <!-- 🔥 上传中遮罩层 -->
              <div v-if="uploadingAvatar" class="uploading-overlay">
                <span class="spinner-icon"></span>
                <span class="uploading-text">上传中...</span>
              </div>

              <!-- 悬停遮罩层 (仅在非上传状态显示) -->
              <div v-show="!uploadingAvatar" class="upload-overlay">
                <span class="icon">📸</span>
                <span class="text">换张好看的</span>
              </div>

              <input
                  type="file"
                  ref="avatarInput"
                  accept="image/*"
                  style="display: none"
                  @change="handleAvatarChange"
              />

              <!-- 悬浮小星星 (仅在非上传状态显示) -->
              <span v-show="!uploadingAvatar" class="floating-star">✨</span>
            </div>

            <!-- 角色与状态徽章 -->
            <div class="badges-row">
              <span class="badge role-badge" :class="getRoleClass(formData.role)">
                <span class="badge-icon">{{ getRoleIcon(formData.role) }}</span>
                {{ getRoleName(formData.role) }}
              </span>
              <span class="badge status-badge" :class="getStatusClass(formData.status)">
                <span class="badge-icon">{{ getStatusIcon(formData.status) }}</span>
                {{ getStatusName(formData.status) }}
              </span>
            </div>
          </div>

          <div class="header-text">
            <h2 class="page-title">
              编辑个人资料
              <span class="title-emoji">🌿</span>
            </h2>
            <p class="page-subtitle">打理你的小窝，让灵感在这里发芽 🌱</p>
          </div>
        </div>

        <hr class="divider" />

        <!-- 2. 敏感信息区 -->
        <div class="section-block locked-section">
          <div class="section-header">
            <h3 class="section-title">
              <span class="icon-box">🛡️</span> 安全账号信息
            </h3>
            <span class="section-tag" :class="isInfoComplete ? 'lock-tag' : 'warning-tag'">
              {{ isInfoComplete ? '🔒 不可修改' : '⚠️ 需补全' }}
            </span>
          </div>
          <p class="section-desc">
            {{ isInfoComplete ? '为了保护你的账号安全，这些重要信息暂时不能更改哦。' : '部分信息缺失，点击下方区域即可快速补全。' }}
          </p>

          <div class="info-grid">
            <!-- 账号项 -->
            <div class="info-item">
              <label class="info-label">🆔 登录账号</label>
              <div
                  class="info-value-box"
                  :class="{ 'clickable': !formData.account }"
                  @click="!formData.account && openCompleteModal('account')"
              >
                <span class="info-value" :class="{ 'placeholder': !formData.account }">
                  {{ formData.account || '点击此处设置账号' }}
                </span>
                <span v-if="formData.account" class="lock-icon">🔐</span>
                <span v-else class="action-icon">✨ 去设置</span>
              </div>
            </div>

            <!-- 手机项 -->
            <div class="info-item">
              <label class="info-label">📱 手机号码</label>
              <div
                  class="info-value-box"
                  :class="{ 'clickable': !formData.phone }"
                  @click="!formData.phone && openCompleteModal('phone')"
              >
                <span class="info-value" :class="{ 'placeholder': !formData.phone }">
                  {{ formData.phone || '点击此处绑定手机' }}
                </span>
                <span v-if="formData.phone" class="lock-icon">🔐</span>
                <span v-else class="action-icon">✨ 去绑定</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 自由编辑区 -->
        <div class="section-block editable-section">
          <div class="section-header">
            <h3 class="section-title">
              <span class="icon-box">🪄</span> 个人展示信息
            </h3>
            <span class="section-tag edit-tag">✨ 可编辑</span>
          </div>
          <p class="section-desc">这些信息将展示在你的主页，随心打扮一下吧！</p>

          <div class="form-grid">
            <!-- 用户名 -->
            <div class="form-item full-width">
              <label class="form-label">
                <span class="label-icon">🏷️</span> 昵称 / 用户名 <span class="required">*</span>
              </label>
              <div class="input-group">
                <input v-model="formData.username" type="text" placeholder="给大家一个好记的名字吧~" maxlength="20" class="input-field" />
                <span class="input-suffix">{{ formData.username?.length || 0 }}/20</span>
              </div>
              <div v-if="errors.username" class="error-msg">⚠️ {{ errors.username }}</div>
            </div>

            <!-- 邮箱 -->
            <div class="form-item full-width">
              <label class="form-label">
                <span class="label-icon">📧</span> 电子邮箱
              </label>
              <div class="input-group">
                <input v-model="formData.email" type="email" placeholder="yourname@example.com" class="input-field" />
              </div>
              <div v-if="errors.email" class="error-msg">⚠️ {{ errors.email }}</div>
            </div>

            <!-- 简介 -->
            <div class="form-item full-width">
              <label class="form-label">
                <span class="label-icon">📝</span> 个人简介
              </label>
              <div class="input-group">
                <textarea v-model="formData.bio" placeholder="介绍一下你自己，比如擅长什么风格..." rows="4" maxlength="200" class="input-field textarea"></textarea>
                <span class="input-suffix">{{ formData.bio?.length || 0 }}/200</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. 系统信息展示 -->
        <div class="section-block system-section">
          <h3 class="section-title">
            <span class="icon-box">⏳</span> 账号小档案
          </h3>
          <div class="data-tags">
            <div class="data-row">
              <span class="data-label">📅 注册时间</span>
              <span class="data-pill">{{ formatDate(formData.createTime) }}</span>
            </div>
            <div class="data-row">
              <span class="data-label">🔄 最后更新</span>
              <span class="data-pill">{{ formatDate(formData.updateTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 5. 底部操作栏 -->
        <div class="action-bar">
          <button class="btn-save" @click="handleSubmit" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>
              <span class="btn-icon-large">💾</span> 保存修改
            </span>
          </button>
        </div>

      </div>
    </main>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="toastVisible" class="custom-toast" :class="toastType">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- 补全信息模态框 -->
    <transition name="modal-fade">
      <div v-if="showCompleteModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;" @click.self="showCompleteModal = false">
        <div class="modal-card glass-panel" style="position: relative; z-index: 10000;">
          <div class="modal-header">
            <span class="modal-icon">🧩</span>
            <h3 class="modal-title">
              {{ missingType === 'account' ? '设置登录账号' : '绑定手机号码' }}
            </h3>
            <p class="modal-subtitle">
              {{ missingType === 'account' ? '为了账号安全，请设置一个专属账号和密码' : '绑定手机方便找回账号，还能接收验证码哦' }}
            </p>
          </div>

          <div class="modal-body">
            <!-- 场景 A: 补全账号 -->
            <div v-if="missingType === 'account'" class="complete-form">
              <div class="form-item">
                <label class="form-label">🆔 登录账号</label>
                <input
                    v-model="completeForm.account"
                    type="text"
                    placeholder="字母、数字、下划线 (3-20位)"
                    class="input-field"
                    maxlength="20"
                />
                <div v-if="completeErrors.account" class="error-msg">⚠️ {{ completeErrors.account }}</div>
              </div>
              <div class="form-item">
                <label class="form-label">🔒 设置密码</label>
                <input
                    v-model="completeForm.password"
                    type="password"
                    placeholder="6-20位字符"
                    class="input-field"
                    maxlength="20"
                />
                <div v-if="completeErrors.password" class="error-msg">⚠️ {{ completeErrors.password }}</div>
              </div>
            </div>

            <!-- 场景 B: 补全手机 -->
            <div v-else-if="missingType === 'phone'" class="complete-form">
              <div class="form-item">
                <label class="form-label">📱 手机号码</label>
                <input
                    v-model="completeForm.phone"
                    type="tel"
                    placeholder="请输入11位手机号"
                    class="input-field"
                    maxlength="11"
                    :disabled="sendingCode || countdown > 0"
                />
                <div v-if="completeErrors.phone" class="error-msg">⚠️ {{ completeErrors.phone }}</div>
              </div>
              <div class="form-item">
                <label class="form-label">📨 验证码</label>
                <div class="input-group-code">
                  <input
                      v-model="completeForm.code"
                      type="text"
                      placeholder="6位数字"
                      class="input-field input-code"
                      maxlength="6"
                  />
                  <button
                      class="btn-code"
                      @click="handleSendCode"
                      :disabled="sendingCode || countdown > 0 || !completeForm.phone"
                      :class="{ 'btn-code-disabled': countdown > 0 }"
                  >
                    {{ countdown > 0 ? `${countdown}s 后重发` : (sendingCode ? '发送中...' : '获取验证码') }}
                  </button>
                </div>
                <div v-if="completeErrors.code" class="error-msg">⚠️ {{ completeErrors.code }}</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-submit" @click="handleCompleteSubmit" :disabled="submitting">
              <span v-if="submitting" class="spinner-small"></span>
              <span v-else>
                <span class="btn-icon">✨</span> 立即补全
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import EditNavBar from '@/components/NavBar/EditNavBar.vue';

// 🔥 关键导入：引入上传接口
import { uploadAvatar } from "@/api/file";  // 改为 uploadAvatar
import {
  getCurrentUserInfo,
  getCurrentUserDetail,
  updateUserProfile,
  completeAccount,
  completePhone,
  sendCompleteCode
  // updateUserAvatar 不需要了，uploadAvatar 已包含更新逻辑
} from "@/api/auth";

export default {
  name: "ProfileEdit",
  components: { EditNavBar },

  data() {
    return {
      defaultAvatar: 'http://localhost:9000/specialty/avatar.png',
      currentUserAvatar: '',
      currentUserName: '',

      saving: false,
      uploadingAvatar: false,

      toastVisible: false,
      toastMessage: '',
      toastType: 'info',

      formData: {
        id: null,
        account: '',
        phone: '',
        username: '',
        email: '',
        bio: '',
        role: 'USER',
        status: 1,
        createTime: null,
        updateTime: null,
        avatar: ''
      },

      errors: {},

      showCompleteModal: false,
      missingType: '',
      submitting: false,
      sendingCode: false,
      countdown: 0,
      countdownTimer: null,

      completeForm: {
        account: '',
        password: '',
        phone: '',
        code: ''
      },

      completeErrors: {}
    };
  },

  computed: {
    toastIcon() {
      const map = { success: '🎉', error: '😭', info: '💡', warning: '⚠️' };
      return map[this.toastType] || '💡';
    },

    isInfoComplete() {
      return !!this.formData.account && !!this.formData.phone;
    }
  },

  mounted() {
    this.fetchNavUserInfo();
    this.loadUserProfile();
  },

  beforeUnmount() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  },

  methods: {
    async fetchNavUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (!data) return;

        this.currentUserAvatar = data.avatar || this.defaultAvatar;
        this.currentUserName = data.username || '未知用户';
        this.formData.id = data.id;
        this.formData.avatar = data.avatar || this.defaultAvatar;
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.currentUserAvatar = this.defaultAvatar;
        this.currentUserName = '用户';
      }
    },

    goProfile() {
      if (!this.formData.id) {
        this.showToast('用户 ID 缺失，无法跳转', 'warning');
        return;
      }
      this.$router.push(`/profile/${this.formData.id}`);
    },

    showToast(msg, type = 'info') {
      this.toastMessage = msg;
      this.toastType = type;
      this.toastVisible = true;
      setTimeout(() => this.toastVisible = false, 2500);
    },

    async loadUserProfile() {
      try {
        const res = await getCurrentUserDetail();
        const responseData = res.data.code === 200 ? res.data.data : res.data;
        if (!responseData) {
          this.showToast('未获取到用户数据', 'warning');
          return;
        }

        this.formData = {
          ...this.formData,
          account: responseData.account || '',
          phone: responseData.phone || '',
          username: responseData.username || '',
          email: responseData.email || '',
          bio: responseData.bio || '',
          role: responseData.role || 'USER',
          status: responseData.status !== undefined ? responseData.status : 1,
          createTime: responseData.createTime,
          updateTime: responseData.updateTime
        };
      } catch (error) {
        console.error('❌ 加载用户详情失败:', error);
        this.showToast('加载数据失败，请刷新重试', 'error');
      }
    },

    openCompleteModal(type) {
      this.missingType = type;
      this.showCompleteModal = true;
      this.completeForm = { account: '', password: '', phone: '', code: '' };
      this.completeErrors = {};
      if (this.countdownTimer) clearInterval(this.countdownTimer);
      this.countdown = 0;
    },

    async handleSendCode() {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.completeForm.phone)) {
        this.completeErrors.phone = '请输入正确的 11 位手机号';
        return;
      }
      this.completeErrors.phone = '';
      this.sendingCode = true;

      try {
        await sendCompleteCode({ phone: this.completeForm.phone });
        this.showToast('验证码已发送，请注意查收 📩', 'success');
        this.countdown = 60;
        this.countdownTimer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(this.countdownTimer);
            this.countdown = 0;
          }
        }, 1000);
      } catch (error) {
        const msg = error.response?.data?.msg || '发送失败，请稍后再试';
        this.showToast(msg, 'error');
        this.completeErrors.phone = msg;
      } finally {
        this.sendingCode = false;
      }
    },

    async handleCompleteSubmit() {
      this.submitting = true;
      this.completeErrors = {};

      try {
        if (this.missingType === 'account') {
          if (!this.completeForm.account || this.completeForm.account.length < 3) {
            this.completeErrors.account = '账号长度至少 3 位';
            this.submitting = false;
            return;
          }
          if (!this.completeForm.password || this.completeForm.password.length < 6) {
            this.completeErrors.password = '密码长度至少 6 位';
            this.submitting = false;
            return;
          }
          await completeAccount({
            account: this.completeForm.account,
            password: this.completeForm.password
          });
          this.showToast('账号设置成功！🎉', 'success');
          this.formData.account = this.completeForm.account;
        } else if (this.missingType === 'phone') {
          const phoneRegex = /^1[3-9]\d{9}$/;
          if (!phoneRegex.test(this.completeForm.phone)) {
            this.completeErrors.phone = '手机号格式不正确';
            this.submitting = false;
            return;
          }
          if (!/^\d{6}$/.test(this.completeForm.code)) {
            this.completeErrors.code = '请输入 6 位验证码';
            this.submitting = false;
            return;
          }
          await completePhone({
            phone: this.completeForm.phone,
            code: this.completeForm.code
          });
          this.showToast('手机绑定成功！🎉', 'success');
          this.formData.phone = this.completeForm.phone;
        }
        this.showCompleteModal = false;
      } catch (error) {
        const msg = error.response?.data?.msg || '操作失败，请重试';
        this.showToast(msg, 'error');
        if (this.missingType === 'account') {
          this.completeErrors.account = msg;
        } else {
          this.completeErrors.phone = msg;
        }
      } finally {
        this.submitting = false;
      }
    },

    triggerAvatarUpload() {
      if (this.uploadingAvatar) return;
      this.$refs.avatarInput.click();
    },

    /**
     * 🔥 核心修改：头像上传与更新逻辑（简化版）
     * 后端 /api/avatar/upload 已包含：上传 MinIO + 更新数据库
     */
    async handleAvatarChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      // 1. 校验
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('头像太大啦，不能超过 5MB 哦', 'warning');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.showToast('只支持 JPG, PNG, GIF, WebP 格式', 'warning');
        return;
      }

      // 2. 设置状态
      this.uploadingAvatar = true;
      this.showToast('正在上传美照，请稍候... ✨', 'info');

      try {
        // 🔥 直接调用 uploadAvatar，后端自动完成上传 + 关联用户
        const res = await uploadAvatar(file, 'avatar');

        // 3. 解析返回的 URL（兼容多种返回结构）
        let newAvatarUrl = '';
        if (typeof res.data === 'string') {
          newAvatarUrl = res.data;
        } else if (res.data?.data) {
          // { code: 200, data: "url" } 或 { code: 200, data: { data: "url" } }
          newAvatarUrl = typeof res.data.data === 'string' ? res.data.data : res.data.data;
        } else if (res.data?.url) {
          newAvatarUrl = res.data.url;
        } else if (res.data?.fileUrl) {
          newAvatarUrl = res.data.fileUrl;
        }

        if (!newAvatarUrl) {
          throw new Error('上传成功但未获取到文件地址');
        }

        // 4. 更新本地 UI
        this.formData.avatar = newAvatarUrl;
        this.currentUserAvatar = newAvatarUrl;

        this.showToast('头像换好啦！真好看 🎉', 'success');

        // 🔥 可选：上传成功后刷新用户信息（确保导航栏等组件同步）
        this.fetchNavUserInfo();

      } catch (error) {
        console.error('头像更新失败:', error);
        const msg = error.response?.data?.msg || error.message || '上传失败，请重试';
        this.showToast(msg, 'error');
      } finally {
        this.uploadingAvatar = false;
        e.target.value = ''; // 清空 input，允许重复选择同一张图
      }
    },

    validateForm() {
      this.errors = {};
      if (!this.formData.username?.trim()) {
        this.errors.username = '昵称不能为空哦';
        return false;
      }
      if (this.formData.email && !/^\S+@\S+\.\S+$/.test(this.formData.email)) {
        this.errors.email = '邮箱格式好像不对呢';
        return false;
      }
      return true;
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        let errorMsg = '请检查填写的信息哦';
        if (this.errors.username) errorMsg = this.errors.username;
        else if (this.errors.email) errorMsg = this.errors.email;
        this.showToast(errorMsg, 'warning');
        return;
      }

      this.saving = true;
      try {
        const payload = {
          username: this.formData.username.trim(),
          bio: this.formData.bio?.trim() || '',
          email: this.formData.email?.trim() || ''
        };
        const res = await updateUserProfile(payload);
        if (res.data.code === 200 || res.code === 200) {
          this.showToast('保存成功！太棒啦 🚀', 'success');
          this.currentUserName = payload.username;
        } else {
          const errorMsg = res.data.msg || res.msg || '保存失败';
          this.showToast(errorMsg, 'error');
        }
      } catch (error) {
        console.error('❌ 保存失败:', error);
        let errMsg = '网络开小差了，再试一次吧';
        if (error.response) {
          errMsg = error.response.data.msg || `错误 ${error.response.status}`;
        } else if (error.message) {
          errMsg = error.message;
        }
        this.showToast(errMsg, 'error');
      } finally {
        this.saving = false;
      }
    },

    getRoleName(role) {
      const map = { 'ADMIN': '管理员', 'USER': '探索者', 'PHOTOGRAPHER': '摄影师', 'CREATOR': '创作者' };
      return map[role] || '探索者';
    },
    getRoleIcon(role) {
      const map = { 'ADMIN': '👑', 'USER': '🎒', 'PHOTOGRAPHER': '📷', 'CREATOR': '🎨' };
      return map[role] || '🎒';
    },
    getRoleClass(role) {
      if (role === 'ADMIN') return 'role-admin';
      if (role === 'PHOTOGRAPHER' || role === 'CREATOR') return 'role-photographer';
      return 'role-user';
    },
    getStatusName(status) {
      return status === 1 ? '状态良好' : '已暂停';
    },
    getStatusIcon(status) {
      return status === 1 ? '🟢' : '🔴';
    },
    getStatusClass(status) {
      return status === 1 ? 'status-normal' : 'status-disabled';
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
      });
    }
  }
};
</script>


<style scoped>
/* ====================
   🎨 全局样式
   ==================== */
.profile-edit-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0FFF9 0%, #F7FEFC 100%);
  font-family: 'Inter', system-ui, sans-serif;
  color: #444;
  padding-bottom: 60px;
  position: relative;
  overflow-x: hidden;
}

.profile-edit-container::before {
  content: '🌿';
  position: absolute;
  top: 10%;
  left: 5%;
  font-size: 100px;
  opacity: 0.03;
  transform: rotate(-15deg);
  pointer-events: none;
  z-index: 0;
}
.profile-edit-container::after {
  content: '✨';
  position: absolute;
  bottom: 15%;
  right: 5%;
  font-size: 120px;
  opacity: 0.04;
  transform: rotate(15deg);
  pointer-events: none;
  z-index: 0;
}

.edit-wrapper {
  max-width: 700px;
  margin: 40px auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 40px;
  border: 1px solid rgba(129, 212, 250, 0.3);
  box-shadow: 0 20px 60px rgba(129, 212, 250, 0.15);
  transition: transform 0.3s ease;
}

/* ====================
   👤 头部与头像
   ==================== */
.identity-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 10px;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.avatar-upload-box {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid #fff;
  box-shadow: 0 8px 20px rgba(129, 212, 250, 0.2);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: #fff;
}
.avatar-upload-box:hover {
  transform: scale(1.08) rotate(3deg);
  box-shadow: 0 12px 25px rgba(129, 212, 250, 0.3);
  border-color: #81D4FA;
}
.current-avatar { width: 100%; height: 100%; object-fit: cover; }

.floating-star {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 24px;
  animation: twinkle 2s infinite;
  pointer-events: none;
  z-index: 2;
}

/* 原有悬停层 */
.upload-overlay {
  position: absolute; inset: 0;
  background: rgba(129, 212, 250, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}
.avatar-upload-box:hover .upload-overlay { opacity: 1; }
.upload-overlay .icon { font-size: 24px; margin-bottom: 4px; transform: scale(1); transition: transform 0.3s; }
.avatar-upload-box:hover .upload-overlay .icon { transform: scale(1.2); }
.upload-overlay .text { font-size: 12px; font-weight: 700; }

/* 🔥 新增：上传中遮罩层 */
.uploading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  z-index: 10;
  backdrop-filter: blur(2px);
}
.uploading-text {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
}
.spinner-icon {
  width: 24px;
  height: 24px;
  border: 3px solid #E8F5E9;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.badges-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.badge {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.badge-icon { font-size: 14px; }

.role-admin { background: #FFEBEE; color: #D32F2F; border: 1px solid #FFCDD2; }
.role-photographer { background: #E3F2FD; color: #1976D2; border: 1px solid #BBDEFB; }
.role-user { background: #F1F8E9; color: #558B2F; border: 1px solid #C5E1A5; }

.status-normal { background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
.status-disabled { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }

.header-text { text-align: left; }
.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #2E7D32;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-emoji { font-size: 28px; animation: float 3s ease-in-out infinite; }
.page-subtitle {
  font-size: 14px;
  color: #81C784;
  margin: 8px 0 0 0;
  font-weight: 500;
}

.divider {
  border: 0;
  border-top: 2px dashed #C8E6C9;
  margin: 30px 0;
}

/* ====================
   📝 表单与区块
   ==================== */
.section-block { margin-bottom: 35px; }
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #4CAF50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-box { font-size: 20px; background: #E8F5E9; padding: 4px 8px; border-radius: 10px; }

.section-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}
.lock-tag { background: #FFEBEE; color: #E57373; border: 1px solid #FFCDD2; }
.warning-tag { background: #FFF8E1; color: #FF8F00; border: 1px solid #FFE082; }
.edit-tag { background: #E3F2FD; color: #64B5F6; border: 1px solid #BBDEFB; }

.section-desc {
  font-size: 13px;
  color: #90A4AE;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.locked-section {
  background: rgba(241, 248, 233, 0.4);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #C8E6C9;
}
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.info-item { display: flex; flex-direction: column; gap: 8px; }
.info-label { font-size: 13px; font-weight: 700; color: #558B2F; }

.info-value-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #E0E0E0;
  color: #90A4AE;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.info-value-box.clickable {
  cursor: pointer;
  border-color: #81C784;
  background: rgba(232, 245, 233, 0.3);
  transition: all 0.3s ease;
}
.info-value-box.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(129, 199, 132, 0.2);
  background: rgba(232, 245, 233, 0.6);
}

.info-value.placeholder {
  color: #90A4AE;
  font-style: italic;
}

.action-icon {
  font-size: 13px;
  font-weight: 700;
  color: #4CAF50;
  background: #E8F5E9;
  padding: 4px 10px;
  border-radius: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.lock-icon { font-size: 16px; opacity: 0.6; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.form-item { display: flex; flex-direction: column; gap: 8px; }
.form-item.full-width { grid-column: 1 / -1; }

.form-label {
  font-size: 14px;
  font-weight: 700;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}
.label-icon { font-size: 16px; }
.required { color: #FF8A80; margin-left: 4px; }

.input-group { position: relative; }
.input-field {
  width: 100%;
  padding: 16px 18px;
  border: 2px solid #E0E0E0;
  border-radius: 16px;
  font-size: 15px;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  color: #333;
}
.input-field:focus {
  border-color: #81C784;
  box-shadow: 0 0 0 4px rgba(129, 199, 132, 0.15);
  transform: translateY(-2px);
}
.textarea { resize: vertical; min-height: 120px; line-height: 1.6; }

.input-suffix {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #B0BEC5;
  font-weight: 600;
  pointer-events: none;
  background: #fff;
  padding: 2px 6px;
  border-radius: 8px;
}
.textarea + .input-suffix { top: auto; bottom: 16px; transform: none; }

.error-msg {
  color: #EF5350;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.system-section {
  background: rgba(255, 255, 255, 0.6);
  padding: 24px;
  border-radius: 20px;
  border: 1px dashed #A5D6A7;
}
.data-tags { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.data-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.data-label { color: #78909C; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.data-pill {
  background: #E8F5E9;
  color: #2E7D32;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  font-family: monospace;
  border: 1px solid #C8E6C9;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px dashed #E0E0E0;
}

.btn-save {
  padding: 14px 36px;
  background: linear-gradient(135deg, #81C784 0%, #4DB6AC 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 20px rgba(77, 182, 172, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}
.btn-save:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 25px rgba(77, 182, 172, 0.4);
}
.btn-save:active:not(:disabled) { transform: translateY(-1px); }
.btn-save:disabled {
  background: #CFD8DC;
  cursor: not-allowed;
  box-shadow: none;
}
.btn-icon-large { font-size: 18px; filter: brightness(1.2); }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

/* ====================
   🔔 Toast
   ==================== */
.custom-toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(255, 255, 255, 0.95);
  color: #2E7D32;
  padding: 14px 28px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(46, 125, 50, 0.2);
  z-index: 10001;
  border: 2px solid #C8E6C9;
  backdrop-filter: blur(10px);
}
.custom-toast.success { background: #E8F5E9; color: #2E7D32; border-color: #A5D6A7; }
.custom-toast.error { background: #FFEBEE; color: #C62828; border-color: #FFCDD2; }
.custom-toast.warning { background: #FFF8E1; color: #FF8F00; border-color: #FFE082; }
.toast-icon { font-size: 20px; animation: bounce 1s infinite; }

/* ====================
   🔥 模态框
   ==================== */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999 !important;
}

.modal-card {
  width: 90%;
  max-width: 450px;
  padding: 30px;
  position: relative;
  z-index: 10000 !important;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
  from { transform: translateY(50px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-header { text-align: center; margin-bottom: 25px; }
.modal-icon { font-size: 40px; display: block; margin-bottom: 10px; animation: float 3s infinite; }
.modal-title { font-size: 20px; color: #2E7D32; margin: 0 0 8px 0; font-weight: 800; }
.modal-subtitle { font-size: 13px; color: #90A4AE; margin: 0; }
.modal-body { margin-bottom: 25px; }

.input-group-code { display: flex; gap: 10px; align-items: center; }
.input-code { flex: 1; }

.btn-code {
  padding: 0 16px;
  height: 54px;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  color: #2E7D32;
  border: 1px solid #A5D6A7;
  border-radius: 16px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(46, 125, 50, 0.1);
}
.btn-code:hover:not(:disabled) {
  background: linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(46, 125, 50, 0.2);
}
.btn-code:active:not(:disabled) { transform: translateY(0); }
.btn-code:disabled {
  background: #F5F5F5;
  color: #BDBDBD;
  border-color: #E0E0E0;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.modal-footer { text-align: center; }
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #81C784 0%, #4DB6AC 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(77, 182, 172, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(77, 182, 172, 0.4); }
.btn-submit:disabled { background: #CFD8DC; cursor: not-allowed; box-shadow: none; }
.spinner-small {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-card, .modal-fade-leave-to .modal-card { transform: translateY(50px) scale(0.95); }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes twinkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.3) rotate(180deg); opacity: 0.8; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translate(-50%, 40px); }

/* ====================
   📱 响应式
   ==================== */
@media (max-width: 600px) {
  .form-grid, .info-grid, .data-tags { grid-template-columns: 1fr; }
  .identity-header { flex-direction: column; text-align: center; gap: 20px; }
  .header-text { text-align: center; order: -1; }
  .page-title { justify-content: center; }
  .section-header { justify-content: center; }
  .action-bar { flex-direction: column-reverse; }
  .glass-panel { padding: 24px 20px; }
  .input-group-code { flex-direction: column; gap: 8px; }
  .btn-code { width: 100%; height: 48px; padding: 0; }
}
</style>