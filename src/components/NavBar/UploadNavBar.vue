<template>
  <header class="upload-navbar">
    <!-- 左侧：Logo (带可爱图标) -->
    <div class="nav-left" @click="goHome">
      <div class="logo-wrapper">
        <span class="logo-icon">🌟</span>
        <h1 class="logo-text">Lum<span>Echo!</span></h1>
      </div>
    </div>

    <!-- 右侧：操作区 -->
    <div class="nav-right">
      <!-- 发布按钮 (强调色 + 动画) -->
      <button class="action-btn publish-btn" @click="$emit('upload')">
        <span class="btn-icon">📸</span>
        <span class="btn-text">发布作品</span>
      </button>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 用户信息 (可爱头像 + 名字) -->
      <div class="user-profile" @click="$emit('profile')">
        <span class="greeting">Hi, {{ userName }}</span>
        <div class="avatar-ring">
          <img :src="userAvatar" alt="Avatar" class="avatar-img" />
          <span class="status-dot"></span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "UploadNavBar",
  props: {
    userAvatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" // 默认可爱头像
    },
    userName: {
      type: String,
      default: "Creator"
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
/* --- 容器：柔和的磨砂玻璃 --- */
.upload-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 142, 142, 0.15); /* 淡粉色边框 */
  box-shadow: 0 4px 30px rgba(255, 183, 178, 0.15); /* 粉紫色光晕 */
}

/* --- 左侧 Logo --- */
.nav-left {
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-left:hover {
  transform: scale(1.05) rotate(-1deg);
}
.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-icon {
  font-size: 1.6rem;
  filter: drop-shadow(0 2px 4px rgba(108, 99, 255, 0.3));
  animation: float 3s ease-in-out infinite;
}
.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: #444;
  margin: 0;
  letter-spacing: -0.5px;
}
.logo-text span {
  color: #6C63FF;
  background: linear-gradient(45deg, #6C63FF, #FF8E8E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --- 右侧区域 --- */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* --- 发布按钮 (可爱风) --- */
.publish-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6C63FF 0%, #8F85FF 100%);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.publish-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(108, 99, 255, 0.4);
}
.publish-btn:active {
  transform: scale(0.95);
}
.btn-icon {
  font-size: 1.1em;
  filter: brightness(1.2);
}

/* --- 分隔线 --- */
.divider {
  width: 1px;
  height: 24px;
  background: #eee;
  margin: 0 4px;
}

/* --- 用户信息 --- */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 6px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
}
.user-profile:hover {
  background: rgba(255, 142, 142, 0.08);
}
.greeting {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: color 0.3s;
}
.user-profile:hover .greeting {
  color: #FF8E8E;
}

/* 头像环 */
.avatar-ring {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(45deg, #FFB7B2, #6C63FF); /* 渐变边框 */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.user-profile:hover .avatar-ring {
  transform: rotate(5deg) scale(1.1);
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  background: #fff;
}
/* 在线状态点 */
.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #4ADE80; /* 绿色 */
  border: 2px solid #fff;
  border-radius: 50%;
}

/* --- 动画 --- */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* --- 移动端适配 --- */
@media (max-width: 768px) {
  .upload-navbar {
    padding: 10px 20px;
  }
  .logo-text {
    font-size: 1.2rem;
  }
  .publish-btn .btn-text {
    display: none; /* 移动端只显示相机图标 */
  }
  .publish-btn {
    padding: 10px;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    justify-content: center;
  }
  .divider {
    display: none;
  }
  .greeting {
    display: none; /* 移动端隐藏名字 */
  }
  .avatar-ring {
    width: 36px;
    height: 36px;
  }
}
</style>