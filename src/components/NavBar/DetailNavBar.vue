<template>
  <header class="navbar">
    <!-- 左侧 Logo -->
    <div class="nav-left" @click="goHome">
      <h1 class="lumecho-logo-small">
        🌟 Lum<span>Echo!</span>
      </h1>
    </div>

    <!-- 中间搜索框 (保持原样) -->
    <div class="search-container">
    <input type="text" placeholder="寻找灵感火花... ✨" class="search-input" />
    <button class="search-btn">🔍</button>
  </div>

    <!-- 右侧操作区 -->
    <div class="nav-right">
      <!-- 发布作品按钮 (颜色已修改) -->
      <button class="upload-btn" @click="$emit('upload')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span>发布作品</span>
      </button>

      <!-- 👇 用户信息区域 (新增用户名 + 头像) -->
      <div class="user-info" @click="$emit('profile')">
        <span class="user-name">{{ userName }}</span>
        <div class="user-avatar">
          <img :src="userAvatar" alt="Avatar" />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "DetailNavBar",
  props: {
    userAvatar: {
      type: String
    },
    userName: {
      type: String
    }
  },
  methods: {
    goHome() {
      this.$router.push('/home');
    }
  }
};
</script>

<style scoped>
/* --- Navbar 容器 --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #FFE5D9;
  box-shadow: 0 4px 20px rgba(255, 183, 178, 0.1);
}

/* --- Logo 样式 --- */
.lumecho-logo-small {
  font-size: 1.5rem;
  font-weight: 800;
  color: #FF8E8E; /* 主题粉色 */
  cursor: pointer;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: transform 0.2s;
}
.lumecho-logo-small:hover {
  transform: scale(1.05) rotate(-2deg);
}
.lumecho-logo-small span {
  color: #6C63FF; /* 点缀紫色 */
  -webkit-text-fill-color: #6C63FF;
}

/* --- 搜索框 --- */
.search-container {
  flex: 1;
  max-width: 450px;
  margin: 0 40px;
  position: relative;
  display: flex;
  align-items: center;
}
.search-input {
  width: 100%;
  padding: 12px 45px 12px 20px;
  border-radius: 50px;
  border: 2px solid #FFE5D9;
  background: #FFF9F5;
  font-size: 14px;
  outline: none;
  color: #555;
  transition: all 0.3s;
}
.search-input::placeholder {
  color: #CCAAB8;
}
.search-input:focus {
  background: #fff;
  border-color: #FFB7B2;
  box-shadow: 0 0 0 4px rgba(255, 183, 178, 0.2);
}
.search-btn {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.search-btn:hover {
  opacity: 1;
}

/* --- 右侧区域 --- */
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px; /* 增加了间距 */
}

/* --- 🎨 发布作品按钮 (颜色已修改为深色高级感) --- */
.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: #222; /* 改为深黑色，与主页统一，对比更强烈 */
  color: #fff;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.upload-btn:hover {
  transform: translateY(-3px);
  background: #000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
.upload-btn svg {
  stroke: currentColor;
}

/* --- 👇 新增：用户信息组合容器 --- */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px; /* 左边距减小，因为头像本身有边距 */
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
}
.user-info:hover {
  background: rgba(255, 142, 142, 0.1); /* 悬停时显示淡淡的主题粉色背景 */
}

/* 用户名样式 */
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
  transition: color 0.3s;
  max-width: 100px; /* 防止名字太长 */
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-info:hover .user-name {
  color: #FF8E8E; /* 悬停变为主题粉色 */
}

/* 头像容器 */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.3s, border-color 0.3s;
  flex-shrink: 0; /* 防止被压缩 */
}
.user-info:hover .user-avatar {
  border-color: #FF8E8E;
  transform: scale(1.05);
}
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- 移动端适配 --- */
@media (max-width: 768px) {
  .navbar {
    padding: 12px 20px;
  }
  .search-container {
    display: none;
  }
  .upload-btn span {
    display: none; /* 移动端只显示图标 */
  }
  .upload-btn {
    padding: 10px;
    border-radius: 50%;
  }
  .user-name {
    display: none; /* 移动端隐藏用户名，只显示头像 */
  }
  .user-info {
    padding: 0;
  }
  .user-avatar {
    width: 40px;
    height: 40px;
  }
}
</style>