<template>
  <div class="detail-container">
    <!-- 顶部导航栏 -->
    <DetailNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @upload="goUpload"
        @profile="goProfile"
    />

    <!-- 主体内容 -->
    <main class="content-wrapper" v-if="!loading">

      <!-- 帖子头部 -->
      <div class="post-header">
        <div class="author-info">
          <div class="avatar-wrapper" @click="goProfile">
            <img :src="post.authorAvatar" class="author-avatar" />
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
          <span>{{ post.likeCount }}</span>
        </button>

        <button class="interaction-btn comment-btn" @click="scrollToComment">
          <span class="btn-icon">💬</span>
          <span>{{ post.commentCount }}</span>
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
          <span class="count-badge">{{ post.commentCount }}</span>
        </h3>

        <!-- 发表评论输入框 -->
        <div class="comment-input-area" ref="commentInputArea">
          <div class="input-wrapper">
            <textarea
                v-model="newCommentContent"
                placeholder="说点什么吧... 哪怕是一个表情也好呀"
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

    <!-- 可爱提示 Toast -->
    <transition name="toast-fade">
      <div v-if="toastVisible" class="custom-toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import { getPostById, toggleLike, getLikeStatus } from "@/api/post";
import { getComments, createComment } from "@/api/comment";
import { getCurrentUserInfo } from "@/api/auth";

import CommentItem from "@/components/CommentItem.vue";
import DetailNavBar from "@/components/NavBar/DetailNavBar.vue";
import {ElMessage} from "element-plus";

export default {
  name: "PostDetail",
  components: {
    CommentItem,
    DetailNavBar
  },
  data() {
    return {
      currentUserAvatar: 'http://47.116.108.205:9000/lumecho/avatar.png',
      currentUserName: '神秘用户',
      postId: null,
      loading: true,
      post: {
        title: '',
        content: '',
        userId: null,
        imageUrls: [],
        authorName: '',
        authorAvatar: '',
        createTime: '',
        likeCount: 0,
        commentCount: 0,
        categories: []
      },
      comments: [],
      totalComments: 0,
      currentPage: 1,
      hasMoreComments: true,
      isLiked: false,
      newCommentContent: '',
      replyingTo: null,
      replyingToUsername: '',
      submitting: false,
      toastVisible: false,
      toastMessage: ''
    };
  },
  computed: {
    gridClass() {
      const count = this.post.imageUrls.length;
      if (count === 1) return 'single-image';
      if (count === 2) return 'two-images';
      if (count === 3) return 'three-images';
      if (count === 4) return 'four-images';
      return 'multi-images';
    }
  },
  created() {
    this.postId = this.$route.params.id;
    if (!this.postId) {
      this.loading = false;
      return;
    }
    this.fetchUserInfo();
    this.fetchPostDetail();
    this.fetchComments();
    this.fetchLikeStatus();
  },
  mounted() {
    this.$nextTick(() => {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      window.scrollTo({
        top: 0,
        behavior: "auto"
      })
    })
  },
  methods: {
    goHome() { this.$router.push('/') },
    goProfile() { this.$router.push(`/profile/${this.post.userId}`) },
    goUpload() { this.$router.push('/upload') },

    showToast(msg) {
      this.toastMessage = msg;
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false; }, 2500);
    },

    async fetchLikeStatus() {
      if (!this.postId) return;
      try {
        const res = await getLikeStatus(this.postId);
        this.isLiked = res.data || false;
      } catch (error) {
        console.error('获取点赞状态失败', error);
        this.isLiked = false;
      }
    },

    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        if (res.data.code === 200 || res.data.success) {
          const userInfo = res.data.data;
          this.currentUserAvatar = userInfo.avatar;
          this.currentUserName = userInfo.username;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },

    async fetchPostDetail() {
      try {
        const res = await getPostById(this.postId);
        if (res.data.code === 200 || res.data.success) {
          const data = res.data.data;
          this.post = {
            title: data.title || '无标题',
            content: data.content || '暂无内容',
            likeCount: data.likeCount || 0,
            commentCount: data.commentCount || 0,
            imageUrls: data.imageUrls || [],
            createTime: data.createTime || '',
            authorName: data.username || '神秘摄影师',
            userId: data.userId,
            authorAvatar: data.avatar || 'http://47.116.108.205:9000/lumecho/avatar.png',
            categories: data.categoryName ? [data.categoryName] : []
          };
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
      const originalLiked = this.isLiked;
      const originalCount = this.post.likeCount;

      this.isLiked = !originalLiked;
      this.post.likeCount = originalLiked ? originalCount - 1 : originalCount + 1;

      try {
        await toggleLike(this.postId);
        this.showToast(this.isLiked ? "点赞成功 ❤️" : "已取消点赞");
      } catch (error) {
        this.isLiked = originalLiked;
        this.post.likeCount = originalCount;
        ElMessage.warning('操作失败，请稍后重试');
      }
    },

    scrollToComment() {
      const area = this.$refs.commentInputArea;
      if(area) {
        area.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const textarea = area.querySelector('textarea');
        if(textarea) textarea.focus();
      }
    },

    handleShare() {
      this.showToast("🚀 分享功能正在快马加鞭制作中！");
    },

    handleCollect() {
      this.showToast("⭐ 已加入收藏夹 (模拟)");
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
        this.post.commentCount++
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
.detail-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F0 0%, #FFFFFF 100%);
  font-family: 'Segoe UI', 'Helvetica Neue', 'PingFang SC', sans-serif;
  color: #4A4A5A;
  position: relative;
}

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

/* ==================== 图片布局已完美修复 ==================== */
.media-gallery {
  margin-bottom: 30px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 4px solid #fff;
}
.gallery-grid {
  display: grid;
  gap: 6px;
  background: #f9f9f9;
}
.gallery-item {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
}
.gallery-item:hover {
  transform: scale(1.02);
  z-index: 10;
}

.gallery-grid.single-image {
  grid-template-columns: 1fr;
}
.gallery-grid.single-image .gallery-item {
  max-height: 800px;
}

.gallery-grid.two-images {
  grid-template-columns: 1fr 1fr;
}
.gallery-grid.three-images {
  grid-template-columns: 1fr 1fr 1fr;
}
.gallery-grid.four-images {
  grid-template-columns: 1fr 1fr;
}
.gallery-grid.multi-images {
  grid-template-columns: repeat(3, 1fr);
}

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
  .content-wrapper { margin: 20px auto; padding: 0 16px; }
  .post-title-main { font-size: 1.5rem; }
  .interaction-bar { flex-wrap: wrap; justify-content: center; }
  .interaction-btn { padding: 8px 16px; font-size: 13px; }
}
</style>