<template>
  <div class="profile-edit-container">
    <!-- 专用导航栏 (已适配绿色系) -->
    <EditNavBar
        :user-name="currentUserName"
        :user-avatar="currentUserAvatar"
        @profile="goProfile"
    />

    <main class="edit-wrapper">
      <div class="edit-card glass-panel">

        <!-- 1. 头部：身份卡片 (增加可爱装饰) -->
        <div class="identity-header">
          <div class="avatar-section">
            <div class="avatar-upload-box" @click="triggerAvatarUpload">
              <img :src="formData.avatar || defaultAvatar" class="current-avatar" alt="Avatar" />
              <div class="upload-overlay">
                <span class="icon">📸</span>
                <span class="text">换张好看的</span>
              </div>
              <input type="file" ref="avatarInput" accept="image/*" style="display: none" @change="handleAvatarChange" />
              <!-- 悬浮小星星 -->
              <span class="floating-star">✨</span>
            </div>

            <!-- 角色与状态徽章 (更圆润可爱) -->
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

        <!-- 2. 敏感信息区 (盾牌风格) -->
        <div class="section-block locked-section">
          <div class="section-header">
            <h3 class="section-title">
              <span class="icon-box">🛡️</span> 安全账号信息
            </h3>
            <span class="section-tag lock-tag">🔒 不可修改</span>
          </div>
          <p class="section-desc">为了保护你的账号安全，这些重要信息暂时不能更改哦。</p>

          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">🆔 登录账号</label>
              <div class="info-value-box">
                <span class="info-value">{{ formData.account || '未设置 (手机号登录)' }}</span>
                <span class="lock-icon">🔐</span>
              </div>
            </div>
            <div class="info-item">
              <label class="info-label">📱 手机号码</label>
              <div class="info-value-box">
                <span class="info-value">{{ formData.phone || '未绑定 (账号登录)' }}</span>
                <span class="lock-icon">🔐</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 自由编辑区 (魔法笔风格) -->
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
                <textarea v-model="formData.bio" placeholder="介绍一下你自己，比如擅长什么风格... (◍•ᴗ•◍)" rows="4" maxlength="200" class="input-field textarea"></textarea>
                <span class="input-suffix">{{ formData.bio?.length || 0 }}/200</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. 系统信息展示 (时间胶囊风格) -->
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
          <button class="btn-cancel" @click="goProfile">
            <span>🚫</span> 取消
          </button>
          <button class="btn-save" @click="handleSubmit" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>
              <span class="btn-icon-large">💾</span> 保存修改
            </span>
          </button>
        </div>

      </div>
    </main>

    <!-- Toast (更可爱的样式) -->
    <transition name="toast-fade">
      <div v-if="toastVisible" class="custom-toast" :class="toastType">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import EditNavBar from '@/components/NavBar/EditNavBar.vue';
import { getCurrentUserInfo } from "@/api/auth";
export default {
  name: "ProfileEdit",
  components: { EditNavBar },
  data() {
    return {
      defaultAvatar: 'http://localhost:9000/specialty/avatar.png',
      currentUserAvatar: '',
      currentUserName: '',
      saving: false,
      toastVisible: false,
      toastMessage: '',
      toastType: 'info',
      formData: {
        id: null, account: '', phone: '', username: '', email: '', bio: '',
        role: 'USER', status: 1, createTime: null, updateTime: null, avatar: ''
      },
      errors: {}
    };
  },
  computed: {
    toastIcon() {
      const map = { success: '🎉', error: '😭', info: '💡', warning: '⚠️' };
      return map[this.toastType] || '💡';
    }
  },
  mounted() {
    this.fetchUserInfo();
    this.loadUserInfo(); },
  methods: {
    goProfile() { this.$router.push(`/profile/${this.formData.id}`); },
    showToast(msg, type = 'info') {
      this.toastMessage = msg; this.toastType = type; this.toastVisible = true;
      setTimeout(() => this.toastVisible = false, 2500);
    },

    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        if (res.data.code === 200 || res.data.success) {
          const userInfo = res.data.data;

          this.currentUserAvatar = userInfo.avatar;
          this.currentUserName = userInfo.username;

        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    loadUserInfo() {
      // 模拟数据
      setTimeout(() => {
        this.formData = {
          id: 1001, account: 'lumecho_user', phone: '', username: '光影捕手',
          email: 'photo@lumecho.com', bio: '热爱记录生活中的每一个温暖瞬间。📷',
          role: 'PHOTOGRAPHER', status: 1,
          createTime: '2023-10-01T10:00:00', updateTime: '2023-10-05T15:30:00',
          avatar: 'http://localhost:9000/lumecho/avatar.png'
        };
      }, 500);
    },
    triggerAvatarUpload() { this.$refs.avatarInput.click(); },
    handleAvatarChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { this.showToast('头像太大啦，不能超过 5MB 哦', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.avatar = e.target.result;
        this.showToast('头像换好啦！真好看 ✨', 'success');
      };
      reader.readAsDataURL(file);
    },
    validateForm() {
      this.errors = {};
      if (!this.formData.username?.trim()) { this.errors.username = '昵称不能为空哦'; return false; }
      if (this.formData.email && !/^\S+@\S+\.\S+$/.test(this.formData.email)) { this.errors.email = '邮箱格式好像不对呢'; return false; }
      return true;
    },
    async handleSubmit() {
      if (!this.validateForm()) { this.showToast('请检查填写的信息哦', 'warning'); return; }
      this.saving = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟 API
        this.showToast('保存成功！太棒啦 🚀', 'success');
        setTimeout(() => this.goProfile(), 1500);
      } catch (e) { this.showToast('保存失败，再试一次吧', 'error'); }
      finally { this.saving = false; }
    },
    getRoleName(role) { const map = { 'ADMIN': '管理员', 'USER': '探索者', 'PHOTOGRAPHER': '摄影师' }; return map[role] || '未知'; },
    getRoleIcon(role) {
      const map = { 'ADMIN': '👑', 'USER': '🎒', 'PHOTOGRAPHER': '📷' };
      return map[role] || '❓';
    },
    getRoleClass(role) { if (role === 'ADMIN') return 'role-admin'; if (role === 'PHOTOGRAPHER') return 'role-photographer'; return 'role-user'; },
    getStatusName(status) { return status === 1 ? '状态良好' : '已暂停'; },
    getStatusIcon(status) { return status === 1 ? '🟢' : '🔴'; },
    getStatusClass(status) { return status === 1 ? 'status-normal' : 'status-disabled'; },
    formatDate(dateStr) { if (!dateStr) return '-'; return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }); }
  }
};
</script>

