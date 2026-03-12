<template>
  <div class="detail-container">
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="nav-left" @click="goHome">
        <h1 class="lumecho-logo-small">
          🌟 Lum<span>Echo!</span>
        </h1>
      </div>

      <div class="search-container">
        <input type="text" placeholder="寻找灵感火花... ✨" class="search-input" />
        <button class="search-btn">🔍</button>
      </div>

      <div class="nav-right">
        <button class="upload-btn" @click="goUpload">
          <span class="btn-icon">📸</span>
          <span>发布作品</span>
        </button>
        <div class="user-avatar" @click="goProfile">
          <img src="https://ui-avatars.com/api/?name=User&background=ffb7b2&color=fff" alt="Avatar" />
          <span class="avatar-status">🟢</span>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="content-wrapper" v-if="!loading">

      <!-- 帖子头部 -->
      <div class="post-header">
        <div class="author-info">
          <div class="avatar-wrapper" @click="goProfile">
            <img :src="post.authorAvatar || 'https://ui-avatars.com/api/?name=Unknown'" class="author-avatar" />
            <span class="avatar-badge">📷</span>
          </div>
          <div class="author-details">
            <span class="author-name">{{ post.authorName || '神秘摄影师' }}</span>
            <span class="publish-time">🕒 {{ formatTime(post.createTime) }}</span>
          </div>
        </div>
        <h1 class="post-title-main">
          {{ post.title }}
          <span class="title-decoration">✨</span>
        </h1>
      </div>

      <!-- 媒体展示区：智能网格布局 -->
      <div class="media-gallery" v-if="post.imageUrls && post.imageUrls.length > 0">
        <div class="gallery-grid" :class="gridClass">
          <img
              v-for="(img, index) in post.imageUrls"
              :key="index"
              :src="img"
              class="gallery-item"
              loading="lazy"
              @click="openLightbox(img)"
          />
        </div>
      </div>

      <!-- 正文内容 -->
      <div class="post-content-body">
        <p class="content-text">{{ post.content }}</p>

        <!-- 动态标签区域 -->
        <div class="content-footer-tags" v-if="post.categories && post.categories.length > 0">
          <span
              v-for="(cat, index) in post.categories"
              :key="index"
              class="tag"
          >
            #{{ cat }}
          </span>
        </div>
        <div v-else class="content-footer-tags">
          <span class="tag">#未分类</span>
        </div>
      </div>

      <!-- 互动栏 -->
      <div class="interaction-bar">
        <button class="interaction-btn like-btn" :class="{ active: isLiked }" @click="toggleLike">
          <span class="btn-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
          <span>{{ likeCount }}</span>
        </button>

        <button class="interaction-btn comment-btn" @click="scrollToComment">
          <span class="btn-icon">💬</span>
          <span>{{ totalComments }}</span>
        </button>

        <button class="interaction-btn share-btn" @click="handleShare">
          <span class="btn-icon">✈️</span>
          <span>分享</span>
        </button>

        <button class="interaction-btn collect-btn" @click="handleCollect">
          <span class="btn-icon">⭐</span>
          <span>收藏</span>
        </button>
      </div>

      <hr class="divider" />

      <!-- 评论区 -->
      <div class="comments-section" ref="commentSection">
        <h3 class="section-title">
          <span>💭 大家怎么说</span>
          <span class="count-badge">{{ totalComments }}</span>
        </h3>

        <!-- 发表评论输入框 (去掉了多余的头像) -->
        <div class="comment-input-area" ref="commentInputArea">
          <div class="input-wrapper">
            <textarea
                v-model="newCommentContent"
                placeholder="说点什么吧... 哪怕是一个表情也好呀 (◍•ᴗ•◍)"
                rows="2"
            ></textarea>
            <button class="submit-btn" @click="submitComment" :disabled="!newCommentContent.trim() || submitting">
              {{ submitting ? '发送中...' : '发送 ✨' }}
            </button>
          </div>

          <!-- 回复模式提示 -->
          <div v-if="replyingTo" class="replying-indicator">
            <span>正在回复 <strong>@{{ replyingToUsername }}</strong></span>
            <span class="cancel-reply" @click="cancelReply">🚫 取消</span>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <comment-item
              v-for="comment in comments"
              :key="comment.id"
              :comment="comment"
              :depth="0"
              @reply="handleReplyClick"
          />
        </div>

        <!-- 加载更多 -->
        <div class="load-more-comments" v-if="hasMoreComments">
          <button @click="loadMoreComments">
            <span>加载更多小伙伴的评论</span>
            <span class="arrow-down">⬇️</span>
          </button>
        </div>

        <!-- 无评论提示 -->
        <div v-if="comments.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">🍃</div>
          <p>还没有评论哦，快来抢沙发吧！</p>
        </div>
      </div>

    </main>

    <!-- 加载中 -->
    <div v-else class="loading-state">
      <div class="cute-loader">
        <span>✨</span><span>🌟</span><span>✨</span>
      </div>
      <p>正在捕捉灵感...</p>
    </div>

    <!-- 可爱提示 Toast (用于分享等功能) -->
    <transition name="toast-fade">
      <div v-if="toastVisible" class="custom-toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import { getPostById, likePost, unlikePost } from "@/api/post";
