<template>
  <header class="navbar">
    <!-- 左侧：Logo -->
    <div class="nav-left" @click="goHome">
      <div class="logo-wrapper">
        <span class="logo-icon">🪞</span>
        <h1 class="logo-text">Lum<span>Echo!</span></h1>
      </div>
    </div>

    <!-- 中间装饰标语 -->
    <div class="nav-center-decoration">
      <span class="deco-text">✨ 编辑个人资料 ✨</span>
    </div>

    <!-- 右侧：操作区 -->
    <div class="nav-right">

      <!-- ✨ 新增：申请成为摄影师按钮 -->
      <button
          v-if="!isPhotographer"
          class="apply-btn"
          @click="openApplyModal"
          :disabled="isSubmitting"
      >
        <span class="btn-icon">👑</span>
        <span class="btn-text">{{ isSubmitting ? '提交中...' : '申请成为摄影师' }}</span>
      </button>

      <!-- 已认证标识 (可选，如果已经是摄影师则显示) -->
      <div v-else class="photographer-badge" title="认证摄影师">
        <span class="badge-icon">✅</span>
        <span class="badge-text">摄影师</span>
      </div>

      <!-- 用户信息胶囊 -->
      <div class="user-profile" @click="$emit('profile')">
        <span class="greeting">Hi, {{ userName }}</span>
        <div class="avatar-ring">
          <img :src="userAvatar" alt="Avatar" class="avatar-img" />
          <span class="status-dot"></span>
        </div>
      </div>
    </div>
  </header>

  <!-- ✨ 申请弹窗 Modal -->
  <div v-if="showModal" class="modal-mask" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-icon">📸</div>
        <h3>申请成为摄影师</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <p class="modal-desc">
          请填写您的<strong>摄影简介或申请理由</strong>。<br>
          审核通过后，您将解锁发布挑战赛和评审作品的权限！
        </p>

        <div class="form-group">
          <label for="bio">个人简介 / 申请理由 *</label>
          <textarea
              id="bio"
              v-model="form.description"
              placeholder="例如：我是一名拥有5年经验的风景摄影师，擅长捕捉自然光影..."
              rows="5"
              maxlength="500"
              :disabled="isSubmitting"
          ></textarea>
          <div class="char-count">{{ form.description.length }} / 500</div>
        </div>

        <!-- 错误提示 -->
        <div v-if="submitError" class="error-msg">
          ⚠️ {{ submitError }}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal" :disabled="isSubmitting">取消</button>
        <button
            class="btn-submit"
            @click="submitApplication"
            :disabled="isSubmitting || !form.description.trim()"
        >
          {{ isSubmitting ? '正在提交...' : '✨ 提交申请' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// 引入刚才定义的接口
import { submitPhotographerApplication } from '@/api/photographer';

export default {
  name: "EditNavBar",
  props: {
    userAvatar: { type: String, default: '' },
    userName: { type: String, default: 'User' },
    isPhotographer: { type: Boolean, default: false }
  },
  emits: ['profile', 'application-success'],

  data() {
    return {
      showModal: false,
      isSubmitting: false,
      submitError: '',
      form: {
        description: ''
      }
    };
  },

  methods: {
    goHome() {
      this.$router.push('/home');
    },

    openApplyModal() {
      this.form.description = '';
      this.submitError = '';
      this.showModal = true;
    },

    closeModal() {
      if (!this.isSubmitting) {
        this.showModal = false;
      }
    },

    async submitApplication() {
      const text = this.form.description.trim();

      // 1. 前端基础校验
      if (!text) {
        this.submitError = '申请理由不能为空哦～';
        return;
      }

      this.isSubmitting = true;
      this.submitError = '';

      try {
        // 2. 调用后端接口
        const response = await submitPhotographerApplication({
          description: text
        });

        // 3. 处理返回结果 (假设后端统一返回结构: { code: 200, message: '...', data: ... })
        // 如果你的 request 拦截器已经处理了非 200 的情况并直接 throw 错误，这里可以直接认为成功
        const res = response.data;

        // 兼容两种情况：
        // A. 拦截器未处理业务码，需手动判断
        // B. 拦截器已处理，直接执行成功逻辑
        const isSuccess = res.code === 200 || res.code === '200' || response.status === 200;

        if (isSuccess) {
          // ✅ 成功
          const msg = res.message || '申请提交成功！我们会尽快审核。';
          alert('🎉 ' + msg);

          this.closeModal();

          // 通知父组件：申请成功（父组件可以据此刷新用户状态或显示提示）
          this.$emit('application-success');

        } else {
          // ⚠️ 业务逻辑失败 (如：重复提交)
          throw new Error(res.message || '提交失败，请稍后重试');
        }

      } catch (error) {
        console.error('申请提交异常:', error);

        // 4. 错误信息提取
        let errorMsg = '网络开小差了，请稍后重试';

        if (error.response) {
          // HTTP 状态码错误 (401, 500 等)
          if (error.response.status === 401) {
            errorMsg = '登录已过期，请重新登录';
            // 可选：跳转登录页
            // this.$router.push('/login');
            return;
          }
          // 尝试获取后端返回的具体消息
          errorMsg = error.response.data?.message || error.response.data?.msg || errorMsg;
        } else if (error.message) {
          // 上面 throw new Error 捕获到的业务消息
          errorMsg = error.message;
        }

        this.submitError = errorMsg;
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
/* ====================
   Navbar 基础样式 (保持不变)
   ==================== */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(77, 182, 172, 0.2);
  box-shadow: 0 4px 30px rgba(77, 182, 172, 0.1);
  transition: all 0.3s ease;
}

/* --- 左侧 Logo --- */
.nav-left { flex: 1; cursor: pointer; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.nav-left:hover { transform: scale(1.05) rotate(-1deg); }
.logo-wrapper { display: flex; align-items: center; gap: 8px; }
.logo-icon { font-size: 1.6rem; filter: drop-shadow(0 2px 4px rgba(77, 182, 172, 0.3)); animation: float 3s ease-in-out infinite; }
.logo-text { font-size: 1.4rem; font-weight: 800; color: #444; margin: 0; }
.logo-text span {
  color: #4FC3F7;
  background: linear-gradient(45deg, #4FC3F7, #81C784);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --- 中间装饰 --- */
.nav-center-decoration { flex: 1; text-align: center; display: flex; justify-content: center; }
.deco-text { font-size: 0.95rem; font-weight: 600; color: #81C784; letter-spacing: 1px; white-space: nowrap; }

/* --- 右侧区域 --- */
.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

/* ✨ 新增：申请按钮样式 */
.apply-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #AB47BC, #42A5F5); /* 紫蓝渐变 */
  color: #FFF;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(171, 71, 188, 0.3);
  outline: none;
}
.apply-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(171, 71, 188, 0.4);
}
.apply-btn:active:not(:disabled) {
  transform: translateY(0);
}
.apply-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(0.5);
}
.btn-icon { font-size: 1.1rem; animation: float 2s ease-in-out infinite; }
.btn-text { white-space: nowrap; }

/* ✨ 新增：已认证徽章 */
.photographer-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #E8F5E9;
  border: 1px solid #C8E6C9;
  border-radius: 20px;
  color: #2E7D32;
  font-size: 0.85rem;
  font-weight: 700;
  margin-right: 8px;
}
.badge-icon { font-size: 1rem; }

/* --- 用户信息胶囊 --- */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 6px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
  margin-left: 4px;
}
.user-profile:hover { background: rgba(79, 195, 247, 0.08); }
.greeting {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: color 0.3s;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-profile:hover .greeting { color: #0288D1; }
.avatar-ring {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(45deg, #4FC3F7, #81C784);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}
.user-profile:hover .avatar-ring { transform: rotate(5deg) scale(1.1); }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #fff; }
.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #4ADE80;
  border: 2px solid #fff;
  border-radius: 50%;
}

/* ✨ 新增：Modal 弹窗样式 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(74, 20, 140, 0.5); /* 深紫半透明 */
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: #FFFFFF;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 25px 25px 15px;
  text-align: center;
  position: relative;
  background: linear-gradient(180deg, #F8F5FA 0%, #FFF 100%);
}
.header-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  display: block;
  animation: float 3s ease-in-out infinite;
}
.modal-header h3 {
  margin: 0;
  color: #4A148C;
  font-size: 1.4rem;
  font-weight: 800;
}
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s;
}
.close-btn:hover { color: #4A148C; }

.modal-body {
  padding: 10px 30px 30px;
}
.modal-desc {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 25px;
  background: #FFF3CD;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #FFEeba;
  color: #856404;
}

.form-group {
  position: relative;
}
.form-group label {
  display: block;
  font-weight: 700;
  color: #4A148C;
  margin-bottom: 10px;
  font-size: 0.95rem;
}
.form-group textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #E1BEE7;
  border-radius: 16px;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  resize: none;
  transition: all 0.3s;
  box-sizing: border-box;
  background: #FAFAFA;
  color: #333;
}
.form-group textarea:focus {
  border-color: #AB47BC;
  background: #FFF;
  box-shadow: 0 0 0 4px rgba(171, 71, 188, 0.1);
}
.form-group textarea:disabled {
  background: #F5F5F5;
  cursor: not-allowed;
}
.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
}

.error-msg {
  margin-top: 15px;
  padding: 10px;
  background: #FFEBEE;
  color: #C62828;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #FFCDD2;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #F3E5F5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #FAFAFA;
}
.btn-cancel {
  background: #FFF;
  border: 1px solid #DDD;
  color: #666;
  padding: 10px 24px;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-cancel:hover:not(:disabled) {
  background: #F5F5F5;
  border-color: #BBB;
}
.btn-submit {
  background: linear-gradient(135deg, #AB47BC, #8E24AA);
  color: #FFF;
  border: none;
  padding: 10px 30px;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
  transition: all 0.3s;
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(142, 36, 170, 0.4);
}
.btn-submit:disabled {
  background: #CCC;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* --- 动画 --- */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* --- 移动端适配 --- */
@media (max-width: 768px) {
  .navbar { padding: 10px 20px; }
  .nav-center-decoration { display: none; }
  .greeting { display: none; }
  .avatar-ring { width: 36px; height: 36px; }
  .nav-left { flex: 0 0 auto; }
  .nav-right { flex: 0 0 auto; }

  /* 移动端按钮只显示图标或缩短文字 */
  .apply-btn .btn-text { display: none; }
  .apply-btn {
    padding: 10px;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    justify-content: center;
  }
  .photographer-badge .badge-text { display: none; }
  .photographer-badge { padding: 8px; border-radius: 50%; margin-right: 4px; }
}
</style>