<template>
  <div class="profile-page">
    <!-- 导航栏 -->
    <ProfileNavBar
        :user-avatar="user.avatar"
        :user-name="user.username"
        :is-me="isMe"
        @edit="goToEdit"
        @follow="handleFollow"
        @profile="goToProfile"
    />

    <!-- Hero 区域 (用户信息) -->
    <div class="hero-section">
      <div class="bg-shape shape-1">✨</div>
      <div class="bg-shape shape-2">🌸</div>
      <div class="bg-shape shape-3">🎈</div>

      <div class="hero-content">
        <div class="avatar-wrapper">
          <div class="avatar-ring"></div>
          <img
              :src="user.avatar"
              class="user-avatar"
              alt="avatar"
              onerror="this.src='http://localhost:9000/specialty/avatar.png'"
          />
        </div>

        <div class="info-block">
          <h1 class="username">{{ user.username }}</h1>

          <div class="bio-box" v-if="user.bio">
            <span class="bio-icon">💬</span>
            <p class="bio-text">{{ user.bio }}</p>
          </div>
          <div class="bio-box" v-else style="opacity: 0.6;">
            <span class="bio-icon">🤫</span>
            <p class="bio-text">这个人很神秘，还没写简介...</p>
          </div>

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

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 选项卡 -->
      <div class="cute-tabs">
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'posts' }"
            @click="switchTab('posts')"
        >
          <span class="tab-icon">🎨</span> 全部作品
        </button>
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'liked' }"
            @click="switchTab('liked')"
        >
          <span class="tab-icon">❤️</span> 喜欢的
        </button>
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'collections' }"
            @click="switchTab('collections')"
        >
          <span class="tab-icon">⭐</span> 收藏夹
        </button>
      </div>

      <!-- 帖子列表 (Posts Tab) -->
      <div class="posts-grid" v-if="currentTab === 'posts'">

        <!-- 加载中 (首次加载) -->
        <div v-if="loading && posts.length === 0" class="loading-container">
          <div class="loading-dots">
            <span>✨</span><span>🌟</span><span>✨</span>
          </div>
          <p class="loading-text">正在捕捉灵感火花...</p>
        </div>

        <!-- 帖子卡片 -->
        <div
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            @click="goToDetail(post.id)"
        >
          <div class="card-img-wrap">
            <!-- 封面图 -->
            <img
                :src="post.cover || 'http://localhost:9000/lumecho/avatar.png'"
                class="card-img"
                loading="lazy"
                alt="cover"
                onerror="this.src='http://localhost:9000/lumecho/avatar.png'"
            />

            <!-- 🔥 悬浮层显示点赞评论数 -->
            <div class="card-overlay">
              <span class="overlay-heart">❤️</span>
              <span class="overlay-num">{{ post.likes ?? 0 }}</span>
              <span style="margin: 0 8px;">·</span>
              <span class="overlay-heart">💬</span>
              <span class="overlay-num">{{ post.comments ?? 0 }}</span>
            </div>
          </div>

          <div class="card-body">
            <h4 class="card-title">{{ post.title }}</h4>
            <p class="card-desc">{{ post.summary || truncate(post.content, 30) }}</p>
            <div class="card-meta">
              <span class="time-tag">{{ post.timeAgo }}</span>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 / 没有更多了 -->
        <div v-if="!loading && hasMore" class="load-more-trigger" @click="loadMore">
          <button class="load-more-btn">
            ✨ 加载更多灵感
          </button>
        </div>

        <div v-if="!loading && !hasMore && posts.length > 0" class="no-more-text">
          ~ 已经到底啦，休息一下吧 ~ 🍵
        </div>

        <!-- 空状态 (没有帖子) -->
        <div v-if="!loading && posts.length === 0" class="empty-state">
          <div class="empty-emoji">🕊️</div>
          <p class="empty-text">{{ isMe ? '还没有发布任何灵感火花哦~' : 'Ta 还没有发布任何作品呢...' }}</p>
          <button v-if="isMe" class="create-btn" @click="goToUpload">
            ✨ 去发布第一篇
          </button>
        </div>
      </div>

      <!-- 🔥 喜欢的帖子列表 (Liked Tab) -->
      <div class="posts-grid" v-else-if="currentTab === 'liked'">

        <!-- 加载中 -->
        <div v-if="loadingLiked && likedPosts.length === 0" class="loading-container">
          <div class="loading-dots">
            <span>✨</span><span>🌟</span><span>✨</span>
          </div>
          <p class="loading-text">正在捕捉灵感火花...</p>
        </div>

        <!-- 帖子卡片 -->
        <div
            v-for="post in likedPosts"
            :key="post.id"
            class="post-card"
            @click="goToDetail(post.id)"
        >
          <div class="card-img-wrap">
            <!-- 封面图 -->
            <img
                :src="post.cover || 'http://localhost:9000/lumecho/avatar.png'"
                class="card-img"
                loading="lazy"
                alt="cover"
                onerror="this.src='http://localhost:9000/lumecho/avatar.png'"
            />

            <!-- 🔥 悬浮层显示点赞评论数 -->
            <div class="card-overlay">
              <span class="overlay-heart">❤️</span>
              <span class="overlay-num">{{ post.likes ?? 0 }}</span>
              <span style="margin: 0 8px;">·</span>
              <span class="overlay-heart">💬</span>
              <span class="overlay-num">{{ post.comments ?? 0 }}</span>
            </div>
          </div>

          <div class="card-body">
            <h4 class="card-title">{{ post.title }}</h4>

            <!-- 🔥 新增：作者信息 -->
            <div class="card-author">
              <img
                  :src="post.avatar || 'http://localhost:9000/lumecho/avatar.png'"
                  class="author-mini-avatar"
                  alt="author"
                  onerror="this.src='http://localhost:9000/lumecho/avatar.png'"
              />
              <span class="author-name">{{ post.username }}</span>
            </div>

            <div class="card-meta">
              <span class="time-tag">{{ post.timeAgo }}</span>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 / 没有更多了 -->
        <div v-if="!loadingLiked && hasMoreLiked" class="load-more-trigger" @click="loadMoreLiked">
          <button class="load-more-btn">
            ✨ 加载更多灵感
          </button>
        </div>

        <div v-if="!loadingLiked && !hasMoreLiked && likedPosts.length > 0" class="no-more-text">
          ~ 已经到底啦，休息一下吧 ~ 🍵
        </div>

        <!-- 空状态 (没有点赞) -->
        <div v-if="!loadingLiked && likedPosts.length === 0" class="empty-state">
          <div class="empty-emoji">💔</div>
          <p class="empty-text">{{ isMe ? '还没有点赞过任何作品哦~' : 'Ta 还没有点赞过任何作品呢...' }}</p>
        </div>
      </div>

      <!-- 其他 Tab 的空状态 -->
      <div v-else class="empty-state other-tab-empty">
        <div class="empty-emoji">🚧</div>
        <p class="empty-text">功能正在快马加鞭制作中... (◍•ᴗ•◍)</p>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileNavBar from '@/components/NavBar/ProfileNavBar.vue';
