<template>
  <div class="recharge-record-page">
    <!-- 筛选查询区 -->
    <el-card :bordered="false" shadow="never" class="filter-card" :body-style="{ padding: '0' }">
      <div class="padding-add">
        <el-form ref="filterFormRef" :model="filterForm" :label-width="labelWidth" label-position="right" inline @submit.native.prevent>
          <!-- 第一行高频筛选 -->
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
          <el-form-item label="内部订单号：">
            <el-input clearable v-model="filterForm.internalOrderNo" placeholder="请输入内部订单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="外部订单号：">
            <el-input clearable v-model="filterForm.externalOrderNo" placeholder="请输入内部订单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="支付时间：">
            <el-date-picker
              clearable
              v-model="filterForm.timeRange"
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

          <!-- 操作按钮 -->
          <el-form-item class="filter-buttons">
            <el-button v-db-click @click="handleReset">重置</el-button>
            <el-button type="primary" v-db-click @click="handleSearch">查询</el-button>
            <el-button type="text" v-db-click @click="toggleFilterCollapse">
              <i :class="filterCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
              {{ filterCollapsed ? '展开' : '收起' }}
            </el-button>
          </el-form-item>

          <!-- 第二行筛选 -->
          <template v-if="!filterCollapsed">
            <el-form-item label="订单状态：">
              <el-select clearable v-model="filterForm.orderStatus" placeholder="全部" class="form-content-width">
                <el-option v-for="(item, index) in orderStatusOptions" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="支付渠道：">
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

    <!-- 数据统计区 -->
    <div class="stat-cards">
      <div v-for="(card, index) in statCards" :key="index" class="stat-card">
        <annotation-point
          v-if="index === 3"
          title="【新增】实付金额统计"
          content="优化前：没有实付金额统计，无法快速了解实际收款情况。&#10;&#10;优化后：新增'实付金额'统计卡片，显示已支付订单的实际收款总额。&#10;&#10;功能说明：展示筛选条件下所有已支付订单的实付金额总和。&#10;&#10;业务说明：实付金额 = 充值金额 - 随机立减金额 - 已退款金额，反映平台实际收款。&#10;&#10;状态说明：仅统计已支付订单，未支付订单不计入。"
          priority="P1"
        />
        <annotation-point
          v-if="index === 4"
          title="【新增】支付宝充值统计"
          content="优化前：没有按支付方式细分统计，无法了解各渠道充值占比。&#10;&#10;优化后：新增'支付宝充值总额'统计卡片，显示支付宝渠道的充值总额。&#10;&#10;功能说明：展示筛选条件下支付宝支付（包含宝付支付宝、汇付支付宝）的充值总额。&#10;&#10;业务说明：便于按支付方式统计充值数据，了解支付宝渠道占比。"
          priority="P2"
        />
        <annotation-point
          v-if="index === 5"
          title="【新增】微信充值统计"
          content="优化前：没有按支付方式细分统计，无法了解各渠道充值占比。&#10;&#10;优化后：新增'微信充值总额'统计卡片，显示微信渠道的充值总额。&#10;&#10;功能说明：展示筛选条件下微信支付（包含宝付微信、汇付微信）的充值总额。&#10;&#10;业务说明：便于按支付方式统计充值数据，了解微信渠道占比。"
          priority="P2"
        />
        <div class="stat-label">{{ card.label }}</div>
        <div class="stat-value" :class="card.valueClass">{{ card.value }}</div>
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
        <!-- 内部订单号 -->
        <el-table-column label="内部订单号" min-width="160">
          <template slot-scope="{ row }">
            <div class="order-no-cell">
              <el-tooltip :content="row.internalOrderNo" placement="top" :disabled="row.internalOrderNo.length <= 16">
                <span class="value">{{ row.internalOrderNo.length > 16 ? row.internalOrderNo.substring(0, 16) + '...' : row.internalOrderNo }}</span>
              </el-tooltip>
              <i class="el-icon-document-copy copy-icon" @click="copyText(row.internalOrderNo)" title="复制内部订单号"></i>
            </div>
          </template>
        </el-table-column>

        <!-- 外部订单号 -->
        <el-table-column label="外部订单号" min-width="170">
          <template slot="header">
            <span>外部订单号</span>
            <annotation-point
              title="【新增】外部订单号列"
              content="优化前：表格中没有外部订单号列，无法直观查看第三方支付订单号。&#10;&#10;优化后：新增'外部订单号'列，显示第三方支付生成的订单号。&#10;&#10;功能说明：展示微信、支付宝或第三方支付（汇付、宝付）生成的订单号，支持复制功能。&#10;&#10;业务说明：外部订单号用于与第三方支付系统对账和问题排查，当充值未到账时可提供给支付平台查询。&#10;&#10;逻辑说明：订单号过长时显示省略号（超过16字符），hover显示完整订单号，点击复制图标复制到剪贴板。&#10;&#10;状态说明：无外部订单号时显示'-'，如未支付订单可能没有第三方订单号。"
              priority="P1"
            />
          </template>
          <template slot-scope="{ row }">
            <div class="order-no-cell">
              <template v-if="row.externalOrderNo">
                <el-tooltip :content="row.externalOrderNo" placement="top" :disabled="row.externalOrderNo.length <= 16">
                  <span class="value">{{ row.externalOrderNo.length > 16 ? row.externalOrderNo.substring(0, 16) + '...' : row.externalOrderNo }}</span>
                </el-tooltip>
                <i class="el-icon-document-copy copy-icon" @click="copyText(row.externalOrderNo)" title="复制外部订单号"></i>
              </template>
              <span v-else class="empty-value">-</span>
            </div>
          </template>
        </el-table-column>

        <!-- 用户信息列 -->
        <el-table-column label="用户信息" min-width="170">
          <template slot-scope="{ row }">
            <div class="user-info-cell">
              <div class="user-avatar">
                <img v-if="row.avatar" :src="row.avatar" @error="handleAvatarError" />
                <span v-else class="avatar-placeholder">{{ row.nickname ? row.nickname.charAt(0) : 'U' }}</span>
              </div>
              <div class="user-details">
                <div class="nickname">{{ row.nickname }}</div>
                <div class="user-no-row">
                  <span class="user-no">{{ row.userNo }}</span>
                  <i class="el-icon-document-copy copy-icon" @click="copyText(row.userNo)" title="复制"></i>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 充值金额 -->
        <el-table-column label="充值金额" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span class="amount-value">¥{{ row.orderAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 随机立减 -->
        <el-table-column label="随机立减" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span class="amount-value discount">{{ row.randomDiscount > 0 ? '-¥' + row.randomDiscount.toFixed(2) : '¥0.00' }}</span>
          </template>
        </el-table-column>

        <!-- 实付金额 -->
        <el-table-column label="实付金额" min-width="120" align="right">
          <template slot="header">
            <span>实付金额</span>
            <annotation-point
              title="【新增】实付金额列"
              content="优化前：没有实付金额列，无法直观看到用户实际支付金额。&#10;&#10;优化后：新增'实付金额'列，显示已支付订单的实际支付金额。&#10;&#10;功能说明：展示用户实际支付的金额（充值金额减去优惠）。&#10;&#10;业务说明：实付金额 = 充值金额 - 随机立减金额，反映平台实际收款，用于财务核对。&#10;&#10;状态说明：支付成功显示金额，未支付显示'-'。"
              priority="P1"
            />
          </template>
          <template slot-scope="{ row }">
            <span class="amount-value pay-amount">{{ row.orderStatus === 'pending' || row.orderStatus === 'cancelled' ? '-' : '¥' + row.payAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 支付渠道 -->
        <el-table-column label="支付渠道" min-width="120" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.orderStatus === 'pending' ? '-' : getPayMethodText(row.payMethod) }}</span>
          </template>
        </el-table-column>

        <!-- 订单来源 -->
        <el-table-column label="订单来源" min-width="120" align="center">
          <template slot-scope="{ row }">
            <span>{{ getOrderSourceText(row.orderSource) }}</span>
          </template>
        </el-table-column>

        <!-- 支付时间 -->
        <el-table-column label="支付时间" min-width="160">
          <template slot-scope="{ row }">
            <span>{{ row.payTime || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 订单状态列 -->
        <el-table-column label="订单状态" width="100" align="center">
          <template slot-scope="{ row }">
            <span :class="['status-text', getOrderStatusClass(row.orderStatus)]">{{ getOrderStatusText(row.orderStatus) }}</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="120" align="center">
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

    <!-- 充值订单详情抽屉 -->
    <el-drawer title="充值订单详情" :visible.sync="detailDrawerVisible" direction="rtl" :size="'760px'" :modal-append-to-body="false" :wrapper-closable="true">
      <annotation-point
        title="【新增】充值订单详情抽屉"
        content="优化前：没有订单详情功能，只能在列表页查看订单信息。&#10;&#10;优化后：新增右侧滑出式详情抽屉，按模块展示订单完整信息。&#10;&#10;功能说明：抽屉式详情面板，包含订单信息、用户信息、金额明细、支付信息、退款信息等模块。&#10;&#10;业务逻辑：点击列表'详情'按钮打开抽屉，展示当前选中订单的完整信息。关闭方式：点击遮罩层、点击关闭按钮或按ESC键。"
        priority="P1"
      />
      <div v-if="currentRow" class="detail-drawer-content">
        <!-- 模块1：订单信息 -->
        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="内部订单号">
              {{ currentRow.internalOrderNo }}
              <i class="el-icon-document-copy copy-icon" @click="copyText(currentRow.internalOrderNo)"></i>
            </el-descriptions-item>
            <el-descriptions-item label="外部订单号">{{ currentRow.externalOrderNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag size="small" :type="getOrderStatusTagType(currentRow.orderStatus)">{{ getOrderStatusText(currentRow.orderStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentRow.createTime }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentRow.payTime || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 模块2：用户信息 -->
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

        <!-- 模块4：金额明细 -->
        <div class="detail-section">
          <div class="section-title">金额明细</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="充值金额">¥{{ currentRow.orderAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="随机立减金额">-¥{{ currentRow.randomDiscount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="实付金额">
              <span class="pay-amount-bold">¥{{ currentRow.payAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="退款金额">
              <span :class="currentRow.refundAmount > 0 ? 'refund-amount-bold' : ''">
                {{ currentRow.refundAmount > 0 ? '¥' + currentRow.refundAmount.toFixed(2) : '¥0.00' }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 模块5：支付信息 -->
        <div class="detail-section">
          <div class="section-title">支付信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="支付渠道">{{ currentRow.orderStatus === 'pending' ? '-' : getPayMethodText(currentRow.payMethod) }}</el-descriptions-item>
            <el-descriptions-item label="订单来源">{{ getOrderSourceText(currentRow.orderSource) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentRow.payTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="外部订单号">{{ currentRow.externalOrderNo || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>

    <!-- 导出确认弹窗 -->
    <el-dialog title="导出数据" :visible.sync="exportDialogVisible" width="420px" :close-on-click-modal="false">
      <annotation-point
        title="【新增】导出确认弹窗"
        content="优化前：没有导出功能，无法批量导出充值记录进行离线处理。&#10;&#10;优化后：新增导出确认弹窗，支持导出当前筛选条件下的所有充值记录。&#10;&#10;功能说明：点击'导出'按钮弹出确认框，显示导出字段说明和记录数，确认后导出Excel文件。&#10;&#10;业务逻辑：导出不受分页影响，包含当前筛选条件下的全部记录，便于财务对账和数据存档。&#10;&#10;数据说明：导出内容包括内部订单号、外部订单号、用户信息、充值金额、随机立减、实付金额、支付方式、汇付商户号、支付时间、创建时间、支付状态、退款状态。"
        priority="P2"
      />
      <div class="export-confirm-content">
        <p>确认导出当前查询结果的全部数据？</p>
        <div class="export-fields">
          <p class="export-fields-title">导出字段包含：</p>
          <p>内部订单号、外部订单号、用户信息、充值金额、随机立减、实付金额、支付渠道、订单来源、支付时间、创建时间、订单状态。</p>
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
import AnnotationPoint from '@/components/AnnotationPoint/index.vue';
import EntityPickerInput from '@/components/EntityPickerInput';

export default {
  name: 'finance_recharge',
  components: {
    EntityPickerInput,
    AnnotationPoint,
  },
  data() {
    return {
      // 筛选表单
      filterForm: {
        userKeyword: '',        // 用户信息搜索
        timeType: 'createTime', // 时间类型：createTime/payTime/refundTime
        timeRange: [],          // 时间范围
        internalOrderNo: '',    // 内部订单号
        externalOrderNo: '',    // 外部订单号
        orderStatus: '',        // 订单状态
        refundStatus: '',       // 退款状态
        payMethod: '',         // 支付方式
        orderSource: '',       // 订单来源
        huifuMerchantNo: '',   // 汇付商户号
      },
      pickerOptions: this.$timeOptions,

      // 统计卡片（5个）
      statCards: [
        { key: 'totalRechargeAmount', label: '充值总金额', value: '775.00', prefix: '', suffix: '', tip: '', valueClass: '' },
        { key: 'actualPayAmount', label: '实付金额', value: '755.00', prefix: '', suffix: '', tip: '', valueClass: '' },
        { key: 'refundAmount', label: '充值退款金额', value: '50.00', prefix: '', suffix: '', tip: '', valueClass: 'refund' },
        { key: 'alipayAmount', label: '支付宝充值金额', value: '150.00', prefix: '', suffix: '', tip: '', valueClass: '' },
        { key: 'wechatAmount', label: '微信充值金额', value: '625.00', prefix: '', suffix: '', tip: '', valueClass: '' },
      ],

      // 表格数据
      allTableData: [],
      filteredData: [],
      loading: false,

      // 分页
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

      // 详情抽屉
      detailDrawerVisible: false,
      currentRow: null,

      // 导出弹窗
      exportDialogVisible: false,

      // 筛选收起状态
      filterCollapsed: false,

      // 选项数据
      orderStatusOptions: [
        { label: '全部', value: '' },
        { label: '待支付', value: 'pending' },
        { label: '已支付', value: 'paid' },
        { label: '已取消', value: 'cancelled' },
        { label: '已退款', value: 'refunded' },
      ],
      payMethodOptions: [
        { label: '全部', value: '' },
        { label: '汇付支付', value: 'huifu' },
        { label: '宝付支付', value: 'baofu' },
      ],
      orderSourceOptions: [
        { label: '全部', value: '' },
        { label: '微信', value: 'wechat' },
        { label: '支付宝', value: 'alipay' },
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
    // ==================== 数据加载 ====================
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
          internalOrderNo: 'CZ202...35584',
          externalOrderNo: 'HF202...35584',
          orderStatus: 'paid',
          createTime: '2026-06-26 10:20:30',
          payTime: '2026-06-26 10:24:30',
          avatar: '',
          nickname: 'Beedo',
          uid: 100,
          userNo: '5916955596',
          orderAmount: 100.00,
          randomDiscount: 5.00,
          payAmount: 95.00,
          payMethod: 'huifu',
          orderSource: 'wechat',
        },
        {
          id: 2,
          internalOrderNo: 'CZ202...35585',
          externalOrderNo: 'BF203...35585',
          orderStatus: 'refunded',
          createTime: '2026-06-26 09:15:00',
          payTime: '2026-06-26 10:24:30',
          avatar: '',
          nickname: '熊猫咪',
          uid: 101,
          userNo: '5916955597',
          orderAmount: 50.00,
          randomDiscount: 0.00,
          payAmount: 50.00,
          payMethod: 'baofu',
          orderSource: 'alipay',
        },
        {
          id: 3,
          internalOrderNo: 'CZ202...35586',
          externalOrderNo: 'CZ204...35586',
          orderStatus: 'pending',
          createTime: '2026-06-26 11:30:00',
          payTime: '',
          avatar: '',
          nickname: '小虎仔',
          uid: 102,
          userNo: '5916955598',
          orderAmount: 75.00,
          randomDiscount: 1.00,
          payAmount: 0,
          payMethod: '',
          orderSource: 'wechat',
        },
        {
          id: 4,
          internalOrderNo: 'CZ202...35587',
          externalOrderNo: 'CZ205...35587',
          orderStatus: 'cancelled',
          createTime: '2026-06-26 13:02:47',
          payTime: '',
          avatar: '',
          nickname: '蓝天',
          uid: 103,
          userNo: '5916955599',
          orderAmount: 100.00,
          randomDiscount: 2.00,
          payAmount: 0,
          payMethod: 'huifu',
          orderSource: 'alipay',
        },
        {
          id: 5,
          internalOrderNo: 'CZ202...35588',
          externalOrderNo: 'CZ206...35588',
          orderStatus: 'paid',
          createTime: '2026-06-26 14:00:00',
          payTime: '2026-06-26 14:18:03',
          avatar: '',
          nickname: '花栗鼠',
          uid: 104,
          userNo: '5916955600',
          orderAmount: 125.00,
          randomDiscount: 3.00,
          payAmount: 122.00,
          payMethod: 'baofu',
          orderSource: 'wechat',
        },
        {
          id: 6,
          internalOrderNo: 'CZ202...77344',
          externalOrderNo: 'CZ207...35589',
          orderStatus: 'paid',
          createTime: '2026-06-26 15:00:00',
          payTime: '2026-06-26 15:37:59',
          avatar: '',
          nickname: '月光',
          uid: 105,
          userNo: '5916955601',
          orderAmount: 150.00,
          randomDiscount: 4.00,
          payAmount: 146.00,
          payMethod: 'baofu',
          orderSource: 'wechat',
        },
        {
          id: 7,
          internalOrderNo: 'CZ202...60927',
          externalOrderNo: 'CZ208...35590',
          orderStatus: 'refunded',
          createTime: '2026-06-26 16:00:00',
          payTime: '2026-06-26 16:50:44',
          avatar: '',
          nickname: '雪狐',
          uid: 106,
          userNo: '5916955602',
          orderAmount: 175.00,
          randomDiscount: 5.00,
          payAmount: 170.00,
          payMethod: 'huifu',
          orderSource: 'alipay',
        },
      ];
    },

    // ==================== 筛选与查询 ====================
    handleSearch() {
      this.loading = true;
      let data = [...this.allTableData];

      // 用户信息筛选
      if (this.filterForm.userKeyword) {
        const kw = this.filterForm.userKeyword.toLowerCase();
        data = data.filter(item =>
          (item.nickname && item.nickname.toLowerCase().includes(kw)) ||
          (item.uid && item.uid.toString().includes(kw)) ||
          (item.userNo && item.userNo.toLowerCase().includes(kw))
        );
      }

      // 内部订单号筛选
      if (this.filterForm.internalOrderNo) {
        data = data.filter(item => item.internalOrderNo.includes(this.filterForm.internalOrderNo));
      }

      // 外部订单号筛选
      if (this.filterForm.externalOrderNo) {
        data = data.filter(item => item.externalOrderNo && item.externalOrderNo.includes(this.filterForm.externalOrderNo));
      }

      // 订单状态筛选
      if (this.filterForm.orderStatus) {
        data = data.filter(item => item.orderStatus === this.filterForm.orderStatus);
      }

      // 支付渠道筛选
      if (this.filterForm.payMethod) {
        data = data.filter(item => item.payMethod === this.filterForm.payMethod);
      }

      // 订单来源筛选
      if (this.filterForm.orderSource) {
        data = data.filter(item => item.orderSource === this.filterForm.orderSource);
      }

      // 时间范围筛选
      if (this.filterForm.timeRange && this.filterForm.timeRange.length === 2) {
        const [start, end] = this.filterForm.timeRange;
        const timeField = this.filterForm.timeType || 'createTime';
        data = data.filter(item => {
          const itemTime = item[timeField];
          if (!itemTime) return false;
          return itemTime >= start && itemTime <= end + ' 23:59:59';
        });
      }

      this.filteredData = data;
      // this.pagination.total = data.length;
      this.pagination.page = 1;
      this.updateStatCards();
      setTimeout(() => {
        this.loading = false;
      }, 200);
    },

    toggleFilterCollapse() {
      this.filterCollapsed = !this.filterCollapsed;
    },

    handleReset() {
      this.filterForm = {
        userKeyword: '',
        timeType: 'createTime',
        timeRange: [],
        internalOrderNo: '',
        externalOrderNo: '',
        orderStatus: '',
        payMethod: '',
        orderSource: '',
      };
      this.handleSearch();
    },

    // ==================== 统计卡片 ====================
    updateStatCards() {
      const data = this.filteredData;
      // 充值总金额：已支付订单的充值金额合计
      const totalRecharge = data
        .filter(item => item.orderStatus === 'paid')
        .reduce((sum, item) => sum + item.orderAmount, 0);
      // 实付金额：已支付订单的实付金额合计
      const actualPay = data
        .filter(item => item.orderStatus === 'paid')
        .reduce((sum, item) => sum + item.payAmount, 0);
      // 充值退款金额：已退款订单的实付金额合计
      const refundAmount = data
        .filter(item => item.orderStatus === 'refunded')
        .reduce((sum, item) => sum + item.payAmount, 0);
      // 支付宝充值金额：订单来源为支付宝的实付金额合计
      const alipayAmount = data
        .filter(item => item.orderStatus === 'paid' && item.orderSource === 'alipay')
        .reduce((sum, item) => sum + item.payAmount, 0);
      // 微信充值金额：订单来源为微信的实付金额合计
      const wechatAmount = data
        .filter(item => item.orderStatus === 'paid' && item.orderSource === 'wechat')
        .reduce((sum, item) => sum + item.payAmount, 0);

      this.statCards[0].value = totalRecharge.toFixed(2);
      this.statCards[1].value = actualPay.toFixed(2);
      this.statCards[2].value = refundAmount.toFixed(2);
      this.statCards[3].value = alipayAmount.toFixed(2);
      this.statCards[4].value = wechatAmount.toFixed(2);
    },

    // ==================== 表格操作 ====================
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

    // ==================== 分页 ====================
    handlePageSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.page = 1;
    },

    handlePageChange(page) {
      this.pagination.page = page;
    },

    // ==================== 导出 ====================
    handleExport() {
      if (this.filteredData.length === 0) {
        this.$message.warning('当前筛选结果无数据，无法导出');
        return;
      }
      this.exportDialogVisible = true;
    },

    handleExportConfirm() {
      this.exportDialogVisible = false;
      this.$message.success(`正在导出 ${this.filteredData.length} 条充值记录...`);
      // 实际对接时，这里调用导出API
      // exportUserRechargeApi(this.getExportParams()).then(res => { ... })
    },

    // ==================== 状态文本与标签 ====================
    getOrderStatusText(status) {
      const map = { pending: '待支付', paid: '已支付', cancelled: '已取消', refunded: '已退款' };
      return map[status] || status;
    },
    getOrderStatusTagType(status) {
      const map = { pending: 'info', paid: 'success', cancelled: 'warning', refunded: 'danger' };
      return map[status] || '';
    },
    getOrderStatusClass(status) {
      const map = { pending: 'status-pending', paid: 'status-paid', cancelled: 'status-cancelled', refunded: 'status-refunded' };
      return map[status] || '';
    },
    getPayMethodText(method) {
      const map = {
        huifu: '汇付支付',
        baofu: '宝付支付',
      };
      return map[method] || method;
    },
    getOrderSourceText(source) {
      const map = { wechat: '微信', alipay: '支付宝' };
      return map[source] || source;
    },
    formatDateTime(date) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.recharge-record-page {
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

/* ========== 统计卡片区 ========== */
.stat-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  min-width: 160px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 20px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
  word-break: break-all;

  &.refund {
    color: #f56c6c;
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

/* 金额值 */
.amount-value {
  font-weight: 500;
  color: #303133;
  font-size: 14px;

  &.discount {
    color: #67c23a;
  }

  &.pay-amount {
    font-weight: 600;
    color: #1f2d3d;
  }
}

/* 状态文字 */
.status-text {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;

  &.status-paid {
    color: #67c23a;
    background: #f0f9eb;
  }

  &.status-pending {
    color: #909399;
    background: #f4f4f5;
  }

  &.status-cancelled {
    color: #e6a23c;
    background: #fdf6ec;
  }

  &.status-refunded {
    color: #f56c6c;
    background: #fef0f0;
  }
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

.action-divider {
  color: #dcdfe6;
  margin: 0 6px;
  font-size: 12px;
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

.empty-value {
  color: #c0c4cc;
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

/* 分页 */
.page {
  padding-top: 14px;
}

/* ========== 详情抽屉 ========== */
.recharge-record-page ::v-deep .el-drawer.rtl {
  max-width: 92vw;
}

.recharge-record-page ::v-deep .el-drawer__header {
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

.no-refund-info {
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;

  .info-row {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;

    .label {
      color: #909399;
    }

    .value {
      color: #303133;
    }
  }
}

/* ========== 导出弹窗 ========== */
.export-confirm-content {
  p {
    margin: 8px 0;
    color: #606266;
  }
}

.export-fields {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.export-fields-title {
  font-weight: 500;
  color: #303133;
}

.export-count {
  color: #909399;
  font-size: 13px;
}

.refund-dialog-content {
  .refund-summary {
    margin-bottom: 16px;
  }

  ::v-deep .el-descriptions-item__label.is-bordered-label {
    width: 104px;
    color: #606266;
    background: #fafafa;
    font-weight: 500;
  }
}

.refund-form {
  padding-top: 2px;
}

.refund-detail-box {
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;

  .info-row {
    display: flex;
    align-items: center;

    & + .info-row {
      margin-top: 6px;
    }

    .label {
      color: #909399;
      white-space: nowrap;
    }

    .value {
      color: #303133;
      word-break: break-all;
    }
  }
}

@media (max-width: 1280px) {
  .padding-add {
    .filter-buttons {
      margin-left: 0;
    }
  }
}

@media (max-width: 768px) {
  .recharge-record-page {
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

  .table-toolbar,
  .pagination-wrapper {
    padding: 12px;
  }

  .table-toolbar {
    align-items: flex-start;
    gap: 10px;
    flex-direction: column;
  }

  .toolbar-right {
    width: 100%;
    justify-content: flex-end;
  }

  .pagination-wrapper {
    justify-content: flex-start;
    overflow-x: auto;
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

.audit-dialog-content,
.retry-dialog-content {
  .audit-summary,
  .retry-summary {
    margin-bottom: 16px;
  }

  .audit-form,
  .retry-form {
    margin-top: 16px;
  }
}

::v-deep .refund-confirm-dialog .el-dialog__body {
  padding: 12px 20px 10px;
}

.refund-confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.refund-confirm-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fdf6ec;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 24px;
    color: #e6a23c;
  }
}

.refund-confirm-text {
  flex: 1;
}

.refund-confirm-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.refund-confirm-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.refund-confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