<style scoped>
/* ====================
   🎨 全局：超级淡的薄荷绿主题
   ==================== */
.profile-edit-container {
  min-height: 100vh;
  /* 极淡的薄荷绿渐变，像清晨的雾气 */
  background: linear-gradient(180deg, #F0FFF9 0%, #F7FEFC 100%);
  font-family: 'Inter', system-ui, sans-serif;
  color: #444;
  padding-bottom: 60px;
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰泡泡 (增加氛围感) */
.profile-edit-container::before {
  content: '🌿';
  position: absolute;
  top: 10%;
  left: 5%;
  font-size: 100px;
  opacity: 0.03;
  transform: rotate(-15deg);
  pointer-events: none;
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
}

.edit-wrapper {
  max-width: 700px;
  margin: 40px auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* --- 玻璃卡片 (带淡绿光晕) --- */
.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 40px;
  border: 1px solid rgba(129, 212, 250, 0.3); /* 淡蓝绿边框 */
  box-shadow: 0 20px 60px rgba(129, 212, 250, 0.15); /* 绿色阴影 */
  transition: transform 0.3s ease;
}

/* --- 头部身份 --- */
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

/* 头像上传框 */
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

/* 悬浮小星星动画 */
.floating-star {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 24px;
  animation: twinkle 2s infinite;
  pointer-events: none;
  z-index: 2;
}

.upload-overlay {
  position: absolute; inset: 0;
  background: rgba(129, 212, 250, 0.8); /* 绿色遮罩 */
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

/* 徽章 */
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
.role-user { background: #F1F8E9; color: #558B2F; border: 1px solid #C5E1A5; } /* 绿色系默认 */

.status-normal { background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
.status-disabled { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }

.header-text { text-align: left; }
.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #2E7D32; /* 深绿色标题 */
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
  border-top: 2px dashed #C8E6C9; /* 绿色虚线 */
  margin: 30px 0;
}

/* --- 区块通用 --- */
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
  color: #4CAF50; /* 绿色标题 */
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
.edit-tag { background: #E3F2FD; color: #64B5F6; border: 1px solid #BBDEFB; }

.section-desc {
  font-size: 13px;
  color: #90A4AE;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

/* --- 锁定信息区 --- */
.locked-section {
  background: rgba(241, 248, 233, 0.4); /* 极淡绿背景 */
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
.lock-icon { font-size: 16px; opacity: 0.6; }

/* --- 表单区 --- */
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
/* 聚焦时：柔和的绿色光晕 */
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

/* --- 系统信息 --- */
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

/* --- 底部按钮 --- */
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px dashed #E0E0E0;
}
.btn-cancel {
  padding: 14px 28px;
  background: #fff;
  color: #78909C;
  border: 2px solid #ECEFF1;
  border-radius: 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-cancel:hover {
  border-color: #B0BEC5;
  color: #546E7A;
  background: #F5F5F5;
  transform: translateY(-2px);
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

/* --- Toast (更可爱) --- */
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
  z-index: 9999;
  border: 2px solid #C8E6C9;
  backdrop-filter: blur(10px);
}
.custom-toast.success { background: #E8F5E9; color: #2E7D32; border-color: #A5D6A7; }
.custom-toast.error { background: #FFEBEE; color: #C62828; border-color: #FFCDD2; }
.custom-toast.warning { background: #FFF8E1; color: #FF8F00; border-color: #FFE082; }
.toast-icon { font-size: 20px; animation: bounce 1s infinite; }

/* --- 动画 --- */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes twinkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.3) rotate(180deg); opacity: 0.8; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translate(-50%, 40px); }

/* --- 移动端适配 --- */
@media (max-width: 600px) {
  .form-grid, .info-grid, .data-tags { grid-template-columns: 1fr; }
  .identity-header { flex-direction: column; text-align: center; gap: 20px; }
  .header-text { text-align: center; order: -1; }
  .page-title { justify-content: center; }
  .section-header { justify-content: center; }
  .action-bar { flex-direction: column-reverse; }
  .btn-cancel, .btn-save { width: 100%; justify-content: center; }
  .glass-panel { padding: 24px 20px; }
}
</style>