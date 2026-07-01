<template>
  <div>
    <pages-header
      :title="isEdit ? '编辑积分商品' : '添加积分商品'"
      :backUrl="$routeProStr + '/marketing/store_integral/index'"
    ></pages-header>

    <el-card :bordered="false" shadow="never" class="mt16">
      <el-steps :active="currentStep" align-center>
        <el-step title="选择积分商品" />
        <el-step title="填写基础信息" />
        <el-step title="修改商品详情" />
      </el-steps>

      <div class="step-content">
        <div v-show="currentStep === 0" class="step1-content">
          <div class="step1-tip">
            <i class="el-icon-info"></i>
            <span>请选择平台商品中可用于积分兑换的商品</span>
            <annotation-point 
              title="【新增】第一步选择商品说明" 
              content="优化前：仅显示「选择积分商品」，无任何说明。&#10;&#10;优化后：增加说明：「请选择平台商品库中可用于积分兑换的商品」。&#10;&#10;原因：明确商品来源，降低理解成本。" 
              priority="P0"
            />
          </div>
          <div class="select-product-wrapper" id="select-product-tip">
            <div class="product-card product-stock-info" v-if="selectedProduct">
              <img :src="selectedProduct.image" class="product-image" />
              <div class="product-info">
                <h3>{{ selectedProduct.name }}</h3>
                <p>商品ID: {{ selectedProduct.id }}</p>
                <p>来源: {{ selectedProduct.source === 'self' ? '自营' : '旗舰' }}</p>
                <p>可用库存: {{ selectedProduct.availableStock || '-' }}</p>
                <p>商品状态: {{ selectedProduct.status === 1 ? '上架' : '下架' }}</p>
              </div>
              <annotation-point 
                title="【新增】增加商品库存字段" 
                content="优化前：仅显示商品ID、名称、来源。&#10;&#10;优化后：增加商品库库存、可用库存、商品状态、是否已使用等字段。&#10;&#10;原因：选择商品时必须判断商品是否可履约。" 
                priority="P0"
              />
            </div>
            <div v-else class="add-product" @click="showProductModal = true">
              <i class="el-icon-plus"></i>
              <span>选择商品</span>
            </div>
          </div>
        </div>

        <div v-show="currentStep === 1" class="step2-content">
          <el-form :model="formData" :rules="formRules" ref="formRef" :label-width="labelWidth" :label-position="labelPosition">
            <el-form-item label="商品主图" id="image-upload-validation">
              <div class="image-upload-area">
                <div class="image-upload-card" @click="uploadMainImage">
                  <img v-if="formData.mainImage" :src="formData.mainImage" />
                  <i v-else class="el-icon-plus"></i>
                </div>
                <div class="image-tip">建议尺寸：800*800px</div>
              </div>
              <annotation-point 
                title="【新增】图片规格校验" 
                content="优化前：仅提示建议尺寸，无校验规则。&#10;&#10;优化后：增加校验规则：比例、大小、格式、主图必填。&#10;&#10;原因：积分商品在前端展示，图片质量影响转化。" 
                priority="P0"
              />
            </el-form-item>

            <el-form-item label="轮播图">
              <div class="image-upload-area">
                <div class="image-list">
                  <div v-for="(img, index) in formData.carouselImages" :key="index" class="carousel-image-item">
                    <img :src="img" />
                    <i class="el-icon-delete" @click="removeCarouselImage(index)"></i>
                  </div>
                  <div class="carousel-add-btn" @click="uploadCarouselImage">
                    <i class="el-icon-plus"></i>
                  </div>
                </div>
                <div class="image-tip">建议尺寸：800*800px，可上传多张</div>
              </div>
            </el-form-item>

            <el-form-item label="商品标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入商品标题" class="form_content_width" />
            </el-form-item>

            <el-form-item label="兑换积分" prop="integral">
              <div class="integral-input-wrap">
                <el-input-number v-model="formData.integral" :min="0" class="form_content_width" />
                <span class="input-suffix">积分</span>
              </div>
            </el-form-item>

            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="formData.stock" :min="0" class="form_content_width" />
            </el-form-item>

            <el-form-item label="限购" id="limit-input-validation">
              <div class="limit-input-group">
                <span>每用户最多兑换</span>
                <el-input-number v-model="formData.exchangeLimit" :min="0" class="limit-input" />
                <span>件</span>
                <span class="limit-divider">|</span>
                <span>单笔最多兑换</span>
                <el-input-number v-model="formData.maxExchange" :min="0" class="limit-input" />
                <span>件</span>
              </div>
              <div class="form-tip">设置为0表示不限制</div>
              <annotation-point 
                title="【新增】数量限制前端校验" 
                content="优化前：需要点击保存后才进行用户兑换数量限制与单笔最大兑换数量的后端校验。&#10;&#10;优化后：填写完成后需进行前端校验，实时提示错误。&#10;&#10;原因：保证用户操作效率，减少返工。" 
                priority="P0"
              />
            </el-form-item>

            <el-form-item label="单位">
              <el-input v-model="formData.unit" placeholder="请输入单位" class="form_content_width" />
            </el-form-item>

            <el-form-item label="排序">
              <div>
                <el-input-number v-model="formData.sort" :min="0" :controls="false" class="form_content_width" />
                <div class="form-tip">数值越大越靠前</div>
              </div>
            </el-form-item>

            <el-form-item label="上架状态" id="status-switch-validation">
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
              <annotation-point 
                title="【优化】上架状态校验" 
                content="优化前：可直接选择上架/下架。&#10;&#10;优化后：只有通过积分、库存、图片、详情校验后才允许上架。&#10;&#10;原因：防止不完整商品展示给用户。" 
                priority="P0"
              />
            </el-form-item>

            <el-form-item label="用户消费等级限制">
              <div>
                <el-input-number v-model="formData.levelLimit" :min="0" :controls="false" class="form_content_width" />
                <div class="form-tip">用户达到该等级才展示本商品；0表示不限制</div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div v-show="currentStep === 2" class="step3-content">
          <div class="editor-wrapper">
            <el-form-item label="商品详情">
              <div class="editor-container">
                <div class="editor-toolbar">
                  <span class="toolbar-item">字号</span>
                  <el-select v-model="editorFontSize" class="font-size-select">
                    <el-option :label="'12'" :value="12"></el-option>
                    <el-option :label="'14'" :value="14"></el-option>
                    <el-option :label="'16'" :value="16"></el-option>
                  </el-select>
                  <span class="toolbar-divider"></span>
                  <button class="toolbar-btn" @click="formatText('bold')"><i class="el-icon-bold"></i></button>
                  <button class="toolbar-btn" @click="formatText('italic')"><i class="el-icon-italic"></i></button>
                  <button class="toolbar-btn" @click="formatText('underline')"><i class="el-icon-underline"></i></button>
                  <span class="toolbar-divider"></span>
                  <span class="toolbar-item">段落格式</span>
                </div>
                <textarea v-model="formData.description" class="rich-text-editor" :style="{ fontSize: editorFontSize + 'px' }" placeholder="请输入商品详情内容..." maxlength="10000"></textarea>
                <div class="editor-footer">
                  <span class="element-path">元素路径:</span>
                  <span class="word-count">{{ formData.description.length }}/10000 字数统计</span>
                </div>
              </div>
            </el-form-item>

            <div class="mobile-preview">
              <div class="phone-frame">
                <div class="phone-header">
                  <div class="phone-notch"></div>
                </div>
                <div class="phone-screen">
                  <div class="preview-header">详情预览</div>
                  <div class="preview-divider"></div>
                  <div class="preview-content" v-html="formData.description || '<div class=empty-content>暂无内容</div>'"></div>
                </div>
              </div>
            </div>
          </div>

          <el-card :bordered="false" shadow="never" class="config-preview-card" id="config-preview-card">
            <h3 class="preview-title">
              配置预览
              <annotation-point 
                title="【新增】配置预览" 
                content="优化前：当前没有最终配置预览。&#10;&#10;优化后：保存前展示商品、兑换积分、库存、限购、等级限制、上架状态预览。&#10;&#10;原因：让运营确认最终兑换规则。" 
                priority="P0"
              />
            </h3>
            <div class="preview-content">
              <div class="preview-product">
                <div class="preview-image">
                  <img v-if="formData.mainImage" :src="formData.mainImage" />
                  <div v-else class="no-image">暂无图片</div>
                </div>
                <div class="preview-info">
                  <h4>{{ formData.title || '未设置商品标题' }}</h4>
                  <div class="preview-row">
                    <span class="preview-label">兑换积分：</span>
                    <span class="preview-value integral">{{ formData.integral }} 积分</span>
                  </div>
                  <div class="preview-row">
                    <span class="preview-label">库存：</span>
                    <span class="preview-value">{{ formData.stock }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="preview-label">限购：</span>
                    <span class="preview-value">
                      每用户最多兑换{{ formData.exchangeLimit === 0 ? '不限' : formData.exchangeLimit }}件，
                      单笔最多兑换{{ formData.maxExchange === 0 ? '不限' : formData.maxExchange }}件
                    </span>
                  </div>
                  <div class="preview-row">
                    <span class="preview-label">等级限制：</span>
                    <span class="preview-value">{{ formData.levelLimit === 0 ? '不限制' : '等级' + formData.levelLimit }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="preview-label">上架状态：</span>
                    <span :class="['preview-value', formData.status === 1 ? 'status-online' : 'status-offline']">
                      {{ formData.status === 1 ? '上架' : '下架' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="form-actions">
        <el-button v-if="currentStep > 0" v-db-click @click="prevStep" class="btn-prev">上一步</el-button>
        <el-button type="primary" v-db-click @click="nextStep" class="btn-next" id="next-step-validation">
          {{ currentStep === 2 ? '保存' : '下一步' }}
          <annotation-point 
            v-if="currentStep < 2" 
            title="【新增】下一步前校验" 
            content="优化前：可能到保存时才发现数据校验不通过。&#10;&#10;优化后：每一步点击下一步时校验当前步骤关键字段，减少最后保存返工。&#10;&#10;原因：减少最后保存返工。" 
            priority="P0"
          />
          <annotation-point 
            v-else 
            title="【优化】保存发布分离" 
            content="优化前：保存和上架关系不清晰。&#10;&#10;优化后：增加「保存草稿」、「保存并上架」、「保存并下架」三种操作，明确不同操作结果。&#10;&#10;原因：明确不同操作的结果。" 
            priority="P0"
          />
        </el-button>
      </div>

      <el-dialog :visible.sync="showProductModal" title="选择商品" width="900px" :close-on-click-modal="false">
        <div class="modal-search-bar" id="modal-filter-section">
          <el-form :model="modalSearchForm" inline>
            <annotation-point 
              title="【新增】查询条件增加" 
              content="优化前：只有分类、来源、商品搜索三个筛选条件。&#10;&#10;优化后：增加商品状态、库存状态、是否已使用、价格区间、品牌筛选。&#10;&#10;原因：商品数量达到万级，筛选条件不足难以快速定位商品。" 
              priority="P0"
              position="bottom"
            />
            <el-form-item label="商品分类">
              <el-select v-model="modalSearchForm.category" placeholder="请选择" clearable class="modal-select">
                <el-option value="" label="全部"></el-option>
                <el-option value="1" label="数码产品"></el-option>
                <el-option value="2" label="生活用品"></el-option>
                <el-option value="3" label="食品饮料"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="来源">
              <el-select v-model="modalSearchForm.source" placeholder="请选择" clearable class="modal-select">
                <el-option value="" label="全部"></el-option>
                <el-option value="self" label="自营"></el-option>
                <el-option value="flagship" label="旗舰"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="商品状态">
              <el-select v-model="modalSearchForm.status" placeholder="请选择" clearable class="modal-select">
                <el-option value="" label="全部"></el-option>
                <el-option value="1" label="上架"></el-option>
                <el-option value="0" label="下架"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="库存状态">
              <el-select v-model="modalSearchForm.stockStatus" placeholder="请选择" clearable class="modal-select">
                <el-option value="" label="全部"></el-option>
                <el-option value="instock" label="有库存"></el-option>
                <el-option value="outstock" label="无库存"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否已使用">
              <el-select v-model="modalSearchForm.used" placeholder="请选择" clearable class="modal-select">
                <el-option value="" label="全部"></el-option>
                <el-option value="1" label="已使用"></el-option>
                <el-option value="0" label="可用"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="价格区间">
              <el-input v-model="modalSearchForm.priceMin" placeholder="最低价" class="modal-price-input" />
              <span>-</span>
              <el-input v-model="modalSearchForm.priceMax" placeholder="最高价" class="modal-price-input" />
            </el-form-item>
            <el-form-item label="品牌">
              <el-input v-model="modalSearchForm.brand" placeholder="请输入品牌" class="modal-input" />
            </el-form-item>
            <el-form-item label="商品搜索">
              <el-input v-model="modalSearchForm.keyword" placeholder="请输入商品名称/关键字/ID" class="modal-input" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" v-db-click @click="searchProducts">查询</el-button>
              <el-button v-db-click @click="resetModalSearch">重置</el-button>
              <el-button type="success" v-db-click @click="confirmProduct">确定</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="modal-tip">
          <i class="el-icon-info"></i>
          <span>请选择平台商品库中可用于积分兑换的商品</span>
        </div>

        <el-table :data="productList" ref="productTable" v-loading="modalLoading" highlight-current-row @row-click="handleRowClick" id="modal-price-columns">
          <el-table-column width="55">
            <template slot-scope="scope">
              <el-radio :value="scope.row.id" v-model="selectedProductId" @change="handleRadioChange(scope.row)"></el-radio>
            </template>
          </el-table-column>
          <el-table-column label="商品ID" width="100">
            <template slot-scope="scope">{{ scope.row.id }}</template>
          </el-table-column>
          <el-table-column label="商品图" width="80">
            <template slot-scope="scope">
              <div class="product-thumb">
                <img v-lazy="scope.row.image" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" min-width="180">
            <template slot-scope="scope">
              <el-tooltip placement="top" :open-delay="600">
                <div slot="content">{{ scope.row.name }}</div>
                <span class="line2">{{ scope.row.name }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="品牌" width="100">
            <template slot-scope="scope">{{ scope.row.brand }}</template>
          </el-table-column>
          <el-table-column label="来源" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.source === 'self' ? '自营' : '旗舰' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="售价" width="100">
            <template slot="header">
              <span>售价</span>
              <annotation-point 
                title="【新增】增加商品价格字段" 
                content="优化前：当前选择商品时看不到售价/成本价/可兑换积分参考。&#10;&#10;优化后：增加售价、成本价、商品库库存、建议兑换积分等字段。&#10;&#10;原因：便于运营判断积分兑换比例是否合理；便于运营判断到万级，筛选条件不足。" 
                priority="P0"
              />
            </template>
            <template slot-scope="scope">¥{{ scope.row.price }}</template>
          </el-table-column>
          <el-table-column label="成本价" width="100">
            <template slot-scope="scope">¥{{ scope.row.costPrice }}</template>
          </el-table-column>
          <el-table-column label="商品库库存" width="100">
            <template slot-scope="scope">{{ scope.row.stock }}</template>
          </el-table-column>
          <el-table-column label="可用库存" width="100">
            <template slot-scope="scope">{{ scope.row.availableStock }}</template>
          </el-table-column>
          <el-table-column label="建议兑换积分" width="120">
            <template slot-scope="scope">{{ scope.row.suggestIntegral }}</template>
          </el-table-column>
          <el-table-column label="商品状态" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="库存状态" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.availableStock > 0 ? 'success' : 'danger'">
                {{ scope.row.availableStock > 0 ? '有库存' : '无库存' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否已使用" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.used ? 'warning' : 'success'">
                {{ scope.row.used ? '已使用' : '可用' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="modal-pagination">
          <pagination v-if="modalTotal" :total="modalTotal" :page.sync="modalSearchForm.page" :limit.sync="modalSearchForm.limit" @pagination="searchProducts" />
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'storeIntegralAddEdit',
  components: {
    AnnotationPoint: () => import('@/components/AnnotationPoint'),
  },
  data() {
    return {
      currentStep: 0,
      isEdit: false,
      showProductModal: false,
      modalLoading: false,
      selectedProduct: null,
      selectedProductId: null,
      selectedProducts: [],
      editorFontSize: 14,
      formData: {
        mainImage: '',
        carouselImages: [],
        title: '',
        integral: 0,
        stock: 0,
        exchangeLimit: 1,
        maxExchange: 1,
        unit: '',
        sort: 0,
        status: 1,
        levelLimit: 0,
        description: '',
      },
      formRules: {
        title: [{ required: true, message: '请输入商品标题', trigger: 'blur' }],
        integral: [{ required: true, message: '请输入兑换所需积分', trigger: 'blur' }, { type: 'number', min: 0, message: '积分必须大于等于0', trigger: 'blur' }],
        stock: [{ required: true, message: '请输入库存', trigger: 'blur' }, { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }],
      },
      modalSearchForm: {
        category: '',
        source: '',
        status: '',
        stockStatus: '',
        used: '',
        priceMin: '',
        priceMax: '',
        brand: '',
        keyword: '',
        page: 1,
        limit: 10,
      },
      productList: [],
      modalTotal: 0,
    };
  },
  computed: {
    labelWidth() {
      return '135px';
    },
    labelPosition() {
      return 'right';
    },
  },
  mounted() {
    if (this.$route.params.id) {
      this.isEdit = true;
      this.currentStep = 1;
      this.loadFormData();
    }
  },
  methods: {
    loadFormData() {
      this.formData = {
        mainImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20a%20plush%20toy&image_size=square',
        carouselImages: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20a%20plush%20toy&image_size=square'],
        title: 'JELLYCAT神话动物系列金龙毛绒公仔12cm',
        integral: 16500,
        stock: 9999,
        exchangeLimit: 1,
        maxExchange: 1,
        unit: '个',
        sort: 0,
        status: 1,
        levelLimit: 0,
        description: '',
      };
    },
    prevStep() {
      this.currentStep--;
    },
    nextStep() {
      if (this.currentStep === 0) {
        if (!this.selectedProduct) {
          this.$message.warning('请选择商品');
          return;
        }
        this.currentStep++;
      } else if (this.currentStep === 1) {
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            this.currentStep++;
          } else {
            this.$message.warning('请填写必填项');
          }
        });
      } else if (this.currentStep === 2) {
          this.$message.success('保存成功');
          setTimeout(() => {
            this.$router.push({ path: this.$routeProStr + '/marketing/store_integral/index' });
          }, 500);
        }
    },
    searchProducts() {
      this.modalLoading = true;
      setTimeout(() => {
        this.productList = [
          {
            id: 87789,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=JELLYCAT%20dragon%20plush%20toy&image_size=square',
            name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm',
            brand: 'JELLYCAT',
            source: 'self',
            price: 199,
            costPrice: 150,
            stock: 100,
            availableStock: 95,
            suggestIntegral: 16500,
            status: 1,
            used: false,
          },
          {
            id: 87769,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=astronaut%20plush%20toy&image_size=square',
            name: 'JELLYCAT神话动物系列太空人公仔',
            brand: 'JELLYCAT',
            source: 'flagship',
            price: 159,
            costPrice: 120,
            stock: 50,
            availableStock: 48,
            suggestIntegral: 12000,
            status: 1,
            used: false,
          },
          {
            id: 87767,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=test%20product&image_size=square',
            name: '测试000',
            brand: '测试品牌',
            source: 'flagship',
            price: 99,
            costPrice: 70,
            stock: 200,
            availableStock: 180,
            suggestIntegral: 5000,
            status: 0,
            used: true,
          },
          {
            id: 87765,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=candy%20snack%20product&image_size=square',
            name: '雀巢果味软糖60g*2',
            brand: '雀巢',
            source: 'flagship',
            price: 35,
            costPrice: 25,
            stock: 500,
            availableStock: 0,
            suggestIntegral: 2000,
            status: 1,
            used: false,
          },
        ];
        this.modalTotal = 81503;
        this.modalLoading = false;
      }, 300);
    },
    resetModalSearch() {
      this.modalSearchForm = {
        category: '',
        source: '',
        status: '',
        stockStatus: '',
        used: '',
        priceMin: '',
        priceMax: '',
        brand: '',
        keyword: '',
        page: 1,
        limit: 10,
      };
      this.searchProducts();
    },
    handleProductSelect(selection, row) {
      this.selectedProducts = selection;
      if (row) {
        this.selectedProduct = row;
      }
    },
    handleRowClick(row) {
      this.selectedProductId = row.id;
      this.selectedProduct = row;
      this.selectedProducts = [row];
    },
    handleRadioChange(row) {
      this.selectedProduct = row;
      this.selectedProducts = [row];
    },
    confirmProduct() {
      if (this.selectedProducts.length === 0) {
        this.$message.warning('请选择商品');
        return;
      }
      this.selectedProduct = this.selectedProducts[0];
      this.showProductModal = false;
    },
    uploadMainImage() {
      this.formData.mainImage = 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20main%20image&image_size=square';
    },
    uploadCarouselImage() {
      this.formData.carouselImages.push('https://neeko-copilot.bytedance.net/api/text_to_image?prompt=carousel%20image&image_size=square');
    },
    removeCarouselImage(index) {
      this.formData.carouselImages.splice(index, 1);
    },
    formatText(type) {
      this.$message.info('格式按钮: ' + type);
    },
  },
};
</script>

<style lang="scss" scoped>
.step1-tip {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;

  i {
    font-size: 14px;
    color: #409eff;
    margin-right: 8px;
  }

  span {
    font-size: 14px;
    color: #606266;
    flex: 1;
  }
}

.step-content {
  padding: 24px 0;
}

.step1-content {
  .select-product-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;

    .product-card {
      display: flex;
      align-items: center;
      gap: 20px;

      .product-image {
        width: 120px;
        height: 120px;
        border-radius: 8px;
        object-fit: cover;
      }

      .product-info {
        h3 {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        p {
          font-size: 14px;
          color: #606266;
          margin-bottom: 4px;
        }
      }
    }

    .add-product {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #c0c4cc;
      cursor: pointer;

      i {
        font-size: 48px;
        margin-bottom: 8px;
      }

      span {
        font-size: 14px;
      }

      &:hover {
        color: #409eff;
      }
    }
  }
}

.step2-content {
  .el-form-item {
    margin-bottom: 22px;
  }

  .image-upload-area {
    .image-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }
  }

  .image-upload-card {
    width: 100px;
    height: 100px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    i {
      font-size: 24px;
      color: #c0c4cc;
    }

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
  }

  .image-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .carousel-image-item {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      i {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover {
          background: rgba(245, 108, 108, 0.8);
        }
      }
    }

    .carousel-add-btn {
      width: 100px;
      height: 100px;
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #c0c4cc;

      i {
        font-size: 24px;
      }

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }

  .integral-input-wrap {
    display: flex;
    align-items: center;

    .input-suffix {
      margin-left: 8px;
      color: #606266;
    }
  }

  .limit-input-group {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;

    .limit-input {
      width: 80px;
    }

    .limit-divider {
      color: #c0c4cc;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.5;
  }
}

.step3-content {
  .editor-wrapper {
    display: flex;
    gap: 20px;

    .el-form-item {
      flex: 1;
      margin-right: 0;
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      height: 500px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;

      .editor-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;

        .toolbar-item {
          font-size: 14px;
          color: #606266;
          margin-right: 8px;
        }

        .font-size-select {
          width: 80px;
          margin-right: 16px;
        }

        .toolbar-divider {
          width: 1px;
          height: 18px;
          background: #dcdfe6;
          margin: 0 12px;
        }

        .toolbar-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          margin-right: 4px;
          color: #606266;

          &:hover {
            background: #e8f4fd;
            color: #409eff;
          }
        }
      }

      .rich-text-editor {
        flex: 1;
        width: 100%;
        padding: 16px;
        border: none;
        resize: none;
        font-size: 14px;
        line-height: 1.8;
        box-sizing: border-box;
        outline: none;
      }

      .editor-footer {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        background: #f5f7fa;
        border-top: 1px solid #e4e7ed;

        .element-path {
          font-size: 12px;
          color: #909399;
        }

        .word-count {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .mobile-preview {
      width: 320px;
      flex-shrink: 0;

      .phone-frame {
        width: 100%;
        background: #1a1a1a;
        border-radius: 36px;
        padding: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

        .phone-header {
          height: 44px;
          display: flex;
          justify-content: center;
          align-items: flex-start;

          .phone-notch {
            width: 160px;
            height: 28px;
            background: #1a1a1a;
            border-radius: 0 0 16px 16px;
            position: relative;
            top: -2px;
          }
        }

        .phone-screen {
          background: #fff;
          border-radius: 24px;
          padding: 16px;
          min-height: 480px;
          max-height: 500px;
          overflow-y: auto;

          .preview-header {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 12px;
          }

          .preview-divider {
            height: 1px;
            background: #ebeef5;
            margin-bottom: 16px;
          }

          .preview-content {
            font-size: 14px;
            color: #606266;
            line-height: 1.8;
            white-space: pre-wrap;
            word-break: break-all;

            .empty-content {
              text-align: center;
              color: #c0c4cc;
              padding: 40px 0;
            }
          }
        }
      }
    }
  }

  .config-preview-card {
    margin-top: 24px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;

    .preview-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;
    }

    .preview-content {
      .preview-product {
        display: flex;
        gap: 20px;

        .preview-image {
          width: 160px;
          height: 160px;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #ebeef5;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .no-image {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #909399;
            font-size: 14px;
          }
        }

        .preview-info {
          flex: 1;

          h4 {
            font-size: 16px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 16px;
            line-height: 1.5;
          }

          .preview-row {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            .preview-label {
              width: 100px;
              font-size: 14px;
              color: #606266;
            }

            .preview-value {
              font-size: 14px;
              color: #303133;

              &.integral {
                color: #409eff;
                font-weight: bold;
              }

              &.status-online {
                color: #67c23a;
              }

              &.status-offline {
                color: #909399;
              }
            }
          }
        }
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #ebeef5;

  .btn-prev,
  .btn-next {
    min-width: 100px;
  }
}

.modal-search-bar {
  margin-bottom: 12px;
}

.modal-tip {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;

  i {
    font-size: 14px;
    color: #409eff;
    margin-right: 8px;
  }

  span {
    font-size: 14px;
    color: #606266;
  }
}

.modal-price-input {
  width: 80px;
  margin-right: 4px;
}

.modal-select {
  width: 120px;
}

.modal-input {
  width: 180px;
}

.product-thumb {
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

.line2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.modal-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>