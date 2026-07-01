<template>
  <div class="shipping-management">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="用户信息">
          <entity-picker-input
            v-model="filterForm.userId"
            :display="getShippingUserDisplay(filterForm.userId)"
            placeholder="请选择用户"
            title="用户搜索"
            search-label="用户搜索"
            search-placeholder="请输入昵称/用户编号"
            :rows="shippingUserOptions"
            :columns="userPickerColumns"
            row-key="userNo"
            :search-fields="['userNickname', 'userNo']"
          />
          <annotation-point
            title="【优化】用户信息筛选交互"
            content="优化前：用户信息使用下拉选择，用户数量较多时查找效率低。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、用户编号等信息检索，选择后回填筛选区。&#10;&#10;原因：发货管理需要按用户快速定位订单，弹窗表格可以展示头像、昵称和编号，降低误选并提升查询效率。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="filterForm.trackingNo" placeholder="请输入快递单号" clearable style="width: 200px" />
          <annotation-point
            title="快递单号筛选"
            content="【功能说明】通过输入快递单号精确或模糊匹配，快速定位对应订单。&#10;&#10;【业务说明】主要用于已发货后的订单查询场景（如用户咨询物流、处理物流异常等）；输入后可点击查询按钮或直接按回车进行搜索。&#10;&#10;【逻辑说明】输入快递单号→点击查询按钮→列表显示匹配的订单（支持模糊匹配）；清空输入框→点击查询→恢复显示所有订单。&#10;&#10;【状态适用】全部状态（主要用于待收货、已完成状态）。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="订单来源">
          <el-select v-model="filterForm.source" placeholder="请选择" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="背包" value="backpack" />
            <el-option label="商城" value="mall" />
          </el-select>
          <annotation-point
            title="订单来源筛选"
            content="【功能说明】按订单来源类型过滤订单列表，支持查看全部来源或单一来源。&#10;&#10;【业务说明】来源类型包括：背包（用户从背包入口下单）、商城（用户从商城下单）；不同来源订单的处理流程和优先级可能不同，运营可按来源分类处理。&#10;&#10;【逻辑说明】选择来源类型→点击查询按钮→列表刷新显示对应来源的订单；选择全部可清除来源过滤条件。&#10;&#10;【状态适用】全部状态。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="商户信息">
          <entity-picker-input
            v-model="filterForm.merchantName"
            :display="getShippingMerchantDisplay(filterForm.merchantName)"
            placeholder="请选择商户"
            title="商户搜索"
            search-label="商户搜索"
            search-placeholder="请输入商户名称/商户ID"
            :rows="shippingMerchantOptions"
            :columns="merchantPickerColumns"
            row-key="value"
            :search-fields="['label', 'merchantId']"
          />
          <annotation-point
            title="【优化】商户信息筛选交互"
            content="优化前：商户信息使用下拉选择，商户数量较多时检索效率低。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开商户搜索弹窗，支持按商户名称、商户ID检索，选择后回填筛选区。&#10;&#10;原因：发货管理需要按商户维度处理订单，弹窗选择可以同时确认商户头像、名称和ID，避免误选。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="申请日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 260px"
          />
          <annotation-point
            title="申请日期范围筛选"
            content="【功能说明】按订单申请发货的日期范围过滤列表数据，快速定位特定时间段内的订单。&#10;&#10;【业务说明】申请发货日期是用户提交发货申请的时间，与创建时间可能不同；支持选择开始和结束日期，便于按天/周/月查看订单数据，用于数据分析、对账、异常处理等场景。&#10;&#10;【逻辑说明】选择开始日期和结束日期→点击查询按钮→列表显示该时间范围内的订单；清空日期范围→点击查询→恢复显示所有时间的订单。&#10;&#10;【状态适用】全部状态。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item class="filter-buttons">
          <el-button @click="handleReset">
            重置
            <annotation-point
              title="重置按钮"
              content="【功能说明】一键重置所有筛选条件为默认值，快速清空筛选状态。&#10;&#10;【业务说明】当运营需要取消所有筛选条件、恢复查看全部订单时使用；避免在多个筛选条件下逐一清空的繁琐操作。&#10;&#10;【逻辑说明】点击重置按钮→所有筛选条件清空（用户、快递单号、来源、商户、日期范围全部恢复默认）→列表自动刷新显示全部订单。&#10;&#10;【状态适用】全部状态。"
              priority="P1"
            />
          </el-button>
          <el-button type="primary" @click="handleSearch">
            查询
            <annotation-point
              title="查询按钮"
              content="【功能说明】根据当前填写的筛选条件查询订单，刷新列表显示符合条件的结果。&#10;&#10;【业务说明】点击后根据所有已填写的筛选条件（用户、快递单号、来源、商户、日期范围）组合查询，多个条件为AND关系；未填写的条件不参与过滤。&#10;&#10;【逻辑说明】填写筛选条件→点击查询按钮→列表刷新显示符合条件的订单→统计卡片数字同步更新。&#10;&#10;【状态适用】全部状态。"
              priority="P0"
            />
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="stat-cards">
      <div
        v-for="stat in statList"
        :key="stat.key"
        class="stat-card"
        :class="{ active: activeTab === stat.key }"
        @click="handleStatClick(stat.key)"
      >
        <div class="stat-icon" :class="stat.key">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <div class="stat-num">{{ statistics[stat.key] }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <annotation-point
          v-if="stat.key === 'pending'"
          title="待发货统计卡片"
          content="【功能说明】显示待发货订单总数，点击可快速筛选待发货订单。&#10;&#10;【业务说明】待发货订单是用户已申请发货、等待运营处理的订单；这是运营日常处理的主要订单类型，需及时发货避免用户投诉。&#10;&#10;【逻辑说明】点击统计卡片→activeTab切换为pending→列表只显示待发货订单→可批量勾选进行锁单/发货等操作。&#10;&#10;【状态流转】待发货是订单的初始状态，可流转至待收货（运营发货）或申请取消（用户发起取消）。&#10;&#10;【状态适用】全状态下都显示此统计卡片（数字为待发货订单总数）。"
          priority="P0"
        />
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待发货" name="pending" />
        <el-tab-pane label="待收货" name="receiving" />
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="申请取消" name="canceling" />
        <el-tab-pane label="已取消" name="canceled" />
      </el-tabs>

      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="batch-lock-wrapper">
            <el-button :disabled="selectedCount === 0" @click="handleBatchLock">批量锁单</el-button>
          </span>
          <span class="batch-unlock-wrapper">
            <el-button :disabled="selectedCount === 0" @click="handleBatchUnlock">批量解绑</el-button>
          </span>
          <span class="import-btn-wrapper">
            <el-button @click="handleImport">导入</el-button>
            <annotation-point
              title="导入发货记录按钮"
              content="【功能说明】打开导入发货记录弹窗，支持通过Excel文件批量导入发货数据。&#10;&#10;【业务说明】适用于运营已有发货数据（如从快递公司导出的数据），需要批量回写到系统中的场景，避免逐条手动发货。&#10;&#10;【逻辑说明】点击导入→弹出导入弹窗→下载模板→填写发货数据→上传文件→系统校验→确认导入→批量更新订单状态为待收货。&#10;&#10;【状态适用】全部状态（导入后影响待发货订单）。"
              priority="P0"
            />
          </span>
          <el-button @click="handleExportShipping">发货数据导出</el-button>
          <el-button @click="handleExportSku">SKU发货导出</el-button>
          <el-button @click="handleImportRecord">导入记录</el-button>
          <annotation-point
            title="导入记录按钮"
            content="【功能说明】打开导入记录弹窗，查看历史导入任务的处理结果。&#10;&#10;【业务说明】每次导入操作都会生成一条导入记录，记录包含任务ID、上传文件名、错误数据条数、处理状态、导入时间等，便于运营追溯和排查导入失败原因。&#10;&#10;【逻辑说明】点击导入记录→弹出导入记录弹窗→展示历史导入任务列表（支持分页）→可查看每条记录的状态和错误详情。&#10;&#10;【状态适用】全部状态。"
            priority="P1"
          />
        </div>
      </div>

      <div class="order-composite-table">
        <div class="order-table-head">
          <div class="order-col order-col-check">
            <el-checkbox
              :value="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            />
          </div>
          <div class="order-col order-col-goods">
            商品信息
            <annotation-point
              title="商品信息列"
              content="【功能说明】显示订单的商品明细信息，包括商品图片、名称、分类、商品ID和数量。&#10;&#10;【业务说明】每个订单可能包含多个商品，表格中以行为单位展示；商品信息帮助运营快速识别订单内容，确认发货商品是否正确。&#10;&#10;【逻辑说明】订单商品数≤3时：全部商品直接展示在表格中；订单商品数＞3时：默认显示前3条商品+展开订单按钮，点击展开后显示全部商品。&#10;&#10;【状态适用】全部状态。"
              priority="P0"
            />
          </div>
          <div class="order-col order-col-count">数量</div>
          <div class="order-col order-col-freight">运费</div>
          <div class="order-col order-col-receiver">
            收货信息
            <annotation-point
              title="收货信息列"
              content="【功能说明】显示订单的收货人姓名、联系电话和详细收货地址，支持在线编辑和一键复制。&#10;&#10;【业务说明】收货信息是发货的重要依据，运营需在发货前核对信息准确性；用户下单后可能需修改地址（如填错、搬家等），运营可在订单未发货前协助修改。&#10;&#10;【逻辑说明】未锁单且非终态时：收货人旁显示编辑图标，点击弹出修改收货信息弹窗；地址旁显示复制图标，点击一键复制地址到剪贴板；待收货状态修改地址后需同步通知物流公司；已完成/已取消状态下编辑图标隐藏，仅保留复制功能。&#10;&#10;【状态流转】待发货/申请取消：可编辑；待收货：可编辑但需同步物流；已完成/已取消：禁止编辑，仅可复制。&#10;&#10;【状态适用】全部状态（编辑功能按状态控制）。"
              priority="P0"
            />
          </div>
          <div class="order-col order-col-remark">
            备注信息
            <annotation-point
              title="备注信息列"
              content="【功能说明】显示订单的用户备注和商家备注，支持在线编辑；备注信息帮助运营了解订单特殊要求和内部记录。&#10;&#10;【业务说明】用户备注是用户下单时填写的特殊要求（如请工作日配送、礼物包装、易碎品轻放等），商家备注是运营人员内部记录（如VIP客户、已电话确认、特殊处理方式等）；两类备注独立维护，互不影响。&#10;&#10;【逻辑说明】未锁单状态下：用户备注和商家备注旁均显示编辑图标，点击弹出修改备注弹窗（可选择备注类型）；锁单状态下：编辑图标隐藏，备注内容只读展示；所有状态下都支持查看备注内容。&#10;&#10;【状态适用】全部状态（未锁单时可编辑，锁单时只读）。"
              priority="P1"
            />
          </div>
          <div class="order-col order-col-status">
            状态
            <annotation-point
              title="状态列"
              content="【功能说明】显示订单当前状态，并根据状态提供附加信息（物流入口或取消原因）。&#10;&#10;【业务说明】订单状态分为五个：待发货（用户申请发货，等待处理）、待收货（运营已发货，等待签收）、已完成（用户已签收，终态）、申请取消（用户发起取消，等待审核）、已取消（审核通过取消，终态）；不同状态下显示内容不同。&#10;&#10;【逻辑说明】待发货：仅显示状态文字；待收货/已完成：显示状态文字+查看物流链接，点击可查看物流轨迹；申请取消/已取消：显示状态文字+取消原因，帮助运营了解用户取消意图；已完成和已取消为终态，不可再进行操作。&#10;&#10;【状态流转】待发货→待收货→已完成；待发货→申请取消→已取消（同意）/待发货（拒绝）。&#10;&#10;【状态适用】全部状态（显示内容随状态变化）。"
              priority="P0"
            />
          </div>
          <div class="order-col order-col-action">
            操作
            <annotation-point
              title="操作列"
              content="【功能说明】提供订单的核心操作入口，包括发货、审核取消申请、查看订单详情。&#10;&#10;【业务说明】操作按钮根据订单状态动态显示：待发货状态显示发货按钮（未锁单时）；申请取消状态显示审核按钮；全部状态都显示订单详情按钮；已锁单状态下发货和审核按钮禁用。&#10;&#10;【逻辑说明】发货按钮：仅待发货+未锁单时可用，点击打开发货弹窗，填写物流信息后确认发货，订单状态变为待收货；审核按钮：仅申请取消状态时显示，点击打开审核弹窗，选择同意或拒绝（拒绝需选择原因），确认后订单流转至已取消或回退至待发货；订单详情按钮：全部状态可用，点击进入订单详情页查看完整信息。&#10;&#10;【状态流转】待发货→待收货（点击发货）；申请取消→已取消/待发货（点击审核）。&#10;&#10;【状态适用】待发货（发货按钮）、申请取消（审核按钮）、全部状态（订单详情按钮）。"
              priority="P0"
            />
          </div>
        </div>

        <div class="order-group-list" v-loading="loading">
          <div v-for="order in filteredOrders" :key="order.id" class="order-group">
            <div class="order-group-header">
              <div class="header-check">
                <el-checkbox
                  :value="order.checked"
                  @change="handleOrderCheckChange(order)"
                />
              </div>
              <div class="header-info">
                <div class="header-entity">
                  <el-avatar :size="28" :src="order.merchantAvatar" icon="el-icon-shop">
                    {{ order.merchantName ? order.merchantName.charAt(0) : '商' }}
                  </el-avatar>
                  <div class="header-entity-title">
                    {{ order.merchantName || '-' }}<span v-if="order.merchantId">（商户ID：{{ order.merchantId }}）</span>
                  </div>
                </div>
                <div class="header-entity">
                  <el-avatar :size="28" :src="order.userAvatar">
                    {{ order.userNickname ? order.userNickname.charAt(0) : 'U' }}
                  </el-avatar>
                  <div class="header-entity-title">
                    {{ order.userNickname || '-' }}<span v-if="order.userNo">（{{ order.userNo }}）</span>
                  </div>
                </div>
                <div class="header-order-meta">
                  <span class="header-order-no">
                    订单号：{{ order.orderNo }}
                    <i class="el-icon-document-copy copy-icon" title="复制订单号" @click.stop="copyText(order.orderNo)"></i>
                  </span>
                  <span>创建时间：{{ order.createTime }}</span>
                  <span>订单来源：{{ order.source }}</span>
                </div>
              </div>
              <div class="header-lock">
                <span>锁单：</span>
                <el-tooltip v-if="order.status === 'receiving'" content="待收货订单不可修改锁单状态" placement="top">
                  <el-switch :value="true" :disabled="true" active-color="#409EFF" inactive-color="#dcdfe6" />
                </el-tooltip>
                <el-tooltip v-else-if="order.status === 'completed'" content="已完成订单不可修改锁单状态" placement="top">
                  <el-switch :value="order.locked" :disabled="true" active-color="#409EFF" inactive-color="#dcdfe6" />
                </el-tooltip>
                <el-tooltip v-else-if="order.status === 'canceled'" content="已取消订单不可修改锁单状态" placement="top">
                  <el-switch :value="false" :disabled="true" active-color="#409EFF" inactive-color="#dcdfe6" />
                </el-tooltip>
                <el-switch
                  v-else
                  :value="order.locked"
                  active-color="#409EFF"
                  inactive-color="#dcdfe6"
                  @change="(val) => handleLockChange(order, val)"
                />
              </div>
            </div>

            <div class="order-group-body">
              <div class="order-products">
                <div
                  v-for="product in (expandedOrderIds.includes(order.id) ? order.products : order.products.slice(0, 3))"
                  :key="product.skuId"
                  class="order-product-row"
                >
                  <div class="product-cell">
                    <img class="goods-img" :src="product.image || defaultGoodsImg" alt="" />
                    <div class="goods-info">
                      <div class="goods-name">{{ product.name }}</div>
                      <div class="goods-sub">{{ product.category }}</div>
                      <div class="goods-id">商品ID：{{ product.skuId }}</div>
                    </div>
                  </div>
                  <div class="count-cell">x{{ product.quantity }}</div>
                </div>
              </div>

              <div class="freight-cell">运费：{{ order.freight }}</div>

              <div class="receiver-cell">
                <div class="receiver-top">
                  <span>{{ order.receiverName }}</span>
                  <span class="receiver-phone">{{ order.receiverPhone }}</span>
                </div>
                <div class="receiver-bottom">
                  <span class="receiver-addr ellipsis">{{ order.receiverAddress }}</span>
                  <i
                    v-if="!order.locked && order.status !== 'completed' && order.status !== 'canceled'"
                    class="el-icon-edit action-icon"
                    @click.stop="handleEditReceiver(order)"
                  ></i>
                  <i class="el-icon-document-copy action-icon" @click.stop="copyText(order.receiverAddress)"></i>
                </div>
              </div>

              <div class="remark-cell">
                <div class="remark-line">
                  <span class="remark-label">用户备注：</span>
                  <span class="remark-text ellipsis">{{ order.userRemark || '-' }}</span>
                  <i
                    v-if="!order.locked"
                    class="el-icon-edit action-icon"
                    @click.stop="handleEditUserRemark(order)"
                  ></i>
                </div>
                <div class="remark-line">
                  <span class="remark-label">商家备注：</span>
                  <span class="remark-text ellipsis">{{ order.merchantRemark || '-' }}</span>
                  <i
                    v-if="!order.locked"
                    class="el-icon-edit action-icon"
                    @click.stop="handleEditMerchantRemark(order)"
                  ></i>
                </div>
              </div>

              <div class="status-cell">
                <div class="status-text">{{ getStatusText(order.status) }}</div>
                <div v-if="order.status === 'receiving' || order.status === 'completed'" class="logistics-link" @click="handleViewLogistics(order)">
                  查看物流
                </div>
                <div v-if="order.cancelReason" class="cancel-reason">
                  原因：{{ order.cancelReason }}
                </div>
              </div>

              <div class="action-cell">
                <el-button
                  v-if="order.status === 'pending'"
                  type="primary"
                  size="mini"
                  @click="handleShip(order)"
                >发货</el-button>
                <el-button
                  v-if="order.status === 'canceling'"
                  size="mini"
                  class="orange-btn"
                  @click="handleApproveCancel(order)"
                >审核</el-button>
                <el-button type="text" size="mini" @click="handleViewDetail(order)">订单详情</el-button>
              </div>
            </div>

            <div
              v-if="order.products.length > 3"
              class="order-expand-row"
              @click="toggleExpand(order)"
            >
              <span>{{ expandedOrderIds.includes(order.id) ? '收起订单' : '展开订单' }}</span>
              <i :class="expandedOrderIds.includes(order.id) ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                <annotation-point
                  title="展开/收起订单"
                  content="【功能说明】当订单包含的商品数量超过3个时，默认只显示前3条，点击此按钮可展开查看全部商品明细，再次点击收起多余商品。&#10;&#10;【业务说明】部分订单可能包含多件商品（如批发采购、套装组合），为避免列表过长影响浏览，默认折叠多余商品；仅当商品数＞3时才显示此展开入口。&#10;&#10;【逻辑说明】订单商品数≤3时：不显示展开按钮，全部商品直接展示；订单商品数＞3时：默认显示前3条+展开订单按钮，点击后展开显示全部商品+收起订单按钮，点击收起后恢复仅显示前3条。&#10;&#10;【状态适用】全部状态。"
                  priority="P1"
                />
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-wrapper">
        <el-pagination
          :current-page.sync="pagination.page"
          :page-size.sync="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
        <annotation-point
          title="分页组件"
          content="【功能说明】用于翻页查看更多订单，支持切换每页显示数量和跳转到指定页码。&#10;&#10;【业务说明】当订单总数超过每页显示数量时，自动显示分页组件；支持切换每页显示10/20/50/100条，便于运营根据需求调整列表密度。&#10;&#10;【逻辑说明】点击页码→列表刷新显示对应页数据；切换每页数量→列表刷新并按新的每页数量显示；输入页码跳转→快速定位到指定页。&#10;&#10;【状态适用】全部状态。"
          priority="P1"
        />
      </div>
    </el-card>

    <el-dialog :visible.sync="remarkDialogVisible" title="修改备注" width="400px">
      <annotation-point
        title="修改备注弹窗"
        content="【功能说明】编辑订单的用户备注或商家备注，保存后备注信息实时更新。&#10;&#10;【业务说明】用户备注是用户下单时填写的特殊要求（如配送时间、包装要求等），商家备注是运营人员内部记录（如VIP客户、特殊处理方式等）；所有状态下都可编辑备注，但锁单状态下不可编辑。&#10;&#10;【逻辑说明】点击编辑图标/修改备注按钮→弹出修改备注弹窗→选择备注类型→输入备注内容→点击保存→备注更新成功。&#10;&#10;【状态适用】全部状态（未锁单时可编辑）。"
        priority="P1"
      />
      <el-form :model="remarkForm">
        <el-form-item label="备注类型">
          <el-radio-group v-model="remarkForm.type">
            <el-radio label="user">用户备注</el-radio>
            <el-radio label="merchant">商家备注</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注内容">
          <el-input v-model="remarkForm.content" type="textarea" :rows="4" placeholder="请输入备注内容" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="remarkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRemark">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="receiverDialogVisible" title="修改收货信息" width="500px">
      <annotation-point
        title="修改收货信息弹窗"
        content="【功能说明】修改订单的收货人姓名、联系电话和收货地址，保存后即时更新订单收货信息。&#10;&#10;【业务说明】用户下单后可能需要修改地址（如填错地址、搬家、收件人变更等），运营可在订单未发货前协助修改；注意：待收货状态修改地址后需同步通知物流公司，已完成和已取消状态禁止修改。&#10;&#10;【逻辑说明】点击编辑收货信息图标→弹出修改弹窗（自动填充当前收货信息）→修改对应字段→点击保存→校验通过后更新订单收货信息。&#10;&#10;【状态流转】待发货/申请取消：可修改；待收货：可修改但需同步物流；已完成/已取消：禁止修改。&#10;&#10;【状态适用】待发货、待收货、申请取消（未锁单）。"
        priority="P0"
      />
      <el-form :model="receiverForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="receiverForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="receiverForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="receiverForm.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="receiverDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveReceiver">保存</el-button>
      </span>
    </el-dialog>

    <order-delivery-drawer
      :visible.sync="deliveryDrawerVisible"
      :order-data="deliveryOrder"
      :mode="drawerMode"
      @update:visible="deliveryDrawerVisible = $event"
      @ship-success="handleShipSuccess"
      @update-receiver="handleUpdateReceiver"
      @update-remark="handleUpdateRemark"
      @update-express="handleUpdateExpress"
      @switch-mode="drawerMode = 'ship'"
    />

    <el-drawer
      title="发货管理订单详情"
      :visible.sync="newDetailDrawerVisible"
      direction="rtl"
      :size="'85%'"
      :modal-append-to-body="false"
      :wrapper-closable="true"
    >
      <shipping-order-detail
        :order-data="currentDetailOrder"
        @ship-success="handleDetailShipSuccess"
      />
    </el-drawer>

    <cancel-audit-dialog
      :visible.sync="auditDialogVisible"
      :cancel-reason="currentAuditOrder?.cancelReason"
      @confirm="handleAuditConfirm"
    />

    <el-dialog :visible.sync="importRecordDialogVisible" title="导入发货记录" width="600px">
      <annotation-point
        title="导入发货记录弹窗"
        content="【功能说明】通过上传Excel文件批量导入发货数据，系统自动匹配订单并回写物流信息，避免逐条手动发货。&#10;&#10;【业务说明】适用于运营已有发货数据（如从快递公司后台导出的发货清单），需要批量回写到SaaS系统中的场景；支持多次导入，每次导入生成独立任务记录。&#10;&#10;【逻辑说明】点击导入按钮→弹出导入弹窗→下载模板（按模板格式填写发货数据）→点击上传区域/拖拽文件上传→系统校验文件格式和数据的正确性→点击确认导入→系统批量处理（匹配订单号、写入物流信息、更新订单状态为待收货）→导入完成后可在导入记录中查看结果。&#10;&#10;【状态流转】待发货→待收货（导入成功后）；若订单已锁单或状态不符则导入失败。&#10;&#10;【注意事项】①仅支持.xlsx/.xls格式；②一次最多导入500条；③物流单号长度不超过50位；④发货数量必须为数字且大于0；⑤请勿修改表头字段。&#10;&#10;【状态适用】全部状态（仅对待发货订单生效）。"
        priority="P0"
      />
      <div class="import-dialog-content">
        <el-button type="primary" @click="handleDownloadTemplate">下载模板</el-button>
        <div class="template-tips">
          <p>请勿修改表头字段</p>
          <p>发货数量必须为数字且大于0</p>
          <p>物流单号长度不超过50位</p>
          <p>一次最多导入500条记录</p>
        </div>
        <div class="upload-area" @click="handleUploadClick" @drop.prevent="handleDrop">
          <i class="el-icon-upload"></i>
          <p>点击或拖拽文件到此处上传</p>
          <p class="upload-hint">支持 .xlsx / .xls 格式</p>
        </div>
        <div v-if="uploadFile" class="upload-file-info">
          <i class="el-icon-document"></i>
          <span>{{ uploadFile.name }}</span>
          <i class="el-icon-close" @click="clearUploadFile"></i>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="importRecordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleConfirmImport">确认导入</el-button>
      </span>
    </el-dialog>

    <el-dialog title="导入记录" :visible.sync="importHistoryDrawerVisible" width="800px">
      <annotation-point
        title="导入记录弹窗"
        content="【功能说明】查看历史导入任务的处理结果列表，包括任务ID、上传文件名、错误数据条数、处理状态和导入时间。&#10;&#10;【业务说明】每次导入操作都会生成一条导入记录，运营可通过此列表追溯导入历史、排查导入失败原因（如有错误数据可下载错误文件查看具体原因）；状态分为：待处理、处理中、成功、失败四种。&#10;&#10;【逻辑说明】点击导入记录按钮→弹出导入记录弹窗→展示历史导入任务列表（按时间倒序）→支持分页查看→点击文件名可下载原始上传文件→失败任务可查看错误数据条数。&#10;&#10;【状态说明】待处理：任务已创建但未开始处理；处理中：系统正在批量处理导入数据；成功：全部数据导入成功；失败：存在错误数据导致部分或全部导入失败。&#10;&#10;【状态适用】全部状态。"
        priority="P1"
      />
      <div class="import-history-content">
        <el-table :data="importHistoryList" border stripe>
          <el-table-column prop="taskId" label="任务ID" width="150" />
          <el-table-column prop="fileName" label="上传文件" min-width="180">
            <template slot-scope="{ row }">
              <span class="file-link" @click="handleDownloadFile(row)">{{ row.fileName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="errorCount" label="错误数据" width="100" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.errorCount > 0" class="error-text">{{ row.errorCount }}条</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag v-if="row.status === 'success'" type="success" size="mini">成功</el-tag>
              <el-tag v-else-if="row.status === 'failed'" type="danger" size="mini">失败</el-tag>
              <el-tag v-else-if="row.status === 'processing'" type="warning" size="mini">处理中</el-tag>
              <el-tag v-else type="info" size="mini">待处理</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="时间" width="160" />
        </el-table>
        <div v-if="!importHistoryList.length" class="empty-state">
          <i class="el-icon-folder-opened"></i>
          <span>暂无数据</span>
        </div>
        <div class="pagination-wrapper">
          <el-pagination
            :current-page.sync="importHistoryPage"
            :page-size.sync="importHistoryPageSize"
            :page-sizes="[10, 20, 50]"
            :total="importHistoryTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleImportHistorySizeChange"
            @current-change="handleImportHistoryPageChange"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';
import EntityPickerInput from '@/components/EntityPickerInput';
import CancelAuditDialog from './CancelAuditDialog.vue';

export default {
  name: 'ShippingManagement',
  components: {
    EntityPickerInput,
    AnnotationPoint,
    CancelAuditDialog,
    OrderDeliveryDrawer: () => import('./OrderDeliveryDrawer.vue'),
    ShippingOrderDetail: () => import('./ShippingOrderDetail.vue')
  },
  data() {
    return {
      defaultGoodsImg: '',
      filterForm: {
        userId: '',
        trackingNo: '',
        source: '',
        dateRange: [],
        merchantName: ''
      },
      merchantOptions: [
        { value: '', label: '全部商户' },
        { value: '官方旗舰店', label: '官方旗舰店' },
        { value: '积分商城', label: '积分商城' }
      ],
      userPickerColumns: [
        { label: '头像', prop: 'userAvatar', type: 'avatar', fallbackProp: 'userNickname', width: 90 },
        { label: '昵称', prop: 'userNickname', minWidth: 150 },
        { label: '用户编号', prop: 'userNo', width: 150 }
      ],
      merchantPickerColumns: [
        { label: '头像', prop: 'merchantAvatar', type: 'avatar', fallbackProp: 'label', width: 90 },
        { label: '商户名称', prop: 'label', minWidth: 170 },
        { label: '商户ID', prop: 'merchantId', width: 150 }
      ],
      statistics: {
        pending: 0,
        receiving: 0,
        completed: 0,
        canceling: 0,
        canceled: 0
      },
      activeTab: 'all',
      loading: false,
      expandedOrderIds: [],
      selectedRows: [],
      auditDialogVisible: false,
      currentAuditOrder: null,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 6
      },
      statList: [
        { key: 'pending', label: '待发货', icon: 'el-icon-s-goods' },
        { key: 'receiving', label: '待收货', icon: 'el-icon-truck' },
        { key: 'completed', label: '已完成', icon: 'el-icon-circle-check' },
        { key: 'canceling', label: '申请取消', icon: 'el-icon-warning' },
        { key: 'canceled', label: '已取消', icon: 'el-icon-close' }
      ],
      orders: [
        {
          id: 'DD20260624001',
          merchantAvatar: '',
          merchantName: '官方旗舰店',
          merchantId: 'M10001',
          userAvatar: '',
          userNickname: '张三',
          userNo: '10001',
          orderNo: 'DD20260624001',
          createTime: '2026-03-05 17:46:36',
          source: '背包',
          locked: false,
          freight: 12,
          receiverName: '张三',
          receiverPhone: '18577889966',
          receiverAddress: '广东省深圳市龙华区民治街道XXX号',
          userRemark: '请在工作日配送',
          merchantRemark: 'VIP客户',
          status: 'pending',
          cancelReason: '',
          products: [
            {
              skuId: '87769',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            },
            {
              skuId: '87770',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            },
            {
              skuId: '87771',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            },
            {
              skuId: '87772',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            },
            {
              skuId: '87773',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            }
          ]
        },
        {
          id: 'DD20260624002',
          merchantAvatar: '',
          merchantName: '官方旗舰店',
          merchantId: 'M10001',
          userAvatar: '',
          userNickname: '张三',
          userNo: '10001',
          orderNo: 'DD20260624002',
          createTime: '2026-03-05 17:46:36',
          source: '背包',
          locked: true,
          freight: 12,
          receiverName: '张三',
          receiverPhone: '18577889966',
          receiverAddress: '广东省深圳市龙华区民治街道XXX号',
          userRemark: '请在工作日配送',
          merchantRemark: 'VIP客户',
          status: 'receiving',
          cancelReason: '',
          products: [
            {
              skuId: '87774',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            }
          ]
        },
        {
          id: 'DD20260624003',
          merchantAvatar: '',
          merchantName: '积分商城',
          merchantId: 'M10002',
          userAvatar: '',
          userNickname: '李四',
          userNo: '10002',
          orderNo: 'DD20260624003',
          createTime: '2026-03-05 17:46:36',
          source: '商城',
          locked: true,
          freight: 12,
          receiverName: '李四',
          receiverPhone: '18677889977',
          receiverAddress: '广东省深圳市南山区科技园YYY号',
          userRemark: '请尽快发货',
          merchantRemark: '',
          status: 'completed',
          cancelReason: '',
          products: [
            {
              skuId: '87775',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            }
          ]
        },
        {
          id: 'DD20260624004',
          merchantAvatar: '',
          merchantName: '积分商城',
          merchantId: 'M10002',
          userAvatar: '',
          userNickname: '王五',
          userNo: '10003',
          orderNo: 'DD20260624004',
          createTime: '2026-03-05 17:46:36',
          source: '商城',
          locked: false,
          freight: 12,
          receiverName: '王五',
          receiverPhone: '18777889988',
          receiverAddress: '广东省深圳市福田区华强北ZZZ号',
          userRemark: '',
          merchantRemark: '',
          status: 'canceling',
          cancelReason: '不想要了',
          products: [
            {
              skuId: '87776',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            }
          ]
        },
        {
          id: 'DD20260624005',
          merchantAvatar: '',
          merchantName: '官方旗舰店',
          merchantId: 'M10001',
          userAvatar: '',
          userNickname: '赵六',
          userNo: '10004',
          orderNo: 'DD20260624005',
          createTime: '2026-03-05 17:46:36',
          source: '商城',
          locked: true,
          freight: 0,
          receiverName: '赵六',
          receiverPhone: '18877889999',
          receiverAddress: '广东省深圳市宝安区西乡WWW号',
          userRemark: '',
          merchantRemark: '商家备注测试',
          status: 'canceled',
          cancelReason: '不想要了',
          products: [
            {
              skuId: '87777',
              name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
              image: '',
              quantity: 1
            }
          ]
        }
      ],
      remarkDialogVisible: false,
      remarkForm: {
        type: 'merchant',
        content: '',
        order: null
      },
      receiverDialogVisible: false,
      receiverForm: {
        name: '',
        phone: '',
        address: '',
        order: null
      },
      deliveryDrawerVisible: false,
      deliveryOrder: null,
      drawerMode: 'detail',
      newDetailDrawerVisible: false,
      currentDetailOrder: null,
      importRecordDialogVisible: false,
      importLoading: false,
      uploadFile: null,
      importHistoryDrawerVisible: false,
      importHistoryList: [
        { taskId: 'IMP20260626001', fileName: '发货记录导入模板.xlsx', errorCount: 0, status: 'success', createTime: '2026-06-26 10:30:00' },
        { taskId: 'IMP20260626002', fileName: '批量发货数据.xlsx', errorCount: 3, status: 'failed', createTime: '2026-06-26 09:15:00' },
        { taskId: 'IMP20260625003', fileName: '发货清单0625.xlsx', errorCount: 0, status: 'success', createTime: '2026-06-25 16:45:00' },
        { taskId: 'IMP20260625004', fileName: '商品发货导入.xlsx', errorCount: 0, status: 'processing', createTime: '2026-06-25 14:20:00' }
      ],
      importHistoryPage: 1,
      importHistoryPageSize: 10,
      importHistoryTotal: 4
    }
  },
  computed: {
    shippingUserOptions() {
      const map = new Map()
      this.orders.forEach(order => {
        if (!map.has(order.userNo)) {
          map.set(order.userNo, {
            userNo: order.userNo,
            userNickname: order.userNickname,
            userAvatar: order.userAvatar
          })
        }
      })
      return Array.from(map.values())
    },
    shippingMerchantOptions() {
      const map = new Map()
      this.orders.forEach(order => {
        if (!map.has(order.merchantName)) {
          map.set(order.merchantName, {
            value: order.merchantName,
            label: order.merchantName,
            merchantId: order.merchantId,
            merchantAvatar: order.merchantAvatar
          })
        }
      })
      return Array.from(map.values())
    },
    filteredOrders() {
      let data = this.activeTab === 'all' ? this.orders : this.orders.filter(order => order.status === this.activeTab)
      if (this.activeTab === 'import') data = []
      if (this.filterForm.userId) data = data.filter(order => order.userNo === this.filterForm.userId)
      if (this.filterForm.merchantName) data = data.filter(order => order.merchantName === this.filterForm.merchantName)
      if (this.filterForm.trackingNo) {
        data = data.filter(order => (order.trackingNo || '').includes(this.filterForm.trackingNo))
      }
      if (this.filterForm.source) {
        data = data.filter(order => order.source === this.filterForm.source || order.sourceType === this.filterForm.source)
      }
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        const [start, end] = this.filterForm.dateRange
        data = data.filter(order => order.applyTime >= start && order.applyTime <= end + ' 23:59:59')
      }
      return data
    },
    selectedCount() {
      return this.orders.filter(o => o.checked).length
    },
    isAllSelected() {
      return this.filteredOrders.length > 0 && this.selectedCount === this.filteredOrders.length
    },
    isIndeterminate() {
      const count = this.selectedCount
      return count > 0 && count < this.filteredOrders.length
    }
  },
  methods: {
    getShippingUserDisplay(userNo) {
      const user = this.shippingUserOptions.find(item => item.userNo === userNo)
      return user ? user.userNickname + '（' + user.userNo + '）' : ''
    },
    getShippingMerchantDisplay(value) {
      const merchant = this.shippingMerchantOptions.find(item => item.value === value)
      return merchant ? merchant.label + '（商户ID：' + merchant.merchantId + '）' : ''
    },
    handleSelectAll(val) {
      this.filteredOrders.forEach(order => {
        order.checked = val
      })
    },
    handleOrderCheckChange(order) {
      order.checked = !order.checked
    },
    toggleExpand(order) {
      const index = this.expandedOrderIds.indexOf(order.id)
      if (index > -1) {
        this.expandedOrderIds.splice(index, 1)
      } else {
        this.expandedOrderIds.push(order.id)
      }
    },
    handleLockChange(order, val) {
      if (val) {
        this.$confirm('锁单后禁止修改收货信息、取消发货，是否确认锁单？', '提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          order.locked = true
          this.$message.success('锁单成功')
        }).catch(() => {})
      } else {
        order.locked = false
        this.$message.success('解锁成功')
      }
    },
    getStatusText(status) {
      const texts = {
        pending: '待发货',
        receiving: '待收货',
        completed: '已完成',
        canceling: '申请取消',
        canceled: '已取消'
      }
      return texts[status] || status
    },
    handleShip(order) {
      if (order.locked) {
        this.$message.warning('订单已锁单，无法发货')
        return
      }
      this.deliveryOrder = order
      this.drawerMode = 'ship'
      this.deliveryDrawerVisible = true
    },
    handleShipSuccess(data) {
      console.log('发货成功', data)
      const order = this.orders.find(o => o.id === data.order.id)
      if (order) {
        order.status = 'receiving'
      }
      this.initStatistics()
    },
    handleViewDetail(order) {
      let mockType = 'backpack'
      if (order.source === '积分兑换' || order.source === 'points') {
        mockType = 'points_mall'
      }
      this.$router.push({
        path: '/admin/order/shipping/detail',
        query: {
          orderNo: order.orderNo,
          mockType: mockType,
          status: order.status
        }
      })
    },
    handleDetailShipSuccess(data) {
      console.log('详情页发货成功', data)
      this.$message.success('发货成功')
      this.initStatistics()
    },
    handleViewLogistics(order) {
      console.log('查看物流', order)
      this.$message.info('物流详情')
    },
    handleViewShipDetail(order) {
      console.log('发货详情', order)
      this.$message.info('发货详情')
    },
    copyText(text) {
      const input = document.createElement('textarea')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('复制成功')
    },
    handleEditUserRemark(order) {
      if (order.locked) {
        this.$message.warning('锁单后禁止修改')
        return
      }
      this.remarkForm.type = 'user'
      this.remarkForm.content = order.userRemark || ''
      this.remarkForm.order = order
      this.remarkDialogVisible = true
    },
    handleEditMerchantRemark(order) {
      if (order.locked) {
        this.$message.warning('锁单后禁止修改')
        return
      }
      this.remarkForm.type = 'merchant'
      this.remarkForm.content = order.merchantRemark || ''
      this.remarkForm.order = order
      this.remarkDialogVisible = true
    },
    handleSaveRemark() {
      const order = this.remarkForm.order
      if (order) {
        if (this.remarkForm.type === 'merchant') {
          order.merchantRemark = this.remarkForm.content
        } else {
          order.userRemark = this.remarkForm.content
        }
      }
      this.remarkDialogVisible = false
      this.$message.success('备注已保存')
    },
    handleEditReceiver(order) {
      if (order.locked) {
        this.$message.warning('锁单后禁止修改')
        return
      }
      this.receiverForm.name = order.receiverName
      this.receiverForm.phone = order.receiverPhone
      this.receiverForm.address = order.receiverAddress
      this.receiverForm.order = order
      this.receiverDialogVisible = true
    },
    handleSaveReceiver() {
      const order = this.receiverForm.order
      if (order) {
        order.receiverName = this.receiverForm.name
        order.receiverPhone = this.receiverForm.phone
        order.receiverAddress = this.receiverForm.address
      }
      this.receiverDialogVisible = false
      this.$message.success('收货信息已保存')
    },
    handleApproveCancel(order) {
      this.currentAuditOrder = order
      this.auditDialogVisible = true
    },
    handleAuditConfirm(result) {
      const order = this.currentAuditOrder
      if (!order) return
      if (result.auditResult === 'approve') {
        order.status = 'canceled'
        this.$message.success('已通过取消申请')
      } else {
        order.status = 'pending'
        order.rejectReason = result.rejectReason
        this.$message.success('已驳回取消申请')
      }
      this.initStatistics()
      this.currentAuditOrder = null
    },
    handleUpdateReceiver(order) {
      const o = this.orders.find(x => x.id === order.id)
      if (o) {
        o.receiverName = order.receiverName
        o.receiverPhone = order.receiverPhone
        o.receiverAddress = order.receiverAddress
      }
    },
    handleUpdateRemark(order) {
      const o = this.orders.find(x => x.id === order.id)
      if (o) {
        o.userRemark = order.userRemark
        o.merchantRemark = order.merchantRemark
      }
    },
    handleUpdateExpress(order) {
      console.log('快递信息已更新', order)
    },
    initStatistics() {
      this.statistics = {
        pending: this.orders.filter(o => o.status === 'pending').length,
        receiving: this.orders.filter(o => o.status === 'receiving').length,
        completed: this.orders.filter(o => o.status === 'completed').length,
        canceling: this.orders.filter(o => o.status === 'canceling').length,
        canceled: this.orders.filter(o => o.status === 'canceled').length
      }
    },
    handleReset() {
      this.filterForm = {
        userId: '',
        trackingNo: '',
        source: '',
        dateRange: [],
        merchantName: ''
      }
    },
    handleSearch() {
      this.$message.success('查询成功')
    },
    handleStatClick(tab) {
      this.activeTab = tab
    },
    handleTabChange() {
      this.orders.forEach(o => {
        o.checked = false
      })
    },
    handleBatchLock() {
      const count = this.selectedCount
      this.orders.filter(o => o.checked).forEach(o => {
        o.locked = true
      })
      this.$message.success(`已锁定 ${count} 个订单`)
    },
    handleBatchUnlock() {
      const count = this.selectedCount
      this.orders.filter(o => o.checked).forEach(o => {
        o.locked = false
      })
      this.$message.success(`已解锁 ${count} 个订单`)
    },
    handleImport() {
      this.uploadFile = null
      this.importRecordDialogVisible = true
    },
    handleImportRecord() {
      this.importHistoryDrawerVisible = true
    },
    handleImportHistorySizeChange() {},
    handleImportHistoryPageChange() {},
    handleDownloadFile(row) {
      this.$message.success(`开始下载文件：${row.fileName}`)
    },
    handleDownloadTemplate() {
      this.$message.success('模板下载成功')
    },
    handleUploadClick() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx,.xls'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          this.uploadFile = file
        }
      }
      input.click()
    },
    handleDrop(e) {
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        this.uploadFile = file
      } else {
        this.$message.warning('请上传 .xlsx 或 .xls 格式文件')
      }
    },
    clearUploadFile() {
      this.uploadFile = null
    },
    handleConfirmImport() {
      if (!this.uploadFile) {
        this.$message.warning('请先选择要上传的文件')
        return
      }
      this.importLoading = true
      setTimeout(() => {
        this.importLoading = false
        this.uploadFile = null
        this.importRecordDialogVisible = false
        this.$message.success('导入成功，成功导入 50 条记录，失败 0 条')
      }, 1500)
    },
    handleExportShipping() {
      this.$message.info('发货数据导出')
    },
    handleExportSku() {
      this.$message.info('SKU发货导出')
    },
    handlePageSizeChange() {},
    handlePageChange() {}
  },
  mounted() {
    this.initStatistics()
  }
}
</script>

