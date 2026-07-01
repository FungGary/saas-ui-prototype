<template>
  <div class="annotation-review-page">
    <div class="page-header">
      <h2>原型标注评审系统</h2>
      <p class="page-desc">用户管理模块 - V1.0</p>
    </div>
    
    <div class="main-content">
      <div class="content-left">
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalCount }}</div>
            <div class="stat-label">总标注数</div>
          </div>
          <div class="stat-item p0">
            <div class="stat-value">{{ getCountByPriority('P0') }}</div>
            <div class="stat-label">P0 核心</div>
          </div>
          <div class="stat-item p1">
            <div class="stat-value">{{ getCountByPriority('P1') }}</div>
            <div class="stat-label">P1 重要</div>
          </div>
          <div class="stat-item p2">
            <div class="stat-value">{{ getCountByPriority('P2') }}</div>
            <div class="stat-label">P2 辅助</div>
          </div>
        </div>
        
        <div class="filter-section">
          <h3>筛选条件</h3>
          <div class="filter-row">
            <el-select v-model="filterPage" placeholder="选择页面" size="small" clearable>
              <el-option label="全部页面" value="" />
              <el-option 
                v-for="page in pages" 
                :key="page.pageId" 
                :label="page.pageName" 
                :value="page.pageId" 
              />
            </el-select>
          </div>
          <div class="filter-row">
            <el-select v-model="filterType" placeholder="标注类型" size="small" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="字段说明" value="字段说明" />
              <el-option label="交互说明" value="交互说明" />
              <el-option label="状态说明" value="状态说明" />
              <el-option label="权限说明" value="权限说明" />
            </el-select>
          </div>
          <div class="filter-row">
            <el-select v-model="filterPriority" placeholder="优先级" size="small" clearable>
              <el-option label="全部优先级" value="" />
              <el-option label="P0" value="P0" />
              <el-option label="P1" value="P1" />
              <el-option label="P2" value="P2" />
            </el-select>
          </div>
        </div>
        
        <div class="page-list">
          <h3>页面清单</h3>
          <div 
            v-for="page in filteredPages" 
            :key="page.pageId"
            :class="['page-item', { active: selectedPage?.pageId === page.pageId }]"
            @click="selectPage(page)"
          >
            <div class="page-name">{{ page.pageName }}</div>
            <div class="page-count">{{ page.annotations.length }} 条</div>
          </div>
        </div>
      </div>
      
      <div class="content-center">
        <div v-if="selectedAnnotation" class="detail-panel">
          <div class="detail-header">
            <div :class="['detail-id', `priority-${selectedAnnotation.priority}`]">
              {{ selectedAnnotation.id }}
            </div>
            <div class="detail-meta">
              <span class="detail-page">{{ selectedAnnotation.pageName }}</span>
              <span class="detail-type">{{ selectedAnnotation.type }}</span>
              <span :class="['detail-priority', `priority-${selectedAnnotation.priority}`]">
                {{ selectedAnnotation.priority }}
              </span>
            </div>
          </div>
          
          <div class="detail-title">{{ selectedAnnotation.title }}</div>
          
          <div class="detail-section">
            <div class="section-title">说明</div>
            <div class="section-content">{{ selectedAnnotation.description }}</div>
          </div>
          
          <div v-if="selectedAnnotation.businessRule?.length" class="detail-section">
            <div class="section-title">业务规则</div>
            <ul class="rule-list">
              <li v-for="(rule, i) in selectedAnnotation.businessRule" :key="i">{{ rule }}</li>
            </ul>
          </div>
          
          <div v-if="selectedAnnotation.interaction?.length" class="detail-section">
            <div class="section-title">交互规则</div>
            <ul class="rule-list">
              <li v-for="(item, i) in selectedAnnotation.interaction" :key="i">{{ item }}</li>
            </ul>
          </div>
          
          <div v-if="selectedAnnotation.validation?.length" class="detail-section">
            <div class="section-title">校验规则</div>
            <ul class="rule-list validation">
              <li v-for="(item, i) in selectedAnnotation.validation" :key="i">{{ item }}</li>
            </ul>
          </div>
          
          <div v-if="selectedAnnotation.state?.length" class="detail-section">
            <div class="section-title">状态说明</div>
            <div class="tag-list">
              <span v-for="(state, i) in selectedAnnotation.state" :key="i" class="state-tag">{{ state }}</span>
            </div>
          </div>
          
          <div v-if="selectedAnnotation.permission?.length" class="detail-section">
            <div class="section-title">权限说明</div>
            <ul class="rule-list">
              <li v-for="(item, i) in selectedAnnotation.permission" :key="i">{{ item }}</li>
            </ul>
          </div>
          
          <div v-if="selectedAnnotation.todo?.length" class="detail-section todo">
            <div class="section-title">待确认事项</div>
            <ul class="rule-list">
              <li v-for="(item, i) in selectedAnnotation.todo" :key="i">{{ item }}</li>
            </ul>
          </div>
        </div>
        
        <div v-else class="empty-detail">
          <i class="el-icon-document"></i>
          <p>选择一个标注查看详情</p>
        </div>
      </div>
      
      <div class="content-right">
        <div class="annotation-list">
          <div 
            v-for="annotation in filteredAnnotations" 
            :key="annotation.id"
            :class="['annotation-item', { active: selectedAnnotation?.id === annotation.id }]"
            @click="selectAnnotation(annotation)"
          >
            <div class="item-header">
              <span :class="['item-id', `priority-${annotation.priority}`]">{{ annotation.id }}</span>
              <span class="item-type">{{ annotation.type }}</span>
            </div>
            <div class="item-title">{{ annotation.title }}</div>
            <div class="item-page">{{ annotation.pageName }}</div>
          </div>
          
          <div v-if="filteredAnnotations.length === 0" class="empty-list">
            <p>暂无符合条件的标注</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'AnnotationReviewPage',
  data() {
    return {
      annotations: annotationData.annotations,
      pages: annotationData.pages,
      selectedPage: null,
      selectedAnnotation: null,
      filterPage: '',
      filterType: '',
      filterPriority: '',
      currentPageId: ''
    };
  },
  computed: {
    totalCount() {
      return this.filteredAnnotations.length;
    },
    filteredAnnotations() {
      return this.annotations.filter(a => {
        if (this.filterPage && a.pageId !== this.filterPage) return false;
        if (this.filterType && a.type !== this.filterType) return false;
        if (this.filterPriority && a.priority !== this.filterPriority) return false;
        return true;
      });
    },
    filteredPages() {
      if (!this.filterPage) {
        return this.pages;
      }
      return this.pages.filter(p => p.pageId === this.filterPage);
    }
  },
  mounted() {
    this.initFilterByRoute();
  },
  methods: {
    initFilterByRoute() {
      const pageId = this.$route.query.pageId;
      const routeName = this.$route.query.routeName;
      
      if (pageId) {
        this.filterPage = pageId;
        this.currentPageId = pageId;
        const page = this.pages.find(p => p.pageId === pageId);
        if (page) {
          this.selectedPage = page;
        }
      } else if (routeName) {
        const page = this.pages.find(p => p.routeName === routeName);
        if (page) {
          this.filterPage = page.pageId;
          this.currentPageId = page.pageId;
          this.selectedPage = page;
        }
      }
    },
    getCountByPriority(priority) {
      return this.filteredAnnotations.filter(a => a.priority === priority).length;
    },
    selectPage(page) {
      this.selectedPage = page;
      this.filterPage = page.pageId;
    },
    selectAnnotation(annotation) {
      this.selectedAnnotation = annotation;
      this.selectedPage = this.pages.find(p => p.pageId === annotation.pageId);
    },
    clearFilter() {
      this.filterPage = '';
      this.filterType = '';
      this.filterPriority = '';
      this.selectedPage = null;
      this.selectedAnnotation = null;
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-review-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #303133;
  }
  
  .page-desc {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 24px;
  min-height: calc(100vh - 150px);
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  
  .stat-item {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #303133;
    }
    
    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
    
    &.p0 .stat-value { color: #f56c6c; }
    &.p1 .stat-value { color: #e6a23c; }
    &.p2 .stat-value { color: #909399; }
  }
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: #303133;
  }
  
  .filter-row {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    :deep(.el-select) {
      width: 100%;
    }
  }
}

.page-list {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: #303133;
  }
  
  .page-item {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;
    border: 1px solid transparent;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.active {
      background: #ecf5ff;
      border-color: #409eff;
    }
    
    .page-name {
      font-size: 14px;
      color: #303133;
    }
    
    .page-count {
      font-size: 12px;
      color: #909399;
      background: #f4f4f5;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }
}

.detail-panel {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  
  .detail-id {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    background: #409eff;
    
    &.priority-P0 { background: #f56c6c; }
    &.priority-P1 { background: #e6a23c; }
    &.priority-P2 { background: #909399; }
  }
  
  .detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 13px;
    
    .detail-page { color: #303133; }
    .detail-type { color: #409eff; }
    .detail-priority {
      padding: 2px 8px;
      border-radius: 4px;
      color: #fff;
      background: #f56c6c;
      
      &.priority-P0 { background: #f56c6c; }
      &.priority-P1 { background: #e6a23c; }
      &.priority-P2 { background: #909399; }
    }
  }
}

.detail-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #409eff;
    margin-bottom: 10px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
  }
  
  .section-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
  }
  
  &.todo .section-title {
    color: #e6a23c;
    border-left-color: #e6a23c;
  }
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    font-size: 13px;
    color: #606266;
    line-height: 1.8;
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
    
    &::before {
      content: '•';
      position: absolute;
      left: 4px;
      color: #409eff;
    }
  }
  
  &.validation li::before {
    color: #f56c6c;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .state-tag {
    padding: 4px 12px;
    background: #f4f4f5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
  }
}

.empty-detail {
  background: #fff;
  padding: 80px 40px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  i {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.annotation-list {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
}

.annotation-item {
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #409eff;
    background: #f0f9ff;
  }
  
  &.active {
    border-color: #409eff;
    background: #ecf5ff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  }
  
  .item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .item-id {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      background: #409eff;
      
      &.priority-P0 { background: #f56c6c; }
      &.priority-P1 { background: #e6a23c; }
      &.priority-P2 { background: #909399; }
    }
    
    .item-type {
      font-size: 11px;
      color: #409eff;
    }
  }
  
  .item-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .item-page {
    font-size: 12px;
    color: #909399;
  }
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}
</style>