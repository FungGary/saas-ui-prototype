<template>
  <div class="delivery-detail-page">
    <div class="status-card detail-card">
      <div class="status-header">
        <div class="order-status-text">
          当前状态：
          <el-tag :type="getStatusTagType(detailData.status)" size="medium" effect="light">
            {{ getStatusText(detailData.status) }}
          </el-tag>
        </div>
        <el-steps :active="activeStep" align-center finish-status="finish" class="order-steps">
          <el-step
            v-for="(step, idx) in stepList"
            :key="idx"
            :title="step.title"
            :description="step.time || ''"
          />
        </el-steps>
        <annotation-point
          title="订单流程步骤条"
          content="功能说明：展示订单当前进度和状态。&#10;&#10;业务说明：步骤包括：待发货、已发货、待收货、已完成；根据当前状态高亮对应步骤。&#10;&#10;状态流转：待发货→待收货→已完成。&#10;&#10;状态适用：全部状态。"
          priority="P0"
        />
      </div>
      <div class="action-row">
        <template v-if="detailData.status === 'pending'">
          <span class="ship-btn-wrapper">
            <el-tooltip v-if="detailData.locked" content="订单已锁单，暂不可发货" placement="top">
              <el-button type="primary" size="mini" disabled>发货</el-button>
            </el-tooltip>
            <el-button v-else type="primary" size="mini" @click="handleShip">发货</el-button>
            <annotation-point
              title="发货按钮"
              content="功能说明：点击打开发货操作弹窗。&#10;&#10;业务说明：仅待发货且未锁单状态下可点击；锁单状态下按钮禁用。&#10;&#10;逻辑说明：点击发货按钮→打开发货弹窗→填写物流信息→确认发货→订单状态变为待收货。&#10;&#10;状态流转：待发货→待收货。&#10;&#10;状态适用：待发货（未锁单）。"
              priority="P0"
            />
          </span>
          <el-button v-if="canEditRemark" size="mini" @click="handleEditRemark">
            修改备注
            <annotation-point
              title="修改备注按钮"
              content="功能说明：点击修改商家备注和用户备注。&#10;&#10;业务说明：所有状态下都可修改备注，锁单状态下不可修改。&#10;&#10;逻辑说明：点击修改备注→弹出编辑弹窗→保存后更新备注。&#10;&#10;状态适用：全部状态（未锁单）。"
              priority="P1"
            />
          </el-button>
          <span class="edit-address-btn-wrapper">
            <el-tooltip v-if="detailData.locked" content="订单已锁单，无法修改收货信息" placement="top">
              <el-button size="mini" disabled>修改收货信息</el-button>
            </el-tooltip>
            <el-button v-else-if="canEditReceiver" size="mini" @click="handleEditAddress">修改收货信息</el-button>
            <el-button v-else size="mini" disabled>修改收货信息</el-button>
            <annotation-point
              title="修改收货信息按钮"
              content="功能说明：点击修改收货人、手机号、收货地址。&#10;&#10;业务说明：除已完成、已取消状态外，其他状态未锁单时可修改收货信息；锁单或终态下不可修改。&#10;&#10;逻辑说明：点击修改收货信息→弹出编辑弹窗→保存后更新收货信息。&#10;&#10;状态适用：待发货、待收货、申请取消（未锁单）。"
              priority="P0"
            />
          </span>
        </template>

        <template v-else-if="detailData.status === 'receiving'">
          <span class="view-logistics-wrapper">
            <el-button type="primary" size="mini" @click="handleViewLogistics()">查看物流</el-button>
            <annotation-point
              title="查看物流按钮"
              content="功能说明：点击查看物流详情信息。&#10;&#10;业务说明：仅待收货和已完成状态显示，用于查看快递物流轨迹。&#10;&#10;逻辑说明：点击查看物流→弹出物流详情弹窗→显示物流轨迹信息。&#10;&#10;状态适用：待收货、已完成。"
              priority="P0"
            />
          </span>
          <el-button v-if="canEditRemark" size="mini" @click="handleEditRemark">修改备注</el-button>
          <el-button v-if="canEditReceiver" size="mini" @click="handleEditAddress">修改收货信息</el-button>
          <el-button v-else size="mini" disabled>修改收货信息</el-button>
        </template>

        <template v-else-if="detailData.status === 'completed'">
          <span class="view-logistics-wrapper">
            <el-button type="primary" size="mini" @click="handleViewLogistics()">查看物流</el-button>
            <annotation-point
              title="查看物流按钮"
              content="功能说明：点击查看物流详情信息。&#10;&#10;业务说明：仅待收货和已完成状态显示，用于查看快递物流轨迹。&#10;&#10;逻辑说明：点击查看物流→弹出物流详情弹窗→显示物流轨迹信息。&#10;&#10;状态适用：待收货、已完成。"
              priority="P0"
            />
          </span>
          <el-button v-if="canEditRemark" size="mini" @click="handleEditRemark">
            修改备注
            <annotation-point
              title="修改备注按钮"
              content="功能说明：点击修改商家备注和用户备注。&#10;&#10;业务说明：所有状态下都可修改备注，锁单状态下不可修改。&#10;&#10;逻辑说明：点击修改备注→弹出编辑弹窗→保存后更新备注。&#10;&#10;状态适用：全部状态（未锁单）。"
              priority="P1"
            />
          </el-button>
        </template>

        <template v-else-if="detailData.status === 'canceling'">
          <span class="audit-btn-wrapper">
            <el-tooltip v-if="detailData.locked" content="订单已锁单，暂不可审核" placement="top">
              <el-button type="primary" size="mini" disabled>审核</el-button>
            </el-tooltip>
            <el-button v-else type="primary" size="mini" @click="handleAudit">审核</el-button>
            <annotation-point
              title="审核按钮"
              content="功能说明：点击审核用户的取消申请。&#10;&#10;业务说明：仅申请取消状态下显示，用于审核用户的取消申请。&#10;&#10;逻辑说明：点击审核按钮→弹出审核弹窗→选择同意取消或拒绝取消→拒绝需填写拒绝原因→确认后更新订单状态。&#10;&#10;状态流转：申请取消→已取消（同意）；申请取消→待发货（拒绝）。&#10;&#10;状态适用：申请取消（未锁单）。"
              priority="P0"
            />
          </span>
          <el-button v-if="canEditRemark" size="mini" @click="handleEditRemark">
            修改备注
            <annotation-point
              title="修改备注按钮"
              content="功能说明：点击修改商家备注和用户备注。&#10;&#10;业务说明：所有状态下都可修改备注，锁单状态下不可修改。&#10;&#10;逻辑说明：点击修改备注→弹出编辑弹窗→保存后更新备注。&#10;&#10;状态适用：全部状态（未锁单）。"
              priority="P1"
            />
          </el-button>
          <span class="edit-address-btn-wrapper">
            <el-tooltip v-if="detailData.locked" content="订单已锁单，无法修改收货信息" placement="top">
              <el-button size="mini" disabled>修改收货信息</el-button>
            </el-tooltip>
            <el-button v-else-if="canEditReceiver" size="mini" @click="handleEditAddress">修改收货信息</el-button>
            <el-button v-else size="mini" disabled>修改收货信息</el-button>
            <annotation-point
              title="修改收货信息按钮"
              content="功能说明：点击修改收货人、手机号、收货地址。&#10;&#10;业务说明：除已完成、已取消状态外，其他状态未锁单时可修改收货信息；锁单或终态下不可修改。&#10;&#10;逻辑说明：点击修改收货信息→弹出编辑弹窗→保存后更新收货信息。&#10;&#10;状态适用：待发货、待收货、申请取消（未锁单）。"
              priority="P0"
            />
          </span>
        </template>

        <template v-else-if="detailData.status === 'canceled'">
          <el-button v-if="canEditRemark" size="mini" @click="handleEditRemark">
            修改备注
            <annotation-point
              title="修改备注按钮"
              content="功能说明：点击修改商家备注和用户备注。&#10;&#10;业务说明：所有状态下都可修改备注，锁单状态下不可修改。&#10;&#10;逻辑说明：点击修改备注→弹出编辑弹窗→保存后更新备注。&#10;&#10;状态适用：全部状态（未锁单）。"
              priority="P1"
            />
          </el-button>
        </template>

        <el-button
          v-if="!detailData.locked && (detailData.status === 'pending' || detailData.status === 'canceling')"
          type="danger"
          size="mini"
          @click="handleLock"
        >
          锁单
        </el-button>
        <el-button v-if="detailData.locked" type="success" size="mini" @click="handleUnlock">
          解锁
          <annotation-point
            title="解锁按钮"
            content="功能说明：解锁订单，恢复可操作状态。&#10;&#10;业务说明：已锁定状态下显示，点击后解锁订单，恢复可操作状态。&#10;&#10;逻辑说明：点击解锁→订单解锁→按钮变为锁单。&#10;&#10;状态适用：待发货、待收货、申请取消（已锁单）。"
            priority="P0"
          />
        </el-button>
        <el-button size="mini" class="back-btn" @click="goBack">
          <i class="el-icon-arrow-left"></i> 返回列表
        </el-button>
      </div>
    </div>

    <div class="info-card detail-card">
      <div class="info-column">
        <div class="section-title">
          订单信息
          <annotation-point
            title="订单信息区"
            content="功能说明：展示订单号、来源、源单号、锁单状态、运费、创建时间、申请时间等信息。&#10;&#10;业务说明：展示订单的基本信息，包含取消原因、取消时间等状态相关信息。&#10;&#10;状态适用：全部状态。"
            priority="P0"
          />
        </div>
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ detailData.shipmentNo }}</span>
        </div>
        <div class="info-item">
          <span class="label">订单来源：</span>
          <span class="value">{{ detailData.sourceName }}</span>
        </div>
        <div class="info-item">
          <span class="label">源单号：</span>
          <span class="value copy-text" @click="copyText(detailData.sourceNo)">
            {{ detailData.sourceNo }}
            <i class="el-icon-document-copy"></i>
          </span>
        </div>
        <div class="info-item">
          <span class="label">锁单状态：</span>
          <span class="value">
            <el-tag v-if="detailData.locked" type="danger" size="mini">已锁单</el-tag>
            <el-tag v-else size="mini">未锁单</el-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="label">运费：</span>
          <span class="value">{{ detailData.freight || 0 }} 元</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ detailData.createTime }}</span>
        </div>
        <div class="info-item">
          <span class="label">申请时间：</span>
          <span class="value">{{ detailData.applyTime }}</span>
        </div>
        <template v-if="isCancelStatus">
          <div class="info-item">
            <span class="label">取消原因：</span>
            <span class="value cancel-reason">{{ detailData.cancelReason || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">取消申请时间：</span>
            <span class="value">{{ detailData.cancelApplyTime || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">取消通过时间：</span>
            <span class="value">{{ detailData.cancelPassTime || '--' }}</span>
          </div>
        </template>
      </div>

      <div class="info-column has-border">
        <div class="section-title">
          收货信息
          <el-tooltip v-if="detailData.locked" content="订单已锁单，不可修改" placement="top">
            <i class="el-icon-lock lock-icon"></i>
          </el-tooltip>
          <annotation-point
            title="收货信息区"
            content="功能说明：展示收货人、联系电话、收货地址等信息，支持内联编辑。&#10;&#10;业务说明：除已完成、已取消状态外，其他状态未锁单时可编辑收货信息；锁单或终态下不可编辑。&#10;&#10;逻辑说明：点击编辑图标→进入编辑状态→修改后保存/取消。&#10;&#10;状态适用：全部状态。"
            priority="P0"
          />
        </div>
        <div class="info-item">
          <span class="label">收货人：</span>
          <span class="value">{{ detailData.receiver.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">手机号码：</span>
          <span class="value">{{ detailData.receiver.phone }}</span>
        </div>
        <div class="info-item address-item">
          <span class="label">收货地址：</span>
          <div class="value address-value">
            <span class="copy-text" @click="copyText(detailData.receiver.fullAddress)">
              {{ detailData.receiver.fullAddress }}
              <i class="el-icon-document-copy"></i>
            </span>
          </div>
        </div>
        <div class="info-item">
          <span class="label">修改次数：</span>
          <span class="value">{{ detailData.receiver.addressModifyCount || 0 }} 次</span>
        </div>
      </div>

      <div class="info-column has-border">
        <div class="section-title">
          商品信息
          <annotation-point
            title="商品信息区"
            content="功能说明：展示商品昵称、编号、手机号、备注等信息。&#10;&#10;业务说明：展示下单商品的完整信息，方便客服联系用户；备注支持编辑。&#10;&#10;状态适用：全部状态。"
            priority="P0"
          />
        </div>
        <div class="info-item">
          <span class="label">用户昵称：</span>
          <span class="value">{{ detailData.user.nickname }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户编号：</span>
          <span class="value">{{ detailData.user.userNo }}</span>
        </div>
        <div class="info-item">
          <span class="label">手机号码：</span>
          <span class="value">{{ formatPhone(detailData.user.phone) }}</span>
        </div>
        <div class="info-item remark-item">
          <span class="label">用户备注：</span>
          <div class="value remark-value">
            <span class="remark-text">{{ remarks.userRemark || '-' }}</span>
          </div>
        </div>
        <div class="info-item remark-item">
          <span class="label">商家备注：</span>
          <div class="value remark-value">
            <span class="remark-text">{{ remarks.merchantRemark || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="goods-card detail-card">
      <div class="block-title">
        <span class="title-icon">📦</span>
        <span>商品清单</span>
        <annotation-point
          title="商品清单"
          content="功能说明：展示订单中的所有商品信息，支持按SKU聚合或按数量展示。&#10;&#10;业务说明：显示商品图片、名称、规格、分类、商品ID、数量、已发/待发数量等信息。&#10;&#10;状态适用：全部状态。"
          priority="P0"
        />
      </div>

      <div class="summary-bar">
        <span>总计数量：<b>{{ goodsStats.totalQty }}</b> 件</span>
        <span>总计 SKU：<b>{{ goodsStats.totalSku }}</b> 个</span>
        <span>已发货：<b class="blue">{{ goodsStats.shippedQty }}</b> 件</span>
        <span>待发货：<b class="red">{{ goodsStats.pendingQty }}</b> 件</span>
      </div>

      <el-table
        :data="displayGoodsData"
        class="detail-table"
        :header-cell-style="tableHeaderStyle"
        :cell-style="tableCellStyle"
      >
        <el-table-column label="商品信息" min-width="360">
          <template slot-scope="scope">
            <div class="goods-info">
              <el-image v-if="scope.row.goodsImage" :src="scope.row.goodsImage" fit="cover" class="goods-img" />
              <div v-else class="goods-img goods-img-placeholder">
                <i class="el-icon-goods"></i>
              </div>
              <div class="goods-text">
                <div class="goods-name">{{ scope.row.goodsName }}</div>
                <div class="goods-spec">规格：{{ scope.row.spec || '默认' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="goodsId" label="商品ID" width="120" />
        <el-table-column label="数量" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.quantity }}
          </template>
        </el-table-column>

        <el-table-column label="已发/待发" width="110" align="center">
          <template slot-scope="scope">
            {{ scope.row.shippedQty || 0 }} / {{ scope.row.pendingQty || 0 }}
          </template>
        </el-table-column>

        <el-table-column v-if="detailData.sourceType === 'backpack'" label="获得方式" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.obtainType || '背包提货' }}
          </template>
        </el-table-column>

        <el-table-column v-if="detailData.sourceType === 'points_mall'" label="兑换积分" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.exchangePoints || 0 }}积分
          </template>
        </el-table-column>

        <el-table-column label="发货状态" width="110" align="center">
          <template slot-scope="scope">
            <span>{{ getShipStatusText(scope.row) }}</span>
          </template>
        </el-table-column>

        <el-table-column v-if="canSplit" label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleSplitGoods(scope.row)">拆分</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="showPackageCard" class="package-card detail-card">
      <div class="block-title">
        <span class="title-icon">📘</span>
        <span>发货信息</span>
      </div>

      <div v-if="!packageList.length" class="empty-state">
        <i class="el-icon-box"></i>
        <span>暂无发货信息</span>
      </div>

      <el-table
        v-else
        :data="packageList"
        class="detail-table"
        :header-cell-style="tableHeaderStyle"
        :cell-style="tableCellStyle"
      >
        <el-table-column prop="packageNo" label="包裹编号" width="160" />
        <el-table-column prop="expressCompany" label="快递公司" width="140" />
        <el-table-column label="快递单号" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.expressNo }}</span>
            <el-button type="text" size="mini" @click="copyText(scope.row.expressNo)">
              复制
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="shipTime" label="发货时间" width="180" />
        <el-table-column prop="shipper" label="发货人" width="120" />
        <el-table-column label="物流状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag
              size="mini"
              :type="getLogisticsTagType(scope.row.logisticsStatus)"
            >
              {{ getLogisticsStatusText(scope.row.logisticsStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleViewLogistics(scope.row)">
              查看物流
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="operation-log-card detail-card">
      <div class="block-title">
        <span class="title-icon">📋</span>
        <span>操作记录</span>
      </div>

      <el-table
        :data="operationLogList"
        class="detail-table"
        :header-cell-style="tableHeaderStyle"
        :cell-style="tableCellStyle"
      >
        <el-table-column prop="operationType" label="操作类型" width="140">
          <template slot-scope="scope">
            <el-tag size="mini" :type="getOperationTagType(scope.row.operationType)">
              {{ scope.row.operationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationContent" label="操作内容" min-width="260" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="operatorRole" label="操作角色" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.operatorRole || '管理员' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="160">
          <template slot-scope="scope">
            <span>{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <order-delivery-drawer
      :visible.sync="shipDrawerVisible"
      :order-data="shipDrawerOrderData"
      :mode="'ship'"
      @update:visible="shipDrawerVisible = $event"
      @ship-success="handleShipSuccess"
      @update-receiver="handleDrawerUpdateReceiver"
      @update-remark="handleDrawerUpdateRemark"
      @update-express="handleDrawerUpdateExpress"
      @switch-mode="$emit('switch-mode', $event)"
    />

    <el-dialog title="修改收货信息" :visible.sync="addressDialogVisible" width="500px" append-to-body>
      <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择省市区"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="addressForm.detailAddress" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditAddress">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="物流详情" :visible.sync="logisticsDialogVisible" width="700px" append-to-body>
      <div v-if="currentLogistics" class="logistics-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="快递公司">{{ currentLogistics.expressCompany }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">
            {{ currentLogistics.expressNo }}
            <el-button type="text" size="mini" @click="copyText(currentLogistics.expressNo)">
              <i class="el-icon-document-copy"></i> 复制
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="物流状态">
            <el-tag size="mini" :type="getLogisticsTagType(currentLogistics.status)">
              {{ getLogisticsStatusText(currentLogistics.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentLogistics.updateTime }}</el-descriptions-item>
        </el-descriptions>
        <el-timeline :reverse="true" size="small" class="logistics-timeline">
          <el-timeline-item
            v-for="(node, index) in currentLogistics.nodes"
            :key="index"
            :timestamp="node.time"
            placement="top"
          >
            <div class="logistics-node">
              <div class="node-status">{{ node.status }}</div>
              <div class="node-location">{{ node.location }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else class="empty-state">
        <span>暂无物流信息</span>
      </div>
      <span slot="footer">
        <el-button @click="logisticsDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <cancel-audit-dialog
      :visible.sync="auditDialogVisible"
      :cancel-reason="detailData.cancelReason"
      @confirm="handleAuditConfirm"
    />

    <el-dialog title="修改备注" :visible.sync="remarkEditDialogVisible" width="500px" append-to-body>
      <el-form :model="remarkForm" label-width="100px">
        <el-form-item label="用户备注">
          <el-input
            v-model="remarkForm.userRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入用户备注"
          />
        </el-form-item>
        <el-form-item label="商家备注">
          <el-input
            v-model="remarkForm.merchantRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入商家备注"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="remarkEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRemark">保存</el-button>
      </span>
      <annotation-point
        title="修改备注弹窗"
        content="功能说明：编辑用户备注和商家备注信息。&#10;&#10;业务说明：所有状态下都可编辑备注，锁单状态下不可编辑（按钮隐藏）。&#10;&#10;逻辑说明：点击修改备注按钮/编辑图标→弹出备注编辑弹窗→填写备注→保存后更新备注信息。&#10;&#10;状态适用：全部状态（未锁单）。"
        priority="P1"
      />
    </el-dialog>
  </div>
</template>

<script>
import OrderDeliveryDrawer from './OrderDeliveryDrawer.vue';
import CancelAuditDialog from './CancelAuditDialog.vue';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'ShippingOrderDetail',
  components: {
    OrderDeliveryDrawer,
    CancelAuditDialog,
    AnnotationPoint,
  },
  props: {
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      detailData: {},
      goodsDisplayMode: 'sku',
      shipDrawerVisible: false,
      shipDrawerOrderData: {},
      addressDialogVisible: false,
      remarkEditDialogVisible: false,
      remarkForm: { userRemark: '', merchantRemark: '' },
      addressForm: { name: '', phone: '', region: [], detailAddress: '' },
      addressRules: {
        name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      },
      regionOptions: [],
      logisticsDialogVisible: false,
      currentLogistics: null,
      editField: {
        receiver: '',
        userRemark: false,
        merchantRemark: false
      },
      editReceiverForm: {
        name: '',
        phone: '',
        detailAddress: '',
        fullAddress: ''
      },
      editUserRemark: '',
      editMerchantRemark: '',
      operationLogList: [],
      auditDialogVisible: false
    };
  },
  computed: {
    isCancelStatus() {
      return this.detailData.status === 'canceling' || this.detailData.status === 'canceled';
    },
    canEditReceiver() {
      if (this.detailData.locked) return false;
      if (this.detailData.status === 'completed' || this.detailData.status === 'canceled') return false;
      return true;
    },
    canEditRemark() {
      if (this.detailData.locked) return false;
      return true;
    },
    canShip() {
      if (this.detailData.locked) return false;
      if (this.detailData.status !== 'pending') return false;
      if (this.goodsStats.pendingQty === 0) return false;
      return true;
    },
    canSplit() {
      if (this.detailData.locked) return false;
      if (this.detailData.status === 'completed' || this.detailData.status === 'canceled') return false;
      return false;
    },
    stepList() {
      const status = this.detailData.status;
      const data = this.detailData;

      if (status === 'canceling' || status === 'canceled') {
        return [
          { title: '用户申请提货', time: data.applyTime || '' },
          { title: '用户申请取消', time: data.cancelApplyTime || '' },
          { title: '等待后台审核', time: (status === 'canceled') ? (data.cancelPassTime || '') : '' },
          {
            title: status === 'canceled' ? '订单已取消' : '取消完成/恢复发货',
            time: status === 'canceled' ? (data.cancelPassTime || '') : ''
          }
        ];
      }

      return [
        { title: '用户申请提货', time: data.applyTime || '' },
        {
          title: status === 'pending' ? '等待商家发货' : '商家已发货',
          time: data.shipTime || ''
        },
        {
          title: status === 'completed' ? '用户收货/系统完成' : '等待收货',
          time: (status === 'completed') ? (data.completeTime || '') : ''
        },
        {
          title: '订单完成',
          time: status === 'completed' ? (data.completeTime || '') : ''
        }
      ];
    },
    activeStep() {
      const status = this.detailData.status;
      const map = {
        pending: 2,
        receiving: 3,
        completed: 4,
        canceling: 3,
        canceled: 4
      };
      return map[status] || 1;
    },
    remarks() {
      return {
        userRemark: this.detailData.receiver?.userRemark || '',
        merchantRemark: this.detailData.remarks?.merchantRemark || '',
        shipRemark: this.detailData.remarks?.shipRemark || ''
      };
    },
    packageList() {
      return this.detailData.packages || [];
    },
    goodsStats() {
      const items = this.detailData.goodsItems || [];
      const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalSku = new Set(items.map(item => item.skuId)).size;
      const shippedQty = items
        .filter(item => item.shipStatus === 'shipped')
        .reduce((sum, item) => sum + (item.quantity || 0), 0);
      const pendingQty = items
        .filter(item => item.shipStatus !== 'shipped' && item.shipStatus !== 'canceled')
        .reduce((sum, item) => sum + (item.quantity || 0), 0);
      return { totalQty, totalSku, shippedQty, pendingQty };
    },
    displayGoodsData() {
      if (this.goodsDisplayMode === 'sku') {
        return this.getSkuGroupedData();
      }
      return this.getQuantityData();
    },
    showPackageCard() {
      const status = this.detailData.status;
      if (status === 'receiving' || status === 'completed') {
        return true;
      }
      if (status === 'canceling') {
        return this.packageList.length > 0;
      }
      return false;
    }
  },
  watch: {
    orderData: {
      immediate: true,
      handler(val) {
        if (val) {
          this.initDetailData();
        }
      }
    },
    'detailData.sourceType'(val) {
      this.goodsDisplayMode = val === 'backpack' ? 'quantity' : 'sku';
    }
  },
  mounted() {
    if (!this.orderData || !Object.keys(this.orderData).length) {
      const orderNo = this.$route.query.orderNo;
      const mockType = this.$route.query.mockType;
      const status = this.$route.query.status || 'pending';
      if (orderNo) {
        this.detailData = this.getMockData(status, mockType);
        this.$nextTick(() => {
          this.initOperationLogs();
        });
      }
    }
  },
  methods: {
    tableHeaderStyle() {
      return {
        background: '#f5f7fa',
        color: '#606266',
        fontWeight: 600,
        fontSize: '13px',
        height: '42px'
      };
    },
    tableCellStyle() {
      return {
        color: '#303133',
        fontSize: '13px',
        height: '54px'
      };
    },
    initDetailData() {
      const data = this.orderData || {};
      const status = data.status || 'pending';
      const mockType = data.mockType || 'backpack';
      this.detailData = this.getMockData(status, mockType);
      this.initOperationLogs();
    },
    getMockData(status, mockType) {
      const isPoints = mockType === 'points_mall';
      const baseData = {
        shipmentNo: isPoints ? 'FH202606250002' : 'FH202606250001',
        sourceType: isPoints ? 'points_mall' : 'backpack',
        sourceName: isPoints ? '积分商城' : '背包',
        sourceNo: isPoints ? 'JFDD202606250001' : 'TH202606250001',
        status: status,
        locked: false,
        freight: isPoints ? 0 : 12,
        createTime: '2026-03-05 17:46:36',
        applyTime: '2026-03-05 17:46:36',
        shipTime: '',
        completeTime: '',
        cancelReason: '',
        cancelApplyTime: '',
        cancelPassTime: '',
        user: {
          uid: isPoints ? 102 : 101,
          userNo: isPoints ? '10002' : '10001',
          nickname: isPoints ? '李四' : '张三',
          phone: isPoints ? '13699887766' : '18577889966',
          avatar: ''
        },
        receiver: {
          name: isPoints ? '李四' : '陈某某',
          phone: isPoints ? '13699887766' : '18577889966',
          province: isPoints ? '北京市' : '广东省',
          city: isPoints ? '北京市' : '深圳市',
          district: isPoints ? '朝阳区' : '龙华区',
          detailAddress: isPoints ? '建国路88号SOHO现代城A座2201' : '某某街道123号某某小区1栋1001',
          fullAddress: isPoints
            ? '北京市朝阳区建国路88号SOHO现代城A座2201'
            : '广东省深圳市龙华区某某街道123号某某小区1栋1001',
          addressModifyCount: 1,
          userRemark: isPoints ? '请尽快发货' : '请在工作日配送'
        },
        goodsItems: isPoints
          ? [
              {
                itemId: 'JFITEM001',
                goodsId: 88888,
                skuId: 'SKU88888',
                goodsName: 'JELLYCAT龙年限定款毛绒公仔',
                goodsImage: '',
                category: '毛绒公仔',
                spec: '龙年限定款',
                quantity: 2,
                obtainType: '积分兑换',
                exchangePoints: 5000,
                shipStatus: 'pending',
                shippedQty: 0,
                pendingQty: 2,
                packageNo: ''
              }
            ]
          : [
              {
                itemId: 'ITEM001',
                goodsId: 87763,
                skuId: 'SKU87763',
                goodsName: '迪士尼100周年系列Jolu挂件',
                goodsImage: '',
                category: '玩具公仔',
                spec: '默认',
                quantity: 1,
                obtainType: '盲盒获得',
                shipStatus: 'pending',
                shippedQty: 0,
                pendingQty: 1,
                packageNo: ''
              },
              {
                itemId: 'ITEM002',
                goodsId: 87789,
                skuId: 'SKU87789',
                goodsName: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高',
                goodsImage: '',
                category: '毛绒公仔',
                spec: '12cm',
                quantity: 2,
                obtainType: '盲盒获得',
                shipStatus: 'pending',
                shippedQty: 0,
                pendingQty: 2,
                packageNo: ''
              }
            ],
        packages: [],
        remarks: {
          userRemark: isPoints ? '请尽快发货' : '请在工作日配送',
          merchantRemark: isPoints ? '高价值商品' : 'VIP客户优先处理',
          shipRemark: ''
        }
      };

      if (status === 'receiving') {
        baseData.locked = isPoints;
        baseData.shipTime = '2026-06-23 18:46:35';
        baseData.goodsItems = baseData.goodsItems.map(item => ({
          ...item,
          shipStatus: 'shipped',
          shippedQty: item.quantity,
          pendingQty: 0,
          packageNo: 'PK202606230001'
        }));
        baseData.packages = [
          {
            packageNo: 'PK202606230001',
            expressCompany: '顺丰快递',
            expressNo: 'SF9876543210',
            goodsCount: baseData.goodsItems.reduce((s, i) => s + i.quantity, 0),
            freight: baseData.freight,
            shipTime: '2026-06-23 18:46:35',
            shipper: 'admin',
            logisticsStatus: 'transit',
            updateTime: '2026-06-24 08:15:00'
          }
        ];
      }

      if (status === 'completed') {
        baseData.shipTime = '2026-06-20 15:00:00';
        baseData.completeTime = '2026-06-24 10:30:00';
        baseData.goodsItems = baseData.goodsItems.map(item => ({
          ...item,
          shipStatus: 'shipped',
          shippedQty: item.quantity,
          pendingQty: 0,
          packageNo: 'PK202606200001'
        }));
        baseData.packages = [
          {
            packageNo: 'PK202606200001',
            expressCompany: '顺丰快递',
            expressNo: 'SF1234567890',
            goodsCount: baseData.goodsItems.reduce((s, i) => s + i.quantity, 0),
            freight: baseData.freight,
            shipTime: '2026-06-20 15:00:00',
            shipper: 'admin',
            logisticsStatus: 'signed',
            updateTime: '2026-06-24 10:30:00'
          }
        ];
      }

      if (status === 'canceling') {
        baseData.cancelReason = '不想要了';
        baseData.cancelApplyTime = '2026-03-06 10:20:00';
        baseData.cancelPassTime = '';
        if (isPoints) {
          baseData.shipTime = '2026-06-23 18:46:35';
          baseData.goodsItems = baseData.goodsItems.map(item => ({
            ...item,
            shipStatus: 'shipped',
            shippedQty: item.quantity,
            pendingQty: 0,
            packageNo: 'PK202606230002'
          }));
          baseData.packages = [
            {
              packageNo: 'PK202606230002',
              expressCompany: '顺丰快递',
              expressNo: 'SF9876543210987',
              shipTime: '2026-06-23 18:46:35',
              shipper: 'admin',
              logisticsStatus: 'transit',
              updateTime: '2026-06-24 09:20:00'
            }
          ];
        }
      }

      if (status === 'canceled') {
        baseData.cancelReason = '不想要了';
        baseData.cancelApplyTime = '2026-03-06 10:20:00';
        baseData.cancelPassTime = '2026-03-06 11:30:00';
        baseData.goodsItems = baseData.goodsItems.map(item => ({
          ...item,
          shipStatus: 'canceled',
          shippedQty: 0,
          pendingQty: 0,
          packageNo: ''
        }));
      }

      return baseData;
    },
    initOperationLogs() {
      const logs = [];
      const data = this.detailData;

      logs.push({
        operationType: '创建订单',
        operationContent: '用户提交发货申请',
        operator: data.user?.nickname || '用户',
        operatorRole: '用户',
        operationTime: data.applyTime || '',
        remark: ''
      });

      if (data.locked) {
        logs.unshift({
          operationType: '锁单',
          operationContent: '高价值商品风控锁单',
          operator: 'system',
          operatorRole: '系统',
          operationTime: '2026-06-21 09:00:00',
          remark: '系统自动'
        });
      }

      if (data.status === 'receiving' || data.status === 'completed') {
        logs.push({
          operationType: '发货',
          operationContent: `订单已发货，快递：${data.packages?.[0]?.expressCompany || '顺丰快递'}`,
          operator: 'admin',
          operatorRole: '管理员',
          operationTime: data.shipTime || '2026-06-23 18:46:35',
          remark: data.packages?.[0]?.expressNo || ''
        });
      }

      if (data.status === 'completed') {
        logs.push({
          operationType: '确认收货',
          operationContent: '用户确认收货，订单完成',
          operator: data.user?.nickname || '用户',
          operatorRole: '用户',
          operationTime: data.completeTime || '',
          remark: ''
        });
      }

      if (data.status === 'canceling') {
        logs.push({
          operationType: '申请取消',
          operationContent: `用户申请取消订单，原因：${data.cancelReason}`,
          operator: data.user?.nickname || '用户',
          operatorRole: '用户',
          operationTime: data.cancelApplyTime || '',
          remark: data.cancelReason || ''
        });
      }

      if (data.status === 'canceled') {
        logs.push({
          operationType: '申请取消',
          operationContent: `用户申请取消订单，原因：${data.cancelReason}`,
          operator: data.user?.nickname || '用户',
          operatorRole: '用户',
          operationTime: data.cancelApplyTime || '',
          remark: data.cancelReason || ''
        });
        logs.push({
          operationType: '同意取消',
          operationContent: '后台审核通过，订单已取消',
          operator: 'admin',
          operatorRole: '管理员',
          operationTime: data.cancelPassTime || '',
          remark: '审核通过'
        });
      }

      this.operationLogList = logs.sort((a, b) => {
        return new Date(b.operationTime) - new Date(a.operationTime);
      });
    },
    getSkuGroupedData() {
      const items = this.detailData.goodsItems || [];
      const skuMap = {};
      items.forEach(item => {
        const key = item.skuId;
        if (!skuMap[key]) {
          skuMap[key] = {
            ...item,
            quantity: 0,
            shippedQty: 0,
            pendingQty: 0
          };
        }
        skuMap[key].quantity += item.quantity;
        skuMap[key].shippedQty += item.shippedQty || 0;
        skuMap[key].pendingQty += item.pendingQty || 0;
      });
      return Object.values(skuMap);
    },
    getQuantityData() {
      const items = this.detailData.goodsItems || [];
      const result = [];
      items.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          result.push({
            ...item,
            quantity: 1,
            shippedQty: item.shipStatus === 'shipped' ? 1 : 0,
            pendingQty: item.shipStatus === 'pending' ? 1 : 0
          });
        }
      });
      return result;
    },
    getShipStatusText(row) {
      if (row.shippedQty && row.pendingQty) {
        return '部分发货';
      }
      if (row.shippedQty && !row.pendingQty) {
        return '已发货';
      }
      if (row.shipStatus === 'canceled') {
        return '已取消';
      }
      return '待发货';
    },
    getStatusText(status) {
      const map = {
        pending: '待发货',
        receiving: '待收货',
        completed: '已完成',
        canceling: '申请取消',
        canceled: '已取消'
      };
      return map[status] || status;
    },
    getStatusTagType(status) {
      const map = {
        pending: 'warning',
        receiving: 'primary',
        completed: 'success',
        canceling: 'danger',
        canceled: 'info'
      };
      return map[status] || 'info';
    },
    getLogisticsTagType(status) {
      const map = {
        pending: 'warning',
        transit: 'primary',
        signed: 'success',
        exception: 'danger'
      };
      return map[status] || 'info';
    },
    getLogisticsStatusText(status) {
      const map = {
        pending: '待揽收',
        transit: '运输中',
        signed: '已签收',
        exception: '异常'
      };
      return map[status] || status;
    },
    formatPhone(phone) {
      if (!phone) return '-';
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    },
    copyText(text) {
      if (!text) return;
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.$message.success('复制成功');
    },
    goBack() {
      this.$router.back();
    },
    handleShip() {
      const d = this.detailData;
      const goods = (d.goodsItems || []).map(item => ({
        goodsId: item.goodsId,
        name: item.goodsName,
        image: item.goodsImage,
        price: item.price || 0,
        quantity: item.quantity,
        shipped: item.shippedQty || 0
      }));
      const shipRecords = (d.packages || []).map(pkg => ({
        expressCompany: pkg.expressCompany,
        expressNo: pkg.expressNo,
        shipTime: pkg.shipTime || '',
        goods: (d.goodsItems || [])
          .filter(item => item.packageNo === pkg.packageNo)
          .map(item => ({
            goodsId: item.goodsId,
            name: item.goodsName,
            image: item.goodsImage,
            quantity: item.quantity
          }))
      }));
      this.shipDrawerOrderData = {
        orderNo: d.shipmentNo,
        status: d.status,
        locked: d.locked,
        source: d.sourceName,
        createTime: d.createTime,
        user: {
          userId: d.user ? d.user.uid : '',
          userNo: d.user ? d.user.userNo : '',
          nickname: d.user ? d.user.nickname : '',
          avatar: d.user ? d.user.avatar : ''
        },
        receiver: {
          name: d.receiver ? d.receiver.name : '',
          phone: d.receiver ? d.receiver.phone : '',
          address: d.receiver ? d.receiver.fullAddress : ''
        },
        logistics: { freight: d.freight || 0 },
        remark: {
          userRemark: d.receiver ? d.receiver.userRemark : '',
          merchantRemark: d.remarks ? d.remarks.merchantRemark : ''
        },
        goods,
        shipRecords
      };
      this.shipDrawerVisible = true;
    },
    handleShipSuccess(data) {
      console.log('发货成功', data);
      this.$message.success('发货成功');
      this.shipDrawerVisible = false;
      this.detailData.status = 'receiving';
      this.detailData.shipTime = this.getCurrentTime();
      // 更新商品发货状态
      if (data && data.package && data.package.goods) {
        (this.detailData.goodsItems || []).forEach(item => {
          const shippedItem = data.package.goods.find(g => g.goodsId === item.goodsId);
          if (shippedItem) {
            item.shippedQty = (item.shippedQty || 0) + shippedItem.quantity;
            item.pendingQty = Math.max(0, (item.pendingQty || 0) - shippedItem.quantity);
            if (item.pendingQty === 0) {
              item.shipStatus = 'shipped';
            }
          }
        });
        // 添加包裹记录
        if (!this.detailData.packages) {
          this.detailData.packages = [];
        }
        this.detailData.packages.push({
          packageNo: 'PK' + Date.now(),
          expressCompany: data.package.expressCompany,
          expressNo: data.package.expressNo,
          shipTime: data.package.shipTime,
          shipper: 'admin',
          logisticsStatus: 'transit',
          updateTime: this.getCurrentTime()
        });
      }
      this.addOperationLog('发货', `订单已发货，快递：${data && data.package ? data.package.expressCompany : ''}，单号：${data && data.package ? data.package.expressNo : ''}`);
      this.initOperationLogs();
      // 通知父组件发货成功
      this.$emit('ship-success', data);
    },
    handleDrawerUpdateReceiver(order) {
      if (order && order.receiver) {
        if (!this.detailData.receiver) {
          this.detailData.receiver = {};
        }
        this.detailData.receiver.name = order.receiver.name;
        this.detailData.receiver.phone = order.receiver.phone;
        this.detailData.receiver.fullAddress = order.receiver.address;
      }
    },
    handleDrawerUpdateRemark(order) {
      if (order && order.remark) {
        if (!this.detailData.remarks) {
          this.detailData.remarks = {};
        }
        this.detailData.remarks.merchantRemark = order.remark.merchantRemark;
      }
    },
    handleDrawerUpdateExpress(order) {
      console.log('快递信息已更新', order);
    },
    handleEditAddress() {
      if (!this.canEditReceiver) {
        this.$message.warning('当前状态不允许修改收货信息');
        return;
      }
      const receiver = this.detailData.receiver || {};
      this.addressForm = {
        name: receiver.name || '',
        phone: receiver.phone || '',
        region: [receiver.province, receiver.city, receiver.district],
        detailAddress: receiver.detailAddress || ''
      };
      this.addressDialogVisible = true;
    },
    confirmEditAddress() {
      this.$refs.addressFormRef.validate(valid => {
        if (valid) {
          const receiver = this.detailData.receiver;
          receiver.name = this.addressForm.name;
          receiver.phone = this.addressForm.phone;
          receiver.detailAddress = this.addressForm.detailAddress;
          receiver.fullAddress = `${this.addressForm.region.join('')}${this.addressForm.detailAddress}`;
          receiver.addressModifyCount = (receiver.addressModifyCount || 0) + 1;
          this.$message.success('收货信息已修改');
          this.addressDialogVisible = false;
          this.addOperationLog('修改收货信息', '通过弹窗修改收货信息');
        }
      });
    },
    handleEditRemark() {
      this.remarkForm.userRemark = this.remarks.userRemark || '';
      this.remarkForm.merchantRemark = this.remarks.merchantRemark || '';
      this.remarkEditDialogVisible = true;
    },
    handleSaveRemark() {
      this.detailData.remarks = this.detailData.remarks || {};
      this.detailData.remarks.userRemark = this.remarkForm.userRemark;
      this.detailData.remarks.merchantRemark = this.remarkForm.merchantRemark;
      this.remarkEditDialogVisible = false;
      this.addOperationLog('修改备注', `用户备注：${this.remarkForm.userRemark || '空'}，商家备注：${this.remarkForm.merchantRemark || '空'}'`);
      this.$message.success('备注修改成功');
    },
    handleLock() {
      this.$confirm('锁单后禁止修改收货信息、取消发货，是否确认锁单？', '提示', {
        confirmButtonText: '确认锁单',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.detailData.locked = true;
        this.$message.success('订单已锁单');
        this.addOperationLog('锁单', '手动锁单，禁止修改收货信息、取消发货');
      }).catch(() => {});
    },
    handleUnlock() {
      this.$confirm('确定要解锁此订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.detailData.locked = false;
        this.$message.success('订单已解锁');
        this.addOperationLog('解锁', '手动解锁订单');
      }).catch(() => {});
    },
    startEditReceiver(field) {
      if (!this.canEditReceiver) {
        this.$message.warning('当前状态不允许修改收货信息');
        return;
      }
      const receiver = this.detailData.receiver || {};
      this.editReceiverForm = {
        name: receiver.name || '',
        phone: receiver.phone || '',
        detailAddress: receiver.detailAddress || '',
        fullAddress: receiver.fullAddress || ''
      };
      this.editField.receiver = field;
    },
    saveReceiverField(field) {
      if (field === 'phone') {
        const phoneReg = /^1[3-9]\d{9}$/;
        if (!phoneReg.test(this.editReceiverForm.phone)) {
          this.$message.error('请输入正确的手机号');
          return;
        }
      }
      if (field === 'address') {
        if (!this.editReceiverForm.fullAddress) {
          this.$message.warning('地址不能为空');
          return;
        }
        this.detailData.receiver.fullAddress = this.editReceiverForm.fullAddress;
      } else {
        if (!this.editReceiverForm[field]) {
          this.$message.warning('内容不能为空');
          return;
        }
        this.detailData.receiver[field] = this.editReceiverForm[field];
      }
      this.editField.receiver = '';
      this.$message.success('修改成功');
      const fieldNameMap = { name: '收货人', phone: '手机号', address: '收货地址' };
      this.addOperationLog('修改收货信息', `修改${fieldNameMap[field] || field}`);
    },
    cancelEditReceiver(field) {
      this.editField.receiver = '';
    },
    startEditUserRemark() {
      this.editUserRemark = this.remarks.userRemark || '';
      this.editField.userRemark = true;
    },
    saveUserRemark() {
      if (!this.detailData.receiver) this.$set(this.detailData, 'receiver', {});
      this.detailData.receiver.userRemark = this.editUserRemark;
      this.editField.userRemark = false;
      this.$message.success('用户备注已保存');
      this.addOperationLog('修改用户备注', this.editUserRemark || '清空备注');
    },
    cancelEditUserRemark() {
      this.editField.userRemark = false;
    },
    startEditMerchantRemark() {
      this.editMerchantRemark = this.remarks.merchantRemark || '';
      this.editField.merchantRemark = true;
    },
    saveMerchantRemark() {
      if (!this.detailData.remarks) this.$set(this.detailData, 'remarks', {});
      this.detailData.remarks.merchantRemark = this.editMerchantRemark;
      this.editField.merchantRemark = false;
      this.$message.success('商家备注已保存');
      this.addOperationLog('修改商家备注', this.editMerchantRemark || '清空备注');
    },
    cancelEditMerchantRemark() {
      this.editField.merchantRemark = false;
    },
    getOperationTagType(type) {
      const map = {
        '创建订单': 'primary',
        '锁单': 'danger',
        '解锁': 'success',
        '发货': 'success',
        '确认收货': 'success',
        '修改收货信息': 'warning',
        '修改用户备注': 'info',
        '修改商家备注': 'info',
        '申请取消': 'warning',
        '同意取消': 'danger',
        '拒绝取消': 'warning',
        '修改物流': 'warning'
      };
      return map[type] || 'info';
    },
    addOperationLog(type, content, remark) {
      this.operationLogList.unshift({
        operationType: type,
        operationContent: content,
        operator: 'admin',
        operatorRole: '管理员',
        operationTime: this.getCurrentTime(),
        remark: remark || ''
      });
    },
    getCurrentTime() {
      const now = new Date();
      const pad = n => (n < 10 ? '0' + n : n);
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    },
    handleViewLogistics(row) {
      const pkg = row || this.packageList[0];
      if (!pkg) {
        this.$message.warning('暂无物流信息');
        return;
      }
      this.currentLogistics = {
        expressCompany: pkg.expressCompany,
        expressNo: pkg.expressNo,
        status: pkg.logisticsStatus,
        updateTime: pkg.updateTime || pkg.shipTime,
        nodes: [
          { time: '2026-06-24 10:30:00', status: '已签收', location: '北京市朝阳区' },
          { time: '2026-06-24 08:15:00', status: '派送中', location: '北京朝阳分部' },
          { time: '2026-06-23 22:30:00', status: '到达目的城市', location: '北京市' },
          { time: '2026-06-23 18:46:35', status: '已发货', location: '深圳市龙华区' }
        ]
      };
      this.logisticsDialogVisible = true;
      this.addOperationLog('查看物流', `查看包裹 ${pkg.packageNo} 物流信息`);
    },
    handleAudit() {
      if (this.detailData.locked) {
        this.$message.warning('订单已锁单，暂不可审核');
        return;
      }
      this.auditDialogVisible = true;
    },
    handleAuditConfirm(result) {
      if (result.auditResult === 'approve') {
        this.detailData.status = 'canceled';
        this.detailData.cancelPassTime = this.getCurrentTime();
        this.detailData.goodsItems.forEach(item => {
          item.shipStatus = 'canceled';
          item.shippedQty = 0;
          item.pendingQty = 0;
        });
        this.$message.success('已通过取消申请');
        this.addOperationLog('同意取消', `审核备注：${result.remark || '无'}`);
      } else {
        this.detailData.status = 'pending';
        this.detailData.rejectReason = result.rejectReason;
        this.$message.success('已驳回取消申请');
        this.addOperationLog('拒绝取消', `拒绝原因：${result.rejectReason}，备注：${result.remark || '无'}`);
      }
      this.initOperationLogs();
    },
    handleSplitGoods(row) {
      this.$message.info('拆分功能');
    }
  }
};
</script>

<style lang="scss" scoped>
.delivery-detail-page {
  padding: 8px;
  background: #f2f3f5;
  min-height: 100%;
}

.detail-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 18px 20px;
}

.status-card {
  .status-header {
    display: flex;
    align-items: center;
  }

  .order-status-text {
    width: 200px;
    font-size: 16px;
    color: #303133;
    flex-shrink: 0;

    .el-tag {
      margin-left: 8px;
    }
  }

  .order-steps {
    flex: 1;
  }

  .action-row {
    margin-top: 18px;

    .el-button {
      margin-right: 10px;
    }
  }
}

.info-card {
  display: flex;

  .info-column {
    flex: 1;
    padding: 0 24px;

    &:first-child {
      padding-left: 0;
    }

    &.has-border {
      border-left: 1px solid #e4e7ed;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    line-height: 26px;
    font-size: 13px;

    .label {
      color: #909399;
      min-width: 84px;
      flex-shrink: 0;
    }

    .value {
      color: #303133;
      flex: 1;
      word-break: break-all;
    }

    &.address-item .value {
      line-height: 1.5;
    }

    .copy-text {
      cursor: pointer;
      color: #409eff;

      i {
        margin-left: 4px;
      }
    }

    .cancel-reason {
      color: #f56c6c;
    }

    .reject-reason {
      color: #e6a23c;
    }
  }
}

.goods-card {
  .block-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;

    .title-icon {
      margin-right: 6px;
    }
  }

  .summary-bar {
    height: 36px;
    display: flex;
    align-items: center;
    background: #f5f7fa;
    padding: 0 14px;
    font-size: 13px;
    color: #606266;
    margin-bottom: 12px;
    border-radius: 4px;

    span {
      margin-right: 32px;
    }

    b {
      font-weight: 600;
      color: #303133;
    }

    .blue {
      color: #409eff;
    }

    .red {
      color: #f56c6c;
    }
  }

  .goods-toolbar {
    margin-bottom: 12px;
    display: flex;
    justify-content: flex-end;
  }
}

.package-card {
  .block-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;

    .title-icon {
      margin-right: 6px;
    }
  }
}

.detail-table {
  width: 100%;
  font-size: 13px;

  ::v-deep &::before {
    display: none;
  }

  ::v-deep .el-table__header th {
    background: #f5f7fa;
  }

  ::v-deep .el-table__body td {
    border-bottom: 1px solid #ebeef5;
  }
}

.goods-info {
  display: flex;
  align-items: center;

  .goods-img {
    width: 38px;
    height: 38px;
    border-radius: 4px;
    margin-right: 10px;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;

    &.goods-img-placeholder {
      color: #c0c4cc;
      font-size: 18px;
    }
  }

  .goods-text {
    .goods-name {
      font-size: 13px;
      color: #303133;
      font-weight: 500;
    }

    .goods-spec {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;

  i {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
    color: #dcdfe6;
  }

  span {
    display: block;
    margin-bottom: 16px;
  }
}

.logistics-detail {
  .logistics-timeline {
    margin-top: 20px;

    .logistics-node {
      .node-status {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .node-location {
        font-size: 12px;
        color: #606266;
      }
    }
  }
}

.section-title {
  .lock-icon {
    margin-left: 6px;
    color: #f56c6c;
    font-size: 14px;
  }
}

.editable-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .edit-input {
    width: 100%;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
  }
}

.inline-edit-input {
  width: 160px;
  display: inline-block;
  vertical-align: middle;
}

.address-value {
  .copy-text {
    display: inline;
    vertical-align: middle;
  }

  .el-button--text {
    margin-left: 4px;
    vertical-align: middle;
  }

  .edit-input {
    width: 100%;
  }

  .edit-actions {
    margin-top: 6px;
    display: flex;
    gap: 8px;
  }
}

.remark-value {
  .remark-text {
    display: inline;
    vertical-align: middle;
    word-break: break-all;
  }

  .el-button--text {
    margin-left: 4px;
    vertical-align: middle;
  }

  .edit-input {
    width: 100%;
  }

  .edit-actions {
    margin-top: 6px;
    display: flex;
    gap: 8px;
  }
}

.operation-log-card {
  .block-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;

    .title-icon {
      margin-right: 6px;
    }
  }
}

.back-btn {
  color: #409eff;

  &:hover {
    color: #66b1ff;
  }
}

.package-card {
  .detail-table {
    width: 100%;
  }
}
</style>
