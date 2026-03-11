<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="nav-left" @click="goHome">
        <h1 class="lumecho-logo-small">
          Lum<span>Echo!</span>
        </h1>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索摄影师、作品或标签..."
            class="search-input"
            @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      <!-- 右侧用户区 -->
      <div class="nav-right">
        <button class="upload-btn" @click="goUpload">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>发布作品</span>
        </button>
        <div class="user-avatar" @click="goProfile">
          <img src="https://ui-avatars.com/api/?name=User&background=6c63ff&color=fff" alt="Avatar"/>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="content-wrapper">

      <!-- 分类/筛选栏 -->
      <div class="filter-bar">
        <div class="tabs">
          <button
              :class="['tab-item', { active: activeTab === 'latest' }]"
              @click="switchTab('latest')">
            最新发现
          </button>
          <button
              :class="['tab-item', { active: activeTab === 'hot' }]"
              @click="switchTab('hot')">
            热门榜单
          </button>
        </div>
        <div class="categories">
  <span class="cat-tag" v-for="cat in categories" :key="cat">
    <span class="cat-icon">{{ categoryIcons[cat] }}</span>
    {{ cat }}
  </span>
        </div>
      </div>

      <!-- 帖子列表 (Grid 布局) -->
      <div class="posts-grid">
        <div
            class="post-card"
            v-for="post in posts"
            :key="post.id"
            @click="goDetail(post.id)"
        >
          <!-- 封面图 (固定高度) -->
          <div class="card-image-wrapper">
            <img :src="post.cover" :alt="post.title" class="card-cover" loading="lazy"/>
          </div>

          <!-- 卡片信息 -->
          <div class="card-info">
            <h3 class="post-title">{{ post.title }}</h3>

            <div class="post-meta">
              <div class="author-info">
                <img :src="post.avatar" class="mini-avatar"/>
                <span class="author-name">{{ post.username }}</span>
              </div>
              <div class="stats">
                <span class="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  {{ post.likes }}
                </span>
                <span class="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  {{ post.comments }}
                </span>
              </div>
            </div>

            <!-- 标签和时间同一行 -->
            <div class="card-footer">
              <span class="category-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round"><polygon
                    points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline
                    points="2 12 12 17 22 12"></polyline></svg>
                {{ post.category }}
              </span>
              <span class="time-ago">{{ post.timeAgo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 / 分页提示 -->
      <div class="load-more-container" v-if="hasMore">
        <button class="load-more-btn" @click="loadMore">加载更多灵感</button>
      </div>
      <div class="no-more" v-else>
        <p>已经到底了，休息一下喝杯咖啡吧 ☕️</p>
      </div>

    </main>
  </div>
</template>

<script>
import {getHomePosts} from "@/api/auth"

export default {
  name: "HomePage",
  data() {
    return {
      searchQuery: '',
      activeTab: 'latest',
      categories: ['风光', '人像', '街拍', '黑白', '后期', '器材'],
      categoryIcons: {
        '风光': '🌄',
        '人像': '👤',
        '街拍': '🏙️',
        '黑白': '⬛',
        '后期': '🎨',
        '器材': '📸'
      },
      posts: [],
      hasMore: true,
      offset: 0,
      limit: 8
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    goHome() {
      this.$router.push("/")
    },
    goLogin() {
      this.$router.push("/login")
    },
    goRegister() {
      this.$router.push("/register")
    },
    goUpload() {
      this.$router.push("/upload")
    },
    goProfile() {
      this.$router.push("/profile")
    },
    goDetail(id) {
      this.$router.push(`/post/${id}`)
    },

    switchTab(tab) {
      this.activeTab = tab;
      this.offset = 0;
      this.posts = [];
      this.hasMore = true;
      this.fetchPosts();
    },

    handleSearch() {
      console.log("Searching for:", this.searchQuery);
    },

    loadMore() {
      if (this.hasMore) {
        this.fetchPosts();
      }
    },

    async fetchPosts() {
      try {
        // 前端 latest → 后端 time
        const sortParam = this.activeTab === 'latest' ? 'time' : 'hot';

        // 调用后端真实接口
        const res = await getHomePosts({
          sort: sortParam,
          offset: this.offset,
          limit: this.limit
        });

        // 解析后端返回数据（三层结构）
        // res.data → axios 响应
        // res.data.data → Result 包装层 (code, message, data)
        // res.data.data.data → 帖子数组
        const newPosts = res.data.data.data || [];

        // 获取 hasMore 状态
        this.hasMore = res.data.data.hasMore || false;

        // 后端已经返回 timeAgo，直接使用
        this.posts = [...this.posts, ...newPosts];

        // offset 累加，下次从后面继续取
        this.offset += newPosts.length;

        console.log('✅ 获取帖子成功，当前总数:', this.posts.length);

      } catch (error) {
        console.error('❌ 获取帖子列表失败:', error);
        this.hasMore = false;
      }
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f9f9fc;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

/* --- Navbar 样式 --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.03);
}

.lumecho-logo-small {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #222;
  cursor: pointer;
  margin: 0;
}

.lumecho-logo-small span {
  background: linear-gradient(90deg, #6c63ff, #9f8cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 搜索框 */
.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  padding-right: 50px;
  border-radius: 50px;
  border: 1px solid #e0e0e0;
  background: #f5f5f7;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.search-input:focus {
  background: #fff;
  border-color: #6c63ff;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.15);
}

.search-btn {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c63ff;
  display: flex;
  align-items: center;
}

/* 右侧按钮 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.upload-btn:hover {
  transform: translateY(-2px);
  background: #000;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.user-avatar:hover {
  border-color: #6c63ff;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- 主体内容 --- */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 筛选栏 */
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
  background: #fff;
  padding: 5px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab-item {
  padding: 8px 24px;
  border: none;
  background: transparent;
  color: #666;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item.active {
  background: #6c63ff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
}

.categories {
  display: flex;
  gap: 10px;
}

.cat-tag {
  font-size: 13px;
  color: #888;
  background: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid #eee;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-tag:hover {
  color: #6c63ff;
  border-color: #6c63ff;
}

.cat-tag svg {
  color: #6c63ff;
}

/* --- 帖子网格 (核心布局) --- */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

/* 卡片设计 */
.post-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%; /* 让卡片填满 grid 单元格 */
}

.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(108, 99, 255, 0.15);
}

.card-image-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3; /* 👈 用比例代替固定高度 */
  overflow: hidden;
  background: #f0f0f0;
  flex-shrink: 0;
}

.card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 填满容器 */
  transition: transform 0.5s ease;
}

.post-card:hover .card-cover {
  transform: scale(1.05);
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1; /* 填充剩余空间 */
}

.post-title {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px; /* 保证标题区域高度一致 */
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
}

.author-name {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 12px;
  color: #999;
  font-size: 13px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 底部标签和时间同一行 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #f5f5ff 0%, #ffffff 100%);
  color: #6c63ff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(108, 99, 255, 0.2);
}

.category-badge svg {
  flex-shrink: 0;
}

.time-ago {
  font-size: 12px;
  color: #aaa;
  white-space: nowrap;
}

/* 加载更多 */
.load-more-container {
  margin-top: 60px;
  text-align: center;
}

.load-more-btn {
  padding: 12px 40px;
  background: transparent;
  border: 2px solid #e0e0e0;
  color: #666;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover {
  border-color: #6c63ff;
  color: #6c63ff;
  background: rgba(108, 99, 255, 0.05);
}

.no-more {
  margin-top: 60px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar {
    padding: 15px 20px;
  }

  .search-container {
    display: none;
  }

  .upload-btn span {
    display: none;
  }

  .posts-grid {
    grid-template-columns: 1fr; /* 单列 */
    gap: 20px; /* 减小间距 */
  }

  .filter-bar {
    justify-content: center;
  }

  /* 👇 图片容器调整 */
  .card-image-wrapper {
    height: 280px; /* 手机端图片稍高 */
    aspect-ratio: auto; /* 取消比例限制 */
  }

  .card-cover {
    object-fit: cover; /* 填满容器 */
    object-position: center; /* 从中心裁剪 */
  }

  /* 👇 卡片内边距调整 */
  .card-info {
    padding: 12px;
  }

  .post-title {
    font-size: 15px;
  }

  .tabs {
    width: 100%;
    justify-content: center;
  }

  .categories {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 15px;
  }
}

</style>
