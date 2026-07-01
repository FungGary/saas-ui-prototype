<template>
  <div class="page-container">
    <!-- 页面头部区 -->
    <div class="page-header">
      <a class="back-link" v-db-click @click="handleBack">
        <i class="el-icon-arrow-left"></i> 返回
      </a>
      <span class="page-title">{{ isEdit ? '编辑房间' : '添加房间' }}</span>
    </div>

    <!-- 卡片容器 -->
    <el-card :bordered="false" shadow="never" class="mt16">
      <!-- 步骤条 -->
      <div id="add-edit-stepper" class="step-wrapper">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step title="房间信息">
            <template slot="description">
              <annotation-point
                title="【优化】步骤1-房间基本信息"
                content="步骤1包含房间基础信息和核心配置：&#10;· 基础信息：房间号、名称、设备绑定、玩法类型&#10;· 玩法与素材：房间功能多选（直出/刮板/转盘/截图等）、封面图、规则图&#10;· 房间参数：游戏币、游戏时间、投币时间等&#10;· 功能开关：摇杆、二收、保送、客服等&#10;&#10;将房间信息分层展示，避免表单过于密集，提升填写效率。"
                priority="P0"
              />
            </template>
          </el-step>
          <el-step title="房间属性">
            <template slot="description">
              <annotation-point
                title="【优化】步骤2-房间高级属性"
                content="步骤2包含房间的高级属性和运营配置：&#10;· 房间属性：玩法分类、房间分类、标签、排序&#10;· 运营设置：房间公告（20字限制）、首页显示开关&#10;&#10;将高级属性单独放置在步骤2，让用户先完成核心配置再进行精细化运营设置。"
                priority="P0"
              />
            </template>
          </el-step>
        </el-steps>
      </div>

      <!-- 表单内容区 -->
      <div class="form-content">
        <el-form :model="formData" ref="formRef" label-width="130px" label-position="right">
          
          <!-- ========== Step 1: 房间信息 ========== -->
          <div id="step1-content" v-show="currentStep === 0">
            <!-- 分组一：基础信息配置 -->
            <div class="form-section">
              <div class="section-header">
                <span class="section-title">基础信息配置</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item prop="roomNo">
                    <template slot="label">
                      <span class="required-mark">*</span>房间号
                    </template>
                    <el-input v-model="formData.roomNo" placeholder="请输入房间号" class="form-input" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="roomName">
                    <template slot="label">
                      <span class="required-mark">*</span>房间名称
                    </template>
                    <el-input v-model="formData.roomName" placeholder="请输入房间名称" class="form-input" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="siteDevice">
                    <template slot="label">
                      <span class="required-mark">*</span>站点设备绑定
                    </template>
                    <el-select v-model="formData.siteDevice" placeholder="请选择站点设备" class="form-input">
                      <el-option value="park001" label="乐园001"></el-option>
                      <el-option value="park005" label="乐园005"></el-option>
                      <el-option value="park010" label="乐园010"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="playType">
                    <template slot="label">
                      <span class="required-mark">*</span>玩法类型
                    </template>
                    <el-select v-model="formData.playType" placeholder="请选择玩法类型" class="form-input">
                      <el-option value="lucky" label="欧皇台"></el-option>
                      <el-option value="scraper" label="刮板台"></el-option>
                      <el-option value="skill" label="技术台"></el-option>
                      <el-option value="gameplay" label="玩法台"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 分组二：玩法与素材配置 -->
            <div class="form-section">
              <div class="section-header">
                <span class="section-title">玩法与素材配置</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item prop="roomFeatures">
                    <template slot="label">
                      <span class="required-mark">*</span>房间功能
                    </template>
                    <el-select
                      v-model="formData.roomFeatures"
                      multiple
                      placeholder="请选择房间功能（支持多选）"
                      class="form-input feature-select"
                    >
                      <el-option value="direct" label="直出"></el-option>
                      <el-option value="instant" label="即得"></el-option>
                      <el-option value="scraper" label="刮板"></el-option>
                      <el-option value="wheel" label="转盘"></el-option>
                      <el-option value="screenshot" label="截图"></el-option>
                    </el-select>
                    <span class="form-tip">支持的组合：直出、直出+刮板、直出+转盘、直出+截图、即得、即得+刮板、即得+转盘、即得+截图、刮板、刮板+转盘、刮板+截图、转盘、转盘+截图、截图</span>
                    <annotation-point
                      title="【优化】房间功能说明"
                      content="房间功能定义房间支持的玩法模式：&#10;· 直出：商品直接掉落，无需复杂操作&#10;· 即得：用户即时获得奖励反馈&#10;· 刮板：刮开覆盖层揭示结果，增加互动乐趣&#10;· 转盘：旋转转盘抽取奖励，惊喜感强&#10;· 截图：支持用户截图分享，促进传播&#10;&#10;不同的功能组合可实现多样化玩法，提升用户体验和参与度。当选择'直出'时，需额外配置奖品类型和选择奖品。"
                      priority="P0"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 奖品配置区域 - 联动显示/隐藏 -->
              <div v-if="showPrizeConfig" class="prize-config-section">
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item prop="prizeType">
                      <template slot="label">
                        <span class="required-mark">*</span>奖品类型
                      </template>
                      <el-radio-group v-model="formData.prizeType">
                        <el-radio label="product">商品</el-radio>
                        <el-radio label="points">积分</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item prop="selectedPrize">
                      <template slot="label">
                        <span class="required-mark">*</span>选择奖品
                      </template>
                      <div class="prize-select-card" @click="showPrizeModal = true">
                        <div v-if="!formData.selectedPrize" class="prize-placeholder">
                          <i class="el-icon-plus"></i>
                          <span>点击选择奖品</span>
                        </div>
                        <div v-else class="prize-info">
                          <img :src="formData.selectedPrize.image" class="prize-thumb" />
                          <span class="prize-name">{{ formData.selectedPrize.name }}</span>
                        </div>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 素材配置 -->
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item prop="coverImage">
                    <template slot="label">
                      <span class="required-mark">*</span>房间封面图
                    </template>
                    <div class="upload-hint">图片尺寸1:1，图片大小1MB以内</div>
                    <el-upload
                      class="avatar-uploader"
                      :action="uploadUrl"
                      :show-file-list="false"
                      :on-success="handleCoverUploadSuccess"
                    >
                      <img v-if="formData.coverImage" :src="formData.coverImage" class="avatar" />
                      <i v-else class="el-icon-plus avatar-icon"></i>
                    </el-upload>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="ruleImage">
                    <template slot="label">
                      <span class="required-mark">*</span>房间规则图
                    </template>
                    <div class="upload-hint">图片尺寸1:1</div>
                    <el-upload
                      class="avatar-uploader"
                      :action="uploadUrl"
                      :show-file-list="false"
                      :on-success="handleRuleUploadSuccess"
                    >
                      <img v-if="formData.ruleImage" :src="formData.ruleImage" class="avatar" />
                      <i v-else class="el-icon-plus avatar-icon"></i>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 分组三：房间参数配置 -->
            <div class="form-section">
              <div class="section-header">
                <span class="section-title">房间参数配置</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item prop="gameCoins">
                    <template slot="label">
                      <span class="required-mark">*</span>游戏币
                    </template>
                    <div class="input-with-unit">
                      <el-input v-model="formData.gameCoins" placeholder="请输入游戏币数量" class="form-input" />
                      <span class="unit">币</span>
                    </div>
                    <span class="form-tip">运气台19~199币，其他台39~1999币</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="gameTime">
                    <template slot="label">
                      <span class="required-mark">*</span>游戏时间
                    </template>
                    <div class="input-with-unit">
                      <el-input v-model="formData.gameTime" placeholder="请输入游戏时间" class="form-input" />
                      <span class="unit">秒</span>
                    </div>
                    <span class="form-tip">10~60秒</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="coinTime">
                    <template slot="label">
                      <span class="required-mark">*</span>投币时间
                    </template>
                    <div class="input-with-unit">
                      <el-input v-model="formData.coinTime" placeholder="请输入投币时间" class="form-input" />
                      <span class="unit">秒</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="timeoutTime">
                    <template slot="label">
                      <span class="required-mark">*</span>结果超时时间
                    </template>
                    <div class="input-with-unit">
                      <el-input v-model="formData.timeoutTime" placeholder="请输入超时时间" class="form-input" />
                      <span class="unit">秒</span>
                    </div>
                    <span class="form-tip">10~30秒</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="rechargeWaitTime">
                    <template slot="label">
                      <span class="required-mark">*</span>充值等待时间
                    </template>
                    <div class="input-with-unit">
                      <el-input v-model="formData.rechargeWaitTime" placeholder="请输入等待时间" class="form-input" />
                      <span class="unit">秒</span>
                    </div>
                    <span class="form-tip">用户金币不足时充值等待时间</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 分组四：功能状态开关 -->
            <div class="form-section">
              <div class="section-header">
                <span class="section-title">功能状态开关</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="房间显示状态" prop="isShow">
                    <div class="switch-wrapper">
                      <el-switch v-model="formData.isShow" active-color="#409EFF" inactive-color="#DCDFE6" />
                      <span class="switch-desc">开启后可在APP看到该房间</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="是否有摇杆" prop="hasJoystick">
                    <div class="switch-wrapper">
                      <el-switch v-model="formData.hasJoystick" active-color="#409EFF" inactive-color="#DCDFE6" />
                      <span class="switch-desc">用户可操作前后左右调整爪子位置</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="是否有二收" prop="hasSecondary">
                    <div class="switch-wrapper">
                      <el-switch v-model="formData.hasSecondary" active-color="#409EFF" inactive-color="#DCDFE6" />
                      <span class="switch-desc">下爪后用户可操作收爪</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="房间客服" prop="hasCustomerService">
                    <div class="switch-wrapper">
                      <el-switch v-model="formData.hasCustomerService" active-color="#409EFF" inactive-color="#DCDFE6" />
                      <span class="switch-desc">房间开启客服功能</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="复位呼叫" prop="resetCall">
                    <div class="switch-wrapper">
                      <el-switch v-model="formData.resetCall" active-color="#409EFF" inactive-color="#DCDFE6" />
                      <span class="switch-desc">房间开启复位呼叫功能</span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 分组五：详情描述 -->
            <div class="form-section">
              <div class="section-header">
                <span class="section-title">详情描述</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="房间礼品详情" prop="giftDetail">
                    <div class="editor-hint">直出玩法不填会自动展示商品</div>
                    <div class="rich-text-editor-wrapper">
                      <div class="editor-toolbar">
                        <el-button size="small" @click="formatText('bold')"><i class="el-icon-bold"></i></el-button>
                        <el-button size="small" @click="formatText('italic')"><i class="el-icon-italic"></i></el-button>
                        <el-button size="small" @click="formatText('underline')"><i class="el-icon-underline"></i></el-button>
                        <span class="toolbar-divider"></span>
                        <el-select v-model="editorFontSize" size="small" class="font-size-select">
                          <el-option :label="'12'" :value="12"></el-option>
                          <el-option :label="'14'" :value="14"></el-option>
                          <el-option :label="'16'" :value="16"></el-option>
                        </el-select>
                      </div>
                      <textarea
                        v-model="formData.giftDetail"
                        class="rich-text-textarea"
                        :style="{ fontSize: editorFontSize + 'px' }"
                        placeholder="请输入房间礼品详情..."
                        maxlength="10000"
                      ></textarea>
                      <div class="editor-footer">
                        <span class="word-count">{{ formData.giftDetail.length }}/10000</span>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- ========== Step 2: 房间属性 ========== -->
          <div id="step2-content" v-show="currentStep === 1">
            <div class="form-section advanced-section">
              <div class="section-header">
                <span class="section-title">高级属性与运营配置</span>
              </div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item prop="roomPlay">
                    <template slot="label">
                      <span class="required-mark">*</span>房间玩法
                    </template>
                    <el-select v-model="formData.roomPlay" placeholder="请选择房间玩法" class="form-input">
                      <el-option value="lucky" label="欧皇台"></el-option>
                      <el-option value="scraper" label="刮板台"></el-option>
                      <el-option value="skill" label="技术台"></el-option>
                      <el-option value="gameplay" label="玩法台"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="roomCategory">
                    <template slot="label">
                      <span class="required-mark">*</span>房间分类
                    </template>
                    <el-select v-model="formData.roomCategory" placeholder="请选择房间分类" class="form-input">
                      <el-option value="lucky" label="欧皇台"></el-option>
                      <el-option value="scraper" label="刮板台"></el-option>
                      <el-option value="skill" label="技术台"></el-option>
                      <el-option value="gameplay" label="玩法台"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="房间属性" prop="roomAttribute">
                    <el-select v-model="formData.roomAttribute" placeholder="请选择房间属性" class="form-input">
                      <el-option value="hot" label="热门"></el-option>
                      <el-option value="new" label="新房间"></el-option>
                      <el-option value="recommend" label="推荐"></el-option>
                      <el-option value="normal" label="普通"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="房间排序" prop="roomSort">
                    <el-input-number v-model="formData.roomSort" :min="0" :max="999" placeholder="数值越大排越前" class="form-input" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="房间公告" prop="roomNotice">
                    <div class="notice-input-wrapper">
                      <el-input
                        v-model="formData.roomNotice"
                        placeholder="请输入房间公告"
                        :maxlength="20"
                        class="form-input notice-input"
                      />
                      <span class="notice-count">{{ noticeCount }}/20</span>
                    </div>
                    <annotation-point
                      title="【优化】房间公告字段说明"
                      content="房间公告是展示给用户的简短提示信息：&#10;· 最多输入20个字符&#10;· 会显示在房间详情页顶部&#10;· 可用于宣传促销活动、新人福利等&#10;· 不填写则不显示公告区域&#10;&#10;合理使用房间公告可提升用户关注度和参与热情。"
                      priority="P1"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="是否在首页显示" prop="showOnHome">
                    <div class="switch-wrapper">
                      <el-switch v-model="formData.showOnHome" active-color="#409EFF" inactive-color="#DCDFE6" />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 底部操作按钮 -->
      <div class="form-actions">
        <template v-if="currentStep === 0">
          <el-button @click="handleBack" class="btn-cancel">取消</el-button>
          <el-button type="primary" @click="handleNextStep" class="btn-next">下一步</el-button>
        </template>
        <template v-else>
          <el-button @click="handlePrevStep" class="btn-prev">上一步</el-button>
          <el-button type="primary" @click="handleSubmit" class="btn-submit">提交</el-button>
        </template>
      </div>
    </el-card>

    <!-- 选择奖品弹窗 -->
    <el-dialog :visible.sync="showPrizeModal" title="选择奖品" width="900px" :close-on-click-modal="false">
      <div class="modal-search-bar">
        <el-form :model="prizeSearchForm" inline>
          <el-form-item label="奖品名称">
            <el-input v-model="prizeSearchForm.keyword" placeholder="请输入奖品名称" class="modal-input" />
          </el-form-item>
          <el-form-item label="奖品类型">
            <el-select v-model="prizeSearchForm.type" placeholder="请选择" clearable class="modal-select">
              <el-option value="product" label="商品"></el-option>
              <el-option value="points" label="积分"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchPrizes">查询</el-button>
            <el-button @click="resetPrizeSearch">重置</el-button>
            <el-button type="success" @click="confirmPrize">确定</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="prizeList" ref="prizeTable" v-loading="prizeLoading" highlight-current-row @row-click="handlePrizeRowClick">
        <el-table-column width="55">
          <template slot-scope="scope">
            <el-radio :value="scope.row.id" v-model="selectedPrizeId" @change="handlePrizeRadioChange(scope.row)"></el-radio>
          </template>
        </el-table-column>
        <el-table-column label="奖品ID" width="100" prop="id"></el-table-column>
        <el-table-column label="奖品图" width="80">
          <template slot-scope="scope">
            <div class="prize-table-thumb">
              <img :src="scope.row.image" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="奖品名称" min-width="180" prop="name"></el-table-column>
        <el-table-column label="奖品类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'product' ? 'success' : 'info'">
              {{ scope.row.type === 'product' ? '商品' : '积分' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="80" prop="stock"></el-table-column>
      </el-table>

      <div class="modal-pagination">
        <pagination v-if="prizeTotal" :total="prizeTotal" :page.sync="prizeSearchForm.page" :limit.sync="prizeSearchForm.limit" @pagination="searchPrizes" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'roomAddEdit',
  components: {
    AnnotationPoint,
  },
  data() {
    return {
      currentStep: 0, // 当前步骤：0-房间信息，1-房间属性
      isEdit: false,
      uploadUrl: '/api/upload',
      editorFontSize: 14,

      // 奖品弹窗相关
      showPrizeModal: false,
      prizeLoading: false,
      selectedPrizeId: null,
      prizeList: [],
      prizeTotal: 0,

      // 表单数据
      formData: {
        // 基础信息配置
        roomNo: '',
        roomName: '',
        siteDevice: '',
        playType: '',

        // 玩法与素材配置
        roomFeatures: [], // 多选数组格式
        prizeType: 'product',
        selectedPrize: null,
        coverImage: '',
        ruleImage: '',

        // 房间参数配置
        gameCoins: '',
        gameTime: '',
        coinTime: '',
        timeoutTime: '',
        rechargeWaitTime: '',

        // 功能状态开关
        isShow: true,
        hasJoystick: true,
        hasSecondary: false,
        hasCustomerService: true,
        resetCall: false,

        // 详情描述
        giftDetail: '',

        // 房间属性（Step 2）
        roomPlay: '',
        roomCategory: '',
        roomAttribute: '',
        roomSort: 0,
        roomNotice: '',
        showOnHome: false,
      },

      // 奖品搜索表单
      prizeSearchForm: {
        keyword: '',
        type: '',
        page: 1,
        limit: 10,
      },
    };
  },
  computed: {
    /**
     * 房间公告字数统计
     * 核心交互：实时计算已输入字符数，显示格式为 "当前字数/20"
     */
    noticeCount() {
      return this.formData.roomNotice.length;
    },

    /**
     * 判断是否显示奖品配置区域
     * 当房间功能包含"直出"时显示
     * 利用 computed 实现响应式联动
     */
    showPrizeConfig() {
      return this.formData.roomFeatures.includes('direct');
    },
  },
  watch: {
    /**
     * 监听房间功能变化，控制奖品配置区域
     * 当不包含"直出"时，清空奖品相关字段
     */
    'formData.roomFeatures': {
      handler(newVal) {
        if (!newVal.includes('direct')) {
          this.formData.prizeType = 'product';
          this.formData.selectedPrize = null;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.$route.params.id) {
      this.isEdit = true;
      this.loadFormData();
    } else {
      this.loadMockData();
    }
  },
  methods: {
    /**
     * 返回房间列表
     */
    handleBack() {
      this.$router.push({ path: this.$routeProStr + '/game/room/roomList' });
    },

    /**
     * 下一步
     * 直接进入 Step 2（原型阶段不做校验）
     */
    handleNextStep() {
      this.currentStep = 1;
    },

    /**
     * 上一步
     */
    handlePrevStep() {
      this.currentStep = 0;
    },

    /**
     * 提交表单
     * 直接提交（原型阶段不做校验）
     */
    handleSubmit() {
      this.$message.success('保存成功');
      setTimeout(() => {
        this.$router.push({ path: this.$routeProStr + '/game/room/roomList' });
      }, 500);
    },

    /**
     * 加载表单数据（编辑模式）
     */
    loadFormData() {
      this.formData = {
        // 基础信息配置
        roomNo: 'R001',
        roomName: '一号抓娃娃房',
        siteDevice: 'park005',
        playType: 'gameplay',

        // 玩法与素材配置 - 包含直出+刮板组合
        roomFeatures: ['direct', 'scraper'],
        prizeType: 'product',
        selectedPrize: { id: 1, name: '精美公仔娃娃', image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
        coverImage: 'https://img.yzcdn.cn/vant/cat.jpeg',
        ruleImage: '',

        // 房间参数配置
        gameCoins: '99',
        gameTime: '30',
        coinTime: '30',
        timeoutTime: '15',
        rechargeWaitTime: '60',

        // 功能状态开关
        isShow: true,
        hasJoystick: true,
        hasSecondary: false,
        hasCustomerService: true,
        resetCall: false,

        // 详情描述
        giftDetail: '',

        // 房间属性
        roomPlay: 'gameplay',
        roomCategory: 'gameplay',
        roomAttribute: 'hot',
        roomSort: 100,
        roomNotice: '新人专享福利',
        showOnHome: true,
      };
    },

    /**
     * 加载 Mock 数据（添加模式）
     */
    loadMockData() {
      this.formData = {
        // 基础信息配置
        roomNo: '',
        roomName: '',
        siteDevice: '',
        playType: '',

        // 玩法与素材配置
        roomFeatures: [], // 多选数组格式
        prizeType: 'product',
        selectedPrize: null,
        coverImage: '',
        ruleImage: '',

        // 房间参数配置
        gameCoins: '',
        gameTime: '',
        coinTime: '',
        timeoutTime: '',
        rechargeWaitTime: '',

        // 功能状态开关
        isShow: true,
        hasJoystick: true,
        hasSecondary: false,
        hasCustomerService: true,
        resetCall: false,

        // 详情描述
        giftDetail: '',

        // 房间属性
        roomPlay: '',
        roomCategory: '',
        roomAttribute: '',
        roomSort: 0,
        roomNotice: '',
        showOnHome: false,
      };
    },

    /**
     * 搜索奖品
     */
    searchPrizes() {
      this.prizeLoading = true;
      setTimeout(() => {
        this.prizeList = [
          { id: 1, name: '精美公仔娃娃', image: 'https://img.yzcdn.cn/vant/cat.jpeg', type: 'product', stock: 100 },
          { id: 2, name: '积分1000', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=points%20icon&image_size=square', type: 'points', stock: 9999 },
          { id: 3, name: '限量版手办', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20figure&image_size=square', type: 'product', stock: 10 },
        ];
        this.prizeTotal = 100;
        this.prizeLoading = false;
      }, 300);
    },

    /**
     * 重置奖品搜索
     */
    resetPrizeSearch() {
      this.prizeSearchForm = { keyword: '', type: '', page: 1, limit: 10 };
      this.searchPrizes();
    },

    /**
     * 点击奖品行
     */
    handlePrizeRowClick(row) {
      this.selectedPrizeId = row.id;
    },

    /**
     * 选择奖品单选按钮
     */
    handlePrizeRadioChange(row) {
      // 单选按钮变化时自动选中该行数据
    },

    /**
     * 确认选择奖品
     */
    confirmPrize() {
      const selectedPrize = this.prizeList.find(item => item.id === this.selectedPrizeId);
      if (!selectedPrize) {
        this.$message.warning('请选择奖品');
        return;
      }
      this.formData.selectedPrize = selectedPrize;
      this.formData.prizeType = selectedPrize.type;
      this.showPrizeModal = false;
    },

    /**
     * 封面图上传成功
     */
    handleCoverUploadSuccess(response) {
      this.formData.coverImage = response.data?.url || '';
    },

    /**
     * 规则图上传成功
     */
    handleRuleUploadSuccess(response) {
      this.formData.ruleImage = response.data?.url || '';
    },

    /**
     * 富文本格式化
     */
    formatText(type) {
      this.$message.info('格式按钮: ' + type);
    },
  },
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 100px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;

  .back-link {
    display: flex;
    align-items: center;
    color: #606266;
    margin-right: 16px;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  .page-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
}

.el-card {
  margin: 16px 24px;
}

.step-wrapper {
  padding: 0 40px 24px;
}

.form-content {
  padding: 0 10px;
  width: 100%;
  box-sizing: border-box;
}

::v-deep .el-form {
  width: 100%;
}

::v-deep .el-form-item {
  display: table;
  width: 100%;
  margin-bottom: 22px;
}

::v-deep .el-form-item__label {
  display: table-cell;
  float: none;
  width: 130px !important;
  text-align: right;
  vertical-align: top;
  padding: 0 12px 0 0;
  line-height: 32px;
  font-size: 12px;
  color: #606266;
  box-sizing: border-box;
}

::v-deep .el-form-item__content {
  display: table-cell;
  margin-left: 0 !important;
  line-height: 32px;
  vertical-align: top;
  width: calc(100% - 130px);
  box-sizing: border-box;
}

::v-deep .el-row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

::v-deep .el-col-12 {
  width: 50%;
}

::v-deep .el-col-24 {
  width: 100%;
}

.form-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.advanced-section {
  border: 1px solid #e4e7ed;
  background: #fff;
}

.section-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.required-mark {
  color: #f56c6c;
  margin-right: 4px;
}

.form-input {
  width: 100%;
}

.feature-select {
  width: 100%;
  min-width: 200px;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.avatar-uploader {
  display: inline-block;
  width: 100px;
  height: 100px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.avatar-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.input-with-unit {
  display: flex;
  align-items: center;

  .unit {
    margin-left: 8px;
    font-size: 14px;
    color: #606266;
  }
}

.prize-config-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #dcdfe6;
}

.prize-select-card {
  width: 100%;
  height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    border-color: #409eff;
  }
}

.prize-placeholder {
  display: flex;
  align-items: center;
  color: #909399;

  i {
    font-size: 24px;
    margin-right: 8px;
  }
}

.prize-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prize-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.prize-name {
  font-size: 14px;
  color: #303133;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-wrapper-center {
  display: inline-block;
  vertical-align: middle;
}

.switch-desc {
  font-size: 12px;
  color: #909399;
}

.center-col {
  text-align: left;
}

/**
 * 房间公告字数统计样式
 * 核心交互：输入框右侧显示 "当前字数/20" 格式的计数
 */
.notice-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-input {
  flex: 1;
  max-width: 400px;
}

.notice-count {
  font-size: 14px;
  color: #909399;
  min-width: 50px;
  text-align: right;
}

.editor-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.rich-text-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  gap: 4px;

  .toolbar-divider {
    width: 1px;
    height: 18px;
    background: #dcdfe6;
    margin: 0 8px;
  }

  .font-size-select {
    width: 70px;
  }
}

.rich-text-textarea {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: none;
  resize: vertical;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.editor-footer {
  padding: 8px 12px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  text-align: right;

  .word-count {
    font-size: 12px;
    color: #909399;
  }
}

.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  z-index: 100;

  .btn-cancel,
  .btn-prev {
    min-width: 100px;
  }

  .btn-next,
  .btn-submit {
    min-width: 100px;
  }
}

.modal-search-bar {
  margin-bottom: 12px;
}

.modal-input {
  width: 180px;
}

.modal-select {
  width: 120px;
}

.prize-table-thumb {
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

.modal-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
