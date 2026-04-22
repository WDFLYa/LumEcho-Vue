<template>
  <div class="post-manage-container">
    <!-- 👉 这里加上导航栏 -->
    <AdminNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
    />

    <main class="content-wrapper">

      <!-- 标题 -->
      <header class="page-header">
        <div class="header-left">
          <h1>📝 帖子管理</h1>
          <p>管理所有用户发布内容，支持搜索、状态筛选、封禁/恢复</p>
        </div>
        <div class="header-right">
          <button class="refresh-btn" @click="handleSearch" :disabled="loading">
            <span :class="{ 'spin': loading }">🔄</span> 刷新数据
          </button>
        </div>
      </header>

      <!-- 搜索 -->
      <div class="search-bar">
        <el-input
            v-model="keyword"
            placeholder="搜索标题 / 内容"
            clearable
            @keyup.enter="handleSearch"
            style="width: 260px"
        />
        <el-button type="primary" @click="handleSearch">
          搜索
        </el-button>
      </div>

      <!-- 状态筛选 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterStatus" @change="handleSearch">
          <el-radio-button label="ALL">全部</el-radio-button>
          <el-radio-button :label="1">正常</el-radio-button>
          <el-radio-button :label="2">封禁</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 表格 -->
      <div class="post-table">

        <!-- 表头 -->
        <div class="table-head">
          <span>ID</span>
          <span>封面</span>
          <span>内容</span>
          <span>作者</span>
          <span>互动</span>
          <span>分类</span>
          <span>时间</span>
          <span>状态</span>
          <span>操作</span>
        </div>

        <!-- 数据 -->
        <div class="table-row" v-for="post in posts" :key="post.id">

          <span class="id">{{ post.id }}</span>

          <!-- 封面 -->
          <span>
            <img class="cover" :src="post.cover || defaultCover" @error="$event.target.src = defaultCover"/>
          </span>

          <!-- 内容 -->
          <span class="title">
            {{ post.title || '无标题' }}
          </span>

          <!-- 作者 -->
          <span class="author">
            <img class="avatar" :src="post.avatar" @error="$event.target.src = defaultAvatar"/>
            <span class="name">{{ post.username }}</span>
          </span>

          <!-- 互动 -->
          <span class="meta">
            👍 {{ post.likes || 0 }} · 💬 {{ post.comments || 0 }}
          </span>

          <span>{{ post.category || '—' }}</span>

          <!-- 时间 -->
          <span class="time">
            {{ formatTime(post.createTime) }}
          </span>

          <!-- 状态 -->
          <span>
            <el-tag
                size="small"
                :type="post.status === 1 ? 'success' : 'danger'"
            >
              {{ post.status === 1 ? '正常' : '封禁' }}
            </el-tag>
          </span>

          <!-- 操作 -->
          <span>
            <el-button
                type="primary"
                size="small"
                @click="handleChangeStatus(post)"
            >
              {{ post.status === 1 ? '封禁' : '恢复' }}
            </el-button>
          </span>

        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <button class="load-btn" @click="loadMore" :disabled="loading">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>

    </main>
  </div>
</template>

<script>
import { getAllPosts, updatePostStatus } from "@/api/post.js";
import { ElMessage, ElMessageBox } from "element-plus";
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getCurrentUserInfo } from "@/api/auth";

export default {
  name: "PostManage",
  components: { AdminNavBar },

  data() {
    return {
      posts: [],

      keyword: "",
      filterStatus: "ALL",

      loading: false,
      hasMore: true,

      offset: 0,
      limit: 10,

      // 导航栏用户信息
      currentUserAvatar: 'http://47.116.108.205:9000/lumecho/avatar.png',
      currentUserName: '管理员',
      defaultAvatar: 'http://47.116.108.205:9000/lumecho/avatar.png',
      defaultCover: "http://47.116.108.205:9000/lumecho/cover.png"
    };
  },

  mounted() {
    this.fetchUserInfo();
    this.fetchPosts(true);
  },

  methods: {
    // 获取当前管理员信息
    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) {
          this.currentUserName = data.username;
          this.currentUserAvatar = data.avatar;
        }
      } catch (e) {
        console.error("获取用户信息失败", e);
      }
    },


    formatTime(time) {
      if (!time) return "—";
      return time.replace("T", " ").slice(0, 16);
    },

    async fetchPosts(reset = false) {
      if (this.loading) return;
      this.loading = true;

      if (reset) {
        this.offset = 0;
        this.posts = [];
        this.hasMore = true;
      }

      try {
        const res = await getAllPosts({
          offset: this.offset,
          limit: this.limit,
          keyword: this.keyword,
          status: this.filterStatus === "ALL" ? null : this.filterStatus
        });

        const resp = res.data.data;
        const list = resp.data || [];

        this.posts.push(...list);
        this.offset += list.length;
        this.hasMore = resp.hasMore;

      } catch (e) {
        ElMessage.error("加载失败");
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      this.fetchPosts(true);
    },

    loadMore() {
      this.fetchPosts(false);
    },

    async handleChangeStatus(post) {
      const isBan = post.status === 1;

      try {
        await ElMessageBox.confirm(
            isBan ? "确定封禁该帖子？" : "确定恢复该帖子？",
            "提示",
            { type: "warning" }
        );

        await updatePostStatus({
          id: post.id,
          status: isBan ? "BANNED" : "NORMAL"
        });

        ElMessage.success("操作成功");
        this.fetchPosts(true);

      } catch (e) {
        if (e !== "cancel") ElMessage.error("操作失败");
      }
    }
  }
};
</script>

<style scoped>
.post-manage-container {
  min-height: 100vh;
  background-color: #F8FAFC;
  background-image: radial-gradient(#E2E8F0 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Nunito', sans-serif;
  color: #334155;
}

.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 标题区域（和用户管理保持一致） */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 16px;
}
.header-left h1 {
  font-size: 26px;
  font-weight: 800;
  color: #1E293B;
  margin: 0 0 6px 0;
}
.header-left p {
  margin: 0;
  color: #64748B;
  font-size: 14px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #CBD5E1;
  color: #475569;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.refresh-btn:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #3B82F6;
  background: #EFF6FF;
}
.refresh-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.spin {
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 搜索 */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

/* 筛选栏 */
.filter-bar {
  background: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  border: 1px solid #E2E8F0;
}

/* 表格 */
.post-table {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 50px 80px 1.3fr 130px 120px 80px 120px 80px 90px;
  gap: 6px;
  padding: 10px 12px;
  align-items: center;
  font-size: 13px;
}

.table-head {
  background: #f5f7fa;
  font-weight: 600;
}
.table-row {
  border-top: 1px solid #eee;
}
.table-row:hover {
  background: #f9fbff;
}

.cover {
  width: 70px;
  height: 45px;
  object-fit: cover;
  border-radius: 8px;
}
.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.author {
  display: flex;
  align-items: center;
  gap: 6px;
}
.avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}
.name {
  font-size: 12px;
}
.meta {
  font-size: 12px;
  color: #666;
}
.time {
  font-size: 12px;
  color: #888;
}

/* 加载 */
.load-more {
  text-align: center;
  margin-top: 20px;
}
.load-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}
.load-btn:hover {
  background: #f5f5f5;
}
</style>