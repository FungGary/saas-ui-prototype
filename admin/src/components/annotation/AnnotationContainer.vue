<template>
  <div class="annotation-container" :class="{ 'panel-open': showPanel }">
    <slot></slot>
    
    <AnnotationLayer
      v-if="showMarkers"
      :annotations="annotations"
      :pageId="currentPageId"
      :activeAnnotation="activeAnnotation"
      :highlightedAnnotation="highlightedAnnotation"
      :visible="showMarkers"
      @marker-click="handleMarkerClick"
      @highlight="handleHighlight"
    />
    
    <div class="annotation-toggle" @click="togglePanel">
      <i :class="showPanel ? 'el-icon-close' : 'el-icon-document'"></i>
    </div>
    
    <transition name="slide">
      <AnnotationPanel
        v-if="showPanel"
        ref="annotationPanel"
        @select="handlePanelSelect"
        @toggle-markers="handleToggleMarkers"
        @clear-selection="handleClearSelection"
      />
    </transition>
  </div>
</template>

<script>
import AnnotationLayer from './AnnotationLayer.vue';
import AnnotationPanel from './AnnotationPanel.vue';
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'AnnotationContainer',
  components: {
    AnnotationLayer,
    AnnotationPanel
  },
  props: {
    pageId: {
      type: String,
      default: ''
    },
    autoShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      annotations: annotationData.annotations,
      pages: annotationData.pages,
      showPanel: this.autoShow,
      showMarkers: this.autoShow,
      activeAnnotation: null,
      highlightedAnnotation: null,
      currentPageId: this.pageId
    };
  },
  methods: {
    togglePanel() {
      this.showPanel = !this.showPanel;
      if (this.showPanel) {
        this.showMarkers = true;
      }
    },
    handleMarkerClick(annotation) {
      this.activeAnnotation = annotation;
      this.showPanel = true;
      if (this.$refs.annotationPanel) {
        this.$refs.annotationPanel.selectedAnnotation = annotation;
      }
      this.$emit('annotation-click', annotation);
    },
    handlePanelSelect(annotation) {
      this.activeAnnotation = annotation;
      this.currentPageId = annotation.pageId;
      this.scrollToElement(annotation);
      this.$emit('annotation-select', annotation);
    },
    handleToggleMarkers(visible) {
      this.showMarkers = visible;
    },
    handleClearSelection() {
      this.activeAnnotation = null;
      this.highlightedAnnotation = null;
    },
    handleHighlight(annotation) {
      this.highlightedAnnotation = annotation;
      setTimeout(() => {
        this.highlightedAnnotation = null;
      }, 3000);
    },
    scrollToElement(annotation) {
      const element = document.querySelector(annotation.selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.highlightedAnnotation = annotation;
        setTimeout(() => {
          this.highlightedAnnotation = null;
        }, 2000);
      } else {
        this.$message.warning('当前页面未找到目标元素，可能已被删除或改名');
      }
    },
    setPageId(pageId) {
      this.currentPageId = pageId;
    },
    show() {
      this.showPanel = true;
      this.showMarkers = true;
    },
    hide() {
      this.showPanel = false;
      this.showMarkers = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-container {
  position: relative;
  min-height: 100%;
  
  &.panel-open {
    padding-right: 380px;
  }
}

.annotation-toggle {
  position: fixed;
  right: 20px;
  bottom: 100px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 10001;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
}
</style>