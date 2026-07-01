<template>
  <div>
    <el-card :bordered="false" shadow="never" :body-style="{ padding: 0 }">
      <bag-table-from @getList="getData" />
    </el-card>
    <el-card :bordered="false" shadow="never" class="mt16" :body-style="{ padding: '0 20px 20px' }">
      <bag-table-list ref="table" />
    </el-card>
  </div>
</template>

<script>
import bagTableFrom from './components/tableFrom';
import bagTableList from './components/tableList';
export default {
  name: 'bagList',
  components: {
    bagTableFrom,
    bagTableList,
  },
  data() {
    return {};
  },
  methods: {
    getData(res) {
      this.$refs.table.getList(res);
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
</style>