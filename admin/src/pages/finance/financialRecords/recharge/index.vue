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
          <annotation-point
            title="【优化】用户信息筛选交互"
            content="优化前：用户信息使用普通输入或下拉选择，数据量较大时查找效率低，且容易只看到单一字段。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、UID、用户编号、手机号等信息检索，选择后回填筛选区。&#10;&#10;原因：用户数据量大，弹窗表格可以同时展示头像、昵称、编号等关键信息，降低误选并提升筛选效率。"
            priority="P1"
          />
          </el-form-item>
          <el-form-item label="时间类型：">
            <el-select clearable v-model="filterForm.timeType" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in timeTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围：">
            <el-date-picker
              clearable
              v-model="filterForm.timeRange"
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
          <el-form-item label="内部订单号：">
            <el-input clearable v-model="filterForm.internalOrderNo" placeholder="请输入内部订单号" class="form-content-width" />
          </el-form-item>

          <!-- 第二行筛选 -->
          <el-form-item label="外部订单号：">
            <annotation-point
              title="【新增】外部订单号筛选"
              content="优化前：没有外部订单号筛选，无法通过第三方支付订单号快速查找充值记录。&#10;&#10;优化后：新增外部订单号输入框，支持模糊搜索，提示为'微信/支付宝/三方支付订单号'。&#10;&#10;功能说明：外部订单号是第三方支付（微信、支付宝、汇付、宝付）生成的订单号，用于与第三方系统对账和问题排查。&#10;&#10;业务说明：当用户反馈充值未到账时，可通过用户提供的第三方支付订单号快速定位充值记录。"
              priority="P1"
            />
            <el-input clearable v-model="filterForm.externalOrderNo" placeholder="微信/支付宝/三方支付订单号" class="form-content-width" />
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select clearable v-model="filterForm.orderStatus" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in orderStatusOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="退款状态：">
            <annotation-point
              title="【新增】退款状态筛选"
              content="优化前：没有退款状态筛选条件。&#10;&#10;优化后：新增退款状态下拉选择框。&#10;&#10;功能说明：用于筛选不同退款状态的充值订单，选项包括：全部、待退款、退款中、退款成功、退款失败、已取消。&#10;&#10;业务说明：待退款状态的订单需要运营人员处理退款操作。"
              priority="P1"
            />
            <el-select clearable v-model="filterForm.refundStatus" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in refundStatusOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支付类型：">
            <annotation-point
              title="【新增】支付类型筛选"
              content="优化前：没有支付类型筛选条件。&#10;&#10;优化后：新增支付类型筛选下拉框。&#10;&#10;功能说明：通过支付类型筛选充值记录，选项包括：宝付支付宝支付、宝付微信支付、汇付支付宝支付、汇付微信支付。&#10;&#10;业务说明：宝付、汇付为不同支付服务商，各支持支付宝和微信两种支付方式。"
              priority="P1"
            />
            <el-select clearable v-model="filterForm.payMethod" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in payMethodOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单来源：">
            <el-select clearable v-model="filterForm.orderSource" placeholder="请选择" class="form-content-width">
              <el-option v-for="(item, index) in orderSourceOptions" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="汇付商户号：">
            <annotation-point
              title="【新增】汇付商户号筛选"
              content="优化前：没有汇付商户号筛选，无法按商户维度查看充值记录。&#10;&#10;优化后：新增汇付商户号输入框，支持模糊搜索。&#10;&#10;功能说明：汇付商户号是汇付支付渠道分配的商户编号，用于区分不同商户的充值流水。&#10;&#10;业务说明：多商户场景下，可按汇付商户号筛选特定商户的充值订单，便于商户对账。"
              priority="P2"
            />
            <el-input clearable v-model="filterForm.huifuMerchantNo" placeholder="请输入汇付商户号" class="form-content-width" />
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item class="filter-buttons">
            <el-button v-db-click @click="handleReset">重置</el-button>
            <el-button type="primary" v-db-click @click="handleSearch">查询</el-button>
          </el-form-item>
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
        <div class="stat-value" :class="card.valueClass">{{ card.prefix }}{{ card.value }}{{ card.suffix }}</div>
        <div class="stat-tip">{{ card.tip }}</div>
      </div>
    </div>

    <!-- 订单列表区 -->
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
            <span class="amount-value pay-amount">{{ row.orderStatus === 'paid' ? '¥' + row.payAmount.toFixed(2) : '-' }}</span>
          </template>
        </el-table-column>

        <!-- 支付类型 -->
        <el-table-column label="支付类型" min-width="150" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.orderStatus === 'unpaid' ? '-' : getPayMethodText(row.payMethod) }}</span>
          </template>
        </el-table-column>

        <!-- 订单来源 -->
        <el-table-column label="订单来源" min-width="120" align="center">
          <template slot-scope="{ row }">
            <span>{{ getOrderSourceText(row.orderSource) }}</span>
          </template>
        </el-table-column>

        <!-- 汇付商户号 -->
        <el-table-column label="汇付商户号" min-width="140">
          <template slot="header">
            <span>汇付商户号</span>
            <annotation-point
              title="【新增】汇付商户号列"
              content="优化前：没有汇付商户号列，无法查看订单所属的汇付商户。&#10;&#10;优化后：新增'汇付商户号'列，显示汇付支付渠道分配的商户编号。&#10;&#10;功能说明：展示汇付商户编号，用于区分不同商户的充值流水。&#10;&#10;业务说明：多商户场景下，不同商户有不同商户号，便于商户对账和区分订单归属。&#10;&#10;逻辑说明：仅汇付渠道订单有商户号，非汇付渠道（宝付）显示'-'。&#10;&#10;状态说明：有商户号时显示，无则显示'-'。"
              priority="P2"
            />
          </template>
          <template slot-scope="{ row }">
            <span>{{ row.huifuMerchantNo || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 支付时间 -->
        <el-table-column label="支付时间" min-width="160">
          <template slot-scope="{ row }">
            <span>{{ row.payTime || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" min-width="160">
          <template slot="header">
            <span>创建时间</span>
            <annotation-point
              title="【新增】创建时间列"
              content="优化前：表格中没有创建时间列，只能通过支付时间判断订单时间。&#10;&#10;优化后：新增'创建时间'列，显示充值订单创建的时间。&#10;&#10;功能说明：展示订单创建的时间，便于追踪订单全生命周期。&#10;&#10;业务说明：订单创建时间与支付时间可能不同（用户创建订单后未立即支付），创建时间用于判断用户下单行为。&#10;&#10;逻辑说明：所有订单都显示创建时间，格式为yyyy-MM-dd HH:mm:ss。&#10;&#10;状态说明：必显示，无空状态。"
              priority="P2"
            />
          </template>
          <template slot-scope="{ row }">
            <span>{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <!-- 支付状态列 -->
        <el-table-column label="支付状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="small" :type="getOrderStatusTagType(row.orderStatus)">{{ getOrderStatusText(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>

        <!-- 退款状态列 -->
        <el-table-column label="退款状态" width="100" align="center">
          <template slot="header">
            <span>退款状态</span>
            <annotation-point
              title="【优化】退款状态统一为5种"
              content="优化前：退款状态为3种，与退款记录页面不一致。&#10;&#10;优化后：统一为5种退款状态，与退款记录页面保持一致。&#10;&#10;状态说明：&#10;- 待退款：用户提交退款申请，等待运营审核，黄色标签&#10;- 退款中：审核通过，退款处理中，蓝色标签&#10;- 退款成功：退款已完成，绿色标签&#10;- 退款失败：退款处理失败，红色标签&#10;- 已取消：审核拒绝或用户取消，灰色标签&#10;&#10;业务说明：状态流转为待退款、退款中、退款成功或退款失败；审核拒绝或用户取消后为已取消。"
              priority="P1"
            />
          </template>
          <template slot-scope="{ row }">
            <el-tag size="small" :type="getRefundStatusTagType(row.refundStatus)">{{ getRefundStatusText(row.refundStatus) }}</el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="160">
          <template slot="header">
            <span>操作</span>
            <annotation-point
              title="【优化】操作列改为详情+退款"
              content="优化前：操作列有详情、审核、重试等多种操作，较复杂。&#10;&#10;优化后：操作列简化为详情和退款两个操作。&#10;&#10;业务逻辑：&#10;- 详情：所有订单都可查看详情&#10;- 退款：仅已支付且处于待退款状态的订单可操作，点击后弹出退款确认弹窗。"
              priority="P1"
            />
          </template>
          <template slot-scope="{ row }">
            <a v-db-click @click="handleDetail(row)">详情</a>
            <el-divider v-if="row.orderStatus === 'paid' && row.refundStatus === 'pending'" direction="vertical" />
            <a v-if="row.orderStatus === 'paid' && row.refundStatus === 'pending'" v-db-click @click="handleRefund(row)">退款</a>
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
            <el-descriptions-item label="退款状态">
              <el-tag size="small" :type="getRefundStatusTagType(currentRow.refundStatus)">{{ getRefundStatusText(currentRow.refundStatus) }}</el-tag>
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
            <el-descriptions-item label="支付类型">{{ currentRow.orderStatus === 'unpaid' ? '-' : getPayMethodText(currentRow.payMethod) }}</el-descriptions-item>
            <el-descriptions-item label="汇付商户号">{{ currentRow.huifuMerchantNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="订单来源">{{ getOrderSourceText(currentRow.orderSource) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentRow.payTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="外部订单号" :span="2">{{ currentRow.externalOrderNo || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 模块6：退款信息 -->
        <div class="detail-section">
          <div class="section-title">退款信息</div>
          <el-descriptions v-if="currentRow.refundStatus === 'success'" :column="2" border size="small">
            <el-descriptions-item label="退款状态">
              <el-tag size="small" :type="getRefundStatusTagType(currentRow.refundStatus)">{{ getRefundStatusText(currentRow.refundStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="退款类型">{{ currentRow.refundType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="退款金额">¥{{ currentRow.refundAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="退款时间">{{ currentRow.refundTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="内部退款单号">{{ currentRow.internalRefundNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="外部退款单号">{{ currentRow.externalRefundNo || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions v-else-if="currentRow.refundStatus === 'pending'" :column="2" border size="small">
            <el-descriptions-item label="退款状态">
              <el-tag size="small" :type="getRefundStatusTagType(currentRow.refundStatus)">{{ getRefundStatusText(currentRow.refundStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请退款金额">¥{{ currentRow.payAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRow.refundApplyTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="申请原因" :span="2">{{ currentRow.refundReason || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions v-else-if="currentRow.refundStatus === 'processing'" :column="2" border size="small">
            <el-descriptions-item label="退款状态">
              <el-tag size="small" :type="getRefundStatusTagType(currentRow.refundStatus)">{{ getRefundStatusText(currentRow.refundStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="退款金额">¥{{ currentRow.payAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRow.refundApplyTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="申请原因" :span="2">{{ currentRow.refundReason || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions v-else-if="currentRow.refundStatus === 'failed'" :column="2" border size="small">
            <el-descriptions-item label="退款状态">
              <el-tag size="small" :type="getRefundStatusTagType(currentRow.refundStatus)">{{ getRefundStatusText(currentRow.refundStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="退款金额">¥{{ currentRow.payAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRow.refundApplyTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="失败时间">{{ currentRow.refundTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="失败原因" :span="2">{{ currentRow.refundReason || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions v-else-if="currentRow.refundStatus === 'cancelled'" :column="2" border size="small">
            <el-descriptions-item label="退款状态">
              <el-tag size="small" :type="getRefundStatusTagType(currentRow.refundStatus)">{{ getRefundStatusText(currentRow.refundStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请退款金额">¥{{ currentRow.payAmount.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRow.refundApplyTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="取消时间">{{ currentRow.refundTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="取消原因" :span="2">{{ currentRow.refundReason || '-' }}</el-descriptions-item>
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
          <p>内部订单号、外部订单号、用户信息、充值金额、随机立减、实付金额、支付类型、汇付商户号、支付时间、创建时间、支付状态、退款状态。</p>
        </div>
        <p class="export-count">当前查询结果共 {{ filteredData.length }} 条。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExportConfirm">确认导出</el-button>
      </span>
    </el-dialog>

    <!-- 退款确认弹窗 -->
    <el-dialog
      title="提示"
      :visible.sync="refundDialogVisible"
      width="420px"
      :close-on-click-modal="false"
      :show-close="true"
      custom-class="refund-confirm-dialog"
      @close="handleRefundDialogClose"
    >
      <div class="refund-confirm-content">
        <div class="refund-confirm-icon">
          <i class="el-icon-warning-outline"></i>
        </div>
        <div class="refund-confirm-text">
          <div class="refund-confirm-desc">确定要对该订单进行退款吗？</div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer refund-confirm-footer">
        <el-button @click="handleRefundOnly">仅退款</el-button>
        <el-button type="primary" @click="handleRefundAndReturn">退款退币</el-button>
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
        { key: 'totalRechargeAmount', label: '充值总金额', value: '0.00', prefix: '¥', suffix: '', tip: '仅统计已支付充值订单金额', valueClass: '' },
        { key: 'actualPayAmount', label: '实付金额', value: '0.00', prefix: '¥', suffix: '', tip: '充值金额 - 随机立减/优惠金额', valueClass: '' },
        { key: 'refundAmount', label: '充值退款金额', value: '0.00', prefix: '¥', suffix: '', tip: '仅统计已全额退款订单金额', valueClass: 'refund' },
        { key: 'alipayAmount', label: '支付宝充值金额', value: '0.00', prefix: '¥', suffix: '', tip: '支付宝支付订单的实付金额', valueClass: '' },
        { key: 'wechatAmount', label: '微信充值金额', value: '0.00', prefix: '¥', suffix: '', tip: '微信支付订单的实付金额', valueClass: '' },
      ],

      // 表格数据
      allTableData: [],
      filteredData: [],
      loading: false,

      // 分页
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

      // 详情抽屉
      detailDrawerVisible: false,
      currentRow: null,

      // 导出弹窗
      exportDialogVisible: false,

      // 退款确认弹窗
      refundDialogVisible: false,
      refundTarget: null,

      // 选项数据
      timeTypeOptions: [
        { label: '创建时间', value: 'createTime' },
        { label: '支付时间', value: 'payTime' },
        { label: '退款时间', value: 'refundTime' },
      ],
      orderStatusOptions: [
        { label: '全部', value: '' },
        { label: '未支付', value: 'unpaid' },
        { label: '已支付', value: 'paid' },
      ],
      refundStatusOptions: [
        { label: '全部', value: '' },
        { label: '待退款', value: 'pending' },
        { label: '退款中', value: 'processing' },
        { label: '退款成功', value: 'success' },
        { label: '退款失败', value: 'failed' },
        { label: '已取消', value: 'cancelled' },
      ],
      payMethodOptions: [
        { label: '全部', value: '' },
        { label: '宝付支付宝支付', value: 'baofu_alipay' },
        { label: '宝付微信支付', value: 'baofu_weixin' },
        { label: '汇付支付宝支付', value: 'huifu_alipay' },
        { label: '汇付微信支付', value: 'huifu_weixin' },
      ],
      orderSourceOptions: [
        { label: '全部', value: '' },
        { label: 'H5', value: 'h5' },
        { label: '小程序', value: 'miniapp' },
        { label: 'App', value: 'app' },
        { label: '公众号', value: 'wechat_public' },
        { label: '后台', value: 'admin' },
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
          internalOrderNo: 'CZ202606260001',
          externalOrderNo: 'WX4200001980632',
          orderStatus: 'paid',
          refundStatus: 'pending',
          createTime: '2026-06-26 10:20:30',
          payTime: '2026-06-26 10:24:30',
          refundTime: '',
          avatar: '',
          nickname: 'Beedo',
          uid: 100,
          userNo: '5916955596',
          orderAmount: 100.00,
          randomDiscount: 5.00,
          payAmount: 95.00,
          refundAmount: 0,
          payMethod: 'huifu_weixin',
          orderSource: 'h5',
          huifuMerchantNo: 'HF20260001',
          internalRefundNo: '',
          externalRefundNo: '',
          refundApplyTime: '',
          refundReason: '',
        },
        {
          id: 2,
          internalOrderNo: 'CZ202606260002',
          externalOrderNo: 'ALI4200001980633',
          orderStatus: 'paid',
          refundStatus: 'success',
          createTime: '2026-06-26 09:15:00',
          payTime: '2026-06-26 09:16:30',
          refundTime: '2026-06-26 11:30:20',
          avatar: '',
          nickname: '熊猫咪',
          uid: 101,
          userNo: '5916955597',
          orderAmount: 50.00,
          randomDiscount: 0.00,
          payAmount: 50.00,
          refundAmount: 50.00,
          payMethod: 'baofu_alipay',
          orderSource: 'miniapp',
          huifuMerchantNo: '',
          internalRefundNo: 'TK202606260001',
          externalRefundNo: 'WXR202606260001',
          refundApplyTime: '2026-06-26 10:00:00',
          refundReason: '重复充值，申请退款',
        },
        {
          id: 3,
          internalOrderNo: 'CZ202606260003',
          externalOrderNo: '',
          orderStatus: 'unpaid',
          refundStatus: 'cancelled',
          createTime: '2026-06-26 11:30:00',
          payTime: '',
          refundTime: '',
          avatar: '',
          nickname: '老虎仔',
          uid: 102,
          userNo: '5916955598',
          orderAmount: 30.00,
          randomDiscount: 0.00,
          payAmount: 0,
          refundAmount: 0,
          payMethod: '',
          orderSource: 'app',
          huifuMerchantNo: '',
          internalRefundNo: '',
          externalRefundNo: '',
          refundApplyTime: '',
          refundReason: '',
        },
        {
          id: 4,
          internalOrderNo: 'CZ202606260004',
          externalOrderNo: 'WX4200001980634',
          orderStatus: 'paid',
          refundStatus: 'pending',
          createTime: '2026-06-26 08:00:00',
          payTime: '2026-06-26 08:05:00',
          refundTime: '',
          avatar: '',
          nickname: '狐狸姐姐',
          uid: 103,
          userNo: '5916955599',
          orderAmount: 198.00,
          randomDiscount: 0.00,
          payAmount: 198.00,
          refundAmount: 0,
          payMethod: 'huifu_weixin',
          orderSource: 'wechat_public',
          huifuMerchantNo: '',
          internalRefundNo: '',
          externalRefundNo: '',
          refundApplyTime: '2026-06-27 09:00:00',
          refundReason: '充值未到账，申请退款',
        },
        {
          id: 5,
          internalOrderNo: 'CZ202606260005',
          externalOrderNo: 'WX4200001980635',
          orderStatus: 'paid',
          refundStatus: 'pending',
          createTime: '2026-06-26 14:00:00',
          payTime: '2026-06-26 14:01:00',
          refundTime: '',
          avatar: '',
          nickname: '兔子乖乖',
          uid: 104,
          userNo: '5916955600',
          orderAmount: 100.00,
          randomDiscount: 2.00,
          payAmount: 98.00,
          refundAmount: 0,
          payMethod: 'huifu_weixin',
          orderSource: 'h5',
          huifuMerchantNo: 'HF20260002',
          internalRefundNo: '',
          externalRefundNo: '',
          refundApplyTime: '',
          refundReason: '',
        },
        {
          id: 6,
          internalOrderNo: 'CZ202606260006',
          externalOrderNo: 'ALI4200001980636',
          orderStatus: 'unpaid',
          refundStatus: 'cancelled',
          createTime: '2026-06-26 16:00:00',
          payTime: '',
          refundTime: '',
          avatar: '',
          nickname: '小黄鸭',
          uid: 105,
          userNo: '5916955601',
          orderAmount: 200.00,
          randomDiscount: 10.00,
          payAmount: 0,
          refundAmount: 0,
          payMethod: '',
          orderSource: 'admin',
          huifuMerchantNo: '',
          internalRefundNo: '',
          externalRefundNo: '',
          refundApplyTime: '',
          refundReason: '',
        },
        {
          id: 7,
          internalOrderNo: 'CZ202606260007',
          externalOrderNo: 'WX4200001980637',
          orderStatus: 'paid',
          refundStatus: 'processing',
          createTime: '2026-06-27 10:00:00',
          payTime: '2026-06-27 10:05:00',
          refundTime: '',
          avatar: '',
          nickname: '星星糖',
          uid: 106,
          userNo: '5916955602',
          orderAmount: 150.00,
          randomDiscount: 0.00,
          payAmount: 150.00,
          refundAmount: 0,
          payMethod: 'huifu_alipay',
          orderSource: 'app',
          huifuMerchantNo: 'HF20260001',
          internalRefundNo: 'TK202606260002',
          externalRefundNo: '',
          refundApplyTime: '2026-06-27 11:00:00',
          refundReason: '投币未使用，申请退还',
        },
        {
          id: 8,
          internalOrderNo: 'CZ202606260008',
          externalOrderNo: 'ALI4200001980638',
          orderStatus: 'paid',
          refundStatus: 'failed',
          createTime: '2026-06-25 08:00:00',
          payTime: '2026-06-25 08:05:00',
          refundTime: '2026-06-25 09:30:00',
          avatar: '',
          nickname: '云朵朵',
          uid: 107,
          userNo: '5916955603',
          orderAmount: 80.00,
          randomDiscount: 0.00,
          payAmount: 80.00,
          refundAmount: 0,
          payMethod: 'baofu_alipay',
          orderSource: 'miniapp',
          huifuMerchantNo: '',
          internalRefundNo: 'TK202606260003',
          externalRefundNo: '',
          refundApplyTime: '2026-06-25 09:00:00',
          refundReason: '退款金额超出支付金额范围',
        },
        {
          id: 9,
          internalOrderNo: 'CZ202606260009',
          externalOrderNo: 'WX4200001980639',
          orderStatus: 'paid',
          refundStatus: 'cancelled',
          createTime: '2026-06-24 12:00:00',
          payTime: '2026-06-24 12:05:00',
          refundTime: '2026-06-24 14:00:00',
          avatar: '',
          nickname: '月光宝盒',
          uid: 108,
          userNo: '5916955604',
          orderAmount: 300.00,
          randomDiscount: 10.00,
          payAmount: 290.00,
          refundAmount: 0,
          payMethod: 'huifu_weixin',
          orderSource: 'h5',
          huifuMerchantNo: 'HF20260003',
          internalRefundNo: 'TK202606260004',
          externalRefundNo: '',
          refundApplyTime: '2026-06-24 13:00:00',
          refundReason: '审核拒绝：不符合退款条件',
        },
        {
          id: 10,
          internalOrderNo: 'CZ202606260010',
          externalOrderNo: 'ALI4200001980640',
          orderStatus: 'paid',
          refundStatus: 'success',
          createTime: '2026-06-23 15:00:00',
          payTime: '2026-06-23 15:02:00',
          refundTime: '2026-06-23 16:00:00',
          avatar: '',
          nickname: '七彩泡泡',
          uid: 109,
          userNo: '5916955605',
          orderAmount: 258.00,
          randomDiscount: 8.00,
          payAmount: 250.00,
          refundAmount: 250.00,
          payMethod: 'huifu_alipay',
          orderSource: 'wechat_public',
          huifuMerchantNo: 'HF20260002',
          internalRefundNo: 'TK202606260005',
          externalRefundNo: 'ALIR202606260001',
          refundApplyTime: '2026-06-23 15:30:00',
          refundReason: '七天无理由退换',
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

      // 退款状态筛选
      if (this.filterForm.refundStatus) {
        data = data.filter(item => item.refundStatus === this.filterForm.refundStatus);
      }

      // 支付方式筛选
      if (this.filterForm.payMethod) {
        data = data.filter(item => item.payMethod === this.filterForm.payMethod);
      }

      // 订单来源筛选
      if (this.filterForm.orderSource) {
        data = data.filter(item => item.orderSource === this.filterForm.orderSource);
      }

      // 汇付商户号筛选
      if (this.filterForm.huifuMerchantNo) {
        data = data.filter(item => item.huifuMerchantNo && item.huifuMerchantNo.includes(this.filterForm.huifuMerchantNo));
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
      this.pagination.total = data.length;
      this.pagination.page = 1;
      this.updateStatCards();
      setTimeout(() => {
        this.loading = false;
      }, 200);
    },

    handleReset() {
      this.filterForm = {
        userKeyword: '',
        timeType: 'createTime',
        timeRange: [],
        internalOrderNo: '',
        externalOrderNo: '',
        orderStatus: '',
        refundStatus: '',
        payMethod: '',
        orderSource: '',
        huifuMerchantNo: '',
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
      // 充值退款金额：已退款成功订单的退款金额合计
      const refundAmount = data
        .filter(item => item.refundStatus === 'success')
        .reduce((sum, item) => sum + (item.refundAmount || item.payAmount), 0);
      // 支付宝充值金额：支付方式为支付宝的实付金额合计
      const alipayAmount = data
        .filter(item => item.orderStatus === 'paid' && item.payMethod.includes('alipay'))
        .reduce((sum, item) => sum + item.payAmount, 0);
      // 微信充值金额：支付方式为微信的实付金额合计
      const wechatAmount = data
        .filter(item => item.orderStatus === 'paid' && item.payMethod.includes('weixin'))
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

    handleRefund(row) {
      if (row.orderStatus !== 'paid') {
        this.$message.warning('仅已支付订单支持退款操作');
        return;
      }
      this.refundTarget = { ...row };
      this.refundDialogVisible = true;
    },

    handleRefundDialogClose() {
      this.refundDialogVisible = false;
      this.refundTarget = null;
    },

    handleRefundOnly() {
      if (!this.refundTarget) return;
      const now = this.formatDateTime(new Date());
      const refundNo = `TK${Date.now()}`;
      const updateData = (item) => {
        if (item.id !== this.refundTarget.id) return item;
        return {
          ...item,
          refundStatus: 'success',
          refundAmount: item.payAmount,
          refundTime: now,
          internalRefundNo: refundNo,
          externalRefundNo: `EXT${refundNo}`,
          refundType: '仅退款',
        };
      };

      this.allTableData = this.allTableData.map(updateData);
      this.filteredData = this.filteredData.map(updateData);
      this.refundDialogVisible = false;
      this.refundTarget = null;
      this.updateStatCards();
      this.$message.success('仅退款操作已提交');
    },

    handleRefundAndReturn() {
      if (!this.refundTarget) return;
      const now = this.formatDateTime(new Date());
      const refundNo = `TK${Date.now()}`;
      const updateData = (item) => {
        if (item.id !== this.refundTarget.id) return item;
        return {
          ...item,
          refundStatus: 'success',
          refundAmount: item.payAmount,
          refundTime: now,
          internalRefundNo: refundNo,
          externalRefundNo: `EXT${refundNo}`,
          refundType: '退款退币',
        };
      };

      this.allTableData = this.allTableData.map(updateData);
      this.filteredData = this.filteredData.map(updateData);
      this.refundDialogVisible = false;
      this.refundTarget = null;
      this.updateStatCards();
      this.$message.success('退款退市操作已提交');
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
      const map = { unpaid: '未支付', paid: '已支付' };
      return map[status] || status;
    },
    getOrderStatusTagType(status) {
      const map = { unpaid: 'info', paid: 'success' };
      return map[status] || '';
    },
    getRefundStatusText(status) {
      const map = { pending: '待退款', processing: '退款中', success: '退款成功', failed: '退款失败', cancelled: '已取消' };
      return map[status] || status;
    },
    getRefundStatusTagType(status) {
      const map = { pending: 'warning', processing: 'primary', success: 'success', failed: 'danger', cancelled: 'info' };
      return map[status] || 'info';
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
    getRechargeChannelText(channel) {
      const map = { huifu: '汇付', baofu: '宝付', yizhifu: '逸支付' };
      return map[channel] || channel;
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
}

.stat-tip {
  font-size: 12px;
  color: #c0c4cc;
  line-height: 1.45;
}

/* ========== 表格区 ========== */
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