<style lang="scss" scoped>
.shipping-management {
  padding: 0;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-buttons {
  margin-left: auto;
}

.stat-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409EFF;
  }

  &.active {
    border-color: #409EFF;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: #fff;
    font-size: 24px;

    &.pending { background: #409EFF; }
    &.receiving { background: #E6A23C; }
    &.completed { background: #67C23A; }
    &.canceling { background: #F56C6C; }
    &.canceled { background: #909399; }
  }

  .stat-content {
    .stat-num {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.table-card {
  border-radius: 4px;
}

.table-toolbar {
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.order-composite-table {
  font-size: 12px;
  color: #303133;

  .order-table-head {
    display: grid;
    grid-template-columns: 36px minmax(260px, 1.7fr) 86px 86px minmax(190px, 1.2fr) minmax(180px, 1.15fr) 98px 108px;
    height: 34px;
    line-height: 34px;
    background: #d9d9d9;
    border: 1px solid #e5e7eb;
    border-bottom: 0;
    color: #303133;
    text-align: center;
  }

  .order-col {
    position: relative;
    min-width: 0;
    border-right: 1px solid #e5e7eb;

    &:last-child {
      border-right: 0;
    }
  }

  .order-col-check {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .order-group-list {
    padding-top: 10px;
  }

  .order-group {
    border: 1px solid #e5e7eb;
    background: #fff;

    & + .order-group {
      margin-top: 10px;
    }
  }

  .order-group-header {
    display: grid;
    grid-template-columns: 36px 1fr 120px;
    align-items: center;
    min-height: 58px;
    padding: 6px 0;
    background: #f3f6fc;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-check {
    display: flex;
    justify-content: center;
  }

  .header-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    min-width: 0;
    color: #606266;
  }

  .header-entity {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 150px;
    max-width: 240px;
    padding-right: 16px;
    border-right: 1px solid #dcdfe6;
  }

  .header-entity-title {
    min-width: 0;
    overflow: hidden;
    color: #303133;
    font-weight: 500;
    line-height: 28px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-order-meta {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 18px;
    min-width: 260px;

    span:first-child {
      color: #303133;
      font-weight: 500;
    }
  }

  .header-order-no {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .copy-icon {
    color: #409eff;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      color: #66b1ff;
    }
  }

  .el-avatar {
    background: #409eff;
    color: #fff;
    font-size: 12px;
  }

  .header-lock {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #303133;
  }

  .order-group-body {
    display: grid;
    grid-template-columns: minmax(260px, 1.7fr) 86px 86px minmax(190px, 1.2fr) minmax(180px, 1.15fr) 98px 108px;
    margin-left: 36px;
    min-height: 86px;
  }

  .order-products {
    display: grid;
    grid-column: 1 / span 2;
    grid-template-columns: minmax(260px, 1fr) 86px;
  }

  .order-product-row {
    display: contents;
  }

  .product-cell,
  .count-cell,
  .freight-cell,
  .receiver-cell,
  .remark-cell,
  .status-cell,
  .action-cell {
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #eef0f5;
    box-sizing: border-box;
  }

  .order-product-row:last-child {
    .product-cell,
    .count-cell {
      border-bottom: 0;
    }
  }

  .product-cell {
    display: flex;
    gap: 10px;
    min-height: 78px;
    padding: 10px 12px;
  }

  .goods-img {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    border-radius: 4px;
    background: #f5f7fa;
    object-fit: cover;
  }

  .goods-info {
    min-width: 0;
    line-height: 18px;
  }

  .goods-name {
    color: #303133;
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .goods-sub,
  .goods-id {
    margin-top: 2px;
    color: #909399;
  }

  .count-cell,
  .freight-cell,
  .status-cell,
  .action-cell {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 14px 10px;
    text-align: center;
  }

  .receiver-cell,
  .remark-cell {
    padding: 14px 12px;
    line-height: 20px;
  }

  .receiver-top {
    margin-bottom: 6px;

    .receiver-phone {
      margin-left: 8px;
      color: #606266;
    }
  }

  .receiver-bottom {
    display: flex;
    align-items: center;
  }

  .receiver-addr,
  .remark-text {
    flex: 1;
    min-width: 0;
    color: #606266;
  }

  .remark-line {
    display: flex;
    align-items: flex-start;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .remark-label {
    flex-shrink: 0;
    color: #303133;
  }

  .status-cell {
    flex-direction: column;
    align-items: center;
    color: #303133;
  }

  .logistics-link,
  .action-cell .el-button--text {
    color: #1677ff;
    cursor: pointer;
  }

  .cancel-reason {
    margin-top: 6px;
    color: #ff7a00;
  }

  .action-cell {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    border-right: 0;

    .el-button {
      margin: 0;
      min-width: 54px;
    }

    .orange-btn {
      background: #ff7a00;
      border-color: #ff7a00;
      color: #fff;
    }
  }

  .order-expand-row {
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border-top: 1px solid #eef0f5;
    background: #fafafa;
    color: #1677ff;
    cursor: pointer;
  }
}

.ellipsis {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-icon {
  color: #409eff;
  cursor: pointer;
  margin-left: 4px;
  font-size: 14px;
}

.import-dialog-content {
  padding: 20px 0;
}

.template-tips {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;

  p {
    font-size: 12px;
    color: #909399;
    margin: 4px 0;
  }
}

.upload-area {
  margin-top: 16px;
  padding: 40px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background: #f0f5ff;
  }

  i {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #606266;
    margin: 4px 0;
  }

  .upload-hint {
    font-size: 12px;
    color: #909399;
  }
}

.upload-file-info {
  margin-top: 12px;
  padding: 12px;
  background: #f0f5ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 18px;
    color: #409eff;
  }

  span {
    flex: 1;
    font-size: 13px;
    color: #303133;
  }

  .el-icon-close {
    font-size: 16px;
    color: #909399;
    cursor: pointer;

    &:hover {
      color: #f56c6c;
    }
  }
}

.import-history-content {
  padding: 16px;

  .error-text {
    color: #f56c6c;
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #909399;

    i {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
      color: #dcdfe6;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .file-link {
    color: #409eff;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
