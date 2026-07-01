<template>
  <el-drawer
    :visible.sync="drawerVisible"
    direction="rtl"
    size="960px"
    :before-close="handleClose"
    :close-on-press-escape="false"
    :show-close="true"
    custom-class="order-ship-drawer"
  >
    <div slot="title" class="drawer-title">
      <span>{{ isReadOnly ? '订单详情' : '订单发货' }}</span>
      <el-tag v-if="currentOrder && currentOrder.locked" type="danger" size="small" style="margin-left: 10px;">已锁定</el-tag>
    </div>

    <div class="drawer-body" v-if="currentOrder">
      <div class="order-overview">
        <div class="overview-grid">
          <div class="overview-item">
            <span class="overview-label">订单编号</span>
            <div class="overview-value">
              <span class="order-no-text">{{ currentOrder.shortOrderId || currentOrder.orderNo }}</span>
              <i class="el-icon-document-copy copy-btn" @click="copyText(currentOrder.orderNo)" title="复制"></i>
            </div>
          </div>
          <div class="overview-item">
            <span class="overview-label">订单状态</span>
            <el-tag :type="getStatusTagType(currentOrder.status)" size="small">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </div>
          <div class="overview-item">
            <span class="overview-label">用户编号</span>
            <span class="overview-value">{{ currentOrder.user.userId || currentOrder.user.userNo }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">订单来源</span>
            <span class="overview-value">{{ currentOrder.source }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">申请时间</span>
            <span class="overview-value">{{ currentOrder.createTime }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">运费</span>
            <span class="overview-value">¥{{ currentOrder.logistics.freight }}</span>
          </div>
        </div>
        <div class="overview-user">
          <el-avatar :size="36" :src="currentOrder.user.avatar">
            {{ currentOrder.user.nickname ? currentOrder.user.nickname.charAt(0) : 'U' }}
          </el-avatar>
          <div class="user-detail">
            <div class="user-nickname">{{ currentOrder.user.nickname }}</div>
            <div class="user-uid">UID: {{ currentOrder.user.userId || currentOrder.user.userNo }}</div>
          </div>
        </div>
        <div class="overview-remark">
          <div class="remark-item">
            <span class="remark-label">用户备注</span>
            <span class="remark-value">{{ currentOrder.remark.userRemark || '-' }}</span>
          </div>
          <div class="remark-item">
            <span class="remark-label">商家备注</span>
            <span class="remark-value">
              {{ currentOrder.remark.merchantRemark || '-' }}
              <i class="el-icon-edit edit-btn" @click="handleEditMerchantRemark" title="编辑"></i>
            </span>
          </div>
        </div>
      </div>

      <div class="receiver-section">
        <div class="section-header">
          <span class="section-title">收货信息</span>
          <div class="section-actions">
            <el-button type="text" size="mini" @click="copyReceiver">复制</el-button>
            <el-button
              v-if="canEditReceiver"
              type="text"
              size="mini"
              @click="handleEditReceiver"
            >修改</el-button>
          </div>
        </div>
        <div class="receiver-content">
          <div class="receiver-item">
            <span class="receiver-label">收货人</span>
            <span class="receiver-value">{{ currentOrder.receiver.name }}</span>
          </div>
          <div class="receiver-item">
            <span class="receiver-label">联系电话</span>
            <span class="receiver-value">{{ currentOrder.receiver.phone }}</span>
          </div>
          <div class="receiver-item full-width">
            <span class="receiver-label">收货地址</span>
            <span class="receiver-value">{{ currentOrder.receiver.address }}</span>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-label">总计数量</span>
          <span class="stat-value">{{ totalQuantity }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总计SKU</span>
          <span class="stat-value">{{ totalSkuCount }}个</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已发货</span>
          <span class="stat-value stat-shipped">{{ shippedQuantity }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待发货</span>
          <span class="stat-value stat-pending">{{ pendingQuantity }}件</span>
        </div>
      </div>

      <div class="locked-tip" v-if="currentOrder.locked && !isReadOnly">
        <i class="el-icon-warning"></i>
        订单已锁定，暂不可发货
      </div>

      <template v-if="!isReadOnly && !currentOrder.locked && pendingQuantity > 0">
        <el-steps :active="currentStep" finish-status="success" class="ship-steps">
          <el-step title="选择发货商品" />
          <el-step title="填写物流并确认" />
        </el-steps>

        <div class="step-content">
          <template v-if="currentStep === 0">
            <div class="split-toggle">
              <el-radio-group v-model="splitMode" size="small">
                <el-radio label="sku">按SKU拆分</el-radio>
                <el-radio label="quantity">按数量拆分</el-radio>
              </el-radio-group>
              <span class="split-desc">
                {{ splitMode === 'sku' ? '同一SKU合并为一行，整行发货' : '通过输入本次发货数量控制' }}
              </span>
            </div>

            <el-table
              ref="pendingTable"
              :data="pendingTableData"
              border
              size="small"
              @selection-change="handlePendingSelection"
              class="goods-table"
            >
              <el-table-column type="selection" width="42" align="center" />
              <el-table-column label="收货信息" min-width="150">
                <template slot-scope="{ row }">
                  <div class="rc-info">
                    <div class="rc-name">{{ currentOrder.receiver.name }} {{ currentOrder.receiver.phone }}</div>
                    <div class="rc-addr">{{ currentOrder.receiver.address }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="商品信息" min-width="220">
                <template slot-scope="{ row }">
                  <div class="goods-info">
                    <el-image
                      :src="row.image"
                      :preview-src-list="[row.image]"
                      class="goods-img"
                      fit="cover"
                    >
                      <div slot="error" class="img-error">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                    <div class="goods-detail">
                      <div class="goods-name">{{ row.name }}</div>
                      <div class="goods-id">ID: {{ row.goodsId }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="pendingQty" label="待发货数量" width="90" align="center" />
              <el-table-column label="本次发货数量" width="120" align="center">
                <template slot-scope="{ row }">
                  <template v-if="splitMode === 'sku'">
                    <el-checkbox
                      :value="isSelected(row)"
                      @change="toggleSelection(row, $event)"
                      :disabled="!isSelectable(row)"
                    >
                      {{ getSelectedQty(row) }}
                    </el-checkbox>
                  </template>
                  <template v-else>
                    <el-input-number
                      :value="getSelectedQty(row)"
                      @change="updateSelectedQty(row, $event)"
                      :min="0"
                      :max="row.pendingQty"
                      :disabled="!isSelectable(row)"
                      size="mini"
                      :controls="false"
                      style="width: 80px;"
                    />
                  </template>
                </template>
              </el-table-column>
            </el-table>

            <div class="selection-tip">
              已选择 <span class="tip-num">{{ selectedCount }}</span> 个商品，共
              <span class="tip-num">{{ selectedQuantity }}</span> 件
            </div>
          </template>

          <template v-else-if="currentStep === 1">
            <el-form :model="expressForm" :rules="expressRules" ref="expressFormRef" label-width="100px" size="small" class="express-form">
              <el-form-item label="快递公司" prop="company">
                <el-select v-model="expressForm.company" placeholder="请选择快递公司" style="width: 280px;">
                  <el-option label="顺丰速运" value="顺丰速运" />
                  <el-option label="中通快递" value="中通快递" />
                  <el-option label="圆通快递" value="圆通快递" />
                  <el-option label="韵达快递" value="韵达快递" />
                  <el-option label="申通快递" value="申通快递" />
                  <el-option label="京东物流" value="京东物流" />
                  <el-option label="极兔速递" value="极兔速递" />
                  <el-option label="德邦快递" value="德邦快递" />
                  <el-option label="EMS" value="EMS" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
              <el-form-item label="快递单号" prop="trackingNo">
                <el-input v-model="expressForm.trackingNo" placeholder="请输入快递单号" style="width: 280px;" />
              </el-form-item>
            </el-form>

            <div class="ship-summary">
              <div class="summary-title">本次发货商品</div>
              <el-table :data="selectedGoodsForShip" border size="small" class="goods-table">
                <el-table-column label="收货信息" min-width="150">
                  <template slot-scope="{ row }">
                    <div class="rc-info">
                      <div class="rc-name">{{ currentOrder.receiver.name }} {{ currentOrder.receiver.phone }}</div>
                      <div class="rc-addr">{{ currentOrder.receiver.address }}</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="商品信息" min-width="220">
                  <template slot-scope="{ row }">
                    <div class="goods-info">
                      <el-image
                        :src="row.image"
                        :preview-src-list="[row.image]"
                        class="goods-img"
                        fit="cover"
                      >
                        <div slot="error" class="img-error">
                          <i class="el-icon-picture-outline"></i>
                        </div>
                      </el-image>
                      <div class="goods-detail">
                        <div class="goods-name">{{ row.name }}</div>
                        <div class="goods-id">ID: {{ row.goodsId }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="shipQty" label="本次发货数量" width="100" align="center" />
              </el-table>
            </div>
          </template>
        </div>
      </template>

      <template v-else>
        <el-tabs v-model="activeProductTab" class="product-tabs">
          <el-tab-pane label="待发货商品" name="pending">
            <el-table :data="pendingGoodsList" border size="small" class="goods-table">
              <el-table-column label="商品信息" min-width="220">
                <template slot-scope="{ row }">
                  <div class="goods-info">
                    <el-image :src="row.image" class="goods-img" fit="cover">
                      <div slot="error" class="img-error"><i class="el-icon-picture-outline"></i></div>
                    </el-image>
                    <div class="goods-detail">
                      <div class="goods-name">{{ row.name }}</div>
                      <div class="goods-id">ID: {{ row.goodsId }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="price" label="价格" width="80" align="center">
                <template slot-scope="{ row }">¥{{ row.price }}</template>
              </el-table-column>
              <el-table-column prop="orderQty" label="订单数量" width="80" align="center" />
              <el-table-column prop="shippedQty" label="已发货" width="80" align="center" />
              <el-table-column prop="pendingQty" label="剩余未发货" width="100" align="center">
                <template slot-scope="{ row }">
                  <span :class="{ 'pending-highlight': row.pendingQty > 0 }">{{ row.pendingQty }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!pendingGoodsList.length" class="empty-tip">暂无待发货商品</div>
          </el-tab-pane>

          <el-tab-pane label="已发货商品" name="shipped">
            <el-table :data="shippedGoodsList" border size="small" class="goods-table">
              <el-table-column label="快递信息" min-width="160">
                <template slot-scope="{ row }">
                  <div class="express-info">
                    <div class="ec-company">{{ row.expressCompany }}</div>
                    <div class="ec-no">
                      {{ row.expressNo }}
                      <i class="el-icon-document-copy copy-icon" @click="copyText(row.expressNo)" title="复制"></i>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="商品信息" min-width="220">
                <template slot-scope="{ row }">
                  <div class="goods-info">
                    <el-image :src="row.image" class="goods-img" fit="cover">
                      <div slot="error" class="img-error"><i class="el-icon-picture-outline"></i></div>
                    </el-image>
                    <div class="goods-detail">
                      <div class="goods-name">{{ row.name }}</div>
                      <div class="goods-id">ID: {{ row.goodsId }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="shipQty" label="发货数量" width="80" align="center" />
              <el-table-column prop="shipTime" label="发货时间" width="150" />
              <el-table-column label="操作" width="100" align="center">
                <template slot-scope="{ row }">
                  <el-button type="text" size="mini" @click="handleEditExpress(row)">修改快递</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!shippedGoodsList.length" class="empty-tip">暂无已发货商品</div>
          </el-tab-pane>

          <el-tab-pane label="全部商品" name="all">
            <el-table :data="allGoodsList" border size="small" class="goods-table">
              <el-table-column label="商品信息" min-width="220">
                <template slot-scope="{ row }">
                  <div class="goods-info">
                    <el-image :src="row.image" class="goods-img" fit="cover">
                      <div slot="error" class="img-error"><i class="el-icon-picture-outline"></i></div>
                    </el-image>
                    <div class="goods-detail">
                      <div class="goods-name">{{ row.name }}</div>
                      <div class="goods-id">ID: {{ row.goodsId }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="price" label="价格" width="80" align="center">
                <template slot-scope="{ row }">¥{{ row.price }}</template>
              </el-table-column>
              <el-table-column prop="orderQty" label="订单数量" width="80" align="center" />
              <el-table-column prop="shippedQty" label="已发货" width="80" align="center" />
              <el-table-column prop="pendingQty" label="剩余未发货" width="100" align="center">
                <template slot-scope="{ row }">
                  <span :class="{ 'pending-highlight': row.pendingQty > 0 }">{{ row.pendingQty }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>

    <div class="drawer-footer">
      <template v-if="isReadOnly">
        <el-button v-if="pendingQuantity > 0 && !currentOrder.locked" type="primary" size="small" @click="switchToShipMode">
          去发货
        </el-button>
        <el-button size="small" @click="handleClose">关闭</el-button>
      </template>
      <template v-else>
        <template v-if="currentStep === 0">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button type="primary" size="small" :disabled="selectedQuantity === 0" @click="nextStep">
            下一步：填写物流
          </el-button>
        </template>
        <template v-else>
          <el-button size="small" @click="prevStep">上一步</el-button>
          <el-button type="primary" size="small" @click="confirmShip">确认发货</el-button>
        </template>
      </template>
    </div>

    <el-dialog title="修改收货信息" :visible.sync="receiverDialogVisible" width="500px" append-to-body>
      <el-form :model="receiverForm" :rules="receiverRules" ref="receiverFormRef" label-width="90px" size="small">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="receiverForm.name" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="receiverForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-input v-model="receiverForm.region" placeholder="请输入省市区" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="receiverForm.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="receiverDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="saveReceiver">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改商家备注" :visible.sync="remarkDialogVisible" width="500px" append-to-body>
      <el-form size="small">
        <el-form-item label="商家备注">
          <el-input v-model="merchantRemarkForm" type="textarea" :rows="3" placeholder="请输入商家备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="remarkDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="saveMerchantRemark">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改快递信息" :visible.sync="expressDialogVisible" width="500px" append-to-body>
      <el-form :model="editExpressForm" :rules="expressRules" ref="editExpressFormRef" label-width="90px" size="small">
        <el-form-item label="快递公司" prop="company">
          <el-select v-model="editExpressForm.company" placeholder="请选择快递公司" style="width: 100%;">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通快递" value="圆通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="EMS" value="EMS" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="trackingNo">
          <el-input v-model="editExpressForm.trackingNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="expressDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="saveExpress">保存</el-button>
      </span>
    </el-dialog>
  </el-drawer>
</template>

<script>
export default {
  name: 'OrderDeliveryDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'ship'
    }
  },
  data() {
    return {
      currentStep: 0,
      splitMode: 'sku',
      activeProductTab: 'pending',
      selectedGoods: [],
      expressForm: {
        company: '',
        trackingNo: ''
      },
      expressRules: {
        company: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
        trackingNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
      },
      receiverDialogVisible: false,
      receiverForm: {
        name: '',
        phone: '',
        region: '',
        address: ''
      },
      receiverRules: {
        name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      remarkDialogVisible: false,
      merchantRemarkForm: '',
      expressDialogVisible: false,
      editExpressForm: {
        company: '',
        trackingNo: '',
        index: -1
      },
      currentOrder: null,
      allGoods: [],
      shippedPackages: []
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    isReadOnly() {
      return this.mode === 'detail'
    },
    canEditReceiver() {
      if (!this.currentOrder) return false
      return this.currentOrder.status === 'pending' && !this.currentOrder.locked
    },
    totalQuantity() {
      return this.allGoods.reduce((sum, g) => sum + g.orderQty, 0)
    },
    totalSkuCount() {
      return this.allGoods.length
    },
    shippedQuantity() {
      return this.shippedPackages.reduce((sum, p) => sum + (p.goods || []).reduce((s, g) => s + g.quantity, 0), 0)
    },
    pendingQuantity() {
      return this.totalQuantity - this.shippedQuantity
    },
    pendingGoodsList() {
      return this.allGoods.filter(g => g.pendingQty > 0).map(g => ({
        ...g,
        shippedQty: g.orderQty - g.pendingQty
      }))
    },
    shippedGoodsList() {
      const list = []
      this.shippedPackages.forEach(pkg => {
        (pkg.goods || []).forEach(g => {
          list.push({
            ...g,
            expressCompany: pkg.expressCompany,
            expressNo: pkg.expressNo,
            shipTime: pkg.shipTime || '-'
          })
        })
      })
      return list
    },
    allGoodsList() {
      return this.allGoods.map(g => ({
        ...g,
        shippedQty: g.orderQty - g.pendingQty
      }))
    },
    pendingTableData() {
      return this.pendingGoodsList
    },
    selectedCount() {
      return this.selectedGoods.length
    },
    selectedQuantity() {
      return this.selectedGoods.reduce((sum, g) => sum + g.shipQty, 0)
    },
    selectedGoodsForShip() {
      return this.selectedGoods.filter(g => g.shipQty > 0)
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initData()
      }
    },
    splitMode() {
      this.selectedGoods = []
    }
  },
  methods: {
    initData() {
      const data = this.orderData || {}

      this.currentOrder = {
        orderNo: data.orderNo || 'DD20260625001',
        shortOrderId: data.orderNo ? data.orderNo.substring(0, 12) + '...' : 'DD20260625...',
        status: data.status || 'pending',
        locked: data.locked || false,
        source: data.source || '商城',
        createTime: data.createTime || '2026-06-25 10:30:00',
        user: {
          userId: data.user ? (data.user.userId || data.user.userNo) : '10086',
          userNo: data.user ? (data.user.userNo || data.user.userId) : '10086',
          nickname: data.user ? data.user.nickname : '用户昵称',
          avatar: data.user ? data.user.avatar : ''
        },
        receiver: data.receiver ? { ...data.receiver } : {
          name: '王小明',
          phone: '13812345678',
          address: '广东省 深圳市 南山区 科技园南区科技南路100号'
        },
        logistics: data.logistics || { freight: 12 },
        remark: data.remark || { userRemark: '', merchantRemark: '' },
        goods: data.goods || [],
        shipRecords: data.shipRecords || []
      }

      this.allGoods = this.buildGoodsList()
      this.shippedPackages = this.buildShippedPackages()

      this.activeProductTab = 'pending'
      this.currentStep = 0
      this.splitMode = 'sku'
      this.selectedGoods = []
      this.expressForm = { company: '', trackingNo: '' }

      if (data.status === 'receiving' || data.status === 'completed') {
        this.activeProductTab = 'shipped'
      }
    },
    buildGoodsList() {
      const goods = this.currentOrder.goods || []
      if (goods.length) {
        return goods.map(g => ({
          goodsId: g.goodsId,
          name: g.name,
          image: g.image,
          price: g.price,
          orderQty: g.quantity,
          shippedQty: g.shipped || 0,
          pendingQty: g.quantity - (g.shipped || 0)
        }))
      }
      return [
        {
          goodsId: 'G20001',
          name: '迪士尼100周年系列lolu挂件',
          image: '',
          price: 59,
          orderQty: 1,
          shippedQty: 0,
          pendingQty: 1
        },
        {
          goodsId: 'G20002',
          name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm',
          image: '',
          price: 199,
          orderQty: 2,
          shippedQty: 0,
          pendingQty: 2
        },
        {
          goodsId: 'G20003',
          name: '新款潮流帆布包休闲背包',
          image: '',
          price: 89,
          orderQty: 1,
          shippedQty: 1,
          pendingQty: 0
        }
      ]
    },
    buildShippedPackages() {
      const records = this.currentOrder.shipRecords || []
      if (records.length) {
        return records.map(r => ({
          expressCompany: r.expressCompany,
          expressNo: r.expressNo,
          shipTime: r.shipTime || '-',
          goods: (r.goods || []).map(g => ({
            goodsId: g.goodsId,
            name: g.name,
            image: g.image,
            quantity: g.quantity
          }))
        }))
      }
      return []
    },
    getStatusTagType(status) {
      const map = {
        pending: 'warning',
        receiving: 'primary',
        completed: 'success',
        canceling: 'danger',
        canceled: 'info'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        pending: '待发货',
        receiving: '待收货',
        completed: '已完成',
        canceling: '申请取消',
        canceled: '已取消'
      }
      return map[status] || status
    },
    isSelected(row) {
      return this.selectedGoods.some(g => g.goodsId === row.goodsId && g.shipQty > 0)
    },
    isSelectable(row) {
      return row.pendingQty > 0
    },
    getSelectedQty(row) {
      const found = this.selectedGoods.find(g => g.goodsId === row.goodsId)
      return found ? found.shipQty : 0
    },
    toggleSelection(row, checked) {
      if (checked) {
        this.selectedGoods.push({
          goodsId: row.goodsId,
          name: row.name,
          image: row.image,
          pendingQty: row.pendingQty,
          shipQty: row.pendingQty
        })
      } else {
        this.selectedGoods = this.selectedGoods.filter(g => g.goodsId !== row.goodsId)
      }
    },
    updateSelectedQty(row, qty) {
      const found = this.selectedGoods.find(g => g.goodsId === row.goodsId)
      if (found) {
        if (qty === 0) {
          this.selectedGoods = this.selectedGoods.filter(g => g.goodsId !== row.goodsId)
        } else {
          found.shipQty = qty
        }
      } else if (qty > 0) {
        this.selectedGoods.push({
          goodsId: row.goodsId,
          name: row.name,
          image: row.image,
          pendingQty: row.pendingQty,
          shipQty: qty
        })
      }
    },
    handlePendingSelection(rows) {
      if (this.splitMode === 'sku') {
        this.selectedGoods = rows.map(r => ({
          goodsId: r.goodsId,
          name: r.name,
          image: r.image,
          pendingQty: r.pendingQty,
          shipQty: r.pendingQty
        }))
      }
    },
    nextStep() {
      if (this.selectedQuantity === 0) {
        this.$message.warning('请先选择本次发货商品')
        return
      }
      this.currentStep = 1
    },
    prevStep() {
      this.currentStep = 0
    },
    confirmShip() {
      this.$refs.expressFormRef.validate(valid => {
        if (!valid) return
        this.$confirm('确认发货后，所选商品将进入待收货状态，是否继续？', '确认发货', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const newPackage = {
            expressCompany: this.expressForm.company,
            expressNo: this.expressForm.trackingNo,
            shipTime: this.formatTime(new Date()),
            goods: this.selectedGoods.map(g => ({
              goodsId: g.goodsId,
              name: g.name,
              image: g.image,
              quantity: g.shipQty
            }))
          }

          this.shippedPackages.push(newPackage)

          this.selectedGoods.forEach(sg => {
            const good = this.allGoods.find(g => g.goodsId === sg.goodsId)
            if (good) {
              good.shippedQty += sg.shipQty
              good.pendingQty -= sg.shipQty
            }
          })

          this.selectedGoods = []
          this.currentStep = 0
          this.expressForm = { company: '', trackingNo: '' }

          this.$message.success('发货成功')
          this.$emit('ship-success', { order: this.currentOrder, package: newPackage })
        }).catch(() => {})
      })
    },
    switchToShipMode() {
      this.$emit('switch-mode', 'ship')
    },
    handleClose() {
      this.drawerVisible = false
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
    copyReceiver() {
      const { name, phone, address } = this.currentOrder.receiver
      this.copyText(`${name} ${phone} ${address}`)
    },
    handleEditReceiver() {
      this.receiverForm = {
        name: this.currentOrder.receiver.name,
        phone: this.currentOrder.receiver.phone,
        region: '',
        address: this.currentOrder.receiver.address
      }
      this.receiverDialogVisible = true
    },
    saveReceiver() {
      this.$refs.receiverFormRef.validate(valid => {
        if (!valid) return
        this.currentOrder.receiver = {
          name: this.receiverForm.name,
          phone: this.receiverForm.phone,
          address: (this.receiverForm.region ? this.receiverForm.region + ' ' : '') + this.receiverForm.address
        }
        this.receiverDialogVisible = false
        this.$message.success('收货信息已更新')
        this.$emit('update-receiver', this.currentOrder)
      })
    },
    handleEditMerchantRemark() {
      this.merchantRemarkForm = this.currentOrder.remark.merchantRemark || ''
      this.remarkDialogVisible = true
    },
    saveMerchantRemark() {
      this.currentOrder.remark.merchantRemark = this.merchantRemarkForm
      this.remarkDialogVisible = false
      this.$message.success('商家备注已更新')
      this.$emit('update-remark', this.currentOrder)
    },
    handleEditExpress(row) {
      const pkgIndex = this.shippedPackages.findIndex(p =>
        p.goods.some(g => g.goodsId === row.goodsId)
      )
      this.editExpressForm = {
        company: this.shippedPackages[pkgIndex]?.expressCompany || '',
        trackingNo: this.shippedPackages[pkgIndex]?.expressNo || '',
        index: pkgIndex
      }
      this.expressDialogVisible = true
    },
    saveExpress() {
      this.$refs.editExpressFormRef.validate(valid => {
        if (!valid) return
        if (this.editExpressForm.index >= 0) {
          this.shippedPackages[this.editExpressForm.index].expressCompany = this.editExpressForm.company
          this.shippedPackages[this.editExpressForm.index].expressNo = this.editExpressForm.trackingNo
        }
        this.expressDialogVisible = false
        this.$message.success('快递信息已更新')
        this.$emit('update-express', this.currentOrder)
      })
    },
    formatTime(date) {
      const pad = n => n.toString().padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.drawer-body {
  padding: 0 20px 70px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.order-overview {
  background: #f8f9fc;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 14px;
}

.overview-grid {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;

  .overview-item {
    width: 25%;
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .overview-label {
      width: 70px;
      color: #909399;
      font-size: 13px;
      flex-shrink: 0;
    }

    .overview-value {
      color: #303133;
      font-size: 13px;
      display: flex;
      align-items: center;

      .order-no-text {
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .copy-btn {
        margin-left: 6px;
        color: #409EFF;
        cursor: pointer;
        font-size: 14px;
      }
    }
  }
}

.overview-user {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;

  .user-detail {
    margin-left: 12px;

    .user-nickname {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .user-uid {
      font-size: 12px;
      color: #909399;
    }
  }
}

.overview-remark {
  display: flex;
  flex-wrap: wrap;

  .remark-item {
    width: 50%;
    display: flex;
    font-size: 13px;
    margin-bottom: 4px;

    .remark-label {
      width: 70px;
      color: #909399;
      flex-shrink: 0;
    }

    .remark-value {
      color: #606266;
      flex: 1;
      display: flex;
      align-items: center;

      .edit-btn {
        margin-left: 8px;
        color: #409EFF;
        cursor: pointer;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.2s;
      }
    }

    &:hover .edit-btn {
      opacity: 1;
    }
  }
}

.receiver-section {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 14px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: #fafafa;
    border-bottom: 1px solid #ebeef5;

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .section-actions {
      .el-button {
        padding: 0;
        color: #409EFF;
      }
    }
  }

  .receiver-content {
    padding: 10px 14px;
    display: flex;
    flex-wrap: wrap;

    .receiver-item {
      width: 50%;
      display: flex;
      margin-bottom: 6px;
      font-size: 13px;

      &.full-width {
        width: 100%;
      }

      .receiver-label {
        width: 70px;
        color: #909399;
        flex-shrink: 0;
      }

      .receiver-value {
        color: #303133;
        flex: 1;
      }
    }
  }
}

.stats-section {
  display: flex;
  background: #f8f9fc;
  border-radius: 6px;
  padding: 10px 16px;
  margin-bottom: 14px;

  .stat-item {
    flex: 1;
    text-align: center;
    font-size: 13px;
    border-right: 1px solid #ebeef5;

    &:last-child {
      border-right: none;
    }

    .stat-label {
      color: #909399;
      display: block;
      margin-bottom: 4px;
    }

    .stat-value {
      color: #303133;
      font-weight: 600;
      font-size: 16px;

      &.stat-shipped {
        color: #67C23A;
      }

      &.stat-pending {
        color: #E6A23C;
      }
    }
  }
}

.locked-tip {
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 14px;
  color: #F56C6C;
  font-size: 13px;

  i {
    margin-right: 6px;
  }
}

.ship-steps {
  margin-bottom: 16px;
  padding: 0 20px;
}

.step-content {
  .split-toggle {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .split-desc {
      margin-left: 12px;
      font-size: 12px;
      color: #909399;
    }
  }

  .selection-tip {
    margin-top: 12px;
    padding: 10px 14px;
    background: #f8f9fc;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;

    .tip-num {
      color: #409EFF;
      font-weight: 500;
    }
  }
}

.express-form {
  max-width: 400px;
  margin-bottom: 16px;
}

.ship-summary {
  .summary-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 10px;
  }
}

.product-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 12px;
  }
}

.goods-table {
  ::v-deep .el-table__header th {
    background: #fafafa;
    color: #606266;
    font-weight: 500;
    font-size: 12px;
  }
}

.rc-info {
  .rc-name {
    font-size: 13px;
    color: #303133;
    margin-bottom: 4px;
  }

  .rc-addr {
    font-size: 12px;
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.goods-info {
  display: flex;
  align-items: center;

  .goods-img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .goods-detail {
    flex: 1;
    min-width: 0;

    .goods-name {
      font-size: 13px;
      color: #303133;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .goods-id {
      font-size: 12px;
      color: #909399;
    }
  }
}

.img-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 18px;
}

.express-info {
  .ec-company {
    font-size: 13px;
    color: #303133;
    margin-bottom: 4px;
  }

  .ec-no {
    font-size: 12px;
    color: #606266;
    display: flex;
    align-items: center;

    .copy-icon {
      margin-left: 6px;
      color: #409EFF;
      cursor: pointer;
    }
  }
}

.copy-icon {
  color: #409EFF;
  cursor: pointer;
  margin-left: 4px;
}

.pending-highlight {
  color: #E6A23C;
  font-weight: 500;
}

.empty-tip {
  text-align: center;
  padding: 30px 0;
  color: #909399;
  font-size: 13px;
}

.drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  gap: 10px;
}
</style>
