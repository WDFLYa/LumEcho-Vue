<template>
  <header class="activity-detail-navbar">
    <!-- 左侧：Logo + 活动详情标题 -->
    <div class="nav-left">
      <div class="logo-area" @click="goBack">
        <h1 class="logo-text">
          📸 Lum<span>Echo</span> Activities
        </h1>
      </div>

      <div class="page-title">
        <span class="line"></span>
        活动详情
      </div>
    </div>

    <!-- 右侧：用户信息 -->
    <div class="nav-right">
      <div class="user-pill" @click="$emit('profile')">
        <span class="u-name">{{ userName }}</span>
        <img :src="userAvatar" class="u-avatar" alt="me" />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "ActivityDetailNavBar",
  props: ['userAvatar', 'userName'],
  methods: {
    goBack() {
      this.$router.push('/activity');
    }
  }
};
</script>

<style scoped>
/* 完全保持你原来的活动导航栏主题风格 */
.activity-detail-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #E1BEE7;
  box-shadow: 0 4px 20px rgba(123, 31, 162, 0.05);
}

/* 左侧布局（模仿挑战赛导航栏结构） */
.nav-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-area {
  cursor: pointer;
  transition: transform 0.3s ease;
}
.logo-area:hover {
  transform: scale(1.02);
}

/* 完全保留你原来的 LOGO 字体样式 */
.logo-text {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
  color: #6A1B9A;
  letter-spacing: -0.5px;
}
.logo-text span {
  color: #FFB300;
  text-shadow: 0 2px 4px rgba(255, 179, 0, 0.3);
}

/* 活动详情标题（和活动主题配色统一） */
.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #6A1B9A;
  letter-spacing: 0.5px;
}
.page-title .line {
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #FFB300, #FFA000);
  border-radius: 2px;
}

/* 右侧用户区域（完全不变） */
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFF;
  padding: 6px 12px 6px 6px;
  border-radius: 50px;
  border: 2px solid #F3E5F5;
  cursor: pointer;
  transition: all 0.3s ease;
}
.user-pill:hover {
  border-color: #AB47BC;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(106, 27, 154, 0.2);
}
.u-name {
  font-size: 14px;
  font-weight: 700;
  color: #6A1B9A;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.u-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFF;
}

/* 响应式 */
@media (max-width: 768px) {
  .activity-detail-navbar {
    padding: 12px 20px;
  }
  .page-title {
    display: none;
  }
  .u-name {
    display: none;
  }
}
</style>