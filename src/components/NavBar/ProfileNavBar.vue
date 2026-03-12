<template>
  <header class="navbar">
    <!-- 左侧 Logo -->
    <div class="nav-left" @click="goHome">
      <h1 class="lumecho-logo-small">
        🌟 Lum<span>Echo!</span>
      </h1>
    </div>

    <!-- 中间装饰标语 (替代搜索框) -->
    <div class="nav-center-decoration">
      <span class="deco-text">✨ 记录美好瞬间 ✨</span>
    </div>

    <!-- 右侧操作区 -->
    <div class="nav-right">
      <!-- ✅ 权限控制：只有是自己主页 (isMe=true) 才显示“编辑资料” -->
      <button v-if="isMe" class="action-btn" @click="handleEdit">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span>编辑资料</span>
      </button>

      <!-- 如果是他人主页，显示“关注” (可选，不需要可删除这块) -->
      <button v-else class="action-btn follow-mode" @click="handleFollow">
        <span>+ 关注</span>
      </button>

      <!-- 用户信息区域 -->
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
  name: "ProfileNavBar",
  props: {
    userAvatar: String,
    userName: String,
    isMe: { type: Boolean, default: true } // 接收是否为自己的判断
  },
  methods: {
    goHome() { this.$router.push('/home'); },
    handleEdit() { this.$emit('edit'); },
    handleFollow() {
      this.$emit('follow');
      alert("关注功能开发中~ (◍•ᴗ•◍)");
    }
  }
};
</script>

<style scoped>
/* --- Navbar 样式 (关键：Sticky) --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;

  /* ✅ 核心代码：粘性定位 */
  position: sticky;
  top: 0;
  z-index: 1000;

  /* 背景与模糊效果 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* 边框与阴影 */
  border-bottom: 1px solid #FFE5D9;
  box-shadow: 0 4px 20px rgba(255, 183, 178, 0.1);

  transition: all 0.3s ease;
}

/* Logo 样式 */
.nav-left { flex: 1; }
.lumecho-logo-small {
  font-size: 1.5rem;
  font-weight: 800;
  color: #FF8E8E;
  cursor: pointer;
  margin: 0;
  transition: transform 0.2s;
}
.lumecho-logo-small:hover { transform: scale(1.05) rotate(-2deg); }
.lumecho-logo-small span { color: #6C63FF; -webkit-text-fill-color: #6C63FF; }

/* 中间装饰 */
.nav-center-decoration {
  flex: 2;
  text-align: center;
  display: flex;
  justify-content: center;
}
.deco-text {
  font-size: 1rem;
  font-weight: 600;
  color: #CCAAB8;
  letter-spacing: 1px;
}
@media (max-width: 768px) { .deco-text { display: none; } }

/* 右侧区域 */
.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

/* 按钮样式 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}
.action-btn:hover { transform: translateY(-2px); background: #000; }

/* 关注按钮特殊色 */
.action-btn.follow-mode { background: #FF8E8E; }
.action-btn.follow-mode:hover { background: #FF6B6B; }

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 8px;
}
.user-info:hover { background: rgba(255, 142, 142, 0.1); }
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-info:hover .user-name { color: #FF8E8E; }
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar { padding: 12px 20px; }
  .action-btn span { display: none; }
  .action-btn { padding: 8px 12px; border-radius: 50%; }
  .user-name { display: none; }
  .user-avatar { width: 32px; height: 32px; }
  .nav-right { gap: 10px; }
}
</style>