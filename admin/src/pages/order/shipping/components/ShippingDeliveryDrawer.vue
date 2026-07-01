<template>
  <el-drawer
    v-model="visible"
    title="订单发货"
    direction="rtl"
    size="700px"
    :before-close="handleClose"
  >
    <div class="drawer-content">
      <!-- 拆分方式 -->
      <div class="split-section">
        <div class="split-row">
          <span class="section-label">拆分方式</span>
          <el-radio-group v-model="splitType" size="small">
            <el-radio label="sku">按SKU拆分</el-radio>
            <el-radio label="quantity">按数量拆分</el-radio>
          </el-radio-group>
        </div>
        <div class="split-desc">
          <div class="desc-text">按 SKU 拆分为不同 SKU 分开发货</div>
          <div class="desc-text">按数量拆分为同一商品分批发货</div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="info-block">
        <div class="block-label">收货信息</div>
        <div class="block-content">
          <div class="receiver-line">
            <span class="receiver-name">{{ orderData.receiverName }}</span>
            <span class="receiver-phone">{{ orderData.receiverPhone }}</span>
          </div>
          <div class="receiver-address">{{ orderData.receiverAddress }}</div>
        </div>
      </div>

      <!-- 用户信息 -->
      <div class="info-block user-block">
        <div class="user-row">
          <el-avatar :size="40" :src="orderData.userAvatar">
            {{ orderData.userNickname.charAt(0) }}
          </el-avatar>
          <div class="user-meta">
            <div class="user-name-line">
              <span class="user-nickname">{{ orderData.userNickname }}</span>
              <span class="user-no">{{ orderData.userNo }}</span>
            </div>
            <div class="order-line">
              <span class="label">订单编号：</span>
              <span class="value">{{ orderData.orderNo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">总数量：</span>
          <span class="stat-value">{{ totalQuantity }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总计SKU：</span>
          <span class="stat-value">{{ totalSku }}个</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已发货：</span>
          <span class="stat-value">{{ shippedQuantity }}件</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待发货：</span>
          <span class="stat-value">{{ pendingQuantity }}件</span>
        </div>
      </div>

      <!-- Tabs 核心详情区 -->
      <el-tabs v-model="activeTab" class="product-tabs">
        <!-- Tab 1：待发货商品 -->
        <el-tab-pane label="待发货商品" name="pending">
          <!-- 发货表单（必填） -->
          <el-form
            :model="shippingForm"
            :rules="formRules"
            ref="shippingFormRef"
            label-width="84px"
            class="shipping-form"
          >
            <el-form-item label="快递公司" prop="expressCompany" required>
              <el-select
                v-model="shippingForm.expressCompany"
                placeholder="请选择快递公司"
                style="width: 100%"
              >
                <el-option
                  v-for="item in expressCompanies"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="快递单号" prop="expressNo" required>
              <el-input
                v-model="shippingForm.expressNo"
                placeholder="请输入快递单号"
              />
            </el-form-item>
          </el-form>

          <div class="list-title">发货信息</div>

          <el-table
            ref="pendingTableRef"
            :data="pendingProducts"
            @selection-change="handleSelectionChange"
            size="small"
            class="pending-table"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="收货信息" min-width="180">
              <template #default>
                <div class="receiver-cell">
                  <div class="cell-line">
                    <span>{{ orderData.receiverName }}</span>
                    <span class="phone">{{ orderData.receiverPhone }}</span>
                  </div>
                  <div class="cell-address">{{ orderData.receiverAddress }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="220">
              <template #default="{ row }">
                <div class="product-cell">
                  <el-image
                    :src="row.image"
                    fit="cover"
                    class="product-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="product-meta">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-id">商品ID: {{ row.id }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="160" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.shipQuantity"
                  :min="1"
                  :max="row.remaining"
                  size="small"
                  controls-position="right"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Tab 2：已发货商品（只读） -->
        <el-tab-pane label="已发货商品" name="shipped">
          <el-table
            :data="shippedProducts"
            size="small"
            class="shipped-table"
          >
            <el-table-column label="收货信息" min-width="180">
              <template #default>
                <div class="receiver-cell">
                  <div class="cell-line">
                    <span>{{ orderData.receiverName }}</span>
                    <span class="phone">{{ orderData.receiverPhone }}</span>
                  </div>
                  <div class="cell-address">{{ orderData.receiverAddress }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="快递信息" min-width="200">
              <template #default="{ row }">
                <div class="express-cell">
                  <div class="express-company">
                    <span class="company-name">{{ row.expressCompany }}</span>
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </div>
                  <div class="express-no">{{ row.expressNo }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="240">
              <template #default="{ row }">
                <div class="product-cell">
                  <el-image
                    :src="row.image"
                    fit="cover"
                    class="product-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="product-meta">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-id">商品ID: {{ row.id }} · x{{ row.shipped }}</div>
                    <a class="detail-link" @click.prevent>查看详情</a>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="shippedProducts.length === 0"
            description="暂无已发货商品"
            :image-size="60"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <span class="selected-info">
          已选择 <span class="selected-count">{{ selectedProducts.length }}</span> 个商品，共 <span class="selected-count">{{ totalSelectedQuantity }}</span> 件
        </span>
        <div class="footer-buttons">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            :disabled="activeTab !== 'pending' || selectedProducts.length === 0"
            @click="handleConfirm"
          >发货</el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// v-model 双向绑定
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const splitType = ref('sku')
const activeTab = ref('pending')
const selectedProducts = ref([])

const shippingFormRef = ref(null)
const pendingTableRef = ref(null)

const shippingForm = ref({
  expressCompany: '',
  expressNo: ''
})

const formRules = {
  expressCompany: [
    { required: true, message: '请选择快递公司', trigger: 'change' }
  ],
  expressNo: [
    { required: true, message: '请输入快递单号', trigger: 'blur' }
  ]
}

const expressCompanies = [
  { value: 'shunfeng', label: '顺丰速运' },
  { value: 'yuantong', label: '圆通速递' },
  { value: 'zhongtong', label: '中通快递' },
  { value: 'yunda', label: '韵达速递' },
  { value: 'shentong', label: '申通快递' },
  { value: 'jd', label: '京东物流' },
  { value: 'ems', label: '邮政EMS' },
  { value: 'jitu', label: '极兔速递' }
]

// 全新 Mock 订单数据（未使用截图原数据）
const orderData = {
  receiverName: '李明',
  receiverPhone: '136****2233',
  receiverAddress: '上海市浦东新区世纪大道1234号15栋802室',
  userNickname: '小柚子',
  userNo: 'UID: 2024060801',
  userAvatar: 'https://via.placeholder.com/50',
  orderNo: 'DD20260625001'
}

const pendingProducts = ref([
  {
    id: 90881,
    name: '韩国INS风可爱小熊毛绒玩偶生日礼物女生布娃娃抱枕',
    image: 'https://via.placeholder.com/50',
    remaining: 1,
    shipQuantity: 1
  }
])

const shippedProducts = ref([
  {
    id: 87712,
    name: '高级真丝睡衣女士夏季薄款家居服套装',
    image: 'https://via.placeholder.com/50',
    shipped: 1,
    expressCompany: '顺丰速运',
    expressNo: 'SF20260625001'
  }
])

// 统计数据计算
const totalQuantity = computed(() => {
  const pending = pendingProducts.value.reduce((sum, p) => sum + p.remaining, 0)
  const shipped = shippedProducts.value.reduce((sum, p) => sum + p.shipped, 0)
  return pending + shipped
})

const totalSku = computed(() => pendingProducts.value.length + shippedProducts.value.length)

const shippedQuantity = computed(() =>
  shippedProducts.value.reduce((sum, p) => sum + p.shipped, 0)
)

const pendingQuantity = computed(() =>
  pendingProducts.value.reduce((sum, p) => sum + p.remaining, 0)
)

const totalSelectedQuantity = computed(() =>
  selectedProducts.value.reduce((sum, p) => sum + (p.shipQuantity || 0), 0)
)

// 切换 Tab 时清空选择
watch(activeTab, (newVal) => {
  if (newVal === 'shipped') {
    selectedProducts.value = []
    if (pendingTableRef.value) {
      pendingTableRef.value.clearSelection()
    }
  }
})

// 抽屉打开时重置状态
watch(visible, (val) => {
  if (val) {
    activeTab.value = 'pending'
    selectedProducts.value = []
    shippingForm.value = {
      expressCompany: '',
      expressNo: ''
    }
    if (shippingFormRef.value) {
      shippingFormRef.value.clearValidate()
    }
    if (pendingTableRef.value) {
      pendingTableRef.value.clearSelection()
    }
  }
})

const handleSelectionChange = (rows) => {
  selectedProducts.value = rows
}

const handleClose = () => {
  visible.value = false
}

const handleConfirm = async () => {
  if (activeTab.value !== 'pending') {
    ElMessage.warning('请切换到"待发货商品"标签页进行发货操作')
    return
  }
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }
  if (!shippingFormRef.value) return
  try {
    await shippingFormRef.value.validate()
    emit('confirm', {
      splitType: splitType.value,
      expressCompany: shippingForm.value.expressCompany,
      expressNo: shippingForm.value.expressNo,
      products: selectedProducts.value
    })
    ElMessage.success('发货成功')
    visible.value = false
  } catch (e) {
    ElMessage.error('请完善发货信息')
  }
}
</script>

<style scoped>
.drawer-content {
  padding: 0 0 16px;
}

/* 拆分方式 */
.split-section {
  margin-bottom: 16px;
}
.split-row {
  display: flex;
  align-items: center;
}
.section-label {
  font-size: 14px;
  color: #303133;
  margin-right: 16px;
  white-space: nowrap;
}
.split-desc {
  margin-top: 8px;
  padding-left: 80px;
}
.desc-text {
  font-size: 12px;
  color: #909399;
  line-height: 1.8;
}

/* 通用信息块 */
.info-block {
  display: flex;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;
}
.info-block .block-label {
  font-size: 14px;
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}
.info-block .block-content {
  flex: 1;
}
.receiver-line {
  display: flex;
  gap: 12px;
  align-items: center;
}
.receiver-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
.receiver-phone {
  font-size: 13px;
  color: #606266;
}
.receiver-address {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 用户信息 */
.user-block .user-row {
  display: flex;
  align-items: center;
  width: 100%;
}
.user-meta {
  margin-left: 12px;
  flex: 1;
}
.user-name-line {
  display: flex;
  gap: 12px;
  align-items: center;
}
.user-nickname {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
.user-no {
  font-size: 12px;
  color: #909399;
}
.order-line {
  font-size: 12px;
  margin-top: 4px;
}
.order-line .label {
  color: #909399;
}
.order-line .value {
  color: #606266;
}

/* 数据统计 */
.stats-bar {
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

/* Tabs */
.product-tabs {
  margin-bottom: 0;
}
.product-tabs :deep(.el-tabs__content) {
  padding: 0;
}
.product-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

/* 发货表单 */
.shipping-form {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}
.shipping-form :deep(.el-form-item) {
  margin-bottom: 12px;
}
.shipping-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

/* 发货信息列表 */
.list-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 8px;
}

/* 表格 */
.pending-table,
.shipped-table {
  margin-bottom: 16px;
}
.pending-table :deep(.el-table__cell),
.shipped-table :deep(.el-table__cell) {
  padding: 8px 0;
}

/* 收货信息单元格 */
.receiver-cell {
  font-size: 12px;
  line-height: 1.6;
}
.receiver-cell .cell-line {
  display: flex;
  gap: 8px;
}
.receiver-cell .cell-line .phone {
  color: #606266;
}
.receiver-cell .cell-address {
  color: #909399;
  margin-top: 2px;
}

/* 商品信息单元格 */
.product-cell {
  display: flex;
  align-items: center;
}
.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  flex-shrink: 0;
}
.image-error {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 16px;
  border-radius: 4px;
}
.product-meta {
  margin-left: 8px;
  flex: 1;
  min-width: 0;
}
.product-name {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}
.product-id {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
.detail-link {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
  margin-top: 4px;
  display: inline-block;
}
.detail-link:hover {
  text-decoration: underline;
}

/* 快递信息单元格 */
.express-cell {
  font-size: 12px;
  line-height: 1.6;
}
.express-company {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #303133;
}
.express-company .company-name {
  font-weight: 500;
}
.edit-icon {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
}
.express-no {
  color: #606266;
  margin-top: 2px;
}

/* 底部 */
.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.selected-info {
  font-size: 14px;
  color: #606266;
}
.selected-count {
  color: #409eff;
  font-weight: 600;
  margin: 0 2px;
}
.footer-buttons {
  display: flex;
  gap: 8px;
}
</style>