import { getCurrentUserInfo, getUserById } from '@/api/auth';
import { getUserPostsApi, getUserLikedPostsApi } from '@/api/post';

export default {
  name: "UserProfile",
  components: { ProfileNavBar },
  data() {
    return {
      targetUserId: null,
      isMe: false,
      loading: true,
      loadingLiked: false,

      // 用户信息
      user: {
        username: '加载中...',
        bio: '',
        avatar: 'http://localhost:9000/specialty/avatar.png'
      },
      stats: { posts: 0, followers: 0, following: 0 },

      // 帖子相关 (全部作品)
      posts: [],
      currentTab: 'posts',
      offset: 0,
      limit: 8,
      hasMore: true,
      isLoadingMore: false,

      // 点赞帖子相关
      likedPosts: [],
      offsetLiked: 0,
      hasMoreLiked: true,
      isLoadingMoreLiked: false
    };
  },
  async mounted() {
    await this.initPage();
  },
  methods: {
    // 初始化页面逻辑
    async initPage() {
      const routeId = this.$route.params.id;
      let localUserId = localStorage.getItem('userId');

      if (!routeId || (localUserId && String(routeId) === String(localUserId))) {
        this.isMe = true;
        if (!localUserId) {
          await this.fetchMyInfoAndSaveId();
        } else {
          this.targetUserId = localUserId;
          await this.loadUserInfo(true);
        }
      } else {
        this.isMe = false;
        this.targetUserId = routeId;
        await this.loadUserInfo(false);
      }

      // 只有获取到 userId 后才加载帖子
      if (this.targetUserId) {
        await this.fetchPosts(true);
      }
      this.loading = false;
    },

    async fetchMyInfoAndSaveId() {
      try {
        const res = await getCurrentUserInfo();
        if (res.data.code === 200) {
          const data = res.data.data;
          this.targetUserId = data.id;
          localStorage.setItem('userId', data.id);
          this.mapUserData(data);
        }
      } catch (e) {
        this.$message.error('请先登录');
        this.$router.push('/login');
      }
    },

    async loadUserInfo(isMine) {
      try {
        let res;
        if (isMine) {
          res = await getCurrentUserInfo();
        } else {
          res = await getUserById(this.targetUserId);
        }

        if (res.data.code === 200) {
          this.mapUserData(res.data.data);
        } else {
          this.user.username = '用户不存在';
        }
      } catch (e) {
        this.user.username = '加载失败';
      }
    },

    mapUserData(data) {
      this.user = {
        username: data.username || '未命名',
        bio: data.bio || '',
        avatar: data.avatar || 'http://localhost:9000/specialty/avatar.png'
      };
    },

    // ✅ 核心：获取帖子列表（全部作品）
    async fetchPosts(isReset = false) {
      if (!this.targetUserId) return;

      if (isReset) {
        this.offset = 0;
        this.posts = [];
        this.hasMore = true;
        this.isLoadingMore = false;
      }

      if (this.isLoadingMore || !this.hasMore) return;

      this.isLoadingMore = true;

      try {
        const res = await getUserPostsApi({
          userId: this.targetUserId,
          offset: this.offset,
          limit: this.limit
        });

        if (res.data.code === 200) {
          const responseData = res.data.data;
          const newList = responseData.data || [];

          const formattedList = newList.map(item => ({
            ...item,
            likes: item.likes ?? item.likeCount ?? 0,
            comments: item.comments ?? item.commentCount ?? 0,
            views: item.views ?? 0,
            cover: item.cover || item.imageUrls?.[0] || 'http://localhost:9000/lumecho/avatar.png',
            timeAgo: item.timeAgo || this.formatTimeAgo(item.createTime) || '刚刚',
            title: item.title || '无标题',
            content: item.content || '',
            categoryId: item.categoryId,
            category: item.category || '综合'
          }));

          this.posts = [...this.posts, ...formattedList];

          if (isReset && responseData.total !== undefined) {
            this.stats.posts = responseData.total;
          } else if (isReset) {
            this.stats.posts = formattedList.length;
          }

          this.hasMore = responseData.hasMore;

          if (formattedList.length > 0) {
            this.offset += this.limit;
          }
        }
      } catch (error) {
        console.error('加载帖子失败:', error);
        this.$message.error('加载失败，请重试');
      } finally {
        this.isLoadingMore = false;
      }
    },

    // 🔥 新增：获取点赞帖子列表
    async fetchLikedPosts(isReset = false) {
      if (!this.targetUserId) return;

      if (isReset) {
        this.offsetLiked = 0;
        this.likedPosts = [];
        this.hasMoreLiked = true;
        this.isLoadingMoreLiked = false;
      }

      if (this.isLoadingMoreLiked || !this.hasMoreLiked) return;

      this.isLoadingMoreLiked = true;
      this.loadingLiked = true;

      try {
        const res = await getUserLikedPostsApi({
          userId: this.targetUserId,
          offset: this.offsetLiked,
          limit: this.limit
        });

        if (res.data.code === 200) {
          const responseData = res.data.data;
          const newList = responseData.data || [];

          const formattedList = newList.map(item => ({
            ...item,
            likes: item.likes ?? item.likeCount ?? 0,
            comments: item.comments ?? item.commentCount ?? 0,
            views: item.views ?? 0,
            cover: item.cover || item.imageUrls?.[0] || 'http://localhost:9000/lumecho/avatar.png',
            timeAgo: item.timeAgo || this.formatTimeAgo(item.createTime) || '刚刚',
            title: item.title || '无标题',
            content: item.content || '',
            username: item.username || '神秘用户',
            avatar: item.avatar || 'http://localhost:9000/lumecho/avatar.png'
          }));

          this.likedPosts = [...this.likedPosts, ...formattedList];
          this.hasMoreLiked = responseData.hasMore;

          if (formattedList.length > 0) {
            this.offsetLiked += this.limit;
          }
        }
      } catch (error) {
        console.error('加载点赞列表失败:', error);
        this.$message.error('加载失败，请重试');
      } finally {
        this.isLoadingMoreLiked = false;
        this.loadingLiked = false;
      }
    },

    // 加载更多 (全部作品)
    loadMore() {
      this.fetchPosts(false);
    },

    // 🔥 加载更多 (点赞列表)
    loadMoreLiked() {
      this.fetchLikedPosts(false);
    },

    switchTab(tab) {
      if (this.currentTab === tab) return;
      this.currentTab = tab;

      // 切换到全部作品
      if (tab === 'posts' && this.posts.length === 0 && !this.loading) {
        this.fetchPosts(true);
      }

      // 🔥 切换到喜欢的
      if (tab === 'liked' && this.likedPosts.length === 0 && !this.loadingLiked) {
        this.fetchLikedPosts(true);
      }
    },

    goToEdit() { this.$router.push('/profile/edit'); },
    goToProfile() { this.$router.push('/profile'); },
    goToUpload() { this.$router.push('/upload'); },
    goToDetail(id) { this.$router.push(`/post/${id}`); },
    handleFollow() { this.$message.success("关注成功！(≧∇≦)"); },
    openList(type) { this.$message.info(`查看${type}列表功能开发中...`); },

    truncate(str, len) {
      if (!str) return '';
      return str.length > len ? str.substring(0, len) + '...' : str;
    },

    formatTimeAgo(dateStr) {
      if (!dateStr) return '刚刚';
      const now = new Date();
      const past = new Date(dateStr);
      const diff = now - past;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 30) return `${days}天前`;
      return `${past.getMonth() + 1}/${past.getDate()}`;
    }
  }
};
</script>

