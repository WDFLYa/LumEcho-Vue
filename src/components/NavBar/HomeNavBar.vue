<template>
  <header class="navbar">
    <!-- 左侧 Logo -->
    <div class="nav-left" @click="handleLogoClick">
      <h1 class="lumecho-logo-small">
        🌤️ Lum<span>Echo!</span>
      </h1>
    </div>

    <!-- 搜索框 (图标常驻) -->
    <div class="search-container">
      <span class="search-icon">🔍</span>
      <input
          type="text"
          v-model="searchQuery"
          placeholder="找找有趣的灵感..."
          class="search-input"
          @keyup.enter="handleSearch"
      />
    </div>

    <!-- 右侧用户区 -->
    <div class="nav-right">
      <button
          v-if="isAdmin"
          class="admin-btn"
          @click="goAdmin"
          title="进入后台管理"
      >
        <span class="btn-icon">🛡️</span>
        <span>后台管理</span>
      </button>

      <button class="upload-btn" @click="$emit('upload')">
        <span class="btn-icon">✨</span>
        <span>发布作品</span>
      </button>

      <div class="user-capsule" @click="$emit('profile')">
        <div class="capsule-content">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar-wrapper">
            <img :src="userAvatar" alt="Avatar" class="user-avatar"/>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- 退出登录确认弹窗（美观不违和） -->
  <div v-show="showLogoutModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-box">
      <div class="modal-icon">🔐</div>
      <h3>确定要退出登录吗？</h3>
      <p>退出后需要重新登录才能使用发布、评论等功能</p>
      <div class="modal-buttons">
        <button class="btn-cancel" @click="closeModal">取消</button>
        <button class="btn-confirm" @click="confirmLogout">确认退出</button>
      </div>
    </div>
  </div>
</template>

<script>
// 引入退出接口
import { logout } from '@/api/auth'

export default {
  name: "HomeNavBar",
  props: {
    userAvatar: String,
    userName: String
  },
  data() {
    return {
      searchQuery: '',
      showLogoutModal: false // 控制弹窗
    };
  },
  computed: {
    isAdmin() {
      return localStorage.getItem('user_role') === 'ADMIN';
    }
  },
  methods: {
    // Logo点击：弹出退出弹窗
    handleLogoClick() {
      this.showLogoutModal = true
    },
    // 关闭弹窗
    closeModal() {
      this.showLogoutModal = false
    },
    // 确认退出登录
    async confirmLogout() {
      try {
        // 调用后端退出接口
        await logout()

        // 清空本地登录信息
        localStorage.removeItem('token')
        localStorage.removeItem('user_id')
        localStorage.removeItem('user_name')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_avatar')


        // 跳转到登录页
        this.$router.push('/')
      } catch (err) {
        console.error('退出失败', err)
      } finally {
        this.closeModal()
      }
    },

    goHome() {
      this.$router.push("/home");
    },
    goAdmin() {
      this.$router.push("/admin");
    },
    handleSearch() {
      this.$emit('search', this.searchQuery);
    }
  }
};
</script>

<style scoped>
/* 原有样式不变，我直接追加在后面 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #F0F4F8;
  transition: all 0.3s ease;
}

.nav-left { flex: 1; }
.lumecho-logo-small {
  font-size: 1.6rem;
  font-weight: 900;
  color: #5C6BC0;
  cursor: pointer;
  margin: 0;
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lumecho-logo-small:hover { transform: scale(1.05) rotate(-2deg); }
.lumecho-logo-small span { color: #FFCA28; -webkit-text-fill-color: #FFCA28; }

.search-container {
  flex: 1;
  max-width: 450px;
  margin: 0 40px;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
  color: #B0BEC5;
  pointer-events: none;
  z-index: 2;
  transition: color 0.3s;
}
.search-input:focus + .search-icon { color: #81D4FA; }

.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border-radius: 50px;
  border: 2px solid #F0F4F8;
  background: #FAFAFA;
  font-size: 14px;
  color: #546E7A;
  outline: none;
  transition: all 0.3s;
}
.search-input::placeholder { color: #CFD8DC; }
.search-input:focus {
  background: #FFFFFF;
  border-color: #81D4FA;
  box-shadow: 0 4px 12px rgba(129, 212, 250, 0.2);
}

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.admin-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #0288D1, #4FC3F7);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(79, 195, 247, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(79, 195, 247, 0.5);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #81D4FA 0%, #4FC3F7 100%);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(129, 212, 250, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(129, 212, 250, 0.5);
}
.btn-icon { font-size: 16px; }

.user-capsule {
  background: #FFFFFF;
  border: 2px solid #F0F4F8;
  border-radius: 50px;
  padding: 4px 4px 4px 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.user-capsule:hover {
  border-color: #81D4FA;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(129, 212, 250, 0.25);
  background: #E1F5FE;
}

.capsule-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: #546E7A;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.user-capsule:hover .user-name { color: #0277BD; }

.user-avatar-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* —————————— 退出登录弹窗样式（美观统一）—————————— */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-box {
  background: #fff;
  width: 90%;
  max-width: 380px;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: modalScale 0.3s ease;
}

@keyframes modalScale {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-box h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
}

.modal-box p {
  margin: 0 0 24px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f2f4f6;
  color: #666;
}

.btn-cancel:hover {
  background: #e5e9ef;
}

.btn-confirm {
  background: linear-gradient(135deg, #5C6BC0, #7986CB);
  color: #fff;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(92, 107, 192, 0.3);
}

@media (max-width: 768px) {
  .navbar { padding: 12px 20px; }
  .search-container { display: none; }
  .upload-btn span:not(.btn-icon),
  .admin-btn span:not(.btn-icon) { display: none; }
  .upload-btn, .admin-btn { padding: 10px; border-radius: 50%; }
  .user-name { display: none; }
  .user-capsule { padding: 4px; border-radius: 50%; }
  .user-avatar-wrapper { width: 40px; height: 40px; }
}
</style>