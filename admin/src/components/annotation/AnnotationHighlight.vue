<template>
  <div class="annotation-highlight-container">
    <div
      v-if="highlightedElement"
      :class="['highlight-overlay', { visible: isVisible }]"
      :style="overlayStyle"
    >
      <div class="highlight-inner">
        <div class="highlight-corner corner-tl"></div>
        <div class="highlight-corner corner-tr"></div>
        <div class="highlight-corner corner-bl"></div>
        <div class="highlight-corner corner-br"></div>
        <div class="highlight-border border-top"></div>
        <div class="highlight-border border-right"></div>
        <div class="highlight-border border-bottom"></div>
        <div class="highlight-border border-left"></div>
      </div>
      <div class="highlight-glow"></div>
      <div class="highlight-label" v-if="currentAnnotation">
        <span class="label-id" :class="`priority-${currentAnnotation.priority}`">{{ currentAnnotation.id }}</span>
        <span class="label-title">{{ currentAnnotation.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnotationHighlight',
  data() {
    return {
      currentAnnotation: null,
      highlightedElement: null,
      elementRect: null,
      isVisible: false,
      observer: null,
      rafId: null,
      updateTimer: null,
      scrollContainers: []
    };
  },
  computed: {
    overlayStyle() {
      if (!this.elementRect) return {};
      return {
        left: this.elementRect.left + 'px',
        top: this.elementRect.top + 'px',
        width: this.elementRect.width + 'px',
        height: this.elementRect.height + 'px'
      };
    }
  },
  mounted() {
    this.bus.$on('annotationHighlight', this.handleHighlight);
    
    window.addEventListener('resize', this.scheduleUpdate, true);
    window.addEventListener('scroll', this.scheduleUpdate, true);

    this.observer = new MutationObserver(() => {
      if (this.currentAnnotation) {
        this.scheduleUpdate();
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  },
  beforeDestroy() {
    this.bus.$off('annotationHighlight', this.handleHighlight);
    
    window.removeEventListener('resize', this.scheduleUpdate, true);
    window.removeEventListener('scroll', this.scheduleUpdate, true);
    
    this.removeScrollListeners();
    
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
  },
  methods: {
    handleHighlight(annotation) {
      this.currentAnnotation = annotation;
      if (annotation) {
        this.findAndHighlightElement();
      } else {
        this.hideHighlight();
      }
    },
    findAndHighlightElement() {
      if (!this.currentAnnotation) return;
      
      const { targetElementId, selector } = this.currentAnnotation;
      let element = null;
      
      if (targetElementId) {
        element = document.getElementById(targetElementId);
      }
      
      if (!element && selector) {
        try {
          element = document.querySelector(selector);
        } catch (e) {
        }
      }
      
      if (element) {
        this.highlightedElement = element;
        this.updatePosition();
        this.isVisible = true;
        this.findScrollContainers();
      } else {
        this.hideHighlight();
      }
    },
    findScrollContainers() {
      this.removeScrollListeners();
      this.scrollContainers = [];
      
      const containers = document.querySelectorAll('.app-main, .main-container, [class*=scroll], [class*=Scroll]');
      containers.forEach(container => {
        const style = window.getComputedStyle(container);
        if (style.overflow === 'auto' || style.overflow === 'scroll' || 
            style.overflowY === 'auto' || style.overflowY === 'scroll' ||
            style.overflowX === 'auto' || style.overflowX === 'scroll') {
          this.scrollContainers.push(container);
          container.addEventListener('scroll', this.scheduleUpdate, true);
        }
      });
    },
    removeScrollListeners() {
      this.scrollContainers.forEach(container => {
        container.removeEventListener('scroll', this.scheduleUpdate, true);
      });
      this.scrollContainers = [];
    },
    scheduleUpdate() {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }
      this.updateTimer = setTimeout(() => {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
        }
        this.rafId = requestAnimationFrame(() => {
          this.updatePosition();
        });
      }, 16);
    },
    updatePosition() {
      if (this.highlightedElement) {
        const rect = this.highlightedElement.getBoundingClientRect();
        this.elementRect = {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height
        };
      }
    },
    hideHighlight() {
      this.isVisible = false;
      setTimeout(() => {
        this.highlightedElement = null;
        this.elementRect = null;
        this.removeScrollListeners();
      }, 300);
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-highlight-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
}

.highlight-overlay {
  position: absolute;
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: scale(0.98);
  
  &.visible {
    opacity: 1;
    transform: scale(1);
  }
  
  .highlight-inner {
    position: absolute;
    inset: 0;
    border-radius: 6px;
    background: rgba(64, 158, 255, 0.06);
    
    .highlight-corner {
      position: absolute;
      width: 10px;
      height: 10px;
      border: 2px solid #409eff;
      
      &.corner-tl {
        top: -2px;
        left: -2px;
        border-right: none;
        border-bottom: none;
        border-radius: 6px 0 0 0;
      }
      
      &.corner-tr {
        top: -2px;
        right: -2px;
        border-left: none;
        border-bottom: none;
        border-radius: 0 6px 0 0;
      }
      
      &.corner-bl {
        bottom: -2px;
        left: -2px;
        border-right: none;
        border-top: none;
        border-radius: 0 0 0 6px;
      }
      
      &.corner-br {
        bottom: -2px;
        right: -2px;
        border-left: none;
        border-top: none;
        border-radius: 0 0 6px 0;
      }
    }
    
    .highlight-border {
      position: absolute;
      background: #409eff;
      
      &.border-top,
      &.border-bottom {
        height: 2px;
        left: 8px;
        right: 8px;
      }
      
      &.border-top {
        top: -1px;
      }
      
      &.border-bottom {
        bottom: -1px;
      }
      
      &.border-left,
      &.border-right {
        width: 2px;
        top: 8px;
        bottom: 8px;
      }
      
      &.border-left {
        left: -1px;
      }
      
      &.border-right {
        right: -1px;
      }
    }
  }
  
  .highlight-glow {
    position: absolute;
    inset: -12px;
    border-radius: 12px;
    background: radial-gradient(ellipse at center, rgba(64, 158, 255, 0.25) 0%, transparent 70%);
    filter: blur(8px);
    animation: glowPulse 2s ease-in-out infinite;
  }
  
  .highlight-label {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
    color: #fff;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: labelFloat 3s ease-in-out infinite;
    
    .label-id {
      font-weight: 700;
      background: rgba(255, 255, 255, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
    }
    
    .label-title {
      font-weight: 500;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid #409eff;
    }
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes labelFloat {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-3px);
  }
}
</style>
