<template>
  <div class="refund-record-page">
    <!-- 筛选查询区 -->
    <el-card :bordered="false" shadow="never" class="filter-card" :body-style="{ padding: '0' }">
      <div class="padding-add">
        <el-form ref="filterFormRef" :model="filterForm" :label-width="labelWidth" label-position="right" inline @submit.native.prevent>
          <!-- 第一行 -->
          <el-form-item label="用户信息：">
            <entity-picker-input
              v-model="filterForm.userKeyword"
              :display="getFinancialUserDisplay(filterForm.userKeyword)"
              placeholder="请选择用户"
              title="用户搜索"
              search-label="用户搜索"
              search-placeholder="请输入昵称/UID/用户编号"
              :rows="financialUserOptions"
              :columns="userPickerColumns"
              row-key="userNo"
              :search-fields="['nickname', 'uid', 'userNo']"
            />
          </el-form-item>
          <el-form-item label="退款订单号：">
            <el-input clearable v-model="filterForm.internalRefundNo" placeholder="请输入退款订单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="内部订单号：">
            <el-input clearable v-model="filterForm.internalOrderNo" placeholder="请输入内部订单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="外部订单号：">
            <el-input clearable v-model="filterForm.externalOrderNo" placeholder="请输入外部订单号" class="form-content-width" />
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item class="filter-buttons">
            <el-button v-db-click @click="handleReset">重置</el-button>
            <el-button type="primary" v-db-click @click="handleSearch">查询</el-button>
            <el-button type="text" v-db-click @click="toggleFilterCollapse">
              <i :class="filterCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
              {{ filterCollapsed ? '展开' : '收起' }}
            </el-button>
          </el-form-item>

          <!-- 第二行 -->
          <template v-if="!filterCollapsed">
            <el-form-item label="申请时间：">
              <el-date-picker
                clearable
                v-model="filterForm.applyTimeRange"
                type="daterange"
                :editable="false"
                format="yyyy/MM/dd"
                value-format="yyyy/MM/dd"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :picker-options="pickerOptions"
                style="width: 250px"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="业务类型：">
              <el-select clearable v-model="filterForm.businessType" placeholder="全部" class="form-content-width">
                <el-option v-for="(item, index) in businessTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="支付类型：">
              <el-select clearable v-model="filterForm.payMethod" placeholder="全部" class="form-content-width">
                <el-option v-for="(item, index) in payMethodOptions" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="订单来源：">
              <el-select clearable v-model="filterForm.orderSource" placeholder="全部" class="form-content-width">
                <el-option v-for="(item, index) in orderSourceOptions" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-form>
      </div>
    </el-card>

    <!-- 状态标签栏 -->
    <div class="status-tabs">
      <div
        v-for="tab in statusTabs"
        :key="tab.value"
        :class="['status-tab', activeStatusTab === tab.value ? 'active' : '']"
        @click="handleStatusTabClick(tab.value)"
      >
        {{ tab.label }}（{{ tab.count }}）
      </div>
    </div>

    <!-- 订单列表区 -->
    <el-card :bordered="false" shadow="never" class="mt16" :body-style="{ padding: '0 20px 20px' }">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="table-title">充值记录</span>
        </div>
        <div class="toolbar-right">
          <el-button size="small" v-db-click @click="handleExport">导出</el-button>
        </div>
      </div>

      <el-table
        ref="tableRef"
        :data="pagedData"
        v-loading="loading"
        empty-text="暂无数据"
        class="orderData mt14"
      >
        <!-- 退款订单号 -->
        <el-table-column label="退款订单号" min-width="140">
          <template slot-scope="{ row }">
            <div class="order-no-cell">
              <span class="value">{{ row.internalRefundNo }}</span>
              <i class="el-icon-document-copy copy-icon" @click="copyText(row.internalRefundNo)" title="复制"></i>
            </div>
          </template>
        </el-table-column>

        <!-- 内部订单号 -->
        <el-table-column label="内部订单号" min-width="140">
          <template slot-scope="{ row }">
            <div class="order-no-cell">
              <span class="value">{{ row.internalOrderNo }}</span>
              <i class="el-icon-document-copy copy-icon" @click="copyText(row.internalOrderNo)" title="复制"></i>
            </div>
          </template>
        </el-table-column>

        <!-- 外部订单号 -->
        <el-table-column label="外部订单号" min-width="140">
          <template slot-scope="{ row }">
            <div class="order-no-cell">
              <span class="value">{{ row.externalOrderNo }}</span>
              <i class="el-icon-document-copy copy-icon" @click="copyText(row.externalOrderNo)" title="复制"></i>
            </div>
          </template>
        </el-table-column>

        <!-- 用户信息 -->
        <el-table-column label="用户信息" min-width="160">
          <template slot-scope="{ row }">
            <div class="user-info-cell">
              <div class="user-avatar">
                <img v-if="row.avatar" :src="row.avatar" @error="handleAvatarError" />
                <span v-else class="avatar-placeholder">{{ row.nickname ? row.nickname.charAt(0) : 'U' }}</span>
              </div>
              <div class="user-details">
                <div class="nickname">{{ row.nickname }}</div>
                <div class="user-no-row">
                  <span class="user-no">编号: {{ row.userNo }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 业务类型 -->
        <el-table-column label="业务类型" min-width="110" align="center">
          <template slot-scope="{ row }">
            <span>{{ getBusinessTypeText(row.businessType) }}</span>
          </template>
        </el-table-column>

        <!-- 退款金额 -->
        <el-table-column label="退款金额" min-width="100" align="right">
          <template slot-scope="{ row }">
            <span class="amount-value">{{ row.refundAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 支付类型 -->
        <el-table-column label="支付类型" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span>{{ getPayMethodText(row.payMethod) }}</span>
          </template>
        </el-table-column>

        <!-- 订单来源 -->
        <el-table-column label="订单来源" min-width="80" align="center">
          <template slot-scope="{ row }">
            <span>{{ getOrderSourceText(row.orderSource) }}</span>
          </template>
        </el-table-column>

        <!-- 退款状态 -->
        <el-table-column label="退款状态" width="90" align="center">
          <template slot-scope="{ row }">
            <span :class="['status-badge', getRefundStatusClass(row.refundStatus)]">{{ getRefundStatusText(row.refundStatus) }}</span>
          </template>
        </el-table-column>

        <!-- 退款原因 -->
        <el-table-column label="退款原因" min-width="140">
          <template slot-scope="{ row }">
            <span class="reason-text">{{ row.refundReason }}</span>
          </template>
        </el-table-column>

        <!-- 退款时间 -->
        <el-table-column label="退款时间" min-width="100">
          <template slot-scope="{ row }">
            <span>{{ row.refundTime || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" fixed="right" width="70" align="center">
          <template slot-scope="{ row }">
            <a class="action-link" v-db-click @click="handleDetail(row)">详情</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="acea-row row-right page">
        <el-pagination
          :current-page.sync="pagination.page"
          :page-size.sync="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer title="退款订单详情" :visible.sync="detailDrawerVisible" direction="rtl" :size="'760px'" :modal-append-to-body="false" :wrapper-closable="true">
      <div v-if="currentRow" class="detail-drawer-content">
        <div class="detail-section">
          <div class="section-title">退款信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="内部退款单号">
              {{ currentRow.internalRefundNo }}
              <i class="el-icon-document-copy copy-icon" @click="copyText(currentRow.internalRefundNo)"></i>
            </el-descriptions-item>
            <el-descriptions-item label="外部退款单号">{{ currentRow.externalRefundNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="退款状态">
              <span :class="['status-badge', getRefundStatusClass(currentRow.refundStatus)]">{{ getRefundStatusText(currentRow.refundStatus) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="业务类型">{{ getBusinessTypeText(currentRow.businessType) }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRow.applyTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="退款时间">{{ currentRow.refundTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="退款原因" :span="2">{{ currentRow.refundReason || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="内部订单号">
              {{ currentRow.internalOrderNo }}
              <i class="el-icon-document-copy copy-icon" @click="copyText(currentRow.internalOrderNo)"></i>
            </el-descriptions-item>
            <el-descriptions-item label="外部订单号">{{ currentRow.externalOrderNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="订单来源">{{ getOrderSourceText(currentRow.orderSource) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentRow.createTime || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">用户信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="用户头像">
              <div class="user-avatar-small">
                <img v-if="currentRow.avatar" :src="currentRow.avatar" @error="handleAvatarError" />
                <span v-else class="avatar-placeholder">{{ currentRow.nickname ? currentRow.nickname.charAt(0) : 'U' }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="用户昵称">{{ currentRow.nickname }}</el-descriptions-item>
            <el-descriptions-item label="UID">{{ currentRow.uid }}</el-descriptions-item>
            <el-descriptions-item label="用户编号">{{ currentRow.userNo }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">金额明细</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单金额">{{ currentRow.orderAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="实付金额">
              <span class="pay-amount-bold">{{ currentRow.payAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="退款金额" :span="2">
              <span class="refund-amount-bold">{{ currentRow.refundAmount.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">支付信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="支付类型">{{ getPayMethodText(currentRow.payMethod) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentRow.payTime || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>

    <!-- 导出弹窗 -->
    <el-dialog title="导出数据" :visible.sync="exportDialogVisible" width="420px" :close-on-click-modal="false">
      <div class="export-confirm-content">
        <p>确认导出当前查询结果的全部数据？</p>
        <div class="export-fields">
          <p class="export-fields-title">导出字段包含：</p>
          <p>退款订单号、内部订单号、外部订单号、用户信息、业务类型、退款金额、支付类型、订单来源、退款状态、退款原因、申请时间、退款时间。</p>
        </div>
        <p class="export-count">当前查询结果共 {{ filteredData.length }} 条。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExportConfirm">确认导出</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import EntityPickerInput from '@/components/EntityPickerInput';

export default {
  name: 'finance_refundRecord',
  components: {
    EntityPickerInput,
  },
  data() {
    return {
      filterForm: {
        userKeyword: '',
        applyTimeRange: [],
        internalRefundNo: '',
        internalOrderNo: '',
        externalOrderNo: '',
        businessType: '',
        payMethod: '',
        orderSource: '',
      },
      pickerOptions: this.$timeOptions,

      // 筛选收起状态
      filterCollapsed: false,

      // 状态标签栏
      activeStatusTab: 'all',
      statusTabs: [
        { label: '全部', value: 'all', count: 50 },
        { label: '待退款', value: 'pending', count: 10 },
        { label: '退款中', value: 'processing', count: 10 },
        { label: '已退款', value: 'success', count: 10 },
        { label: '已取消', value: 'cancelled', count: 10 },
        { label: '退款失败', value: 'failed', count: 10 },
      ],

      allTableData: [],
      filteredData: [],
      loading: false,

      pagination: {
        page: 1,
        pageSize: 10,
        total: 278,
      },
      userPickerColumns: [
        { label: '头像', prop: 'avatar', type: 'avatar', fallbackProp: 'nickname', width: 90 },
        { label: '昵称', prop: 'nickname', minWidth: 150 },
        { label: 'UID', prop: 'uid', width: 120 },
        { label: '用户编号', prop: 'userNo', width: 150 }
      ],

      detailDrawerVisible: false,
      currentRow: null,

      exportDialogVisible: false,

      businessTypeOptions: [
        { label: '全部', value: '' },
        { label: '线上娃娃机', value: 'claw_recharge_online' },
        { label: '线下娃娃机', value: 'claw_recharge_offline' },
      ],
      payMethodOptions: [
        { label: '全部', value: '' },
        { label: '汇付微信支付', value: 'huifu_weixin' },
        { label: '宝付支付宝支付', value: 'baofu_alipay' },
        { label: '汇付支付宝支付', value: 'huifu_alipay' },
        { label: '宝付微信支付', value: 'baofu_weixin' },
      ],
      orderSourceOptions: [
        { label: '全部', value: '' },
        { label: 'H5', value: 'h5' },
        { label: '小程序', value: 'miniapp' },
        { label: 'APP', value: 'app' },
        { label: '公众号', value: 'wechat_public' },
      ],
    };
  },
  computed: {
    ...mapState('media', ['isMobile']),
    labelWidth() {
      return this.isMobile ? undefined : '84px';
    },
    financialUserOptions() {
      const map = new Map();
      this.allTableData.forEach(item => {
        const key = item.userNo || String(item.uid);
        if (!map.has(key)) {
          map.set(key, {
            userNo: item.userNo,
            uid: item.uid,
            nickname: item.nickname,
            avatar: item.avatar,
          });
        }
      });
      return Array.from(map.values());
    },
    pagedData() {
      const start = (this.pagination.page - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return this.filteredData.slice(start, end);
    },
  },
  mounted() {
    this.loadMockData();
  },
  methods: {
    getFinancialUserDisplay(keyword) {
      const user = this.financialUserOptions.find(item => item.userNo === keyword || String(item.uid) === String(keyword));
      return user ? user.nickname + '（' + user.userNo + '）' : '';
    },
    loadMockData() {
      this.loading = true;
      this.allTableData = this.generateMockData();
      this.handleSearch();
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },

    generateMockData() {
      return [
        {
          id: 1,
          internalRefundNo: '20260...45088',
          externalRefundNo: 'WXR202606260001',
          internalOrderNo: 'CZ202...35584',
          externalOrderNo: 'HF202...35584',
          refundStatus: 'success',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-26 10:30:00',
          refundTime: '2026-06-26 11:30:20',
          avatar: '',
          nickname: 'Beedo',
          uid: 100,
          userNo: '5916955596',
          orderAmount: 100.00,
          payAmount: 95.00,
          refundAmount: 100.00,
          payMethod: 'huifu_weixin',
          orderSource: 'h5',
          createTime: '2026-06-26 10:20:30',
          payTime: '2026-06-26 10:24:30',
          refundReason: '重复充值，申请退款',
        },
        {
          id: 2,
          internalRefundNo: '20260...95200',
          externalRefundNo: '',
          internalOrderNo: 'CZ202...35585',
          externalOrderNo: 'BF203...35585',
          refundStatus: 'failed',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-26 09:20:00',
          refundTime: '2026-06-26 11:30:20',
          avatar: '',
          nickname: '熊猫咪',
          uid: 101,
          userNo: '5916955597',
          orderAmount: 50.00,
          payAmount: 50.00,
          refundAmount: 50.00,
          payMethod: 'baofu_alipay',
          orderSource: 'miniapp',
          createTime: '2026-06-26 09:15:00',
          payTime: '2026-06-26 09:16:30',
          refundReason: '支付渠道异常退款',
        },
        {
          id: 3,
          internalRefundNo: '20260...76380',
          externalRefundNo: '',
          internalOrderNo: 'CZ202...35586',
          externalOrderNo: 'CZ204...35586',
          refundStatus: 'pending',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-27 09:00:00',
          refundTime: '',
          avatar: '',
          nickname: '小虎仔',
          uid: 102,
          userNo: '5916955598',
          orderAmount: 75.00,
          payAmount: 74.00,
          refundAmount: 75.00,
          payMethod: 'huifu_weixin',
          orderSource: 'app',
          createTime: '2026-06-26 11:30:00',
          payTime: '2026-06-26 11:45:12',
          refundReason: '充值未到账，申请退款',
        },
        {
          id: 4,
          internalRefundNo: '20260...42100',
          externalRefundNo: 'ALIR202606260001',
          internalOrderNo: 'CZ205...35587',
          externalOrderNo: 'CZ205...35587',
          refundStatus: 'success',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-25 14:30:00',
          refundTime: '2026-06-26 11:30:20',
          avatar: '',
          nickname: '蓝天',
          uid: 103,
          userNo: '5916955599',
          orderAmount: 100.00,
          payAmount: 98.00,
          refundAmount: 100.00,
          payMethod: 'huifu_alipay',
          orderSource: 'wechat_public',
          createTime: '2026-06-26 13:02:47',
          payTime: '2026-06-26 13:02:47',
          refundReason: '误操作充值，申请退款',
        },
        {
          id: 5,
          internalRefundNo: '20260...33450',
          externalRefundNo: '',
          internalOrderNo: 'CZ206...35588',
          externalOrderNo: 'CZ206...35588',
          refundStatus: 'processing',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-26 14:30:00',
          refundTime: '',
          avatar: '',
          nickname: '花栗鼠',
          uid: 104,
          userNo: '5916955600',
          orderAmount: 125.00,
          payAmount: 122.00,
          refundAmount: 125.00,
          payMethod: 'baofu_weixin',
          orderSource: 'miniapp',
          createTime: '2026-06-26 14:00:00',
          payTime: '2026-06-26 14:18:03',
          refundReason: '投币未使用，申请退还',
        },
        {
          id: 6,
          internalRefundNo: '20260...82596',
          externalRefundNo: '',
          internalOrderNo: 'CZ207...35589',
          externalOrderNo: 'CZ207...35589',
          refundStatus: 'pending',
          businessType: 'claw_recharge_offline',
          applyTime: '2026-06-26 15:30:00',
          refundTime: '',
          avatar: '',
          nickname: '月光',
          uid: 105,
          userNo: '5916955601',
          orderAmount: 150.00,
          payAmount: 146.00,
          refundAmount: 150.00,
          payMethod: 'baofu_weixin',
          orderSource: 'h5',
          createTime: '2026-06-26 15:00:00',
          payTime: '2026-06-26 15:37:59',
          refundReason: '投币未使用，申请退还',
        },
        {
          id: 7,
          internalRefundNo: '20260...51740',
          externalRefundNo: '',
          internalOrderNo: 'CZ208...35590',
          externalOrderNo: 'CZ208...35590',
          refundStatus: 'cancelled',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-26 16:30:00',
          refundTime: '',
          avatar: '',
          nickname: '雪狐',
          uid: 106,
          userNo: '5916955602',
          orderAmount: 175.00,
          payAmount: 170.00,
          refundAmount: 175.00,
          payMethod: 'baofu_weixin',
          orderSource: 'h5',
          createTime: '2026-06-26 16:00:00',
          payTime: '2026-06-26 16:50:44',
          refundReason: '用户主动取消退款申请',
        },
      ];
    },

    toggleFilterCollapse() {
      this.filterCollapsed = !this.filterCollapsed;
    },

    handleStatusTabClick(status) {
      this.activeStatusTab = status;
      this.handleSearch();
    },

    handleSearch() {
      this.loading = true;
      let data = [...this.allTableData];

      // 状态标签筛选
      if (this.activeStatusTab !== 'all') {
        data = data.filter(item => item.refundStatus === this.activeStatusTab);
      }

      if (this.filterForm.userKeyword) {
        const kw = this.filterForm.userKeyword.toLowerCase();
        data = data.filter(item =>
          (item.nickname && item.nickname.toLowerCase().includes(kw)) ||
          (item.uid && item.uid.toString().includes(kw)) ||
          (item.userNo && item.userNo.toLowerCase().includes(kw))
        );
      }

      if (this.filterForm.internalRefundNo) {
        data = data.filter(item => item.internalRefundNo.includes(this.filterForm.internalRefundNo));
      }

      if (this.filterForm.internalOrderNo) {
        data = data.filter(item => item.internalOrderNo.includes(this.filterForm.internalOrderNo));
      }

      if (this.filterForm.externalOrderNo) {
        data = data.filter(item => item.externalOrderNo && item.externalOrderNo.includes(this.filterForm.externalOrderNo));
      }

      if (this.filterForm.businessType) {
        data = data.filter(item => item.businessType === this.filterForm.businessType);
      }

      if (this.filterForm.payMethod) {
        data = data.filter(item => item.payMethod === this.filterForm.payMethod);
      }

      if (this.filterForm.orderSource) {
        data = data.filter(item => item.orderSource === this.filterForm.orderSource);
      }

      if (this.filterForm.applyTimeRange && this.filterForm.applyTimeRange.length === 2) {
        const [start, end] = this.filterForm.applyTimeRange;
        data = data.filter(item => {
          const itemTime = item.applyTime;
          if (!itemTime) return false;
          return itemTime >= start && itemTime <= end + ' 23:59:59';
        });
      }

      this.filteredData = data;
      // this.pagination.total = data.length;
      this.pagination.page = 1;
      setTimeout(() => {
        this.loading = false;
      }, 200);
    },

    handleReset() {
      this.filterForm = {
        userKeyword: '',
        applyTimeRange: [],
        internalRefundNo: '',
        internalOrderNo: '',
        externalOrderNo: '',
        businessType: '',
        payMethod: '',
        orderSource: '',
      };
      this.activeStatusTab = 'all';
      this.handleSearch();
    },

    handleDetail(row) {
      this.currentRow = { ...row };
      this.detailDrawerVisible = true;
    },

    copyText(text) {
      if (!text) return;
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.$message.success('复制成功');
    },

    handleAvatarError(e) {
      e.target.src = '';
    },

    handlePageSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.page = 1;
    },

    handlePageChange(page) {
      this.pagination.page = page;
    },

    handleExport() {
      if (this.filteredData.length === 0) {
        this.$message.warning('当前筛选结果无数据，无法导出');
        return;
      }
      this.exportDialogVisible = true;
    },

    handleExportConfirm() {
      this.exportDialogVisible = false;
      this.$message.success(`正在导出 ${this.filteredData.length} 条退款记录...`);
    },

    getRefundStatusText(status) {
      const map = { pending: '待退款', processing: '退款中', success: '已退款', failed: '退款失败', cancelled: '已取消' };
      return map[status] || status;
    },
    getRefundStatusClass(status) {
      const map = { pending: 'status-pending', processing: 'status-processing', success: 'status-success', failed: 'status-failed', cancelled: 'status-cancelled' };
      return map[status] || '';
    },
    getBusinessTypeText(type) {
      const map = {
        claw_recharge_online: '线上娃娃机',
        claw_recharge_offline: '线下娃娃机',
      };
      return map[type] || type;
    },
    getPayMethodText(method) {
      const map = {
        baofu_alipay: '宝付支付宝支付',
        baofu_weixin: '宝付微信支付',
        huifu_alipay: '汇付支付宝支付',
        huifu_weixin: '汇付微信支付',
      };
      return map[method] || method;
    },
    getOrderSourceText(source) {
      const map = { h5: 'H5', miniapp: '小程序', app: 'APP', wechat_public: '公众号' };
      return map[source] || source;
    },
  },
};
</script>

<style lang="scss" scoped>
.refund-record-page {
  padding: 0;
}

/* ========== 筛选区 ========== */
.filter-card {
  margin-bottom: 16px;

  ::v-deep .el-card__body {
    padding: 0;
  }
}

.padding-add {
  padding: 14px 20px 4px;

  .el-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .el-form-item {
    margin: 0 18px 10px 0;
  }

  ::v-deep .el-form-item__label {
    color: #606266;
    font-weight: 500;
    padding-right: 8px;
  }

  ::v-deep .el-form-item__content {
    line-height: 32px;
  }

  ::v-deep .el-input__inner {
    height: 32px;
    line-height: 32px;
  }

  ::v-deep .el-date-editor--daterange.el-input__inner {
    width: 250px !important;
  }

  ::v-deep .el-date-editor .el-range__icon,
  ::v-deep .el-date-editor .el-range__close-icon,
  ::v-deep .el-date-editor .el-range-separator {
    line-height: 24px;
  }

  .filter-buttons {
    margin-left: auto;

    ::v-deep .el-form-item__content {
      display: flex;
      gap: 8px;
    }
  }
}

.form-content-width {
  width: 180px;
}

/* ========== 状态标签栏 ========== */
.status-tabs {
  display: flex;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 16px;
  padding: 0 16px;
}

.status-tab {
  padding: 14px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;

  &:hover {
    color: #409eff;
  }

  &.active {
    color: #409eff;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 2px;
      background: #409eff;
    }
  }
}

/* ========== 表格区 ========== */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

::v-deep .el-table {
  .el-table__fixed-right::before,
  .el-table__fixed::before {
    background-color: #ebeef5;
  }
}

.amount-value {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

/* 状态标签 */
.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;

  &.status-success {
    color: #67c23a;
    background: #f0f9eb;
  }

  &.status-pending {
    color: #409eff;
    background: #ecf5ff;
  }

  &.status-processing {
    color: #409eff;
    background: #ecf5ff;
  }

  &.status-failed {
    color: #f56c6c;
    background: #fef0f0;
  }

  &.status-cancelled {
    color: #909399;
    background: #f4f4f5;
  }
}

/* 订单号单元格 */
.order-no-cell {
  display: flex;
  align-items: center;
  min-width: 0;

  .value {
    color: #303133;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 复制图标 */
.copy-icon {
  cursor: pointer;
  color: #909399;
  margin-left: 4px;
  font-size: 14px;
  flex: 0 0 auto;

  &:hover {
    color: #409eff;
  }
}

/* 用户信息单元格 */
.user-info-cell {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f2f5;
  border: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  font-size: 16px;
  color: #909399;
  font-weight: 600;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
  overflow-wrap: anywhere;
}

.user-no-row {
  display: flex;
  align-items: center;
  min-width: 0;
  margin-top: 2px;
}

.user-no {
  display: inline-block;
  max-width: 108px;
  color: #606266;
  font-size: 12px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

/* 退款原因 */
.reason-text {
  display: inline-block;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

/* 操作列 */
.action-link {
  color: #409eff;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    color: #66b1ff;
  }
}

/* 分页 */
.page {
  padding-top: 14px;
}

/* ========== 详情抽屉 ========== */
.refund-record-page ::v-deep .el-drawer.rtl {
  max-width: 92vw;
}

.refund-record-page ::v-deep .el-drawer__header {
  margin-bottom: 0;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
  font-weight: 600;
}

.detail-drawer-content {
  padding: 18px 20px 24px;
  background: #f5f7fa;
  min-height: 100%;
}

.detail-section {
  margin-bottom: 14px;
  padding: 16px;
  background: #fff;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

::v-deep .el-descriptions__body {
  color: #303133;
}

::v-deep .el-descriptions-item__label.is-bordered-label {
  width: 116px;
  color: #606266;
  background: #fafafa;
  font-weight: 500;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f2f5;
  border: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pay-amount-bold {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.refund-amount-bold {
  font-size: 15px;
  font-weight: 600;
  color: #f56c6c;
}

/* ========== 导出弹窗 ========== */
.export-confirm-content {
  p {
    margin: 0 0 12px;
    color: #606266;
    line-height: 1.6;
  }
}

.export-fields {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 12px 0;

  .export-fields-title {
    color: #303133;
    font-weight: 600;
    margin-bottom: 6px;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
  }
}

.export-count {
  color: #409eff !important;
  font-weight: 500;
  margin-top: 12px !important;
}

@media (max-width: 1280px) {
  .padding-add {
    .filter-buttons {
      margin-left: 0;
    }
  }
}

@media (max-width: 768px) {
  .refund-record-page {
    padding: 12px;
  }

  .padding-add {
    padding: 14px 14px 2px;

    .el-form {
      display: block;
    }

    .el-form-item {
      display: block;
      width: 100%;
      margin-bottom: 12px;
    }

    ::v-deep .el-form-item__label {
      display: block;
      float: none;
      width: auto !important;
      text-align: left;
      line-height: 22px;
      padding: 0 0 6px;
    }

    ::v-deep .el-form-item__content {
      display: block;
      margin-left: 0 !important;
    }

    ::v-deep .el-date-editor--daterange.el-input__inner,
    .form-content-width {
      width: 100% !important;
    }

    .filter-buttons {
      ::v-deep .el-form-item__content {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .status-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .table-toolbar {
    padding: 12px;
  }

  .detail-drawer-content {
    padding: 12px;
  }

  .detail-section {
    padding: 12px;
  }

  ::v-deep .el-descriptions--small.is-bordered .el-descriptions-item__cell {
    padding: 8px 10px;
  }
}
</style>
