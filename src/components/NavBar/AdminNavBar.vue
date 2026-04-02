<template>
  <header class="admin-navbar">
    <!-- 左侧：Logo + 面包屑/标题 -->
    <div class="nav-left" @click="goHome">
      <h1 class="admin-logo">
        🛡️ Lum<span>Admin</span>
      </h1>
      <div class="divider"></div>
      <span class="page-title">控制台 Dashboard</span>
    </div>

    <!-- 中间：管理专用搜索框 -->
    <div class="search-container">
      <span class="search-icon">🔍</span>
      <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索用户ID、订单号或摄影师..."
          class="search-input"
          @keyup.enter="handleSearch"
      />
      <!-- 清除按钮 (有内容时显示) -->
      <span v-if="searchQuery" class="clear-icon" @click.stop="clearSearch">✕</span>
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

      <!-- 3. 管理员信息胶囊 -->
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
</template>

<script>
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
      searchQuery: '',
      hasUnreadMsg: true // 模拟有未读消息
    };
  },
  methods: {
    goHome() {
      // 如果已经在首页则刷新，否则跳转
      if (this.$route.path === '/admin') {
        this.$emit('refresh');
      } else {
        this.$router.push("/admin");
      }
    },
    goFrontHome() {
      this.$router.push("/home");
    },
    handleSearch() {
      this.$emit('search', this.searchQuery);
    },
    clearSearch() {
      this.searchQuery = '';
      this.$emit('search', '');
    },
    handleNotification() {
      this.hasUnreadMsg = false;
      this.$router.push('/admin/messages'); // 假设的消息中心路径
    }
  }
};
</script>

<style scoped>
/* --- 容器样式 --- */
.admin-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
  /* 更偏向管理的磨砂玻璃效果 */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #E1F5FE;
  box-shadow: 0 4px 20px rgba(129, 212, 250, 0.08);
  transition: all 0.3s ease;
}

/* --- 左侧 Logo 区 --- */
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
  color: #37474F; /* 更深沉的颜色 */
  margin: 0;
  letter-spacing: -0.5px;
  transition: transform 0.3s;
}
.admin-logo:hover { transform: scale(1.02); }
.admin-logo span {
  color: #0288D1; /* 科技蓝 */
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

/* --- 中间搜索框 --- */
.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 16px;
  color: #B0BEC5;
  pointer-events: none;
  transition: color 0.3s;
}

.clear-icon {
  position: absolute;
  right: 16px;
  font-size: 14px;
  color: #B0BEC5;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-icon:hover { color: #F44336; transform: scale(1.1); }

.search-input {
  width: 100%;
  padding: 10px 40px 10px 45px; /* 右边距留给清除按钮 */
  border-radius: 12px; /* 稍微方一点，显得更严谨 */
  border: 2px solid #ECEFF1;
  background: #F5F7FA;
  font-size: 14px;
  color: #455A64;
  outline: none;
  transition: all 0.3s;
  font-family: inherit;
}

.search-input:focus {
  background: #FFFFFF;
  border-color: #4FC3F7;
  box-shadow: 0 0 0 4px rgba(79, 195, 247, 0.1);
}
.search-input:focus + .search-icon { color: #4FC3F7; }

/* --- 右侧操作区 --- */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 通用图标按钮 */
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

/* 消息通知 */
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

/* 管理员胶囊 */
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

/* 移动端适配 */
@media (max-width: 768px) {
  .admin-navbar { padding: 10px 20px; }
  .page-title, .back-btn .btn-text, .admin-info-text { display: none; }
  .search-container { max-width: 120px; margin: 0 10px; }
  .divider { display: none; }
  .admin-capsule { padding: 4px; border-radius: 50%; border: none; box-shadow: none; }
}
</style>
