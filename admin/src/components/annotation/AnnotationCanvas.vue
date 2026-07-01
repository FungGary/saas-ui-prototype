<template>
  <div class="annotation-canvas" v-if="visible">
    <svg class="connector-svg" v-if="activeAnnotationId">
      <defs>
        <linearGradient id="connectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#409eff;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <path
        v-if="activeConnectorPath"
        :d="activeConnectorPath"
        fill="none"
        stroke="url(#connectorGradient)"
        stroke-width="2"
        stroke-dasharray="6,4"
        class="connector-line"
      />
    </svg>

    <div
      v-for="annotation in visibleAnnotations"
      :key="annotation.id"
      :class="['canvas-marker', `priority-${annotation.priority}`, { active: activeAnnotationId === annotation.id }]"
      :style="getMarkerStyle(annotation)"
      @click.stop="handleMarkerClick(annotation)"
      @mouseenter="handleMarkerHover(annotation, true)"
      @mouseleave="handleMarkerHover(annotation, false)"
    >
      <span class="marker-badge">{{ annotation.id }}</span>
      
      <transition name="fade">
        <div v-if="hoveredAnnotationId === annotation.id" class="marker-tooltip">
          <div class="tooltip-header">
            <span class="tooltip-id" :class="`priority-${annotation.priority}`">{{ annotation.id }}</span>
            <span class="tooltip-type">{{ annotation.type }}</span>
          </div>
          <div class="tooltip-title">{{ annotation.title }}</div>
          <div class="tooltip-desc">{{ annotation.description }}</div>
          <div class="tooltip-arrow"></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'AnnotationCanvas',
  data() {
    return {
      annotations: annotationData.annotations,
      pages: annotationData.pages,
      visible: false,
      activeAnnotationId: null,
      hoveredAnnotationId: null,
      markerPositions: {},
      elementRects: {},
      rafId: null,
      observer: null,
      updateTimer: null,
      scrollContainers: []
    };
  },
  computed: {
    currentRoute() {
      return this.$route?.path || '';
    },
    currentPageInfo() {
      return this.pages.find(page => this.currentRoute.includes(page.route));
    },
    pageAnnotations() {
      if (!this.currentPageInfo) return [];
      return this.annotations.filter(a =>
        a.pageId === this.currentPageInfo.pageId && a.status !== 'deprecated'
      );
    },
    visibleAnnotations() {
      return this.pageAnnotations.filter(a => a.targetElementId || a.selector);
    },
    activeConnectorPath() {
      if (!this.activeAnnotationId) return null;
      const pos = this.markerPositions[this.activeAnnotationId];
      const rect = this.elementRects[this.activeAnnotationId];
      if (!pos || !rect) return null;

      const markerX = window.innerWidth - pos.right;
      const markerY = pos.top;
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;

      const midX = (markerX + elementCenterX) / 2;

      return `M ${markerX} ${markerY} C ${midX} ${markerY}, ${midX} ${elementCenterY}, ${elementCenterX} ${elementCenterY}`;
    }
  },
  watch: {
    currentRoute() {
      this.scheduleUpdate();
      this.findScrollContainers();
    },
    visibleAnnotations: {
      handler() {
        this.scheduleUpdate();
      },
      deep: true
    }
  },
  mounted() {
    this.bus.$on('annotationCanvasToggle', this.handleToggle);
    this.bus.$on('annotationPanelSelect', this.handlePanelSelect);
    this.bus.$on('annotationPanelClose', this.handlePanelClose);

    window.addEventListener('resize', this.scheduleUpdate, true);
    window.addEventListener('scroll', this.scheduleUpdate, true);

    this.observer = new MutationObserver(() => {
      this.scheduleUpdate();
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeFilter: ['class', 'style', 'id']
    });

    this.$nextTick(() => {
      this.findScrollContainers();
      this.scheduleUpdate();
    });
  },
  beforeDestroy() {
    this.bus.$off('annotationCanvasToggle', this.handleToggle);
    this.bus.$off('annotationPanelSelect', this.handlePanelSelect);
    this.bus.$off('annotationPanelClose', this.handlePanelClose);

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
    handleToggle(show) {
      this.visible = show;
      if (show) {
        this.$nextTick(() => {
          this.findScrollContainers();
          this.scheduleUpdate();
        });
      }
    },
    handlePanelSelect(annotation) {
      this.activeAnnotationId = annotation?.id || null;
      if (annotation) {
        this.scrollElementIntoView(annotation);
      }
    },
    handlePanelClose() {
      this.activeAnnotationId = null;
    },
    handleMarkerClick(annotation) {
      this.activeAnnotationId = annotation.id;
      this.bus.$emit('annotationCanvasSelect', annotation);
      this.bus.$emit('annotationHighlight', annotation);
      this.scrollElementIntoView(annotation);
    },
    handleMarkerHover(annotation, isHover) {
      this.hoveredAnnotationId = isHover ? annotation.id : null;
    },
    scrollElementIntoView(annotation) {
      const element = this.findElement(annotation);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
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
          this.updateAllPositions();
        });
      }, 30);
    },
    updateAllPositions() {
      if (!this.visible) return;

      this.visibleAnnotations.forEach(annotation => {
        const element = this.findElement(annotation);
        if (element) {
          const rect = element.getBoundingClientRect();
          
          this.$set(this.elementRects, annotation.id, {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });

          this.$set(this.markerPositions, annotation.id, {
            top: rect.top - 10,
            right: window.innerWidth - rect.right + 10,
            width: rect.width,
            height: rect.height
          });
        } else {
          this.$set(this.markerPositions, annotation.id, null);
          this.$set(this.elementRects, annotation.id, null);
        }
      });
    },
    findElement(annotation) {
      const { targetElementId, selector } = annotation;

      if (targetElementId) {
        const el = document.getElementById(targetElementId);
        if (el) return el;
      }

      if (selector) {
        try {
          const el = document.querySelector(selector);
          if (el) return el;
        } catch (e) {
        }
      }

      return null;
    },
    getMarkerStyle(annotation) {
      const pos = this.markerPositions[annotation.id];
      if (!pos) {
        return { display: 'none' };
      }
      return {
        top: pos.top + 'px',
        right: pos.right + 'px'
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9000;

  .connector-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;

    .connector-line {
      animation: dashMove 1s linear infinite;
    }
  }

  .canvas-marker {
    position: fixed;
    pointer-events: auto;
    cursor: pointer;
    transform: translate(50%, -50%);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;

    .marker-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      border-radius: 14px;
      background: #f56c6c;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(245, 108, 108, 0.5), 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.3px;
    }

    &:hover {
      transform: translate(50%, -50%) scale(1.1);
      z-index: 10;

      .marker-badge {
        box-shadow: 0 4px 16px rgba(245, 108, 108, 0.6), 0 2px 6px rgba(0, 0, 0, 0.15);
      }
    }

    &.active {
      transform: translate(50%, -50%) scale(1.15);
      z-index: 20;

      .marker-badge {
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.3), 0 4px 16px rgba(245, 108, 108, 0.6), 0 2px 6px rgba(0, 0, 0, 0.15);
        animation: badgePulse 2s ease-in-out infinite;
      }
    }

    &.priority-P0 {
      .marker-badge {
        background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.5), 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }

    &.priority-P1 {
      .marker-badge {
        background: linear-gradient(135deg, #e6a23c 0%, #f39c12 100%);
        box-shadow: 0 2px 8px rgba(230, 162, 60, 0.5), 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      &.active .marker-badge {
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.3), 0 4px 16px rgba(230, 162, 60, 0.6), 0 2px 6px rgba(0, 0, 0, 0.15);
      }
    }

    &.priority-P2 {
      .marker-badge {
        background: linear-gradient(135deg, #909399 0%, #606266 100%);
        box-shadow: 0 2px 8px rgba(144, 147, 153, 0.5), 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      &.active .marker-badge {
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.3), 0 4px 16px rgba(144, 147, 153, 0.6), 0 2px 6px rgba(0, 0, 0, 0.15);
      }
    }

    .marker-tooltip {
      position: absolute;
      bottom: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      min-width: 240px;
      max-width: 320px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 12px;
      pointer-events: none;
      z-index: 100;

      .tooltip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .tooltip-id {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          background: #f56c6c;

          &.priority-P0 {
            background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
          }

          &.priority-P1 {
            background: linear-gradient(135deg, #e6a23c 0%, #f39c12 100%);
          }

          &.priority-P2 {
            background: linear-gradient(135deg, #909399 0%, #606266 100%);
          }
        }

        .tooltip-type {
          font-size: 11px;
          color: #409eff;
          font-weight: 500;
        }
      }

      .tooltip-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 6px;
        line-height: 1.4;
      }

      .tooltip-desc {
        font-size: 12px;
        color: #606266;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .tooltip-arrow {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #fff;
        filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

@keyframes badgePulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.3), 0 4px 16px rgba(245, 108, 108, 0.6), 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(64, 158, 255, 0.15), 0 4px 16px rgba(245, 108, 108, 0.6), 0 2px 6px rgba(0, 0, 0, 0.15);
  }
}

@keyframes dashMove {
  to {
    stroke-dashoffset: -20;
  }
}
</style>
