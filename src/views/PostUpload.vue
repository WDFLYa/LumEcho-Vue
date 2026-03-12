<template>
  <div class="upload-page-container">
    <!-- 1. 导航栏 -->
    <UploadNavBar
        :user-name="currentUser.name"
        :user-avatar="currentUser.avatar"
        @upload="scrollToTop"
        @profile="goProfile"
    />

    <div class="main-content">
      <!-- 左侧：编辑区 (占据主要空间) -->
      <div class="editor-section">

        <!-- 1. 媒体上传区 -->
        <div class="upload-card glass-panel">
          <div class="card-header">
            <h3 class="section-title">📸 上传你的灵感</h3>
            <span class="hint">支持 JPG, PNG, HEIC</span>
          </div>

          <div
              class="dropzone"
              :class="{ 'is-dragging': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
          >
            <input
                type="file"
                ref="fileInput"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
            />

            <div v-if="uploadedFiles.length === 0" class="empty-state">
              <div class="icon-bounce">🎨</div>
              <p class="drop-text">拖拽图片到这里，或 <span class="highlight">点击上传</span></p>
              <span class="sub-hint">让全世界看到你的作品 ✨</span>
            </div>

            <!-- 预览列表 -->
            <div v-else class="preview-grid">
              <div v-for="(file, index) in uploadedFiles" :key="index" class="preview-item">
                <img :src="file.previewUrl" alt="preview" />
                <button class="remove-btn" @click.stop="removeFile(index)">×</button>
                <div v-if="file.uploading" class="upload-progress">
                  <div class="bar" :style="{ width: file.progress + '%' }"></div>
                </div>
              </div>

              <!-- 继续添加 -->
              <div class="add-more" @click.stop="triggerFileInput">
                <span class="plus-icon">+</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 基本信息区 -->
        <div class="info-card glass-panel">
          <h3 class="section-title">✍️ 讲述故事</h3>

          <!-- 标题 -->
          <div class="form-group">
            <label class="form-label">标题</label>
            <input
                v-model="form.title"
                type="text"
                placeholder="给你的作品起个好听的名字..."
                maxlength="50"
                class="input-field"
            />
            <div class="char-count">{{ form.title.length }}/50</div>
          </div>

          <!-- 分类选择 -->
          <div class="form-group">
            <label class="form-label">选择分类 <span class="required">*</span></label>
            <div class="category-selector">
              <button
                  v-for="cat in categories"
                  :key="cat.id"
                  class="cat-option"
                  :class="{ active: form.categoryId === cat.id }"
                  @click="form.categoryId = cat.id"
                  :disabled="cat.status !== 1"
              >
                <span class="cat-icon">{{ getCategoryIcon(cat.name) }}</span>
                {{ cat.name }}
              </button>
              <div v-if="categories.length === 0" class="loading-cat">正在加载分类...</div>
            </div>
            <div v-if="errors.categoryId" class="error-msg">{{ errors.categoryId }}</div>
          </div>

          <!-- 内容描述 -->
          <div class="form-group">
            <label class="form-label">创作灵感 <span class="required">*</span></label>
            <div class="textarea-wrapper">
              <textarea
                  v-model="form.content"
                  placeholder="分享拍摄时的心情、参数或是背后的故事..."
                  rows="6"
                  class="input-field textarea"
              ></textarea>
              <button class="ai-btn" @click="generateAIDescription" title="AI 帮忙写">
                ✨ AI 润色
              </button>
            </div>
            <div v-if="errors.content" class="error-msg">{{ errors.content }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧：实时预览区 (布局优化：不再悬浮，而是自然流式布局或固定列) -->
      <div class="preview-section">
        <!-- 包装器：确保在长页面中也能稳定显示 -->
        <div class="preview-wrapper">
          <div class="preview-card glass-panel">
            <h3 class="section-title">👁️ 预览效果</h3>
            <div class="preview-mockup">
              <div class="mockup-header">
                <img :src="currentUser.avatar" class="mockup-avatar" onerror="this.src='http://localhost:9000/specialty/avatar.png'" />
                <div class="mockup-info">
                  <div class="mockup-name">{{ currentUser.name }}</div>
                  <div class="mockup-time">刚刚发布</div>
                </div>
              </div>
              <div class="mockup-title">{{ form.title || '作品标题' }}</div>
              <div class="mockup-image-container">
                <img v-if="uploadedFiles[0]" :src="uploadedFiles[0].previewUrl" class="mockup-img" />
                <div v-else class="mockup-placeholder">
                  <span style="font-size: 24px; opacity: 0.5;">🖼️</span>
                  <p>图片将显示在这里</p>
                </div>
              </div>
              <div class="mockup-content">{{ form.content || '你的故事将显示在这里...' }}</div>
              <div class="mockup-tags">
                <span class="tag-pill">{{ getCategoryName(form.categoryId) || '分类' }}</span>
              </div>
              <div class="mockup-actions">
                <span class="action-icon">❤️</span>
                <span class="action-icon">💬</span>
                <span class="action-icon">⭐</span>
              </div>
            </div>
          </div>

          <!-- 重新设计的提交按钮：现代、简洁、专业 -->
          <button class="submit-btn-modern" @click="handleSubmit" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner"></span>
            <span v-else>确认发布</span>
            <svg v-if="!isSubmitting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import UploadNavBar from '@/components/NavBar/UploadNavBar.vue'; // 确保路径正确
import { getCurrentUserInfo } from "@/api/auth";
import { getAllCategories } from '@/api/category'

export default {
  name: "PostUpload",
  components: { UploadNavBar },
  data() {
    return {
      currentUser: {
        name: '神秘摄影师', // 默认值
        avatar: 'http://localhost:9000/specialty/avatar.png' // 默认值
      },
      form: {
        title: '',
        content: '',
        categoryId: null,
        imageUrls: []
      },
      categories: [],
      uploadedFiles: [],
      isDragging: false,
      isSubmitting: false,
      errors: {}
    };
  },
  mounted() {
    this.fetchUserInfo();
    this.fetchCategories();
  },
  methods: {
    // 获取用户信息
    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        if (res.data.code === 200 || res.data.success) {
          const data = res.data.data;
          if (data) {
            this.currentUser.name = data.username || '神秘摄影师';
            // 如果后端返回的 avatar 为空，则使用默认图
            this.currentUser.avatar = data.avatar || 'http://localhost:9000/specialty/avatar.png';
          }
        }
      } catch (error) {
        console.warn('获取用户信息失败，使用默认值', error);
        // 保持默认值不变
      }
    },

    async fetchCategories() {
      try {
        const res = await getAllCategories();
        if (res.data.code === 200 || res.data.success) {
          this.categories = res.data.data || [];
        }
      } catch (error) {
        console.error('获取分类失败', error);
      }
    },

    getCategoryIcon(name) {
      const map = {
        '人像': '👤', '风景': '🏔️', '纪实': '📰',
        '动漫': '🎨', '建筑': '🏛️', '动物': '🐾',
        '其他': '✨'
      };
      return map[name] || '🏷️';
    },

    getCategoryName(id) {
      const cat = this.categories.find(c => c.id === id);
      return cat ? cat.name : '';
    },

    triggerFileInput() { this.$refs.fileInput.click(); },
    handleFileSelect(e) { this.processFiles(Array.from(e.target.files)); },
    handleFileDrop(e) {
      this.isDragging = false;
      this.processFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    },
    processFiles(files) {
      files.forEach(file => {
        if (file.size > 20 * 1024 * 1024) return alert('文件太大啦 (>20MB)');
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedFiles.push({
            file, previewUrl: e.target.result, progress: 0, uploading: false, serverUrl: null
          });
        };
        reader.readAsDataURL(file);
      });
    },
    removeFile(index) { this.uploadedFiles.splice(index, 1); },

    async uploadImages() {
      // 👇 预留真实上传逻辑
      for (let item of this.uploadedFiles) {
        if (!item.serverUrl) {
          item.uploading = true;
          // 模拟上传延迟
          await new Promise(r => setTimeout(r, 800));
          item.progress = 100;
          item.serverUrl = item.previewUrl; // 模拟成功
          item.uploading = false;
        }
      }
      return this.uploadedFiles.map(f => f.serverUrl);
    },

    async generateAIDescription() {
      this.form.content = "✨ AI 正在构思中...";
      setTimeout(() => {
        this.form.content = "光影在这一刻凝固，仿佛时间也停止了流动。这不仅仅是一张照片，更是我对这个世界独特的观察与感悟。";
      }, 1000);
    },

    scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); },
    goProfile() { this.$router.push('/profile'); },

    async handleSubmit() {
      this.errors = {};
      let valid = true;
      if (!this.form.title.trim()) { this.errors.title = '标题不能为空'; valid = false; }
      if (!this.form.content.trim()) { this.errors.content = '内容不能为空'; valid = false; }
      if (!this.form.categoryId) { this.errors.categoryId = '别忘了选个分类哦'; valid = false; }
      if (this.uploadedFiles.length === 0) { alert('先上传图片吧！'); return; }
      if (!valid) return;

      this.isSubmitting = true;
      try {
        const urls = await this.uploadImages();
        const payload = {
          title: this.form.title,
          content: this.form.content,
          categoryId: this.form.categoryId,
          imageUrls: urls
        };

        const res = await axios.post('/api/post/publish', payload);
        if (res.data.code === 200 || res.data.success) {
          // 可以使用更优雅的提示组件代替 alert
          alert('发布成功！🎉 你的作品闪闪发光啦！');
          this.$router.push('/home');
        } else {
          alert('发布失败：' + (res.data.msg || '未知错误'));
        }
      } catch (e) {
        console.error(e);
        alert('网络开小差了，请稍后再试');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
/* --- 全局布局 --- */
.upload-page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F5 0%, #F3F0FF 100%);
  color: #444;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding-bottom: 60px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 340px; /* 固定右侧宽度 */
  gap: 40px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
  align-items: start; /* 关键：防止拉伸 */
}

/* --- 卡片通用样式 --- */
.glass-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 40px rgba(108, 99, 255, 0.08);
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #222;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.hint {
  font-size: 12px;
  color: #999;
  background: #f5f5f7;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

/* --- 上传区域 --- */
.dropzone {
  border: 2px dashed #E0E7FF;
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.dropzone:hover, .dropzone.is-dragging {
  border-color: #6C63FF;
  background: rgba(108, 99, 255, 0.04);
  transform: translateY(-2px);
}
.icon-bounce {
  font-size: 3.5rem;
  margin-bottom: 16px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}
.drop-text { font-size: 17px; color: #555; font-weight: 600; margin: 0 0 8px 0; }
.highlight { color: #6C63FF; text-decoration: underline; text-underline-offset: 4px; }
.sub-hint { display: block; font-size: 13px; color: #999; }

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 16px;
}
.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s;
}
.preview-item:hover { transform: scale(1.03); }
.preview-item img { width: 100%; height: 100%; object-fit: cover; }
.remove-btn {
  position: absolute;
  top: 8px; right: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: none;
  width: 28px; height: 28px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.remove-btn:hover { transform: scale(1.1); }
.add-more {
  display: flex; align-items: center; justify-content: center;
  background: #F3F0FF;
  border-radius: 16px;
  color: #6C63FF;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.2s;
  aspect-ratio: 1;
}
.add-more:hover { background: #E5E0FF; transform: scale(1.05); }

/* --- 表单样式 --- */
.form-group { margin-bottom: 28px; }
.form-label {
  display: block;
  font-weight: 700;
  margin-bottom: 12px;
  color: #333;
  font-size: 15px;
}
.required { color: #FF6B6B; margin-left: 4px; }

.input-field {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #F0F0F0;
  border-radius: 16px;
  font-size: 15px;
  background: #fff;
  transition: all 0.3s;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  color: #333;
}
.input-field:focus {
  border-color: #A596FF;
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.08);
}
.textarea { resize: vertical; min-height: 160px; line-height: 1.6; }
.char-count { text-align: right; font-size: 12px; color: #aaa; margin-top: 8px; font-weight: 500; }

/* 分类选择器 */
.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.cat-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #F0F0F0;
  background: #fff;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cat-option:hover:not(:disabled) {
  border-color: #FFB7B2;
  color: #FF6B6B;
  transform: translateY(-2px);
  background: #FFF5F5;
}
.cat-option.active {
  background: #222; /* 改为深色，更高级 */
  color: #fff;
  border-color: #222;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.cat-option:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

/* AI 按钮 */
.textarea-wrapper { position: relative; }
.ai-btn {
  position: absolute;
  bottom: 16px; right: 16px;
  background: rgba(108, 99, 255, 0.1);
  color: #6C63FF;
  border: none;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.ai-btn:hover { background: #6C63FF; color: #fff; transform: scale(1.05); }

.error-msg { color: #FF6B6B; font-size: 13px; margin-top: 8px; font-weight: 600; }

/* --- 右侧预览区 (布局修正) --- */
.preview-section {
  /* 不再使用 position: relative 导致的问题，而是作为 Grid 的一列 */
  width: 100%;
}
.preview-wrapper {
  /* 包裹器，确保内部元素正常流式排列 */
  display: flex;
  flex-direction: column;
  gap: 24px;
  /* 如果需要固定在视口，可以用 sticky，但这里为了稳定性，我们让它随页面滚动，或者只在小屏幕 sticky */
  position: sticky;
  top: 100px; /* 距离顶部距离 */
}

.preview-mockup {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #F0F0F0;
  box-shadow: 0 20px 40px rgba(0,0,0,0.06);
  transition: transform 0.3s;
}
.preview-mockup:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(0,0,0,0.08);
}

.mockup-header {
  display: flex; align-items: center; gap: 14px;
  padding: 20px;
  border-bottom: 1px solid #FAFAFA;
}
.mockup-avatar {
  width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.mockup-info { display: flex; flex-direction: column; }
.mockup-name { font-weight: 700; font-size: 15px; color: #222; }
.mockup-time { font-size: 12px; color: #999; margin-top: 2px; }

.mockup-title {
  padding: 20px 20px 12px;
  font-weight: 800; font-size: 18px; color: #111;
  line-height: 1.4;
}
.mockup-image-container {
  width: 100%; aspect-ratio: 4/3;
  background: #F8F9FA;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.mockup-img { width: 100%; height: 100%; object-fit: cover; }
.mockup-placeholder {
  color: #ccc; font-size: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}

.mockup-content {
  padding: 20px;
  font-size: 15px; color: #555; line-height: 1.7;
  white-space: pre-wrap;
  background: #fff;
}
.mockup-tags { padding: 0 20px 20px; }
.tag-pill {
  display: inline-block;
  background: #F3F4F6;
  color: #4B5563;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.mockup-actions {
  padding: 16px 20px;
  border-top: 1px solid #FAFAFA;
  display: flex; gap: 20px;
  color: #999; font-size: 20px;
  background: #FAFAFA;
}
.action-icon { cursor: pointer; transition: transform 0.2s; }
.action-icon:hover { transform: scale(1.2); }

/* --- 🚀 重新设计的提交按钮 (现代、简洁) --- */
.submit-btn-modern {
  width: 100%;
  padding: 18px;
  background: #222; /* 纯黑/深灰，高级感 */
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
}
.submit-btn-modern:hover:not(:disabled) {
  background: #000;
  transform: translateY(-3px);
  box-shadow: 0 14px 24px rgba(0,0,0,0.2);
}
.submit-btn-modern:active:not(:disabled) {
  transform: translateY(-1px);
}
.submit-btn-modern:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}
/* 简单的 loading 动画 */
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 移动端适配 */
@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .preview-section {
    order: -1; /* 移动端可以把预览放上面，或者隐藏 */
    display: none; /* 暂时隐藏，避免拥挤 */
  }
  .submit-btn-modern {
    position: fixed;
    bottom: 24px;
    left: 24px;
    right: 24px;
    width: auto;
    z-index: 900;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }
  .upload-page-container {
    padding-bottom: 100px;
  }
}
</style>