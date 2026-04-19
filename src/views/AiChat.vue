<template>
  <div class="ai-chat-page">
    <button class="back-btn" @click="$router.back()">←</button>

    <div class="chat-navbar">
      <div class="chat-top-info">
        <img :src="targetUser.avatar" class="ai-avatar" alt="avatar" />
        <div class="ai-info">
          <h2>{{ targetUser.username }}</h2>
          <p>摄影师咨询中</p>
        </div>
      </div>
    </div>

    <div class="message-container" ref="msgContainer">
      <div v-if="messages.length === 0" class="empty-chat">
        <div class="empty-icon">📷</div>
        <p>快来向摄影师提问吧～</p>
        <span class="tags">构图 / 光线 / 参数 / 后期 / 器材</span>
      </div>

      <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="msg-item"
          :class="msg.role === 'user' ? 'right-msg' : 'left-msg'"
      >
        <div v-if="msg.role === 'assistant'" class="avatar-box">
          <img :src="targetUser.avatar" class="avatar" alt="avatar" />
          <div class="name">{{ targetUser.username }}</div>
        </div>
        <div class="bubble" :class="msg.role === 'user' ? 'user-bubble' : 'ai-bubble'">
          {{ msg.content }}
        </div>
        <div v-if="msg.role === 'user'" class="avatar-box self-box">
          <img :src="currentUser.avatar" class="avatar" alt="avatar" />
          <div class="name">{{ currentUser.username }}</div>
        </div>
      </div>
    </div>

    <div class="input-wrapper">
      <input
          v-model="inputText"
          @keyup.enter="sendMessage"
          placeholder="想问点什么？"
          class="chat-input"
      />
      <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!inputText.trim() || isStreaming"
      >
        {{ isStreaming ? '生成中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { getCurrentUserInfo, getUserById } from "@/api/auth";
import { getChatHistory } from "@/api/ai";

export default {
  name: "AiChat",
  data() {
    return {
      messages: [],
      inputText: "",
      isStreaming: false,
      currentUser: {
        username: "我",
        avatar: "http://localhost:9000/specialty/avatar.png",
      },
      targetUser: {
        username: "摄影师",
        avatar: "http://localhost:9000/specialty/avatar.png",
      },
    };
  },
  async mounted() {
    await this.loadAllUserInfo();
    await this.loadTargetUserInfo();
    await this.loadHistory();

    this.$nextTick(() => {
      this.forceBottom();
    });
  },
  methods: {
    forceBottom() {
      const el = this.$refs.msgContainer;
      if (el) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
      }
    },

    async loadAllUserInfo() {
      try {
        let userRes = await getCurrentUserInfo();
        if (userRes?.data?.code === 200) {
          this.currentUser = userRes.data.data;
        }
      } catch (e) {
        console.error("当前用户信息加载失败", e);
      }
    },

    async loadTargetUserInfo() {
      const photographerId = this.$route.params.photographerId;
      if (!photographerId) return;

      try {
        const res = await getUserById(photographerId);
        if (res.data?.code === 200) {
          this.targetUser = res.data.data;
        }
      } catch (e) {
        console.error("获取摄影师信息失败", e);
      }
    },

    async loadHistory() {
      const photographerId = this.$route.params.photographerId;
      if (!photographerId) return;

      try {
        const res = await getChatHistory(photographerId);
        if (res.data) {
          this.messages = res.data;
        }
      } catch (e) {
        console.log("暂无历史对话");
      }
    },

    async sendMessage() {
      const text = this.inputText.trim();
      if (!text || this.isStreaming) return;

      this.isStreaming = true;
      // 1. 添加用户消息
      this.messages.push({ role: "user", content: text });
      this.inputText = "";

      // 2. 添加空的 AI 消息占位
      // 在 Vue 3 中，push 进数组的对象属性也是响应式的，直接修改即可
      const aiMsgIndex = this.messages.length;
      this.messages.push({ role: "assistant", content: "" });

      this.forceBottom();

      try {
        const response = await fetch("http://localhost:8080/ai/chat-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user_token")}`,
          },
          body: JSON.stringify({
            photographerId: this.$route.params.photographerId,
            content: text,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // 保留最后一行可能不完整的数据

          for (const line of lines) {
            let trimmed = line.trim();
            if (!trimmed) continue;

            // 🔥 核心修复：循环剥去所有 "data:" 前缀
            // 兼容后端返回 "data: xxx" 或错误的 "data: data: xxx"
            while (trimmed.startsWith("data:")) {
              trimmed = trimmed.slice(5).trim();
            }

            if (trimmed === "[DONE]") break;

            // ✅ Vue 3 直接赋值即可触发更新，无需 $set
            if (trimmed) {
              this.messages[aiMsgIndex].content += trimmed;
            }
          }
          this.forceBottom();
        }
      } catch (e) {
        console.error("流式请求失败:", e);
        this.messages[aiMsgIndex].content += "\n😭 网络异常或摄影师暂时离线啦~";
      } finally {
        this.isStreaming = false;
        this.forceBottom();
      }
    },
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.ai-chat-page {
  min-height: 100vh;
  background: #fafafc;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-navbar {
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.chat-top-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.ai-info h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.ai-info p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #999;
}

.back-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e4e4e7;
  font-size: 18px;
  line-height: 1;
  color: #333;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}
.back-btn:active {
  transform: scale(0.95);
  background: #f5f5f7;
}

.message-container {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fafafc;
  -webkit-overflow-scrolling: touch;
}

.empty-chat {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.tags {
  display: inline-block;
  margin-top: 8px;
  padding: 6px 12px;
  background: #f0f0f5;
  border-radius: 12px;
  font-size: 12px;
  color: #888;
}

.msg-item {
  display: flex;
  max-width: 78%;
  gap: 8px;
  opacity: 0;
  animation: msgFadeIn 0.3s ease-out forwards;
}

.left-msg {
  align-self: flex-start;
  flex-direction: column;
  animation-name: msgSlideLeft;
}

.right-msg {
  align-self: flex-end;
  flex-direction: column-reverse;
  align-items: flex-end;
  animation-name: msgSlideRight;
}

.avatar-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.self-box {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.name {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  transition: all 0.2s;
  animation: bubbleBounce 0.35s ease-out 0.05s forwards;
}

.ai-bubble {
  background: #ffffff;
  border: 1px solid #f0f0f3;
  color: #333;
  border-top-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.user-bubble {
  background: linear-gradient(135deg, #7b61ff, #6c63ff);
  color: #fff;
  border-top-right-radius: 6px;
  box-shadow: 0 3px 10px rgba(123, 97, 255, 0.12);
}

.input-wrapper {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #eee;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 0 14px;
  border: 1px solid #eee;
  border-radius: 18px;
  font-size: 13px;
  height: 32px;
  line-height: 32px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #7b61ff;
}

.send-btn {
  padding: 0 14px;
  border-radius: 18px;
  background: #7b61ff;
  color: #fff;
  border: none;
  height: 32px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:disabled {
  background: #c4b5fd;
  cursor: not-allowed;
}

@keyframes msgFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes msgSlideLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes msgSlideRight { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bubbleBounce { 0% { transform: scale(0.92); } 60% { transform: scale(1.03); } 100% { transform: scale(1); } }
</style>
