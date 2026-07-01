<template>
  <div class="bag-management-new">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form" @submit.native.prevent>
        <el-form-item label="用户信息">
          <el-input :value="filterForm.userName" readonly placeholder="请选择" class="selector-input" @focus="openSelector('user')" @click.native="openSelector('user')">
            <el-button slot="append" icon="el-icon-search" @click.stop="openSelector('user')" />
          </el-input>
          <annotation-point
            title="【优化】用户信息筛选交互"
            content="优化前：用户信息使用普通输入或下拉选择，数据量较大时查找效率低，且容易只看到单一字段。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、UID、用户编号、手机号等信息检索，选择后回填筛选区。&#10;&#10;原因：用户数据量大，弹窗表格可以同时展示头像、昵称、编号等关键信息，降低误选并提升筛选效率。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="商户信息">
          <el-input :value="filterForm.merchantName" readonly placeholder="请选择商户" class="selector-input" @focus="openSelector('merchant')" @click.native="openSelector('merchant')">
            <el-button slot="append" icon="el-icon-search" @click.stop="openSelector('merchant')" />
          </el-input>
          <annotation-point
            title="【优化】商户信息筛选交互"
            content="优化前：商户信息使用下拉选择，商户数量较多时检索效率低。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开商户搜索弹窗，支持按商户名称、商户ID检索，选择后回填筛选区。&#10;&#10;原因：商户筛选需要同时确认头像、名称和ID，弹窗选择可以降低误选并提升运营查询效率。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="房间信息">
          <el-input :value="filterForm.roomName" readonly placeholder="请选择房间" class="selector-input" @focus="openSelector('room')" @click.native="openSelector('room')">
            <el-button slot="append" icon="el-icon-search" @click.stop="openSelector('room')" />
          </el-input>
          <annotation-point
            title="【优化】房间信息筛选交互"
            content="优化前：房间信息使用普通输入或下拉选择，房间数量较多时难以快速定位。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开房间选择弹窗，支持按房间号、房间名称等条件检索，选择后回填筛选区。&#10;&#10;原因：房间数据需要同时查看房间号、名称、分类和状态，弹窗表格更适合承载复杂信息。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="奖品信息">
          <el-input :value="filterForm.prizeName" readonly placeholder="请选择商品" class="selector-input" @focus="openSelector('prize')" @click.native="openSelector('prize')">
            <el-button slot="append" icon="el-icon-search" @click.stop="openSelector('prize')" />
          </el-input>
          <annotation-point
            title="【优化】奖品信息筛选交互"
            content="优化前：奖品使用普通输入或下拉选择，商品数量较多时难以确认具体奖品。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开奖品选择弹窗，支持按商品名称、关键字、商品ID等条件检索，选择后回填筛选区。&#10;&#10;原因：奖品筛选需要同时查看商品图、名称、分类和ID，弹窗表格更适合承载大量商品数据。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="filterForm.source" placeholder="请选择" clearable class="form-content-width">
            <el-option label="全部" value="" />
            <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="获得时间">
          <el-date-picker v-model="filterForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" class="date-range" />
        </el-form-item>
        <el-form-item class="filter-buttons">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="stat-cards">
      <div v-for="stat in statList" :key="stat.key" class="stat-card" :class="{ active: activeTab === stat.key }" @click="handleStatClick(stat.key)">
        <div class="stat-icon" :class="stat.key"><i :class="stat.icon" /></div>
        <div class="stat-content"><div class="stat-num">{{ statistics[stat.key] }}</div><div class="stat-label">{{ stat.label }}</div></div>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane v-for="tab in tabList" :key="tab.key" :name="tab.key">
          <span slot="label">{{ tab.label }} <span class="tab-count">({{ statistics[tab.key] }})</span></span>
        </el-tab-pane>
      </el-tabs>
      <div class="table-toolbar"><div><el-button @click="handleExport">导出</el-button><el-button type="primary" @click="showDispatchModal = true">添加</el-button></div><div class="toolbar-summary">共 {{ pagination.total }} 条</div></div>
      <el-table ref="table" v-loading="loading" :data="pagedList" border class="bag-table" empty-text="暂无数据">
        <el-table-column label="ID" prop="id" width="86" fixed="left" />
        <el-table-column label="用户信息" min-width="190" fixed="left">
          <template slot-scope="scope"><div class="user-cell"><el-avatar :size="36" :src="scope.row.userAvatar" class="user-avatar">{{ getInitial(scope.row.userName) }}</el-avatar><div class="cell-info"><div class="primary-text">{{ scope.row.userName }}</div><div class="sub-text">{{ scope.row.userNo }}</div></div></div></template>
        </el-table-column>
        <el-table-column label="奖品信息" min-width="250">
          <template slot-scope="scope"><div class="goods-cell"><img class="thumb-img" :src="scope.row.prizeImage || defaultImg" alt="" /><div class="cell-info"><div class="goods-name">{{ scope.row.prizeName }}</div><div class="sub-text">商品ID：{{ scope.row.productId }}</div><div class="sub-text">{{ scope.row.category }}</div></div></div></template>
        </el-table-column>
        <el-table-column label="房间信息" min-width="190">
          <template slot-scope="scope"><div v-if="scope.row.roomId" class="room-cell"><img class="thumb-img" :src="scope.row.roomImage || defaultImg" alt="" /><div class="cell-info"><div class="primary-text">{{ scope.row.roomName }}</div><div class="sub-text">房间号：{{ scope.row.roomNo }}</div></div></div><span v-else>-</span></template>
        </el-table-column>
        <el-table-column label="商户信息" min-width="190">
          <template slot-scope="scope"><div class="merchant-cell"><el-avatar :size="36" :src="scope.row.merchantAvatar" class="merchant-avatar">{{ getInitial(scope.row.merchantName) }}</el-avatar><div class="cell-info"><div class="primary-text">{{ scope.row.merchantName }}</div><div class="sub-text">商户ID：{{ scope.row.merchantId }}</div></div></div></template>
        </el-table-column>
        <el-table-column label="来源" width="110"><template slot-scope="scope">{{ getSourceText(scope.row.source) }}</template></el-table-column>
        <el-table-column label="状态" width="116"><template slot-scope="scope"><span :class="'status-tag status-' + scope.row.status">{{ getStatusText(scope.row.status) }}</span></template></el-table-column>
        <el-table-column label="已兑积分" width="110" align="right"><template slot-scope="scope"><span class="points-text" :class="{ empty: !hasExchangedPoints(scope.row) }">{{ getExchangedPoints(scope.row) }}</span></template></el-table-column>
        <el-table-column label="时间" min-width="190"><template slot-scope="scope"><div>获得：{{ scope.row.obtainTime }}</div><div class="sub-text">兑换：{{ scope.row.exchangeTime || '-' }}</div><div class="sub-text">过期：{{ scope.row.expireTime || '-' }}</div></template></el-table-column>
        <el-table-column label="操作" fixed="right" width="190">
          <template slot-scope="scope">
            <a @click="showDetail(scope.row)" class="action-link">详情</a>
            <template v-if="scope.row.status === 'apply_shipping' && canViewShippingOrder(scope.row)">
              <el-divider direction="vertical" />
              <a @click="viewShippingOrder(scope.row)" class="action-link">查看发货单</a>
            </template>
            <template v-else-if="scope.row.status === 'apply_shipping'">
              <el-divider direction="vertical" />
              <a @click="openRejectDialog(scope.row)" class="action-link danger-link">驳回</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper"><pagination v-if="pagination.total" :total="pagination.total" :page.sync="pagination.page" :limit.sync="pagination.limit" @pagination="getList" /></div>
    </el-card>
    <el-drawer title="背包详情" :visible.sync="detailDrawerVisible" direction="rtl" size="820px" :wrapper-closable="true" custom-class="bag-detail-drawer">
      <div v-if="detailData" class="detail-container">
        <div class="detail-summary">
          <div>
            <div class="detail-id">背包ID：{{ detailData.id }}</div>
            <div class="detail-title">{{ detailData.prizeName }}</div>
          </div>
          <div class="detail-summary-right">
            <span :class="'status-tag status-' + detailData.status">{{ getStatusText(detailData.status) }}</span>
            <div class="points-info">已兑积分：{{ getExchangedPoints(detailData) }}</div>
          </div>
        </div>

        <div class="section-title">主体信息</div>
        <div class="detail-card-row">
          <div class="detail-person-card">
            <el-avatar :size="44" :src="detailData.userAvatar" class="user-avatar">{{ getInitial(detailData.userName) }}</el-avatar>
            <div>
              <div class="primary-text">{{ detailData.userName }}</div>
              <div class="sub-text">{{ detailData.userNo }} / UID：{{ detailData.uid }}</div>
              <div class="sub-text">{{ detailData.phone }}</div>
            </div>
          </div>
          <div class="detail-person-card">
            <el-avatar :size="44" :src="detailData.merchantAvatar" class="merchant-avatar">{{ getInitial(detailData.merchantName) }}</el-avatar>
            <div>
              <div class="primary-text">{{ detailData.merchantName }}</div>
              <div class="sub-text">商户ID：{{ detailData.merchantId }}</div>
            </div>
          </div>
        </div>

        <div class="section-title">奖品与房间</div>
        <el-descriptions :column="2" border size="small" class="detail-descriptions">
          <el-descriptions-item label="奖品名称">{{ detailData.prizeName }}</el-descriptions-item>
          <el-descriptions-item label="商品ID">{{ detailData.productId }}</el-descriptions-item>
          <el-descriptions-item label="商品分类">{{ detailData.category }}</el-descriptions-item>
          <el-descriptions-item label="房间信息"><span v-if="detailData.roomId">{{ detailData.roomName }}（{{ detailData.roomNo }}）</span><span v-else>-</span></el-descriptions-item>
        </el-descriptions>

        <div class="section-title">来源与状态</div>
        <el-descriptions :column="2" border size="small" class="detail-descriptions">
          <el-descriptions-item label="来源类型">{{ getSourceText(detailData.source) }}</el-descriptions-item>
          <el-descriptions-item label="来源单号">{{ detailData.sourceNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="派奖原因">{{ detailData.dispatchReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">{{ getStatusText(detailData.status) }}</el-descriptions-item>
          <el-descriptions-item label="获得时间">{{ detailData.obtainTime }}</el-descriptions-item>
          <el-descriptions-item label="兑换时间">{{ detailData.exchangeTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="过期时间">{{ detailData.expireTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="已兑积分">{{ getExchangedPoints(detailData) }}</el-descriptions-item>
          <el-descriptions-item v-if="detailData.rejectReason" label="驳回原因" :span="2">{{ detailData.rejectReason }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title" v-if="hasShippingInfo(detailData)">发货履约</div>
        <el-descriptions v-if="hasShippingInfo(detailData)" :column="2" border size="small" class="detail-descriptions detail-section-card">
          <el-descriptions-item label="申请时间">{{ detailData.shippingApplyTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发货状态">{{ getShippingStatusText(detailData.shippingStatus) }}</el-descriptions-item>
          <el-descriptions-item label="发货单号">{{ detailData.shippingOrderNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ detailData.shippedTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="物流公司">{{ detailData.logisticsCompany || '-' }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ detailData.trackingNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="收货信息" :span="2">{{ detailData.receiverInfo || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title" v-if="hasGiftInfo(detailData)">赠送信息</div>
        <div v-if="hasGiftInfo(detailData)" class="gift-flow-card detail-section-card">
          <el-descriptions :column="2" border size="small" class="detail-descriptions compact-descriptions">
            <el-descriptions-item label="受赠人信息">
              <div class="gift-recipient-info">
                <el-avatar :size="34" :src="detailData.giftToAvatar" class="user-avatar">{{ getInitial(detailData.giftToName) }}</el-avatar>
                <span>{{ getGiftTargetText(detailData) }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="赠送时间">{{ detailData.giftTime || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="section-title">操作记录</div>
        <el-timeline class="operation-timeline"><el-timeline-item v-for="record in detailData.operationRecords" :key="record.time + record.description" :timestamp="record.time">{{ record.description }}</el-timeline-item></el-timeline>
      </div>
    </el-drawer>

    <el-dialog title="驳回发货申请" :visible.sync="rejectDialogVisible" width="460px" @closed="resetRejectForm">
      <el-form :model="rejectForm" label-width="86px"><el-form-item label="驳回原因" required><el-input v-model="rejectForm.reason" type="textarea" :rows="4" maxlength="120" show-word-limit placeholder="请输入驳回原因" /></el-form-item></el-form>
      <div slot="footer" class="dialog-footer"><el-button @click="rejectDialogVisible = false">取消</el-button><el-button type="primary" @click="submitReject">确认驳回</el-button></div>
    </el-dialog>

    <el-dialog title="派发奖品" :visible.sync="showDispatchModal" width="520px" @closed="resetDispatchForm">
      <el-form :model="dispatchForm" label-width="90px">
        <el-form-item label="用户" required><div class="select-btn" @click="selectUser">{{ dispatchForm.userName ? '已选择用户：' + dispatchForm.userName : '+ 选择用户' }}</div></el-form-item>
        <el-form-item label="商户" required><div class="select-btn" @click="selectMerchant">{{ dispatchForm.merchantName ? '已选择商户：' + dispatchForm.merchantName : '+ 选择商户' }}</div></el-form-item>
        <el-form-item label="房间" :required="isRoomRequired"><div class="select-btn" @click="selectRoom">{{ dispatchForm.roomName ? '已选择房间：' + dispatchForm.roomName : '+ 选择房间' }}</div><span v-if="!isRoomRequired" class="optional-tip">房间根据派发原因决定是否必填</span></el-form-item>
        <el-form-item label="奖品" required><div class="select-btn" @click="selectPrize">{{ dispatchForm.prizeName ? '已选择奖品：' + dispatchForm.prizeName : '+ 选择奖品' }}</div></el-form-item>
        <el-form-item label="派发原因" required><el-select v-model="dispatchForm.reason" placeholder="请选择派发原因" class="full-width"><el-option label="客服补偿" value="客服补偿" /><el-option label="活动奖励" value="活动奖励" /><el-option label="人工补发" value="人工补发" /><el-option label="测试派发" value="测试派发" /></el-select></el-form-item>
      </el-form>
      <div slot="footer"><el-button @click="showDispatchModal = false">取消</el-button><el-button type="primary" @click="submitDispatch">确定</el-button></div>
    </el-dialog>

    <el-dialog :title="getSelectorTitle()" :visible.sync="selectorVisible" width="980px" custom-class="selector-dialog" @closed="resetSelectorState">
      <div class="selector-query" v-if="selectorType === 'user'">
        <span class="query-label">用户搜索</span>
        <el-select v-model="selectorFilters.userField" class="query-select" placeholder="请选择">
          <el-option label="全部" value="all" />
          <el-option label="用户编号" value="userNo" />
          <el-option label="昵称" value="name" />
          <el-option label="手机号" value="phone" />
        </el-select>
        <el-input v-model="selectorKeyword" class="query-input" placeholder="请输入" clearable />
        <span class="query-spacer"></span>
        <el-button @click="resetSelectorSearch">重置</el-button>
        <el-button type="primary" @click="querySelector">查询</el-button>
      </div>
      <div class="selector-query" v-else-if="selectorType === 'room'">
        <span class="query-label">房间号</span>
        <el-input v-model="selectorFilters.roomNo" class="query-input" placeholder="请输入房间号" clearable />
        <span class="query-label">房间名称</span>
        <el-input v-model="selectorKeyword" class="query-input" placeholder="请输入房间名称" clearable />
        <span class="query-label">玩法分类</span>
        <el-select v-model="selectorFilters.playType" class="query-select" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option label="玩法台" value="玩法台" />
          <el-option label="快闪" value="快闪" />
        </el-select>
        <span class="query-label">房间状态</span>
        <el-select v-model="selectorFilters.roomStatus" class="query-select" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option label="开启" value="开启" />
          <el-option label="关闭" value="关闭" />
        </el-select>
        <span class="query-spacer"></span>
        <el-button @click="resetSelectorSearch">重置</el-button>
        <el-button type="primary" @click="querySelector">查询</el-button>
      </div>
      <div class="selector-query" v-else-if="selectorType === 'prize'">
        <span class="query-label">商品分类</span>
        <el-select v-model="selectorFilters.category" class="query-select" placeholder="请选择" clearable>
          <el-option label="全部" value="" />
          <el-option label="潮玩周边" value="潮玩周边" />
          <el-option label="数码生活" value="数码生活" />
          <el-option label="盲盒" value="盲盒" />
        </el-select>
        <span class="query-label">来源</span>
        <el-select v-model="selectorFilters.productSource" class="query-select" placeholder="请选择" clearable>
          <el-option label="全部" value="" />
          <el-option label="自营" value="自营" />
          <el-option label="旗舰" value="旗舰" />
        </el-select>
        <span class="query-label">商品搜索</span>
        <el-input v-model="selectorKeyword" class="query-input" placeholder="请输入商品名称/关键字/ID" clearable />
        <span class="query-spacer"></span>
        <el-button @click="resetSelectorSearch">重置</el-button>
        <el-button type="primary" @click="querySelector">查询</el-button>
      </div>
      <div class="selector-query" v-else>
        <span class="query-label">商户搜索</span>
        <el-input v-model="selectorKeyword" class="query-input" placeholder="请输入商户名称/ID" clearable />
        <span class="query-spacer"></span>
        <el-button @click="resetSelectorSearch">重置</el-button>
        <el-button type="primary" @click="querySelector">查询</el-button>
      </div>

      <el-table :data="getSelectorRows()" height="430" class="selector-table">
        <el-table-column width="48" align="center">
          <template slot-scope="scope"><el-radio v-model="selectorSelectedValue" :label="scope.row.value"><span></span></el-radio></template>
        </el-table-column>
        <template v-if="selectorType === 'user'">
          <el-table-column label="ID" width="90" prop="uid" />
          <el-table-column label="用户编号" width="140" prop="userNo" />
          <el-table-column label="头像" width="90"><template slot-scope="scope"><el-avatar :size="34" :src="scope.row.avatar">{{ getInitial(scope.row.label) }}</el-avatar></template></el-table-column>
          <el-table-column label="昵称" min-width="180" prop="label" />
          <el-table-column label="手机号" width="160" prop="phone" />
          <el-table-column label="注册时间" width="180" prop="createdAt" />
        </template>
        <template v-else-if="selectorType === 'room'">
          <el-table-column label="房间ID" width="110" prop="id" />
          <el-table-column label="房间号" width="130" prop="no" />
          <el-table-column label="房间名称" min-width="180" prop="label" />
          <el-table-column label="房间分类" width="150" prop="category" />
          <el-table-column label="玩法分类" width="150" prop="playType" />
          <el-table-column label="房间状态" width="130"><template slot-scope="scope"><el-tag size="mini" type="success">{{ scope.row.status }}</el-tag></template></el-table-column>
        </template>
        <template v-else-if="selectorType === 'prize'">
          <el-table-column label="商品ID" width="120" prop="value" />
          <el-table-column label="商品图" width="100"><template slot-scope="scope"><img class="selector-product-img" :src="scope.row.image || defaultImg" alt="" /></template></el-table-column>
          <el-table-column label="商品名称" min-width="260" prop="label" />
          <el-table-column label="商品售价" width="130" prop="price" />
          <el-table-column label="来源" width="120" prop="source" />
        </template>
        <template v-else>
          <el-table-column label="商户ID" width="140" prop="value" />
          <el-table-column label="头像" width="90"><template slot-scope="scope"><el-avatar :size="34" :src="scope.row.avatar">{{ getInitial(scope.row.label) }}</el-avatar></template></el-table-column>
          <el-table-column label="商户名称" min-width="220" prop="label" />
          <el-table-column label="状态" width="120"><template><el-tag size="mini" type="success">正常</el-tag></template></el-table-column>
        </template>
      </el-table>
      <div slot="footer" class="selector-footer">
        <span class="selector-total">共 {{ getSelectorRows().length }} 条</span>
        <el-select v-model="selectorPageSize" class="selector-page-size"><el-option label="10条/页" :value="10" /></el-select>
        <el-pagination small layout="prev, pager, next" :page-size="selectorPageSize" :total="getSelectorRows().length" :current-page.sync="selectorPage" />
        <span class="selector-jump">前往</span>
        <el-input v-model="selectorPage" class="selector-page-input" />
        <span>页</span>
        <el-button @click="selectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelector">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';
const avatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
const statusOptions = [
  { value: 'stored', label: '寄存中' },
  { value: 'apply_shipping', label: '已申请发货' },
  { value: 'exchanged', label: '已兑换积分' },
  { value: 'expired_exchange', label: '过期兑换' },
  { value: 'arrived', label: '已加入账户' },
  { value: 'gifted', label: '已赠送' },
];
const sourceOptions = [{ value: 'system', label: '系统发放' }, { value: 'points', label: '积分兑换' }];
const userOptions = [
  { value: 'USR-73001', uid: 71001, label: '雾眠', userNo: 'USR-73001', code: 'USR-73001', phone: '139****4201', createdAt: '2026-06-05 17:59:21', avatar },
  { value: 'USR-73002', uid: 71002, label: '山栀', userNo: 'USR-73002', code: 'USR-73002', phone: '138****7712', createdAt: '2026-06-06 10:31:08', avatar },
  { value: 'USR-73003', uid: 71003, label: '鲸落', userNo: 'USR-73003', code: 'USR-73003', phone: '137****6050', createdAt: '2026-06-07 12:09:44', avatar },
  { value: 'USR-73004', uid: 71004, label: '白露', userNo: 'USR-73004', code: 'USR-73004', phone: '136****8820', createdAt: '2026-06-08 15:20:18', avatar },
  { value: 'USR-73005', uid: 71005, label: '青岚', userNo: 'USR-73005', code: 'USR-73005', phone: '135****3391', createdAt: '2026-06-09 09:45:12', avatar },
];
const merchantOptions = [
  { value: 'm301', label: '云舟潮玩馆', avatar },
  { value: 'm302', label: '拾光积分铺', avatar },
  { value: 'm303', label: '北辰活动中心', avatar },
  { value: 'm304', label: '蓝盒补偿专营', avatar },
];
const roomOptions = [
  { value: 'r-sky-01', id: '201', label: '星空转盘房', no: 'R-SKY-01', category: '-', playType: '玩法台', status: '开启', image: '' },
  { value: 'r-luck-09', id: '202', label: '九号幸运屋', no: 'R-LUCK-09', category: '-', playType: '玩法台', status: '开启', image: '' },
  { value: 'r-tech-18', id: '203', label: '十八号体验台', no: 'R-TECH-18', category: '-', playType: '玩法台', status: '开启', image: '' },
  { value: 'r-pop-26', id: '204', label: '潮玩快闪间', no: 'R-POP-26', category: '-', playType: '快闪', status: '开启', image: '' },
];
const prizeOptions = [
  { value: 'sku-901', label: '草莓熊夜灯', code: 'sku-901', price: '129.00', source: '自营', category: '潮玩周边', image: '' },
  { value: 'sku-902', label: '星球杯盲盒套装', code: 'sku-902', price: '199.00', source: '旗舰', category: '盲盒', image: '' },
  { value: 'sku-903', label: '蓝牙复古音箱', code: 'sku-903', price: '399.00', source: '自营', category: '数码生活', image: '' },
  { value: 'sku-904', label: '限定徽章礼盒', code: 'sku-904', price: '69.00', source: '旗舰', category: '潮玩周边', image: '' },
  { value: 'sku-905', label: '迷你积木花束', code: 'sku-905', price: '89.00', source: '自营', category: '潮玩周边', image: '' },
];
const mockBagRows = [
  {
    "id": 93018,
    "uid": 71001,
    "userNo": "USR-73001",
    "userName": "雾眠",
    "phone": "139****4201",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m301",
    "merchantName": "云舟潮玩馆",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "r-sky-01",
    "roomName": "星空转盘房",
    "roomNo": "R-SKY-01",
    "roomImage": "",
    "prizeName": "草莓熊夜灯",
    "productId": "sku-901",
    "prizeImage": "",
    "category": "潮玩周边/灯具",
    "status": "stored",
    "source": "system",
    "sourceNo": "抓取记录ID：GRAB-873901",
    "exchangePoints": 0,
    "obtainTime": "2026-06-29 10:12:31",
    "exchangeTime": "",
    "expireTime": "2026-08-13 10:12:31",
    "dispatchReason": "活动奖励",
    "operationRecords": [
      {
        "time": "2026-06-29 10:12:31",
        "description": "系统发放奖品，进入背包寄存"
      }
    ]
  },
  {
    "id": 93017,
    "uid": 71002,
    "userNo": "USR-73002",
    "userName": "山栀",
    "phone": "138****7712",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m302",
    "merchantName": "拾光积分铺",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "",
    "roomName": "",
    "roomNo": "",
    "roomImage": "",
    "prizeName": "迷你积木花束",
    "productId": "sku-905",
    "prizeImage": "",
    "category": "潮玩周边/积木",
    "status": "stored",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606290017",
    "exchangePoints": 0,
    "obtainTime": "2026-06-29 09:40:18",
    "exchangeTime": "",
    "expireTime": "2026-07-29 09:40:18",
    "dispatchReason": "",
    "operationRecords": [
      {
        "time": "2026-06-29 09:40:18",
        "description": "用户通过积分兑换获得商品"
      }
    ]
  },
  {
    "id": 93016,
    "uid": 71003,
    "userNo": "USR-73003",
    "userName": "鲸落",
    "phone": "137****6050",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m301",
    "merchantName": "云舟潮玩馆",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "r-luck-09",
    "roomName": "九号幸运屋",
    "roomNo": "R-LUCK-09",
    "roomImage": "",
    "prizeName": "星球杯盲盒套装",
    "productId": "sku-902",
    "prizeImage": "",
    "category": "盲盒/套装",
    "status": "apply_shipping",
    "source": "system",
    "sourceNo": "抽奖记录：LOT-202606290901",
    "exchangePoints": 0,
    "obtainTime": "2026-06-28 20:05:11",
    "exchangeTime": "",
    "expireTime": "2026-08-12 20:05:11",
    "shippingApplyTime": "2026-06-29 08:30:00",
    "shippingOrderNo": "",
    "shippingAuditStatus": "pending",
    "receiverInfo": "周鲸 13700006050 上海市徐汇区漕溪北路66号",
    "dispatchReason": "测试派发",
    "operationRecords": [
      {
        "time": "2026-06-28 20:05:11",
        "description": "系统发放实物奖品"
      },
      {
        "time": "2026-06-29 08:30:00",
        "description": "用户申请发货"
      }
    ]
  },
  {
    "id": 93015,
    "uid": 71004,
    "userNo": "USR-73004",
    "userName": "白露",
    "phone": "136****8820",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m303",
    "merchantName": "北辰活动中心",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "r-tech-18",
    "roomName": "十八号体验台",
    "roomNo": "R-TECH-18",
    "roomImage": "",
    "prizeName": "蓝牙复古音箱",
    "productId": "sku-903",
    "prizeImage": "",
    "category": "数码生活/音箱",
    "status": "apply_shipping",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606280315",
    "exchangePoints": 0,
    "obtainTime": "2026-06-28 13:55:45",
    "exchangeTime": "",
    "expireTime": "2026-08-12 13:55:45",
    "shippingApplyTime": "2026-06-28 15:18:20",
    "shippingOrderNo": "FH202606280315",
    "shippingAuditStatus": "approved",
    "shippingStatus": "shipped",
    "shippedTime": "2026-06-28 17:42:36",
    "logisticsCompany": "顺丰速运",
    "trackingNo": "SF134928765001",
    "receiverInfo": "林白露 13600008820 广东省广州市天河区体育西路88号",
    "dispatchReason": "",
    "operationRecords": [
      {
        "time": "2026-06-28 13:55:45",
        "description": "积分兑换获得实物奖品"
      },
      {
        "time": "2026-06-28 15:18:20",
        "description": "用户申请发货"
      }
    ]
  },
  {
    "id": 93014,
    "uid": 71005,
    "userNo": "USR-73005",
    "userName": "青岚",
    "phone": "135****3391",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m302",
    "merchantName": "拾光积分铺",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "r-pop-26",
    "roomName": "潮玩快闪间",
    "roomNo": "R-POP-26",
    "roomImage": "",
    "prizeName": "草莓熊夜灯",
    "productId": "sku-901",
    "prizeImage": "",
    "category": "潮玩周边/灯具",
    "status": "exchanged",
    "source": "system",
    "sourceNo": "口令记录：CODE-QL260",
    "exchangePoints": 260,
    "obtainTime": "2026-06-27 18:22:09",
    "exchangeTime": "2026-06-27 18:30:00",
    "expireTime": "",
    "dispatchReason": "客服补偿",
    "operationRecords": [
      {
        "time": "2026-06-27 18:22:09",
        "description": "系统发放商品奖品"
      },
      {
        "time": "2026-06-27 18:30:00",
        "description": "用户兑换为已兑积分"
      }
    ]
  },
  {
    "id": 93013,
    "uid": 71006,
    "userNo": "USR-73006",
    "userName": "小满",
    "phone": "134****1108",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m302",
    "merchantName": "拾光积分铺",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "",
    "roomName": "",
    "roomNo": "",
    "roomImage": "",
    "prizeName": "星球杯盲盒套装",
    "productId": "sku-902",
    "prizeImage": "",
    "category": "盲盒/套装",
    "status": "exchanged",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606270520",
    "exchangePoints": 520,
    "obtainTime": "2026-06-27 09:16:34",
    "exchangeTime": "2026-06-27 09:22:10",
    "expireTime": "",
    "dispatchReason": "",
    "operationRecords": [
      {
        "time": "2026-06-27 09:16:34",
        "description": "积分兑换获得商品"
      },
      {
        "time": "2026-06-27 09:22:10",
        "description": "用户兑换为已兑积分"
      }
    ]
  },
  {
    "id": 93012,
    "uid": 71007,
    "userNo": "USR-73007",
    "userName": "叶舟",
    "phone": "133****7120",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m304",
    "merchantName": "蓝盒补偿专营",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "r-sky-01",
    "roomName": "星空转盘房",
    "roomNo": "R-SKY-01",
    "roomImage": "",
    "prizeName": "蓝牙复古音箱",
    "productId": "sku-903",
    "prizeImage": "",
    "category": "数码生活/音箱",
    "status": "expired_exchange",
    "source": "system",
    "sourceNo": "抓取记录ID：GRAB-873012",
    "exchangePoints": 130,
    "obtainTime": "2026-06-20 11:08:22",
    "exchangeTime": "2026-06-25 11:08:22",
    "expireTime": "2026-06-25 11:08:22",
    "dispatchReason": "人工补发",
    "operationRecords": [
      {
        "time": "2026-06-20 11:08:22",
        "description": "系统发放商品奖品"
      },
      {
        "time": "2026-06-25 11:08:22",
        "description": "过期后自动转为已兑积分"
      }
    ]
  },
  {
    "id": 93011,
    "uid": 71008,
    "userNo": "USR-73008",
    "userName": "南乔",
    "phone": "132****6655",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m302",
    "merchantName": "拾光积分铺",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "",
    "roomName": "",
    "roomNo": "",
    "roomImage": "",
    "prizeName": "限定徽章礼盒",
    "productId": "sku-904",
    "prizeImage": "",
    "category": "周边配件/徽章",
    "status": "arrived",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606260070",
    "exchangePoints": 0,
    "obtainTime": "2026-06-26 16:45:30",
    "exchangeTime": "2026-06-26 16:48:00",
    "expireTime": "",
    "dispatchReason": "",
    "operationRecords": [
      {
        "time": "2026-06-26 16:45:30",
        "description": "积分兑换获得商品"
      },
      {
        "time": "2026-06-26 16:48:00",
        "description": "已兑积分加入账户"
      }
    ]
  },
  {
    "id": 93010,
    "uid": 71009,
    "userNo": "USR-73009",
    "userName": "折竹",
    "phone": "131****9088",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m303",
    "merchantName": "北辰活动中心",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "r-tech-18",
    "roomName": "十八号体验台",
    "roomNo": "R-TECH-18",
    "roomImage": "",
    "prizeName": "限定徽章礼盒",
    "productId": "sku-904",
    "prizeImage": "",
    "category": "周边配件/徽章",
    "status": "gifted",
    "giftTime": "2026-06-25 15:00:00",
    "giftToUid": 72019,
    "giftToUserNo": "USR-82019",
    "giftToName": "晴川",
    "giftToPhone": "158****2190",
    "giftMessage": "生日礼物转赠",
    "source": "system",
    "sourceNo": "抽奖记录：LOT-202606250418",
    "exchangePoints": 0,
    "obtainTime": "2026-06-25 14:18:00",
    "exchangeTime": "",
    "expireTime": "2026-08-09 14:18:00",
    "dispatchReason": "活动奖励",
    "operationRecords": [
      {
        "time": "2026-06-25 14:18:00",
        "description": "系统发放奖品"
      },
      {
        "time": "2026-06-25 15:00:00",
        "description": "用户赠送给好友"
      }
    ]
  },
  {
    "id": 93009,
    "uid": 71010,
    "userNo": "USR-73010",
    "userName": "月见",
    "phone": "130****2468",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "merchantId": "m301",
    "merchantName": "云舟潮玩馆",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomId": "r-pop-26",
    "roomName": "潮玩快闪间",
    "roomNo": "R-POP-26",
    "roomImage": "",
    "prizeName": "迷你积木花束",
    "productId": "sku-905",
    "prizeImage": "",
    "category": "积木/摆件",
    "status": "stored",
    "source": "points",
    "sourceNo": "口令记录：CODE-BLOCK88",
    "exchangePoints": 0,
    "obtainTime": "2026-06-24 12:40:26",
    "exchangeTime": "",
    "expireTime": "2026-08-08 12:40:26",
    "dispatchReason": "",
    "operationRecords": [
      {
        "time": "2026-06-24 12:40:26",
        "description": "积分兑换获得实物奖品"
      }
    ]
  }
];
export default {
  name: 'BagManagementNew',
  components: { AnnotationPoint },
  data() {
    return {
      defaultImg: require('@/assets/images/noPictrue.png'),
      statusOptions,
      sourceOptions,
      userOptions,
      merchantOptions,
      roomOptions,
      prizeOptions,
      loading: false,
      activeTab: 'all',
      filteredList: [],
      detailDrawerVisible: false,
      detailData: null,
      rejectDialogVisible: false,
      rejectTarget: null,
      rejectForm: { reason: '' },
      selectorVisible: false,
      selectorType: 'user',
      selectorKeyword: '',
      selectorSelectedValue: '',
      selectorPage: 1,
      selectorPageSize: 10,
      selectorFilters: { userField: 'all', roomNo: '', playType: '', roomStatus: '', category: '', productSource: '' },
      showDispatchModal: false,
      dispatchForm: { userId: '', userName: '', merchantId: '', merchantName: '', roomId: '', roomName: '', prizeId: '', prizeName: '', reason: '' },
      filterForm: { keywordType: 'all', keyword: '', userId: '', userName: '', merchantId: '', merchantName: '', roomId: '', roomName: '', prizeId: '', prizeName: '', source: '', dateRange: [] },
      pagination: { page: 1, limit: 10, total: 0 },
      statistics: { all: 0, stored: 0, apply_shipping: 0, exchanged: 0, expired_exchange: 0, arrived: 0, gifted: 0 },
      tabList: [{ key: 'all', label: '全部' }].concat(statusOptions.map(item => ({ key: item.value, label: item.label }))),
      statList: [
        { key: 'all', label: '全部', icon: 'el-icon-shopping-cart-full' },
        { key: 'stored', label: '寄存中', icon: 'el-icon-box' },
        { key: 'apply_shipping', label: '已申请发货', icon: 'el-icon-truck' },
        { key: 'exchanged', label: '已兑换积分', icon: 'el-icon-coin' },
        { key: 'expired_exchange', label: '过期兑换', icon: 'el-icon-warning' },
        { key: 'arrived', label: '已加入账户', icon: 'el-icon-circle-check' },
        { key: 'gifted', label: '已赠送', icon: 'el-icon-present' },
      ],
      allData: this.createMockData(),
    };
  },
  computed: {
    pagedList() {
      const start = (this.pagination.page - 1) * this.pagination.limit;
      return this.filteredList.slice(start, start + this.pagination.limit);
    },
    isRoomRequired() {
      return ['活动奖励', '人工补发'].includes(this.dispatchForm.reason);
    },
  },
  mounted() { this.getList(); },
  methods: {
    createMockData() { return mockBagRows.map(row => ({ ...row, operationRecords: [...row.operationRecords] })); },
    getList() {
      this.loading = true;
      window.setTimeout(() => {
        this.filteredList = this.filterData();
        this.pagination.total = this.filteredList.length;
        this.initStatistics();
        this.loading = false;
      }, 180);
    },
    filterData() {
      return this.allData.filter(item => {
        const keyword = this.filterForm.keyword.trim().toLowerCase();
        return (!keyword || this.matchKeyword(item, keyword)) &&
          (this.activeTab === 'all' || item.status === this.activeTab) &&
          (!this.filterForm.userId || item.userNo === this.filterForm.userId) &&
          (!this.filterForm.source || item.source === this.filterForm.source) &&
          (!this.filterForm.merchantId || item.merchantId === this.filterForm.merchantId) &&
          (!this.filterForm.roomId || item.roomId === this.filterForm.roomId) &&
          (!this.filterForm.prizeId || item.productId === this.filterForm.prizeId) &&
          this.matchDateRange(item.obtainTime);
      });
    },
    matchKeyword(item, keyword) {
      const values = { uid: item.uid, userName: item.userName, userNo: item.userNo, phone: item.phone };
      if (this.filterForm.keywordType === 'all') return Object.values(values).some(value => String(value).toLowerCase().includes(keyword));
      return String(values[this.filterForm.keywordType] || '').toLowerCase().includes(keyword);
    },
    matchDateRange(time) {
      const range = this.filterForm.dateRange || [];
      if (!range.length) return true;
      const date = time.slice(0, 10);
      return date >= range[0] && date <= range[1];
    },
    initStatistics() {
      this.statistics = { all: this.allData.length, stored: 0, apply_shipping: 0, exchanged: 0, expired_exchange: 0, arrived: 0, gifted: 0 };
      this.allData.forEach(item => { if (this.statistics[item.status] !== undefined) this.statistics[item.status] += 1; });
    },
    handleTabChange() { this.pagination.page = 1; this.getList(); },
    handleStatClick(key) { this.activeTab = key; this.handleTabChange(); },
    handleSearch() { this.pagination.page = 1; this.getList(); },
    handleReset() { this.filterForm = { keywordType: 'all', keyword: '', userId: '', userName: '', merchantId: '', merchantName: '', roomId: '', roomName: '', prizeId: '', prizeName: '', source: '', dateRange: [] }; this.activeTab = 'all'; this.pagination.page = 1; this.getList(); },
    showDetail(row) { this.detailData = { ...row, operationRecords: [...row.operationRecords] }; this.detailDrawerVisible = true; },
    canViewShippingOrder(row) { return ['shipped', 'delivered'].includes(row.shippingStatus) || !!row.trackingNo || !!row.shippedTime || !!row.logisticsCompany; },
    hasShippingInfo(row) { return !!(row.shippingApplyTime || row.shippingOrderNo || row.logisticsCompany || row.trackingNo || row.shippedTime || row.receiverInfo); },
    hasGiftInfo(row) { return row.status === 'gifted' || !!row.giftTime || !!row.giftToUid || !!row.giftToUserNo; },
    getGiftTargetText(row) {
      const name = row.giftToName || '-';
      const no = row.giftToUserNo || '-';
      const uid = row.giftToUid || '-';
      return `${name}（${no} / UID：${uid}）`;
    },
    viewShippingOrder(row) { this.$message.info(`查看发货单：${row.shippingOrderNo || '-'}`); },
    openSelector(type) {
      this.selectorType = type;
      this.selectorKeyword = '';
      this.selectorSelectedValue = ({ user: this.filterForm.userId, merchant: this.filterForm.merchantId, room: this.filterForm.roomId, prize: this.filterForm.prizeId })[type] || '';
      this.selectorPage = 1;
      this.selectorVisible = true;
    },
    getSelectorTitle() { return ({ user: '选择用户', merchant: '选择商户', room: '选择房间', prize: '选择奖品' })[this.selectorType] || '选择'; },
    getSelectorRows() {
      const map = { user: this.userOptions, merchant: this.merchantOptions, room: this.roomOptions, prize: this.prizeOptions };
      const keyword = this.selectorKeyword.trim().toLowerCase();
      return (map[this.selectorType] || []).map(item => ({ ...item, code: item.code || item.no || item.value })).filter(item => {
        if (this.selectorType === 'user' && keyword) {
          if (this.selectorFilters.userField === 'userNo') return String(item.userNo || '').toLowerCase().includes(keyword);
          if (this.selectorFilters.userField === 'name') return String(item.label || '').toLowerCase().includes(keyword);
          if (this.selectorFilters.userField === 'phone') return String(item.phone || '').toLowerCase().includes(keyword);
        }
        if (this.selectorType === 'room') {
          if (this.selectorFilters.roomNo && !String(item.no || '').toLowerCase().includes(this.selectorFilters.roomNo.toLowerCase())) return false;
          if (this.selectorFilters.playType && item.playType !== this.selectorFilters.playType) return false;
          if (this.selectorFilters.roomStatus && item.status !== this.selectorFilters.roomStatus) return false;
        }
        if (this.selectorType === 'prize') {
          if (this.selectorFilters.category && !String(item.category || '').includes(this.selectorFilters.category)) return false;
          if (this.selectorFilters.productSource && item.source !== this.selectorFilters.productSource) return false;
        }
        return !keyword || [item.label, item.code, item.value, item.no, item.userNo, item.phone].some(value => String(value || '').toLowerCase().includes(keyword));
      });
    },
    querySelector() { this.selectorPage = 1; },
    resetSelectorSearch() {
      this.selectorKeyword = '';
      this.selectorFilters = { userField: 'all', roomNo: '', playType: '', roomStatus: '', category: '', productSource: '' };
      this.selectorPage = 1;
    },
    resetSelectorState() { this.selectorSelectedValue = ''; },
    confirmSelector() {
      const item = this.getSelectorRows().find(row => row.value === this.selectorSelectedValue);
      if (!item) return this.$message.warning('请选择数据');
      this.selectFilterOption(item);
    },
    selectFilterOption(item) {
      const type = this.selectorType;
      if (type === 'user') { this.filterForm.userId = item.value; this.filterForm.userName = item.label; }
      if (type === 'merchant') { this.filterForm.merchantId = item.value; this.filterForm.merchantName = item.label; }
      if (type === 'room') { this.filterForm.roomId = item.value; this.filterForm.roomName = item.label; }
      if (type === 'prize') { this.filterForm.prizeId = item.value; this.filterForm.prizeName = item.label; }
      this.selectorVisible = false;
    },
    clearFilterSelection(type) {
      if (type === 'user') { this.filterForm.userId = ''; this.filterForm.userName = ''; }
      if (type === 'merchant') { this.filterForm.merchantId = ''; this.filterForm.merchantName = ''; }
      if (type === 'room') { this.filterForm.roomId = ''; this.filterForm.roomName = ''; }
      if (type === 'prize') { this.filterForm.prizeId = ''; this.filterForm.prizeName = ''; }
    },
    openRejectDialog(row) { this.rejectTarget = row; this.rejectForm.reason = ''; this.rejectDialogVisible = true; },
    resetRejectForm() { this.rejectTarget = null; this.rejectForm.reason = ''; },
    submitReject() {
      if (!this.rejectForm.reason.trim()) return this.$message.error('请填写驳回原因');
      if (this.rejectTarget) {
        this.rejectTarget.rejectReason = this.rejectForm.reason.trim();
        this.rejectTarget.status = 'stored';
        this.rejectTarget.shippingApplyTime = '';
        this.rejectTarget.operationRecords = [...this.rejectTarget.operationRecords, { time: this.formatNow(), description: `驳回发货申请：${this.rejectTarget.rejectReason}` }];
      }
      this.rejectDialogVisible = false;
      this.$message.success('已驳回');
      this.getList();
    },
    formatNow() {
      const pad = value => String(value).padStart(2, '0');
      const date = new Date();
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },
    handleExport() { this.$message.success('导出成功'); },
    resetDispatchForm() { this.dispatchForm = { userId: '', userName: '', merchantId: '', merchantName: '', roomId: '', roomName: '', prizeId: '', prizeName: '', reason: '' }; },
    selectUser() { this.dispatchForm.userId = '100'; this.dispatchForm.userName = 'Beedo'; this.$message.success('已选择用户'); },
    selectMerchant() { this.dispatchForm.merchantId = 'm001'; this.dispatchForm.merchantName = '星火潮玩旗舰店'; this.$message.success('已选择商户'); },
    selectRoom() { this.dispatchForm.roomId = 'cs-014'; this.dispatchForm.roomName = '转盘+截图'; this.$message.success('已选择房间'); },
    selectPrize() { this.dispatchForm.prizeId = '3620'; this.dispatchForm.prizeName = '上迪22春日系列olu挂件'; this.$message.success('已选择奖品'); },
    submitDispatch() {
      if (!this.dispatchForm.userId) return this.$message.error('请选择用户');
      if (!this.dispatchForm.merchantId) return this.$message.error('请选择商户');
      if (!this.dispatchForm.prizeId) return this.$message.error('请选择奖品');
      if (!this.dispatchForm.reason) return this.$message.error('请选择派发原因');
      if (this.isRoomRequired && !this.dispatchForm.roomId) return this.$message.error('请选择房间');
      this.$message.success('派发成功');
      this.showDispatchModal = false;
      this.resetDispatchForm();
    },
    getInitial(name) { return name ? name.slice(0, 1).toUpperCase() : '-'; },
    getStatusText(status) { const found = statusOptions.find(item => item.value === status); return found ? found.label : status; },
    getSourceText(source) { const found = sourceOptions.find(item => item.value === source); return found ? found.label : source; },
    getShippingStatusText(status) { const map = { pending: '待发货', shipped: '已发货', received: '已签收' }; return map[status] || '-'; },
    hasExchangedPoints(row) { return ['exchanged', 'expired_exchange', 'arrived'].includes(row.status); },
    getExchangedPoints(row) { return this.hasExchangedPoints(row) ? row.exchangePoints : '-'; },
  },
};
</script>
<style lang="scss" scoped>
.bag-management-new { padding: 0; }
.filter-card { margin-bottom: 16px; }
.filter-form { display: flex; flex-wrap: wrap; align-items: center; }
.filter-buttons { margin-left: auto; }
.keyword-input { width: 260px; }
.keyword-type { width: 100px; }
.form-content-width { width: 170px; }
.selector-input { width: 190px; }
::v-deep .selector-input .el-input__inner { cursor: pointer; background: #fff; }
::v-deep .selector-input .el-input-group__append { padding: 0; width: 44px; text-align: center; }
::v-deep .selector-input .el-input-group__append .el-button { width: 44px; padding: 0; }
.selector-query { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.query-label { color: #303133; white-space: nowrap; }
.query-select { width: 130px; }
.query-input { width: 220px; }
.query-spacer { flex: 1; }
.selector-table { margin-top: 4px; }
.selector-footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.selector-total { color: #606266; margin-right: 4px; }
.selector-page-size { width: 120px; }
.selector-page-input { width: 56px; }
.selector-name-cell { display: flex; align-items: center; gap: 8px; }
.selector-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; background: #f5f7fa; }
.date-range { width: 260px; }
.stat-cards { display: flex; gap: 16px; margin-bottom: 16px; }
.stat-card { flex: 1; display: flex; align-items: center; min-width: 0; padding: 20px; background: #fff; border-radius: 4px; border: 1px solid #ebeef5; cursor: pointer; transition: all .3s; }
.stat-card:hover, .stat-card.active { border-color: #409eff; }
.stat-card.active { box-shadow: 0 0 8px rgba(64, 158, 255, .2); }
.stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: #fff; font-size: 24px; }
.stat-icon.all { background: #606266; }
.stat-icon.stored { background: #409eff; }
.stat-icon.apply_shipping { background: #e6a23c; }
.stat-icon.exchanged, .stat-icon.arrived { background: #67c23a; }
.stat-icon.expired_exchange { background: #f56c6c; }
.stat-content { min-width: 0; }
.stat-num { font-size: 24px; font-weight: 600; color: #303133; }
.stat-label { font-size: 14px; color: #909399; margin-top: 4px; }
.table-card { border-radius: 4px; }
.tab-count { color: #909399; font-weight: normal; margin-left: 4px; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.table-toolbar > div:first-child { display: flex; gap: 8px; }
.toolbar-summary { color: #909399; font-size: 12px; }
.bag-table { width: 100%; font-size: 12px; }
::v-deep .bag-table th { background: #f5f7fb; color: #303133; font-weight: 600; }
::v-deep .bag-table td, ::v-deep .bag-table th { padding: 8px 0; }
.goods-cell, .user-cell, .room-cell, .merchant-cell { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
.user-avatar, .merchant-avatar { flex-shrink: 0; background: #409eff; }
.merchant-avatar { background: #67c23a; }
.cell-info { min-width: 0; line-height: 18px; }
.thumb-img { width: 46px; height: 46px; flex-shrink: 0; border-radius: 4px; background: #f5f7fa; object-fit: cover; }
.goods-name { color: #303133; display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.sub-text { color: #909399; font-size: 12px; line-height: 18px; }
.primary-text { color: #303133; line-height: 20px; word-break: break-all; }
.points-text { color: #e6a23c; font-weight: 600; font-size: 15px; }
.points-text.empty { color: #909399; font-weight: normal; }
.action-link { color: #409eff; font-size: 13px; cursor: pointer; }
.action-link:hover { text-decoration: underline; }
.danger-link { color: #ff4d4f; }
.status-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; line-height: 1.5; white-space: nowrap; }
.status-tag.status-stored { background: #ecf5ff; color: #409eff; }
.status-tag.status-apply_shipping { background: #fdf6ec; color: #e6a23c; }
.status-tag.status-exchanged, .status-tag.status-arrived { background: #f0f9eb; color: #67c23a; }
.status-tag.status-expired_exchange { background: #fef0f0; color: #f56c6c; }
.status-tag.status-gifted { background: #f4f4f5; color: #606266; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
.detail-container { padding: 0 22px 24px; }
.detail-summary { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 16px; border: 1px solid #ebeef5; border-radius: 4px; background: #fafafa; }
.detail-id { margin-bottom: 6px; color: #909399; font-size: 12px; }
.detail-title { color: #303133; font-size: 16px; font-weight: 600; }
.detail-summary-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.points-info { font-size: 14px; font-weight: 600; color: #e6a23c; }
.section-title { font-size: 14px; font-weight: 500; color: #303133; margin: 20px 0 10px; padding-left: 8px; border-left: 3px solid #409eff; }
.detail-card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-person-card { display: flex; align-items: center; gap: 12px; min-height: 74px; padding: 12px; border: 1px solid #ebeef5; border-radius: 4px; background: #fafafa; box-sizing: border-box; }
.detail-descriptions { margin-bottom: 2px; }
.detail-section-card { margin-bottom: 2px; }
.gift-flow-card { padding: 12px; border: 1px solid #ebeef5; border-radius: 4px; background: #fff; }
.gift-target-card { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 12px; border-radius: 4px; background: #f5f7fa; }
.gift-recipient-info { display: inline-flex; align-items: center; gap: 8px; }
.compact-descriptions { margin-top: 0; }
.operation-timeline { padding: 4px 0 0 4px; }
.select-btn { width: 100%; height: 36px; border: 1px dashed #d9d9d9; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #909399; transition: all .3s; }
.select-btn:hover { border-color: #409eff; color: #409eff; }
.optional-tip { font-size: 12px; color: #909399; margin-top: 4px; display: block; }
.full-width { width: 100%; }
.dialog-footer { text-align: right; }
</style>