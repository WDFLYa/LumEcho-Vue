<template>
  <header class="challenge-navbar">
    <!-- 左侧：Logo (点击返回活动列表) -->
    <div class="nav-left" @click="goActivity">
      <span class="logo-icon">🏆</span>
      <h1 class="logo-text">
        Lum<span>Echo</span>
      </h1>
    </div>

    <!-- 右侧：用户信息 -->
    <div class="nav-right">
      <div class="user-pill" @click="$emit('profile')">
        <span class="u-name">{{ userName }}</span>
        <img :src="userAvatar" class="u-avatar" alt="avatar" />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "ChallengeDetailNavBar",
  props: ['userAvatar', 'userName'],
  methods: {
    goActivity() {
      // 跳转到活动列表页
      this.$router.push('/challenge');
    }
  }
};
</script>

<style scoped>
.challenge-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
  /* 白色毛玻璃背景 */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(106, 27, 154, 0.08);
  box-shadow: 0 2px 15px rgba(106, 27, 154, 0.04);
}

/* 左侧 Logo 区域 */
.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.nav-left:hover {
  transform: scale(1.02);
}
.logo-icon {
  font-size: 1.8rem;
  filter: drop-shadow(0 2px 4px rgba(106, 27, 154, 0.2));
}
.logo-text {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #4A148C;
  letter-spacing: -0.3px;
}
.logo-text span {
  color: #AB47BC;
  background: linear-gradient(135deg, #AB47BC, #E1BEE7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 右侧区域 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 用户信息 */
.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #F8F9FA, #FFF);
  padding: 6px 12px 6px 6px;
  border-radius: 50px;
  border: 2px solid #EEEEEE;
  cursor: pointer;
  transition: all 0.3s ease;
}
.user-pill:hover {
  border-color: #AB47BC;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(106, 27, 154, 0.15);
}
.u-name {
  font-size: 14px;
  font-weight: 700;
  color: #4A148C;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.u-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .challenge-navbar {
    padding: 12px 20px;
  }
  .logo-text {
    font-size: 1.2rem;
  }
  .logo-icon {
    font-size: 1.5rem;
  }
  .u-name {
    display: none;
  }
  .u-avatar {
    width: 36px;
    height: 36px;
  }
}
</style>
