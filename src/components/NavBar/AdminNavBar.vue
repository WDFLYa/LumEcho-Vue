<template>
  <header class="admin-navbar">
    <!-- 左侧：Logo + 标题 → 点击退出登录 -->
    <div class="nav-left" @click="handleLogoClick">
      <h1 class="admin-logo">
        🛡️ Lum<span>Admin</span>
      </h1>
      <div class="divider"></div>
      <span class="page-title">控制台 Dashboard</span>
    </div>

    <!-- 右侧：工具与用户区 -->
    <div class="nav-right">
      <!-- 1. 返回前台 -->
      <button class="icon-btn back-btn" @click="goFrontHome" title="返回前台首页">
        <span class="btn-icon">🏠</span>
        <span class="btn-text">前台</span>
      </button>

      <!-- 2. 消息通知 -->
      <div class="notification-wrapper" @click="handleNotification">
        <span class="icon-btn">🔔</span>
        <span v-if="hasUnreadMsg" class="red-dot"></span>
      </div>

      <!-- 3. 管理员信息胶囊（真实头像+名字） -->
      <div class="admin-capsule" @click="$emit('profile')">
        <div class="capsule-content">
          <div class="admin-info-text">
            <span class="role-badge">Super Admin</span>
            <span class="user-name">{{ userName }}</span>
          </div>
          <div class="user-avatar-wrapper">
            <img :src="userAvatar" alt="Avatar" class="user-avatar"/>
            <span class="status-indicator online"></span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- 管理员专用 → 退出确认弹窗 -->
  <div v-show="showLogoutModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-box admin-modal">
      <div class="modal-icon">🛡️</div>
      <h3>确认退出管理员控制台？</h3>
      <p>退出后将失去管理权限，需要重新登录验证身份</p>
      <div class="modal-buttons">
        <button class="btn-cancel" @click="closeModal">取消</button>
        <button class="btn-confirm admin-confirm" @click="confirmAdminLogout">
          确认退出
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// 引入退出接口
import { logout } from '@/api/auth'

export default {
  name: "AdminNavBar",
  props: {
    userAvatar: {
      type: String,
      default: 'http://localhost:9000/lumecho/avatar.png'
    },
    userName: {
      type: String,
      default: 'Administrator'
    }
  },
  data() {
    return {
      hasUnreadMsg: true,
      showLogoutModal: false // 控制退出弹窗
    };
  },
  methods: {
    // ========== 管理员退出登录逻辑 ==========
    handleLogoClick() {
      this.showLogoutModal = true
    },
    closeModal() {
      this.showLogoutModal = false
    },
    async confirmAdminLogout() {
      try {
        // 调用后端退出接口
        await logout()

        // 清空所有登录信息（管理员+用户通用）
        localStorage.clear()


        this.$router.push('/')
      } catch (err) {
        console.error('退出失败', err)
      } finally {
        this.closeModal()
      }
    },

    // ========== 原有功能 ==========
    goHome() {
      if (this.$route.path === '/admin') {
        this.$emit('refresh');
      } else {
        this.$router.push("/admin");
      }
    },
    goFrontHome() {
      this.$router.push("/home");
    },
    handleNotification() {
      this.hasUnreadMsg = false;
      this.$router.push('/admin/messages');
    }
  }
};
</script>

<style scoped>
/* 原有样式全部保留 */
.admin-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #E1F5FE;
  box-shadow: 0 4px 20px rgba(129, 212, 250, 0.08);
  transition: all 0.3s ease;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  min-width: 260px;
}

.admin-logo {
  font-size: 1.5rem;
  font-weight: 900;
  color: #37474F;
  margin: 0;
  letter-spacing: -0.5px;
  transition: transform 0.3s;
}
.admin-logo:hover { transform: scale(1.02); }
.admin-logo span {
  color: #0288D1;
}

.divider {
  width: 1px;
  height: 24px;
  background: #CFD8DC;
}

.page-title {
  font-size: 14px;
  font-weight: 700;
  color: #78909C;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  color: #546E7A;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn:hover {
  background: #E1F5FE;
  color: #0277BD;
}

.back-btn .btn-text {
  font-size: 13px;
  font-weight: 700;
}

.notification-wrapper {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.2s;
}
.notification-wrapper:hover { background: #E1F5FE; }

.red-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #FF5252;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(255, 82, 82, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
}

.admin-capsule {
  background: #FFFFFF;
  border: 2px solid #ECEFF1;
  border-radius: 50px;
  padding: 4px 6px 4px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.admin-capsule:hover {
  border-color: #81D4FA;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(129, 212, 250, 0.25);
}

.capsule-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.role-badge {
  font-size: 10px;
  font-weight: 800;
  color: #0288D1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: #37474F;
}

.user-avatar-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}
.status-indicator.online { background: #4CAF50; }

/* —————————— 管理员退出弹窗样式 —————————— */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(6px);
}

.modal-box {
  background: #fff;
  width: 90%;
  max-width: 400px;
  border-radius: 20px;
  padding: 34px 26px;
  text-align: center;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  animation: modalScale 0.3s ease;
}

.admin-modal {
  border-top: 4px solid #0288D1;
}

@keyframes modalScale {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-icon {
  font-size: 52px;
  margin-bottom: 14px;
}

.modal-box h3 {
  margin: 0 0 10px;
  font-size: 19px;
  font-weight: 700;
  color: #263238;
}

.modal-box p {
  margin: 0 0 26px;
  font-size: 14px;
  color: #546E7A;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 14px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 13px 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
}

.btn-cancel {
  background: #f5f7fa;
  color: #667;
}
.btn-cancel:hover {
  background: #e4e8ef;
}

.btn-confirm {
  color: #fff;
}

.admin-confirm {
  background: linear-gradient(135deg, #0288D1, #4FC3F7);
}
.admin-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(2, 136, 209, 0.3);
}

@media (max-width: 768px) {
  .admin-navbar { padding: 10px 20px; }
  .page-title, .back-btn .btn-text, .admin-info-text { display: none; }
  .divider { display: none; }
  .admin-capsule { padding: 4px; border-radius: 50%; border: none; box-shadow: none; }
}
</style>