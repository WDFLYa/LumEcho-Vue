<template>
  <div class="profile-page">
    <!-- 1. 导航栏：传入 isMe 控制按钮显示 -->
    <!-- 注意：因为导航栏是 sticky 的，它会自然占据文档流位置，不需要额外占位符 -->
    <ProfileNavBar
        :user-avatar="user.avatar"
        :user-name="user.username"
        :is-me="isMe"
        @edit="goToEdit"
        @follow="handleFollow"
        @profile="goToProfile"
    />

    <!-- 2. Hero 区域 (移除编辑按钮) -->
    <div class="hero-section">
      <!-- 背景漂浮图标 -->
      <div class="bg-shape shape-1">✨</div>
      <div class="bg-shape shape-2">🌸</div>
      <div class="bg-shape shape-3">🎈</div>

      <div class="hero-content">
        <div class="avatar-wrapper">
          <div class="avatar-ring"></div>
          <!-- ✅ 已移除悬浮编辑按钮 -->
          <img :src="user.avatar" class="user-avatar" onerror="this.src='http://localhost:9000/specialty/avatar.png'" />
        </div>

        <div class="info-block">
          <h1 class="username">{{ user.username }}</h1>
          <p class="account">@{{ user.account || 'lumecho_friend' }}</p>

          <div class="bio-box">
            <span class="bio-icon">💬</span>
            <p class="bio-text">{{ user.bio || '这个人很神秘，还没写简介... 但心里藏着星辰大海 ✨' }}</p>
          </div>

          <!-- 数据胶囊 -->
          <div class="stats-capsules">
            <div class="capsule">
              <span class="num">{{ stats.posts }}</span>
              <span class="label">📸 作品</span>
            </div>
            <div class="capsule highlight" @click="openList('followers')">
              <span class="num">{{ stats.followers }}</span>
              <span class="label">🥰 粉丝</span>
            </div>
            <div class="capsule" @click="openList('following')">
              <span class="num">{{ stats.following }}</span>
              <span class="label">👀 关注</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 内容区域 -->
    <div class="content-wrapper">
      <!-- Tab 切换 -->
      <div class="cute-tabs">
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'posts' }"
            @click="currentTab = 'posts'"
        >
          <span class="tab-icon">🎨</span> 全部作品
        </button>
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'liked' }"
            @click="currentTab = 'liked'"
        >
          <span class="tab-icon">❤️</span> 喜欢的
        </button>
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'collections' }"
            @click="currentTab = 'collections'"
        >
          <span class="tab-icon">⭐</span> 收藏夹
        </button>
      </div>

      <!-- 帖子网格 -->
      <div class="posts-grid" v-if="currentTab === 'posts'">
        <div v-if="loading" class="loading-dots">
          <span>✨</span><span>🌟</span><span>✨</span>
        </div>

        <div v-else-if="posts.length === 0" class="empty-state">
          <div class="empty-emoji">🕊️</div>
          <p>还没有发布任何灵感火花哦~</p>
          <button v-if="isMe" class="create-btn" @click="goToUpload">
            ✨ 去发布第一篇
          </button>
        </div>

        <div v-for="post in posts" :key="post.id" class="post-card" @click="goToDetail(post.id)">
          <div class="card-img-wrap">
            <img :src="post.coverImage" class="card-img" loading="lazy" />
            <div class="card-overlay">
              <span class="overlay-heart">🤍</span>
              <span class="overlay-num">{{ post.likeCount }}</span>
            </div>
          </div>
          <div class="card-body">
            <h4 class="card-title">{{ post.title }}</h4>
            <p class="card-desc">{{ truncate(post.content, 30) }}</p>
          </div>
        </div>
      </div>

      <!-- 其他 Tab -->
      <div v-else class="empty-state">
        <div class="empty-emoji">🚧</div>
        <p>功能正在快马加鞭制作中... (◍•ᴗ•◍)</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ProfileNavBar from '@/components/NavBar/ProfileNavBar.vue';

