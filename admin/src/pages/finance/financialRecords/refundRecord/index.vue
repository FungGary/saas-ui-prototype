<template>
  <div class="refund-record-page">
    <el-card :bordered="false" shadow="never" class="filter-card" :body-style="{ padding: '0' }">
      <div class="padding-add">
        <el-form ref="filterFormRef" :model="filterForm" :label-width="labelWidth" label-position="right" inline @submit.native.prevent>
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
          <annotation-point
            title="【新增】用户信息筛选交互"
            content="优化前：筛选区缺少用户信息查询入口，无法按用户维度快速定位记录。&#10;&#10;优化后：新增带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、UID、用户编号等信息检索，选择后回填筛选区。&#10;&#10;原因：用户数据量大，弹窗表格可以同时展示头像、昵称、编号等关键信息，提升定位效率并减少误选。"
            priority="P1"
          />
          </el-form-item>
          <el-form-item label="申请时间：">
            <el-date-picker
              clearable
              v-model="filterForm.applyTimeRange"
              type="daterange"
              :editable="false"
              format="yyyy/MM/dd"
              value-format="yyyy/MM/dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              style="width: 250px"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="退款订单单号：">
            <el-input clearable v-model="filterForm.internalRefundNo" placeholder="请输入退款订单单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="内部订单号：">
            <el-input clearable v-model="filterForm.internalOrderNo" placeholder="请输入内部订单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="外部订单号：">
            <annotation-point
              title="【新增】外部订单号筛选"
              content="优化前：没有外部订单号筛选条件。&#10;&#10;优化后：新增外部订单号输入框，支持模糊搜索。&#10;&#10;功能说明：外部订单号是第三方支付（微信/支付宝/汇付/宝付）生成的订单号，用于与第三方系统对账和问题排查。&#10;&#10;业务说明：当用户反馈充值未到账时，可通过用户提供的第三方支付订单号快速定位充值记录。&#10;&#10;逻辑说明：输入框内容绑定filterForm.externalOrderNo，查询时触发handleSearch方法进行模糊匹配筛选。"
              priority="P1"
            />
            <el-input clearable v-model="filterForm.externalOrderNo" placeholder="微信/支付宝/三方支付订单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="退款状态：">
            <el-select clearable v-model="filterForm.refundStatus" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in refundStatusOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="业务类型：">
            <el-select clearable v-model="filterForm.businessType" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in businessTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支付类型：">
            <el-select clearable v-model="filterForm.payMethod" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in payMethodOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="汇付商户号：">
            <annotation-point
              title="【新增】汇付商户号筛选"
              content="优化前：没有汇付商户号筛选条件。&#10;&#10;优化后：新增汇付商户号输入框，支持模糊搜索。&#10;&#10;功能说明：汇付商户号是汇付支付渠道分配的商户编号，用于区分不同商户的充值流水。&#10;&#10;业务说明：多商户场景下，可按汇付商户号筛选特定商户的充值订单，便于商户对账。&#10;&#10;逻辑说明：输入框绑定filterForm.huifuMerchantNo，查询时触发模糊匹配筛选。"
              priority="P2"
            />
            <el-input clearable v-model="filterForm.huifuMerchantNo" placeholder="请输入汇付商户号" class="form-content-width" />
          </el-form-item>

          <el-form-item class="filter-buttons">
            <el-button v-db-click @click="handleReset">重置</el-button>
            <el-button type="primary" v-db-click @click="handleSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card :bordered="false" shadow="never" class="mt16" :body-style="{ padding: '0 20px 20px' }">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button v-db-click @click="handleExport">
            <i class="el-icon-download"></i> 导出
          </el-button>
        </div>
        <div class="toolbar-right">
          <span class="table-result-count">共 {{ pagination.total }} 条</span>
        </div>
      </div>

      <el-table
        ref="tableRef"
        :data="pagedData"
        v-loading="loading"
        empty-text="暂无数据"
        class="orderData mt14"
      >
        <el-table-column label="退款订单单号" min-width="160">
          <template slot-scope="{ row }">
            <div class="order-no-cell">
              <el-tooltip :content="row.internalRefundNo" placement="top" :disabled="row.internalRefundNo.length <= 16">
                <span class="value">{{ row.internalRefundNo.length > 16 ? row.internalRefundNo.substring(0, 16) + '...' : row.internalRefundNo }}</span>
              </el-tooltip>
              <i class="el-icon-document-copy copy-icon" @click="copyText(row.internalRefundNo)" title="复制退款订单单号"></i>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="内部订单号" min-width="160">
          <template slot="header">
            <span>内部订单号</span>
            <annotation-point
              title="【优化】内部订单号列"
              content="优化前：表格中该列名称为'支付订单号'。&#10;&#10;优化后：列名称改为'内部订单号'，与其他页面保持一致。&#10;&#10;功能说明：展示退款关联的充值订单内部单号，支持复制功能。&#10;&#10;业务说明：内部订单号是平台内部生成的充值订单编号，用于追溯退款对应的原始充值订单。&#10;&#10;状态说明：订单号过长时显示省略号，hover显示完整订单号。"
              priority="P1"
            />
          </template>
          <template slot-scope="{ row }">
            <div class="order-no-cell">
              <el-tooltip :content="row.internalOrderNo" placement="top" :disabled="row.internalOrderNo.length <= 16">
                <span class="value">{{ row.internalOrderNo.length > 16 ? row.internalOrderNo.substring(0, 16) + '...' : row.internalOrderNo }}</span>
              </el-tooltip>
              <i class="el-icon-document-copy copy-icon" @click="copyText(row.internalOrderNo)" title="复制内部订单号"></i>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="外部订单号" min-width="170">
          <template slot="header">
            <span>外部订单号</span>
            <annotation-point
              title="【新增】外部订单号列"
              content="优化前：表格中没有外部订单号列，无法直接查看第三方支付订单号。&#10;&#10;优化后：新增'外部订单号'列，显示第三方支付生成的原始充值订单号。&#10;&#10;功能说明：展示微信、支付宝或第三方支付（汇付、宝付）生成的订单号，支持复制功能。&#10;&#10;业务说明：外部订单号用于与第三方支付系统对账和问题排查。&#10;&#10;状态说明：无外部订单号时显示'-'。"
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

        <el-table-column label="业务类型" min-width="130">
          <template slot-scope="{ row }">
            <span>{{ getBusinessTypeText(row.businessType) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="退款金额" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span class="amount-value refund-amount">¥{{ row.refundAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="支付类型" min-width="150" align="center">
          <template slot-scope="{ row }">
            <span>{{ getPayMethodText(row.payMethod) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="汇付商户号" min-width="140">
          <template slot="header">
            <span>汇付商户号</span>
            <annotation-point
              title="【新增】汇付商户号列"
              content="优化前：没有汇付商户号列，无法查看退款订单所属的汇付商户。&#10;&#10;优化后：新增'汇付商户号'列，显示汇付支付渠道分配的商户编号。&#10;&#10;功能说明：展示汇付商户编号，用于区分不同商户的退款流水。&#10;&#10;业务说明：多商户场景下，不同商户有不同商户号，便于商户对账和区分订单归属。&#10;&#10;逻辑说明：仅汇付渠道订单有商户号，非汇付渠道（宝付）显示'-'。"
              priority="P2"
            />
          </template>
          <template slot-scope="{ row }">
            <span>{{ row.huifuMerchantNo || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="退款状态" width="110" align="center">
          <template slot-scope="{ row }">
            <el-tag size="small" :type="getRefundStatusTagType(row.refundStatus)">{{ getRefundStatusText(row.refundStatus) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="退款原因" min-width="150">
          <template slot-scope="{ row }">
            <el-tooltip :content="row.refundReason" placement="top" :disabled="!row.refundReason || row.refundReason.length <= 12">
              <span class="reason-text">{{ row.refundReason || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="退款时间" min-width="160">
          <template slot-scope="{ row }">
            <span>{{ row.refundTime || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="80">
          <template slot-scope="{ row }">
            <a v-db-click @click="handleDetail(row)">详情</a>
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
              <el-tag size="small" :type="getRefundStatusTagType(currentRow.refundStatus)">{{ getRefundStatusText(currentRow.refundStatus) }}</el-tag>
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
            <el-descriptions-item label="订单金额">¥{{ currentRow.orderAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="实付金额">
              <span class="pay-amount-bold">¥{{ currentRow.payAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="退款金额" :span="2">
              <span class="refund-amount-bold">¥{{ currentRow.refundAmount.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">支付信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="支付类型">{{ getPayMethodText(currentRow.payMethod) }}</el-descriptions-item>
            <el-descriptions-item label="汇付商户号">{{ currentRow.huifuMerchantNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentRow.payTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="外部订单号">{{ currentRow.externalOrderNo || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="导出数据" :visible.sync="exportDialogVisible" width="420px" :close-on-click-modal="false">
      <div class="export-confirm-content">
        <p>确认导出当前查询结果的全部数据？</p>
        <div class="export-fields">
          <p class="export-fields-title">导出字段包含：</p>
          <p>退款订单单号、内部订单号、外部订单号、用户信息、业务类型、退款金额、支付类型、汇付商户号、退款状态、退款原因、申请时间、退款时间。</p>
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
  name: 'finance_refundRecord',
  components: {
    EntityPickerInput,
    AnnotationPoint,
  },
  data() {
    return {
      filterForm: {
        userKeyword: '',
        applyTimeRange: [],
        internalRefundNo: '',
        internalOrderNo: '',
        externalOrderNo: '',
        refundStatus: '',
        businessType: '',
        payMethod: '',
        huifuMerchantNo: '',
      },
      pickerOptions: this.$timeOptions,

      allTableData: [],
      filteredData: [],
      loading: false,

      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
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

      refundStatusOptions: [
        { label: '全部', value: '' },
        { label: '待退款', value: 'pending' },
        { label: '退款中', value: 'processing' },
        { label: '退款成功', value: 'success' },
        { label: '退款失败', value: 'failed' },
        { label: '已取消', value: 'cancelled' },
      ],
      businessTypeOptions: [
        { label: '全部', value: '' },
        { label: '线上娃娃机充值', value: 'claw_recharge_online' },
        { label: '线下娃娃机充值', value: 'claw_recharge_offline' },
      ],
      payMethodOptions: [
        { label: '全部', value: '' },
        { label: '宝付支付宝支付', value: 'baofu_alipay' },
        { label: '宝付微信支付', value: 'baofu_weixin' },
        { label: '汇付支付宝支付', value: 'huifu_alipay' },
        { label: '汇付微信支付', value: 'huifu_weixin' },
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
          internalRefundNo: 'TK202606260001',
          externalRefundNo: 'WXR202606260001',
          internalOrderNo: 'CZ202606260001',
          externalOrderNo: 'WX4200001980632',
          refundStatus: 'success',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-26 10:30:00',
          refundTime: '2026-06-26 11:00:20',
          avatar: '',
          nickname: 'Beedo',
          uid: 100,
          userNo: '5916955596',
          orderAmount: 100.00,
          payAmount: 95.00,
          refundAmount: 95.00,
          payMethod: 'huifu_weixin',
          orderSource: 'h5',
          huifuMerchantNo: 'HF20260001',
          createTime: '2026-06-26 10:20:30',
          payTime: '2026-06-26 10:24:30',
          refundReason: '重复充值，申请退款',
        },
        {
          id: 2,
          internalRefundNo: 'TK202606260002',
          externalRefundNo: '',
          internalOrderNo: 'CZ202606260002',
          externalOrderNo: 'ALI4200001980633',
          refundStatus: 'failed',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-26 09:20:00',
          refundTime: '2026-06-26 09:45:00',
          avatar: '',
          nickname: '熊猫咪',
          uid: 101,
          userNo: '5916955597',
          orderAmount: 50.00,
          payAmount: 50.00,
          refundAmount: 0,
          payMethod: 'baofu_alipay',
          orderSource: 'miniapp',
          huifuMerchantNo: '',
          createTime: '2026-06-26 09:15:00',
          payTime: '2026-06-26 09:16:30',
          refundReason: '支付渠道异常，退款失败',
        },
        {
          id: 3,
          internalRefundNo: 'TK202606260003',
          externalRefundNo: '',
          internalOrderNo: 'CZ202606260003',
          externalOrderNo: 'WX4200001980634',
          refundStatus: 'pending',
          businessType: 'claw_recharge_offline',
          applyTime: '2026-06-27 09:00:00',
          refundTime: '',
          avatar: '',
          nickname: '狐狸姐姐',
          uid: 103,
          userNo: '5916955599',
          orderAmount: 198.00,
          payAmount: 198.00,
          refundAmount: 198.00,
          payMethod: 'huifu_weixin',
          orderSource: 'wechat_public',
          huifuMerchantNo: '',
          createTime: '2026-06-26 08:00:00',
          payTime: '2026-06-26 08:05:00',
          refundReason: '充值未到账，申请退款',
        },
        {
          id: 4,
          internalRefundNo: 'TK202606260004',
          externalRefundNo: 'ALIR202606260001',
          internalOrderNo: 'CZ202606260004',
          externalOrderNo: 'ALI4200001980635',
          refundStatus: 'success',
          businessType: 'claw_recharge_offline',
          applyTime: '2026-06-25 14:30:00',
          refundTime: '2026-06-25 15:10:00',
          avatar: '',
          nickname: '兔子乖乖',
          uid: 104,
          userNo: '5916955600',
          orderAmount: 299.00,
          payAmount: 299.00,
          refundAmount: 299.00,
          payMethod: 'huifu_alipay',
          orderSource: 'app',
          huifuMerchantNo: 'HF20260002',
          createTime: '2026-06-25 10:00:00',
          payTime: '2026-06-25 10:01:00',
          refundReason: '商品缺货，申请退款',
        },
        {
          id: 5,
          internalRefundNo: 'TK202606260005',
          externalRefundNo: '',
          internalOrderNo: 'CZ202606260005',
          externalOrderNo: 'WX4200001980636',
          refundStatus: 'processing',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-27 10:30:00',
          refundTime: '',
          avatar: '',
          nickname: '老虎仔',
          uid: 102,
          userNo: '5916955598',
          orderAmount: 50.00,
          payAmount: 50.00,
          refundAmount: 50.00,
          payMethod: 'baofu_weixin',
          orderSource: 'h5',
          huifuMerchantNo: '',
          createTime: '2026-06-26 16:00:00',
          payTime: '2026-06-26 16:01:00',
          refundReason: '投币未使用，申请退还',
        },
        {
          id: 6,
          internalRefundNo: 'TK202606260006',
          externalRefundNo: 'WXR202606260002',
          internalOrderNo: 'CZ202606260006',
          externalOrderNo: 'WX4200001980637',
          refundStatus: 'success',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-24 11:00:00',
          refundTime: '2026-06-24 11:30:00',
          avatar: '',
          nickname: '小黄鸭',
          uid: 105,
          userNo: '5916955601',
          orderAmount: 200.00,
          payAmount: 190.00,
          refundAmount: 190.00,
          payMethod: 'huifu_weixin',
          orderSource: 'miniapp',
          huifuMerchantNo: 'HF20260003',
          createTime: '2026-06-24 10:00:00',
          payTime: '2026-06-24 10:05:00',
          refundReason: '用户误操作充值，申请退款',
        },
        {
          id: 7,
          internalRefundNo: 'TK202606260007',
          externalRefundNo: '',
          internalOrderNo: 'CZ202606260007',
          externalOrderNo: 'ALI4200001980638',
          refundStatus: 'cancelled',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-23 15:00:00',
          refundTime: '',
          avatar: '',
          nickname: '呵呵',
          uid: 113,
          userNo: '5916955602',
          orderAmount: 100.00,
          payAmount: 100.00,
          refundAmount: 0,
          payMethod: 'baofu_alipay',
          orderSource: 'admin',
          huifuMerchantNo: '',
          createTime: '2026-06-23 14:00:00',
          payTime: '2026-06-23 14:02:00',
          refundReason: '用户主动取消退款申请',
        },
        {
          id: 8,
          internalRefundNo: 'TK202606260008',
          externalRefundNo: 'ALIR202606260002',
          internalOrderNo: 'CZ202606260008',
          externalOrderNo: 'ALI4200001980639',
          refundStatus: 'success',
          businessType: 'claw_recharge_offline',
          applyTime: '2026-06-22 09:30:00',
          refundTime: '2026-06-22 10:00:00',
          avatar: '',
          nickname: '星星糖',
          uid: 106,
          userNo: '5916955603',
          orderAmount: 599.00,
          payAmount: 599.00,
          refundAmount: 599.00,
          payMethod: 'huifu_alipay',
          orderSource: 'h5',
          huifuMerchantNo: 'HF20260001',
          createTime: '2026-06-21 20:00:00',
          payTime: '2026-06-21 20:01:00',
          refundReason: '七天无理由退换',
        },
        {
          id: 9,
          internalRefundNo: 'TK202606260009',
          externalRefundNo: '',
          internalOrderNo: 'CZ202606260009',
          externalOrderNo: 'WX4200001980640',
          refundStatus: 'failed',
          businessType: 'claw_recharge_online',
          applyTime: '2026-06-21 08:00:00',
          refundTime: '2026-06-21 08:30:00',
          avatar: '',
          nickname: '云朵朵',
          uid: 107,
          userNo: '5916955604',
          orderAmount: 80.00,
          payAmount: 80.00,
          refundAmount: 0,
          payMethod: 'baofu_weixin',
          orderSource: 'miniapp',
          huifuMerchantNo: '',
          createTime: '2026-06-21 07:50:00',
          payTime: '2026-06-21 07:55:00',
          refundReason: '退款金额超出支付金额范围',
        },
        {
          id: 10,
          internalRefundNo: 'TK202606260010',
          externalRefundNo: '',
          internalOrderNo: 'CZ202606260010',
          externalOrderNo: 'ALI4200001980641',
          refundStatus: 'processing',
          businessType: 'claw_recharge_offline',
          applyTime: '2026-06-27 14:00:00',
          refundTime: '',
          avatar: '',
          nickname: '月光宝盒',
          uid: 108,
          userNo: '5916955605',
          orderAmount: 500.00,
          payAmount: 500.00,
          refundAmount: 500.00,
          payMethod: 'huifu_alipay',
          orderSource: 'app',
          huifuMerchantNo: 'HF20260002',
          createTime: '2026-06-27 13:00:00',
          payTime: '2026-06-27 13:05:00',
          refundReason: '会员开通错误，申请退款重开',
        },
      ];
    },

    handleSearch() {
      this.loading = true;
      let data = [...this.allTableData];

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

      if (this.filterForm.refundStatus) {
        data = data.filter(item => item.refundStatus === this.filterForm.refundStatus);
      }

      if (this.filterForm.businessType) {
        data = data.filter(item => item.businessType === this.filterForm.businessType);
      }

      if (this.filterForm.payMethod) {
        data = data.filter(item => item.payMethod === this.filterForm.payMethod);
      }

      if (this.filterForm.huifuMerchantNo) {
        data = data.filter(item => item.huifuMerchantNo && item.huifuMerchantNo.includes(this.filterForm.huifuMerchantNo));
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
      this.pagination.total = data.length;
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
        refundStatus: '',
        businessType: '',
        payMethod: '',
        huifuMerchantNo: '',
      };
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
      const map = { pending: '待退款', processing: '退款中', success: '退款成功', failed: '退款失败', cancelled: '已取消' };
      return map[status] || status;
    },
    getRefundStatusTagType(status) {
      const map = { pending: 'warning', processing: 'primary', success: 'success', failed: 'danger', cancelled: 'info' };
      return map[status] || '';
    },
    getBusinessTypeText(type) {
      const map = {
        claw_recharge_online: '线上娃娃机充值',
        claw_recharge_offline: '线下娃娃机充值',
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
      const map = { h5: 'H5', miniapp: '小程序', app: 'App', wechat_public: '公众号', admin: '后台' };
      return map[source] || source;
    },
  },
};
</script>

<style lang="scss" scoped>
.refund-record-page {
  padding: 0;
}

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

.stat-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  min-width: 180px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 20px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 4px;
  word-break: break-all;

  &.refund {
    color: #f56c6c;
  }

  &.warning {
    color: #e6a23c;
  }
}

.stat-tip {
  font-size: 12px;
  color: #c0c4cc;
  line-height: 1.45;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
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
  color: #909399;
  font-size: 13px;
}

.table-result-count {
  white-space: nowrap;
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

  &.refund-amount {
    font-weight: 600;
    color: #f56c6c;
  }
}

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

.reason-text {
  display: inline-block;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

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

.page {
  padding-top: 14px;
}

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
</style>
