<template>
  <div class="comment-item">
    <div class="comment-body">
      <!-- 头像：精致边框 + 悬浮感 -->
      <div class="avatar-box" @click="goProfile(comment.userId)">
        <img
            :src="comment.avatar || 'https://ui-avatars.com/api/?name=User&background=random'"
            class="comment-avatar"
            alt="avatar"
        />
      </div>

      <div class="comment-content">
        <div class="comment-header">
          <span class="c-name" @click="goProfile(comment.userId)">
            {{ comment.username }}
          </span>
          <span class="c-time">
            <span class="time-icon">🕒</span>
            {{ comment.createTimeAgo || formatTime(comment.createTime) }}
          </span>
        </div>

        <div class="c-text">
          <span
              v-if="comment.targetUsername"
              class="reply-tag"
              @click.stop="goProfile(comment.targetUserId)"
          >
            @{{ comment.targetUsername }}
          </span>
          <span class="text-content">{{ comment.content }}</span>
        </div>

        <div class="c-actions">
          <button class="action-btn" @click="handleReply">
            <span class="btn-icon">💬</span>
            <span>回复</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 子评论容器：静态背景，不再随鼠标变色 -->
    <div v-if="comment.children && comment.children.length > 0" class="replies-container">
      <CommentItem
          v-for="child in comment.children"
          :key="child.id"
          :comment="child"
          @reply="$emit('reply', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: { type: Object, required: true }
  },
  emits: ['reply'],
  methods: {
    handleReply() { this.$emit('reply', this.comment); },
    goProfile(userId) { if(userId) this.$router.push(`/profile/${userId}`); },
    formatTime(dateStr) {
      if (!dateStr) return '';
      return dateStr.replace('T', ' ').substring(0, 16);
    }
  }
};
</script>

<style scoped>
/* --- 配色定义：静谧、通透 --- */

.comment-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding-bottom: 24px;
}

/* 1. 头像：双层边框效果 */
.avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  background: #fff;
  border: 2px solid #fff;
  box-shadow:
      0 0 0 1px #E2E8F0,
      0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.avatar-box:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow:
      0 0 0 1px #CBD5E1,
      0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.comment-avatar {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.c-name {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
  cursor: pointer;
  transition: color 0.2s;
}
.c-name:hover {
  color: #3b82f6;
}

.c-time {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 5px;
  font-feature-settings: "tnum";
}
.time-icon {
  font-size: 12px;
  opacity: 0.8;
}

.c-text {
  font-size: 15px;
  line-height: 1.7;
  color: #334155;
  word-break: break-word;
  white-space: pre-wrap;
  margin-bottom: 10px;
  letter-spacing: 0.01em;
}

/* 2. @标签：清透冰川蓝 */
.reply-tag {
  display: inline-flex;
  align-items: center;
  background-color: #F0F9FF;
  color: #0369A1;
  padding: 2px 9px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(14, 165, 233, 0.1);
}

.reply-tag:hover {
  background-color: #E0F2FE;
  color: #075985;
  transform: translateY(-1px);
}

/* 3. 回复按钮：云雾灰 -> 岩灰 (无死黑) */
.c-actions { margin-top: 4px; }

.action-btn {
  background-color: #F8FAFC !important;
  color: #64748B !important;

  border: 1px solid #E2E8F0;
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  backdrop-filter: blur(4px);
}

.btn-icon {
  font-size: 14px;
  line-height: 1;
  transition: transform 0.25s;
}

.action-btn:hover {
  background-color: #F1F5F9 !important;
  color: #475569 !important;
  border-color: #CBD5E1 !important;
  transform: translateY(-2px);
  box-shadow:
      0 4px 6px -1px rgba(148, 163, 184, 0.2),
      0 2px 4px -1px rgba(148, 163, 184, 0.1);
}

.action-btn:hover .btn-icon {
  transform: scale(1.15) rotate(-5deg);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 4. 子评论容器：永久静态背景，移除 hover 变色 */
.replies-container {
  margin-left: 60px;
  /* 固定背景色，不再变化 */
  background-color: #F8FAFC;
  border-left: 2px solid #E2E8F0;
  padding: 16px 16px 16px 20px;
  border-radius: 12px;
  margin-top: -10px;
  margin-bottom: 10px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 移除了 transition，因为不需要颜色过渡了 */
}

/* ⚠️ 已移除 .replies-container:hover 样式，保持绝对静止 */

/* 递归重置 */
.replies-container .replies-container {
  margin-left: 0 !important;
  border-left: none !important;
  padding: 0 !important;
  background-color: transparent !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  border-radius: 0 !important;
}

@media (max-width: 768px) {
  .avatar-box { width: 40px; height: 40px; }
  .replies-container {
    margin-left: 52px;
    padding: 12px 12px 12px 16px;
  }
}
</style>