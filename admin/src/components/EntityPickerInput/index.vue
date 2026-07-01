<template>
  <span class="entity-picker-input">
    <el-input
      :value="displayValue"
      readonly
      :placeholder="placeholder"
      class="entity-picker-control"
      @focus="openDialog"
      @click.native="openDialog"
    >
      <el-button slot="append" icon="el-icon-search" @click.stop="openDialog" />
    </el-input>

    <el-dialog :title="title" :visible.sync="visible" width="980px" append-to-body custom-class="entity-picker-dialog">
      <div class="entity-picker-query">
        <span class="query-label">{{ searchLabel }}</span>
        <el-input v-model="keyword" clearable class="query-input" :placeholder="searchPlaceholder" @keyup.enter.native="handleQuery" />
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>

      <el-table :data="pagedRows" height="420" class="entity-picker-table" @row-click="handleRowClick">
        <el-table-column width="48" align="center">
          <template slot-scope="scope"><el-radio v-model="selectedKey" :label="getRowKey(scope.row)"><span></span></el-radio></template>
        </el-table-column>
        <el-table-column v-for="col in columns" :key="col.prop || col.label" :label="col.label" :prop="col.prop" :width="col.width" :min-width="col.minWidth">
          <template slot-scope="scope">
            <el-avatar v-if="col.type === 'avatar'" :size="34" :src="scope.row[col.prop]">{{ getInitial(scope.row[col.fallbackProp]) }}</el-avatar>
            <span v-else>{{ formatValue(scope.row, col) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="entity-picker-footer">
        <span class="entity-picker-total">共 {{ filteredRows.length }} 条</span>
        <el-select v-model="pageSize" size="small" class="entity-picker-page-size">
          <el-option :value="10" label="10条/页" />
          <el-option :value="20" label="20条/页" />
        </el-select>
        <el-pagination small layout="prev, pager, next" :total="filteredRows.length" :page-size="pageSize" :current-page.sync="page" />
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect">确定</el-button>
      </div>
    </el-dialog>
  </span>
</template>

<script>
export default {
  name: 'EntityPickerInput',
  props: {
    value: { type: [String, Number], default: '' },
    display: { type: String, default: '' },
    placeholder: { type: String, default: '请选择' },
    title: { type: String, default: '选择数据' },
    searchLabel: { type: String, default: '搜索' },
    searchPlaceholder: { type: String, default: '请输入关键字' },
    rows: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'id' },
    searchFields: { type: Array, default: () => [] },
  },
  data() {
    return {
      visible: false,
      keyword: '',
      selectedKey: '',
      page: 1,
      pageSize: 10,
    };
  },
  computed: {
    displayValue() {
      return this.display || '';
    },
    filteredRows() {
      const keyword = String(this.keyword || '').trim().toLowerCase();
      if (!keyword) return this.rows;
      const fields = this.searchFields.length ? this.searchFields : this.columns.map(item => item.prop).filter(Boolean);
      return this.rows.filter(row => fields.some(field => String(row[field] || '').toLowerCase().includes(keyword)));
    },
    pagedRows() {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredRows.slice(start, start + this.pageSize);
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.selectedKey = val;
      },
    },
  },
  methods: {
    openDialog() {
      this.selectedKey = this.value;
      this.page = 1;
      this.visible = true;
    },
    handleQuery() {
      this.page = 1;
    },
    handleReset() {
      this.keyword = '';
      this.page = 1;
    },
    handleRowClick(row) {
      this.selectedKey = this.getRowKey(row);
    },
    confirmSelect() {
      const row = this.filteredRows.find(item => this.getRowKey(item) === this.selectedKey);
      if (!row) {
        this.$message.warning('请选择数据');
        return;
      }
      this.$emit('input', this.selectedKey);
      this.$emit('select', row);
      this.visible = false;
    },
    getRowKey(row) {
      return row ? row[this.rowKey] : '';
    },
    getInitial(value) {
      return value ? String(value).charAt(0) : '-';
    },
    formatValue(row, col) {
      if (typeof col.formatter === 'function') return col.formatter(row);
      return row[col.prop] || '-';
    },
  },
};
</script>

<style lang="scss" scoped>
.entity-picker-input { display: inline-block; }
.entity-picker-control { width: 220px; }
::v-deep .entity-picker-control .el-input__inner { cursor: pointer; background: #fff; }
::v-deep .entity-picker-control .el-input-group__append { padding: 0; width: 44px; text-align: center; }
::v-deep .entity-picker-control .el-input-group__append .el-button { width: 44px; padding: 0; }
.entity-picker-query { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.query-label { color: #303133; white-space: nowrap; }
.query-input { width: 260px; }
.entity-picker-footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.entity-picker-page-size { width: 120px; }
.entity-picker-total { color: #606266; }
::v-deep .entity-picker-table th { background: #f5f7fa; color: #303133; font-weight: 500; }
</style>