export default {
  name: "UserProfile",
  components: { ProfileNavBar },
  data() {
    return {
      userId: null,
      isMe: false,
      loading: true,
      user: { username: '加载中...', account: '', bio: '', avatar: 'http://localhost:9000/specialty/avatar.png' },
      stats: { posts: 0, followers: 128, following: 45 },
      posts: [],
      currentTab: 'posts'
    };
  },
  async mounted() {
    const routeId = this.$route.params.id;
    const currentUserId = localStorage.getItem('userId') || 1;

    if (!routeId || String(routeId) === String(currentUserId)) {
      this.userId = currentUserId;
      this.isMe = true;
      await this.fetchData();
    } else {
      this.userId = routeId;
      this.isMe = false;
      this.loading = false;
      return;
    }
    await this.fetchPosts();
    this.loading = false;
  },
  methods: {
    async fetchData() {
      try {
        const res = await axios.get('/api/user/getuserinfo');
        if (res.data.code === 200 || res.data.success) {
          const d = res.data.data;
          this.user = {
            username: d.username || '未命名',
            account: d.account || 'user',
            bio: d.bio || '',
            avatar: d.avatar || 'http://localhost:9000/specialty/avatar.png'
          };
        }
      } catch (e) { console.error(e); }
    },
    async fetchPosts() {
      setTimeout(() => {
        this.posts = [
          { id: 1, title: '春日野餐 🧺', content: '阳光、草地和美食', coverImage: 'https://picsum.photos/400/300?random=1', likeCount: 24 },
          { id: 2, title: '猫咪午睡 😽', content: '它睡得真香', coverImage: 'https://picsum.photos/400/300?random=2', likeCount: 56 },
        ];
        this.stats.posts = this.posts.length;
      }, 500);
    },
    goToEdit() { this.$router.push('/profile/edit'); },
    goToProfile() { this.$router.push('/profile'); },
    goToUpload() { this.$router.push('/upload'); },
    goToDetail(id) { this.$router.push(`/post/${id}`); },
    handleFollow() { alert("关注成功！(≧∇≦)"); },
    openList(type) { alert(`查看${type}列表...`); },
    truncate(str, len) { return str && str.length > len ? str.substring(0, len) + '...' : str; }
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #FAFAFA;
  font-family: 'Inter', system-ui, sans-serif;
  color: #444;
}

/* --- Hero Section --- */
.hero-section {
  position: relative;
  background: linear-gradient(180deg, #FFF0F5 0%, #FFFFFF 100%);
  /* 顶部 Padding 不需要特别大，因为导航栏一开始就占着位置 */
  padding: 60px 20px 40px;
  text-align: center;
  overflow: hidden;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  box-shadow: 0 10px 30px rgba(255, 183, 178, 0.15);
  margin-bottom: 40px;
}

.bg-shape {
  position: absolute;
  font-size: 2rem;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
  z-index: 1;
}
.shape-1 { top: 20px; left: 10%; animation-delay: 0s; }
.shape-2 { top: 40px; right: 15%; animation-delay: 2s; }
.shape-3 { bottom: 20px; left: 20%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(10deg); }
}

.hero-content { position: relative; z-index: 2; max-width: 800px; margin: 0 auto; }

.avatar-wrapper { position: relative; display: inline-block; margin-bottom: 20px; }
.user-avatar {
  width: 140px; height: 140px;
  border-radius: 50%;
  border: 5px solid #fff;
  box-shadow: 0 8px 20px rgba(255, 142, 142, 0.3);
  object-fit: cover;
  position: relative; z-index: 2;
}
.avatar-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 160px; height: 160px;
  border-radius: 50%;
  border: 2px dashed #FFB7B2;
  animation: spin 20s linear infinite;
  z-index: 1;
  pointer-events: none;
}
@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

.username { font-size: 2rem; font-weight: 800; color: #333; margin: 10px 0 5px; }
.account { color: #999; font-size: 1rem; margin: 0 0 20px; }

.bio-box {
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 25px;
  max-width: 90%;
}
.bio-icon { font-size: 1.2rem; }
.bio-text { margin: 0; color: #555; font-size: 0.95rem; line-height: 1.5; }

.stats-capsules { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
.capsule {
  background: #fff;
  padding: 10px 24px;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}
.capsule:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 142, 142, 0.2);
  border-color: #FFB7B2;
}
.capsule.highlight { background: linear-gradient(135deg, #FFF0F5 0%, #fff 100%); border-color: #FFB7B2; }
.num { font-size: 1.2rem; font-weight: 800; color: #333; }
.label { font-size: 0.75rem; color: #888; font-weight: 600; margin-top: 2px; }

/* --- Content Area --- */
.content-wrapper { max-width: 1200px; margin: 0 auto 60px; padding: 0 20px; }

.cute-tabs { display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; }
.tab-btn {
  background: #fff;
  border: 2px solid #f0f0f0;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}
.tab-btn.active {
  background: #222;
  color: #fff;
  border-color: #222;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.tab-btn:not(.active):hover { border-color: #FFB7B2; color: #FF8E8E; }

.posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 25px; }
.post-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  border: 1px solid #fafafa;
}
.post-card:hover { transform: translateY(-8px); box-shadow: 0 12px 25px rgba(255, 183, 178, 0.2); }
.card-img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #f5f5f5; }
.card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.post-card:hover .card-img { transform: scale(1.08); }
.card-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: #fff;
  display: flex; align-items: center; gap: 6px;
  opacity: 0; transition: opacity 0.3s;
}
.post-card:hover .card-overlay { opacity: 1; }
.overlay-heart { font-size: 16px; }
.overlay-num { font-size: 14px; font-weight: 700; }

.card-body { padding: 16px; }
.card-title { font-size: 1rem; font-weight: 700; color: #333; margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-desc { font-size: 0.85rem; color: #666; margin: 0 0 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.loading-dots { grid-column: 1 / -1; text-align: center; font-size: 2rem; padding: 40px; }
.loading-dots span { display: inline-block; animation: bounce 1.4s infinite ease-in-out both; }
.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

.empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #999; }
.empty-emoji { font-size: 4rem; margin-bottom: 15px; display: block; animation: float 3s ease-in-out infinite; }
.create-btn {
  margin-top: 20px;
  background: #222; color: #fff; border: none;
  padding: 12px 28px; border-radius: 50px;
  font-weight: 700; font-size: 14px; cursor: pointer;
  transition: transform 0.2s;
}
.create-btn:hover { transform: scale(1.05); background: #000; }

@media (max-width: 768px) {
  .hero-section { border-radius: 0 0 30px 30px; padding: 50px 20px 30px; }
  .user-avatar { width: 100px; height: 100px; }
  .avatar-ring { width: 120px; height: 120px; }
  .username { font-size: 1.5rem; }
  .posts-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .cute-tabs { gap: 8px; }
  .tab-btn { padding: 8px 12px; font-size: 0.85rem; }
  .tab-btn span { display: none; }
}
</style>