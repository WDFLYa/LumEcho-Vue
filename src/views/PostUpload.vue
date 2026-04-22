<template>
  <div class="upload-page-container">
    <!-- 导航栏 -->
    <UploadNavBar
        :user-name="currentUser.name"
        :user-avatar="currentUser.avatar"
        @upload="scrollToTop"
        @profile="goProfile"
    />

    <div class="main-content">
      <!-- 左侧：编辑区 -->
      <div class="editor-section">

        <!-- 1. 媒体上传区 -->
        <div class="upload-card glass-panel">
          <div class="card-header">
            <h3 class="section-title">📸 晒出你的大作</h3>
            <span class="hint">最多 9 张哦 🖼️</span>
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

            <!-- 空状态 -->
            <div v-if="uploadedFiles.length === 0" class="empty-state">
              <div class="icon-bounce">🎨</div>
              <p class="drop-text">拖拽图片到这里，或者 <span class="highlight">点我上传</span></p>
              <span class="sub-hint">✨ 至少传一张，让大家眼前一亮！</span>
            </div>

            <!-- 预览列表 -->
            <div v-else class="preview-grid">
              <div v-for="(file, index) in uploadedFiles" :key="index" class="preview-item">
                <img :src="file.previewUrl" alt="preview" />

                <!-- ✅ 删除按钮：默认隐藏，hover 显示 -->
                <button class="remove-btn" @click.stop="removeFile(index)" title="移除这张">
                  ×
                </button>

                <div v-if="file.uploading" class="upload-progress">
                  <div class="bar" :style="{ width: file.progress + '%' }"></div>
                </div>
                <!-- 封面小皇冠 -->
                <div v-if="index === 0" class="cover-crown" title="封面大图">👑</div>
              </div>

              <!-- 继续添加 -->
              <div
                  v-if="uploadedFiles.length < 9"
                  class="add-more"
                  @click.stop="triggerFileInput"
              >
                <span class="plus-icon">＋</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 基本信息区 -->
        <div class="info-card glass-panel">
          <h3 class="section-title">✍️ 讲讲背后的故事</h3>

          <!-- 标题 -->
          <div class="form-group">
            <label class="form-label">💡 作品标题</label>
            <input
                v-model="form.title"
                type="text"
                placeholder="起个好听的标题吧！！"
                maxlength="50"
                class="input-field"
            />
            <div v-if="errors.title" class="error-msg">{{ errors.title }}</div>
            <div class="char-count">{{ form.title.length }}/50</div>
          </div>

          <!-- 分类选择 -->
          <div class="form-group">
            <label class="form-label">🏷️ 挑选一个标签</label>
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
              <div v-if="categories.length === 0" class="loading-cat">正在努力加载分类... 🐢</div>
            </div>
            <div v-if="errors.categoryId" class="error-msg">{{ errors.categoryId }}</div>
          </div>

          <!-- 内容描述 -->
          <div class="form-group">
            <label class="form-label">📝 创作灵感</label>
            <div class="textarea-wrapper">
              <textarea
                  v-model="form.content"
                  placeholder="当时的心情？拍摄参数？还是想对大家说的话？..."
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

      <!-- 右侧：实时预览区 -->
      <div class="preview-section">
        <div class="preview-wrapper">
          <div class="preview-card glass-panel">
            <h3 class="section-title">👀 看看效果</h3>
            <div class="preview-mockup">
              <div class="mockup-header">
                <img :src="currentUser.avatar" class="mockup-avatar" onerror="this.src='http://47.116.108.205:9000/specialty/avatar.png'" />
                <div class="mockup-info">
                  <div class="mockup-name">{{ currentUser.name }}</div>
                  <div class="mockup-time">刚刚发布 🚀</div>
                </div>
              </div>

              <div class="mockup-title">{{ form.title || '这里会显示标题...' }}</div>

              <div class="mockup-image-container">
                <img v-if="uploadedFiles[0]" :src="uploadedFiles[0].previewUrl" class="mockup-img" />
                <div v-else class="mockup-placeholder">
                  <span style="font-size: 32px; opacity: 0.3;">🖼️</span>
                  <p style="font-size: 12px; color: #999; margin-top: 8px;">坐等图片...</p>
                </div>
              </div>

              <div class="mockup-content">{{ form.content || '你的精彩故事将显示在这里...' }}</div>

              <div class="mockup-tags">
                <span class="tag-pill">{{ getCategoryName(form.categoryId) || '未分类' }}</span>
              </div>

              <div class="mockup-actions">
                <span class="action-icon">❤️</span>
                <span class="action-icon">💬</span>
                <span class="action-icon">⭐</span>
              </div>
            </div>
          </div>

          <!-- ✅ 提交按钮：回归经典黑/深灰风格，去除了 AI 味渐变 -->
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

    <!-- 自定义 Toast 组件 -->
    <transition name="toast-fade">
      <div v-if="toastVisible" class="custom-toast" :class="toastType">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { publishPost } from "@/api/post"
