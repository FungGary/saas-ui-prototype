<template>
  <div class="annotation-wrapper" ref="wrapperRef">
    <span class="annotation-point" @click.stop="togglePanel">
      <i class="el-icon-info"></i>
    </span>
  </div>
</template>

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
    },
    position: {
      type: String,
      default: 'right',
      validator: value => ['right', 'left', 'bottom'].includes(value)
    }
  },
  data() {
    return {
      visible: false,
      panelEl: null
    };
  },
  computed: {
    processedContent() {
      let result = this.content || '';
      result = result.replace(/&#10;/g, '\n');
      result = result.replace(/&#13;/g, '\n');
      return result;
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    this.destroyPanel();
  },
  methods: {
    togglePanel() {
      this.visible = !this.visible;
      this.$emit('toggle', this.visible);
      if (this.visible) {
        this.createPanel();
      } else {
        this.destroyPanel();
      }
    },
    closePanel() {
      this.visible = false;
      this.$emit('close');
      this.destroyPanel();
    },
    createPanel() {
      if (this.panelEl) return;
      
      const wrapper = this.$refs.wrapperRef;
      if (!wrapper) return;
      
      const rect = wrapper.getBoundingClientRect();
      const panel = document.createElement('div');
      panel.className = 'annotation-panel';
      panel.style.zIndex = '99999';
      panel.style.position = 'fixed';
      panel.style.visibility = 'hidden';
      panel.style.width = '280px';
      
      const panelWidth = 280;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offset = 8;
      
      // 先构建内容并添加到DOM以测量实际高度
      const arrowClass = rect.right + panelWidth + offset <= viewportWidth ? 'annotation-arrow-left' : 'annotation-arrow-right';
      panel.innerHTML = `
        <div class="annotation-header">
          <span class="annotation-title">${this.title}</span>
          <i class="el-icon-close annotation-close"></i>
        </div>
        <div class="annotation-content">${this.processedContent}</div>
        <div class="${arrowClass}"></div>
      `;
      
      document.body.appendChild(panel);
      
      // 获取实际高度
      const panelHeight = panel.offsetHeight;
      
      // 水平位置：优先右侧，如果右侧空间不足则左侧
      let left;
      if (rect.right + panelWidth + offset > viewportWidth) {
        left = rect.left - panelWidth - offset;
      } else {
        left = rect.right + offset;
      }
      
      // 垂直位置：优先与元素顶部对齐，如果底部超出视口则向上调整
      let top = rect.top;
      if (top + panelHeight > viewportHeight - 10) {
        top = viewportHeight - panelHeight - 10;
      }
      if (top < 10) {
        top = 10;
      }
      
      // 如果水平位置超出左侧边界，则改回右侧
      if (left < 10) {
        left = rect.right + offset;
      }
      
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.visibility = 'visible';
      
      // 更新箭头位置（根据计算后的方向）
      const finalArrowClass = left < rect.left ? 'annotation-arrow-right' : 'annotation-arrow-left';
      const arrowEl = panel.querySelector('.annotation-arrow-left, .annotation-arrow-right');
      if (arrowEl) {
        arrowEl.className = finalArrowClass;
      }
      
      const closeBtn = panel.querySelector('.annotation-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closePanel();
        });
      }
      
      panel.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      this.panelEl = panel;
      
      requestAnimationFrame(() => {
        panel.classList.add('annotation-show');
      });
    },
    destroyPanel() {
      if (this.panelEl) {
        this.panelEl.classList.remove('annotation-show');
        setTimeout(() => {
          if (this.panelEl && this.panelEl.parentNode) {
            this.panelEl.parentNode.removeChild(this.panelEl);
          }
          this.panelEl = null;
        }, 200);
      }
    },
    handleClickOutside(e) {
      if (this.visible && this.$refs.wrapperRef && !this.$refs.wrapperRef.contains(e.target)) {
        this.closePanel();
      }
    }
  }
};
</script>

<style lang="scss">
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
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.2s ease;

  &.annotation-show {
    opacity: 1;
    transform: scale(1);
  }
}

.annotation-arrow-left {
  position: absolute;
  top: 12px;
  left: -6px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #fff;
}

.annotation-arrow-right {
  position: absolute;
  top: 12px;
  right: -6px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #fff;
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
</style>