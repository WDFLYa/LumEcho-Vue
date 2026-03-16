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

      <!-- 状态 1: 未申请 (NONE) -->
      <button
          v-if="appStatus === 'NONE'"
          class="action-btn apply-btn"
          @click="openApplyModal"
          :disabled="isSubmitting"
      >
        <span class="btn-icon">👑</span>
        <span class="btn-text">{{ isSubmitting ? '提交中...' : '申请成为摄影师' }}</span>
      </button>

      <!-- 状态 2: 审核中 (PENDING) -->
      <button
          v-else-if="appStatus === 'PENDING'"
          class="action-btn pending-btn"
          @click="showStatusModal('pending')"
          disabled
      >
        <span class="btn-icon">⏳</span>
        <span class="btn-text">审核中</span>
      </button>

      <!-- 状态 3: 已拒绝 (REJECTED) -->
      <button
          v-else-if="appStatus === 'REJECTED'"
          class="action-btn reject-btn"
          @click="showStatusModal('rejected')"
      >
        <span class="btn-icon">⚠️</span>
        <span class="btn-text">需重新申请</span>
      </button>

      <!-- 状态 4: 已通过 (APPROVED) -->
      <div v-else-if="appStatus === 'APPROVED'" class="badge-container">
        <span class="photographer-badge">
          <span class="badge-icon">✅</span>
          <span class="badge-text">认证摄影师</span>
        </span>
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

  <!-- ✨ 申请表单弹窗 -->
  <transition name="modal-fade">
    <div v-if="showApplyModal" class="modal-mask" @click.self="forceCloseModal">
      <div class="modal-container">
        <div class="modal-header">
          <div class="header-icon">📸</div>
          <h3>{{ appStatus === 'REJECTED' ? '重新申请摄影师' : '申请成为摄影师' }}</h3>
          <button class="close-btn" @click="forceCloseModal">×</button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">
            {{ appStatus === 'REJECTED' ? '上次申请未通过，原因：' + rejectReason : '请填写您的摄影简介或申请理由。' }}<br>
            <span class="highlight-text">审核通过后，您将解锁发布挑战赛和评审作品的权限！</span>
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
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="forceCloseModal" :disabled="isSubmitting">取消</button>
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
  </transition>

  <!-- ✨ 状态提示弹窗 -->
  <transition name="modal-fade">
    <div v-if="showStatusModalType" class="modal-mask" @click.self="showStatusModalType = null">
      <div class="modal-container status-modal">
        <div class="modal-header">
          <div class="header-icon">{{ statusModalIcon }}</div>
          <h3>{{ statusModalTitle }}</h3>
          <button class="close-btn" @click="showStatusModalType = null">×</button>
        </div>
        <div class="modal-body" style="text-align: center;">
          <p class="status-content">{{ statusModalMessage }}</p>
          <div v-if="rejectReason && showStatusModalType === 'rejected'" class="reject-reason-box">
            <strong>拒绝原因：</strong> {{ rejectReason }}
          </div>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button
              v-if="appStatus === 'REJECTED'"
              class="btn-submit"
              @click="showStatusModalType = null; openApplyModal()"
          >
            🔄 立即重新申请
          </button>
          <button v-else class="btn-cancel" @click="showStatusModalType = null">我知道了</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- ✨ 自定义 Toast -->
  <transition name="toast-fade">
    <div v-if="toast.visible" class="custom-toast" :class="toast.type">
      <span class="toast-icon">{{ toast.icon }}</span>
      <span>{{ toast.message }}</span>
    </div>
  </transition>

</template>

