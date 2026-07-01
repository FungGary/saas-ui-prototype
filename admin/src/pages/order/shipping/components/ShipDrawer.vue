<template>
  <el-drawer
    :visible.sync="visible"
    title="订单发货"
    size="600px"
    direction="rtl"
    :before-close="handleClose"
  >
    <template v-if="orderData">
      <!-- 拆分方式 -->
      <div class="split-type-section">
        <span class="split-label">拆分方式</span>
        <el-radio-group v-model="splitType" size="small">
          <el-radio label="sku">按SKU拆分</el-radio>
          <el-radio label="quantity">按数量拆分</el-radio>
        </el-radio-group>
        <div class="split-desc">
          <template v-if="splitType === 'sku'">
            <span class="desc-text">按 SKU 拆分为不同 SKU 分开发货</span>
          </template>
          <template v-else>
            <span class="desc-text">按数量拆分为同一商品分批发货</span>
          </template>
        </div>
      </div>

      <!-- 收货信息卡片 -->
      <el-card shadow="never" class="info-card">
        <div class="receiver-card">
          <span class="card-label">收货信息</span>
          <div class="card-content">
            <div class="receiver-contact">
              <span class="receiver-name">{{ orderData.receiverName }}</span>
              <span class="receiver-phone">{{ orderData.receiverPhone }}</span>
            </div>
            <div class="receiver-address">{{ orderData.receiverAddress }}</div>
          </div>
        </div>
      </el-card>

      <!-- 用户信息卡片 -->
      <el-card shadow="never" class="info-card">
        <div class="user-card">
          <el-avatar :size="40" :src="orderData.userAvatar">
            {{ orderData.userNickname ? orderData.userNickname.charAt(0) : 'U' }}
          </el-avatar>
          <div class="user-info">
            <div class="user-nickname">{{ orderData.userNickname }}</div>
            <div class="user-no">编号: {{ orderData.userNo }}</div>
          </div>
          <div class="order-no-info">
            <span class="order-no-label">订单编号:</span>
            <span class="order-no-value">{{ orderData.orderNo }}</span>
          </div>
        </div>
      </el-card>

      <!-- 统计数据 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">总数量：</span>
          <span class="stat-value">{{ totalQuantity }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总计SKU：</span>
          <span class="stat-value">{{ skuCount }}个</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已发货：</span>
          <span class="stat-value">{{ shippedQuantity }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待发货：</span>
          <span class="stat-value">{{ remainingQuantity }}件</span>
        </div>
      </div>

      <!-- 商品拆分子 Tabs -->
      <el-tabs v-model="productTab" class="product-tabs">
        <el-tab-pane label="待发货商品" name="pending">
          <el-table
            ref="productTableRef"
            :data="pendingProducts"
            @selection-change="handleProductSelectionChange"
            size="small"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="收货信息" min-width="150">
              <template slot-scope>
                <div class="mini-receiver">
                  <div>{{ orderData.receiverName }} {{ orderData.receiverPhone }}</div>
                  <div class="mini-address">{{ orderData.receiverAddress }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="200">
              <template slot-scope="{ row }">
                <div class="product-cell">
                  <el-image
                    :src="row.image"
                    style="width: 40px; height: 40px"
                    fit="cover"
                  >
                    <div slot="error" class="image-placeholder-small">
                      <i class="el-icon-picture"></i>
                    </div>
                  </el-image>
                  <div class="product-info">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-id">ID: {{ row.id }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template slot-scope="{ row }">
                <el-input-number
                  v-model="row.shipQuantity"
                  :min="1"
                  :max="row.remaining"
                  size="mini"
                  controls-position="right"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="已发货商品" name="shipped">
          <el-table :data="shippedProducts" size="small">
            <el-table-column label="收货信息" min-width="150">
              <template slot-scope>
                <div class="mini-receiver">
                  <div>{{ orderData.receiverName }} {{ orderData.receiverPhone }}</div>
                  <div class="mini-address">{{ orderData.receiverAddress }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="200">
              <template slot-scope="{ row }">
                <div class="product-cell">
                  <el-image
                    :src="row.image"
                    style="width: 40px; height: 40px"
                    fit="cover"
                  >
                    <div slot="error" class="image-placeholder-small">
                      <i class="el-icon-picture"></i>
                    </div>
                  </el-image>
                  <div class="product-info">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-id">ID: {{ row.id }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="已发货数量" width="100" align="center">
              <template slot-scope="{ row }">{{ row.shipped }}</template>
            </el-table-column>
            <el-table-column label="发货时间" width="160" align="center">
              <template slot-scope>
                {{ getShipTime() }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="shippedProducts.length === 0" description="暂无已发货商品" :image-size="60" />
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- 底部固定栏 -->
    <div class="drawer-footer">
      <span class="selected-info">
        已选择 <span class="selected-count">{{ selectedProducts.length }}</span> 个商品
      </span>
      <div class="footer-buttons">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedProducts.length === 0"
          @click="handleConfirm"
        >发货</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'ShipDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      splitType: 'sku',
      productTab: 'pending',
      selectedProducts: [],
      pendingProductsData: []
    }
  },
  computed: {
    totalQuantity() {
      if (!this.orderData || !this.orderData.products) return 0
      return this.orderData.products.reduce((sum, p) => sum + p.quantity, 0)
    },
    skuCount() {
      if (!this.orderData || !this.orderData.products) return 0
      return this.orderData.products.length
    },
    shippedQuantity() {
      if (!this.orderData || !this.orderData.products) return 0
      return this.orderData.products.reduce((sum, p) => sum + p.shipped, 0)
    },
    remainingQuantity() {
      if (!this.orderData || !this.orderData.products) return 0
      return this.orderData.products.reduce((sum, p) => sum + p.remaining, 0)
    },
    pendingProducts() {
      if (!this.orderData || !this.orderData.products) return []
      return this.orderData.products
        .filter(p => p.remaining > 0)
        .map(p => ({
          ...p,
          shipQuantity: p.remaining
        }))
    },
    shippedProducts() {
      if (!this.orderData || !this.orderData.products) return []
      return this.orderData.products.filter(p => p.shipped > 0)
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.selectedProducts = []
        this.splitType = 'sku'
        this.productTab = 'pending'
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleProductSelectionChange(rows) {
      this.selectedProducts = rows
    },
    handleConfirm() {
      if (this.selectedProducts.length === 0) {
        return
      }
      this.$emit('confirm', {
        splitType: this.splitType,
        products: this.selectedProducts
      })
    },
    getShipTime() {
      if (this.orderData && this.orderData.shippingRecords && this.orderData.shippingRecords.length > 0) {
        return this.orderData.shippingRecords[0].shipTime
      }
      return '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.split-type-section {
  margin-bottom: 16px;
}

.split-label {
  font-size: 14px;
  color: #303133;
  margin-right: 16px;
}

.split-desc {
  margin-top: 8px;
}

.desc-text {
  font-size: 12px;
  color: #909399;
}

.info-card {
  margin-bottom: 12px;
}

.receiver-card {
  display: flex;
}

.card-label {
  font-size: 14px;
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.receiver-contact {
  display: flex;
  gap: 8px;
}

.receiver-name {
  font-weight: 500;
  color: #303133;
}

.receiver-phone {
  color: #606266;
}

.receiver-address {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.user-card {
  display: flex;
  align-items: center;
}

.user-info {
  margin-left: 12px;
}

.user-nickname {
  font-size: 14px;
  color: #303133;
}

.user-no {
  font-size: 12px;
  color: #909399;
}

.order-no-info {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.order-no-label {
  color: #909399;
}

.order-no-value {
  color: #606266;
}

.stats-row {
  display: flex;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.stat-item {
  flex: 1;
  font-size: 13px;
}

.stat-label {
  color: #606266;
}

.stat-value {
  color: #303133;
  font-weight: 500;
}

.product-tabs {
  margin-bottom: 0;
}

.mini-receiver {
  font-size: 12px;
  line-height: 1.6;
}

.mini-address {
  color: #909399;
}

.product-cell {
  display: flex;
  align-items: center;
}

.product-info {
  margin-left: 8px;
}

.product-name {
  font-size: 13px;
  color: #303133;
}

.product-id {
  font-size: 12px;
  color: #909399;
}

.image-placeholder-small {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  font-size: 14px;
  color: #606266;
}

.selected-count {
  color: #409EFF;
  font-weight: 600;
}

.footer-buttons {
  display: flex;
  gap: 8px;
}
</style>