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

      <!-- 🔥 AI 摄影师咨询：只在他人主页 + 是摄影师 显示 -->
      <button
          v-if="!isMe && isPhotographer"
          class="action-btn ai-chat-mode"
          @click="goAIChat"
      >
        <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L2 21l2.1-6.3a8.38 8.38 0 0 1 .9-3.8 8.5 8.5 0 0 1 7.6-4.7 8.38 8.38 0 0 1 3.8.9z"></path>
          <line x1="8" y1="12" x2="16" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="16"></line>
        </svg>
        <span class="btn-text">摄影师咨询</span>
      </button>

      <!-- 编辑资料 -->
      <button v-if="isMe" class="action-btn edit-mode" @click="handleEdit">
        <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span class="btn-text">编辑资料</span>
      </button>

      <!-- 关注按钮 -->
      <button
          v-else
          class="action-btn follow-mode"
          :class="{ 'is-following': isFollowed }"
          @click="handleFollow"
          :disabled="actionLoading"
      >
        <svg v-if="!isFollowed" class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <svg v-else class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="btn-text">{{ isFollowed ? '已关注' : '关注' }}</span>
      </button>

      <!-- 用户信息 -->
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
    isFollowed: { type: Boolean, default: false },
    actionLoading: { type: Boolean, default: false },
    isPhotographer: { type: Boolean, default: false }
  },
  emits: ['edit', 'follow', 'profile'],
  methods: {
    goHome() {
      this.$router.push('/home');
    },
    // 🔥 进入 AI 摄影师咨询页面（带摄影师ID）
    goAIChat() {
      const photographerId = this.$route.params.id;
      this.$router.push(`/ai/chat/${photographerId}`);
    },
    handleEdit() {
      this.$emit('edit');
    },
    handleFollow() {
      if (this.actionLoading) return;
      this.$emit('follow');
    }
  }
};
</script>

<style scoped>
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
  border-bottom: 1px solid #FFE5D9;
  box-shadow: 0 4px 20px rgba(255, 183, 178, 0.1);
  transition: all 0.3s ease;
}

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
.lumecho-logo-small span { color: #6C63FF; }

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
  background: linear-gradient(90deg, #FF8E8E, #CCAAB8, #FF8E8E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: shine 3s linear infinite;
}
@keyframes shine { to { background-position: 200% center; } }
@media (max-width: 768px) { .deco-text { display: none; } }

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

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
}
.btn-icon { transition: transform 0.3s; }
.action-btn:hover .btn-icon { transform: scale(1.2) rotate(10deg); }
.action-btn:disabled { opacity: 0.7; cursor: not-allowed; }

/* 编辑按钮 */
.edit-mode {
  background: #222;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.edit-mode:hover {
  background: #000;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
}

/* 关注按钮 */
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
}

/* 🔥 AI 咨询按钮 */
.action-btn.ai-chat-mode {
  background: linear-gradient(135deg, #7B61FF 0%, #6C63FF 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(123, 97, 255, 0.25);
}
.action-btn.ai-chat-mode:hover {
  background: linear-gradient(135deg, #6C63FF 0%, #5951FF 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(123, 97, 255, 0.35);
}

/* ========== ✅ 修复名字竖排问题 ========== */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 8px;
  flex-shrink: 0;
}
.user-info:hover {
  background: rgba(255, 142, 142, 0.08);
}
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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

@media (max-width: 768px) {
  .navbar { padding: 12px 20px; }
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
}
</style>