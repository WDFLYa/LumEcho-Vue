<template>
  <header class="activity-navbar">
    <!-- 左侧：艺术感 Logo -->
    <div class="nav-left" @click="goHome">
      <h1 class="logo-text">
        📸 Lum<span>Echo</span> Activities
      </h1>
    </div>

    <!-- 中间：搜索框 (琥珀金点缀) -->
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
          v-model="localSearch"
          placeholder="寻找线下采风、主题创作..."
          class="search-input"
          @keyup.enter="emitSearch"
      />
    </div>

    <!-- 右侧：用户与发布 -->
    <div class="nav-right">
      <button class="create-btn" @click="$emit('create')" title="发起新活动">
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
  name: "ActivityNavBar",
  props: ['userAvatar', 'userName'],
  data() {
    return { localSearch: '' };
  },
  methods: {
    goHome() { this.$router.push('/home'); },
    emitSearch() { this.$emit('search', this.localSearch); }
  }
};
</script>

<style scoped>
.activity-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
  /* 暖色调毛玻璃：淡紫 + 微黄 */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #E1BEE7;
  box-shadow: 0 4px 20px rgba(123, 31, 162, 0.05);
}

/* Logo */
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
  color: #FFB300; /* 琥珀金，代表摄影之光 */
  text-shadow: 0 2px 4px rgba(255, 179, 0, 0.3);
}

/* 搜索框 */
.search-wrapper {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #AB47BC;
  font-size: 18px;
}
.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border-radius: 50px;
  border: 2px solid #F3E5F5;
  background: #FAFAFA;
  color: #4A148C;
  font-weight: 600;
  outline: none;
  transition: all 0.3s ease;
}
.search-input::placeholder { color: #CE93D8; }
.search-input:focus {
  border-color: #FFB300; /* 聚焦变金色 */
  box-shadow: 0 0 0 4px rgba(255, 179, 0, 0.15);
  background: #FFF;
}

/* 右侧 */
.nav-right { display: flex; align-items: center; gap: 20px; }

.create-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #FFB300, #FFA000);
  color: #FFF;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
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
  .activity-navbar { padding: 12px 20px; }
  .search-wrapper { display: none; }
  .create-btn span:not(.btn-icon) { display: none; }
  .create-btn { padding: 10px; border-radius: 50%; }
  .u-name { display: none; }
}
</style>