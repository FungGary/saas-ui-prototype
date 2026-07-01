<template>
  <div class="recharge-package-page" id="recharge-package-page">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="page-container">
        <!-- 左侧：充值金额设置面板 -->
        <div class="left-panel">
          <div class="panel-header">
            <div class="gold-balance">
              <span class="gold-icon">💰</span>
              <span class="balance-label">我的金币：</span>
              <span class="balance-value">{{ goldBalance }}</span>
            </div>
            <a href="#" class="gold-record-link">金币记录 ></a>
          </div>
          
          <div class="package-list">
            <div 
              v-for="item in packageList" 
              :key="item.id" 
              class="package-item"
            >
              <div v-if="item.tag" class="promotion-tag">{{ item.tag }}</div>
              <div class="package-content">
                <div class="package-icon">🪙</div>
                <div class="package-info">
                  <div class="package-amount">{{ item.amount }}</div>
                  <div class="package-desc">{{ item.description }}</div>
                </div>
                <div class="package-price">¥{{ item.price }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：数据表格区 -->
        <div class="right-panel">
          <div class="table-header">
            <span class="table-title">充值金额设置</span>
            <div class="header-buttons">
              <AnnotationMarker
                v-if="showAnnotation"
                annotation-id="C001"
                annotation-type="交互说明"
                annotation-title="添加数据按钮"
                annotation-priority="P0"
                annotation-description="点击打开创建套餐弹窗，用于新增充值套餐配置。"
                :position="{ top: '-10px', right: '-10px' }"
                :is-active="activeAnnotationId === 'C001'"
                @click="handleMarkerClick"
              />
              <el-button type="primary" v-db-click @click="handleAdd" id="package-dialog-add-btn">添加数据</el-button>
            </div>
          </div>
          
          <el-table
            :data="tableList"
            ref="table"
            class="mt16"
            v-loading="loading"
            highlight-current-row
            empty-text="暂无数据"
            border
          >
            <el-table-column label="ID" prop="id" min-width="60"></el-table-column>
            <el-table-column label="售价" min-width="100">
              <template slot-scope="scope">
                <span>¥{{ scope.row.price.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="内购ID" prop="iapId" min-width="120"></el-table-column>
            <el-table-column label="获得金币" prop="gold" min-width="100"></el-table-column>
            <el-table-column label="赠送金币" prop="giftGold" min-width="100"></el-table-column>
            <el-table-column label="套餐类型" prop="type" min-width="100"></el-table-column>
            <el-table-column label="随机立减" min-width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.randomDiscount || '0' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="是否可用" min-width="100">
              <template slot-scope="scope">
                <el-switch
                  :active-value="true"
                  :inactive-value="false"
                  :value="scope.row.available"
                  @change="onChangeAvailable(scope.row)"
                  size="large"
                >
                </el-switch>
              </template>
            </el-table-column>
            <el-table-column label="排序" prop="sort" min-width="60"></el-table-column>
            <el-table-column label="操作" min-width="80">
              <template slot-scope="scope">
                <a v-db-click @click="handleEdit(scope.row)" class="action-link">修改</a>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <span class="total-count">共 {{ total }} 条</span>
            <el-pagination
              background
              :current-page="pagination.page"
              :page-size="pagination.limit"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="->, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="640px"
      custom-class="recharge-package-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="100px"
        label-position="right"
      >
        <!-- 分组：基础信息 -->
        <div class="form-group">
          <div class="group-title" id="form-group-sections">
            <span class="group-name">基础信息</span>
            <el-tooltip class="group-tip" effect="light" placement="top">
              <div slot="content">
                表单按业务逻辑分组：基础信息 / 到账权益 / 套餐规则 / 优惠配置 / 展示状态
              </div>
              <i class="el-icon-info"></i>
            </el-tooltip>
            <span class="label-annotation-wrapper">
              <AnnotationPoint
                title="【优化】表单按业务逻辑分组"
                content="优化前：所有字段纵向排列，无分组，信息密集不利于浏览。&#10;&#10;优化后：表单按业务逻辑分为5组——基础信息、到账权益、套餐规则、优惠配置、展示状态。&#10;&#10;原因：按业务模块分组展示，降低信息密度，提升配置效率和可读性。"
                priority="P0"
              />
            </span>
          </div>
          <el-form-item label="售价" prop="price" :rules="[{ required: true, message: '请输入售价' }]">
            <el-input v-model.number="formData.price" placeholder="请输入售价" />
          </el-form-item>
          <el-form-item prop="iapId" id="form-iap-id">
            <label slot="label" class="form-item-label">
              苹果内购ID
              <span class="label-annotation-wrapper">
                <AnnotationPoint
                  title="【优化】苹果内购ID增加字段说明"
                  content="优化前：只显示&quot;苹果内购ID&quot;字段，无说明文字。&#10;&#10;优化后：字段下方增加说明：苹果系统内购商品设置的唯一标识符。&#10;&#10;原因：帮助运营理解该字段含义和用途，降低配置出错率。"
                  priority="P1"
                />
              </span>
            </label>
            <el-input v-model="formData.iapId" placeholder="请输入苹果内购ID" />
            <div class="field-tip">
              <i class="el-icon-info"></i>
              苹果系统内购商品设置的唯一标识符。
            </div>
          </el-form-item>
        </div>

        <!-- 分组：到账权益 -->
        <div class="form-group">
          <div class="group-title">
            <span class="group-name">到账权益</span>
          </div>
          <el-form-item prop="gold" :rules="[{ required: true, message: '请输入获得金币' }]" id="form-gold">
            <label slot="label" class="form-item-label">
              获得金币
              <span class="label-annotation-wrapper">
                <AnnotationPoint
                  title="【优化】获得金币增加字段说明"
                  content="优化前：只显示&quot;获得金币&quot;字段，无说明文字。&#10;&#10;优化后：字段下方增加说明：用户购买后基础到账金币。&#10;&#10;原因：区分基础金币和赠送金币，帮助运营理解金币构成。"
                  priority="P1"
                />
              </span>
            </label>
            <el-input v-model.number="formData.gold" placeholder="请输入获得金币" />
            <div class="field-tip">
              <i class="el-icon-info"></i>
              用户购买后基础到账金币。
            </div>
          </el-form-item>
          <el-form-item prop="giftGold" id="form-gift-gold">
            <label slot="label" class="form-item-label">
              赠送金币
              <span class="label-annotation-wrapper">
                <AnnotationPoint
                  title="【优化】赠送金币增加字段说明"
                  content="优化前：只显示&quot;赠送金币&quot;字段，无说明文字。&#10;&#10;优化后：字段下方增加说明：基础金币之外额外赠送的金币（非用户实际购买额）。&#10;&#10;原因：运营需要知道该字段不属于用户实际购买金币，避免误解成本构成。"
                  priority="P1"
                />
              </span>
            </label>
            <el-input v-model.number="formData.giftGold" placeholder="请输入赠送金币" />
            <div class="field-tip">
              <i class="el-icon-info"></i>
              基础金币之外额外赠送的金币（非用户实际购买额）。
            </div>
          </el-form-item>
        </div>

        <!-- 分组：套餐规则 -->
        <div class="form-group" id="form-type-section">
          <div class="group-title">
            <span class="group-name">套餐规则</span>
          </div>
          <el-form-item prop="type" id="form-type-select">
            <label slot="label" class="form-item-label">
              套餐类型
              <span class="label-annotation-wrapper">
                <AnnotationPoint
                  title="【优化】套餐类型增加选项说明"
                  content="优化前：套餐类型使用单选按钮，只显示选项文字，无类型说明。&#10;&#10;优化后：套餐类型使用下拉选择框，每个选项增加说明：&#10;- 普通套餐：标准套餐，不设限制&#10;- 首充福利：仅限用户首次充值购买&#10;- 自定义类型：无预设规则，自由配置&#10;- 每日特惠：限特定周期生效的特价套餐&#10;&#10;原因：降低运营理解成本，快速了解各套餐类型的区别。"
                  priority="P0"
                />
              </span>
            </label>
            <el-select 
              v-model="formData.type" 
              placeholder="请选择套餐类型"
              style="width: 100%;"
            >
              <el-option value="普通" label="普通套餐" id="form-type-normal">
                <span class="option-label">普通套餐</span>
                <span class="option-tip">标准套餐，不设限制。</span>
              </el-option>
              <el-option value="首充福利" label="首充福利" id="form-type-first-charge">
                <span class="option-label">首充福利</span>
                <span class="option-tip">仅限用户首次充值购买。</span>
              </el-option>
              <el-option value="自定义" label="自定义类型" id="form-type-custom">
                <span class="option-label">自定义类型</span>
                <span class="option-tip">无预设规则，自由配置，标题将用作标签展示。</span>
              </el-option>
              <el-option value="每日特惠" label="每日特惠" id="form-type-daily-deal">
                <span class="option-label">每日特惠</span>
                <span class="option-tip">限特定周期生效的特价套餐。</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="formData.type === '自定义'" label="自定义标签" prop="customTag">
            <el-input v-model="formData.customTag" placeholder="请输入自定义标签名称" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input v-model.number="formData.sort" placeholder="请输入排序数字" />
          </el-form-item>
        </div>

        <!-- 分组：优惠配置 -->
        <div class="form-group">
          <div class="group-title">
            <span class="group-name">优惠配置</span>
          </div>
          <el-form-item label="随机立减" prop="randomDiscount">
            <el-input v-model="formData.randomDiscount" placeholder="如：0 或 0.01~0.10" />
          </el-form-item>
        </div>

        <!-- 分组：展示状态 -->
        <div class="form-group">
          <div class="group-title">
            <span class="group-name">展示状态</span>
          </div>
          <el-form-item label="是否可用" prop="available">
            <el-switch v-model="formData.available" active-color="#409EFF" inactive-color="#DCDFE6"></el-switch>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'RechargePackage',
  components: {
    AnnotationPoint,
  },
  data() {
    return {
      loading: false,
      goldBalance: 0,
      packageList: [],
      tableList: [],
      total: 0,
      pagination: {
        page: 1,
        limit: 10,
      },
      dialogVisible: false,
      dialogTitle: '添加数据',
      formData: {
        id: null,
        price: '',
        iapId: '',
        gold: '',
        giftGold: '',
        type: '普通',
        customTag: '',
        randomDiscount: '',
        available: true,
        sort: 0,
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      setTimeout(() => {
        this.packageList = [
          { id: 45, amount: '888币', description: '得660金币，赠送228金币', price: 66, tag: '首充福利' },
          { id: 46, amount: '120币', description: '得100金币，赠送20金币', price: 9.9, tag: '每日特惠' },
          { id: 47, amount: '200币', description: '得200金币', price: 20, tag: '' },
          { id: 48, amount: '550币', description: '得500金币，赠送50金币', price: 50, tag: '' },
          { id: 49, amount: '1200币', description: '得1000金币，赠送200金币', price: 100, tag: '' },
          { id: 50, amount: '3688币', description: '得2880金币，赠送808金币', price: 288, tag: '' },
          { id: 51, amount: '13500币', description: '得9990金币，赠送3510金币', price: 999, tag: '' },
          { id: 52, amount: '123币', description: '得123金币，赠送123金币', price: 123, tag: '你哈' },
        ];

        this.tableList = [
          { id: 45, price: 66.0, iapId: 'com.example.gold.66', gold: 660, giftGold: 228, type: '首充福利', randomDiscount: '0', available: true, sort: 7 },
          { id: 46, price: 9.9, iapId: 'com.example.gold.99', gold: 100, giftGold: 20, type: '每日特惠', randomDiscount: '0', available: true, sort: 6 },
          { id: 47, price: 20.0, iapId: 'com.example.gold.20', gold: 200, giftGold: 0, type: '普通', randomDiscount: '0', available: true, sort: 5 },
          { id: 48, price: 50.0, iapId: 'com.example.gold.50', gold: 500, giftGold: 50, type: '普通', randomDiscount: '0', available: true, sort: 4 },
          { id: 49, price: 100.0, iapId: 'com.example.gold.100', gold: 1000, giftGold: 200, type: '普通', randomDiscount: '0', available: true, sort: 3 },
          { id: 50, price: 288.0, iapId: 'com.example.gold.288', gold: 2880, giftGold: 808, type: '普通', randomDiscount: '0.01~0.10', available: true, sort: 2 },
          { id: 51, price: 999.0, iapId: 'com.example.gold.999', gold: 9990, giftGold: 3510, type: '普通', randomDiscount: '0.01~0.10', available: true, sort: 1 },
          { id: 52, price: 123.0, iapId: 'com.example.gold.123', gold: 123, giftGold: 123, type: '你哈', randomDiscount: '1.00~3.00', available: false, sort: 0 },
        ];

        this.total = this.tableList.length;
        this.loading = false;
      }, 300);
    },
    handleAdd() {
      this.dialogTitle = '添加数据';
      this.formData = {
        id: null,
        price: '',
        iapId: '',
        gold: '',
        giftGold: '',
        type: '普通',
        customTag: '',
        randomDiscount: '',
        available: true,
        sort: 0,
      };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.dialogTitle = '修改数据';
      this.formData = {
        id: row.id,
        price: row.price,
        iapId: row.iapId,
        gold: row.gold,
        giftGold: row.giftGold,
        type: row.type,
        customTag: row.customTag || '',
        randomDiscount: row.randomDiscount,
        available: row.available,
        sort: row.sort,
      };
      this.dialogVisible = true;
    },
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.dialogVisible = false;
          this.$message.success(this.formData.id ? '修改成功' : '添加成功');
          this.getList();
        }
      });
    },
    onChangeAvailable(row) {
      if (row.available) {
        this.$confirm('确定禁用该充值套餐吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          row.available = false;
          this.$message.success('已禁用');
        }).catch(() => {});
      } else {
        row.available = true;
        this.$message.success('已启用');
      }
    },
    handleSizeChange(val) {
      this.pagination.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.pagination.page = val;
      this.getList();
    },
  },
};
</script>

