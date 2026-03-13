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
          </div>

          <div class="card-info">
            <h3 class="post-title">{{ post.title || '无标题帖子' }}</h3>

            <div class="post-meta">
              <div class="author-info">
                <img :src="post.avatar" class="mini-avatar" alt="author" @error="$event.target.src = defaultAvatar" />
                <span class="author-name">{{ post.username }}</span>
              </div>

              <div class="stats">
                <!-- ✅ 点赞按钮：独立点击事件，阻止冒泡 -->
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
import { getAllCategories } from '@/api/category';
// ✅ 确保这里导出了 toggleLike 方法 (对应后端 POST /{id}/like)
// 如果你的 api/post.js 里还是 likePost/unlikePost，请改为导入那个，但建议后端统一用 toggle
import { getLikeStatuses, toggleLike } from '@/api/post';
import { ElMessage } from 'element-plus';
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

    // ✅ 核心修改：点赞逻辑
    async toggleLikeInList(post) {
      // 1. 检查 Token (键名必须与 request.js 和登录时保存的一致！)
      const token = localStorage.getItem('user_token');

      if (!token) {
        ElMessage.warning('您尚未登录，请先登录');
        this.$router.push('/login');
        return;
      }

      // 2. 记录旧状态 (用于失败回滚)
      const originalLiked = post.isLiked;
      const originalCount = post.likes;

      // 3. 乐观更新 UI (先变效果，用户体验极快)
      post.isLiked = !originalLiked;
      post.likes = originalLiked ? originalCount - 1 : originalCount + 1;

      try {
        // 4. 发送请求 (调用统一的 toggle 接口)
        // 注意：如果后端还没改，你这里可能需要改成 await likePost(post.id) 或 unlikePost
        // 但根据你的后端代码 @PostMapping("/{postId}/like")，这就是一个 toggle 接口
        await toggleLike(post.id);

        // 成功：什么都不用做，UI 已经是新的了
        // this.$message.success(post.isLiked ? '点赞成功' : '已取消'); // 可选：太频繁可以不开启

      } catch (error) {
        // 5. 失败回滚
        console.error("点赞操作失败", error);

        // 恢复 UI
        post.isLiked = originalLiked;
        post.likes = originalCount;

        // 提示用户
        // 如果是 401，拦截器通常已经跳转了，这里可以不加提示，或者加一个轻微提示
        if (error.response && error.response.status === 401) {
          ElMessage.warning('登录已过期，请重新登录');
        } else {
          ElMessage.warning('操作失败，请稍后重试');
        }
      }
    },

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
        // 兼容拦截器是否解包
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) this.categoryList = data;
      } catch (e) { console.error(e); }
    },

    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) {
          this.currentUserAvatar = data.avatar || this.currentUserAvatar;
          this.currentUserName = data.username || this.currentUserName;
        }
      } catch (e) {
        // 未登录或 token 过期时，这里会报错，保持默认游客状态即可
        // console.log("用户未登录，显示默认信息");
      }
    },

    async fetchPosts() {
      try {
        const sortParam = this.activeTab === 'latest' ? 'time' : 'hot';
        const res = await getHomePosts({ sort: sortParam, offset: this.offset, limit: this.limit });

        // 兼容不同的响应结构
        const responseData = res.data.code === 200 ? res.data.data : res.data;
        let newPosts = responseData.data || [];

        // 1. 数据格式化，初始化 isLiked 为 false
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
          isLiked: false // 默认未点赞
        }));

        // 2. 如果用户已登录，批量查询点赞状态
        const token = localStorage.getItem('user_token');
        if (token && newPosts.length > 0) {
          try {
            const postIds = newPosts.map(p => p.id);
            const statusRes = await getLikeStatuses(postIds);

            let likeMap = {};
            const sData = statusRes.data.code === 200 ? statusRes.data.data : statusRes.data;

            if (sData) {
              likeMap = sData; // 期望格式: { "1": true, "2": false }
            }

            newPosts.forEach(post => {
              const idStr = String(post.id);
              if (likeMap[idStr] === true) {
                post.isLiked = true;
              }
            });
          } catch (likeErr) {
            console.warn("获取点赞状态失败，将以未点赞显示", likeErr);
          }
        }

        // 3. 更新列表
        this.hasMore = responseData.hasMore || false;
        this.posts = [...this.posts, ...newPosts];
        this.offset += newPosts.length;
      } catch (e) {
        console.error("加载帖子失败", e);
        this.hasMore = false;
        this.$message.error('加载内容失败，请刷新重试');
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

/* 通用统计项样式 */
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #F5F7FA;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.3s;
  cursor: default;
}

/* 点赞专用样式 */
.like-stat {
  cursor: pointer;
  user-select: none;
}

.like-stat:not(.is-liked):hover {
  background: #E1F5FE;
  color: #0277BD;
}

/* 已点赞高亮 */
.like-stat.is-liked {
  background: #FFEBEE;
  color: #D32F2F;
  border: 1px solid #FFCDD2;
  animation: popHeart 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.like-stat.is-liked:hover {
  background: #FFCDD2;
  color: #B71C1C;
}

@keyframes popHeart {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.post-card:hover .stat-item:not(.like-stat) {
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