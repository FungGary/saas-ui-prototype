<template>
  <span class="annotation-wrapper" ref="wrapperRef" @click.stop="togglePanel">
    <span class="annotation-point">
      <i class="el-icon-info"></i>
    </span>
    <transition name="annotation-fade">
      <div v-if="visible" class="annotation-panel" :style="{ top: panelTop, left: panelLeft }" @click.stop>
        <div class="annotation-header">
          <span class="annotation-title">{{ title }}</span>
          <i class="el-icon-close annotation-close" @click="closePanel"></i>
        </div>
        <div class="annotation-content">
          <slot>{{ processedContent }}</slot>
        </div>
      </div>
    </transition>
  </span>

<script>
export default {
  name: 'AnnotationPoint',
  props: {
    title: {
      type: String,
      default: '优化说明'
    },
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      panelTop: '0px',
      panelLeft: '0px'
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.calculatePosition();
        });
      }
    }
  },
  methods: {
    calculatePosition() {
      const wrapperRect = this.$refs.wrapperRef?.getBoundingClientRect();
      if (!wrapperRect) return;
      
      const panelEl = this.$el.querySelector('.annotation-panel');
      if (!panelEl) return;
      
      const panelWidth = 280;
      const panelHeight = panelEl.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offset = 8;
      
      // 水平位置：优先右侧，如果右侧空间不足则左侧
      let left = wrapperRect.right + offset;
      if (left + panelWidth > viewportWidth) {
        left = wrapperRect.left - panelWidth - offset;
      }
      
      // 垂直位置：优先与元素顶部对齐，如果底部超出视口则向上调整
      let top = wrapperRect.top;
      if (top + panelHeight > viewportHeight - 10) {
        top = viewportHeight - panelHeight - 10;
      }
      if (top < 10) {
        top = 10;
      }
      
      // 如果水平位置超出左侧边界，则改回右侧
      if (left < 10) {
        left = wrapperRect.right + offset;
      }
      
      this.panelTop = `${top}px`;
      this.panelLeft = `${left}px`;
    },
    processedContent() {
      let result = this.content || '';
      result = result.replace(/&#10;/g, '\n');
      result = result.replace(/&#13;/g, '\n');
      return result;
    },
    togglePanel() {
      this.visible = !this.visible;
      this.$emit('toggle', this.visible);
    },
    closePanel() {
      this.visible = false;
      this.$emit('close');
    },
    handleClickOutside(e) {
      if (this.visible && this.$refs.wrapperRef && !this.$refs.wrapperRef.contains(e.target)) {
        this.visible = false;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style lang="scss" scoped>
.annotation-wrapper {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}

.annotation-point {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);

  &:hover {
    transform: scale(1.1);
    background: #66b1ff;
  }

  i {
    line-height: 1;
  }
}

.annotation-panel {
  position: fixed;
  z-index: 99999;
  width: 280px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.annotation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
}

.annotation-title {
  font-size: 14px;
  font-weight: 600;
}

.annotation-close {
  font-size: 14px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.annotation-content {
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-all;
}

.annotation-fade-enter-active,
.annotation-fade-leave-active {
  transition: all 0.2s ease;
}

.annotation-fade-enter,
.annotation-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
