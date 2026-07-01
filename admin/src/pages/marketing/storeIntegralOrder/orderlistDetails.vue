<template>
  <div class="integral-order-page">
    <!-- 顶部通用筛选区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="searchForm"
          :model="searchForm"
          label-width="80px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form">
            <div class="search-form-box">
              <el-form-item label="订单号：">
                <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable class="form_content_width" />
              </el-form-item>
              <el-form-item label="用户：">
                <el-select v-model="searchForm.userId" placeholder="请选择用户" clearable class="form_content_width">
                  <el-option value="" label="全部"></el-option>
                  <el-option v-for="user in userOptions" :key="user.value" :value="user.value" :label="user.label"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="商品信息：">
                <el-input v-model="searchForm.productInfo" placeholder="请输入商品名称或ID" clearable class="form_content_width" />
              </el-form-item>
              <el-form-item label="下单时间：">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="form_content_width"
                ></el-date-picker>
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button class="ResetSearch" @click="resetForm">重置</el-button>
              <el-button type="primary" @click="userSearchs">查询</el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 独立状态筛选区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: 0 }">
      <div class="status-tabs-container">
        <el-tabs v-model="searchForm.status" @tab-click="onStatusTabClick" type="card">
          <el-tab-pane
            v-for="item in statusTabs"
            :key="item.value"
            :label="item.label + ' (' + item.count + ')'"
            :name="item.value"
          ></el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 表格头部操作栏 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 16px' }">
      <el-row :gutter="24" justify="space-between" class="op-row">
        <el-col>
          <span class="table-title">积分订单</span>
        </el-col>
        <el-col>
          <el-button class="export-btn" @click="exportList">导出</el-button>
        </el-col>
      </el-row>

      <!-- 批量操作提示栏 -->
      <el-row v-if="selectionList.length > 0" class="batch-bar">
        <el-alert type="info" show-icon>
          <template slot="title">
            已选择 <span class="selected-count">{{ selectionList.length }}</span> 项
            <el-button type="text" @click="clearSelection" class="ml10">取消选择</el-button>
          </template>
        </el-alert>
      </el-row>
    </el-card>

    <!-- 核心数据表格 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '0 20px 20px' }">
      <el-table
        :data="tableList"
        ref="table"
        class="mt16"
        v-loading="loading"
        highlight-current-row
        empty-text="暂无数据"
        @select="handleSelectRow"
        @select-all="handleSelectAll"
        row-key="id"
      >
        <!-- 多选框列 -->
        <el-table-column type="selection" width="55"></el-table-column>

        <!-- 基础信息组 -->
        <el-table-column label="订单ID" prop="id" min-width="80"></el-table-column>
        <el-table-column label="订单号" min-width="160">
          <template slot-scope="scope">
            <div class="order-no-cell">
              <span class="order-no">{{ scope.row.orderNo }}</span>
              <el-button icon="el-icon-copy-document" size="mini" @click="copyOrderNo(scope.row.orderNo)" class="copy-btn"></el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" min-width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>

        <!-- 用户信息组 -->
        <el-table-column label="用户编号" prop="userId" min-width="100"></el-table-column>
        <el-table-column label="用户信息" min-width="180">
          <template slot-scope="scope">
            <div class="user-info-cell">
              <div class="user-avatar">
                <img :src="scope.row.avatar" alt="用户头像" />
              </div>
              <div class="user-detail">
                <div class="user-phone">{{ scope.row.phone }}</div>
                <div class="user-uid">UID: {{ scope.row.uid }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 商品信息组 -->
        <el-table-column label="商品信息" min-width="280">
          <template slot-scope="scope">
            <div class="product-info-cell">
              <div class="product-image">
                <img :src="scope.row.productImage" alt="商品图片" />
              </div>
              <div class="product-detail">
                <div class="product-name">{{ scope.row.productName }}</div>
                <div class="product-id">商品ID: {{ scope.row.productId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 履约状态组 -->
        <el-table-column label="履约状态" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" class="status-tag">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 积分信息组 -->
        <el-table-column label="兑换数量" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品单价(积分)" min-width="120">
          <template slot-scope="scope">
            <span class="integral-value">{{ scope.row.unitPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总价(积分)" min-width="120">
          <template slot-scope="scope">
            <span class="integral-value total">{{ scope.row.totalPrice }}</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="80">
          <template slot-scope="scope">
            <a @click="handleDetail(scope.row)" class="action-link">详情</a>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部翻页区 -->
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="searchForm.page"
          :limit.sync="searchForm.limit"
          @pagination="getList"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog title="订单详情" :visible.sync="detailModalVisible" width="800px" :close-on-click-modal="false">
      <div v-if="currentOrder" class="detail-content">
        <el-row :gutter="20" class="detail-row">
          <el-col :span="12">
            <h4 class="detail-section-title">基础信息</h4>
            <el-form :model="currentOrder" label-width="100px">
              <el-form-item label="订单ID">
                <span>{{ currentOrder.id }}</span>
              </el-form-item>
              <el-form-item label="订单号">
                <span>{{ currentOrder.orderNo }}</span>
              </el-form-item>
              <el-form-item label="下单时间">
                <span>{{ currentOrder.createTime }}</span>
              </el-form-item>
              <el-form-item label="履约状态">
                <el-tag :type="getStatusTagType(currentOrder.status)">
                  {{ getStatusText(currentOrder.status) }}
                </el-tag>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <h4 class="detail-section-title">用户信息</h4>
            <el-form :model="currentOrder" label-width="100px">
              <el-form-item label="用户编号">
                <span>{{ currentOrder.userId }}</span>
              </el-form-item>
              <el-form-item label="手机号">
                <span>{{ currentOrder.phone }}</span>
              </el-form-item>
              <el-form-item label="UID">
                <span>{{ currentOrder.uid }}</span>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="detail-row mt20">
          <el-col :span="24">
            <h4 class="detail-section-title">商品信息</h4>
            <div class="product-detail-card">
              <img :src="currentOrder.productImage" alt="商品图片" class="product-detail-image" />
              <div class="product-detail-info">
                <div class="product-detail-name">{{ currentOrder.productName }}</div>
                <div class="product-detail-id">商品ID: {{ currentOrder.productId }}</div>
                <div class="product-detail-price">
                  <span>兑换数量: {{ currentOrder.quantity }} | 单价: {{ currentOrder.unitPrice }}积分 | 总价: {{ currentOrder.totalPrice }}积分</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'orderlistDetails',
  data() {
    return {
      loading: false,
      searchForm: {
        orderNo: '',
        userId: '',
        productInfo: '',
        dateRange: [],
        status: '',
        page: 1,
        limit: 10,
      },
      tableList: [],
      total: 0,
      selectionList: [],
      detailModalVisible: false,
      currentOrder: null,
      userOptions: [
        { value: '1', label: '用户A (138****1234)' },
        { value: '2', label: '用户B (139****5678)' },
        { value: '3', label: '用户C (137****9012)' },
      ],
      statusTabs: [
        { value: '', label: '全部', count: 0 },
        { value: 'pending', label: '待发货', count: 0 },
        { value: 'shipped', label: '已发货', count: 0 },
        { value: 'completed', label: '已完成', count: 0 },
        { value: 'canceling', label: '取消中', count: 0 },
        { value: 'canceled', label: '已取消', count: 0 },
      ],
      mockData: [
        {
          id: 1001,
          orderNo: 'PO202606230001',
          createTime: '2026-06-23 10:30:22',
          userId: 'U001',
          uid: '100001',
          phone: '138****1234',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20friendly%20face&image_size=square',
          productId: 'P001',
          productName: 'JELLYCAT神话动物系列金龙毛绒公仔12cm',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20a%20cute%20plush%20toy%20dragon&image_size=square',
          status: 'pending',
          quantity: 1,
          unitPrice: 16500,
          totalPrice: 16500,
        },
        {
          id: 1002,
          orderNo: 'PO202606230002',
          createTime: '2026-06-23 09:15:45',
          userId: 'U002',
          uid: '100002',
          phone: '139****5678',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20professional%20woman&image_size=square',
          productId: 'P002',
          productName: '智能手表Pro Max',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20a%20smart%20watch&image_size=square',
          status: 'pending',
          quantity: 1,
          unitPrice: 500,
          totalPrice: 500,
        },
        {
          id: 1003,
          orderNo: 'PO202606220003',
          createTime: '2026-06-22 16:20:18',
          userId: 'U003',
          uid: '100003',
          phone: '137****9012',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20young%20man&image_size=square',
          productId: 'P003',
          productName: '无线蓝牙耳机降噪版',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20wireless%20headphones&image_size=square',
          status: 'shipped',
          quantity: 2,
          unitPrice: 200,
          totalPrice: 400,
        },
        {
          id: 1004,
          orderNo: 'PO202606220004',
          createTime: '2026-06-22 14:05:33',
          userId: 'U001',
          uid: '100001',
          phone: '138****1234',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20friendly%20face&image_size=square',
          productId: 'P004',
          productName: '便携充电宝20000mAh快充版',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20portable%20charger&image_size=square',
          status: 'shipped',
          quantity: 1,
          unitPrice: 350,
          totalPrice: 350,
        },
        {
          id: 1005,
          orderNo: 'PO202606210005',
          createTime: '2026-06-21 11:45:55',
          userId: 'U002',
          uid: '100002',
          phone: '139****5678',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20professional%20woman&image_size=square',
          productId: 'P005',
          productName: '限量版手办模型',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20anime%20figure%20collectible&image_size=square',
          status: 'completed',
          quantity: 1,
          unitPrice: 5000,
          totalPrice: 5000,
        },
        {
          id: 1006,
          orderNo: 'PO202606210006',
          createTime: '2026-06-21 10:20:12',
          userId: 'U003',
          uid: '100003',
          phone: '137****9012',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20young%20man&image_size=square',
          productId: 'P006',
          productName: '精美陶瓷茶具套装',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20ceramic%20tea%20set&image_size=square',
          status: 'completed',
          quantity: 1,
          unitPrice: 800,
          totalPrice: 800,
        },
        {
          id: 1007,
          orderNo: 'PO202606200007',
          createTime: '2026-06-20 17:30:44',
          userId: 'U001',
          uid: '100001',
          phone: '138****1234',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20friendly%20face&image_size=square',
          productId: 'P007',
          productName: '运动蓝牙耳机',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20sports%20bluetooth%20earbuds&image_size=square',
          status: 'completed',
          quantity: 1,
          unitPrice: 250,
          totalPrice: 250,
        },
        {
          id: 1008,
          orderNo: 'PO202606200008',
          createTime: '2026-06-20 15:15:28',
          userId: 'U002',
          uid: '100002',
          phone: '139****5678',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20professional%20woman&image_size=square',
          productId: 'P008',
          productName: '创意台灯',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20creative%20desk%20lamp&image_size=square',
          status: 'canceling',
          quantity: 1,
          unitPrice: 300,
          totalPrice: 300,
        },
        {
          id: 1009,
          orderNo: 'PO202606190009',
          createTime: '2026-06-19 09:05:11',
          userId: 'U003',
          uid: '100003',
          phone: '137****9012',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20young%20man&image_size=square',
          productId: 'P009',
          productName: '机械键盘',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20mechanical%20keyboard&image_size=square',
          status: 'canceled',
          quantity: 1,
          unitPrice: 1500,
          totalPrice: 1500,
        },
        {
          id: 1010,
          orderNo: 'PO202606180010',
          createTime: '2026-06-18 14:30:00',
          userId: 'U001',
          uid: '100001',
          phone: '138****1234',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20friendly%20face&image_size=square',
          productId: 'P010',
          productName: '无线鼠标',
          productImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20wireless%20mouse&image_size=square',
          status: 'canceled',
          quantity: 1,
          unitPrice: 200,
          totalPrice: 200,
        },
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      setTimeout(() => {
        let filteredData = [...this.mockData];

        if (this.searchForm.orderNo) {
          filteredData = filteredData.filter(item => item.orderNo.includes(this.searchForm.orderNo));
        }

        if (this.searchForm.userId) {
          filteredData = filteredData.filter(item => item.userId === this.searchForm.userId);
        }

        if (this.searchForm.productInfo) {
          filteredData = filteredData.filter(item => 
            item.productName.includes(this.searchForm.productInfo) || 
            item.productId.includes(this.searchForm.productInfo)
          );
        }

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          const startDate = new Date(this.searchForm.dateRange[0]).getTime();
          const endDate = new Date(this.searchForm.dateRange[1]).getTime();
          filteredData = filteredData.filter(item => {
            const orderDate = new Date(item.createTime).getTime();
            return orderDate >= startDate && orderDate <= endDate;
          });
        }

        if (this.searchForm.status) {
          filteredData = filteredData.filter(item => item.status === this.searchForm.status);
        }

        this.updateStatusCounts(filteredData);

        const start = (this.searchForm.page - 1) * this.searchForm.limit;
        const end = start + this.searchForm.limit;
        this.tableList = filteredData.slice(start, end);
        this.total = filteredData.length;
        this.loading = false;
      }, 300);
    },

    updateStatusCounts(data) {
      this.statusTabs.forEach(tab => {
        if (tab.value === '') {
          tab.count = data.length;
        } else {
          tab.count = data.filter(item => item.status === tab.value).length;
        }
      });
    },

    getStatusText(status) {
      const statusMap = {
        pending: '待发货',
        shipped: '已发货',
        completed: '已完成',
        canceling: '取消中',
        canceled: '已取消',
      };
      return statusMap[status] || status;
    },

    getStatusTagType(status) {
      const typeMap = {
        pending: 'info',
        shipped: 'primary',
        completed: 'success',
        canceling: 'warning',
        canceled: 'danger',
      };
      return typeMap[status] || 'info';
    },

    userSearchs() {
      this.searchForm.page = 1;
      this.getList();
    },

    resetForm() {
      this.searchForm = {
        orderNo: '',
        userId: '',
        productInfo: '',
        dateRange: [],
        status: '',
        page: 1,
        limit: 10,
      };
      this.getList();
    },

    onStatusTabClick() {
      this.searchForm.page = 1;
      this.getList();
    },

    handleSelectRow(selection, row) {
      this.selectionList = selection;
    },

    handleSelectAll(selection) {
      this.selectionList = selection;
    },

    clearSelection() {
      this.$refs.table.clearSelection();
      this.selectionList = [];
    },

    copyOrderNo(orderNo) {
      const textarea = document.createElement('textarea');
      textarea.value = orderNo;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.$message.success('订单号已复制');
    },

    handleDetail(row) {
      this.currentOrder = row;
      this.detailModalVisible = true;
    },

    exportList() {
      this.$message.info('导出功能开发中');
    },
  },
};
</script>

<style lang="scss" scoped>
.integral-order-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20px;

  .form_content_width {
    width: 200px;
  }

  .padding-add {
    padding: 20px;
  }

  .search-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-form-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .search-form-sub {
    margin-left: 20px;
  }

  .ResetSearch {
    border: 1px solid #dcdfe6;
    color: #606266;
    margin-right: 10px;
  }

  .mt16 {
    margin-top: 16px;
  }

  .status-tabs-container {
    padding: 0 20px;
  }

  .status-tabs-container ::v-deep .el-tabs__header {
    margin: 0;
  }

  .status-tabs-container ::v-deep .el-tabs__nav-wrap::after {
    display: none;
  }

  .status-tabs-container ::v-deep .el-tabs__item {
    padding: 12px 24px;
    font-size: 14px;
  }

  .status-tabs-container ::v-deep .el-tabs__item.is-active {
    color: #409eff;
  }

  .status-tabs-container ::v-deep .el-tabs__active-bar {
    background-color: #409eff;
    height: 3px;
  }

  .op-row {
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
  }

  .table-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .export-btn {
    border: 1px solid #dcdfe6;
    color: #606266;
  }

  .batch-bar {
    margin-top: 12px;
  }

  .selected-count {
    color: #409eff;
    font-weight: 600;
  }

  .order-no-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .order-no {
    font-size: 14px;
    color: #303133;
  }

  .copy-btn {
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 24px;
    color: #909399;
    &:hover {
      color: #409eff;
    }
  }

  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-detail {
    display: flex;
    flex-direction: column;
  }

  .user-phone {
    font-size: 14px;
    color: #303133;
  }

  .user-uid {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }

  .product-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-detail {
    flex: 1;
    min-width: 0;
  }

  .product-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-id {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .status-tag {
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 4px;
  }

  .integral-value {
    color: #67c23a;
    font-weight: 500;
    &.total {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .action-link {
    color: #409eff;
    font-size: 14px;
    &:hover {
      text-decoration: underline;
    }
  }

  .detail-content {
    padding: 20px 0;
  }

  .detail-row {
    margin-bottom: 16px;
  }

  .detail-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  .product-detail-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
  }

  .product-detail-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }

  .product-detail-info {
    flex: 1;
  }

  .product-detail-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .product-detail-id {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
  }

  .product-detail-price {
    font-size: 14px;
    color: #606266;
  }

  .mt20 {
    margin-top: 20px;
  }
}
</style>