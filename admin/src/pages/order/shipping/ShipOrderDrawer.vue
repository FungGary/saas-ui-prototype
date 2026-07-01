<template>
  <el-drawer
    title="订单发货"
    :visible.sync="drawerVisible"
    direction="rtl"
    :size="drawerWidth"
    :modal-append-to-body="false"
    :wrapper-closable="false"
    @close="handleClose"
  >
    <div class="ship-order-drawer">
      <el-card shadow="never" class="section-card">
        <div slot="header" class="card-header">
          <span class="card-title">拆分方式</span>
        </div>
        <el-radio-group v-model="splitType" class="split-radio-group" @change="handleSplitTypeChange">
          <el-radio label="sku">按 SKU 拆分</el-radio>
          <el-radio label="quantity">按数量拆分</el-radio>
        </el-radio-group>
        <div class="split-tip">
          <i class="el-icon-info"></i>
          <span>{{ splitTipText }}</span>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card">
        <div slot="header" class="card-header">
          <span class="card-title">收货信息确认</span>
          <el-button type="text" size="mini" @click="copyAddress">
            <i class="el-icon-document-copy"></i> 复制地址
          </el-button>
        </div>
        <div class="receiver-confirm-card">
          <div class="receiver-row">
            <span class="receiver-label">收货人：</span>
            <span class="receiver-value">{{ receiver.name }}</span>
          </div>
          <div class="receiver-row">
            <span class="receiver-label">联系电话：</span>
            <span class="receiver-value">{{ maskPhone(receiver.phone) }}</span>
          </div>
          <div class="receiver-row">
            <span class="receiver-label">完整地址：</span>
            <span class="receiver-value address-text">{{ receiver.fullAddress }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card">
        <div slot="header" class="card-header">
          <span class="card-title">用户与订单信息</span>
        </div>
        <div class="user-order-info">
          <div class="user-info-row">
            <el-avatar :size="40" :src="user.avatar">
              {{ user.nickname ? user.nickname.charAt(0) : 'U' }}
            </el-avatar>
            <div class="user-info-text">
              <div class="user-nickname">{{ user.nickname }}</div>
              <div class="user-sub">UID：{{ user.uid }} &nbsp;|&nbsp; {{ maskPhone(user.phone) }}</div>
            </div>
          </div>
          <div class="order-info-row">
            <div class="order-info-item">
              <span class="info-label">发货单号：</span>
              <span class="info-value">{{ detailData.shipmentNo }}</span>
            </div>
            <div class="order-info-item">
              <span class="info-label">订单来源：</span>
              <span class="info-value">{{ detailData.sourceName }}</span>
            </div>
            <div class="order-info-item">
              <span class="info-label">源单号：</span>
              <span class="info-value">{{ detailData.sourceNo }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card">
        <div slot="header" class="card-header">
          <span class="card-title">商品统计</span>
        </div>
        <div class="goods-stats">
          <div class="stat-item">
            <div class="stat-num">{{ goodsStats.totalQty }}</div>
            <div class="stat-label">总计数量(件)</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ goodsStats.totalSku }}</div>
            <div class="stat-label">总计SKU(个)</div>
          </div>
          <div class="stat-item shipped">
            <div class="stat-num">{{ goodsStats.shippedQty }}</div>
            <div class="stat-label">已发货(件)</div>
          </div>
          <div class="stat-item pending">
            <div class="stat-num">{{ goodsStats.pendingQty }}</div>
            <div class="stat-label">待发货(件)</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card">
        <div slot="header" class="card-header">
          <span class="card-title">商品明细</span>
        </div>
        <el-tabs v-model="goodsTab" size="small" class="goods-tabs">
          <el-tab-pane label="待发货商品" name="pending">
            <el-table
              ref="pendingTableRef"
              :data="pendingGoodsList"
              border
              size="mini"
              class="goods-table"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                v-if="canShip"
                type="selection"
                width="45"
                align="center"
                :selectable="isRowSelectable"
              />
              <el-table-column label="收货信息" min-width="160">
                <template slot-scope="{ row }">
                  <div class="receiver-mini">
                    <div class="receiver-mini-name">{{ receiver.name }} {{ maskPhone(receiver.phone) }}</div>
                    <div class="receiver-mini-addr ellipsis">{{ receiver.fullAddress }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="商品信息" min-width="220">
                <template slot-scope="{ row }">
                  <div class="goods-info-cell">
                    <img :src="row.goodsImage || defaultImg" class="goods-thumb" alt="" />
                    <div class="goods-text">
                      <div class="goods-name">{{ row.goodsName }}</div>
                      <div class="goods-sub">商品ID：{{ row.goodsId }}</div>
                      <div class="goods-sub">规格：{{ row.spec }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="数量" width="70" align="center">
                <template slot-scope="{ row }">
                  {{ splitType === 'sku' ? row.pendingQty : 1 }}
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="pendingGoodsList.length === 0" description="暂无待发货商品" :image-size="60" />
          </el-tab-pane>
          <el-tab-pane label="已发货商品" name="shipped">
            <el-table :data="shippedGoodsList" border size="mini" class="goods-table">
              <el-table-column label="收货信息" min-width="160">
                <template slot-scope="{ row }">
                  <div class="receiver-mini">
                    <div class="receiver-mini-name">{{ receiver.name }} {{ maskPhone(receiver.phone) }}</div>
                    <div class="receiver-mini-addr ellipsis">{{ receiver.fullAddress }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="商品信息" min-width="220">
                <template slot-scope="{ row }">
                  <div class="goods-info-cell">
                    <img :src="row.goodsImage || defaultImg" class="goods-thumb" alt="" />
                    <div class="goods-text">
                      <div class="goods-name">{{ row.goodsName }}</div>
                      <div class="goods-sub">商品ID：{{ row.goodsId }}</div>
                      <div class="goods-sub">规格：{{ row.spec }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="数量" width="60" align="center">
                <template slot-scope="{ row }">
                  {{ splitType === 'sku' ? row.shippedQty : 1 }}
                </template>
              </el-table-column>
              <el-table-column label="快递公司" width="100">
                <template slot-scope="{ row }">{{ row.expressCompany || '-' }}</template>
              </el-table-column>
              <el-table-column label="快递单号" width="150">
                <template slot-scope="{ row }">
                  <span v-if="row.expressNo">{{ row.expressNo }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="发货时间" width="150">
                <template slot-scope="{ row }">{{ row.shipTime || '-' }}</template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template slot-scope="{ row }">
                  <el-button type="text" size="mini" @click="viewShippedLogistics(row)">查看物流</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="shippedGoodsList.length === 0" description="暂无已发货商品" :image-size="60" />
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <el-card shadow="never" class="section-card" v-if="goodsTab === 'pending' && canShip">
        <div slot="header" class="card-header">
          <span class="card-title">物流信息</span>
        </div>
        <el-form :model="logisticsForm" :rules="logisticsRules" ref="logisticsFormRef" label-width="90px" size="small">
          <el-form-item label="发货方式" prop="deliveryType">
            <el-radio-group v-model="logisticsForm.deliveryType">
              <el-radio label="express">快递配送</el-radio>
              <el-radio label="no_express">无需物流</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="logisticsForm.deliveryType === 'express'" label="快递公司" prop="expressCompany">
            <el-select v-model="logisticsForm.expressCompany" placeholder="请选择快递公司" style="width: 100%;">
              <el-option label="顺丰快递" value="顺丰快递" />
              <el-option label="京东物流" value="京东物流" />
              <el-option label="圆通速递" value="圆通速递" />
              <el-option label="中通快递" value="中通快递" />
              <el-option label="申通快递" value="申通快递" />
              <el-option label="韵达快递" value="韵达快递" />
              <el-option label="极兔速递" value="极兔速递" />
              <el-option label="邮政EMS" value="邮政EMS" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="logisticsForm.deliveryType === 'express'" label="快递单号" prop="expressNo">
            <el-input v-model="logisticsForm.expressNo" placeholder="请输入快递单号" clearable />
          </el-form-item>
          <el-form-item label="运费" prop="freight">
            <el-input-number
              v-model="logisticsForm.freight"
              :min="0"
              :precision="2"
              :step="1"
              style="width: 200px;"
            />
            <span class="form-suffix">元</span>
          </el-form-item>
          <el-form-item label="运费承担方" prop="freightBearer">
            <el-select v-model="logisticsForm.freightBearer" placeholder="请选择" style="width: 200px;">
              <el-option label="平台承担" value="platform" />
              <el-option label="用户承担" value="user" />
              <el-option label="商户承担" value="merchant" />
            </el-select>
          </el-form-item>
          <el-form-item label="发货备注">
            <el-input
              v-model="logisticsForm.shipRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入发货备注（选填）"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div slot="footer" class="drawer-footer">
      <div class="footer-left">
        <span v-if="canShip">
          已选择 <span class="selected-num">{{ selectedRows.length }}</span> 个商品，共 <span class="selected-num">{{ selectedQuantity }}</span> 件
        </span>
        <span v-else-if="!canShip && shipDisabledReason" class="disabled-reason">
          <i class="el-icon-warning-outline"></i> {{ shipDisabledReason }}
        </span>
      </div>
      <div class="footer-right">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-tooltip v-if="!canShip" :content="shipDisabledReason" placement="top">
          <el-button type="primary" size="small" disabled>发货</el-button>
        </el-tooltip>
        <el-button
          v-else
          type="primary"
          size="small"
          :disabled="selectedRows.length === 0"
          @click="handleSubmitShip"
        >
          发货
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'ShipOrderDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultImg: '',
      drawerWidth: '55%',
      goodsTab: 'pending',
      splitType: 'sku',
      selectedRows: [],
      logisticsForm: {
        deliveryType: 'express',
        expressCompany: '',
        expressNo: '',
        freight: 0,
        freightBearer: 'platform',
        shipRemark: ''
      },
      logisticsRules: {
        deliveryType: [
          { required: true, message: '请选择发货方式', trigger: 'change' }
        ],
        expressCompany: [
          { required: true, message: '请选择快递公司', trigger: 'change' }
        ],
        expressNo: [
          { required: true, message: '请输入快递单号', trigger: 'blur' }
        ],
        freight: [
          {
            validator: (rule, value, callback) => {
              if (value !== null && value !== '' && value < 0) {
                callback(new Error('运费不能为负数'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        freightBearer: [
          { required: true, message: '请选择运费承担方', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    user() {
      return this.detailData.user || {};
    },
    receiver() {
      return this.detailData.receiver || {};
    },
    goodsItems() {
      return this.detailData.goodsItems || [];
    },
    goodsStats() {
      const items = this.goodsItems;
      const skuMap = {};
      let totalQty = 0;
      let shippedQty = 0;
      let pendingQty = 0;
      items.forEach(item => {
        const qty = item.quantity || 1;
        totalQty += qty;
        if (item.shipStatus === 'shipped') {
          shippedQty += qty;
        } else if (item.shipStatus === 'pending') {
          pendingQty += qty;
        }
        if (!skuMap[item.skuId]) {
          skuMap[item.skuId] = true;
        }
      });
      return {
        totalQty,
        totalSku: Object.keys(skuMap).length,
        shippedQty,
        pendingQty
      };
    },
    pendingGoodsList() {
      if (this.splitType === 'sku') {
        return this.getSkuGroupedPending();
      }
      return this.getQuantityPending();
    },
    shippedGoodsList() {
      if (this.splitType === 'sku') {
        return this.getSkuGroupedShipped();
      }
      return this.getQuantityShipped();
    },
    selectedQuantity() {
      let total = 0;
      this.selectedRows.forEach(row => {
        if (this.splitType === 'sku') {
          total += row.pendingQty || 0;
        } else {
          total += 1;
        }
      });
      return total;
    },
    canShip() {
      if (this.detailData.locked) return false;
      if (this.detailData.status !== 'pending_shipment') return false;
      if (this.goodsStats.pendingQty === 0) return false;
      return true;
    },
    shipDisabledReason() {
      if (this.detailData.locked) return '订单已锁单，暂不可发货';
      if (this.detailData.status !== 'pending_shipment') return '当前状态不可发货';
      if (this.goodsStats.pendingQty === 0) return '所有商品已发货';
      return '';
    },
    splitTipText() {
      if (this.splitType === 'sku') {
        return '按 SKU 拆分：相同 SKU 聚合成一行，勾选表示该 SKU 全部待发数量本次发货。';
      }
      return '按数量拆分：每件商品独立一行，可逐件选择发货，适合部分发货或逐件追踪。';
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initDrawer();
      }
    },
    'detailData.sourceType'(val) {
      this.splitType = val === 'backpack' ? 'quantity' : 'sku';
    }
  },
  methods: {
    initDrawer() {
      this.goodsTab = 'pending';
      this.splitType = this.detailData.sourceType === 'backpack' ? 'quantity' : 'sku';
      this.selectedRows = [];
      this.logisticsForm = {
        deliveryType: 'express',
        expressCompany: '',
        expressNo: '',
        freight: 0,
        freightBearer: 'platform',
        shipRemark: ''
      };
      this.$nextTick(() => {
        if (this.$refs.logisticsFormRef) {
          this.$refs.logisticsFormRef.clearValidate();
        }
      });
    },
    getSkuGroupedPending() {
      const items = this.goodsItems.filter(i => i.shipStatus === 'pending');
      const skuMap = {};
      items.forEach(item => {
        const key = item.skuId;
        if (!skuMap[key]) {
          skuMap[key] = {
            goodsId: item.goodsId,
            skuId: item.skuId,
            goodsName: item.goodsName,
            goodsImage: item.goodsImage,
            spec: item.spec,
            pendingQty: 0,
            itemIds: [],
            backpackRecordIds: []
          };
        }
        skuMap[key].pendingQty += item.quantity || 1;
        skuMap[key].itemIds.push(item.itemId);
        if (item.backpackRecordId) {
          skuMap[key].backpackRecordIds.push(item.backpackRecordId);
        }
      });
      return Object.values(skuMap);
    },
    getSkuGroupedShipped() {
      const items = this.goodsItems.filter(i => i.shipStatus === 'shipped');
      const skuMap = {};
      items.forEach(item => {
        const key = item.skuId;
        if (!skuMap[key]) {
          skuMap[key] = {
            goodsId: item.goodsId,
            skuId: item.skuId,
            goodsName: item.goodsName,
            goodsImage: item.goodsImage,
            spec: item.spec,
            shippedQty: 0,
            expressCompany: item.expressCompany || '',
            expressNo: item.expressNo || '',
            shipTime: item.shipTime || '',
            packageNo: item.packageNo || ''
          };
        }
        skuMap[key].shippedQty += item.quantity || 1;
      });
      return Object.values(skuMap);
    },
    getQuantityPending() {
      const items = this.goodsItems.filter(i => i.shipStatus === 'pending');
      const list = [];
      items.forEach(item => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          list.push({
            ...item,
            quantity: 1,
            _index: i
          });
        }
      });
      return list;
    },
    getQuantityShipped() {
      const items = this.goodsItems.filter(i => i.shipStatus === 'shipped');
      const list = [];
      items.forEach(item => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          list.push({
            ...item,
            quantity: 1,
            _index: i
          });
        }
      });
      return list;
    },
    isRowSelectable(row) {
      return true;
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows;
    },
    handleSplitTypeChange() {
      this.selectedRows = [];
      this.$nextTick(() => {
        if (this.$refs.pendingTableRef) {
          this.$refs.pendingTableRef.clearSelection();
        }
      });
    },
    maskPhone(phone) {
      if (!phone) return '';
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    },
    copyAddress() {
      const addr = `${this.receiver.name} ${this.receiver.phone} ${this.receiver.fullAddress}`;
      const input = document.createElement('textarea');
      input.value = addr;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.$message.success('复制成功');
    },
    viewShippedLogistics(row) {
      this.$message.info('查看物流详情');
    },
    validateLogisticsForm() {
      return new Promise(resolve => {
        if (this.logisticsForm.deliveryType !== 'express') {
          resolve(true);
          return;
        }
        this.$refs.logisticsFormRef.validate(valid => {
          resolve(valid);
        });
      });
    },
    handleSubmitShip() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要发货的商品');
        return;
      }
      this.validateLogisticsForm().then(valid => {
        if (!valid) return;
        const goodsList = this.selectedRows.map(row => {
          if (this.splitType === 'sku') {
            return {
              goodsId: row.goodsId,
              skuId: row.skuId,
              quantity: row.pendingQty,
              detailIds: row.itemIds || [],
              backpackRecordIds: row.backpackRecordIds || []
            };
          }
          return {
            goodsId: row.goodsId,
            skuId: row.skuId,
            quantity: 1,
            detailIds: [row.itemId],
            backpackRecordIds: row.backpackRecordId ? [row.backpackRecordId] : []
          };
        });
        const submitData = {
          shipmentNo: this.detailData.shipmentNo,
          sourceType: this.detailData.sourceType,
          sourceNo: this.detailData.sourceNo,
          splitType: this.splitType,
          receiver: {
            name: this.receiver.name,
            phone: this.receiver.phone,
            fullAddress: this.receiver.fullAddress
          },
          logistics: {
            deliveryType: this.logisticsForm.deliveryType,
            expressCompany: this.logisticsForm.expressCompany,
            expressNo: this.logisticsForm.expressNo,
            freight: this.logisticsForm.freight,
            freightBearer: this.logisticsForm.freightBearer,
            shipRemark: this.logisticsForm.shipRemark
          },
          goodsList
        };
        console.log('发货提交数据：', submitData);
        this.$confirm('确认提交发货？', '发货确认', {
          confirmButtonText: '确认发货',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message.success('发货成功');
          const now = this.formatTime(new Date());
          this.$emit('ship-success', {
            shipTime: now,
            data: submitData
          });
          this.handleClose();
        }).catch(() => {});
      });
    },
    handleClose() {
      this.drawerVisible = false;
    },
    formatTime(date) {
      const pad = n => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.ship-order-drawer {
  padding: 0 0 60px 0;
  background: #f5f7fa;
  min-height: 100%;
}

.section-card {
  margin-bottom: 12px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  align-items: center;
}
.card-header .card-title {
  margin-left: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 8px;
  border-left: 3px solid #409eff;
  line-height: 1;
}

.split-radio-group {
  ::v-deep .el-radio {
    margin-right: 24px;
  }
}

.split-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
  display: flex;
  align-items: flex-start;

  i {
    margin-top: 1px;
    margin-right: 6px;
  }
}

.receiver-confirm-card {
  padding: 12px 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.receiver-row {
  line-height: 24px;
  font-size: 13px;
  display: flex;
  align-items: flex-start;

  & + & {
    margin-top: 4px;
  }
}

.receiver-label {
  color: #909399;
  flex-shrink: 0;
  width: 80px;
}

.receiver-value {
  color: #303133;
  flex: 1;
  word-break: break-all;

  &.address-text {
    line-height: 1.5;
  }
}

.user-order-info {
  padding: 4px 0;
}

.user-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #ebeef5;
}

.user-info-text {
  margin-left: 12px;

  .user-nickname {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 2px;
  }
  .user-sub {
    font-size: 12px;
    color: #909399;
  }
}

.order-info-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -16px;
}
.order-info-row .order-info-item {
  margin-right: 16px;
}

.order-info-item {
  font-size: 12px;
  line-height: 20px;

  .info-label {
    color: #909399;
  }
  .info-value {
    color: #303133;
  }
}

.goods-stats {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
}

.stat-item {
  text-align: center;

  .stat-num {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }
  .stat-label {
    font-size: 12px;
    color: #909399;
  }

  &.shipped .stat-num {
    color: #67c23a;
  }
  &.pending .stat-num {
    color: #e6a23c;
  }
}

.goods-tabs {
  ::v-deep .el-tabs__item {
    font-size: 13px;
  }
}

.goods-table {
  ::v-deep .el-table__header th {
    background: #fafafa;
    color: #606266;
    font-weight: 500;
  }
}

.receiver-mini {
  font-size: 12px;
  line-height: 18px;

  .receiver-mini-name {
    color: #303133;
    margin-bottom: 2px;
  }
  .receiver-mini-addr {
    color: #909399;
    font-size: 11px;
  }
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-info-cell {
  display: flex;
  align-items: flex-start;
}

.goods-thumb {
  width: 40px;
  height: 40px;
  border-radius: 3px;
  margin-right: 8px;
  object-fit: cover;
  background: #f5f7fa;
  flex-shrink: 0;
}

.goods-text {
  flex: 1;
  min-width: 0;
}

.goods-name {
  font-size: 12px;
  color: #303133;
  line-height: 16px;
  margin-bottom: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-sub {
  font-size: 11px;
  color: #909399;
  line-height: 14px;
}

.form-suffix {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.footer-left {
  font-size: 13px;
  color: #606266;

  .selected-num {
    color: #409eff;
    font-weight: 600;
    margin: 0 2px;
  }

  .disabled-reason {
    color: #e6a23c;
    display: flex;
    align-items: center;
  }
  .disabled-reason i {
    margin-right: 4px;
  }
}

.footer-right {
  display: flex;
}
.footer-right .el-button {
  margin-left: 8px;
}
</style>
