<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <HomeNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
        @upload="goUpload"
        @profile="goProfile"
    />

    <main class="content-wrapper">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <!-- 左侧：Tab 切换 + 特别活动入口 -->
        <div class="filter-left-group">
          <!-- 1. 基础 Tab -->
          <div class="tabs">
            <button :class="['tab-item', { active: activeTab === 'latest' }]" @click="switchTab('latest')">
              🕒 最新发现
            </button>
            <button :class="['tab-item', { active: activeTab === 'hot' }]" @click="switchTab('hot')">
              🔥 热门榜单
            </button>
          </div>

          <!-- 2. 特别行动区 -->
          <div class="special-actions">
            <button class="action-pill activity-btn" @click="goActivity" title="参加摄影活动">
              <span class="pill-icon">📸</span>
              <span class="pill-text">摄影活动</span>
            </button>
            <button class="action-pill challenge-btn" @click="goChallenge" title="加入挑战赛">
              <span class="pill-icon">🏆</span>
              <span class="pill-text">挑战赛</span>
            </button>
          </div>
        </div>

        <!-- 右侧：分类标签 -->
        <div class="categories">
          <span
              class="cat-tag"
              :class="{ active: selectedCategoryId === null }"
              @click="selectCategory(null)"
          >
            <span class="cat-icon">🌐</span> 全部
          </span>
          <span
              class="cat-tag"
              v-for="cat in categoryList"
              :key="cat.id"
              :class="{ active: selectedCategoryId === cat.id }"
              @click="selectCategory(cat)"
          >
            <span class="cat-icon">{{ categoryIconMap[cat.name] || defaultIcon }}</span>
            {{ cat.name }}
          </span>
        </div>
      </div>

      <!-- ✨ 搜索状态提示条 (当有搜索词时显示) -->
      <div v-if="searchQuery" class="search-status-bar">
        <div class="search-info">
          <span class="search-icon-small">🔍</span>
          <span>正在搜索：<strong>"{{ searchQuery }}"</strong></span>
        </div>
        <button class="clear-search-btn" @click="clearSearch" title="清除搜索">
          ✕ 清除
        </button>
      </div>

      <!-- 帖子列表 -->
      <div class="posts-grid">
        <div
            class="post-card"
            v-for="post in posts"
            :key="post.id"
            :id="'post-' + post.id"
            @click="goDetail(post.id)"
        >
          <div class="card-image-wrapper">
            <img
                :src="post.cover || defaultCover"
                :alt="post.title"
                class="card-cover"
                loading="lazy"
                @error="$event.target.src = defaultCover"
            />
          </div>

          <div class="card-info">
            <h3 class="post-title">{{ post.title || '无标题帖子' }}</h3>

            <div class="post-meta">
              <div class="author-info">
                <img :src="post.avatar" class="mini-avatar" alt="author" @error="$event.target.src = defaultAvatar" />
                <span class="author-name">{{ post.username }}</span>
              </div>

              <div class="stats">
                <span
                    class="stat-item like-stat"
                    :class="{ 'is-liked': post.isLiked }"
                    title="点赞"
                    @click.stop="toggleLikeInList(post)"
                >
                  <span class="like-icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
                  <span class="like-count">{{ post.likes || 0 }}</span>
                </span>
                <span class="stat-item" title="评论">
                  💬 {{ post.comments || 0 }}
                </span>
              </div>
            </div>

            <div class="card-footer">
              <span class="category-badge">
                {{ categoryIconMap[post.category] || '🏷️' }} {{ post.category || '综合' }}
              </span>
              <span class="time-ago">{{ post.timeAgo || '刚刚' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 / 无数据提示 -->
      <div class="load-more-container" v-if="hasMore">
        <button class="load-more-btn" @click="loadMore" :disabled="loading">
          {{ loading ? '加载中...' : '✨ 加载更多灵感' }}
        </button>
      </div>
      <div class="no-more" v-else-if="posts.length > 0">
        <p>已经到底啦，喝杯奶茶休息一下吧 🧋</p>
      </div>
      <div class="no-more" v-else-if="!loading">
        <p>暂无内容，快去发布第一篇吧！📝</p>
      </div>
    </main>

    <!-- 🔥 完善资料弹窗 -->
    <transition name="modal-fade">
      <div v-if="showCompleteProfileModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <span class="modal-icon">✨</span>
            <h3 class="modal-title">完善你的个人资料</h3>
            <p class="modal-subtitle">设置昵称和头像，让大家认识你吧～</p>
          </div>

          <div class="modal-body">
            <div class="tip-item">
              <span class="tip-icon">1.</span>
              <span>设置一个好听的昵称</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">2.</span>
              <span>上传专属头像，更有辨识度</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">3.</span>
              <span>完整资料更受大家欢迎</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-later" @click="closeModal">稍后再说</button>
            <button class="btn-go" @click="goToProfileEdit">立即完善</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { getHomePosts, getCurrentUserInfo } from "@/api/auth";
import HomeNavBar from "@/components/NavBar/HomeNavBar.vue";
import { getAllCategories } from '@/api/category';
import { getLikeStatuses, toggleLike } from '@/api/post';
import { ElMessage } from 'element-plus';

export default {
  name: "HomePage",
  components: { HomeNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: '神秘摄影师',

      showCompleteProfileModal: false,

      searchQuery: '',
      activeTab: 'latest',
      selectedCategoryId: null,
      categoryList: [],
      categoryIconMap: {
        '日常': '🏠',
        '技术': '💻',
        '美食': '🍜',
        '旅行': '✈️',
        '摸鱼': '🛌',
        '摄影': '📸',
        '综合': '🏷️'
      },
      defaultIcon: '📁',
      posts: [],
      hasMore: true,
      loading: false,
      offset: 0,
      limit: 8,
      defaultCover: 'http://localhost:9000/lumecho/cover.png',
      defaultAvatar: 'http://localhost:9000/lumecho/avatar.png'
    };
  },
  mounted() {
    // 🔥 修复BUG：这里已经注释掉，防止和 activated 重复请求
    // this.fetchPosts();
    this.fetchUserInfo();
    this.fetchCategories();
  },
  activated() {
    // 🔥 每次回到主页：强制刷新用户信息 + 帖子数据（实时同步）
    this.fetchUserInfo();
    this.resetList();

    const lastPostId = sessionStorage.getItem("lastPostId");
    if (!lastPostId) return;
    this.$nextTick(() => {
      const el = document.getElementById("post-" + lastPostId);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "center" });
      }
      sessionStorage.removeItem("lastPostId");
    });
  },
  methods: {
    goUpload() { this.$router.push("/upload"); },
    goProfile() { this.$router.push("/profile"); },
    goDetail(id) {
      sessionStorage.setItem("lastPostId", id);
      this.$router.push(`/post/${id}`);
    },
    goActivity() { this.$router.push('/activity'); },
    goChallenge() { this.$router.push('/challenge'); },

    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.resetList();
    },

    selectCategory(cat) {
      const newId = cat ? cat.id : null;
      if (this.selectedCategoryId === newId) return;
      this.selectedCategoryId = newId;
      this.resetList();
    },

    handleSearch(query) {
      this.searchQuery = query || '';
      this.resetList();
      if (this.searchQuery) {
        ElMessage.success(`正在搜索 "${this.searchQuery}"...`);
      } else {
        ElMessage.info('已显示全部内容');
      }
    },

    clearSearch() {
      this.searchQuery = '';
      this.resetList();
      ElMessage.info('已清除搜索条件');
    },

    resetList() {
      this.offset = 0;
      this.posts = [];
      this.hasMore = true;
      this.loading = false;
      this.fetchPosts();
    },

    loadMore() {
      if (!this.loading && this.hasMore) {
        this.fetchPosts();
      }
    },

    async toggleLikeInList(post) {
      const token = localStorage.getItem('user_token');
      if (!token) {
        ElMessage.warning('您尚未登录，请先登录');
        this.$router.push('/login');
        return;
      }
      const originalLiked = post.isLiked;
      const originalCount = post.likes;
      post.isLiked = !originalLiked;
      post.likes = originalLiked ? originalCount - 1 : originalCount + 1;
      try {
        await toggleLike(post.id);
      } catch (error) {
        console.error("点赞操作失败", error);
        post.isLiked = originalLiked;
        post.likes = originalCount;
        if (error.response && error.response.status === 401) {
          ElMessage.warning('登录已过期，请重新登录');
        } else {
          ElMessage.warning('操作失败，请稍后重试');
        }
      }
    },

    async fetchCategories() {
      try {
        const res = await getAllCategories();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (Array.isArray(data)) {
          this.categoryList = data;
        }
      } catch (e) {
        console.error("获取分类失败", e);
      }
    },

    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) {
          // 强制使用最新资料，不兜底旧数据
          this.currentUserName = data.username;
          this.currentUserAvatar = data.avatar;
        }
      } catch (e) {
        /* 忽略未登录 */
      }

      this.checkUserProfileComplete();
    },

    checkUserProfileComplete() {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      if (
          !this.currentUserName ||
          this.currentUserName === '神秘摄影师' ||
          this.currentUserAvatar === 'http://localhost:9000/lumecho/avatar.png'
      ) {
        setTimeout(() => {
          this.showCompleteProfileModal = true;
        }, 500);
      }
    },

    closeModal() {
      this.showCompleteProfileModal = false;
    },

    goToProfileEdit() {
      this.closeModal();
      this.$router.push('/profile/edit');
    },

    async fetchPosts() {
      if (this.loading) return;
      this.loading = true;
      try {
        const sortParam = this.activeTab === 'latest' ? 'time' : 'hot';
        const params = {
          sort: sortParam,
          offset: this.offset,
          limit: this.limit,
          keyword: this.searchQuery ? this.searchQuery : undefined,
        };
        if (this.selectedCategoryId !== null) {
          params.categoryId = this.selectedCategoryId;
        }
        const res = await getHomePosts(params);
        const responseData = res.data.code === 200 ? res.data.data : res.data;
        let newPosts = responseData.data || [];
        newPosts = newPosts.map(item => ({
          ...item,
          avatar: item.authorAvatar || item.avatar || this.defaultAvatar,
          username: item.username || item.authorName || '神秘摄影师',
          cover: (item.cover && item.cover.trim()) ? item.cover : this.defaultCover,
          title: item.title || '无标题帖子',
          likes: item.likes || 0,
          comments: item.comments || 0,
          category: item.category || '综合',
          categoryId: item.categoryId,
          timeAgo: item.timeAgo || '刚刚',
          isLiked: false
        }));
        const token = localStorage.getItem('user_token');
        if (token && newPosts.length > 0) {
          try {
            const postIds = newPosts.map(p => p.id);
            const statusRes = await getLikeStatuses(postIds);
            let likeMap = {};
            const sData = statusRes.data.code === 200 ? statusRes.data.data : statusRes.data;
            if (sData) likeMap = sData;
            newPosts.forEach(post => {
              const idStr = String(post.id);
              if (likeMap[idStr] === true) {
                post.isLiked = true;
              }
            });
          } catch (likeErr) {
            console.warn("获取点赞状态失败", likeErr);
          }
        }
        this.hasMore = responseData.hasMore || (newPosts.length >= this.limit);
        if (this.offset === 0) {
          this.posts = newPosts;
        } else {
          this.posts = [...this.posts, ...newPosts];
        }
        this.offset += newPosts.length;
      } catch (e) {
        console.error("加载帖子失败", e);
        this.hasMore = false;
        if (this.offset === 0) {
          ElMessage.error('加载内容失败，请检查网络');
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* --- 全局 --- */
.home-container {
  min-height: 100vh;
  background-color: #F7FAFC;
  background-image: radial-gradient(#E3F2FD 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Nunito', 'Segoe UI', sans-serif;
  color: #455A64;
}

.content-wrapper {
  max-width: 1300px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* --- 筛选栏 --- */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-left-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* Tabs 样式 */
.tabs {
  display: flex;
  gap: 8px;
  background: #FFF;
  padding: 6px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(129, 212, 250, 0.15);
  border: 1px solid #E1F5FE;
}

.tab-item {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: #78909C;
  font-weight: 700;
  font-size: 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-item.active {
  background: #81D4FA;
  color: #fff;
  box-shadow: 0 4px 10px rgba(129, 212, 250, 0.4);
  transform: scale(1.05);
}

.tab-item:hover:not(.active) {
  color: #4FC3F7;
  background: #E1F5FE;
}

/* 特别行动区 */
.special-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
  overflow: hidden;
}

.activity-btn {
  background: linear-gradient(135deg, #4DD0E1 0%, #0097A7 100%);
  background-image: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%), linear-gradient(135deg, #4DD0E1 0%, #0097A7 100%);
}
.activity-btn:hover {
  transform: translateY(-3px);
  background-image: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, transparent 100%), linear-gradient(135deg, #80DEEA 0%, #26C6DA 100%);
  box-shadow: 0 10px 25px rgba(0, 151, 167, 0.4);
}
.activity-btn:hover .pill-icon { transform: scale(1.1) rotate(-5deg); }

.challenge-btn {
  background: linear-gradient(135deg, #BA68C8 0%, #7B1FA2 100%);
  background-image: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%), linear-gradient(135deg, #BA68C8 0%, #7B1FA2 100%);
}
.challenge-btn:hover {
  transform: translateY(-3px);
  background-image: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, transparent 100%), linear-gradient(135deg, #CE93D8 0%, #AB47BC 100%);
  box-shadow: 0 10px 25px rgba(123, 31, 162, 0.4);
}
.challenge-btn:hover .pill-icon { transform: scale(1.1) rotate(5deg); }

.pill-icon { font-size: 1.2em; transition: transform 0.4s ease; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
.pill-text { white-space: nowrap; }

/* 分类标签 */
.categories {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex: 1;
  min-width: 200px;
}

.cat-tag {
  font-size: 13px;
  color: #607D8B;
  background: #FFF;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  border: 2px solid #F0F4F8;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  user-select: none;
}

.cat-tag:hover {
  transform: translateY(-3px) scale(1.05);
  border-color: #81D4FA;
  color: #0277BD;
  box-shadow: 0 5px 15px rgba(129, 212, 250, 0.2);
}

.cat-tag.active {
  background: #E1F5FE;
  color: #0277BD;
  border-color: #81D4FA;
  font-weight: 800;
  transform: scale(1.05);
}

/* ✨ 搜索状态条样式 */
.search-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #E3F2FD;
  color: #0277BD;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #B3E5FC;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.search-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon-small {
  font-size: 16px;
}

.clear-search-btn {
  background: transparent;
  border: 1px solid #90CAF9;
  color: #0277BD;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #BBDEFB;
  border-color: #64B5F6;
}

/* 帖子卡片 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}
.post-card {
  background: #FFFFFF;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid #F0F4F8;
  box-shadow: 0 10px 20px rgba(100, 181, 246, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}
.post-card:hover {
  transform: translateY(-8px) scale(1.015);
  box-shadow: 0 15px 35px rgba(129, 212, 250, 0.25);
  border-color: #B3E5FC;
}
.card-image-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #ECEFF1;
  position: relative;
}
.card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.post-card:hover .card-cover { transform: scale(1.1); }

.card-info { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.post-title {
  font-size: 16px;
  font-weight: 800;
  color: #37474F;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.author-info { display: flex; align-items: center; gap: 8px; }
.mini-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 2px solid #FFF; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.author-name { font-size: 13px; color: #78909C; font-weight: 600; }
.stats { display: flex; gap: 10px; color: #90A4AE; font-size: 12px; font-weight: 700; }
.stat-item { display: flex; align-items: center; gap: 4px; background: #F5F7FA; padding: 4px 8px; border-radius: 12px; transition: all 0.3s; cursor: default; }
.like-stat { cursor: pointer; user-select: none; }
.like-stat:not(.is-liked):hover { background: #E1F5FE; color: #0277BD; }
.like-stat.is-liked { background: #FFEBEE; color: #D32F2F; border: 1px solid #FFCDD2; animation: popHeart 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.like-stat.is-liked:hover { background: #FFCDD2; color: #B71C1C; }
@keyframes popHeart { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
.post-card:hover .stat-item:not(.like-stat) { background: #E1F5FE; color: #0277BD; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 2px dashed #F0F4F8; }
.category-badge { font-size: 11px; font-weight: 800; color: #0288D1; background: #E1F5FE; padding: 4px 10px; border-radius: 12px; display: flex; align-items: center; gap: 4px; }
.time-ago { font-size: 12px; color: #B0BEC5; font-weight: 600; }

/* 加载更多 */
.load-more-container { margin-top: 50px; text-align: center; }
.load-more-btn {
  padding: 14px 40px;
  background: #FFF;
  border: 2px dashed #81D4FA;
  color: #0277BD;
  font-weight: 800;
  font-size: 15px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 10px rgba(129, 212, 250, 0.2);
}
.load-more-btn:hover:not(:disabled) {
  background: #E1F5FE;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 15px rgba(129, 212, 250, 0.4);
  border-style: solid;
}
.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.no-more { margin-top: 50px; text-align: center; color: #90A4AE; font-weight: 600; }

/* 完善资料弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-card {
  width: 90%;
  max-width: 420px;
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlide 0.35s ease;
}
@keyframes modalSlide {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header { margin-bottom: 20px; }
.modal-icon { font-size: 48px; margin-bottom: 12px; }
.modal-title { font-size: 22px; font-weight: 800; color: #2E7D32; margin: 0; }
.modal-subtitle { font-size: 14px; color: #888; margin-top: 6px; }

.modal-body { margin-bottom: 28px; text-align: left; }
.tip-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #555;
  margin-bottom: 10px;
}
.tip-icon {
  margin-right: 10px;
  font-weight: 700;
  color: #4CAF50;
}

.modal-footer {
  display: flex;
  gap: 12px;
}
.btn-later {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #eee;
  background: #f9f9f9;
  font-weight: 600;
  color: #888;
  cursor: pointer;
}
.btn-go {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #81C784, #4DB6AC);
  color: #fff;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

/* 移动端适配 */
@media (max-width: 900px) {
  .filter-bar { justify-content: center; }
  .filter-left-group { justify-content: center; width: 100%; margin-bottom: 10px; }
  .tabs { order: 1; }
  .special-actions { order: 2; margin-top: 10px; }
  .pill-text { display: none; }
  .action-pill { padding: 10px; border-radius: 50%; width: 42px; height: 42px; justify-content: center; }
  .categories { justify-content: center; width: 100%; margin-top: 10px; }
}
@media (max-width: 600px) {
  .tabs { flex-direction: column; width: 100%; padding: 4px; }
  .tab-item { width: 100%; text-align: center; }
  .special-actions { justify-content: center; width: 100%; }
}
</style>