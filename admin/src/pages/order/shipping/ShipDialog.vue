<template>
  <el-drawer
    :visible.sync="drawerVisible"
    direction="rtl"
    size="720px"
    :close-on-press-escape="false"
    :show-close="true"
    :wrapperClosable="false"
    class="ship-drawer"
    @closed="handleClosed"
  >
    <div slot="title" class="drawer-header">
      <span class="drawer-title">订单发货</span>
    </div>

    <div class="ship-drawer-content">
      <!-- 拆分方式 -->
      <div class="split-type-section">
        <span class="split-label">拆分方式</span>
        <el-radio-group v-model="splitType" size="small">
          <el-radio label="sku">按SKU拆分</el-radio>
          <el-radio label="quantity">按数量拆分</el-radio>
        </el-radio-group>
      </div>

      <!-- 收货信息卡片 -->
      <div class="receiver-card">
        <span class="card-label">收货信息</span>
        <div class="card-content">
          <div class="receiver-contact">
            <span class="receiver-name">{{ receiverInfo.name }}</span>
            <span class="receiver-phone">{{ receiverInfo.phone }}</span>
          </div>
          <div class="receiver-address">{{ receiverInfo.fullAddress }}</div>
        </div>
      </div>

      <!-- 用户信息卡片 -->
      <div class="user-card">
        <el-avatar :size="40" :src="userInfo.avatar">
          {{ userInfo.nickname ? userInfo.nickname.charAt(0) : 'U' }}
        </el-avatar>
        <div class="user-info">
          <div class="user-nickname">{{ userInfo.nickname }}</div>
          <div class="order-no">订单编号：{{ orderData.orderNo || orderData.shipmentNo }}</div>
        </div>
        <div class="user-uid">UID: {{ userInfo.uid }}</div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">总计数量：</span>
          <span class="stat-value">{{ goodsStats.totalQty }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总计SKU：</span>
          <span class="stat-value">{{ goodsStats.totalSku }}个</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已发货：</span>
          <span class="stat-value">{{ goodsStats.shippedQty }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待发货：</span>
          <span class="stat-value">{{ goodsStats.pendingQty }}件</span>
        </div>
      </div>

      <!-- 商品 Tabs -->
      <el-tabs v-model="activeTab" class="product-tabs">
        <el-tab-pane label="待发货商品" name="pending">
          <el-table
            ref="pendingTableRef"
            :data="pendingGoodsList"
            @selection-change="handleSelectionChange"
            size="small"
            class="goods-table"
            :header-cell-style="tableHeaderStyle"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="收货信息" min-width="180">
              <template slot-scope>
                <div class="mini-receiver">
                  <div class="mini-receiver-top">
                    <span>{{ receiverInfo.name }}</span>
                    <span class="mini-phone">{{ receiverInfo.phone }}</span>
                  </div>
                  <div class="mini-address">{{ receiverInfo.fullAddress }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="260">
              <template slot-scope="{ row }">
                <div class="product-cell">
                  <el-image
                    :src="row.goodsImage"
                    style="width: 40px; height: 40px"
                    fit="cover"
                  >
                    <div slot="error" class="image-placeholder-small">
                      <i class="el-icon-picture"></i>
                    </div>
                  </el-image>
                  <div class="product-info">
                    <div class="product-name">{{ row.goodsName }}</div>
                    <div class="product-id">商品ID: {{ row.goodsId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="80" align="center">
              <template slot-scope="{ row }">
                <span v-if="splitType === 'sku'">{{ row.pendingQty }}</span>
                <span v-else>1</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已发货商品" name="shipped">
          <el-table
            :data="shippedGoodsList"
            size="small"
            class="goods-table"
            :header-cell-style="tableHeaderStyle"
          >
            <el-table-column label="收货信息" min-width="180">
              <template slot-scope>
                <div class="mini-receiver">
                  <div class="mini-receiver-top">
                    <span>{{ receiverInfo.name }}</span>
                    <span class="mini-phone">{{ receiverInfo.phone }}</span>
                  </div>
                  <div class="mini-address">{{ receiverInfo.fullAddress }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="260">
              <template slot-scope="{ row }">
                <div class="product-cell">
                  <el-image
                    :src="row.goodsImage"
                    style="width: 40px; height: 40px"
                    fit="cover"
                  >
                    <div slot="error" class="image-placeholder-small">
                      <i class="el-icon-picture"></i>
                    </div>
                  </el-image>
                  <div class="product-info">
                    <div class="product-name">{{ row.goodsName }}</div>
                    <div class="product-id">商品ID: {{ row.goodsId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="80" align="center">
              <template slot-scope="{ row }">{{ row.quantity }}</template>
            </el-table-column>
            <el-table-column label="发货时间" width="160" align="center">
              <template slot-scope="{ row }">{{ row.shipTime || '-' }}</template>
            </el-table-column>
          </el-table>
          <div v-if="shippedGoodsList.length === 0" class="empty-state">
            <i class="el-icon-box"></i>
            <span>暂无已发货商品</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部固定栏 -->
    <div class="drawer-footer">
      <span class="selected-info">
        已选择 <span class="selected-count">{{ selectedCount }}</span> 个商品，共 <span class="selected-qty">{{ selectedQuantity }}</span> 件
      </span>
      <div class="footer-buttons">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedQuantity === 0"
          @click="handleShip"
        >发货</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'ShipDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      splitType: 'sku',
      activeTab: 'pending',
      selectedRows: [],
      mockGoodsList: []
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
    receiverInfo() {
      if (this.orderData.receiver) {
        return {
          name: this.orderData.receiver.name || '',
          phone: this.orderData.receiver.phone || '',
          fullAddress: this.orderData.receiver.fullAddress || this.orderData.receiver.address || ''
        }
      }
      return {
        name: '凌东永',
        phone: '13268793291',
        fullAddress: '广东省 深圳市 龙华区 龙观东路时代大厦1层102'
      }
    },
    userInfo() {
      if (this.orderData.user) {
        return {
          uid: this.orderData.user.uid || this.orderData.user.userId || '',
          nickname: this.orderData.user.nickname || '',
          avatar: this.orderData.user.avatar || ''
        }
      }
      return {
        uid: '100',
        nickname: 'Beedo',
        avatar: ''
      }
    },
    goodsItems() {
      return this.mockGoodsList.length ? this.mockGoodsList : (this.orderData.goodsItems || [])
    },
    goodsStats() {
      const items = this.goodsItems
      const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      const totalSku = new Set(items.map(item => item.skuId || item.goodsId)).size
      const shippedQty = items
        .filter(item => item.shipStatus === 'shipped')
        .reduce((sum, item) => sum + (item.quantity || 0), 0)
      const pendingQty = items
        .filter(item => item.shipStatus !== 'shipped' && item.shipStatus !== 'canceled')
        .reduce((sum, item) => sum + (item.quantity || 0), 0)
      return { totalQty, totalSku, shippedQty, pendingQty }
    },
    pendingGoodsList() {
      const pendingItems = this.goodsItems.filter(
        item => item.shipStatus !== 'shipped' && item.shipStatus !== 'canceled'
      )
      if (this.splitType === 'sku') {
        const skuMap = {}
        pendingItems.forEach(item => {
          const key = item.skuId || item.goodsId
          if (!skuMap[key]) {
            skuMap[key] = {
              ...item,
              pendingQty: item.quantity || 0
            }
          } else {
            skuMap[key].pendingQty += item.quantity || 0
          }
        })
        return Object.values(skuMap)
      }
      const result = []
      pendingItems.forEach(item => {
        const qty = item.quantity || 1
        for (let i = 0; i < qty; i++) {
          result.push({ ...item, _index: i })
        }
      })
      return result
    },
    shippedGoodsList() {
      return this.goodsItems.filter(item => item.shipStatus === 'shipped')
    },
    selectedCount() {
      return this.selectedRows.length
    },
    selectedQuantity() {
      if (this.splitType === 'sku') {
        return this.selectedRows.reduce((sum, row) => sum + (row.pendingQty || 0), 0)
      }
      return this.selectedRows.length
    },
    tableHeaderStyle() {
      return {
        background: '#f5f7fa',
        color: '#606266',
        fontWeight: 500,
        fontSize: '13px'
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initMockData()
        this.initData()
      }
    },
    splitType() {
      this.selectedRows = []
      this.$nextTick(() => {
        if (this.$refs.pendingTableRef) {
          this.$refs.pendingTableRef.clearSelection()
        }
      })
    }
  },
  methods: {
    initMockData() {
      this.mockGoodsList = [
        {
          itemId: 'ITEM001',
          goodsId: 87772,
          skuId: 'SKU87772',
          goodsName: '英国Jellycat乳白色怀抱玫瑰邦尼兔玩偶毛绒玩具娃娃兔子生日礼物',
          goodsImage: '',
          category: '毛绒公仔',
          spec: '乳白色',
          quantity: 1,
          shipStatus: 'pending',
          shippedQty: 0,
          pendingQty: 1,
          shipTime: '',
          packageNo: ''
        },
        {
          itemId: 'ITEM002',
          goodsId: 87763,
          skuId: 'SKU87763',
          goodsName: '迪士尼100周年系列Jolu挂件',
          goodsImage: '',
          category: '玩具公仔',
          spec: '默认',
          quantity: 2,
          shipStatus: 'pending',
          shippedQty: 0,
          pendingQty: 2,
          shipTime: '',
          packageNo: ''
        },
        {
          itemId: 'ITEM003',
          goodsId: 87789,
          skuId: 'SKU87789',
          goodsName: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高',
          goodsImage: '',
          category: '毛绒公仔',
          spec: '12cm',
          quantity: 1,
          shipStatus: 'shipped',
          shippedQty: 1,
          pendingQty: 0,
          shipTime: '2026-06-25 14:30:00',
          packageNo: 'PK202606250001'
        },
        {
          itemId: 'ITEM004',
          goodsId: 87795,
          skuId: 'SKU87795',
          goodsName: '星黛露公仔毛绒玩具兔子玩偶布娃娃',
          goodsImage: '',
          category: '毛绒公仔',
          spec: '50cm',
          quantity: 3,
          shipStatus: 'pending',
          shippedQty: 0,
          pendingQty: 3,
          shipTime: '',
          packageNo: ''
        },
        {
          itemId: 'ITEM005',
          goodsId: 87801,
          skuId: 'SKU87801',
          goodsName: 'LINE FRIENDS布朗熊可妮兔毛绒玩偶',
          goodsImage: '',
          category: '毛绒公仔',
          spec: '布朗熊款',
          quantity: 1,
          shipStatus: 'pending',
          shippedQty: 0,
          pendingQty: 1,
          shipTime: '',
          packageNo: ''
        },
        {
          itemId: 'ITEM006',
          goodsId: 87808,
          skuId: 'SKU87808',
          goodsName: '泡泡玛特DIMOO太空旅行系列盲盒手办',
          goodsImage: '',
          category: '潮玩手办',
          spec: '整盒12个',
          quantity: 2,
          shipStatus: 'shipped',
          shippedQty: 2,
          pendingQty: 0,
          shipTime: '2026-06-24 10:15:00',
          packageNo: 'PK202606240001'
        }
      ]
    },
    initData() {
      this.activeTab = 'pending'
      this.selectedRows = []
      if (this.$refs.pendingTableRef) {
        this.$refs.pendingTableRef.clearSelection()
      }
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    handleClosed() {
      this.selectedRows = []
    },
    handleClose() {
      this.drawerVisible = false
    },
    handleShip() {
      if (this.selectedQuantity === 0) {
        this.$message.warning('请选择要发货的商品')
        return
      }
      this.$confirm(`确认发货已选的 ${this.selectedQuantity} 件商品？`, '确认发货', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('发货成功')
        this.$emit('success', {
          splitType: this.splitType,
          goodsList: this.selectedRows,
          quantity: this.selectedQuantity
        })
        this.drawerVisible = false
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.ship-drawer {
  .drawer-header {
    .drawer-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .ship-drawer-content {
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }
  }
}

.split-type-section {
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  .split-label {
    font-size: 14px;
    color: #303133;
    margin-right: 12px;
  }
}

.receiver-card {
  display: flex;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 12px;

  .card-label {
    font-size: 14px;
    color: #606266;
    width: 70px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .card-content {
    flex: 1;
  }

  .receiver-contact {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .receiver-name {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }

  .receiver-phone {
    color: #606266;
    font-size: 14px;
  }

  .receiver-address {
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
  }
}

.user-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;

  .user-info {
    margin-left: 12px;
    flex: 1;
  }

  .user-nickname {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }

  .order-no {
    font-size: 12px;
    color: #909399;
  }

  .user-uid {
    font-size: 12px;
    color: #909399;
  }
}

.stats-row {
  display: flex;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;

  .stat-item {
    flex: 1;
    font-size: 13px;
    text-align: center;

    &:not(:last-child) {
      border-right: 1px solid #e4e7ed;
    }
  }

  .stat-label {
    color: #606266;
  }

  .stat-value {
    color: #303133;
    font-weight: 500;
  }
}

.product-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 12px;
  }

  ::v-deep .el-tabs__item {
    font-size: 14px;
  }
}

.goods-table {
  ::v-deep .el-table__header th {
    background: #f5f7fa;
  }
}

.mini-receiver {
  font-size: 12px;
  line-height: 1.6;

  .mini-receiver-top {
    display: flex;
    gap: 8px;
    margin-bottom: 2px;
  }

  .mini-phone {
    color: #606266;
  }

  .mini-address {
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.product-cell {
  display: flex;
  align-items: center;
}

.product-info {
  margin-left: 10px;
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 13px;

  i {
    font-size: 36px;
    margin-bottom: 10px;
    display: block;
  }
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.selected-info {
  font-size: 13px;
  color: #606266;
}

.selected-count,
.selected-qty {
  color: #409eff;
  font-weight: 600;
}

.footer-buttons {
  display: flex;
  gap: 10px;
}

::v-deep {
  .el-drawer__header {
    padding: 14px 20px;
    margin-bottom: 0;
    border-bottom: 1px solid #ebeef5;
  }

  .el-drawer__body {
    padding: 16px 20px 70px;
  }

  .el-radio__inner {
    width: 14px;
    height: 14px;
  }

  .el-radio__input.is-checked .el-radio__inner {
    border-color: #409eff;
    background: #409eff;
  }
}
</style>
