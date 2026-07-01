<template>
  <div class="game-config-container">
    <el-card :bordered="false" shadow="never" class="config-card" :body-style="{ padding: '24px 32px' }">
      <router-view></router-view>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GameConfig',
};
</script>

<style scoped lang="scss">
.game-config-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.config-card {
  border-radius: 4px;
}
</style>
