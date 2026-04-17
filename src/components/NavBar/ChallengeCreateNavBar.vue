<template>
  <header class="challenge-navbar">
    <!-- 左侧：动态 Logo -->
    <div class="nav-left" @click="goHome">
      <h1 class="logo-text">
        🏆 Lum<span>Echo</span> Challenges
      </h1>
    </div>

    <!-- 右侧：功能与用户 -->
    <div class="nav-right">
      <button class="create-btn" @click="$emit('create')" title="发起新挑战">
        <span>✨ 发起挑战</span>
      </button>

      <div class="user-pill" @click="$emit('profile')">
        <span class="u-name">{{ userName }}</span>
        <img :src="userAvatar" class="u-avatar" alt="me" />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "ChallengeCreateNavBar",
  props: ['userAvatar', 'userName'],
  methods: {
    goHome() {
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
  padding: 16px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
  /* 淡紫色毛玻璃背景 */
  background: rgba(243, 229, 245, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(171, 71, 188, 0.1);
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.05);
}

/* Logo */
.nav-left {
  cursor: pointer;
}

.logo-text {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
  color: #6A1B9A; /* 深紫 */
  letter-spacing: -0.5px;
  transition: transform 0.3s ease;
}

.logo-text:hover {
  transform: scale(1.02);
}

.logo-text span {
  color: #AB47BC; /* 亮紫 */
  background: linear-gradient(135deg, #AB47BC, #E1BEE7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 右侧 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.create-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #8E24AA, #6A1B9A);
  color: #FFF;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(106, 27, 154, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(106, 27, 154, 0.5);
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
  box-shadow: 0 4px 12px rgba(171, 71, 188, 0.2);
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

@media (max-width: 768px) {
  .challenge-navbar {
    padding: 12px 20px;
  }

  .create-btn span {
    display: none;
  }

  .create-btn {
    padding: 10px;
    border-radius: 50%;
  }

  .u-name {
    display: none;
  }
}
</style>