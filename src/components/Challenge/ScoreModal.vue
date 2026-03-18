<template>
  <transition name="modal-fade">
    <div v-if="visible" class="score-modal-overlay" @click.self="close">
      <div class="score-modal">
        <!-- 关闭按钮 -->
        <button class="modal-close" @click="close">×</button>

        <div class="modal-content">
          <!-- 左侧：作品大图 (已修复黑边问题) -->
          <div class="modal-left">
            <div class="work-image-container">
              <img
                  :src="submission?.coverUrl || 'https://via.placeholder.com/800x600?text=No+Image'"
                  class="work-image"
                  alt="作品封面"
              />

              <div class="work-overlay-info">
                <h3 class="work-title">{{ submission?.title }}</h3>
                <p class="work-author">📍 {{ submission?.location }}</p>

                <!-- 如果已打分，左下角也显示一个小分数徽章 -->
                <div class="work-score-display" v-if="hasScored">
                  <span class="score-icon">🏆</span>
                  <span class="score-value">{{ currentScore }}</span>
                  <span class="score-unit">分</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：交互区域 -->
          <div class="modal-right">
            <div class="rating-header">
              <span class="rating-icon">⭐</span>
              <h3 class="rating-title">{{ hasScored ? '评分已完成' : '为作品评分' }}</h3>
            </div>

            <!-- 状态 A：未评分 -> 显示输入表单 -->
            <div v-if="!hasScored" class="rating-interaction">
              <!-- 星级选择 -->
              <div class="rating-section">
                <label class="rating-label">你的评分</label>
                <div class="star-rating">
                  <span
                      v-for="star in 5"
                      :key="star"
                      class="star"
                      :class="{ active: star <= rating }"
                      @click="rating = star"
                  >
                    {{ star <= rating ? '⭐' : '☆' }}
                  </span>
                  <span class="rating-value">{{ rating * 2 }} 分</span>
                </div>
              </div>

              <!-- 评语输入 -->
              <div class="comment-section">
                <label class="comment-label">评语</label>
                <textarea
                    v-model="comment"
                    placeholder="说说你的看法，鼓励一下作者..."
                    rows="4"
                    maxlength="200"
                    class="comment-input"
                ></textarea>
                <span class="char-count">{{ comment.length }}/200</span>
              </div>

              <!-- 底部操作按钮 -->
              <div class="modal-actions">
                <button class="btn-cancel" @click="close">取消</button>
                <button
                    class="btn-submit"
                    @click="submit"
                    :disabled="submitting || rating === 0"
                >
                  <span v-if="submitting" class="btn-content-loading">
                    <span class="spinner-small"></span> 提交中...
                  </span>
                  <span v-else>提交评分</span>
                </button>
              </div>
            </div>

            <!-- 状态 B：已评分 -> 显示结果卡片 (提交后自动切换到此视图，不关闭弹窗) -->
            <div v-else class="rated-result">
              <div class="result-score-box">
                <span class="result-label">你给出的评分</span>
                <div class="result-big-score">
                  <span class="score-icon-lg">🏆</span>
                  <span class="score-value-lg">{{ currentScore }}</span>
                  <span class="score-unit-lg">分</span>
                </div>
                <div class="result-stars">
                  {{ '⭐'.repeat(Math.ceil(currentScore / 2)) }}{{ '☆'.repeat(5 - Math.ceil(currentScore / 2)) }}
                </div>
                <p class="result-hint">感谢你的专业评审！</p>
              </div>

              <div class="comment-section readonly">
                <label class="comment-label">你的评语</label>
                <div class="comment-display">
                  {{ comment || '暂无评语' }}
                </div>
              </div>

              <div class="modal-actions">
                <button class="btn-cancel" style="width: 100%; justify-content: center;" @click="close">关闭窗口</button>
              </div>
            </div>

            <!-- 历史评分列表 (始终显示在底部) -->
            <div class="scores-history" v-if="submission?.scores && submission.scores.length > 0">
              <h4 class="history-title">💬 其他评委评分 ({{ submission.scores.length }})</h4>
              <div class="scores-list">
                <div v-for="score in submission.scores" :key="score.id" class="score-item">
                  <img :src="score.judgeAvatar" class="score-avatar" alt="avatar" />
                  <div class="score-content">
                    <div class="score-header">
                      <span class="score-author">{{ score.judgeName }}</span>
                      <span class="score-stars">⭐ {{ score.score }}</span>
                    </div>
                    <p class="score-comment" v-if="score.comment">{{ score.comment }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 自定义 Toast 提示 -->
        <transition name="toast-fade">
          <div v-if="toast.show" :class="['custom-toast', toast.type]">
            <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
            {{ toast.message }}
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ScoreModal',
  props: {
    visible: Boolean,
    submission: Object
  },
  data() {
    return {
      rating: 0,
      comment: '',
      submitting: false,
      hasScored: false, // 控制显示“输入表单”还是“结果卡片”
      currentScore: 0,
      toast: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetForm();
        // 初始化检查：如果后端传回了当前用户的评分，直接显示结果
        if (this.submission && this.submission.userScore) {
          this.hasScored = true;
          this.currentScore = this.submission.userScore;
          this.comment = this.submission.userComment || '';
          this.rating = Math.ceil(this.currentScore / 2);
        } else {
          this.hasScored = false;
        }
      }
    }
  },
  methods: {
    resetForm() {
      this.rating = 0;
      this.comment = '';
      this.submitting = false;
      this.hasScored = false;
      this.currentScore = 0;
      this.toast.show = false;
    },
    close() {
      // 只负责关闭，不负责提交逻辑
      this.$emit('update:visible', false);
    },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },
    submit() {
      if (this.rating === 0) {
        this.showToast('请先点亮星星评分哦', 'error');
        return;
      }

      this.submitting = true;

      // 模拟网络请求 (实际使用时请替换为你的 API 调用)
      setTimeout(() => {
        const finalScore = this.rating * 2;

        // 1. 通知父组件进行保存
        this.$emit('submit', {
          submissionId: this.submission.id,
          score: finalScore,
          comment: this.comment.trim()
        });

        this.submitting = false;

        // 2. 【关键】切换内部状态为“已评分”，弹窗保持打开！
        this.hasScored = true;
        this.currentScore = finalScore;

        // 3. 显示成功提示
        this.showToast('评分提交成功！🎉', 'success');

        // 注意：这里没有调用 this.close()，所以弹窗不会消失
      }, 800);
    }
  }
};
</script>

