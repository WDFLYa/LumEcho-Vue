<template>
  <div class="challenge-page">
    <ChallengeNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
    />

    <main class="content-area">
      <!-- 🔒 权限不足页面（非摄影师/管理员显示） -->
      <div v-if="!isPhotographer" class="forbidden-card warning">
        <div class="forbidden-icon">⚠️</div>
        <h3>权限不足</h3>
        <p>仅认证摄影师或管理员可创建挑战赛</p>
        <button class="back-btn" @click="goBack">返回挑战赛列表</button>
      </div>

      <!-- ✅ 有权限才显示表单 -->
      <div v-else>
        <div class="page-header">
          <h2>✨ 创建新挑战赛</h2>
          <p>设定规则、发布活动，激发社区创作热情</p>
        </div>

        <div class="form-container">
          <form @submit.prevent="handleSubmit" class="challenge-form">

            <!-- 🖼️ 封面上传 -->
            <div class="form-group">
              <label class="form-label">🖼️ 挑战赛封面</label>
              <div class="upload-box" @click="$refs.fileInput.click()" :class="{ 'has-preview': coverPreview }">
                <img v-if="coverPreview" :src="coverPreview" class="cover-img" alt="预览" />
                <div v-else class="upload-placeholder">
                  <span class="icon">📷</span>
                  <span class="text">点击上传封面 (建议 16:9, ≤5MB)</span>
                </div>
                <input ref="fileInput" type="file" accept="image/*" hidden @change="handleCoverUpload" />
              </div>
              <div v-if="uploadingCover" class="upload-status">⏳ 图片上传中...</div>
              <div v-if="coverError" class="upload-error">❌ {{ coverError }}</div>
            </div>

            <!-- 标题 & 详情 -->
            <div class="form-group">
              <label class="form-label">🏷️ 挑战标题</label>
              <input v-model="form.title" type="text" placeholder="例如：秋日风光摄影大赛" class="form-input" required maxlength="50" />
            </div>

            <div class="form-group">
              <label class="form-label">📝 挑战详情</label>
              <textarea v-model="form.description" placeholder="详细描述比赛主题、投稿要求、评选流程等..." class="form-input form-textarea" rows="4" required maxlength="500"></textarea>
            </div>

            <!-- 📜 动态规则列表 -->
            <div class="form-group">
              <label class="form-label">📜 参赛规则 <span class="hint">（提交时自动转为 JSON）</span></label>
              <div class="dynamic-list">
                <div v-for="(rule, idx) in form.rules" :key="'rule-'+idx" class="list-item">
                  <input v-model="form.rules[idx]" class="form-input" placeholder="例如：作品必须为本人原创" />
                  <button type="button" @click="removeItem('rules', idx)" class="remove-btn">✕</button>
                </div>
                <button type="button" @click="addItem('rules')" class="add-btn">+ 添加规则</button>
              </div>
            </div>

            <!-- 🏆 动态奖项列表 -->
            <div class="form-group">
              <label class="form-label">🏆 奖项设置 <span class="hint">（提交时自动转为 JSON）</span></label>
              <div class="dynamic-list">
                <div v-for="(prize, idx) in form.prizes" :key="'prize-'+idx" class="list-item">
                  <input v-model="form.prizes[idx]" class="form-input" placeholder="例如：一等奖：5000元现金 + 官方认证" />
                  <button type="button" @click="removeItem('prizes', idx)" class="remove-btn">✕</button>
                </div>
                <button type="button" @click="addItem('prizes')" class="add-btn">+ 添加奖项</button>
              </div>
            </div>

            <!-- 时间组 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">🚀 开始时间</label>
                <input v-model="form.startTime" type="date" class="form-input date-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">📅 截止时间</label>
                <input v-model="form.endTime" type="date" class="form-input date-input" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">⏱️ 评审结束时间</label>
              <input v-model="form.reviewEndTime" type="date" class="form-input date-input" required />
            </div>

            <!-- 人数限制 -->
            <div class="form-group">
              <label class="form-label">👥 最大参与人数</label>
              <div class="participant-control">
                <input v-model.number="form.maxParticipants" type="number" :disabled="form.unlimited" placeholder="输入人数限制" class="form-input" min="1" />
                <label class="checkbox-label">
                  <input type="checkbox" v-model="form.unlimited" @change="toggleUnlimited" />
                  <span>不限人数</span>
                </label>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? '🚀 发布中...' : '🎉 立即发布挑战' }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import ChallengeNavBar from "@/components/NavBar/ChallengeNavBar.vue";
import { createChallenge } from "@/api/challenge";
import { uploadFile } from "@/api/file";
import { ElMessage } from 'element-plus';

