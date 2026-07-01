<template>
  <transition name="slide-right">
    <div class="annotation-panel-wrapper" v-if="visible">
      <div class="annotation-panel">
        <div class="panel-header">
          <div class="header-title">
            <div class="title-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="title-text">
              <span class="title-main">标注面板</span>
              <span class="title-sub">{{ currentPageInfo?.pageName || '全部页面' }}</span>
            </div>
          </div>
          <div class="header-stats">
            <span class="stat-item total">
              <span class="stat-num">{{ filteredAnnotations.length }}</span>
              <span class="stat-label">总标注</span>
            </span>
            <span class="stat-item p0" v-if="getCountByPriority('P0') > 0">
              <span class="stat-num">{{ getCountByPriority('P0') }}</span>
              <span class="stat-label">P0</span>
            </span>
            <span class="stat-item p1" v-if="getCountByPriority('P1') > 0">
              <span class="stat-num">{{ getCountByPriority('P1') }}</span>
              <span class="stat-label">P1</span>
            </span>
          </div>
          <button class="close-btn" @click="handleClose">
            <i class="el-icon-close"></i>
          </button>
        </div>

        <div class="panel-controls">
          <el-button
            :type="showMarkers ? 'primary' : 'default'"
            size="small"
            @click="toggleMarkers"
            class="control-btn"
            icon="el-icon-position"
          >
            {{ showMarkers ? '隐藏标注点' : '显示标注点' }}
          </el-button>
          <el-button
            size="small"
            @click="collapseAll"
            class="control-btn"
            icon="el-icon-minus"
          >
            全部收起
          </el-button>
        </div>

        <div class="panel-list" ref="listContainer">
          <div v-if="filteredAnnotations.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="el-icon-document-delete"></i>
            </div>
            <p class="empty-text">当前页面暂无标注</p>
            <p class="empty-tip">切换到其他页面查看更多标注</p>
          </div>

          <div
            v-for="page in filteredPages"
            :key="page.pageId"
            class="page-group"
          >
            <div class="page-title" @click="togglePageCollapse(page.pageId)">
              <i :class="collapsedPages[page.pageId] ? 'el-icon-arrow-right' : 'el-icon-arrow-down'" class="page-arrow"></i>
              <span class="page-name">{{ page.pageName }}</span>
              <span class="page-count-badge">{{ getAnnotationsByPage(page.pageId).length }}</span>
            </div>

            <transition name="expand-list">
              <div v-if="!collapsedPages[page.pageId]" class="annotation-list">
                <div
                  v-for="annotation in getAnnotationsByPage(page.pageId)"
                  :key="annotation.id"
                  :class="['annotation-item', { 
                    active: expandedAnnotationId === annotation.id, 
                    'has-target': annotation.targetElementId || annotation.selector 
                  }]"
                  @click="handleItemClick(annotation)"
                >
                  <div class="item-sidebar">
                    <span class="item-id-badge" :class="`priority-${annotation.priority}`">
                      {{ annotation.id }}
                    </span>
                  </div>
                  
                  <div class="item-content">
                    <div class="item-header">
                      <span class="item-type-tag">{{ annotation.type }}</span>
                      <span class="item-status" :class="annotation.status">{{ getStatusText(annotation.status) }}</span>
                    </div>
                    <div class="item-title">{{ annotation.title }}</div>
                    <div class="item-desc">{{ annotation.description }}</div>
                  </div>

                  <div class="item-arrow">
                    <i :class="expandedAnnotationId === annotation.id ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                  </div>

                  <transition name="expand">
                    <div v-if="expandedAnnotationId === annotation.id" class="item-detail">
                      <AnnotationDetail :annotation="annotation" />
                    </div>
                  </transition>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div class="panel-footer">
          <span class="footer-text">
            <i class="el-icon-info"></i>
            点击标注项查看详情，点击标注点定位元素
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import AnnotationDetail from './AnnotationDetail.vue';
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'AnnotationPanel',
  components: {
    AnnotationDetail
  },
  data() {
    return {
      annotations: annotationData.annotations,
      pages: annotationData.pages,
      expandedAnnotationId: null,
      showMarkers: true,
      collapsedPages: {},
      visible: false
    };
  },
  computed: {
    currentRoute() {
      return this.$route?.path || '';
    },
    currentPageInfo() {
      return this.pages.find(page => this.currentRoute.includes(page.route));
    },
    filteredPages() {
      if (!this.currentPageInfo) {
        return this.pages;
      }
      return [this.currentPageInfo];
    },
    filteredAnnotations() {
      if (!this.currentPageInfo) {
        return this.annotations;
      }
      return this.annotations.filter(a => a.pageId === this.currentPageInfo.pageId);
    }
  },
  watch: {
    currentRoute() {
      this.expandedAnnotationId = null;
    }
  },
  mounted() {
    this.bus.$on('annotationPanelToggle', this.handleToggle);
    this.bus.$on('annotationCanvasSelect', this.handleCanvasSelect);
    this.bus.$on('annotationCanvasToggle', this.handleCanvasToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationPanelToggle', this.handleToggle);
    this.bus.$off('annotationCanvasSelect', this.handleCanvasSelect);
    this.bus.$off('annotationCanvasToggle', this.handleCanvasToggle);
  },
  methods: {
    handleToggle(show) {
      this.visible = show;
      if (show) {
        this.showMarkers = true;
        this.bus.$emit('annotationCanvasToggle', true);
      } else {
        this.bus.$emit('annotationPanelClose');
      }
    },
    handleCanvasToggle(show) {
      this.showMarkers = show;
    },
    handleCanvasSelect(annotation) {
      this.visible = true;
      this.expandedAnnotationId = annotation.id;
      this.bus.$emit('annotationPanelSelect', annotation);
      
      this.$nextTick(() => {
        const itemEl = this.$el.querySelector(`.annotation-item.active`);
        if (itemEl) {
          itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },
    handleItemClick(annotation) {
      if (this.expandedAnnotationId === annotation.id) {
        this.expandedAnnotationId = null;
        this.bus.$emit('annotationHighlight', null);
        this.bus.$emit('annotationPanelSelect', null);
      } else {
        this.expandedAnnotationId = annotation.id;
        this.bus.$emit('annotationHighlight', annotation);
        this.bus.$emit('annotationPanelSelect', annotation);
      }
    },
    getAnnotationsByPage(pageId) {
      return this.annotations.filter(a => a.pageId === pageId);
    },
    getCountByPriority(priority) {
      return this.filteredAnnotations.filter(a => a.priority === priority).length;
    },
    toggleMarkers() {
      this.showMarkers = !this.showMarkers;
      this.bus.$emit('annotationCanvasToggle', this.showMarkers);
    },
    collapseAll() {
      this.expandedAnnotationId = null;
      this.bus.$emit('annotationHighlight', null);
      this.bus.$emit('annotationPanelSelect', null);
    },
    togglePageCollapse(pageId) {
      this.$set(this.collapsedPages, pageId, !this.collapsedPages[pageId]);
    },
    handleClose() {
      this.visible = false;
      this.bus.$emit('annotationPanelClose');
      this.bus.$emit('annotationHighlight', null);
    },
    getStatusText(status) {
      const map = {
        confirmed: '已确认',
        inferred: '推断',
        pending_confirm: '待确认',
        changed: '已变更',
        deprecated: '已废弃'
      };
      return map[status] || status;
    }
  },
  created() {
    this.pages.forEach(page => {
      this.$set(this.collapsedPages, page.pageId, false);
    });
  }
};
</script>

<style lang="scss" scoped>
.annotation-panel-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  z-index: 1000;
}

.annotation-panel {
  width: 100%;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.08);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

.panel-header {
  padding: 20px 20px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  position: relative;
  
  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    
    .title-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 20px;
      }
    }
    
    .title-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .title-main {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
      }
      
      .title-sub {
        font-size: 12px;
        opacity: 0.85;
        font-weight: 400;
      }
    }
  }
  
  .header-stats {
    display: flex;
    gap: 10px;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      min-width: 60px;
      
      .stat-num {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
      }
      
      .stat-label {
        font-size: 11px;
        opacity: 0.9;
        margin-top: 2px;
      }
      
      &.p0 {
        background: rgba(245, 108, 108, 0.9);
      }
      
      &.p1 {
        background: rgba(230, 162, 60, 0.9);
      }
    }
  }
  
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: rotate(90deg);
    }
    
    i {
      font-size: 18px;
    }
  }
}