<style scoped>
/* --- 遮罩层 --- */
.score-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* --- 弹窗主体 --- */
.score-modal {
  background: #FFF;
  border-radius: 24px;
  width: 100%;
  max-width: 1100px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideUp {
  from { transform: translateY(50px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* --- 关闭按钮 --- */
.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover {
  background: #FFF;
  color: #E57373;
  transform: scale(1.1);
}

/* --- 内容布局 --- */
.modal-content {
  display: flex;
  height: 100%;
  max-height: 85vh;
  overflow: hidden;
}

/* --- 左侧图片区 (修复黑边) --- */
.modal-left {
  flex: 7;
  background: #000;
  position: relative;
  overflow: hidden; /* 防止图片溢出圆角 */
}

.work-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.work-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：填满容器，裁剪多余部分，无黑边 */
  display: block;
}

.work-overlay-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  padding: 40px 30px 25px;
  color: #FFF;
  z-index: 2;
}

.work-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.work-author {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 12px 0;
}

.work-score-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}
.score-icon { font-size: 18px; }
.score-value { font-size: 24px; font-weight: 800; color: #FFD93D; }
.score-unit { font-size: 14px; opacity: 0.9; }

/* --- 右侧面板 --- */
.modal-right {
  flex: 3;
  padding: 30px;
  overflow-y: auto;
  background: #FFF;
  min-width: 320px;
  display: flex;
  flex-direction: column;
}

.rating-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #F0F0F0;
}
.rating-icon { font-size: 28px; }
.rating-title { font-size: 20px; font-weight: 800; color: #4A148C; margin: 0; }

.rating-interaction, .rated-result {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* --- 评分交互区 --- */
.rating-section { margin-bottom: 25px; }
.rating-label { display: block; font-size: 13px; font-weight: 700; color: #555; margin-bottom: 12px; }

.star-rating { display: flex; align-items: center; gap: 6px; }
.star {
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s;
  filter: grayscale(100%);
  user-select: none;
}
.star:hover { transform: scale(1.15); }
.star.active { filter: grayscale(0%); }
.rating-value { font-size: 18px; font-weight: 700; color: #AB47BC; margin-left: 10px; min-width: 55px; }

/* --- 评语区 --- */
.comment-section { margin-bottom: 25px; }
.comment-label { display: block; font-size: 13px; font-weight: 700; color: #555; margin-bottom: 10px; }

.comment-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #E0E0E0;
  border-radius: 14px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
  background: #F8F9FA;
}
.comment-input:focus {
  border-color: #AB47BC;
  box-shadow: 0 0 0 4px rgba(171, 71, 188, 0.1);
  background: #FFF;
}

.comment-display {
  background: #F8F9FA;
  padding: 14px;
  border-radius: 14px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  min-height: 80px;
  border: 1px solid #E0E0E0;
}

.char-count { display: block; text-align: right; font-size: 11px; color: #999; margin-top: 6px; }

/* --- 结果展示卡片 --- */
.result-score-box {
  text-align: center;
  padding: 25px 20px;
  background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
  border-radius: 16px;
  margin-bottom: 25px;
  border: 1px solid #CE93D8;
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.result-label { font-size: 12px; color: #6A1B9A; font-weight: 600; display: block; margin-bottom: 8px; }
.result-big-score { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
.score-icon-lg { font-size: 24px; }
.score-value-lg { font-size: 42px; font-weight: 900; color: #6A1B9A; line-height: 1; }
.score-unit-lg { font-size: 16px; color: #6A1B9A; font-weight: 700; }
.result-stars { font-size: 20px; letter-spacing: 2px; margin-bottom: 8px; }
.result-hint { font-size: 12px; color: #8E24AA; opacity: 0.8; margin: 0; }

/* --- 历史评分列表 --- */
.scores-history {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E0E0E0;
  flex: 1;
  overflow-y: auto;
  min-height: 150px;
}
.history-title { font-size: 13px; font-weight: 700; color: #666; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; }
.scores-list { display: flex; flex-direction: column; gap: 10px; }
.score-item { display: flex; gap: 10px; padding: 10px; background: #F8F9FA; border-radius: 10px; transition: all 0.2s; }
.score-item:hover { background: #F0F0F0; }
.score-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.score-content { flex: 1; min-width: 0; }
.score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.score-author { font-size: 12px; font-weight: 700; color: #333; }
.score-stars { font-size: 11px; font-weight: 700; color: #AB47BC; }
.score-comment { font-size: 12px; color: #555; line-height: 1.4; margin: 0; }

/* --- 按钮组 --- */
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 15px;
  margin-top: auto;
}

.btn-cancel {
  padding: 10px 20px;
  background: #F5F5F5;
  color: #666;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: #EEEEEE; }

.btn-submit {
  padding: 10px 28px;
  background: linear-gradient(135deg, #AB47BC 0%, #8E24AA 100%);
  color: #FFF;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(171, 71, 188, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(171, 71, 188, 0.4); }
.btn-submit:disabled { background: #CFD8DC; cursor: not-allowed; box-shadow: none; }

.btn-content-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #FFF;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* --- Toast 提示 --- */
.custom-toast {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 50px;
  color: #FFF;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
}
.custom-toast.success { background: rgba(76, 175, 80, 0.95); }
.custom-toast.error { background: rgba(244, 67, 54, 0.95); }

.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-fade-enter-from { opacity: 0; transform: translate(-50%, -20px); }
.toast-fade-leave-to { opacity: 0; transform: translate(-50%, -40px); }

/* --- 动画 --- */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* --- 响应式 --- */
@media (max-width: 900px) {
  .modal-content { flex-direction: column; }
  .modal-left { min-height: 300px; flex: none; }
  .modal-right { padding: 25px; min-width: auto; }
  .work-overlay-info { padding: 25px 20px 20px; }
  .work-title { font-size: 18px; }
  .star { font-size: 28px; }
}
</style>