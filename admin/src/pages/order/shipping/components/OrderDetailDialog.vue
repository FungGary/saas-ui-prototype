<template>
  <el-dialog
    :visible.sync="visible"
    title="订单详情"
    width="700px"
    :before-close="handleClose"
  >
    <template v-if="orderData">
      <!-- 基本信息 -->
      <el-card shadow="never" class="detail-card">
        <div slot="header">
          <span class="card-title">基本信息</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ orderData.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusTagType(orderData.status)" size="small">
              {{ getStatusText(orderData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ orderData.userNo }}</el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ orderData.userNickname }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ getShipTime(orderData) }}</el-descriptions-item>
          <el-descriptions-item label="运费">{{ orderData.freight }}</el-descriptions-item>
          <el-descriptions-item label="锁单状态">
            <el-tag v-if="orderData.isLocked" type="warning" size="small">
              <i class="el-icon-lock"></i> 已锁单
            </el-tag>
            <span v-else>未锁单</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ orderData.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="用户备注">{{ orderData.userRemark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商家备注">{{ orderData.merchantRemark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 订单来源 -->
      <el-card shadow="never" class="detail-card">
        <div slot="header">
          <span class="card-title">订单来源</span>
        </div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="来源类型">{{ orderData.sourceType }}</el-descriptions-item>
          <el-descriptions-item label="来源单号">{{ orderData.sourceOrderNo }}</el-descriptions-item>
          <el-descriptions-item label="来源记录">
            <el-link type="primary" :href="orderData.sourceLink" target="_blank">
              点击查看
            </el-link>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 收货信息 -->
      <el-card shadow="never" class="detail-card">
        <div slot="header">
          <span class="card-title">收货信息</span>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="收货人">{{ orderData.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ orderData.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ orderData.receiverAddress }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 订单商品 -->
      <el-card shadow="never" class="detail-card">
        <div slot="header">
          <span class="card-title">订单商品</span>
        </div>
        <el-table :data="orderData.products" border size="small">
          <el-table-column label="商品图片" width="80">
            <template slot-scope="{ row }">
              <el-image
                :src="row.image"
                style="width: 50px; height: 50px"
                fit="cover"
              >
                <div slot="error" class="image-placeholder">
                  <i class="el-icon-picture"></i>
                </div>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" min-width="200">
            <template slot-scope="{ row }">
              <div>{{ row.name }}</div>
              <div class="product-id">ID: {{ row.id }}</div>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="100" align="center">
            <template slot-scope="{ row }">{{ row.price }}</template>
          </el-table-column>
          <el-table-column label="订单数量" width="100" align="center">
            <template slot-scope="{ row }">{{ row.quantity }}</template>
          </el-table-column>
          <el-table-column label="已发货" width="100" align="center">
            <template slot-scope="{ row }">{{ row.shipped }}</template>
          </el-table-column>
          <el-table-column label="剩余未发货" width="100" align="center">
            <template slot-scope="{ row }">{{ row.remaining }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 发货记录 -->
      <el-card shadow="never" class="detail-card">
        <div slot="header">
          <span class="card-title">发货记录</span>
        </div>
        <template v-if="orderData.shippingRecords && orderData.shippingRecords.length > 0">
          <div v-for="(record, index) in orderData.shippingRecords" :key="index" class="shipping-record">
            <div class="record-header">
              <span class="express-info">
                {{ record.expressCompany }} - {{ record.expressNo }}
              </span>
              <span class="ship-time">{{ record.shipTime }}</span>
            </div>
            <div class="record-products">
              <el-tag size="small" type="info">已发货商品</el-tag>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无发货记录" :image-size="60" />
      </el-card>

      <!-- 取消信息（仅取消状态显示） -->
      <el-card
        v-if="orderData.status === 'canceling' || orderData.status === 'canceled'"
        shadow="never"
        class="detail-card"
      >
        <div slot="header">
          <span class="card-title">取消信息</span>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="取消原因">{{ orderData.cancelReason }}</el-descriptions-item>
          <el-descriptions-item label="取消人">{{ orderData.cancelBy }}</el-descriptions-item>
          <el-descriptions-item label="取消时间">{{ orderData.cancelTime }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </template>

    <span slot="footer">
      <el-button @click="handleClose">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'OrderDetailDialog',
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
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    getStatusTagType(status) {
      const types = {
        pending: 'primary',
        receiving: 'warning',
        completed: 'success',
        canceling: 'danger',
        canceled: 'info'
      }
      return types[status] || 'info'
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
    getShipTime(orderData) {
      if (orderData.shippingRecords && orderData.shippingRecords.length > 0) {
        return orderData.shippingRecords[0].shipTime
      }
      return '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-card {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.product-id {
  font-size: 12px;
  color: #909399;
}

.image-placeholder {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

.shipping-record {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.express-info {
  font-weight: 500;
  color: #303133;
}

.ship-time {
  font-size: 12px;
  color: #909399;
}

.record-products {
  margin-top: 8px;
}
</style>