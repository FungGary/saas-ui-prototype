<template>
  <div class="product-add-page" :class="{ 'annotation-mode': showAnnotation }">
    <!-- 标注面板 -->
    <transition name="slide-right">
      <div v-if="showAnnotation" class="annotation-panel-wrapper">
        <AnnotationPanel
          ref="annotationPanel"
          @select="handleAnnotationSelect"
          @toggle-markers="handleToggleMarkers"
        />
      </div>
    </transition>

    <!-- 标注高亮热区 -->
    <AnnotationHighlight />

    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '0 20px' }">
      <div class="page-header">
        <div class="page-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <el-button v-db-click @click="handleBack">返回</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="product-tabs">
        <el-tab-pane label="基础信息" name="basic"></el-tab-pane>
        <el-tab-pane label="商品详情" name="detail"></el-tab-pane>
      </el-tabs>

      <div class="content-wrapper">
        <div v-show="activeTab === 'basic'" class="tab-content">
        <el-form
          ref="basicForm"
          :model="form"
          label-width="110px"
          label-position="right"
          @submit.native.prevent
          class="product-form"
        >
          <div class="form-section" id="form-section-basic">
            <div class="section-header" @click="toggleSection('basicInfo')">
              <i :class="['el-icon', sectionExpanded.basicInfo ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i>
              <span class="section-title">基础信息
                <annotation-point 
                  title="【优化】表单分类为区块式" 
                  content="优化前：原系统所有字段集中在一个长表单中，原表单过长，降低用户耐心。&#10;&#10;优化后：拆分为'基础信息'、'价格与库存'、'预售设置'、'其他设置'等折叠区块或步骤。&#10;&#10;原因：分区块可提升效率和准确率，降低用户认知负担。" 
                  priority="P0"
                />
              </span>
            </div>
            <div v-show="sectionExpanded.basicInfo" class="section-content">
              <el-form-item label="商品分类" prop="cate_id" required>
                <el-select
                  v-model="form.cate_id"
                  placeholder="请选择商品分类"
                  clearable
                  class="form-content"
                >
                  <el-option
                    v-for="item in cateOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <a class="link-btn ml10" v-db-click @click="handleAddCategory">新增分类</a>
              </el-form-item>

              <el-form-item label="商品品牌" prop="brand_id" required>
                <el-select
                  v-model="form.brand_id"
                  placeholder="请选择品牌"
                  clearable
                  class="form-content"
                >
                  <el-option
                    v-for="item in brandOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="商品名称" prop="name" required>
                <div style="display: flex; align-items: center; width: 100%;">
                  <el-input
                    v-model="form.name"
                    placeholder="请输入商品名称"
                    class="form-content"
                    maxlength="100"
                    show-word-limit
                  ></el-input>
                  <annotation-point 
                    title="字段说明" 
                    content="商品名称最多100字符，用于在列表页、详情页展示商品标题。" 
                    priority="P0"
                  />
                </div>
              </el-form-item>

              <el-form-item label="单位" prop="unit" required>
                <el-input v-model="form.unit" placeholder="请输入单位（如：个、台、盒）" class="form-content"></el-input>
              </el-form-item>

              <el-form-item label="商品编号" prop="product_code">
                <el-input
                  v-model="form.product_code"
                  placeholder="请输入商品编号"
                  class="form-content"
                ></el-input>
              </el-form-item>

              <el-form-item label="外部编号" prop="external_code">
                <el-input
                  v-model="form.external_code"
                  placeholder="请输入外部编号"
                  class="form-content"
                ></el-input>
                <div class="form-tip">外部编号：用于与外部系统对接的商品标识，可用于库存同步、订单匹配等场景</div>
                <annotation-point 
                  title="【新增】新增词汇注明-外部编号" 
                  content="优化前：原系统特殊字段无注释，运营不理解含义。&#10;&#10;优化后：对'外部编号'增加常驻提示，说明其用途和场景。&#10;&#10;原因：避免增加理解成本，让运营清楚字段含义。" 
                  priority="P2"
                />
              </el-form-item>

              <el-form-item label="供应商" prop="supplier">
                <el-input
                  v-model="form.supplier"
                  placeholder="请输入供应商名称"
                  class="form-content"
                ></el-input>
              </el-form-item>

              <el-form-item label="商品轮播图" prop="images" required>
                <div class="uploader-wrap">
                  <div class="uploader-list">
                    <div
                      v-for="(item, index) in form.images"
                      :key="index"
                      class="uploader-item"
                    >
                      <img :src="item" class="uploader-img" />
                      <i class="el-icon-close uploader-close" @click="removeImage(index)"></i>
                    </div>
                    <div
                      v-if="form.images.length < 10"
                      class="uploader-item uploader-add"
                      @click="addImage"
                    >
                      <i class="el-icon-plus"></i>
                      <div>上传</div>
                    </div>
                  </div>
                  <div class="uploader-tip">建议尺寸：800*800，可拖拽改变图片顺序，默认第一张为主图，最多上传10张</div>
                </div>
              </el-form-item>
            </div>
          </div>

          <div class="form-section" id="form-section-price">
            <div class="section-header" @click="toggleSection('priceStock')">
              <i :class="['el-icon', sectionExpanded.priceStock ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i>
              <span class="section-title">价格与库存</span>
            </div>
            <div v-show="sectionExpanded.priceStock" class="section-content">
              <el-form-item label="供货价" prop="supply_price">
                <el-input
                  v-model.number="form.supply_price"
                  placeholder="请输入供货价"
                  class="form-content"
                ></el-input>
                <div class="form-tip">供货价：供应商提供商品的价格，用于结算和成本核算</div>
              </el-form-item>

              <el-form-item label="售价" prop="price" :error="priceError" required>
                <div style="display: flex; align-items: center; width: 100%;">
                  <el-input
                    v-model.number="form.price"
                    placeholder="请输入售价"
                    class="form-content"
                    @blur="validatePrice"
                  ></el-input>
                  <annotation-point 
                    title="【新增】增加常驻提示-售价" 
                    content="优化前：原系统特殊字段无注释，运营不理解含义。&#10;&#10;优化后：对'商品售价'增加常驻定义提示，悬停提示可随时查看。&#10;&#10;原因：运营人员易混淆价格定义，增加提示降低理解成本。" 
                    priority="P1"
                  />
                </div>
                <div class="form-tip">商品售价：用户购买商品时支付的价格，必须大于0，且建议高于成本价</div>
              </el-form-item>

              <el-form-item label="成本价" prop="cost_price" required>
                <el-input
                  v-model.number="form.cost_price"
                  placeholder="请输入成本价"
                  class="form-content"
                ></el-input>
                <div class="form-tip">成本价：商品的采购成本，用于计算利润和库存价值</div>
              </el-form-item>

              <el-form-item label="原价" prop="original_price" required>
                <el-input
                  v-model.number="form.original_price"
                  placeholder="请输入原价"
                  class="form-content"
                ></el-input>
                <div class="form-tip">原价：商品的原始定价，用于促销活动时显示折扣力度</div>
              </el-form-item>

              <el-form-item label="库存" prop="stock" required>
                <div style="display: flex; align-items: center; width: 100%;">
                  <el-input
                    v-model.number="form.stock"
                    placeholder="请输入库存数量"
                    class="form-content"
                  ></el-input>
                  <annotation-point 
                    title="字段说明" 
                    content="商品库存数量，用户下单后库存自动扣减，库存为0时商品无法下单。" 
                    priority="P0"
                  />
                </div>
              </el-form-item>

              <el-form-item label="商品编号" prop="product_code">
                <el-input
                  v-model="form.product_code"
                  placeholder="请输入商品编号"
                  class="form-content"
                ></el-input>
              </el-form-item>

              <el-form-item label="可兑换积分" prop="integral" :error="integralError" required>
                <el-input
                  v-model.number="form.integral"
                  placeholder="请输入可兑换积分"
                  class="form-content"
                  @blur="validateIntegral"
                ></el-input>
                <div class="form-tip">可兑换积分：用户可使用积分兑换该商品的积分值，不能大于售价的10倍；为0时，该商品在背包里不可兑换为积分，只可发货</div>
                <annotation-point 
                  title="【新增】价格强校验-积分不超售价10倍" 
                  content="优化前：原系统无校验或只做简单非空校验。&#10;&#10;优化后：商品可兑换积分不能大于售价10倍；供货价、售价、成本价、原价只需要强制为浮点型，且注明每个字段作用范围。&#10;&#10;原因：防止定价逻辑混乱导致亏本。" 
                  priority="P0"
                />
              </el-form-item>
            </div>
          </div>

          <div class="form-section" id="form-section-presale">
            <div class="section-header" @click="toggleSection('presale')">
              <i :class="['el-icon', sectionExpanded.presale ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i>
              <span class="section-title">预售设置</span>
            </div>
            <div v-show="sectionExpanded.presale" class="section-content">
              <el-form-item label="是否预售" prop="is_presale">
                <el-switch
                  v-model="form.is_presale"
                  active-color="#409EFF"
                  inactive-color="#EBEEF5"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handlePresaleChange"
                ></el-switch>
                <div class="form-tip">
                  <i class="el-icon-info"></i>
                  是否预售：开启后商品将以预售模式销售，用户下单后需等待发货
                </div>
                <annotation-point 
                  title="【新增】新增词汇注明-是否预售" 
                  content="优化前：原系统特殊字段无注释，运营不理解含义。&#10;&#10;优化后：对'是否预售'增加常驻提示，说明其作用和影响。&#10;&#10;原因：避免增加理解成本，让运营清楚字段含义。" 
                  priority="P2"
                />
              </el-form-item>

              <el-form-item v-if="form.is_presale === 1" label="预售结束时间" prop="presale_end_time">
                <el-date-picker
                  v-model="form.presale_end_time"
                  type="datetime"
                  placeholder="请选择预售结束时间"
                  class="form-content"
                ></el-date-picker>
                <div class="form-tip">
                  <i class="el-icon-info"></i>
                  预售结束时间：预售活动的截止时间，到期后商品将恢复正常销售模式
                </div>
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header" @click="toggleSection('other')">
              <i :class="['el-icon', sectionExpanded.other ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i>
              <span class="section-title">其他设置</span>
            </div>
            <div v-show="sectionExpanded.other" class="section-content">
              <el-form-item label="上架状态" prop="status">
                <el-switch
                  :value="statusSwitchValue"
                  active-color="#409EFF"
                  inactive-color="#EBEEF5"
                  @change="handleStatusChange"
                ></el-switch>
                <annotation-point 
                  title="【优化】字段重命名为上架状态" 
                  content="优化前：原系统字段名为'商品状态'，容易与商品生命周期状态（如草稿、审核中）混淆。&#10;&#10;优化后：字段名改为'上架状态'，更准确地表达字段含义。&#10;&#10;原因：原名容易与商品生命周期状态混淆，改名后更准确清晰。" 
                  priority="P1"
                />
              </el-form-item>

              <el-form-item label="是否共用" prop="is_share">
                <el-switch
                  v-model="form.is_share"
                  active-color="#409EFF"
                  inactive-color="#EBEEF5"
                  :active-value="1"
                  :inactive-value="0"
                ></el-switch>
                <div class="form-tip">是否共用：开启后该商品可在多个房间/渠道间共享库存</div>
                <annotation-point 
                  title="【新增】新增词汇注明-是否共用" 
                  content="优化前：原系统特殊字段无注释，运营不理解含义。&#10;&#10;优化后：对'是否共用'增加常驻提示，说明其用途和影响。&#10;&#10;原因：避免增加理解成本，让运营清楚字段含义。" 
                  priority="P2"
                />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <div v-show="activeTab === 'detail'" class="tab-content">
        <div class="detail-layout">
          <div class="detail-editor">
            <el-form
              ref="detailForm"
              :model="form"
              label-width="100px"
              label-position="right"
              @submit.native.prevent
            >
              <el-form-item label="商品详情" prop="description">
                <div class="editor-wrap">
                  <div class="editor-toolbar">
                    <span class="tool-item">字号</span>
                    <el-select v-model="editorFontSize" size="small" style="width: 80px">
                      <el-option :value="12" label="12"></el-option>
                      <el-option :value="14" label="14"></el-option>
                      <el-option :value="16" label="16"></el-option>
                      <el-option :value="18" label="18"></el-option>
                    </el-select>
                    <i class="el-icon-edit-outline tool-item"></i>
                    <i class="el-icon-picture-outline tool-item"></i>
                    <i class="el-icon-link tool-item"></i>
                    <span class="tool-item">段落格式</span>
                    <span class="tool-item">B</span>
                    <span class="tool-item"><u>U</u></span>
                    <span class="tool-item"><i>I</i></span>
                    <span class="tool-item">自定义标题</span>
                  </div>
                  <div class="editor-body">
                    <textarea
                      v-model="form.description"
                      class="editor-textarea"
                      placeholder="请输入商品详情内容..."
                    ></textarea>
                  </div>
                  <div class="editor-footer">
                    <span class="footer-path">元素路径：</span>
                    <span class="footer-count">字数统计：{{ form.description ? form.description.length : 0 }}</span>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="detail-preview">
            <div class="phone-frame">
              <div class="phone-top">
                <div class="phone-notch"></div>
              </div>
              <div class="phone-body">
                <div class="preview-header">详情预览</div>
                <div class="preview-content">
                  <div v-if="form.description" class="preview-text">{{ form.description }}</div>
                  <div v-else class="preview-empty">暂无内容</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <el-button v-if="activeTab === 'basic'" type="primary" v-db-click @click="goDetail">下一步</el-button>
      <el-button v-else v-db-click @click="activeTab = 'basic'">上一步</el-button>
      <el-button type="primary" v-db-click @click="handleSave">保存</el-button>
    </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ProductAddNew',
  components: {
    AnnotationPanel: () => import('@/components/annotation/AnnotationPanel'),
    AnnotationHighlight: () => import('@/components/annotation/AnnotationHighlight'),
    AnnotationPoint: () => import('@/components/AnnotationPoint'),
  },
  data() {
    return {
      activeTab: 'basic',
      pageTitle: '添加商品',
      editorFontSize: 14,
      priceError: '',
      integralError: '',
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,
      sectionExpanded: {
        basicInfo: true,
        priceStock: true,
        presale: true,
        other: true,
      },
      cateOptions: [
        { value: 1, label: '12/123' },
        { value: 2, label: '家居好物/全棉时代' },
        { value: 3, label: '数码生活/游戏卡带,数码生活/大疆' },
        { value: 4, label: '星之卡比' },
        { value: 5, label: '其他/其他1' },
      ],
      brandOptions: [
        { value: 1, label: '其他' },
        { value: 2, label: '小米' },
        { value: 3, label: '迪士尼' },
      ],
      form: {
        cate_id: '',
        brand_id: '',
        name: '',
        unit: '',
        images: [],
        supply_price: 0,
        price: 0,
        cost_price: 0,
        original_price: 0,
        stock: 0,
        product_code: '',
        integral: 0,
        status: 'off',
        is_share: 0,
        external_code: '',
        supplier: '',
        is_presale: 0,
        presale_end_time: '',
        description: '',
      },
    };
  },
  methods: {
    handleBack() {
      this.$router.push({ name: 'product_productListNew' });
    },
    handleViewAnnotation() {
      this.annotationVisible = true;
    },
    goDetail() {
      if (this.validateForm()) {
        this.activeTab = 'detail';
      }
    },
    toggleSection(section) {
      this.sectionExpanded[section] = !this.sectionExpanded[section];
    },
    handleAddCategory() {
      this.$message.info('新增分类');
    },
    addImage() {
      const img =
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20placeholder%20image&image_size=square';
      if (this.form.images.length < 10) {
        this.form.images.push(img);
      }
    },
    removeImage(index) {
      this.form.images.splice(index, 1);
    },
    handlePresaleChange(val) {
      if (val === 0) {
        this.form.presale_end_time = '';
      }
    },
    handleStatusChange(val) {
      if (!val) {
        this.$confirm('确定要下架该商品吗？下架后商品将不再在商城中展示和销售。', '下架确认', {
          type: 'warning',
          confirmButtonText: '确定下架',
          cancelButtonText: '取消'
        }).then(() => {
          this.form.status = 'off';
          this.$message.success('商品已下架');
        }).catch(() => {
          this.$message.info('已取消下架');
        });
      } else {
        this.$confirm('确定要上架该商品吗？上架后商品将在商城中展示和销售。', '上架确认', {
          type: 'info',
          confirmButtonText: '确定上架',
          cancelButtonText: '取消'
        }).then(() => {
          this.form.status = 'on';
          this.$message.success('商品已上架');
        }).catch(() => {
          this.$message.info('已取消上架');
        });
      }
    },
    validatePrice() {
      const price = this.form.price;
      if (price !== undefined && price !== null && !isNaN(price)) {
        if (price < 0) {
          this.priceError = '售价不能为负数';
        } else if (!Number.isFinite(price)) {
          this.priceError = '售价必须为有效数字';
        } else {
          this.priceError = '';
        }
      } else {
        this.priceError = '';
      }
      this.validateIntegral();
    },
    validateIntegral() {
      const price = this.form.price;
      const integral = this.form.integral;
      if (integral !== undefined && integral !== null && !isNaN(integral)) {
        if (integral < 0) {
          this.integralError = '可兑换积分不能为负数';
        } else if (!Number.isFinite(integral)) {
          this.integralError = '可兑换积分必须为有效数字';
        } else if (price > 0 && integral > price * 10) {
          this.integralError = '可兑换积分不能大于售价的10倍';
        } else {
          this.integralError = '';
        }
      } else {
        this.integralError = '';
      }
    },
    validateForm() {
      let isValid = true;
      this.validatePrice();
      this.validateIntegral();
      if (this.priceError) {
        isValid = false;
      }
      if (this.integralError) {
        isValid = false;
      }
      return isValid;
    },
    handleSave() {
      if (this.validateForm()) {
        this.$message.success('商品保存成功');
        setTimeout(() => {
          this.handleBack();
        }, 500);
      }
    },
    initPage() {
      const id = this.$route.params && this.$route.params.id;
      if (id) {
        this.pageTitle = '商品编辑';
        this.form.name = '商品编辑示例';
        this.form.price = 1650.0;
      } else {
        this.pageTitle = '添加商品';
      }
    },
    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
    },
    handleAnnotationSelect(annotation) {
      this.activeAnnotationId = annotation.id;
      const markerElements = document.querySelectorAll('.annotation-marker');
      markerElements.forEach(el => el.classList.remove('active'));
      const activeMarker = document.querySelector(`.annotation-marker[data-id="${annotation.id}"]`);
      if (activeMarker) activeMarker.classList.add('active');
    },
    handleToggleMarkers(visible) {
      this.showMarkers = visible;
    },
  },
  computed: {
    statusSwitchValue() {
      return this.form.status === 'on';
    },
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
  created() {
    this.initPage();
  },
};
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 16px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.product-tabs {
  ::v-deep .el-tabs__item {
    height: 44px !important;
    line-height: 44px !important;
  }
}