<style scoped>
/* --- 基础布局 --- */
.profile-page {
  min-height: 100vh;
  background: #FAFAFA;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #444;
  padding-bottom: 60px;
}

/* --- Hero 区域 --- */
.hero-section {
  position: relative;
  background: linear-gradient(180deg, #FFF0F5 0%, #FFFFFF 100%);
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
  user-select: none;
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
  width: 120px; height: 120px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 8px 20px rgba(255, 142, 142, 0.3);
  object-fit: cover;
  position: relative; z-index: 2;
  background-color: #f0f0f0;
  transition: transform 0.3s;
}
.user-avatar:hover { transform: scale(1.05); }

.avatar-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 140px; height: 140px;
  border-radius: 50%;
  border: 2px dashed #FFB7B2;
  animation: spin 20s linear infinite;
  z-index: 1;
  pointer-events: none;
}
@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

.username { font-size: 1.8rem; font-weight: 800; color: #333; margin: 10px 0 5px; letter-spacing: -0.5px; }

.bio-box {
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin: 15px 0 25px;
  max-width: 90%;
  border: 1px solid #f5f5f5;
}
.bio-icon { font-size: 1.1rem; flex-shrink: 0; }
.bio-text { margin: 0; color: #555; font-size: 0.9rem; line-height: 1.5; text-align: left; }

.stats-capsules { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.capsule {
  background: #fff;
  padding: 8px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid #f0f0f0;
}
.capsule:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(255, 142, 142, 0.2);
  border-color: #FFB7B2;
}
.capsule.highlight { background: linear-gradient(135deg, #FFF0F5 0%, #fff 100%); border-color: #FFB7B2; }
.num { font-size: 1.1rem; font-weight: 800; color: #333; }
.label { font-size: 0.7rem; color: #888; font-weight: 600; margin-top: 2px; text-transform: uppercase; }

/* --- 内容区域 --- */
.content-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.cute-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
  position: sticky;
  top: 20px;
  z-index: 10;
  background: rgba(250, 250, 250, 0.9);
  backdrop-filter: blur(10px);
  padding: 10px 0;
}
.tab-btn {
  background: #fff;
  border: 2px solid #f0f0f0;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}
.tab-btn.active {
  background: #222;
  color: #fff;
  border-color: #222;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.tab-btn:not(.active):hover {
  border-color: #FFB7B2;
  color: #FF8E8E;
  background: #FFF0F5;
}

/* --- 帖子网格 --- */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  padding-bottom: 40px;
}

.post-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  border: 1px solid #fafafa;
  display: flex;
  flex-direction: column;
}
.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(255, 183, 178, 0.25);
  border-color: #ffe0e0;
}

.card-img-wrap {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #f5f5f5;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.post-card:hover .card-img { transform: scale(1.1); }

.card-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 12px 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
}
.post-card:hover .card-overlay {
  opacity: 1;
  transform: translateY(0);
}
.overlay-heart { font-size: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
.overlay-num { font-size: 14px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

.card-body {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 🔥 新增：作者信息样式 */
.card-author {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.author-mini-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}
.author-name {
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.card-desc {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.card-meta {
  display: flex;
  justify-content: flex-end;
}
.time-tag {
  font-size: 0.7rem;
  color: #999;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
}

/* --- 加载与空状态 --- */
.loading-container {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #999;
}
.loading-dots { font-size: 2.5rem; margin-bottom: 10px; }
.loading-dots span {
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}
.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.load-more-trigger {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 20px;
}
.load-more-btn {
  background: #fff;
  border: 2px solid #FFB7B2;
  color: #FF8E8E;
  padding: 10px 30px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 183, 178, 0.2);
}
.load-more-btn:hover {
  background: #FFB7B2;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 183, 178, 0.4);
}

.no-more-text {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  margin-top: 30px;
  font-style: italic;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: #999;
  background: #fff;
  border-radius: 24px;
  border: 2px dashed #f0f0f0;
}
.other-tab-empty {
  background: transparent;
  border: none;
  padding: 40px 20px;
}
.empty-emoji {
  font-size: 4.5rem;
  margin-bottom: 20px;
  display: block;
  animation: float 3s ease-in-out infinite;
}
.empty-text {
  font-size: 1.1rem;
  color: #888;
  margin-bottom: 25px;
}
.create-btn {
  background: #222;
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.create-btn:hover {
  transform: scale(1.05);
  background: #000;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

/* --- 移动端适配 --- */
@media (max-width: 768px) {
  .hero-section { border-radius: 0 0 30px 30px; padding: 40px 20px 30px; }
  .user-avatar { width: 90px; height: 90px; }
  .avatar-ring { width: 110px; height: 110px; }
  .username { font-size: 1.4rem; }
  .posts-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .cute-tabs { top: 0; background: rgba(250, 250, 250, 0.95); }
  .tab-btn { padding: 6px 12px; font-size: 0.8rem; }
  .tab-btn .tab-icon { display: none; }
  .card-title { font-size: 0.85rem; }
  .card-desc { font-size: 0.75rem; -webkit-line-clamp: 2; }
}
</style>
