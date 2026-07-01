<template>
  <div class="annotation-layer" v-if="visible">
    <AnnotationMarker
      v-for="marker in visibleMarkers"
      :key="marker.id"
      :annotation="marker"
      :isActive="activeAnnotation?.id === marker.id"
      :isHighlight="highlightedAnnotation?.id === marker.id"
      :style="getMarkerPosition(marker)"
      @click="handleMarkerClick"
    />
  </div>
</template>

<script>
import AnnotationMarker from './AnnotationMarker.vue';

export default {
  name: 'AnnotationLayer',
  components: {
    AnnotationMarker
  },
  props: {
    annotations: {
      type: Array,
      default: () => []
    },
    pageId: {
      type: String,
      default: ''
    },
    activeAnnotation: {
      type: Object,
      default: null
    },
    highlightedAnnotation: {
      type: Object,
      default: null
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    pageAnnotations() {
      if (!this.pageId) return this.annotations;
      return this.annotations.filter(a => a.pageId === this.pageId);
    },
    visibleMarkers() {
      return this.pageAnnotations.filter(a => a.status !== 'deprecated');
    }
  },
  methods: {
    getMarkerPosition(marker) {
      const defaultPositions = this.getDefaultPositions();
      const position = defaultPositions[marker.id];
      if (position) {
        return {
          top: position.top,
          left: position.left
        };
      }
      return { top: '10px', left: '10px' };
    },
    getDefaultPositions() {
      return {
        'A001': { top: '120px', left: '80px' },
        'A002': { top: '120px', left: '280px' },
        'A003': { top: '280px', left: '20px' },
        'A004': { top: '400px', left: '20px' },
        'A005': { top: '400px', left: '200px' },
        'A006': { top: '400px', left: '800px' },
        'A007': { top: '80px', left: '80px' },
        'A008': { top: '180px', left: '80px' },
        'A009': { top: '350px', left: '80px' },
        'A010': { top: '280px', left: '80px' },
        'A011': { top: '180px', left: '80px' },
        'A012': { top: '380px', left: '80px' },
        'A013': { top: '120px', left: '80px' },
        'A014': { top: '200px', left: '80px' },
        'A015': { top: '280px', left: '80px' },
        'A016': { top: '360px', left: '80px' },
        'A017': { top: '450px', left: '80px' },
        'A018': { top: '120px', left: '80px' },
        'A019': { top: '200px', left: '80px' },
        'A020': { top: '80px', left: '80px' },
        'A021': { top: '80px', left: '200px' },
        'A022': { top: '500px', left: '200px' },
        'A023': { top: '500px', left: '600px' }
      };
    },
    handleMarkerClick(annotation) {
      this.$emit('marker-click', annotation);
    },
    highlightElement(annotation) {
      this.$emit('highlight', annotation);
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  
  :deep(.annotation-marker) {
    pointer-events: auto;
  }
}
</style>