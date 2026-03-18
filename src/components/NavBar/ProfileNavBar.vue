<template>
  <header class="navbar">
    <!-- 左侧 Logo -->
    <div class="nav-left" @click="goHome">
      <h1 class="lumecho-logo-small">
        🌟 Lum<span>Echo!</span>
      </h1>
    </div>

    <!-- 中间装饰标语 -->
    <div class="nav-center-decoration">
      <span class="deco-text">✨ 记录美好瞬间 ✨</span>
    </div>

    <!-- 右侧操作区 -->
    <div class="nav-right">
      <!-- ✅ 场景 1: 是自己的主页 -> 显示“编辑资料” -->
      <button v-if="isMe" class="action-btn edit-mode" @click="handleEdit">
        <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span class="btn-text">编辑资料</span>
      </button>

      <!-- ✅ 场景 2: 是他人的主页 -> 显示“关注”或“已关注” -->
      <button
          v-else
          class="action-btn follow-mode"
          :class="{ 'is-following': isFollowed }"
          @click="handleFollow"
          :disabled="actionLoading"
          title="关注 TA"
      >
        <!-- 未关注时显示 + 号 -->
        <svg v-if="!isFollowed" class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>

        <!-- 已关注时显示 √ 号 -->
        <svg v-else class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>

        <span class="btn-text">{{ isFollowed ? '已关注' : '关注' }}</span>
      </button>

      <!-- 用户信息区域 (头像 + 名字) -->
      <div class="user-info" @click="$emit('profile')">
        <span class="user-name">{{ userName }}</span>
        <div class="user-avatar">
          <img :src="userAvatar" alt="Avatar" onerror="this.src='http://localhost:9000/specialty/avatar.png'" />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "ProfileNavBar",
  props: {
    userAvatar: { type: String, default: '' },
    userName: { type: String, default: '用户' },
    isMe: { type: Boolean, default: true },
    // 🔥 新增：接收是否已关注的状态
    isFollowed: { type: Boolean, default: false },
    // 🔥 新增：接收加载状态，防止重复点击
    actionLoading: { type: Boolean, default: false }
  },
  emits: ['edit', 'follow', 'profile'],
  methods: {
    goHome() {
      this.$router.push('/home');
    },
    handleEdit() {
      this.$emit('edit');
    },
    handleFollow() {
      if (this.actionLoading) return;
      // 抛出事件给父组件 (UserProfile) 处理具体逻辑
      this.$emit('follow');
    }
  }
};
</script>

<style scoped>
/* --- Navbar 基础样式 --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #FFE5D9;
  box-shadow: 0 4px 20px rgba(255, 183, 178, 0.1);
  transition: all 0.3s ease;
}

/* Logo */
.nav-left { flex: 1; }
.lumecho-logo-small {
  font-size: 1.5rem;
  font-weight: 800;
  color: #FF8E8E;
  cursor: pointer;
  margin: 0;
  transition: transform 0.2s;
  user-select: none;
}
.lumecho-logo-small:hover { transform: scale(1.05) rotate(-2deg); }
.lumecho-logo-small span { color: #6C63FF; -webkit-text-fill-color: #6C63FF; }

/* 中间装饰 */
.nav-center-decoration {
  flex: 2;
  text-align: center;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.deco-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #CCAAB8;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #FF8E8E, #CCAAB8, #FF8E8E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: shine 3s linear infinite;
}
@keyframes shine { to { background-position: 200% center; } }
@media (max-width: 768px) { .deco-text { display: none; } }

/* 右侧区域 */
.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

/* --- 按钮通用样式 --- */
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn-icon {
  transition: transform 0.3s;
}
.action-btn:hover .btn-icon {
  transform: scale(1.2) rotate(10deg);
}
.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* ✅ 编辑资料按钮 (黑色系) */
.edit-mode {
  background: #222;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.edit-mode:hover {
  background: #000;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

/* ✅ 关注按钮 (默认：粉色渐变) */
.follow-mode {
  background: linear-gradient(135deg, #FF8E8E 0%, #FF6B6B 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}
.follow-mode:hover {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.45);
}
.follow-mode:active {
  transform: scale(0.95);
}

/* ✅ 已关注状态 (白色底 + 灰字/粉边) */
.follow-mode.is-following {
  background: #fff;
  color: #FF6B6B;
  border: 2px solid #FF6B6B;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
}
.follow-mode.is-following:hover {
  background: #FFF0F5;
  border-color: #FF5252;
  color: #FF5252;
  transform: translateY(-2px);
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 8px;
  background: transparent;
}
.user-info:hover {
  background: rgba(255, 142, 142, 0.08);
  padding-left: 8px;
}
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
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
  background: #f0f0f0;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* --- 移动端适配 --- */
@media (max-width: 768px) {
  .navbar { padding: 12px 20px; }

  /* 移动端只显示图标，隐藏文字 */
  .btn-text { display: none; }
  .action-btn {
    padding: 8px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
  }

  .user-name { display: none; }
  .user-avatar { width: 32px; height: 32px; }
  .nav-right { gap: 12px; }
}
</style>