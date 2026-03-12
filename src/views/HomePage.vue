<template>
  <div class="home-container">
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
        <div class="tabs">
          <button :class="['tab-item', { active: activeTab === 'latest' }]" @click="switchTab('latest')">
            🕒 最新发现
          </button>
          <button :class="['tab-item', { active: activeTab === 'hot' }]" @click="switchTab('hot')">
            🔥 热门榜单
          </button>
        </div>

        <div class="categories">
          <span
              class="cat-tag"
              v-for="cat in categoryList"
              :key="cat.id"
              :class="{ active: selectedCategoryId === cat.id }"
              @click="selectCategory(cat)"
          >
            <span class="cat-icon">{{ categoryIcons[cat.id] || categoryIcons.default }}</span>
            {{ cat.name }}
          </span>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="posts-grid">
        <div
            class="post-card"
            v-for="post in posts"
            :key="post.id"
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
            <!-- ✅ 已删除“看看”气泡，此处留空，只保留图片 -->
          </div>

          <div class="card-info">
            <h3 class="post-title">{{ post.title || '无标题帖子' }}</h3>

            <div class="post-meta">
              <div class="author-info">
                <img :src="post.avatar" class="mini-avatar" alt="author" @error="$event.target.src = defaultAvatar" />
                <span class="author-name">{{ post.username }}</span>
              </div>

              <div class="stats">
                <span class="stat-item" title="点赞">
                  🤍 {{ post.likes || 0 }}
                </span>
                <span class="stat-item" title="评论">
                  💬 {{ post.comments || 0 }}
                </span>
              </div>
            </div>

            <div class="card-footer">
              <span class="category-badge">
                {{ categoryIcons[post.categoryId] || '🏷️' }} {{ post.category || '综合' }}
              </span>
              <span class="time-ago">{{ post.timeAgo || '刚刚' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more-container" v-if="hasMore">
        <button class="load-more-btn" @click="loadMore">
          ✨ 加载更多灵感
        </button>
      </div>
      <div class="no-more" v-else>
        <p>已经到底啦，喝杯奶茶休息一下吧 🧋</p>
      </div>
    </main>
  </div>
</template>

<script>
import { getHomePosts, getCurrentUserInfo } from "@/api/auth";
import HomeNavBar from "@/components/NavBar/HomeNavBar.vue";
import { getAllCategories } from '@/api/category'

export default {
  name: "HomePage",
  components: { HomeNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/specialty/avatar.png',
      currentUserName: '神秘摄影师',
      searchQuery: '',
      activeTab: 'latest',
      categoryList: [],
      selectedCategoryId: null,
      categoryIcons: { 1: '🏠', 2: '💻', 3: '🍜', 4: '✈️', 5: '🛌', default: '📁' },
      posts: [],
      hasMore: true,
      offset: 0,
      limit: 8,
      defaultCover: 'http://localhost:9000/specialty/cover.png',
      defaultAvatar: 'http://localhost:9000/specialty/avatar.png'
    };
  },
  mounted() {
    this.fetchPosts();
    this.fetchUserInfo();
    this.fetchCategories();
  },
  methods: {
    goUpload() { this.$router.push("/upload"); },
    goProfile() { this.$router.push("/profile"); },
    goDetail(id) { this.$router.push(`/post/${id}`); },
    switchTab(tab) {
      this.activeTab = tab;
      this.offset = 0;
      this.posts = [];
      this.hasMore = true;
      this.fetchPosts();
    },
    handleSearch(query) { this.searchQuery = query; },
    loadMore() { if (this.hasMore) this.fetchPosts(); },
    selectCategory(cat) {
      this.selectedCategoryId = cat.id;
      this.offset = 0;
      this.posts = [];
      this.hasMore = true;
      this.fetchPosts();
    },
    async fetchCategories() {
      try {
        const res = await getAllCategories();
        if (res.data && res.data.code === 200) this.categoryList = res.data.data;
      } catch (e) { console.error(e); }
    },
    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        if (res.data.code === 200 || res.data.success) {
          const u = res.data.data;
          this.currentUserAvatar = u.avatar || this.currentUserAvatar;
          this.currentUserName = u.username || this.currentUserName;
        }
      } catch (e) { console.error(e); }
    },
    async fetchPosts() {
      try {
        const sortParam = this.activeTab === 'latest' ? 'time' : 'hot';
        const res = await getHomePosts({ sort: sortParam, offset: this.offset, limit: this.limit });
        let newPosts = res.data.data.data || [];
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
          timeAgo: item.timeAgo || '刚刚'
        }));
        this.hasMore = res.data.data.hasMore || false;
        this.posts = [...this.posts, ...newPosts];
        this.offset += newPosts.length;
      } catch (e) {
        console.error(e);
        this.hasMore = false;
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
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
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

.categories {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
}

/* --- 帖子卡片 --- */
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

/* 悬停效果：仅上浮 + 阴影，无遮罩 */
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

/* 图片仅放大，保持原色 */
.post-card:hover .card-cover {
  transform: scale(1.1);
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

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

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFF;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.author-name {
  font-size: 13px;
  color: #78909C;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 10px;
  color: #90A4AE;
  font-size: 12px;
  font-weight: 700;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #F5F7FA;
  padding: 4px 8px;
  border-radius: 12px;
  transition: background 0.3s;
}

.post-card:hover .stat-item {
  background: #E1F5FE;
  color: #0277BD;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px dashed #F0F4F8;
}

.category-badge {
  font-size: 11px;
  font-weight: 800;
  color: #0288D1;
  background: #E1F5FE;
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-ago {
  font-size: 12px;
  color: #B0BEC5;
  font-weight: 600;
}

/* --- 加载更多 --- */
.load-more-container {
  margin-top: 50px;
  text-align: center;
}

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

.load-more-btn:hover {
  background: #E1F5FE;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 15px rgba(129, 212, 250, 0.4);
  border-style: solid;
}

.no-more {
  margin-top: 50px;
  text-align: center;
  color: #90A4AE;
  font-size: 15px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .posts-grid { grid-template-columns: 1fr; gap: 20px; }
  .filter-bar { justify-content: center; }
  .tabs { width: 100%; justify-content: center; }
  .categories { justify-content: center; width: 100%; }
}
</style>