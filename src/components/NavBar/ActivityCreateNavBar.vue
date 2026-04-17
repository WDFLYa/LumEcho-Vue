<template>
  <header class="activity-create-avatar">
    <div class="nav-left" @click="goHome">
      <h1 class="logo-text">
        📸 Lum<span>Echo</span> Activities
      </h1>
    </div>

    <!-- 搜索框已删除 -->

    <div class="nav-right">
      <button class="create-btn" title="发起新活动">
        <span class="btn-icon">✏️</span>
        <span>发起活动</span>
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
  name: "ActivityCreateAvatar",
  props: ['userAvatar', 'userName'],
  methods: {
    goHome() { this.$router.push('/activity'); }
  }
};
</script>

<style scoped>
.activity-create-avatar {
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

.nav-left { cursor: pointer; }
.logo-text {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
  color: #6A1B9A;
  letter-spacing: -0.5px;
  transition: transform 0.3s ease;
}
.logo-text:hover { transform: scale(1.02); }
.logo-text span {
  color: #FFB300;
  text-shadow: 0 2px 4px rgba(255, 179, 0, 0.3);
}

.nav-right { display: flex; align-items: center; gap: 20px; }

.create-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #FFB300, #FFA000);
  color: #FFF;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: default;
  box-shadow: 0 4px 15px rgba(255, 160, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}
.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 160, 0, 0.5);
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

@media (max-width: 768px) {
  .activity-create-avatar { padding: 12px 20px; }
  .create-btn span:not(.btn-icon) { display: none; }
  .create-btn { padding: 10px; border-radius: 50%; }
  .u-name { display: none; }
}
</style>