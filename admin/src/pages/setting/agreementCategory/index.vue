<template>
  <div class="agreement-category">
    <el-card :bordered="false" shadow="never" class="ivu-mb-16" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="searchForm"
          :model="searchForm"
          :label-width="labelWidth"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <el-form-item label="类型名称：" label-for="keyword">
            <el-input class="form_content_width" v-model="searchForm.keyword" placeholder="请输入类型名称" />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择"
              clearable
              @change="handleSearch"
              class="form_content_width"
            >
              <el-option value="" label="全部"></el-option>
              <el-option value="1" label="启用"></el-option>
              <el-option value="0" label="禁用"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-db-click @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card :bordered="false" shadow="never" class="ivu-mt">
      <el-button type="primary" v-db-click @click="handleAdd">新增类型</el-button>
      <el-table
        :data="tableData"
        ref="table"
        class="mt14"
        v-loading="loading"
        no-userFrom-text="暂无数据"
        no-filtered-userFrom-text="暂无筛选结果"
      >
        <el-table-column label="ID" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型名称" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型标识" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.key }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.sort"
              :min="0"
              size="small"
              @change="handleSortChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status"
              :value="scope.row.status"
              @change="handleStatusChange(scope.row)"
              size="large"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150" align="center">
          <template slot-scope="scope">
            <a v-db-click @click="handleEdit(scope.row)">编辑</a>
            <el-divider direction="vertical"></el-divider>
            <a v-db-click @click="handleDelete(scope.row)" class="text-danger">删除</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="searchForm.page"
          :limit.sync="searchForm.limit"
          @pagination="getList"
        />
      </div>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="categoryForm"
        :model="categoryForm"
        :rules="categoryRules"
        :label-width="labelWidth"
        label-position="right"
      >
        <el-form-item label="类型名称：" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入类型名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="类型标识：" prop="key">
          <el-input v-model="categoryForm.key" placeholder="请输入类型标识（英文）" />
          <div class="form-tip">用于程序识别，如 basic、play、benefit、shipping</div>
        </el-form-item>
        <el-form-item label="排序：" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
          <div class="form-tip">数值越小越靠前</div>
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" v-db-click @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AgreementCategory',
  data() {
    return {
      labelWidth: '100px',
      loading: false,
      total: 0,
      searchForm: {
        keyword: '',
        status: '',
        page: 1,
        limit: 10,
      },
      tableData: [],
      dialogVisible: false,
      dialogTitle: '新增类型',
      isEdit: false,
      categoryForm: {
        id: 0,
        name: '',
        key: '',
        sort: 0,
        status: 1,
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入类型名称', trigger: 'blur' },
          { max: 20, message: '长度不能超过20个字符', trigger: 'blur' },
        ],
        key: [
          { required: true, message: '请输入类型标识', trigger: 'blur' },
          { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '只能包含字母、数字、下划线，且以字母或下划线开头', trigger: 'blur' },
        ],
        sort: [
          { required: true, message: '请输入排序值', trigger: 'blur' },
        ],
      },
    };
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.app.isMobile,
    }),
  },
  created() {
    this.initMockData();
  },
  methods: {
    initMockData() {
      this.tableData = [
        { id: 1, name: '基础协议', key: 'basic', sort: 1, status: 1, createTime: '2024-01-01 10:00:00' },
        { id: 2, name: '玩法规则', key: 'play', sort: 2, status: 1, createTime: '2024-01-02 10:00:00' },
        { id: 3, name: '权益规则', key: 'benefit', sort: 3, status: 1, createTime: '2024-01-03 10:00:00' },
        { id: 4, name: '发货规则', key: 'shipping', sort: 4, status: 1, createTime: '2024-01-04 10:00:00' },
        { id: 5, name: '隐私政策', key: 'privacy', sort: 5, status: 0, createTime: '2024-01-05 10:00:00' },
      ];
      this.total = this.tableData.length;
    },
    getList() {
      this.loading = true;
      setTimeout(() => {
        let list = [...this.tableData];
        if (this.searchForm.keyword) {
          list = list.filter((item) => item.name.includes(this.searchForm.keyword));
        }
        if (this.searchForm.status !== '') {
          list = list.filter((item) => item.status === Number(this.searchForm.status));
        }
        this.total = list.length;
        const start = (this.searchForm.page - 1) * this.searchForm.limit;
        const end = start + this.searchForm.limit;
        this.tableData = list.slice(start, end);
        this.loading = false;
      }, 300);
    },
    handleSearch() {
      this.searchForm.page = 1;
      this.getList();
    },
    handleReset() {
      this.searchForm.keyword = '';
      this.searchForm.status = '';
      this.searchForm.page = 1;
      this.handleSearch();
    },
    handleAdd() {
      this.isEdit = false;
      this.dialogTitle = '新增类型';
      this.categoryForm = {
        id: 0,
        name: '',
        key: '',
        sort: 0,
        status: 1,
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate();
      });
    },
    handleEdit(row) {
      this.isEdit = true;
      this.dialogTitle = '编辑类型';
      this.categoryForm = {
        id: row.id,
        name: row.name,
        key: row.key,
        sort: row.sort,
        status: row.status,
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate();
      });
    },
    handleDelete(row) {
      this.$confirm(`确定删除类型"${row.name}"吗？删除后该类型下的协议将变为未分类状态。`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const index = this.tableData.findIndex((item) => item.id === row.id);
        if (index > -1) {
          this.tableData.splice(index, 1);
          this.total -= 1;
        }
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    handleSubmit() {
      this.$refs.categoryForm.validate((valid) => {
        if (!valid) return;
        if (this.isEdit) {
          const index = this.tableData.findIndex((item) => item.id === this.categoryForm.id);
          if (index > -1) {
            this.tableData[index] = { ...this.tableData[index], ...this.categoryForm };
          }
          this.$message.success('修改成功');
        } else {
          const newId = Math.max(...this.tableData.map((item) => item.id), 0) + 1;
          const newItem = {
            ...this.categoryForm,
            id: newId,
            createTime: this.$formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          };
          this.tableData.unshift(newItem);
          this.total += 1;
          this.$message.success('新增成功');
        }
        this.dialogVisible = false;
      });
    },
    handleStatusChange(row) {
      this.$message.success(row.status === 1 ? '已启用' : '已禁用');
    },
    handleSortChange(row) {
      this.$message.success('排序已更新');
    },
  },
};
</script>

<style lang="scss" scoped>
.agreement-category {
  .form-tip {
    color: #909399;
    font-size: 12px;
    margin-top: 4px;
  }
  .text-danger {
    color: #f56c6c;
  }
}
</style>