import UploadNavBar from '@/components/NavBar/UploadNavBar.vue';
import { getCurrentUserInfo } from "@/api/auth";
import { getAllCategories } from '@/api/category'
import { uploadFile } from "@/api/file"
import { aiPolish } from "@/api/ai"
export default {
  name: "PostUpload",
  components: { UploadNavBar },
  data() {
    return {
      MAX_IMAGES: 9,
      currentUser: {
        name: '神秘摄影师',
        avatar: 'http://47.116.108.205:9000/specialty/avatar.png'
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
      errors: {},

      toastVisible: false,
      toastMessage: '',
      toastType: 'info',
      toastTimer: null
    };
  },
  computed: {
    toastIcon() {
      const map = {
        success: '🎉',
        warning: '⚠️',
        error: '😭',
        info: '💡'
      };
      return map[this.toastType] || '💡';
    }
  },
  mounted() {
    this.fetchUserInfo();
    this.fetchCategories();
  },
  methods: {
    showToast(msg, type = 'info') {
      this.toastMessage = msg;
      this.toastType = type;
      this.toastVisible = true;

      if (this.toastTimer) clearTimeout(this.toastTimer);

      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
      }, 2500);
    },

    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        if (res.data.code === 200 || res.data.success) {
          const data = res.data.data;
          if (data) {
            this.currentUser.name = data.username || '神秘摄影师';
            this.currentUser.avatar = data.avatar || 'http://47.116.108.205:9000/specialty/avatar.png';
          }
        }
      } catch (error) {
        console.warn('获取用户信息失败', error);
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
      if (!name) return '🏷️';
      const cleanName = name.trim();
      const map = {
        '人像': '👤', '风景': '🏔️', '技术': '💻',
        '日常': '🎨', '建筑': '🏛️', '动物': '🐾',
        '美食': '🍔', '旅行': '✈️', '其他': '✨'
      };
      return map[cleanName] || '🏷️';
    },

    getCategoryName(id) {
      const cat = this.categories.find(c => c.id === id);
      return cat ? cat.name : '';
    },

    triggerFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = null;
        this.$refs.fileInput.click();
      }
    },

    handleFileSelect(e) {
      this.processFiles(Array.from(e.target.files));
    },

    handleFileDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      this.processFiles(files);
    },

    processFiles(files) {
      if (files.length === 0) return;
      const remainingSlots = this.MAX_IMAGES - this.uploadedFiles.length;

      if (remainingSlots <= 0) {
        this.showToast(`哎呀，最多只能放 ${this.MAX_IMAGES} 张图哦~`, 'warning');
        return;
      }

      let filesToAdd = files;
      if (files.length > remainingSlots) {
        filesToAdd = files.slice(0, remainingSlots);
        this.showToast(`太热情啦！只保留前 ${this.MAX_IMAGES} 张最棒的`, 'info');
      }

      filesToAdd.forEach(file => {
        if (file.size > 20 * 1024 * 1024) {
          this.showToast(`文件 "${file.name}" 太大啦 (>20MB)，吃不下呀`, 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedFiles.push({
            file,
            previewUrl: e.target.result,
            progress: 0,
            uploading: false,
            serverUrl: null
          });
        };
        reader.readAsDataURL(file);
      });
    },

    removeFile(index) {
      this.uploadedFiles.splice(index, 1);
    },

    async uploadImages() {
      if (this.uploadedFiles.length === 0) return [];
      const urls = [];
      for (let item of this.uploadedFiles) {
        if (item.serverUrl) {
          urls.push(item.serverUrl);
          continue;
        }
        item.uploading = true;
        try {
          const res = await uploadFile(item.file, "POST_IMAGE");
          if (res.data.code === 200) {
            item.serverUrl = res.data.data;
            urls.push(item.serverUrl);
            item.progress = 100;
          } else {
            throw new Error(res.data.msg || "上传失败");
          }
        } catch (err) {
          item.uploading = false;
          throw err;
        }
        item.uploading = false;
      }
      return urls;
    },

    async generateAIDescription() {
      const originalText = this.form.content.trim()

      if (!originalText) {
        this.showToast('先写点文字我再帮你润色哦～', 'warning')
        return
      }

      // 加载中
      this.form.content = "✨ AI 正在努力润色中，请稍等..."

      try {
        // 调用后端 AI 接口
        const res = await aiPolish(originalText)

        // 把润色后的内容回填
        this.form.content = res.data

        this.showToast('✅ 润色完成啦！', 'success')
      } catch (err) {
        console.error(err)
        this.form.content = originalText
        this.showToast('😭 AI 润色失败了', 'error')
      }
    },

    scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); },
    goProfile() { this.$router.push('/profile'); },

    async handleSubmit() {
      this.errors = {};

      if (!this.form.title.trim()) {
        this.errors.title = '标题不能为空';
        this.showToast('💡 先给作品起个名字吧', 'warning');
        return;
      }
      if (!this.form.content.trim()) {
        this.errors.content = '内容不能为空';
        this.showToast('📝 写点什么吧，哪怕一句话也好', 'warning');
        return;
      }
      if (!this.form.categoryId) {
        this.errors.categoryId = '请选择分类';
        this.showToast('🏷️ 别忘了选个标签归类哦', 'warning');
        return;
      }

      if (this.uploadedFiles.length === 0) {
        this.showToast('📸 还没上传图片呢，至少来一张！', 'warning');
        document.querySelector('.upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      this.isSubmitting = true;

      try {

        const urls = await this.uploadImages();

        const payload = {
          title: this.form.title,
          content: this.form.content,
          categoryId: this.form.categoryId,
          imageUrls: urls
        };


        const res = await publishPost(payload);

        if (res.data.code === 200 || res.data.success) {
          this.showToast('🎉 发布成功！马上带你去首页...', 'success');

          setTimeout(() => {
            this.resetForm();
            this.$router.push('/home').then(() => {
              window.scrollTo(0, 0);
              window.dispatchEvent(new Event('refresh-home-list'));
            });
          }, 800);

        } else {
          this.showToast('😭 发布失败：' + (res.data.msg || '未知错误'), 'error');
        }

      } catch (e) {
        console.error(e);
        this.showToast('😭 网络开小差了，请稍后再试', 'error');
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.form.title = '';
      this.form.content = '';
      this.form.categoryId = null;
      this.uploadedFiles = [];
      this.errors = {};
    }
  }
};
</script>

<style scoped>
/* --- 全局布局 --- */
.upload-page-container {
  min-height: 100vh;
  /* ✅ 背景还原：清爽的浅色渐变 */
  background: linear-gradient(180deg, #FFF9F5 0%, #F3F0FF 100%);
  color: #444;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding-bottom: 60px;
  position: relative;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
  align-items: start;
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
  transition: transform 0.3s ease;
}

.glass-panel:hover {
  transform: translateY(-2px);
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
  user-select: none;
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

/* ✅ 删除按钮：默认隐藏，hover 显示 */
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
  transition: all 0.2s;
  z-index: 2;
  opacity: 0; /* 默认不可见 */
  transform: scale(0.8);
}
/* 鼠标悬停在图片项上时显示删除按钮 */
.preview-item:hover .remove-btn {
  opacity: 1;
  transform: scale(1);
}
.remove-btn:hover {
  background: #ff4d4f;
  transform: scale(1.1);
}

.cover-crown {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 3;
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.add-more {
  display: flex; align-items: center; justify-content: center;
  background: #F3F0FF;
  border-radius: 16px;
  color: #6C63FF;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.2s;
  aspect-ratio: 1;
  border: 2px dashed #D4C4FB;
}
.add-more:hover { background: #E5E0FF; transform: scale(1.05); border-style: solid; }

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
  background: #222;
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

/* --- 右侧预览区 --- */
.preview-section {
  width: 100%;
}
.preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 100px;
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
  width: 100%;
  aspect-ratio: 4/3;
  background: #F8F9FA;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  position: relative;
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

/* --- ✅ 提交按钮：经典黑/深灰风格，去除了 AI 味 --- */
.submit-btn-modern {
  width: 100%;
  padding: 18px;
  background: #222; /* 纯深色背景 */
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
  background: #000; /* hover 变纯黑 */
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

@keyframes popIn {
  0% { transform: scale(0); }
  80% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* ✅ 自定义 Toast 样式 */
.custom-toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  z-index: 9999;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.custom-toast.success { background: rgba(34, 197, 94, 0.9); }
.custom-toast.warning { background: rgba(245, 158, 11, 0.9); }
.custom-toast.error { background: rgba(239, 68, 68, 0.9); }
.custom-toast.info { background: rgba(59, 130, 246, 0.9); }

.toast-icon { font-size: 16px; }
.toast-message { letter-spacing: 0.5px; }

/* Toast 动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(40px);
}

/* 移动端适配 */
@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .preview-section {
    order: -1;
    display: none;
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
  .custom-toast {
    bottom: 90px;
    max-width: 90%;
    justify-content: center;
    text-align: center;
  }
}
</style>