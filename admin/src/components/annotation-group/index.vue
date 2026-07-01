<template>
  <div class="annotation-group">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AnnotationGroup',
  provide() {
    return {
      annotationGroup: this
    };
  },
  data() {
    return {
      activeAnnotation: null
    };
  },
  methods: {
    setActive(name) {
      this.activeAnnotation = name;
    },
    isActive(name) {
      return this.activeAnnotation === name;
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-group {
  // 允许内部标注点正确显示
}
</style>
