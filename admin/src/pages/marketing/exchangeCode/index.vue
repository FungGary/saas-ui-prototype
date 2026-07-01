<template>
  <div class="exchange-code-page" :class="{ 'annotation-mode': showAnnotation }" id="exchange-code-page">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '20px' }">
      <el-form
        ref="searchForm"
        :model="searchForm"
        label-width="80px"
        label-position="right"
        @submit.native.prevent
        inline
        id="exchange-code-filter-form"
      >
        <el-form-item label="口令搜索：" id="filter-keyword-item">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入口令、ID或备注关键词"
            clearable
            class="form_content_width"
            id="filter-keyword-input"
          ></el-input>
          <annotation-point 
            title="【新增】口令搜索字段"
            content="新增口令搜索框，支持按口令、ID或备注关键词进行模糊搜索。&#10;&#10;搜索范围：口令code、ID、备注字段&#10;搜索方式：模糊匹配，不区分大小写"
            priority="P0"
          />
        </el-form-item>
        <el-form-item label="口令类型：" id="filter-code-type-item">
          <el-select
            v-model="searchForm.codeType"
            placeholder="请选择口令类型"
            clearable
            class="form_content_width"
            id="filter-code-type-select"
          >
            <el-option value="" label="全部"></el-option>
            <el-option value="long_term" label="长期兑换码"></el-option>
            <el-option value="one_time" label="一次性兑换码"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="奖品类型：">
          <el-select v-model="searchForm.prizeType" placeholder="请选择奖品类型" clearable class="form_content_width">
            <el-option value="" label="全部"></el-option>
            <el-option value="gold" label="金币"></el-option>
            <el-option value="coupon" label="优惠券"></el-option>
            <el-option value="physical" label="实物奖品"></el-option>
            <el-option value="points" label="积分"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="有效时间：" id="filter-date-range-item">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="form_content_width"
            id="filter-date-range-picker"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="userSearchs">查询</el-button>
          <el-button class="ResetSearch" @click="reset('searchForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <div style="position: relative">
        <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
          <annotation-point 
            title="【优化】状态字段优化-新增状态"
            content="增加待生效、部分使用状态，区分生效时间未到以及口令部分使用的情况。&#10;&#10;状态类型：&#10;- 全部：显示所有口令&#10;- 待使用：口令已创建且在有效期内，尚未被使用&#10;- 部分使用：长期兑换码已被使用但未用完&#10;- 已使用：一次性兑换码已使用或长期兑换码已用完&#10;- 未生效：口令已创建但生效时间未到&#10;- 已失效：口令已过期或被取消"
            priority="P0"
          />
        </div>
        <el-tabs :value="searchForm.status" @tab-click="onClickTab">
          <el-tab-pane
            :label="item.name + ' (' + item.count + ')'"
            :name="item.type"
            v-for="(item, index) in statusTabs"
            :key="index"
          />
        </el-tabs>
      </div>

      <el-row :gutter="24" justify="space-between">
        <el-col :span="24">
          <el-button class="mr10" @click="exportList">导出</el-button>
          <el-button @click="batchCancel" :disabled="selectionList.length === 0">批量取消</el-button>
          <el-button @click="batchCopy" :disabled="selectionList.length === 0">批量复制</el-button>
          <el-button type="primary" @click="handleAdd">添加口令</el-button>
        </el-col>
        <el-col :span="24" class="codeAlert" v-if="selectionList.length">
          <el-alert show-icon>
            <template slot="title">
              已选择 <i class="codeI">{{ selectionList.length }}</i> 项
            </template>
          </el-alert>
        </el-col>
      </el-row>

      <el-table
        :data="tableData"
        class="mt16"
        ref="table"
        highlight-current-row
        v-loading="loading"
        empty-text="暂无数据"
        no-filtered-data-text="暂无筛选结果"
        @select="handleSelectRow"
        @select-all="handleSelectAll"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column label="ID" prop="id" min-width="80"></el-table-column>

        <el-table-column label="兑换口令" min-width="200">
          <template slot-scope="scope">
            <div class="code-cell">
              <span class="code-text">{{ scope.row.code }}</span>
              <span class="copy-icon" @click="copyCode(scope.row.code)" title="复制">
                <i class="el-icon-document-copy"></i>
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="口令类型" min-width="120">
          <template slot-scope="scope">
            <span>{{ getCodeTypeText(scope.row.codeType) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="奖品" min-width="180">
          <template slot-scope="scope">
            <div class="prize-cell">
              <div class="prize-icon" :class="'prize-icon-' + scope.row.prizeType">
                <i :class="getPrizeIcon(scope.row.prizeType)"></i>
              </div>
              <div class="prize-desc">{{ scope.row.prizeDesc }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="奖品类型" min-width="100">
          <template slot-scope="scope">
            <span>{{ getPrizeTypeText(scope.row.prizeType) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="总兑换次数" prop="totalCount" min-width="100" id="col-total-count">
          <template slot-scope="scope">
            <span>{{ scope.row.totalCount }}</span>
            <div v-if="scope.$index === 0" style="position: absolute; top: -5px; right: 5px; z-index: 10;">
              <annotation-point 
                title="【新增】总兑换次数字段"
                content="新增字段，显示该口令的总兑换次数。&#10;&#10;规则：&#10;- 一次性兑换码总次数为1&#10;- 长期兑换码为设置的总次数"
                priority="P0"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="可兑换次数"
          prop="availableCount"
          min-width="100"
          id="col-available-count"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.availableCount }}</span>
            <div v-if="scope.$index === 0" style="position: absolute; top: -5px; right: 5px; z-index: 10;">
              <annotation-point 
                title="【优化】可兑换次数字段"
                content="字段名称优化为'可兑换次数'，表示当前剩余可用次数。&#10;&#10;计算公式：&#10;可兑换次数 = 总兑换次数 - 已兑换次数"
                priority="P0"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="已兑换次数" prop="usedCount" min-width="100"></el-table-column>

        <el-table-column label="有效时间" min-width="260">
          <template slot-scope="scope">
            <div>{{ scope.row.startTime }}</div>
            <div class="time-end">{{ scope.row.endTime }}</div>
          </template>
        </el-table-column>

        <el-table-column label="状态" min-width="100">
          <template slot-scope="scope">
            <div v-if="scope.$index === 0" style="position: absolute; top: -5px; right: 5px; z-index: 10;">
              <annotation-point 
                title="【优化】状态字段优化-显示优化"
                content="状态标签样式优化，不同状态使用不同颜色区分。&#10;&#10;状态颜色：&#10;- 待使用：绿色背景&#10;- 部分使用：蓝色背景&#10;- 已使用：灰色背景&#10;- 未生效：橙色背景&#10;- 已失效：红色背景"
                priority="P1"
              />
            </div>
            <span :class="['status-tag', scope.row.status]">
              {{ getStatusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="160">
          <template slot-scope="scope">
            <a @click="viewRecords(scope.row)" class="action-link">兑换记录</a>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown size="small" @command="changeMenu(scope.row, $event)" :transfer="true">
              <span class="el-dropdown-link">更多<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="copy">复制口令</el-dropdown-item>
                <el-dropdown-item command="cancel" v-if="canEdit(scope.row.status)">取消</el-dropdown-item>
                <el-dropdown-item command="view" v-else>查看</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="acea-row row-right page">
        <pagination
          :total="total"
          :page.sync="searchForm.page"
          :limit.sync="searchForm.limit"
          @pagination="pageChange"
        />
      </div>
    </el-card>

    <AddCodeModal ref="addCodeModal" :visible.sync="showAddModal" @success="handleAddSuccess" />
  </div>
</template>

<script>
import AddCodeModal from './AddCodeModal';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'marketing_exchangeCode',
  components: {
    AddCodeModal,
    AnnotationPoint,
  },
  data() {
    return {
      loading: false,
      total: 0,
      selectionList: [],
      selectedIds: [],
      ids: [],
      tableData: [],
      allData: [],
      showAddModal: false,

      statusTabs: [
        { type: 'all', name: '全部', count: 0 },
        { type: 'unused', name: '待使用', count: 0 },
        { type: 'partial', name: '部分使用', count: 0 },
        { type: 'used', name: '已使用', count: 0 },
        { type: 'pending', name: '未生效', count: 0 },
        { type: 'expired', name: '已失效', count: 0 },
      ],

      searchForm: {
        keyword: '',
        codeType: '',
        prizeType: '',
        dateRange: [],
        status: 'all',
        page: 1,
        limit: 15,
      },

      codeLists: [
        {
          id: 1,
          code: 'VIP202606230001',
          codeType: 'long_term',
          prizeType: 'gold',
          prizeDesc: '金币 × 100',
          totalCount: 10,
          availableCount: 10,
          usedCount: 0,
          startTime: '2026-06-23 00:00:00',
          endTime: '2026-12-31 23:59:59',
          status: 'unused',
          remark: '新人专享兑换码',
        },
        {
          id: 2,
          code: 'COUPON202606230002',
          codeType: 'long_term',
          prizeType: 'coupon',
          prizeDesc: '满100减20优惠券',
          totalCount: 50,
          availableCount: 35,
          usedCount: 15,
          startTime: '2026-06-20 00:00:00',
          endTime: '2026-07-20 23:59:59',
          status: 'partial',
          remark: '618活动优惠券',
        },
        {
          id: 3,
          code: 'PHY202606230003',
          codeType: 'one_time',
          prizeType: 'physical',
          prizeDesc: '精美礼品一份',
          totalCount: 1,
          availableCount: 0,
          usedCount: 1,
          startTime: '2026-06-01 00:00:00',
          endTime: '2026-06-30 23:59:59',
          status: 'used',
          remark: '中奖用户专属',
        },
        {
          id: 4,
          code: 'POINT202606230004',
          codeType: 'long_term',
          prizeType: 'points',
          prizeDesc: '积分 × 500',
          totalCount: 100,
          availableCount: 100,
          usedCount: 0,
          startTime: '2026-07-01 00:00:00',
          endTime: '2026-07-31 23:59:59',
          status: 'pending',
          remark: '下月活动兑换码',
        },
        {
          id: 5,
          code: 'GOLD202606230005',
          codeType: 'one_time',
          prizeType: 'gold',
          prizeDesc: '金币 × 50',
          totalCount: 1,
          availableCount: 0,
          usedCount: 1,
          startTime: '2026-05-01 00:00:00',
          endTime: '2026-05-31 23:59:59',
          status: 'expired',
          remark: '五一活动专属',
        },
        {
          id: 6,
          code: 'VIP202606230006',
          codeType: 'long_term',
          prizeType: 'points',
          prizeDesc: '积分 × 1000',
          totalCount: 20,
          availableCount: 20,
          usedCount: 0,
          startTime: '2026-06-23 00:00:00',
          endTime: '2026-08-31 23:59:59',
          status: 'unused',
          remark: '会员福利兑换码',
        },
        {
          id: 7,
          code: 'COUPON202606230007',
          codeType: 'long_term',
          prizeType: 'coupon',
          prizeDesc: '满200减50优惠券',
          totalCount: 30,
          availableCount: 10,
          usedCount: 20,
          startTime: '2026-06-15 00:00:00',
          endTime: '2026-06-30 23:59:59',
          status: 'partial',
          remark: '会员专享优惠券',
        },
        {
          id: 8,
          code: 'PHY202606230008',
          codeType: 'one_time',
          prizeType: 'physical',
          prizeDesc: '限量版周边',
          totalCount: 1,
          availableCount: 0,
          usedCount: 1,
          startTime: '2026-04-01 00:00:00',
          endTime: '2026-04-30 23:59:59',
          status: 'expired',
          remark: '活动奖品',
        },
        {
          id: 9,
          code: 'GOLD202606230009',
          codeType: 'long_term',
          prizeType: 'gold',
          prizeDesc: '金币 × 200',
          totalCount: 50,
          availableCount: 50,
          usedCount: 0,
          startTime: '2026-08-01 00:00:00',
          endTime: '2026-08-31 23:59:59',
          status: 'pending',
          remark: '暑期活动兑换码',
        },
        {
          id: 10,
          code: 'POINT202606230010',
          codeType: 'one_time',
          prizeType: 'points',
          prizeDesc: '积分 × 300',
          totalCount: 1,
          availableCount: 0,
          usedCount: 1,
          startTime: '2026-06-10 00:00:00',
          endTime: '2026-06-20 23:59:59',
          status: 'used',
          remark: '端午节活动奖品',
        },
        {
          id: 11,
          code: 'VIP202606230011',
          codeType: 'long_term',
          prizeType: 'gold',
          prizeDesc: '金币 × 500',
          totalCount: 100,
          availableCount: 80,
          usedCount: 20,
          startTime: '2026-06-01 00:00:00',
          endTime: '2026-06-30 23:59:59',
          status: 'unused',
          remark: '限时特惠兑换码',
        },
        {
          id: 12,
          code: 'COUPON202606230012',
          codeType: 'long_term',
          prizeType: 'coupon',
          prizeDesc: '无门槛优惠券',
          totalCount: 200,
          availableCount: 150,
          usedCount: 50,
          startTime: '2026-05-01 00:00:00',
          endTime: '2026-07-31 23:59:59',
          status: 'partial',
          remark: '夏日清凉券',
        },
        {
          id: 13,
          code: 'PHY202606230013',
          codeType: 'one_time',
          prizeType: 'physical',
          prizeDesc: '定制周边大礼包',
          totalCount: 1,
          availableCount: 0,
          usedCount: 1,
          startTime: '2026-03-01 00:00:00',
          endTime: '2026-03-31 23:59:59',
          status: 'used',
          remark: '三八节活动',
        },
        {
          id: 14,
          code: 'POINT202606230014',
          codeType: 'long_term',
          prizeType: 'points',
          prizeDesc: '积分 × 2000',
          totalCount: 50,
          availableCount: 50,
          usedCount: 0,
          startTime: '2026-09-01 00:00:00',
          endTime: '2026-09-30 23:59:59',
          status: 'pending',
          remark: '中秋活动兑换码',
        },
        {
          id: 15,
          code: 'GOLD202606230015',
          codeType: 'one_time',
          prizeType: 'gold',
          prizeDesc: '金币 × 88',
          totalCount: 1,
          availableCount: 0,
          usedCount: 1,
          startTime: '2026-02-14 00:00:00',
          endTime: '2026-02-28 23:59:59',
          status: 'expired',
          remark: '情人节特惠',
        },
      ],
    };
  },
  created() {
    this.allData = [...this.codeLists];
    this.initStatusCounts();
    this.getList();
  },
  methods: {
    initStatusCounts() {
      this.statusTabs.forEach((tab) => {
        if (tab.type === 'all') {
          tab.count = this.allData.length;
        } else {
          tab.count = this.allData.filter((item) => item.status === tab.type).length;
        }
      });
    },

    getCodeTypeText(codeType) {
      const typeMap = {
        long_term: '长期兑换码',
        one_time: '一次性兑换码',
      };
      return typeMap[codeType] || codeType;
    },

    getPrizeTypeText(prizeType) {
      const typeMap = {
        gold: '金币',
        coupon: '优惠券',
        physical: '实物奖品',
        points: '积分',
      };
      return typeMap[prizeType] || prizeType;
    },

    getPrizeIcon(prizeType) {
      const iconMap = {
        gold: 'el-icon-coin',
        coupon: 'el-icon-ticket',
        physical: 'el-icon-gift',
        points: 'el-icon-collection',
      };
      return iconMap[prizeType] || 'el-icon-gift';
    },

    getStatusText(status) {
      const statusMap = {
        unused: '待使用',
        partial: '部分使用',
        used: '已使用',
        pending: '未生效',
        expired: '已失效',
      };
      return statusMap[status] || status;
    },

    canEdit(status) {
      return ['unused', 'partial', 'pending'].includes(status);
    },

    userSearchs() {
      this.ids = [];
      this.selectedIds = [];
      this.selectionList = [];
      this.searchForm.page = 1;
      this.getList();
    },

    reset(name) {
      this.searchForm = {
        keyword: '',
        codeType: '',
        prizeType: '',
        dateRange: [],
        status: 'all',
        page: 1,
        limit: 15,
      };
      this.selectedIds = new Set();
      this.getList();
    },

    getList() {
      this.loading = true;
      setTimeout(() => {
        let filteredData = [...this.allData];

        if (this.searchForm.keyword) {
          const keyword = this.searchForm.keyword.toLowerCase();
          filteredData = filteredData.filter(
            (item) =>
              item.code.toLowerCase().includes(keyword) ||
              item.id.toString().includes(keyword) ||
              (item.remark && item.remark.toLowerCase().includes(keyword)),
          );
        }

        if (this.searchForm.codeType) {
          filteredData = filteredData.filter((item) => item.codeType === this.searchForm.codeType);
        }

        if (this.searchForm.prizeType) {
          filteredData = filteredData.filter((item) => item.prizeType === this.searchForm.prizeType);
        }

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          const startDate = new Date(this.searchForm.dateRange[0]).getTime();
          const endDate = new Date(this.searchForm.dateRange[1]).getTime();
          filteredData = filteredData.filter((item) => {
            const startTime = new Date(item.startTime).getTime();
            return startTime >= startDate && startTime <= endDate;
          });
        }

        if (this.searchForm.status !== 'all') {
          filteredData = filteredData.filter((item) => item.status === this.searchForm.status);
        }

        this.total = filteredData.length;

        const start = (this.searchForm.page - 1) * this.searchForm.limit;
        const end = start + this.searchForm.limit;
        this.tableData = filteredData.slice(start, end);

        this.loading = false;
      }, 300);
    },

    pageChange() {
      this.selectionList = [];
      this.getList();
    },

    onClickTab() {
      this.searchForm.page = 1;
      this.getList();
    },

    handleSelectRow(selection, row) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.selectionList = selection;
      this.$nextTick(() => {
        this.setChecked();
      });
    },

    handleSelectAll(selection) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.selectionList = selection;
      this.$nextTick(() => {
        this.setChecked();
      });
    },

    setChecked() {
      this.ids = [...this.selectedIds];
      let objData = this.$refs.table?.objData;
      if (!objData) return;
      for (let index in objData) {
        if (this.selectedIds.includes(objData[index].id)) {
          objData[index]._isChecked = true;
        }
      }
    },

    copyCode(code) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          this.$message.success('口令已复制');
        })
        .catch(() => {
          const textarea = document.createElement('textarea');
          textarea.value = code;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          this.$message.success('口令已复制');
        });
    },

    batchCopy() {
      const codes = this.selectionList.map((item) => item.code).join('\n');
      navigator.clipboard
        .writeText(codes)
        .then(() => {
          this.$message.success('已批量复制口令');
        })
        .catch(() => {
          const textarea = document.createElement('textarea');
          textarea.value = codes;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          this.$message.success('已批量复制口令');
        });
    },

    viewRecords(row) {
      this.$message.info(`查看兑换记录: ${row.code}`);
    },

    handleAdd() {
      this.showAddModal = true;
    },

    handleAddSuccess(data) {
      const newCodes = [];
      const now = new Date();
      for (let i = 0; i < data.count; i++) {
        const code = {
          id: this.allData.length + i + 1,
          code: generateCode(),
          codeType: data.codeType,
          prizeType: data.prizeType,
          prizeDesc: getPrizeDesc(data.prizeType, data.prizeValue),
          totalCount: data.codeType === 'one_time' ? 1 : data.count,
          availableCount: data.codeType === 'one_time' ? 1 : data.count,
          usedCount: 0,
          startTime: formatDateTime(data.dateRange[0]),
          endTime: formatDateTime(data.dateRange[1]),
          status: 'unused',
          remark: data.remark || '',
        };
        newCodes.push(code);
      }
      this.allData = [...newCodes, ...this.allData];
      this.getList();
      this.initStatusCounts();
    },

    exportList() {
      this.$message.info('导出功能开发中');
    },

    batchCancel() {
      this.$confirm('确定要批量取消选中的兑换码吗？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.$message.success('批量取消成功');
          this.getList();
        })
        .catch(() => {
          this.$message.info('已取消操作');
        });
    },

    changeMenu(row, name) {
      switch (name) {
        case 'copy':
          this.copyCode(row.code);
          break;
        case 'cancel':
          this.cancelCode(row);
          break;
        case 'view':
          this.viewCode(row);
          break;
      }
    },

    cancelCode(row) {
      this.$confirm(`确定要取消兑换码 ${row.code} 吗？`, '提示', {
        type: 'warning',
      })
        .then(() => {
          row.status = 'expired';
          this.$message.success('取消成功');
          this.getList();
        })
        .catch(() => {
          this.$message.info('已取消操作');
        });
    },

    viewCode(row) {
      this.$message.info(`查看口令详情: ${row.code}`);
    },
  },
};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getPrizeDesc(prizeType, prizeValue) {
  const typeMap = {
    gold: `金币 × ${prizeValue}`,
    points: `积分 × ${prizeValue}`,
    physical:
      {
        gift_001: '精美礼品一份',
        gift_002: '限量版周边',
        gift_003: '定制周边大礼包',
        gift_004: '专属纪念徽章',
      }[prizeValue] || prizeValue,
  };
  return typeMap[prizeType] || prizeValue;
}

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
</script>