.panel-controls {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  gap: 8px;
  background: #fafafa;
  
  .control-btn {
    flex: 1;
  }
}

.panel-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  background: #f5f7fa;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
    
    &:hover {
      background: #909399;
    }
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
  
  .empty-icon {
    margin-bottom: 16px;
    
    i {
      font-size: 64px;
      opacity: 0.4;
    }
  }
  
  .empty-text {
    font-size: 15px;
    color: #606266;
    margin-bottom: 6px;
    font-weight: 500;
  }
  
  .empty-tip {
    font-size: 13px;
    color: #909399;
  }
}

.page-group {
  margin-bottom: 8px;
  
  .page-title {
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    transition: background 0.2s ease;
    
    &:hover {
      background: #f5f7fa;
    }
    
    .page-arrow {
      font-size: 12px;
      color: #909399;
      transition: transform 0.2s ease;
    }
    
    .page-name {
      flex: 1;
    }
    
    .page-count-badge {
      background: #ecf5ff;
      color: #409eff;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
  }
  
  .annotation-list {
    padding: 8px 12px;
  }
}

.expand-list-enter-active,
.expand-list-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-list-enter,
.expand-list-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.annotation-item {
  margin-bottom: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e7ed;
  position: relative;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &.active {
    border-color: #409eff;
    background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #409eff 0%, #667eea 100%);
    }
  }
  
  .item-sidebar {
    position: absolute;
    top: 14px;
    left: 14px;
    
    .item-id-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 700;
      color: #fff;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
      letter-spacing: 0.3px;
      
      &.priority-P0 {
        background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
        box-shadow: 0 2px 6px rgba(245, 108, 108, 0.4);
      }
      
      &.priority-P1 {
        background: linear-gradient(135deg, #e6a23c 0%, #f39c12 100%);
        box-shadow: 0 2px 6px rgba(230, 162, 60, 0.4);
      }
      
      &.priority-P2 {
        background: linear-gradient(135deg, #909399 0%, #606266 100%);
        box-shadow: 0 2px 6px rgba(144, 147, 153, 0.4);
      }
    }
  }
  
  .item-content {
    padding: 14px 14px 14px 72px;
    
    .item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      
      .item-type-tag {
        font-size: 11px;
        color: #409eff;
        background: #ecf5ff;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 500;
      }
      
      .item-status {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        
        &.confirmed {
          color: #67c23a;
          background: #f0f9eb;
        }
        
        &.inferred {
          color: #e6a23c;
          background: #fdf6ec;
        }
        
        &.pending_confirm {
          color: #f56c6c;
          background: #fef0f0;
        }
      }
    }
    
    .item-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 6px;
      line-height: 1.4;
    }
    
    .item-desc {
      font-size: 12px;
      color: #909399;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  .item-arrow {
    position: absolute;
    top: 50%;
    right: 14px;
    transform: translateY(-50%);
    color: #c0c4cc;
    font-size: 14px;
    transition: all 0.25s ease;
  }
  
  &.active .item-arrow {
    color: #409eff;
  }
  
  .item-detail {
    border-top: 1px dashed #dcdfe6;
    background: #fff;
    margin: 0 12px 12px;
    border-radius: 0 0 8px 8px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
  
  .footer-text {
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 6px;
    
    i {
      color: #409eff;
    }
  }
}
</style>
