<template>
  <el-button 
    type="primary" 
    icon="el-icon-file-text" 
    @click="$emit('toggle')"
    class="annotation-toggle-btn"
  >
    显示标注
  </el-button>
</template>

<script>
export default {
  name: 'AnnotationToggle',
  emits: ['toggle']
};
</script>

<style lang="scss" scoped>
.annotation-toggle-btn {
  margin-right: 12px;
}
</style>