import { getComments, createComment } from "@/api/comment";
import CommentItem from "@/components/CommentItem.vue";

export default {
  name: "PostDetail",
  components: { CommentItem },
  data() {
    return {
      postId: null,
      loading: true,
      post: {
        title: '',
        content: '',
        imageUrls: [],
        authorName: '',
        authorAvatar: '',
        createTime: '',
        categories: [] // 新增：存储分类标签
      },
      comments: [],
      totalComments: 0,
      currentPage: 1,
      hasMoreComments: true,
      isLiked: false,
      likeCount: 0,
      newCommentContent: '',
      replyingTo: null,
      replyingToUsername: '',
      submitting: false,

      // 新增：Toast 提示控制
      toastVisible: false,
      toastMessage: ''
    };
  },
  computed: {
    // 智能计算网格类名，解决布局问题
    gridClass() {
      const count = this.post.imageUrls.length;
      if (count === 1) return 'single-image';
      if (count === 2) return 'two-images';
      if (count === 3) return 'three-images';
      return 'multi-images'; // 4 张及以上
    }
  },
  created() {
    this.postId = this.$route.params.id;
    if (!this.postId) { this.loading = false; return; }
    this.fetchPostDetail();
    this.fetchComments();
  },
  methods: {
    goHome() { this.$router.push('/') },
    goProfile() { this.$router.push('/profile') },
    goUpload() { this.$router.push('/upload') },

    // 显示可爱提示
    showToast(msg) {
      this.toastMessage = msg;
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false; }, 2500);
    },

    async fetchPostDetail() {
      try {
        const res = await getPostById(this.postId);
        if (res.data.code === 200 || res.data.success) {
          const data = res.data.data;
          this.post = {
            title: data.title || '无标题',
            content: data.content || '暂无内容',
            imageUrls: data.imageUrls || [],
            createTime: data.createTime || '',
            authorName: data.username || data.authorName || '摄影师',
            authorAvatar: data.avatar || data.authorAvatar || '',
            categories: data.categoryName ? [data.categoryName] : []
          };
          this.likeCount = data.likeCount || 0;
          // 如果有用户点赞状态接口，也可以在这里设置 this.isLiked
        }
      } catch (e) {
        console.error(e);
        this.showToast("哎呀，帖子好像飞走了~");
      } finally {
        this.loading = false;
      }
    },

    async fetchComments() {
      try {
        const res = await getComments(this.postId, { page: this.currentPage, size: 10 });
        if (res.data.code === 200 || res.data.success) {
          const resultData = res.data.data;
          let newComments = resultData.list || resultData.records || [];
          if (this.currentPage === 1) {
            this.comments = newComments;
            this.totalComments = resultData.total || 0;
          } else {
            this.comments = [...this.comments, ...newComments];
          }
          this.hasMoreComments = this.comments.length < this.totalComments;
        }
      } catch (e) { console.error(e); }
    },

    loadMoreComments() {
      this.currentPage++;
      this.fetchComments();
    },

    async toggleLike() {
      // 乐观更新 UI
      const originalState = this.isLiked;
      const originalCount = this.likeCount;

      this.isLiked = !this.isLiked;
      this.likeCount += this.isLiked ? 1 : -1;

      try {
        if (this.isLiked) { await likePost(this.postId); }
        else { await unlikePost(this.postId); }
      } catch (e) {
        // 失败回滚
        this.isLiked = originalState;
        this.likeCount = originalCount;
        this.showToast("网络开小差了，点赞失败~");
      }
    },

    // 滚动到评论框
    scrollToComment() {
      const area = this.$refs.commentInputArea;
      if(area) {
        area.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 自动聚焦
        const textarea = area.querySelector('textarea');
        if(textarea) textarea.focus();
      }
    },

    handleShare() {
      this.showToast("🚀 分享功能正在快马加鞭制作中！");
    },

    handleCollect() {
      // 将来对接收藏接口
      this.showToast("⭐ 已加入收藏夹 (模拟)");
      // TODO: 调用收藏 API
    },

    handleReplyClick(comment) {
      this.replyingTo = comment;
      this.replyingToUsername = comment.username;
      this.$nextTick(() => {
        const area = this.$refs.commentInputArea;
        if(area) {
          area.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const textarea = area.querySelector('textarea');
          if(textarea) textarea.focus();
        }
      });
    },

    cancelReply() {
      this.replyingTo = null;
      this.replyingToUsername = '';
    },

    async submitComment() {
      if (!this.newCommentContent.trim() || this.submitting) return;
      this.submitting = true;
      try {
        await createComment({
          postId: this.postId,
          content: this.newCommentContent,
          parentId: this.replyingTo ? this.replyingTo.id : null
        });
        this.currentPage = 1;
        await this.fetchComments();
        this.newCommentContent = '';
        this.cancelReply();
        this.showToast("评论发送成功！✨");
      } catch (e) {
        console.error(e);
        this.showToast("发送失败，再试一次吧~");
      } finally {
        this.submitting = false;
      }
    },

    formatTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    },

    openLightbox(imgSrc) {
      window.open(imgSrc, '_blank');
    }
  }
};
</script>

