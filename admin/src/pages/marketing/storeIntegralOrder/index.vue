<template>
  <div class="integral-order-page" :class="{ 'annotation-mode': showAnnotation }">
    <transition name="slide-right">
      <div v-if="showAnnotation" class="annotation-panel-wrapper">
        <AnnotationPanel
          ref="annotationPanel"
          @select="handleAnnotationSelect"
          @toggle-markers="handleToggleMarkers"
        />
      </div>
    </transition>

    <AnnotationHighlight />

    <!-- 顶部筛选区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="tableFrom"
          :model="tableFrom"
          label-width="80px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form">
            <div class="search-form-box">
              <el-form-item label="订单搜索：" label-for="order_no">
                <el-input v-model="tableFrom.order_no" placeholder="请输入订单号" clearable class="form_content_width">
                  <el-select v-model="field_key" slot="prepend" style="width: 100px">
                    <el-option value="all" label="全部"></el-option>
                    <el-option value="order_no" label="订单号"></el-option>
                    <el-option value="product_name" label="商品名称"></el-option>
                  </el-select>
                </el-input>
              </el-form-item>
              <el-form-item label="用户信息：">
                <entity-picker-input
                  v-model="tableFrom.user_info"
                  :display="getIntegralOrderUserDisplay(tableFrom.user_info)"
                  placeholder="请选择用户"
                  title="用户搜索"
                  search-label="用户搜索"
                  search-placeholder="请输入昵称/UID/手机号"
                  :rows="getIntegralOrderUserOptions()"
                  :columns="userPickerColumns"
                  row-key="uid"
                  :search-fields="['nickname', 'uid', 'phone']"
                />
          <annotation-point
            title="【优化】用户信息筛选交互"
            content="优化前：用户信息使用普通输入或下拉选择，数据量较大时查找效率低，且容易只看到单一字段。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、UID、用户编号、手机号等信息检索，选择后回填筛选区。&#10;&#10;原因：用户数据量大，弹窗表格可以同时展示头像、昵称、编号等关键信息，降低误选并提升筛选效率。"
            priority="P1"
          />
              </el-form-item>
              <el-form-item label="下单时间：">
                <el-date-picker
                  v-model="timeVal"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  @change="onchangeTime"
                  format="yyyy/MM/dd"
                  value-format="yyyy/MM/dd"
                  style="width: 250px"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="积分范围：">
                <el-input
                  clearable
                  placeholder="最小值"
                  v-model="tableFrom.integral_range[0]"
                  class="form_range_content_width"
                />
                ~
                <el-input
                  clearable
                  placeholder="最大值"
                  v-model="tableFrom.integral_range[1]"
                  class="form_range_content_width"
                />
              </el-form-item>
              <el-form-item label="兑换数量：">
                <el-input
                  clearable
                  placeholder="最小值"
                  v-model="tableFrom.quantity_range[0]"
                  class="form_range_content_width"
                />
                ~
                <el-input
                  clearable
                  placeholder="最大值"
                  v-model="tableFrom.quantity_range[1]"
                  class="form_range_content_width"
                />
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" v-db-click @click="userSearchs">查询</el-button>
              <el-button class="ResetSearch" v-db-click @click="reset('tableFrom')">重置</el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <!-- 状态筛选Tab -->
      <div id="integral-order-status-tabs" class="annotation-point-wrapper">
        <el-tabs v-model="tableFrom.status" @tab-click="onClickTab">
          <el-tab-pane :name="item.type" v-for="(item, index) in headeNum" :key="index">
            <template slot="label">
              <span>{{ item.name }}({{ item.count }})</span>
              <annotation-point
                v-if="index === 0"
                title="【新增】履约状态Tab筛选"
                content="优化前：原系统列表没有订单状态筛选，运营无法快速查看不同状态的订单。&#10;&#10;优化后：新增状态Tab筛选，包含全部、待发货、已发货、已完成、取消中、已取消6个状态Tab，每个Tab显示对应数量。&#10;&#10;原因：提升列表查询效率，运营可快速筛选不同履约状态的订单。"
                priority="P0"
              />
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 操作按钮区 -->
      <el-row :gutter="24" justify="space-between">
        <el-col :span="24">
          <el-button v-db-click @click="exportList">导出</el-button>
        </el-col>
        <el-col :span="24" class="userAlert" v-if="selectionList.length">
          <el-alert show-icon>
            <template slot="title">
              已选择<i class="userI"> {{ selectionList.length }} </i>项
            </template>
          </el-alert>
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <el-table
        :data="tableList"
        class="mt16"
        ref="table"
        highlight-current-row
        v-loading="loading"
        empty-text="暂无数据"
        @select="handleSelectRow"
        @select-all="handleSelectAll"
        row-key="id"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        
        <el-table-column label="订单ID" min-width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="订单号" min-width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.order_no }}</span>
            <el-button type="text" icon="el-icon-copy-document" v-db-click @click="copyOrderNo(scope.row.order_no)" class="copy-btn"></el-button>
          </template>
        </el-table-column>
        
        <el-table-column min-width="180">
          <template slot="header">
            <span id="integral-user-info-column">
              用户信息
              <annotation-point
                title="【优化】用户信息列展示优化"
                content="优化前：原系统用户信息列与用户编号分开展示，信息分散。&#10;&#10;优化后：将用户头像、昵称、UID合并为一列，提升信息密度和浏览效率。&#10;&#10;原因：减少列数，提升信息密度，让运营在一屏内看到更多关键信息。"
                priority="P1"
              />
            </span>
          </template>
          <template slot-scope="scope">
            <div class="acea-row row-middle">
              <div class="tabBox_img" v-viewer>
                <img v-lazy="scope.row.avatar" />
              </div>
              <div class="ml10">
                <div class="line">{{ scope.row.nickname }}</div>
                <div class="line1 gary">编号：{{ scope.row.uid }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="商品信息" min-width="280">
          <template slot-scope="scope">
            <div class="acea-row row-middle">
              <div class="tabBox_img" v-viewer>
                <img v-lazy="scope.row.product_image" />
              </div>
              <div class="ml10">
                <div class="line">{{ scope.row.product_name }}</div>
                <div class="line1 gary">商品ID: {{ scope.row.product_id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column min-width="100">
          <template slot="header">
            <span id="integral-order-status-column">
              履约状态
              <annotation-point
                title="【新增】履约状态列"
                content="优化前：原系统订单列表没有履约状态字段，无法直观了解订单当前履约进度。&#10;&#10;优化后：新增履约状态列，以彩色标签形式展示订单当前状态，便于运营快速识别。&#10;&#10;原因：积分订单需要清楚展示履约进度，提升运营效率。"
                priority="P0"
              />
            </span>
          </template>
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="兑换数量" min-width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="兑换积分" min-width="100">
          <template slot-scope="scope">
            <span class="price-color">{{ scope.row.total_integral }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="下单时间" min-width="160">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" fixed="right" width="100">
          <template slot-scope="scope">
            <a v-db-click @click="handleDetail(scope.row)">详情</a>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="tableFrom.page"
          :limit.sync="tableFrom.limit"
          @pagination="pageChange"
        />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer
      custom-class="demo-drawer"
      :visible.sync="detailDrawerVisible"
      :wrapperClosable="false"
      size="720"
      title="订单详情"
    >
      <div class="demo-drawer__content" v-if="currentOrder">
        <!-- 订单基本信息 -->
        <div class="head">
          <div class="full">
            <img class="order_icon" src="@/assets/images/order_icon.png" alt="" />
            <div class="text">
              <div class="title">积分订单</div>
              <div>
                <span class="mr20">订单号：{{ currentOrder.order_no }}</span>
              </div>
            </div>
          </div>
          <ul class="list">
            <li class="item">
              <div class="title" id="integral-detail-order-status">
                订单状态
                <annotation-point
                  title="【新增】详情页订单状态"
                  content="优化前：原系统详情弹窗没有订单状态展示，客服需要返回列表查看状态。&#10;&#10;优化后：详情页头部展示订单主状态和履约状态，进入详情即可了解订单当前状态。&#10;&#10;原因：详情页必须比列表更完整，提升客服处理效率。"
                  priority="P0"
                />
              </div>
              <div>
                <el-tag :type="getStatusTagType(currentOrder.status)" size="small">
                  {{ getStatusText(currentOrder.status) }}
                </el-tag>
              </div>
            </li>
            <li class="item">
              <div class="title">兑换积分</div>
              <div class="price-color">{{ currentOrder.total_integral }}</div>
            </li>
            <li class="item">
              <div class="title">下单时间</div>
              <div>{{ currentOrder.create_time }}</div>
            </li>
          </ul>
        </div>

        <!-- Tab标签页 -->
        <el-tabs type="border-card" v-model="activeName" class="mt16">
          <el-tab-pane name="detail">
            <span slot="label" id="integral-detail-structure">
              订单信息
              <annotation-point
                title="【优化】详情结构优化-分区展示"
                content="优化前：原系统详情弹窗采用平铺式布局，信息量大时难以快速定位。&#10;&#10;优化后：详情页采用Tab分区（订单信息/商品信息/订单记录），各区域独立展示，结构清晰。&#10;&#10;原因：信息分层展示，提升信息查找效率。"
                priority="P1"
              />
            </span>
            <div class="section">
              <div class="title">用户信息</div>
              <ul class="list">
                <li class="item">
                  <div>用户昵称：</div>
                  <div class="value">{{ currentOrder.nickname || '-' }}</div>
                </li>
                <li class="item">
                  <div>用户ID：</div>
                  <div class="value">{{ currentOrder.uid }}</div>
                </li>
                <li class="item">
                  <div>手机号：</div>
                  <div class="value">{{ currentOrder.phone || '-' }}</div>
                </li>
              </ul>
            </div>

            <div class="section" id="integral-detail-receiver-info">
              <div class="title">
                收货信息
                <annotation-point
                  title="【新增】收货信息"
                  content="优化前：原系统详情没有收货地址信息，实物商品兑换后客服无法查看收货地址。&#10;&#10;优化后：增加收货人、手机号、收货地址、用户备注，支持客服发货和联系用户。&#10;&#10;原因：商品履约必备，客服需要地址信息进行发货操作。"
                  priority="P0"
                />
              </div>
              <ul class="list">
                <li class="item">
                  <div>收货人：</div>
                  <div class="value">{{ currentOrder.receiver_name || '-' }}</div>
                </li>
                <li class="item">
                  <div>收货电话：</div>
                  <div class="value">{{ currentOrder.receiver_phone || '-' }}</div>
                </li>
                <li class="item">
                  <div>收货地址：</div>
                  <div class="value">{{ currentOrder.receiver_address || '-' }}</div>
                </li>
              </ul>
            </div>

            <div class="section">
              <div class="title">积分信息</div>
              <ul class="list">
                <li class="item">
                  <div>兑换数量：</div>
                  <div class="value">{{ currentOrder.quantity }}</div>
                </li>
                <li class="item">
                  <div>商品单价：</div>
                  <div class="value price-color">{{ currentOrder.unit_integral }}积分</div>
                </li>
                <li class="item">
                  <div>总价：</div>
                  <div class="value price-color">{{ currentOrder.total_integral }}积分</div>
                </li>
              </ul>
            </div>

            <div class="section" id="integral-detail-points-flow">
              <div class="title">
                积分变化
                <annotation-point
                  title="【新增】积分流水关联"
                  content="优化前：原系统只显示总积分数值，无法核对积分扣减是否正确。&#10;&#10;优化后：展示积分扣减流水ID、扣减时间、退回流水ID，方便核对用户积分是否正确扣减。&#10;&#10;原因：方便核对用户积分是否正确扣减，提升财务对账效率。"
                  priority="P0"
                />
              </div>
              <ul class="list">
                <li class="item">
                  <div>下单前积分：</div>
                  <div class="value">{{ currentOrder.before_integral }}</div>
                </li>
                <li class="item">
                  <div>扣减积分：</div>
                  <div class="value" style="color: #f56022;">-{{ currentOrder.deduct_integral }}</div>
                </li>
                <li class="item">
                  <div>下单后积分：</div>
                  <div class="value">{{ currentOrder.after_integral }}</div>
                </li>
              </ul>
            </div>

            <div class="section" v-if="currentOrder.logistics_company" id="integral-detail-logistics">
              <div class="title">
                物流信息
                <annotation-point
                  title="【新增】物流信息"
                  content="优化前：原系统详情没有物流信息，客服无法确认订单是否已发货。&#10;&#10;优化后：增加物流公司、物流单号、发货时间，支持客服跟踪物流进度。&#10;&#10;原因：支持发货后物流跟踪，提升订单履约透明度。"
                  priority="P0"
                />
              </div>
              <ul class="list">
                <li class="item">
                  <div>物流公司：</div>
                  <div class="value">{{ currentOrder.logistics_company }}</div>
                </li>
                <li class="item">
                  <div>物流单号：</div>
                  <div class="value">
                    {{ currentOrder.logistics_no }}
                    <a href="#" @click.prevent="openLogistics" class="logistics-link">物流查询</a>
                  </div>
                </li>
                <li class="item" v-if="currentOrder.ship_time">
                  <div>发货时间：</div>
                  <div class="value">{{ currentOrder.ship_time }}</div>
                </li>
              </ul>
            </div>

            <div class="section" v-if="currentOrder.user_remark">
              <div class="title">用户备注</div>
              <ul class="list">
                <li class="item">
                  <div>{{ currentOrder.user_remark }}</div>
                </li>
              </ul>
            </div>

            <div class="section" id="integral-detail-internal-remark">
              <div class="title">
                内部备注
                <annotation-point
                  title="【新增】客服备注"
                  content="优化前：原系统详情没有内部备注功能，客服无法记录订单相关信息。&#10;&#10;优化后：增加内部备注（商家/客服可见，用户不可见），支持客服记录特殊情况说明。&#10;&#10;原因：支持客服记录特殊情况说明，便于跨班次交接。"
                  priority="P1"
                />
              </div>
              <ul class="list">
                <li class="item">
                  <div class="value">{{ currentOrder.internal_remark || '-' }}</div>
                </li>
              </ul>
            </div>
          </el-tab-pane>

          <el-tab-pane label="商品信息" name="goods">
            <el-table class="mt20" :data="[currentOrder]" border>
              <el-table-column label="商品信息" min-width="300">
                <template slot-scope="scope">
                  <div class="acea-row row-middle">
                    <div class="tabBox_img" v-viewer>
                      <img v-lazy="scope.row.product_image" />
                    </div>
                    <div class="ml10">
                      <div class="line">{{ scope.row.product_name }}</div>
                      <div class="line1 gary">商品ID：{{ scope.row.product_id }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="单价(积分)" min-width="120">
                <template slot-scope="scope">
                  <span class="price-color">{{ scope.row.unit_integral }}</span>
                </template>
              </el-table-column>
              <el-table-column label="兑换数量" min-width="100">
                <template slot-scope="scope">
                  {{ scope.row.quantity }}
                </template>
              </el-table-column>
              <el-table-column label="总价(积分)" min-width="120">
                <template slot-scope="scope">
                  <span class="price-color font-weight">{{ scope.row.total_integral }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane name="records">
            <span slot="label" id="integral-detail-records-tab">
              订单记录
              <annotation-point
                title="【新增】操作记录Tab"
                content="优化前：原系统详情没有操作记录，无法追溯订单状态变更历史。&#10;&#10;优化后：新增操作记录Tab，记录订单每次状态变更时间、操作人、IP等信息。&#10;&#10;原因：便于追溯订单状态变更历史，支持售后审计。"
                priority="P1"
              />
            </span>
            <el-table class="mt20" :data="currentOrder.operation_records" border empty-text="暂无数据">
              <el-table-column label="时间" min-width="160">
                <template slot-scope="scope">
                  <span>{{ scope.row.time }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作记录" min-width="150">
                <template slot-scope="scope">
                  <span>{{ scope.row.action }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作人" min-width="100">
                <template slot-scope="scope">
                  <span>{{ scope.row.operator }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>

        <!-- 底部操作按钮 -->
        <div class="fix_footer acea-row row-center">
          <el-button v-db-click @click="detailDrawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 物流查询抽屉 -->
    <el-drawer
      title="物流查询"
      :visible.sync="logisticsDrawerVisible"
      size="400px"
      append-to-body
    >
      <div class="logistics-info" v-if="currentOrder">
        <div class="logistics-header">
          <span>物流公司：{{ currentOrder.logistics_company }}</span>
          <span>物流单号：{{ currentOrder.logistics_no }}</span>
        </div>
        <div class="logistics-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in logisticsMockData"
              :key="index"
              :timestamp="item.time"
              :color="index === 0 ? '#67c23a' : '#909399'"
            >
              <div :class="['logistics-status', index === 0 ? 'current' : '']">
                {{ item.status }}
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint/index.vue';
import EntityPickerInput from '@/components/EntityPickerInput';

export default {
  name: 'marketing_storeIntegralOrder',
  components: {
    EntityPickerInput,
    AnnotationPanel: () => import('@/components/annotation/AnnotationPanel'),
    AnnotationHighlight: () => import('@/components/annotation/AnnotationHighlight'),
    AnnotationPoint,
  },
  data() {
    return {
      loading: false,
      timeVal: [],
      field_key: 'all',
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,
      userPickerColumns: [
        { label: '头像', prop: 'avatar', type: 'avatar', fallbackProp: 'nickname', width: 90 },
        { label: '昵称', prop: 'nickname', minWidth: 150 },
        { label: 'UID', prop: 'uid', width: 130 },
        { label: '手机号', prop: 'phone', width: 150 }
      ],
      tableFrom: {
        order_no: '',
        user_info: '',
        integral_time: '',
        integral_range: ['', ''],
        quantity_range: ['', ''],
        status: 'all',
        page: 1,
        limit: 15,
      },
      headeNum: [
        { type: 'all', name: '全部', count: 0 },
        { type: 'pending', name: '待发货', count: 0 },
        { type: 'shipped', name: '已发货', count: 0 },
        { type: 'completed', name: '已完成', count: 0 },
        { type: 'canceling', name: '取消中', count: 0 },
        { type: 'canceled', name: '已取消', count: 0 },
      ],
      tableList: [],
      total: 0,
      selectionList: [],
      ids: [],
      detailDrawerVisible: false,
      currentOrder: null,
      activeName: 'detail',
      internalRemark: '',
      logisticsDrawerVisible: false,
      logisticsMockData: [
        { time: '2026-06-22 18:30:00', status: '快件已发出，正在运输中' },
        { time: '2026-06-22 19:45:00', status: '快件到达广州转运中心' },
        { time: '2026-06-22 22:00:00', status: '快件已发往深圳' },
        { time: '2026-06-23 08:30:00', status: '快件到达深圳网点' },
      ],
      mockData: [
        {
          id: 1001,
          order_no: 'PO202606230001',
          create_time: '2026-06-23 10:30:22',
          uid: '100001',
          nickname: '张三',
          phone: '138****1234',
          avatar: 'https://picsum.photos/36/36?random=1',
          product_id: 'P001',
          product_name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm',
          product_image: 'https://picsum.photos/36/36?random=11',
          status: 'pending',
          quantity: 1,
          unit_integral: 16500,
          total_integral: 16500,
          before_integral: 50000,
          deduct_integral: 16500,
          after_integral: 33500,
          receiver_name: '张三',
          receiver_phone: '13800138001',
          receiver_address: '广东省深圳市南山区科技园路88号',
          user_remark: '请尽快发货',
          logistics_company: '',
          logistics_no: '',
          ship_time: '',
          internal_remark: '',
          operation_records: [
            { time: '2026-06-23 10:30:22', action: '用户提交订单', operator: '张三' },
            { time: '2026-06-23 10:30:25', action: '系统扣减积分', operator: '系统' },
          ],
        },
        {
          id: 1002,
          order_no: 'PO202606230002',
          create_time: '2026-06-23 09:15:45',
          uid: '100002',
          nickname: '李四',
          phone: '139****5678',
          avatar: 'https://picsum.photos/36/36?random=2',
          product_id: 'P002',
          product_name: '智能手表Pro Max',
          product_image: 'https://picsum.photos/36/36?random=12',
          status: 'pending',
          quantity: 1,
          unit_integral: 500,
          total_integral: 500,
          before_integral: 1000,
          deduct_integral: 500,
          after_integral: 500,
          receiver_name: '李四',
          receiver_phone: '13900139001',
          receiver_address: '北京市朝阳区建国路99号',
          user_remark: '',
          logistics_company: '',
          logistics_no: '',
          ship_time: '',
          internal_remark: '',
          operation_records: [
            { time: '2026-06-23 09:15:45', action: '用户提交订单', operator: '李四' },
            { time: '2026-06-23 09:15:48', action: '系统扣减积分', operator: '系统' },
          ],
        },
        {
          id: 1003,
          order_no: 'PO202606220003',
          create_time: '2026-06-22 16:20:18',
          uid: '100003',
          nickname: '王五',
          phone: '137****9012',
          avatar: 'https://picsum.photos/36/36?random=3',
          product_id: 'P003',
          product_name: '无线蓝牙耳机降噪版',
          product_image: 'https://picsum.photos/36/36?random=13',
          status: 'shipped',
          quantity: 2,
          unit_integral: 200,
          total_integral: 400,
          before_integral: 800,
          deduct_integral: 400,
          after_integral: 400,
          receiver_name: '王五',
          receiver_phone: '13700137001',
          receiver_address: '上海市浦东新区陆家嘴环路1000号',
          user_remark: '',
          logistics_company: '顺丰速运',
          logistics_no: 'SF1234567890',
          ship_time: '2026-06-22 18:00:00',
          internal_remark: '',
          operation_records: [
            { time: '2026-06-22 16:20:18', action: '用户提交订单', operator: '王五' },
            { time: '2026-06-22 16:20:20', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-22 18:00:00', action: '商家发货', operator: '管理员' },
          ],
        },
        {
          id: 1004,
          order_no: 'PO202606220004',
          create_time: '2026-06-22 14:05:33',
          uid: '100001',
          nickname: '张三',
          phone: '138****1234',
          avatar: 'https://picsum.photos/36/36?random=1',
          product_id: 'P004',
          product_name: '便携充电宝20000mAh快充版',
          product_image: 'https://picsum.photos/36/36?random=14',
          status: 'shipped',
          quantity: 1,
          unit_integral: 350,
          total_integral: 350,
          before_integral: 1000,
          deduct_integral: 350,
          after_integral: 650,
          receiver_name: '张三',
          receiver_phone: '13800138002',
          receiver_address: '广东省广州市天河区珠江新城',
          user_remark: '请用顺丰快递',
          logistics_company: '顺丰速运',
          logistics_no: 'SF0987654321',
          ship_time: '2026-06-22 16:30:00',
          internal_remark: '用户要求顺丰',
          operation_records: [
            { time: '2026-06-22 14:05:33', action: '用户提交订单', operator: '张三' },
            { time: '2026-06-22 14:05:35', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-22 16:30:00', action: '商家发货', operator: '管理员' },
          ],
        },
        {
          id: 1005,
          order_no: 'PO202606210005',
          create_time: '2026-06-21 11:45:55',
          uid: '100002',
          nickname: '李四',
          phone: '139****5678',
          avatar: 'https://picsum.photos/36/36?random=2',
          product_id: 'P005',
          product_name: '限量版手办模型',
          product_image: 'https://picsum.photos/36/36?random=15',
          status: 'completed',
          quantity: 1,
          unit_integral: 5000,
          total_integral: 5000,
          before_integral: 10000,
          deduct_integral: 5000,
          after_integral: 5000,
          receiver_name: '李四',
          receiver_phone: '13900139002',
          receiver_address: '北京市海淀区中关村大街1号',
          user_remark: '',
          logistics_company: '圆通速递',
          logistics_no: 'YT5555555555',
          ship_time: '2026-06-21 14:00:00',
          internal_remark: '',
          operation_records: [
            { time: '2026-06-21 11:45:55', action: '用户提交订单', operator: '李四' },
            { time: '2026-06-21 11:46:00', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-21 14:00:00', action: '商家发货', operator: '管理员' },
            { time: '2026-06-23 09:00:00', action: '用户签收', operator: '李四' },
          ],
        },
        {
          id: 1006,
          order_no: 'PO202606210006',
          create_time: '2026-06-21 10:20:12',
          uid: '100003',
          nickname: '王五',
          phone: '137****9012',
          avatar: 'https://picsum.photos/36/36?random=3',
          product_id: 'P006',
          product_name: '精美陶瓷茶具套装',
          product_image: 'https://picsum.photos/36/36?random=16',
          status: 'completed',
          quantity: 1,
          unit_integral: 800,
          total_integral: 800,
          before_integral: 1500,
          deduct_integral: 800,
          after_integral: 700,
          receiver_name: '王五',
          receiver_phone: '13700137002',
          receiver_address: '浙江省杭州市西湖区文三路',
          user_remark: '',
          logistics_company: '申通快递',
          logistics_no: 'ST6666666666',
          ship_time: '2026-06-21 15:00:00',
          internal_remark: '',
          operation_records: [
            { time: '2026-06-21 10:20:12', action: '用户提交订单', operator: '王五' },
            { time: '2026-06-21 10:20:15', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-21 15:00:00', action: '商家发货', operator: '管理员' },
            { time: '2026-06-22 11:00:00', action: '用户签收', operator: '王五' },
          ],
        },
        {
          id: 1007,
          order_no: 'PO202606200007',
          create_time: '2026-06-20 17:30:44',
          uid: '100001',
          nickname: '张三',
          phone: '138****1234',
          avatar: 'https://picsum.photos/36/36?random=1',
          product_id: 'P007',
          product_name: '运动蓝牙耳机',
          product_image: 'https://picsum.photos/36/36?random=17',
          status: 'completed',
          quantity: 1,
          unit_integral: 250,
          total_integral: 250,
          before_integral: 500,
          deduct_integral: 250,
          after_integral: 250,
          receiver_name: '张三',
          receiver_phone: '13800138003',
          receiver_address: '四川省成都市锦江区春熙路',
          user_remark: '',
          logistics_company: '中通快递',
          logistics_no: 'ZT7777777777',
          ship_time: '2026-06-21 09:00:00',
          internal_remark: '',
          operation_records: [
            { time: '2026-06-20 17:30:44', action: '用户提交订单', operator: '张三' },
            { time: '2026-06-20 17:30:46', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-21 09:00:00', action: '商家发货', operator: '管理员' },
            { time: '2026-06-22 14:00:00', action: '用户签收', operator: '张三' },
          ],
        },
        {
          id: 1008,
          order_no: 'PO202606200008',
          create_time: '2026-06-20 15:15:28',
          uid: '100002',
          nickname: '李四',
          phone: '139****5678',
          avatar: 'https://picsum.photos/36/36?random=2',
          product_id: 'P008',
          product_name: '创意台灯',
          product_image: 'https://picsum.photos/36/36?random=18',
          status: 'canceling',
          quantity: 1,
          unit_integral: 300,
          total_integral: 300,
          before_integral: 600,
          deduct_integral: 300,
          after_integral: 300,
          receiver_name: '李四',
          receiver_phone: '13900139003',
          receiver_address: '江苏省南京市鼓楼区新街口',
          user_remark: '',
          logistics_company: '',
          logistics_no: '',
          ship_time: '',
          internal_remark: '',
          operation_records: [
            { time: '2026-06-20 15:15:28', action: '用户提交订单', operator: '李四' },
            { time: '2026-06-20 15:15:30', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-20 16:00:00', action: '用户申请取消', operator: '李四' },
          ],
        },
        {
          id: 1009,
          order_no: 'PO202606190009',
          create_time: '2026-06-19 09:05:11',
          uid: '100003',
          nickname: '王五',
          phone: '137****9012',
          avatar: 'https://picsum.photos/36/36?random=3',
          product_id: 'P009',
          product_name: '机械键盘',
          product_image: 'https://picsum.photos/36/36?random=19',
          status: 'canceled',
          quantity: 1,
          unit_integral: 1500,
          total_integral: 1500,
          before_integral: 2000,
          deduct_integral: 1500,
          after_integral: 2000,
          receiver_name: '王五',
          receiver_phone: '13700137003',
          receiver_address: '湖北省武汉市江汉区汉口',
          user_remark: '',
          logistics_company: '',
          logistics_no: '',
          ship_time: '',
          internal_remark: '已同意取消，积分已退回',
          operation_records: [
            { time: '2026-06-19 09:05:11', action: '用户提交订单', operator: '王五' },
            { time: '2026-06-19 09:05:15', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-19 09:30:00', action: '用户申请取消', operator: '王五' },
            { time: '2026-06-19 10:00:00', action: '商家同意取消', operator: '管理员' },
            { time: '2026-06-19 10:00:05', action: '系统退回积分', operator: '系统' },
          ],
        },
        {
          id: 1010,
          order_no: 'PO202606180010',
          create_time: '2026-06-18 14:30:00',
          uid: '100001',
          nickname: '张三',
          phone: '138****1234',
          avatar: 'https://picsum.photos/36/36?random=1',
          product_id: 'P010',
          product_name: '无线鼠标',
          product_image: 'https://picsum.photos/36/36?random=20',
          status: 'canceled',
          quantity: 1,
          unit_integral: 200,
          total_integral: 200,
          before_integral: 300,
          deduct_integral: 200,
          after_integral: 300,
          receiver_name: '张三',
          receiver_phone: '13800138004',
          receiver_address: '湖南省长沙市芙蓉区解放西路',
          user_remark: '',
          logistics_company: '',
          logistics_no: '',
          ship_time: '',
          internal_remark: '用户主动取消',
          operation_records: [
            { time: '2026-06-18 14:30:00', action: '用户提交订单', operator: '张三' },
            { time: '2026-06-18 14:30:05', action: '系统扣减积分', operator: '系统' },
            { time: '2026-06-18 14:45:00', action: '用户取消订单', operator: '张三' },
            { time: '2026-06-18 14:45:05', action: '系统退回积分', operator: '系统' },
          ],
        },
      ],
    };
  },
  created() {
    console.log('storeIntegralOrder created, calling getList');

    this.getList();
  },
  mounted() {
    console.log('storeIntegralOrder mounted');
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
    // 如果数据为空，再次尝试加载
    if (!this.tableList || this.tableList.length === 0) {
      console.log('mounted: tableList is empty, calling getList again');
      this.getList();
    }
  },
  activated() {
    // keep-alive 缓存激活时触发
    console.log('storeIntegralOrder activated');
    if (!this.tableList || this.tableList.length === 0) {
      this.getList();
    }
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
  watch: {
    // 监听路由变化，每次进入页面时重新加载数据
    '$route'(to, from) {
      console.log('storeIntegralOrder route changed', to.path);
      if (to.path.includes('/store_integral')) {
        this.getList();
      }
    },
  },
  methods: {
    getIntegralOrderUserOptions() {
      const map = new Map();
      this.mockData.forEach(item => {
        if (!map.has(item.uid)) {
          map.set(item.uid, {
            uid: item.uid,
            nickname: item.nickname,
            phone: item.phone,
            avatar: item.avatar,
          });
        }
      });
      return Array.from(map.values());
    },
    getIntegralOrderUserDisplay(uid) {
      const user = this.getIntegralOrderUserOptions().find(item => item.uid === uid);
      return user ? user.nickname + '（' + user.uid + '）' : '';
    },
    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
    },
    handleAnnotationSelect(annotation) {
      this.activeAnnotationId = annotation.id;
      const markerElements = document.querySelectorAll('.annotation-marker');
      markerElements.forEach(el => el.classList.remove('active'));
      const activeMarker = document.querySelector(`.annotation-marker[data-id="${annotation.id}"]`);
      if (activeMarker) activeMarker.classList.add('active');
    },
    handleToggleMarkers(visible) {
      this.showMarkers = visible;
    },
    getList() {
      this.loading = true;
      setTimeout(() => {
        try {
          // 应用筛选条件（不包括状态筛选，用于计算tab数量）
          let filteredDataForCount = [...this.mockData];

          // 订单搜索
          if (this.tableFrom.order_no) {
            if (this.field_key === 'order_no') {
              // 仅按订单号搜索
              filteredDataForCount = filteredDataForCount.filter(item => item.order_no.includes(this.tableFrom.order_no));
            } else if (this.field_key === 'product_name') {
              // 仅按商品名称搜索
              filteredDataForCount = filteredDataForCount.filter(item => item.product_name.includes(this.tableFrom.order_no));
            } else if (this.field_key === 'all') {
              // 全部：按订单号 OR 商品名称搜索（OR逻辑）
              filteredDataForCount = filteredDataForCount.filter(item => 
                item.order_no.includes(this.tableFrom.order_no) || 
                item.product_name.includes(this.tableFrom.order_no)
              );
            }
          }

          // 用户信息搜索
          if (this.tableFrom.user_info) {
            filteredDataForCount = filteredDataForCount.filter(item => 
              item.nickname.includes(this.tableFrom.user_info) || 
              item.uid.includes(this.tableFrom.user_info) ||
              item.phone.includes(this.tableFrom.user_info)
            );
          }

          // 时间筛选
          if (this.tableFrom.integral_time) {
            const dates = this.tableFrom.integral_time.split('-');
            if (dates.length === 2) {
              const startDate = new Date(dates[0]).getTime();
              const endDate = new Date(dates[1]).getTime();
              filteredDataForCount = filteredDataForCount.filter(item => {
                const orderDate = new Date(item.create_time).getTime();
                return orderDate >= startDate && orderDate <= endDate;
              });
            }
          }

          // 积分范围筛选
          if (this.tableFrom.integral_range[0] || this.tableFrom.integral_range[1]) {
            const min = this.tableFrom.integral_range[0] ? parseInt(this.tableFrom.integral_range[0]) : 0;
            const max = this.tableFrom.integral_range[1] ? parseInt(this.tableFrom.integral_range[1]) : Infinity;
            filteredDataForCount = filteredDataForCount.filter(item => item.total_integral >= min && item.total_integral <= max);
          }

          // 数量范围筛选
          if (this.tableFrom.quantity_range[0] || this.tableFrom.quantity_range[1]) {
            const min = this.tableFrom.quantity_range[0] ? parseInt(this.tableFrom.quantity_range[0]) : 0;
            const max = this.tableFrom.quantity_range[1] ? parseInt(this.tableFrom.quantity_range[1]) : Infinity;
            filteredDataForCount = filteredDataForCount.filter(item => item.quantity >= min && item.quantity <= max);
          }

          // 基于筛选后的数据计算状态计数
          this.headeNum.forEach(item => {
            if (item.type === 'all') {
              item.count = filteredDataForCount.length;
            } else {
              item.count = filteredDataForCount.filter(d => d.status === item.type).length;
            }
          });

          // 应用状态筛选
          if (this.tableFrom.status && this.tableFrom.status !== 'all') {
            filteredDataForCount = filteredDataForCount.filter(item => item.status === this.tableFrom.status);
          }

          const start = (this.tableFrom.page - 1) * this.tableFrom.limit;
          const end = start + this.tableFrom.limit;
          this.tableList = filteredDataForCount.slice(start, end);
          this.total = filteredDataForCount.length;
        } catch (error) {
          console.error('Error in getList:', error);
        } finally {
          this.loading = false;
        }
      }, 300);
    },

    onClickTab(tab) {
      // Element UI tab-click 事件传递的是 tab 实例，需要通过 tab.name 或 tab.paneName 获取
      const status = tab.name || (tab.pane && tab.pane.name) || 'all';
      console.log('onClickTab:', status);
      this.tableFrom.status = status;
      this.tableFrom.page = 1;
      this.getList();
    },

    onchangeTime(e) {
      this.timeVal = e;
      this.tableFrom.integral_time = this.timeVal ? this.timeVal.join('-') : '';
      this.tableFrom.page = 1;
      this.getList();
    },

    userSearchs() {
      this.ids = [];
      this.selectionList = [];
      this.tableFrom.page = 1;
      this.getList();
    },

    reset(name) {
      this.tableFrom = {
        order_no: '',
        user_info: '',
        integral_time: '',
        integral_range: ['', ''],
        quantity_range: ['', ''],
        status: 'all',
        page: 1,
        limit: 15,
      };
      this.field_key = 'all';
      this.timeVal = [];
      this.ids = [];
      this.selectionList = [];
      this.getList();
    },

    pageChange() {
      this.selectionList = [];
      this.getList();
    },

    handleSelectRow(selection, row) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.ids = ids;
      this.selectionList = selection;
    },

    handleSelectAll(selection) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.ids = ids;
      this.selectionList = selection;
    },

    getStatusText(status) {
      const statusMap = {
        pending: '待发货',
        shipped: '已发货',
        completed: '已完成',
        canceling: '取消中',
        canceled: '已取消',
      };
      return statusMap[status] || status;
    },

    getStatusTagType(status) {
      const typeMap = {
        pending: 'info',
        shipped: 'primary',
        completed: 'success',
        canceling: 'warning',
        canceled: 'danger',
      };
      return typeMap[status] || 'info';
    },

    copyOrderNo(orderNo) {
      this.$util.copyText(orderNo);
      this.$message.success('订单号已复制');
    },

    handleDetail(row) {
      this.currentOrder = row;
      this.activeName = 'detail';
      this.internalRemark = row.internal_remark || '';
      this.detailDrawerVisible = true;
    },

    openLogistics() {
      this.logisticsDrawerVisible = true;
    },

    saveRemark() {
      this.$message.success('备注保存成功');
    },

    handleShip() {
      this.$prompt('请输入物流公司名称', '发货', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '物流公司不能为空',
      })
        .then(({ value }) => {
          this.$message.success('发货成功');
          this.detailDrawerVisible = false;
          this.getList();
        })
        .catch(() => {
          this.$message.info('已取消操作');
        });
    },

    handleAgreeCancel() {
      this.$confirm('确定同意取消订单吗？积分将退回给用户。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$message.success('已同意取消订单，积分已退回');
          this.detailDrawerVisible = false;
          this.getList();
        })
        .catch(() => {
          this.$message.info('已取消操作');
        });
    },

    handleRejectCancel() {
      this.$confirm('确定驳回取消申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$message.success('已驳回取消申请');
          this.detailDrawerVisible = false;
          this.getList();
        })
        .catch(() => {
          this.$message.info('已取消操作');
        });
    },

    exportList() {
      this.$message.info('导出功能开发中');
    },
  },
};
</script>

<style scoped lang="scss">
.form_content_width {
  width: 200px;
}

.form_range_content_width {
  width: 80px;
}

.padding-add {
  padding: 20px;
}

.mt10 {
  margin-top: 10px;
}

.mt16 {
  margin-top: 16px;
}

.mt20 {
  margin-top: 20px;
}

.ml10 {
  margin-left: 10px;
}

.gary {
  color: #909399;
}

.price-color {
  color: #ff9900;
}

.font-weight {
  font-weight: 600;
}

.font12 {
  font-size: 12px;
}

.ivu-ml-8 {
  margin-left: 8px;
}

.ResetSearch {
  border: 1px solid #dcdfe6;
  color: #606266;
  margin-right: 10px;
}

.search-form {
  display: flex;
  justify-content: space-between;

  .search-form-box {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }
}

.search-form-sub {
  display: flex;
}

.userAlert {
  margin-top: 20px;
}

.userI {
  color: var(--prev-color-primary);
  font-style: normal;
}

.tabBox_img {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
  }
}

.line {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line1 {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.copy-btn {
  margin-left: 8px;
  padding: 0;
  color: var(--prev-color-primary);
}

// 详情抽屉样式
.head {
  padding: 0 30px 24px;
  border-bottom: 1px solid #ebeef5;

  .full {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .order_icon {
      width: 60px;
      height: 60px;
    }

    .text {
      align-self: center;
      flex: 1;
      min-width: 0;
      padding-left: 12px;
      font-size: 13px;
      color: #606266;

      .title {
        margin-bottom: 10px;
        font-weight: 500;
        font-size: 16px;
        line-height: 16px;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }

  .list {
    display: flex;
    overflow: hidden;
    list-style: none;
    padding: 0;
    margin: 0;

    .item {
      flex: none;
      width: 200px;
      font-size: 14px;
      line-height: 14px;
      color: rgba(0, 0, 0, 0.85);

      .title {
        margin-bottom: 12px;
        font-size: 13px;
        line-height: 13px;
        color: #666666;
      }
    }
  }
}

.section {
  padding: 25px 0;
  border-bottom: 1px dashed #eeeeee;

  .title {
    padding-left: 10px;
    border-left: 3px solid #1890ff;
    font-size: 15px;
    line-height: 15px;
    color: #303133;
    margin-bottom: 16px;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .item {
    flex: 0 0 calc(100% / 3);
    display: flex;
    font-size: 13px;
    color: #666666;
    margin-bottom: 12px;

    > div:first-child {
      width: 100px;
      flex-shrink: 0;
      text-align: right;
      padding-right: 10px;
    }

    .value {
      flex: 1;
      word-break: break-all;
    }
  }
}

.logistics-link {
  margin-left: 10px;
  color: #1890ff;
}

.fix_footer {
  position: fixed;
  bottom: 0;
  width: -webkit-fill-available;
  background: #fff;
  padding: 20px 0px;
  box-sizing: border-box;
  z-index: 100;
}

.logistics-info {
  padding: 20px;
}

.logistics-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;

  span {
    display: block;
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }
}

.logistics-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.logistics-status {
  font-size: 14px;
  color: #606266;

  &.current {
    color: #67c23a;
    font-weight: 500;
  }
}

::v-deep .el-tabs__item {
  height: 54px !important;
  line-height: 54px !important;
}

::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0 20px;
}

.integral-order-page {
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
</style>