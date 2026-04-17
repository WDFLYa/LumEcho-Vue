<template>
  <header class="navbar">
    <!-- 左侧 Logo -->
    <div class="nav-left" @click="goHome">
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
      <!-- ✅ ADMIN 才显示：后台管理按钮 -->
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

      <!-- 用户胶囊 -->
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
</template>

<script>
export default {
  name: "HomeNavBar",
  props: {
    userAvatar: String,
    userName: String
  },
  data() {
    return {
      searchQuery: ''
    };
  },
  computed: {
    // ✅ 自动判断是否管理员
    isAdmin() {
      return localStorage.getItem('user_role') === 'ADMIN';
    }
  },
  methods: {
    goHome() {
      this.$router.push("/home");
    },
    // ✅ 去后台
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

/* Logo */
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

/* 搜索框 */
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

/* 右侧区域 */
.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

/* ✅ 后台管理按钮（管理员专用） */
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

/* 发布按钮 */
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

/* 用户胶囊 */
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