<style scoped>
/* ==================== 全局变量 ==================== */
.detail-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F0 0%, #FFFFFF 100%);
  font-family: 'Segoe UI', 'Helvetica Neue', 'PingFang SC', sans-serif;
  color: #4A4A5A;
  position: relative; /* 为 Toast 定位 */
}

/* ==================== Toast 提示 ==================== */
.custom-toast {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  z-index: 9999;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  white-space: nowrap;
}
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}
.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* ==================== 导航栏 (保持不变) ==================== */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #FFE5D9;
  box-shadow: 0 4px 20px rgba(255, 183, 178, 0.1);
}
.lumecho-logo-small {
  font-size: 1.5rem;
  font-weight: 800;
  color: #FF8E8E;
  cursor: pointer;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: transform 0.2s;
}
.lumecho-logo-small:hover { transform: scale(1.05) rotate(-2deg); }
.lumecho-logo-small span { color: #6C63FF; -webkit-text-fill-color: #6C63FF; }
.search-container {
  flex: 1;
  max-width: 450px;
  margin: 0 40px;
  position: relative;
  display: flex;
  align-items: center;
}
.search-input {
  width: 100%;
  padding: 12px 45px 12px 20px;
  border-radius: 50px;
  border: 2px solid #FFE5D9;
  background: #FFF9F5;
  font-size: 14px;
  outline: none;
  color: #555;
  transition: all 0.3s;
}
.search-input::placeholder { color: #CCAAB8; }
.search-input:focus {
  background: #fff;
  border-color: #FFB7B2;
  box-shadow: 0 0 0 4px rgba(255, 183, 178, 0.2);
}
.search-btn {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.search-btn:hover { opacity: 1; }
.nav-right { display: flex; align-items: center; gap: 16px; }
.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: #6C63FF;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
}
.upload-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(108, 99, 255, 0.4);
}
.btn-icon { font-size: 16px; }
.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  position: relative;
  transition: transform 0.3s;
}
.user-avatar:hover { transform: scale(1.1) rotate(5deg); }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 10px;
  background: #fff;
  border-radius: 50%;
  padding: 2px;
}

/* ==================== 主体内容 ==================== */
.content-wrapper {
  max-width: 800px;
  margin: 40px auto 80px;
  padding: 0 20px;
}
.post-header { margin-bottom: 30px; text-align: center; }
.author-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}
.avatar-wrapper {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}
.avatar-wrapper:hover { transform: scale(1.1); }
.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FFDAC1;
  box-shadow: 0 4px 10px rgba(255, 218, 193, 0.4);
}
.avatar-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #fff;
  border-radius: 50%;
  padding: 4px;
  font-size: 12px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.author-name {
  font-weight: 800;
  font-size: 17px;
  color: #4A4A5A;
}
.publish-time {
  font-size: 12px;
  color: #999;
  background: #F5F5F5;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}
.post-title-main {
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  margin: 10px 0 0;
  line-height: 1.4;
  display: inline-block;
}
.title-decoration {
  display: inline-block;
  animation: twinkle 2s infinite;
}
@keyframes twinkle {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* ==================== 媒体画廊：核心修改区 ==================== */
.media-gallery {
  margin-bottom: 30px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 4px solid #fff;
}
.gallery-grid {
  display: grid;
  gap: 8px;
  background: #f0f0f0;
}
.gallery-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.4s;
  display: block;
}
.gallery-item:hover {
  transform: scale(1.05);
  z-index: 10;
  position: relative;
}

/* 1 张图：大图模式 */
.gallery-grid.single-image {
  grid-template-columns: 1fr;
}
.gallery-grid.single-image .gallery-item {
  aspect-ratio: 16/9;
}

/* 2 张图：左右并排 */
.gallery-grid.two-images {
  grid-template-columns: 1fr 1fr;
}
.gallery-grid.two-images .gallery-item {
  aspect-ratio: 4/3;
}

/* 3 张图：一行三个 */
.gallery-grid.three-images {
  grid-template-columns: 1fr 1fr 1fr;
}
.gallery-grid.three-images .gallery-item {
  aspect-ratio: 1/1;
}

/* 👇 4 张及以上：强制 2 列布局 (完美 2x2 矩阵) */
.gallery-grid.multi-images {
  grid-template-columns: 1fr 1fr;
}
.gallery-grid.multi-images .gallery-item {
  aspect-ratio: 1/1;
}

/* ==================== 正文与标签 ==================== */
.post-content-body {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
  border: 1px dashed #E0E0E0;
  position: relative;
}
.post-content-body::before {
  content: '📝';
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
  opacity: 0.5;
}
.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
  margin: 0;
}
.content-footer-tags {
  margin-top: 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  background: #F0F4FF;
  color: #6C63FF;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: default;
}
.tag:hover {
  background: #E0E7FF;
}