.tab-content {
  padding-top: 10px;
}

.product-form {
  padding: 0 20px;
}

.form-content {
  width: 320px;
}

.form-tip {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  padding-left: 6px;
  margin-top: 4px;

  i {
    margin-right: 4px;
    font-size: 12px;
    color: #409eff;
  }
}

.link-btn {
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
}

.ml10 {
  margin-left: 10px;
}

.form-section {
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  cursor: pointer;
  border-bottom: 1px solid #ebeef5;

  &:hover {
    background: #f5f7fa;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-left: 8px;
}

.section-content {
  padding: 16px;
}

.uploader-wrap {
  width: 100%;
}

.uploader-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.uploader-item {
  width: 88px;
  height: 88px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #fafafa;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: #409eff;
  }
}

.uploader-add {
  color: #c0c4cc;
  font-size: 24px;

  div {
    font-size: 12px;
    margin-top: 4px;
  }
}

.uploader-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploader-close {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
}

.uploader-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.detail-layout {
  display: flex;
  gap: 24px;
  padding: 0 20px;
}

.detail-editor {
  flex: 1;
}

.editor-wrap {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
  flex-wrap: wrap;
}

.tool-item {
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: #409eff;
  }
}

.editor-body {
  min-height: 400px;
}

.editor-textarea {
  width: 100%;
  min-height: 400px;
  border: none;
  outline: none;
  padding: 16px;
  font-size: 14px;
  color: #303133;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
  font-size: 12px;
  color: #909399;
}

.detail-preview {
  width: 340px;
  flex-shrink: 0;
}

.phone-frame {
  border: 8px solid #303133;
  border-radius: 32px;
  background: #f5f7fa;
  overflow: hidden;
  min-height: 560px;
}

.phone-top {
  padding: 12px 0 0;
  display: flex;
  justify-content: center;
  background: #303133;
}

.phone-notch {
  width: 120px;
  height: 18px;
  background: #303133;
  border-radius: 0 0 12px 12px;
}

.phone-body {
  background: #fff;
  min-height: 500px;
  padding: 16px;
}

.preview-header {
  text-align: center;
  font-size: 14px;
  color: #303133;
  padding: 8px 0 16px;
  border-bottom: 1px solid #ebeef5;
}

.preview-content {
  padding: 20px 8px;
  min-height: 400px;
}

.preview-empty {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 60px 0;
}

.preview-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.8;
  white-space: pre-wrap;
}

.content-wrapper {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-bottom: 20px;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 240px;
  right: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.product-add-page {
  position: relative;
  min-height: 100vh;
  
  &.annotation-mode {
    padding-right: 380px;
  }
}

.annotation-panel-wrapper {
  position: fixed;
  top: 64px;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 1000;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