export default {
  name: "ChallengeCreate",
  components: { ChallengeNavBar },
  data() {
    return {
      currentUserAvatar: localStorage.getItem('user_avatar') || 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: localStorage.getItem('user_name') || '摄影师',

      isSubmitting: false,
      uploadingCover: false,
      coverError: '',
      coverPreview: '',
      form: {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        reviewEndTime: '',
        maxParticipants: 50,
        unlimited: false,
        coverUrl: '',
        rules: [''],
        prizes: ['']
      }
    };
  },

  computed: {
    isPhotographer() {
      const role = (localStorage.getItem('user_role') || '').trim().toUpperCase();
      return role === 'ADMIN' || role === 'PHOTOGRAPHER';
    }
  },

  mounted() {
    if (!this.isPhotographer) {
      // 这里改成警告，不是错误
      ElMessage.warning('⚠️ 仅摄影师/管理员可创建挑战赛');
    }
  },

  methods: {
    goBack() {
      this.$router.push('/challenge');
    },

    toggleUnlimited() {
      this.form.maxParticipants = this.form.unlimited ? -1 : 50;
    },
    formatDateToDayStart(dateStr) {
      if (!dateStr) return '';
      return dateStr + ' 00:00:00';
    },
    addItem(type) { this.form[type].push(''); },
    removeItem(type, index) {
      this.form[type].splice(index, 1);
      if (this.form[type].length === 0) this.form[type].push('');
    },
    async handleCoverUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.coverError = '仅支持图片格式';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.coverError = '图片大小不能超过 5MB';
        return;
      }

      this.uploadingCover = true;
      this.coverError = '';
      try {
        const res = await uploadFile(file, 'CHALLENGE_COVER');
        const url = res.data?.data || res.data;
        if (res.data?.code === 200 || res.code === 200) {
          this.form.coverUrl = url;
          this.coverPreview = URL.createObjectURL(file);
          ElMessage.success('🖼️ 封面上传成功');
        } else {
          throw new Error(res.data?.message || '上传接口返回异常');
        }
      } catch (err) {
        console.error('Cover Upload Error:', err);
        this.coverError = err.message || '网络异常，上传失败';
      } finally {
        this.uploadingCover = false;
        e.target.value = '';
      }
    },
    validateTime() {
      const start = new Date(this.form.startTime);
      const end = new Date(this.form.endTime);
      const reviewEnd = new Date(this.form.reviewEndTime);
      if (end <= start) { ElMessage.warning('❌ 截止时间必须晚于开始时间'); return false; }
      if (reviewEnd <= end) { ElMessage.warning('❌ 评审结束时间必须晚于截止时间'); return false; }
      return true;
    },

    async handleSubmit() {
      if (!this.isPhotographer) {
        ElMessage.warning('⚠️ 权限不足，无法发布');
        return;
      }

      if (!this.validateTime()) return;
      if (!this.form.coverUrl) {
        ElMessage.warning('🖼️ 请先上传挑战赛封面图');
        return;
      }

      this.isSubmitting = true;
      try {
        const payload = {
          title: this.form.title.trim(),
          description: this.form.description.trim(),
          coverUrl: this.form.coverUrl,
          rules: JSON.stringify(this.form.rules.filter(r => r.trim())),
          prizes: JSON.stringify(this.form.prizes.filter(p => p.trim())),
          startTime: this.formatDateToDayStart(this.form.startTime),
          endTime: this.formatDateToDayStart(this.form.endTime),
          reviewEndTime: this.formatDateToDayStart(this.form.reviewEndTime),
          maxParticipants: this.form.unlimited ? -1 : this.form.maxParticipants
        };

        const res = await createChallenge(payload);
        const isSuccess = res.data?.code === 200 || res.code === 200 || res.status === 200;

        if (isSuccess) {
          ElMessage.success('✅ 挑战赛创建成功！即将返回列表页...');
          setTimeout(() => this.$router.push('/challenge'), 800);
        } else {
          ElMessage.error(res.data?.message || res.message || '❌ 创建失败');
        }
      } catch (error) {
        console.error('API Error:', error);
        const errData = error.response?.data || error;
        if (errData.code === 703) {
          ElMessage.warning('🔒 ' + (errData.message || '权限不足'));
          setTimeout(() => this.$router.replace('/challenge'), 1200);
        } else {
          ElMessage.error('❌ ' + (errData.message || '网络请求失败'));
        }
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
/* 🔒 警告风格权限卡片 */
.forbidden-card {
  background: #fff;
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(106, 27, 154, 0.08);
  margin-top: 20px;
}
.forbidden-card.warning {
  border: 1px solid #B39DDB;
  background: #F3E5F5;
}
.forbidden-icon {
  font-size: 52px;
  margin-bottom: 20px;
  color: #8E24AA;
}
.forbidden-card h3 {
  font-size: 24px;
  color: #6A1B9A;
  margin: 0 0 12px;
  font-weight: 900;
}
.forbidden-card p {
  color: #8E24AA;
  font-size: 15px;
  margin-bottom: 28px;
}
.back-btn {
  padding: 14px 32px;
  border-radius: 14px;
  background: linear-gradient(135deg, #AB47BC, #8E24AA);
  color: #fff;
  font-weight: 800;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(142, 36, 170, 0.2);
  transition: all 0.3s;
}
.back-btn:hover {
  transform: translateY(-2px);
}

/* 原有样式不动 */
.challenge-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F3E5F5 0%, #FFFFFF 100%);
  font-family: 'Nunito', 'Segoe UI', system-ui, sans-serif;
  color: #4A148C;
}
.content-area { max-width: 800px; margin: 0 auto; padding: 40px 20px 60px; }
.page-header { text-align: center; margin-bottom: 40px; }
.page-header h2 { font-size: 2.2rem; margin: 0 0 10px 0; color: #6A1B9A; font-weight: 900; }
.page-header p { color: #8E24AA; font-size: 1rem; margin: 0; }

.form-container {
  background: #FFF; border-radius: 24px; padding: 40px;
  box-shadow: 0 8px 30px rgba(106, 27, 154, 0.08); border: 1px solid #F3E5F5;
}
.challenge-form { display: flex; flex-direction: column; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-label { font-size: 14px; font-weight: 700; color: #6A1B9A; margin-left: 4px; display: flex; align-items: center; gap: 6px; }
.hint { font-size: 12px; font-weight: 400; color: #9E9E9E; }

.form-input {
  width: 100%; padding: 14px 18px; border: 2px solid #E1BEE7; border-radius: 16px;
  font-family: inherit; font-size: 15px; color: #4A148C; background: #FAFAFA;
  transition: all 0.3s ease; outline: none; box-sizing: border-box;
}
.form-input:focus { border-color: #AB47BC; background: #FFF; box-shadow: 0 0 0 4px rgba(171, 71, 188, 0.15); }
.form-input::placeholder { color: #9E9E9E; }
.form-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
input[type="datetime-local"] { appearance: none; cursor: pointer; }

.date-input {
  color: #6A1B9A;
  cursor: pointer;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  background-color: #E1BEE7;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
  background-color: #AB47BC;
  opacity: 1;
}

.upload-box {
  width: 100%; height: 180px; border: 2px dashed #E1BEE7; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: #FAFAFA; transition: all 0.3s; overflow: hidden; position: relative;
}
.upload-box:hover { border-color: #AB47BC; background: #FCE4EC; }
.upload-box.has-preview { border-style: solid; border-color: #AB47BC; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; color: #8E24AA; }
.upload-placeholder .icon { font-size: 32px; margin-bottom: 8px; }
.upload-status { font-size: 13px; color: #AB47BC; margin-top: 6px; }
.upload-error { font-size: 13px; color: #E53935; margin-top: 6px; }

.dynamic-list { display: flex; flex-direction: column; gap: 10px; }
.list-item { display: flex; gap: 10px; align-items: center; }
.list-item .form-input { flex: 1; }
.remove-btn {
  width: 36px; height: 36px; border: none; background: #F5F5F5; color: #9E9E9E;
  border-radius: 50%; cursor: pointer; font-size: 16px; transition: all 0.2s;
}
.remove-btn:hover { background: #FFEBEE; color: #E53935; transform: scale(1.1); }
.add-btn {
  align-self: flex-start; padding: 8px 16px; border: 2px dashed #CE93D8;
  background: #F3E5F5; color: #8E24AA; border-radius: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; font-size: 13px;
}
.add-btn:hover { background: #E1BEE7; border-color: #AB47BC; }

.participant-control { display: flex; align-items: center; gap: 16px; }
.participant-control .form-input { flex: 1; }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: #8E24AA; user-select: none; white-space: nowrap; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #AB47BC; cursor: pointer; }

.submit-btn {
  margin-top: 16px; padding: 16px; border: none; border-radius: 16px;
  background: linear-gradient(135deg, #AB47BC, #8E24AA); color: #FFF;
  font-family: inherit; font-size: 16px; font-weight: 800; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 6px 20px rgba(142, 36, 170, 0.3);
}
.submit-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(142, 36, 170, 0.4); }
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; background: #B39DDB; }

@media (max-width: 768px) {
  .content-area { padding: 30px 16px 50px; }
  .form-container { padding: 24px; }
  .form-row { grid-template-columns: 1fr; gap: 24px; }
  .page-header h2 { font-size: 1.8rem; }
}
</style>