/* ==================== 互动栏 ==================== */
.interaction-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255,255,255,0.6);
  border-radius: 50px;
  margin-bottom: 30px;
  backdrop-filter: blur(5px);
}
.interaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #fff;
  border: 2px solid #F0F0F0;
  border-radius: 50px;
  color: #666;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.interaction-btn:hover {
  transform: translateY(-2px);
  border-color: #FFB7B2;
  color: #FF8E8E;
  box-shadow: 0 4px 10px rgba(255, 183, 178, 0.2);
}
.interaction-btn.active {
  background: #FFEBEE;
  border-color: #FFCDD2;
  color: #FF4757;
}
.interaction-btn .btn-icon { font-size: 18px; line-height: 1; }
.interaction-btn.active .btn-icon { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop { 50% { transform: scale(1.4); } }

.divider { border: 0; border-top: 2px dashed #FFE5D9; margin: 0 0 30px 0; }

/* ==================== 评论区 ==================== */
.comments-section {
  background: #fff;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #FFF0F0;
}
.section-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #4A4A5A;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.count-badge {
  background: #FFB7B2;
  color: #fff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}
.comment-input-area { margin-bottom: 30px; }
.input-wrapper {
  display: flex;
  gap: 12px;
  background: #F8F9FC;
  padding: 15px;
  border-radius: 20px;
  border: 2px solid #E8E8F0;
  transition: all 0.3s;
}
.input-wrapper:focus-within {
  background: #fff;
  border-color: #A2D2FF;
  box-shadow: 0 0 0 4px rgba(162, 210, 255, 0.2);
}
.input-wrapper textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  color: #555;
  background: transparent;
  line-height: 1.6;
}
.submit-btn {
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 154, 158, 0.3);
  white-space: nowrap;
}
.submit-btn:disabled {
  background: #E0E0E0;
  cursor: not-allowed;
  box-shadow: none;
  color: #999;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 15px rgba(255, 154, 158, 0.4);
}
.replying-indicator {
  margin-top: 12px;
  font-size: 13px;
  color: #6C63FF;
  background: #F3F0FF;
  padding: 10px 16px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px dashed #D4C4FB;
  animation: slideDown 0.3s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.cancel-reply {
  color: #FF8E8E;
  cursor: pointer;
  font-weight: 700;
  margin-left: 8px;
}
.cancel-reply:hover { text-decoration: underline; }
.load-more-comments {
  text-align: center;
  margin-top: 30px;
}
.load-more-comments button {
  background: #FFF9F0;
  border: 2px dashed #FFDac1;
  color: #FF8E8E;
  padding: 12px 30px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}
.load-more-comments button:hover {
  background: #FFEBEE;
  border-style: solid;
  transform: translateY(-2px);
}
.arrow-down { display: inline-block; transition: transform 0.3s; }
.load-more-comments button:hover .arrow-down { transform: translateY(3px); }
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
.empty-icon { font-size: 40px; margin-bottom: 10px; display: block; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.empty-state p { font-size: 14px; margin: 0; }
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #999;
  gap: 20px;
}
.cute-loader span {
  font-size: 24px;
  animation: bounce 1.4s infinite ease-in-out both;
  display: inline-block;
}
.cute-loader span:nth-child(1) { animation-delay: -0.32s; }
.cute-loader span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

@media (max-width: 768px) {
  .navbar { padding: 12px 20px; }
  .search-container { display: none; }
  .upload-btn span { display: none; }
  .content-wrapper { margin: 20px auto; padding: 0 16px; }
  .post-title-main { font-size: 1.5rem; }
  .interaction-bar { flex-wrap: wrap; justify-content: center; }
  .interaction-btn { padding: 8px 16px; font-size: 13px; }
  /* 移动端 4 张图也保持 2 列，或者改为 1 列？这里保持 2 列比较紧凑 */
}
</style>