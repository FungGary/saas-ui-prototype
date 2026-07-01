<template>
  <div class="annotation-panel-wrapper" v-if="visible">
    <div class="annotation-panel">
      <div class="panel-header">
        <h3>页面标注</h3>
        <span class="close-btn" @click="closePanel">×</span>
      </div>
      <div class="panel-body">
        <div class="current-page">
          <span>当前页面：</span>
          <span class="page-name">{{ currentPageInfo?.pageName || '未知页面' }}</span>
        </div>
        <div class="filter-bar">
          <select v-model="filterType" class="filter-select">
            <option value="">全部类型</option>
            <option value="模块说明">模块说明</option>
            <option value="字段说明">字段说明</option>
            <option value="操作说明">操作说明</option>
            <option value="交互说明">交互说明</option>
            <option value="状态说明">状态说明</option>
            <option value="权限说明">权限说明</option>
          </select>
          <select v-model="filterPriority" class="filter-select">
            <option value="">全部优先级</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </div>
        <div class="annotation-list">
          <div 
            v-for="item in filteredAnnotations" 
            :key="item.id"
            class="annotation-item"
            :class="{ active: selectedAnnotation?.id === item.id }"
            @click="selectAnnotation(item)"
          >
            <span class="annotation-id">{{ item.id }}</span>
            <span class="annotation-title">{{ item.title }}</span>
            <span class="annotation-priority" :class="item.priority">{{ item.priority }}</span>
          </div>
          <div v-if="filteredAnnotations.length === 0" class="empty-state">
            当前页面暂无标注
          </div>
        </div>
      </div>
      <div class="panel-detail" v-if="selectedAnnotation">
        <div class="detail-header">
          <span class="detail-id">{{ selectedAnnotation.id }}</span>
          <span class="detail-type">{{ selectedAnnotation.type }}</span>
          <span class="detail-priority" :class="selectedAnnotation.priority">{{ selectedAnnotation.priority }}</span>
        </div>
        <h4>{{ selectedAnnotation.title }}</h4>
        <div class="detail-content">
          <p><strong>说明：</strong>{{ selectedAnnotation.description }}</p>
          <div v-if="selectedAnnotation.businessRule && selectedAnnotation.businessRule.length">
            <p><strong>业务规则：</strong></p>
            <ul>
              <li v-for="(rule, idx) in selectedAnnotation.businessRule" :key="idx">{{ rule }}</li>
            </ul>
          </div>
          <div v-if="selectedAnnotation.interaction && selectedAnnotation.interaction.length">
            <p><strong>交互规则：</strong></p>
            <ul>
              <li v-for="(inter, idx) in selectedAnnotation.interaction" :key="idx">{{ inter }}</li>
            </ul>
          </div>
          <div v-if="selectedAnnotation.permission && selectedAnnotation.permission.length">
            <p><strong>权限规则：</strong></p>
            <ul>
              <li v-for="(perm, idx) in selectedAnnotation.permission" :key="idx">{{ perm }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-mask" @click="closePanel"></div>
  </div>
</template>

<script>
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'AnnotationPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filterType: '',
      filterPriority: '',
      selectedAnnotation: null
    };
  },
  computed: {
    currentRoute() {
      return this.$route?.path || '';
    },
    currentPageInfo() {
      return annotationData.pages.find(page => {
        return this.currentRoute.includes(page.route);
      });
    },
    currentPageId() {
      return this.currentPageInfo?.pageId || '';
    },
    pageAnnotations() {
      if (!this.currentPageId) return [];
      return annotationData.annotations.filter(a => a.pageId === this.currentPageId);
    },
    filteredAnnotations() {
      return this.pageAnnotations.filter(a => {
        if (this.filterType && a.type !== this.filterType) return false;
        if (this.filterPriority && a.priority !== this.filterPriority) return false;
        return true;
      });
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.selectedAnnotation = this.pageAnnotations[0] || null;
        this.filterType = '';
        this.filterPriority = '';
      } else {
        this.selectedAnnotation = null;
      }
    },
    currentPageId() {
      if (this.visible) {
        this.selectedAnnotation = this.pageAnnotations[0] || null;
      }
    }
  },
  methods: {
    closePanel() {
      this.$emit('close');
    },
    selectAnnotation(item) {
      this.selectedAnnotation = item;
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-panel-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.panel-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.annotation-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  
  .close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
    line-height: 1;
    
    &:hover {
      color: #666;
    }
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.current-page {
  padding: 10px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #606266;
  
  .page-name {
    font-weight: 600;
    color: #409eff;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  
  .filter-select {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
  }
}

.annotation-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  font-size: 14px;
}

.annotation-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 4px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &.active {
    background-color: #ecf5ff;
    border-left: 3px solid #409eff;
  }
  
  .annotation-id {
    font-size: 12px;
    font-weight: 600;
    color: #409eff;
    margin-right: 10px;
    min-width: 45px;
  }
  
  .annotation-title {
    flex: 1;
    font-size: 13px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .annotation-priority {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
    
    &.P0 {
      background-color: #fff2f0;
      color: #ff4d4f;
    }
    
    &.P1 {
      background-color: #fff7e6;
      color: #fa8c16;
    }
    
    &.P2 {
      background-color: #f6ffed;
      color: #52c41a;
    }
  }
}

.panel-detail {
  border-top: 1px solid #e4e7ed;
  padding: 16px;
  background-color: #fafafa;
  max-height: 350px;
  overflow-y: auto;
  
  .detail-header {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
    
    .detail-id {
      font-size: 14px;
      font-weight: 600;
      color: #409eff;
    }
    
    .detail-type {
      font-size: 12px;
      padding: 2px 8px;
      background-color: #e6f7ff;
      color: #1890ff;
      border-radius: 4px;
    }
    
    .detail-priority {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 500;
      
      &.P0 {
        background-color: #fff2f0;
        color: #ff4d4f;
      }
      
      &.P1 {
        background-color: #fff7e6;
        color: #fa8c16;
      }
      
      &.P2 {
        background-color: #f6ffed;
        color: #52c41a;
      }
    }
  }
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
  
  .detail-content {
    font-size: 13px;
    color: #606266;
    line-height: 1.7;
    
    p {
      margin: 0 0 8px 0;
      
      strong {
        color: #303133;
      }
    }
    
    ul {
      margin: 0 0 12px 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 4px;
        list-style-type: disc;
      }
    }
  }
}
</style>