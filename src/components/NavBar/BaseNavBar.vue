<template>
  <header class="navbar" :class="themeClass">
    <div class="nav-left" @click="handleLeftClick">
      <slot name="logo">
        <h1 class="default-logo">LumEcho!</h1>
      </slot>
    </div>

    <div class="nav-center">
      <slot name="center">
        <div class="search-container" v-if="showSearch">
          <input type="text" :placeholder="searchPlaceholder" class="search-input" />
          <button class="search-btn">🔍</button>
        </div>
      </slot>
    </div>

    <div class="nav-right">
      <slot name="right">
        <button class="upload-btn" @click="goUpload" v-if="showUpload">
          <span class="btn-icon">📸</span>
          <span>发布作品</span>
        </button>
        <div class="user-avatar" @click="goProfile">
          <img :src="userAvatar" alt="Avatar" />
        </div>
      </slot>
    </div>
  </header>
</template>

<script>
export default {
  name: "BaseNavBar",
  props: {
    theme: { type: String, default: 'default' },  // 主题名
    showSearch: { type: Boolean, default: true },
    showUpload: { type: Boolean, default: true },
    searchPlaceholder: { type: String, default: '搜索...' },
    userAvatar: { type: String, default: '' },
    leftAction: { type: String, default: 'home' }  // home/back/custom
  },
  computed: {
    themeClass() {
      return `navbar-${this.theme}`;
    }
  },
  methods: {
    handleLeftClick() {
      if (this.leftAction === 'home') this.$router.push('/');
      else if (this.leftAction === 'back') this.$router.back();
      else this.$emit('left-click');
    },
    goUpload() { this.$router.push('/upload'); },
    goProfile() { this.$router.push('/profile'); }
  }
}
</script>

<style scoped>
/* 基础布局（所有导航共用） */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s;
}

/* 主题样式（通过 class 区分） */
.navbar-default {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eee;
}

.navbar-detail {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid #FFE5D9;
  box-shadow: 0 4px 20px rgba(255, 183, 178, 0.1);
}

.navbar-event {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .navbar { padding: 12px 20px; }
  .nav-center { display: none; }
}
</style>