<style lang="scss" scoped>
::v-deep .el-tabs__item {
  height: 54px !important;
  line-height: 54px !important;
}

.codeAlert {
  margin-top: 20px;
}

.codeI {
  color: var(--prev-color-primary);
  font-style: normal;
}

.form_content_width {
  width: 200px;
}

.ResetSearch {
  border: 1px solid #dcdfe6;
  color: #606266;
  margin-right: 10px;
}

.mt16 {
  margin-top: 16px;
}

.code-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-text {
  font-size: 14px;
  color: #303133;
}

.copy-icon {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
  &:hover {
    color: #409eff;
  }
}

.prize-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prize-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

  &.prize-icon-gold {
    background-color: #fff7e6;
    color: #e6a23c;
  }

  &.prize-icon-coupon {
    background-color: #fef0f0;
    color: #f56c6c;
  }

  &.prize-icon-physical {
    background-color: #f0f9eb;
    color: #67c23a;
  }

  &.prize-icon-points {
    background-color: #f0f5ff;
    color: #409eff;
  }
}

.prize-desc {
  font-size: 14px;
  color: #303133;
}

.time-end {
  font-size: 12px;
  color: #909399;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  &.unused {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.partial {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.used {
    background: #f5f5f5;
    color: #9e9e9e;
  }

  &.pending {
    background: #fff3e0;
    color: #e65100;
  }

  &.expired {
    background: #fce4ec;
    color: #c2185b;
  }
}

.action-link {
  color: #409eff;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
  }
}

.page {
  margin-top: 20px;
}

.exchange-code-page {
  position: relative;
  min-height: 100vh;

  &.annotation-mode {
    padding-right: 380px;
  }
}

.annotation-panel-wrapper {
  position: fixed;
  top: 64px;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 1000;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

.el-table {
  position: relative;
}
</style>
