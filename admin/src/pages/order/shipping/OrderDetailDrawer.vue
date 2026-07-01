<template>
  <el-drawer
    :visible.sync="drawerVisible"
    direction="rtl"
    size="700px"
    :before-close="handleClose"
    custom-class="order-detail-drawer"
  >
    <div slot="title" class="drawer-title">
      <span>订单详情</span>
    </div>

    <div class="drawer-body">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="基础详情" name="basic">
          <div class="section">
            <div class="section-title">基本信息</div>
            <div class="desc-list">
              <div class="desc-item">
                <div class="desc-label">订单编号</div>
                <div class="desc-value">{{ order.orderNo }}</div>
              </div>
              <div class="desc-item">
                <div class="desc-label">订单状态</div>
                <div class="desc-value">
                  <el-tag :type="getStatusTagType(order.status)" size="small">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="desc-item">
                <div class="desc-label">用户ID</div>
                <div class="desc-value">{{ order.user.userId }}</div>
              </div>
              <div class="desc-item">
                <div class="desc-label">用户昵称</div>
                <div class="desc-value">{{ order.user.nickname }}</div>
              </div>
              <div class="desc-item">
                <div class="desc-label">发货时间</div>
                <div class="desc-value">{{ order.logistics.shipTime || '-' }}</div>
              </div>
              <div class="desc-item">
                <div class="desc-label">运费</div>
                <div class="desc-value">¥{{ order.logistics.freight }}</div>
              </div>
              <div class="desc-item">
                <div class="desc-label">锁单状态</div>
                <div class="desc-value">
                  <el-tag :type="order.locked ? 'danger' : 'info'" size="small">
                    {{ order.locked ? '已锁定' : '未锁定' }}
                  </el-tag>
                </div>
              </div>
              <div class="desc-item full-width">
                <div class="desc-label">用户备注</div>
                <div class="desc-value remark-cell">
                  <span>{{ order.remark.userRemark || '-' }}</span>
                  <i class="el-icon-edit edit-icon" @click="handleEditRemark('user')"></i>
                </div>
              </div>
              <div class="desc-item full-width">
                <div class="desc-label">商家备注</div>
                <div class="desc-value remark-cell">
                  <span>{{ order.remark.merchantRemark || '-' }}</span>
                  <i class="el-icon-edit edit-icon" @click="handleEditRemark('merchant')"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">来源信息</div>
            <div class="desc-list">
              <div class="desc-item">
                <div class="desc-label">来源类型</div>
                <div class="desc-value">{{ order.source }}</div>
              </div>
              <div class="desc-item">
                <div class="desc-label">来源单号</div>
                <div class="desc-value">{{ order.sourceOrderId || '-' }}</div>
              </div>
              <div class="desc-item full-width">
                <div class="desc-label">来源记录入口</div>
                <div class="desc-value">
                  <el-button type="text" @click="handleViewSource">
                    点击查看来源详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">收货信息</div>
            <div class="desc-list">
              <div class="desc-item">
                <div class="desc-label">收货人</div>
                <div class="desc-value">{{ order.receiver.name }}</div>
              </div>
              <div class="desc-item">
                <div class="desc-label">联系电话</div>
                <div class="desc-value">{{ order.receiver.phone }}</div>
              </div>
              <div class="desc-item full-width">
                <div class="desc-label">收货地址</div>
                <div class="desc-value">{{ order.receiver.address }}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">订单商品</div>
            <el-table :data="order.goods" border size="small" class="goods-table">
              <el-table-column label="商品信息" min-width="240">
                <template slot-scope="{ row }">
                  <div class="goods-info">
                    <el-image
                      :src="row.image"
                      :preview-src-list="[row.image]"
                      class="goods-image"
                      fit="cover"
                    >
                      <div slot="error" class="image-error">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                    <div class="goods-detail">
                      <div class="goods-name">{{ row.name }}</div>
                      <div class="goods-id">ID：{{ row.goodsId }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="price" label="价格" width="90" align="center">
                <template slot-scope="{ row }">
                  ¥{{ row.price }}
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="订单数量" width="90" align="center" />
              <el-table-column prop="shipped" label="已发货" width="90" align="center" />
              <el-table-column label="剩余未发货" width="100" align="center">
                <template slot-scope="{ row }">
                  {{ row.quantity - row.shipped }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="section">
            <div class="section-title">发货记录</div>
            <el-collapse v-model="activeCollapse" class="ship-collapse">
              <el-collapse-item
                v-for="(item, index) in order.shipRecords"
                :key="index"
                :name="index"
              >
                <template slot="title">
                  <div class="collapse-title">
                    <span class="express-info">
                      {{ item.expressCompany }} {{ item.expressNo }}
                    </span>
                    <i
                      class="el-icon-document-copy copy-icon"
                      @click.stop="copyText(item.expressNo)"
                    ></i>
                  </div>
                </template>
                <div class="ship-detail">
                  <div class="ship-goods" v-for="(goods, gIndex) in item.goods" :key="gIndex">
                    <el-image
                      :src="goods.image"
                      :preview-src-list="[goods.image]"
                      class="ship-goods-image"
                      fit="cover"
                    >
                      <div slot="error" class="image-error">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                    <div class="ship-goods-info">
                      <div class="ship-goods-name">{{ goods.name }}</div>
                      <div class="ship-goods-id">ID：{{ goods.goodsId }}</div>
                      <div class="ship-goods-num">数量：{{ goods.quantity }}</div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="log">
          <el-table :data="operationLogs" border size="small" class="log-table">
            <el-table-column prop="time" label="操作时间" width="170" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="type" label="操作类型" width="120">
              <template slot-scope="{ row }">
                <el-tag :type="getLogTagType(row.type)" size="mini">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="detail" label="操作详情" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'OrderDetailDrawer',
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
      activeTab: 'basic',
      activeCollapse: [0],
      order: {
        orderNo: '',
        status: '',
        locked: false,
        user: {
          userId: '',
          nickname: '',
          avatar: '',
          userNo: ''
        },
        receiver: {
          name: '',
          phone: '',
          address: ''
        },
        remark: {
          userRemark: '',
          merchantRemark: ''
        },
        logistics: {
          company: '',
          no: '',
          shipTime: '',
          freight: 0
        },
        source: '',
        sourceOrderId: '',
        sourceEntryUrl: '',
        goods: [],
        shipRecords: []
      },
      operationLogs: []
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
    }
  },
  watch: {
    visible(val) {
      if (val && this.orderData && this.orderData.orderNo) {
        this.order = { ...this.orderData }
        this.activeTab = 'basic'
        this.activeCollapse = [0]
        this.generateMockLogs()
      }
    },
    orderData: {
      immediate: true,
      handler(val) {
        if (val && val.orderNo) {
          this.order = { ...val }
          this.generateMockLogs()
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    getStatusTagType(status) {
      const types = {
        pending: 'info',
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
    getLogTagType(type) {
      const types = {
        '创建订单': 'success',
        '修改备注': 'warning',
        '修改收货信息': 'warning',
        '审核发货': 'primary',
        '发货': 'success',
        '取消订单': 'danger',
        '审核取消': 'danger',
        '锁单': 'info',
        '解锁': 'info'
      }
      return types[type] || 'info'
    },
    handleEditRemark(type) {
      this.$emit('edit-remark', type, this.order)
    },
    handleViewSource() {
      this.$message.info('跳转到来源详情页：' + (this.order.sourceEntryUrl || '#'))
    },
    copyText(text) {
      if (this.$copyText) {
        this.$copyText(text).then(() => {
          this.$message.success('复制成功')
        }).catch(() => {
          this.$message.error('复制失败')
        })
      } else {
        const input = document.createElement('textarea')
        input.value = text
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        this.$message.success('复制成功')
      }
    },
    generateMockLogs() {
      this.operationLogs = [
        {
          time: '2026-06-23 18:46:35',
          operator: 'admin',
          type: '发货',
          detail: '顺丰快递 SF9876543210'
        },
        {
          time: '2026-06-22 10:20:15',
          operator: '张三',
          type: '修改备注',
          detail: '商家备注：VIP客户'
        },
        {
          time: '2026-06-21 15:30:00',
          operator: 'admin',
          type: '锁单',
          detail: '订单已锁定，禁止修改收货信息'
        },
        {
          time: '2026-06-20 09:15:42',
          operator: '系统',
          type: '创建订单',
          detail: '订单创建成功，订单号：' + this.order.orderNo
        },
        {
          time: '2026-06-19 16:00:00',
          operator: 'admin',
          type: '修改收货信息',
          detail: '修改收货人：张三'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.drawer-body {
  padding: 0 20px 20px;
}

.section {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
  line-height: 1;
}

.desc-list {
  display: flex;
  flex-wrap: wrap;
}

.desc-item {
  width: 50%;
  display: flex;
  margin-bottom: 10px;
  font-size: 13px;

  &.full-width {
    width: 100%;
  }

  &:nth-last-child(-n+2) {
    margin-bottom: 0;
  }
}

.desc-label {
  width: 90px;
  flex-shrink: 0;
  color: #909399;
  line-height: 22px;
}

.desc-value {
  flex: 1;
  color: #303133;
  line-height: 22px;
  word-break: break-all;
}

.remark-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .edit-icon {
    color: #409EFF;
    cursor: pointer;
    font-size: 14px;
    margin-left: 8px;
    flex-shrink: 0;
  }
}

.goods-info {
  display: flex;
  align-items: center;
}

.goods-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 20px;
}

.goods-detail {
  flex: 1;
  min-width: 0;
}

.goods-name {
  font-size: 13px;
  color: #303133;
  line-height: 18px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-id {
  font-size: 12px;
  color: #909399;
  line-height: 16px;
}

.collapse-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .express-info {
    color: #303133;
    font-weight: 500;
  }

  .copy-icon {
    color: #409EFF;
    cursor: pointer;
    font-size: 16px;
  }
}

.ship-detail {
  padding: 8px 0;
}

.ship-goods {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.ship-goods-image {
  width: 42px;
  height: 42px;
  border-radius: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}

.ship-goods-info {
  flex: 1;
  min-width: 0;
}

.ship-goods-name {
  font-size: 13px;
  color: #303133;
  line-height: 18px;
  margin-bottom: 2px;
}

.ship-goods-id {
  font-size: 12px;
  color: #909399;
  line-height: 16px;
  margin-bottom: 2px;
}

.ship-goods-num {
  font-size: 12px;
  color: #606266;
  line-height: 16px;
}
</style>

<style lang="scss">
.order-detail-drawer .el-tabs__header {
  margin-bottom: 16px;
}

.order-detail-drawer .goods-table .el-table__header th {
  background: #fafafa;
  color: #606266;
  font-weight: 500;
}

.order-detail-drawer .ship-collapse .el-collapse-item__header {
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

.order-detail-drawer .ship-collapse .el-collapse-item__content {
  padding-bottom: 12px;
}

.order-detail-drawer .log-table .el-table__header th {
  background: #fafafa;
  color: #606266;
  font-weight: 500;
}
</style>
