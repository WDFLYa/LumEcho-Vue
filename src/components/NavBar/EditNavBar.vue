<template>
  <header class="navbar">
    <!-- 左侧：Logo (带可爱图标) -->
    <div class="nav-left" @click="goHome">
      <div class="logo-wrapper">
        <span class="logo-icon">🪞</span> <!-- 镜子图标 -->
        <h1 class="logo-text">Lum<span>Echo!</span></h1>
      </div>
    </div>

    <!-- 中间装饰标语 (可选，增加平衡感) -->
    <div class="nav-center-decoration">
      <span class="deco-text">✨ 编辑个人资料 ✨</span>
    </div>

    <!-- 右侧：操作区 -->
    <div class="nav-right">

      <!-- 用户信息 (高亮显示) -->
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
  name: "EditNavBar",
  props: {
    userAvatar: { type: String, default: '' },
    userName: { type: String, default: 'User' }
  },
  methods: {
    goHome() { this.$router.push('/home'); }
  }
};
</script>

<style scoped>
/* ====================
   ✅ 核心修复：使用 .navbar 作为主类名
   并应用 Flex 布局
   ==================== */
.navbar {
  display: flex; /* ✅ 必须：启用弹性布局 */
  justify-content: space-between; /* ✅ 必须：左右两端对齐 */
  align-items: center; /* ✅ 必须：垂直居中 */

  padding: 12px 32px;

  /* 粘性定位 */
  position: sticky;
  top: 0;
  z-index: 1000;

  /* 背景与模糊 */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* 边框与阴影 (清新绿风格) */
  border-bottom: 1px solid rgba(77, 182, 172, 0.2);
  box-shadow: 0 4px 30px rgba(77, 182, 172, 0.1);

  transition: all 0.3s ease;
}

/* --- 左侧 Logo 区域 --- */
.nav-left {
  flex: 1; /* 占据左侧空间 */
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
  filter: drop-shadow(0 2px 4px rgba(77, 182, 172, 0.3));
  animation: float 3s ease-in-out infinite;
}
.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: #444;
  margin: 0;
}
/* 文字渐变色 */
.logo-text span {
  color: #4FC3F7;
  background: linear-gradient(45deg, #4FC3F7, #81C784);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --- 中间装饰 --- */
.nav-center-decoration {
  flex: 1; /* 占据中间空间，帮助平衡布局 */
  text-align: center;
  display: flex;
  justify-content: center;
}
.deco-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #81C784; /* 绿色系文字 */
  letter-spacing: 1px;
  white-space: nowrap;
}

/* --- 右侧区域 --- */
.nav-right {
  flex: 1; /* 占据右侧空间 */
  display: flex;
  justify-content: flex-end; /* 内容靠右对齐 */
  align-items: center;
  gap: 16px;
}


/* --- 用户信息胶囊 --- */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 6px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
  margin-left: 8px;
}
.user-profile:hover {
  background: rgba(79, 195, 247, 0.08);
}
.greeting {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: color 0.3s;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-profile:hover .greeting {
  color: #0288D1;
}

/* 头像环 */
.avatar-ring {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(45deg, #4FC3F7, #81C784);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
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
}
.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #4ADE80;
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
  .navbar { padding: 10px 20px; }

  /* 移动端隐藏中间文字 */
  .nav-center-decoration { display: none; }

  /* 按钮只显示图标 */
  .home-btn .btn-text { display: none; }
  .home-btn {
    padding: 10px;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    justify-content: center;
  }

  .divider { display: none; }
  .greeting { display: none; }

  .avatar-ring { width: 36px; height: 36px; }

  /* 调整左右比例，防止拥挤 */
  .nav-left { flex: 0 0 auto; }
  .nav-right { flex: 0 0 auto; }
}
</style>