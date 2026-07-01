<template>
  <el-dialog
    :visible.sync="modals"
    title="订单详情"
    width="700px"
    append-to-body
  >
    <div v-if="orderDatalist" class="order-detail">
      <el-row :gutter="20">
        <el-col :span="12">
          <p><strong>订单号：</strong>{{ orderDatalist.orderInfo ? orderDatalist.orderInfo.order_id : orderId }}</p>
        </el-col>
        <el-col :span="12">
          <p><strong>订单状态：</strong>{{ orderDatalist.orderInfo ? orderDatalist.orderInfo.status_name : '-' }}</p>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <p><strong>用户昵称：</strong>{{ orderDatalist.userInfo ? orderDatalist.userInfo.nickname : '-' }}</p>
        </el-col>
        <el-col :span="12">
          <p><strong>联系电话：</strong>{{ orderDatalist.orderInfo ? orderDatalist.orderInfo.user_phone : '-' }}</p>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <p><strong>收货地址：</strong>{{ orderDatalist.orderInfo ? orderDatalist.orderInfo.user_address : '-' }}</p>
        </el-col>
      </el-row>
      <el-divider />
      <h4>商品信息</h4>
      <el-table :data="orderDatalist.cartInfo || []" size="small">
        <el-table-column label="商品名称" prop="productInfo.store_name" min-width="180" />
        <el-table-column label="规格" prop="productInfo.attrInfo.suk" min-width="100" />
        <el-table-column label="单价" prop="truePrice" width="80" />
        <el-table-column label="数量" prop="cart_num" width="60" />
      </el-table>
      <el-divider />
      <el-row :gutter="20">
        <el-col :span="12">
          <p><strong>商品总价：</strong>¥{{ orderDatalist.orderInfo ? orderDatalist.orderInfo.total_price : 0 }}</p>
        </el-col>
        <el-col :span="12">
          <p><strong>实付金额：</strong>¥{{ orderDatalist.orderInfo ? orderDatalist.orderInfo.pay_price : 0 }}</p>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'orderDetails',
  props: {
    orderDatalist: {
      type: Object,
      default: () => null,
    },
    orderId: {
      type: [Number, String],
      default: 0,
    },
    is_refund: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      modals: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.order-detail {
  p {
    margin: 8px 0;
    font-size: 13px;
  }
  h4 {
    margin: 12px 0;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