<script>
import { getPhotographerApplication, submitPhotographerApplication } from '@/api/photographer';

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
      appStatus: 'NONE', // NONE, PENDING, APPROVED, REJECTED
      rejectReason: '',

      isSubmitting: false,
      showApplyModal: false,
      showStatusModalType: null, // 'pending' | 'rejected'

      form: { description: '' },

      toast: {
        visible: false,
        message: '',
        type: 'info',
        icon: '💡',
        timer: null
      }
    };
  },

  computed: {
    statusModalIcon() {
      if (this.showStatusModalType === 'pending') return '⏳';
      if (this.showStatusModalType === 'rejected') return '⚠️';
      return '💡';
    },
    statusModalTitle() {
      if (this.showStatusModalType === 'pending') return '审核进行中';
      if (this.showStatusModalType === 'rejected') return '申请未通过';
      return '提示';
    },
    statusModalMessage() {
      if (this.showStatusModalType === 'pending')
        return '您的申请材料已收到，工作人员正在仔细审核中，预计需要 1-3 个工作日。请耐心等待结果通知。';
      if (this.showStatusModalType === 'rejected')
        return '很遗憾，您的本次申请未通过审核。请查看下方拒绝原因，补充资料后重新提交。';
      return '';
    }
  },

  mounted() {
    if (!this.isPhotographer) {
      this.fetchApplicationStatus();
    } else {
      this.appStatus = 'APPROVED';
    }
  },

  methods: {
    showToast(message, type = 'info') {
      const icons = { success: '🎉', error: '😭', info: '💡', warning: '⚠️' };
      this.toast.message = message;
      this.toast.type = type;
      this.toast.icon = icons[type] || '💡';
      this.toast.visible = true;

      if (this.toast.timer) clearTimeout(this.toast.timer);
      this.toast.timer = setTimeout(() => {
        this.toast.visible = false;
      }, 3000);
    },

    async fetchApplicationStatus() {
      try {
        const res = await getPhotographerApplication();
        const data = res.data?.data || res.data;

        if (data && data.status !== undefined) {
          if (data.status === 0) this.appStatus = 'PENDING';
          else if (data.status === 1) this.appStatus = 'APPROVED';
          else if (data.status === 2) {
            this.appStatus = 'REJECTED';
            this.rejectReason = data.rejectReason || '未知原因';
          }
        }
      } catch (error) {
        console.log('未查询到申请记录，视为未申请');
        this.appStatus = 'NONE';
      }
    },

    goHome() { this.$router.push('/home'); },

    openApplyModal() {
      this.form.description = '';
      this.showApplyModal = true;
    },

    // ✅ 核心修复：强制关闭，不检查 isSubmitting 状态
    forceCloseModal() {
      if (this.isSubmitting) return; // 提交中时禁止手动关闭
      this.showApplyModal = false;
    },

    showStatusModal(type) {
      this.showStatusModalType = type;
    },

    async submitApplication() {
      if (!this.form.description.trim()) {
        this.showToast('申请理由不能为空哦～', 'warning');
        return;
      }

      this.isSubmitting = true;
      try {
        const res = await submitPhotographerApplication({
          description: this.form.description.trim()
        });

        // 兼容多种返回格式
        const code = res.data?.code || res.code;
        const isSuccess = (code === 200 || code === '200');

        if (isSuccess) {
          console.log('✅ 提交成功，正在强制关闭弹窗...');

          // 1. 【关键】直接赋值 false，绕过任何函数逻辑
          this.showApplyModal = false;

          // 2. 清空表单
          this.form.description = '';

          // 3. 提示成功
          this.showToast('申请提交成功！请等待审核 🚀', 'success');

          // 4. 更新状态
          this.appStatus = 'PENDING';
          this.rejectReason = '';

          // 5. 通知父组件
          this.$emit('application-success');

          // 6. 延迟显示审核中提示
          setTimeout(() => {
            this.showStatusModal('pending');
          }, 600);

        } else {
          const msg = res.data?.message || res.message || '提交失败';
          throw new Error(msg);
        }
      } catch (error) {
        console.error('❌ 提交失败:', error);
        this.showToast(error.message || '网络开小差了，请稍后重试', 'error');
        // 失败时不关闭弹窗
      } finally {
        // 无论成功失败，重置提交按钮状态
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
/* ==================== 样式区域 (保持不变) ==================== */
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 32px; position: sticky; top: 0; z-index: 1000;
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(129, 199, 132, 0.2);
  box-shadow: 0 4px 30px rgba(129, 199, 132, 0.1);
}
.nav-left { flex: 1; cursor: pointer; }
.logo-wrapper { display: flex; align-items: center; gap: 8px; }
.logo-icon { font-size: 1.6rem; animation: float 3s ease-in-out infinite; }
.logo-text { font-size: 1.4rem; font-weight: 800; color: #444; margin: 0; }
.logo-text span { color: #4DB6AC; }
.nav-center-decoration { flex: 1; text-align: center; }
.deco-text { font-size: 0.95rem; font-weight: 600; color: #81C784; letter-spacing: 1px; }
.nav-right { flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 16px; }

.action-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border: none; border-radius: 25px; font-weight: 700; font-size: 0.9rem;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none; white-space: nowrap;
}
.btn-icon { font-size: 1.1rem; }
.btn-text { white-space: nowrap; }

.apply-btn {
  background: linear-gradient(135deg, #4DB6AC 0%, #81C784 100%);
  color: #FFF; box-shadow: 0 4px 15px rgba(77, 182, 172, 0.3);
}
.apply-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(77, 182, 172, 0.4);
}

.pending-btn {
  background: #FFF8E1; color: #F57C00; border: 1px solid #FFE0B2; cursor: default;
}
.pending-btn .btn-icon { animation: pulse 1.5s infinite; }

.reject-btn {
  background: #FFEBEE; color: #E53935; border: 1px solid #FFCDD2;
}
.reject-btn:hover { background: #FFCDD2; color: #B71C1C; }

.badge-container { margin-right: 8px; }
.photographer-badge {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  background: #E8F5E9; border: 1px solid #C8E6C9; border-radius: 20px;
  color: #2E7D32; font-size: 0.85rem; font-weight: 700;
}

.user-profile {
  display: flex; align-items: center; gap: 12px; padding: 6px 12px 6px 6px;
  border-radius: 30px; cursor: pointer; transition: all 0.3s;
}
.user-profile:hover { background: rgba(77, 182, 172, 0.08); }
.greeting { font-size: 14px; font-weight: 600; color: #666; }
.avatar-ring {
  position: relative; width: 42px; height: 42px; border-radius: 50%;
  padding: 2px; background: linear-gradient(45deg, #4DB6AC, #81C784);
}
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #fff; }
.status-dot {
  position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px;
  background: #4ADE80; border: 2px solid #fff; border-radius: 50%;
}

.modal-mask {
  position: fixed; inset: 0; background: rgba(76, 175, 80, 0.15);
  backdrop-filter: blur(5px); z-index: 2000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-container {
  background: #FFFFFF; width: 100%; max-width: 480px; border-radius: 24px;
  box-shadow: 0 20px 60px rgba(76, 175, 80, 0.15); overflow: hidden;
  display: flex; flex-direction: column;
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.status-modal { max-width: 400px; }

.modal-header {
  padding: 25px 25px 15px; text-align: center; position: relative;
  background: linear-gradient(180deg, #F1F8E9 0%, #FFF 100%);
}
.header-icon { font-size: 3rem; margin-bottom: 10px; display: block; animation: float 3s ease-in-out infinite; }
.modal-header h3 { margin: 0; color: #2E7D32; font-size: 1.4rem; font-weight: 800; }
.close-btn {
  position: absolute; top: 20px; right: 20px; background: none; border: none;
  font-size: 1.8rem; color: #999; cursor: pointer; transition: color 0.3s;
}
.close-btn:hover { color: #2E7D32; }

.modal-body { padding: 20px 30px 30px; }
.modal-desc {
  text-align: center; color: #555; font-size: 0.95rem; line-height: 1.6;
  margin-bottom: 25px; background: #FFF3CD; padding: 12px;
  border-radius: 12px; border: 1px solid #FFEeba; color: #856404;
}
.highlight-text { font-weight: 700; color: #2E7D32; display: block; margin-top: 8px; }

.status-content { font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 15px; }
.reject-reason-box {
  background: #FFEBEE; color: #C62828; padding: 12px; border-radius: 8px;
  border: 1px solid #FFCDD2; font-size: 0.9rem; text-align: left; margin-top: 10px;
}

.form-group { position: relative; }
.form-group label { display: block; font-weight: 700; color: #2E7D32; margin-bottom: 10px; }
.form-group textarea {
  width: 100%; padding: 15px; border: 2px solid #C8E6C9; border-radius: 16px;
  font-size: 1rem; outline: none; resize: none; transition: all 0.3s;
  box-sizing: border-box; background: #FAFAFA;
}
.form-group textarea:focus {
  border-color: #4DB6AC; background: #FFF;
  box-shadow: 0 0 0 4px rgba(77, 182, 172, 0.1);
}
.char-count { text-align: right; font-size: 0.8rem; color: #999; margin-top: 5px; }

.modal-footer {
  padding: 20px 30px; border-top: 1px solid #F1F8E9;
  display: flex; justify-content: flex-end; gap: 12px; background: #FAFAFA;
}
.btn-cancel {
  background: #FFF; border: 1px solid #DDD; color: #666;
  padding: 10px 24px; border-radius: 25px; font-weight: 700; cursor: pointer;
  transition: all 0.3s;
}
.btn-cancel:hover { background: #F5F5F5; border-color: #BBB; }

.btn-submit {
  background: linear-gradient(135deg, #4DB6AC 0%, #2E7D32 100%);
  color: #FFF; border: none; padding: 10px 30px; border-radius: 25px;
  font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3); transition: all 0.3s;
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
}
.btn-submit:disabled { background: #CCC; cursor: not-allowed; box-shadow: none; }

.custom-toast {
  position: fixed; top: 80px; left: 50%;
  transform: translateX(-50%) translateY(-20px);
  background: rgba(255, 255, 255, 0.95); padding: 12px 24px;
  border-radius: 50px; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); z-index: 3000;
  border: 1px solid #eee; backdrop-filter: blur(10px); white-space: nowrap;
}
.custom-toast.success { background: #E8F5E9; color: #2E7D32; border-color: #A5D6A7; }
.custom-toast.error { background: #FFEBEE; color: #C62828; border-color: #FFCDD2; }
.custom-toast.warning { background: #FFF8E1; color: #F57C00; border-color: #FFE0B2; }
.toast-icon { font-size: 18px; }

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-container, .modal-fade-leave-to .modal-container { transform: scale(0.95); }

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translate(-50%, -40px); }

@media (max-width: 768px) {
  .navbar { padding: 10px 20px; }
  .nav-center-decoration { display: none; }
  .greeting { display: none; }
  .avatar-ring { width: 36px; height: 36px; }
  .action-btn .btn-text { display: none; }
  .action-btn { padding: 10px; border-radius: 50%; width: 42px; height: 42px; justify-content: center; }
  .photographer-badge .badge-text { display: none; }
  .photographer-badge { padding: 8px; border-radius: 50%; }
}
</style>