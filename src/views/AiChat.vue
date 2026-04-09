<template>
  <div class="ai-chat-page">
    <div class="chat-navbar">
      <button class="back-btn" @click="$router.back()">←</button>
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
          :disabled="!inputText.trim()"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script>
import { getCurrentUserInfo } from "@/api/auth";
import { getChatHistory } from "@/api/ai";

export default {
  name: "AiChat",
  data() {
    return {
      messages: [],
      inputText: "",
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
    await this.loadUserInfo();
    await this.loadHistory();
  },
  methods: {
    async loadUserInfo() {
      try {
        let res = await getCurrentUserInfo();
        if (res?.data?.code === 200) {
          this.currentUser = res.data.data;
        }
      } catch (e) {
        console.error("用户信息加载失败", e);
      }
    },

    // 加载历史（已走 ai.js 接口）
    async loadHistory() {
      const photographerId = this.$route.params.photographerId;
      if (!photographerId) return;

      try {
        const res = await getChatHistory(photographerId);
        if (res.data) {
          this.messages = res.data;
          this.$nextTick(() => this.scrollToBottom());
        }
      } catch (e) {
        console.log("暂无历史对话");
      }
    },

    // 发送消息（SSE 必须用 fetch，不能用 axios）
    async sendMessage() {
      const text = this.inputText.trim();
      if (!text) return;

      this.messages.push({ role: "user", content: text });
      this.inputText = "";

      const aiMsg = { role: "assistant", content: "" };
      this.messages.push(aiMsg);
      this.scrollToBottom();

      try {
        const response = await fetch("http://localhost:8080/ai/chat-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photographerId: this.$route.params.photographerId,
            content: text
          })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        while (!done) {
          const result = await reader.read();
          done = result.done;
          const value = result.value;

          if (done) break;

          let chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split(/\n+/).filter(i => i.trim());

          for (const line of lines) {
            const cleanLine = line.trim();

            if (cleanLine === "data: [DONE]") {
              done = true;
              break;
            }

            if (cleanLine.startsWith("data: ")) {
              const content = cleanLine.replace("data: ", "");
              aiMsg.content += content;
              this.$forceUpdate();
              this.scrollToBottom();
            }
          }
        }

      } catch (e) {
        aiMsg.content = "😭 摄影师暂时离线啦~";
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.msgContainer;
        if (el) el.scrollTop = el.scrollHeight + 200;
      });
    },
  },
};
</script>

<style scoped>
/* 你的样式完全不变 */
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
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}
.back-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f5f5f7;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
}
.back-btn:hover {
  background: #e9e9ee;
  transform: scale(1.05);
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
.message-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fafafc;
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
  gap: 10px;
  padding: 14px 18px;
  background: #ffffff;
  border-top: 1px solid #f0f0f3;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}
.chat-input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid #eee;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  background: #f8f8fa;
}
.chat-input:focus {
  border-color: #d9d0ff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(123, 97, 255, 0.1);
}
.send-btn {
  padding: 0 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, #7b61ff, #6c63ff);
  color: #fff;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 3px 8px rgba(123, 97, 255, 0.15);
}
.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(123, 97, 255, 0.2);
}
.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
@keyframes msgFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes msgSlideLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes msgSlideRight { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bubbleBounce { 0% { transform: scale(0.92); } 60% { transform: scale(1.03); } 100% { transform: scale(1); } }
</style>