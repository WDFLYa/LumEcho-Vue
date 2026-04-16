<template>
  <div class="post-manage-container">
    <main class="content-wrapper">
      <header class="page-header">
        <div class="welcome-text">
          <h1>📝 帖子管理</h1>
          <p>查看与编辑帖子状态</p>
        </div>
      </header>

      <!-- 纯文字列表，简洁高效 -->
      <div class="post-table">
        <div class="table-head">
          <span>ID</span>
          <span>标题</span>
          <span>分类</span>
          <span>发布时间</span>
          <span>状态</span>
          <span>操作</span>
        </div>

        <div class="table-row" v-for="post in posts" :key="post.id">
          <span>{{ post.id }}</span>
          <span class="title">{{ post.title || '无标题' }}</span>
          <span>{{ post.category || '—' }}</span>
          <span>{{ post.createTime || '—' }}</span>
          <span>
            <el-tag size="mini" :type="post.status === 1 ? 'success' : 'danger'">
              {{ post.status === 1 ? '正常' : '封禁' }}
            </el-tag>
          </span>
          <span>
            <el-button type="primary" size="mini" @click="handleChangeStatus(post)">
              {{ post.status === 1 ? '封禁' : '恢复' }}
            </el-button>
          </span>
        </div>
      </div>

      <div class="load-more" v-if="hasMore">
        <button class="load-btn" @click="loadMore" :disabled="loading">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { getHomePosts } from "@/api/post.js";

export default {
  name: "PostManage",
  data() {
    return {
      posts: [],
      loading: false,
      hasMore: true,
      offset: 0,
      limit: 15
    };
  },
  created() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      if (this.loading) return;
      this.loading = true;
      try {
        const res = await getHomePosts({
          offset: this.offset,
          limit: this.limit,
          sort: "time"
        });
        const resp = res.data.code === 200 ? res.data.data : res.data;
        const list = resp.data || [];

        if (this.offset === 0) {
          this.posts = list;
        } else {
          this.posts = [...this.posts, ...list];
        }

        this.hasMore = resp.hasMore && list.length > 0;
        this.offset += list.length;
      } catch (e) {
        console.error("加载失败", e);
      } finally {
        this.loading = false;
      }
    },

    loadMore() {
      this.fetchPosts();
    },

    // 接收 post 对象，无未使用变量，eslint 安全
    async handleChangeStatus(post) {
      const tip = post.status === 1 ? "确定封禁此帖子？" : "确定恢复此帖子？";
      if (!confirm(tip)) return;

      try {
        // 这里等你后端接口写完再替换
        // await updatePostStatus({ postId: post.id, status: post.status === 1 ? 2 : 1 });

        this.$message.success("状态已更新");
        this.offset = 0;
        this.posts = [];
        this.fetchPosts();
      } catch (err) {
        this.$message.error("操作失败");
      }
    }
  }
};
</script>

<style scoped>
.post-manage-container {
  min-height: 100vh;
  background: #f7fafc;
  font-family: "Nunito", "Segoe UI", sans-serif;
  color: #455a64;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-header {
  margin-bottom: 24px;
}

.welcome-text h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #333;
}

.welcome-text p {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.post-table {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.table-head {
  display: grid;
  grid-template-columns: 80px 1fr 100px 160px 100px 100px;
  padding: 12px 16px;
  font-weight: 600;
  background: #f8f9fa;
  font-size: 13px;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px 160px 100px 100px;
  padding: 12px 16px;
  font-size: 13px;
  border-top: 1px solid #eee;
  align-items: center;
}

.table-row:hover {
  background: #f8f9fa;
}

.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 10px;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

.load-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>