<style lang="scss" scoped>
.recharge-package-page {
  position: relative;
  min-height: 100vh;

  .page-container {
    display: flex;
    gap: 20px;
    padding: 20px;
  }

  .left-panel {
    width: 320px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  }

  .gold-balance {
    display: flex;
    align-items: center;
    color: #fff;
    font-weight: 600;
  }

  .gold-icon {
    font-size: 20px;
    margin-right: 8px;
  }

  .balance-label {
    font-size: 14px;
  }

  .balance-value {
    font-size: 18px;
    font-weight: 700;
  }

  .gold-record-link {
    color: #fff;
    font-size: 13px;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .package-list {
    padding: 12px;
  }

  .package-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .promotion-tag {
    position: absolute;
    top: 0;
    left: 0;
    padding: 2px 8px;
    background: #f56c6c;
    color: #fff;
    font-size: 11px;
    border-radius: 0 0 4px 0;
  }

  .package-content {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .package-icon {
    font-size: 24px;
    margin-right: 12px;
  }

  .package-info {
    flex: 1;
  }

  .package-amount {
    font-size: 16px;
    font-weight: 600;
    color: #E6A23C;
  }

  .package-desc {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }

  .package-price {
    padding: 4px 12px;
    background: #9B59B6;
    color: #fff;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }



  .right-panel {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    padding: 20px;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .table-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    padding-left: 10px;
    border-left: 3px solid #409EFF;
  }

  .action-link {
    color: #409EFF;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 20px;
    padding-right: 10px;
  }

  .total-count {
    margin-right: 16px;
    font-size: 13px;
    color: #909399;
  }
}
</style>

<style lang="scss">
.recharge-package-dialog {
  // 确保弹窗内标注点可点击和可见
  ::v-deep .el-dialog__body {
    overflow: visible;
  }
  
  ::v-deep .el-form-item {
    overflow: visible;
  }
  
  ::v-deep .el-form-item__label {
    overflow: visible;
  }
  
  ::v-deep .el-form-item__content {
    overflow: visible;
  }
  
  .form-group {
    position: relative;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .group-title {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 3px solid #409EFF;

    .group-name {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .group-tip {
      margin-left: 8px;
      color: #909399;
      cursor: help;
      font-size: 14px;
    }
  }

  .label-annotation-wrapper {
    position: relative;
    display: inline-block;
    margin-left: 4px;
    vertical-align: middle;
  }

  .form-item-label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .field-tip {
    display: flex;
    align-items: center;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;

    i {
      margin-right: 4px;
      color: #409EFF;
    }
  }

  .el-select-dropdown__item {
    height: auto;
    padding: 8px 12px;
    line-height: 1.4;

    .option-label {
      display: block;
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }

    .option-tip {
      display: block;
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }

    &.hover,
    &.selected {
      .option-label {
        color: #409EFF;
      }
    }
  }
}
</style>