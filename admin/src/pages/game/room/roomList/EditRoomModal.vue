<template>
  <el-dialog
    title="编辑房间"
    :visible.sync="visible"
    width="720px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
      label-position="left"
      class="edit-room-form"
    >
      <!-- 分组一：基础信息 -->
      <div class="form-section">
        <div class="section-title">基础信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间号" prop="roomNo">
              <el-input v-model="formData.roomNo" placeholder="请输入房间号" class="form-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间名称" prop="roomName">
              <el-input v-model="formData.roomName" placeholder="请输入房间名称" class="form-input" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="站点设备绑定" prop="siteDevice">
              <el-select v-model="formData.siteDevice" placeholder="请选择站点设备" class="form-input">
                <el-option value="park001" label="乐园001"></el-option>
                <el-option value="park005" label="乐园005"></el-option>
                <el-option value="park010" label="乐园010"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="玩法类型" prop="playType">
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

      <!-- 分组二：玩法与奖励配置 -->
      <div class="form-section">
        <div class="section-title">玩法与奖励配置</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="房间功能" prop="roomFeatures">
              <el-select
                v-model="formData.roomFeatures"
                multiple
                placeholder="请选择房间功能（可多选）"
                class="form-input"
              >
                <el-option value="direct" label="直出"></el-option>
                <el-option value="instant" label="即得"></el-option>
                <el-option value="scraper" label="刮板"></el-option>
                <el-option value="wheel" label="转盘"></el-option>
                <el-option value="screenshot" label="截图"></el-option>
              </el-select>
              <span class="form-tip">支持多选，如：直出+刮板、即得+截图等组合</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 奖品配置区域 -->
        <template v-if="showPrizeConfig">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="奖品类型" prop="prizeType">
                <el-radio-group v-model="formData.prizeType">
                  <el-radio label="product">商品</el-radio>
                  <el-radio label="points">积分</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="选择奖品" prop="selectedPrize">
                <div class="prize-select" @click="handleSelectPrize">
                  <div v-if="!formData.selectedPrize" class="prize-empty">
                    <i class="el-icon-plus"></i>
                    <span>选择奖品</span>
                  </div>
                  <div v-else class="prize-selected">
                    <img :src="formData.selectedPrize.image" class="prize-img" />
                    <span class="prize-name">{{ formData.selectedPrize.name }}</span>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间封面图" prop="coverImage">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleCoverUploadSuccess"
              >
                <img v-if="formData.coverImage" :src="formData.coverImage" class="avatar" />
                <i v-else class="el-icon-plus avatar-icon"></i>
              </el-upload>
              <span class="form-tip">图片尺寸1:1，大小1MB以内</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间规则图" prop="ruleImage">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleRuleUploadSuccess"
              >
                <img v-if="formData.ruleImage" :src="formData.ruleImage" class="avatar" />
                <i v-else class="el-icon-plus avatar-icon"></i>
              </el-upload>
              <span class="form-tip">图片尺寸1:1，大小1MB以内</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 分组三：房间运行参数 -->
      <div class="form-section">
        <div class="section-title">房间运行参数</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="游戏币" prop="gameCoins">
              <div class="input-with-unit">
                <el-input v-model="formData.gameCoins" placeholder="请输入游戏币数量" class="form-input" />
                <span class="unit">币</span>
              </div>
              <span class="form-tip">(运气台19~199币，其他台39~1999币)</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="游戏时间" prop="gameTime">
              <div class="input-with-unit">
                <el-input v-model="formData.gameTime" placeholder="请输入游戏时间" class="form-input" />
                <span class="unit">秒</span>
              </div>
              <span class="form-tip">(10~60秒)</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="投币时间" prop="coinTime">
              <div class="input-with-unit">
                <el-input v-model="formData.coinTime" placeholder="请输入投币时间" class="form-input" />
                <span class="unit">秒</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结果超时时间" prop="timeoutTime">
              <div class="input-with-unit">
                <el-input v-model="formData.timeoutTime" placeholder="请输入超时时间" class="form-input" />
                <span class="unit">秒</span>
              </div>
              <span class="form-tip">(10~30秒)</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="充值等待时间" prop="rechargeWaitTime">
              <div class="input-with-unit">
                <el-input v-model="formData.rechargeWaitTime" placeholder="请输入等待时间" class="form-input" />
                <span class="unit">秒</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 分组四：高级属性与排序 -->
      <div class="form-section">
        <div class="section-title">高级属性与排序</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间分类" prop="roomCategory">
              <el-select v-model="formData.roomCategory" placeholder="请选择房间分类" class="form-input">
                <el-option value="lucky" label="欧皇台"></el-option>
                <el-option value="scraper" label="刮板台"></el-option>
                <el-option value="skill" label="技术台"></el-option>
                <el-option value="gameplay" label="玩法台"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
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
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间排序" prop="sortOrder">
              <el-input v-model="formData.sortOrder" placeholder="数值越大排越前" class="form-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="首页显示" prop="showOnHome">
              <el-switch
                v-model="formData.showOnHome"
                active-color="#409EFF"
                inactive-color="#DCDFE6"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="房间公告" prop="roomNotice">
              <div class="notice-input-wrap">
                <el-input
                  v-model="formData.roomNotice"
                  placeholder="请输入房间公告"
                  :maxlength="20"
                  class="form-input notice-input"
                />
                <span class="notice-count">{{ formData.roomNotice.length }}/20</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 分组五：功能状态开关 -->
      <div class="form-section">
        <div class="section-title">功能状态开关</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间显示状态" prop="isShow">
              <div class="switch-wrap">
                <el-switch
                  v-model="formData.isShow"
                  active-color="#409EFF"
                  inactive-color="#DCDFE6"
                />
                <span class="switch-desc">开启后可在APP看到该房间</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否有摇杆" prop="hasJoystick">
              <div class="switch-wrap">
                <el-switch
                  v-model="formData.hasJoystick"
                  active-color="#409EFF"
                  inactive-color="#DCDFE6"
                />
                <span class="switch-desc">开启后支持摇杆操作</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否有二收" prop="hasSecondary">
              <div class="switch-wrap">
                <el-switch
                  v-model="formData.hasSecondary"
                  active-color="#409EFF"
                  inactive-color="#DCDFE6"
                />
                <span class="switch-desc">开启后支持二次抓取</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间客服" prop="hasCustomerService">
              <div class="switch-wrap">
                <el-switch
                  v-model="formData.hasCustomerService"
                  active-color="#409EFF"
                  inactive-color="#DCDFE6"
                />
                <span class="switch-desc">开启后显示客服入口</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="复位呼叫" prop="resetCall">
              <div class="switch-wrap">
                <el-switch
                  v-model="formData.resetCall"
                  active-color="#409EFF"
                  inactive-color="#DCDFE6"
                />
                <span class="switch-desc">开启后可呼叫复位</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 分组六：富文本描述 -->
      <div class="form-section">
        <div class="section-title">富文本描述</div>
        <div class="section-tip">直出玩法不填会自动展示商品</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="房间礼品详情" prop="giftDetail">
              <div class="rich-text-area">
                <textarea
                  v-model="formData.giftDetail"
                  placeholder="请输入房间礼品详情"
                  class="rich-text-input"
                ></textarea>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'EditRoomModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    roomData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      uploadUrl: '/api/upload',
      formData: {
        roomNo: '',
        roomName: '',
        siteDevice: '',
        playType: '',
        roomFeatures: [],
        prizeType: 'product',
        selectedPrize: null,
        coverImage: '',
        ruleImage: '',
        gameCoins: '',
        gameTime: '',
        coinTime: '',
        timeoutTime: '',
        rechargeWaitTime: '',
        roomCategory: '',
        roomAttribute: '',
        sortOrder: '',
        roomNotice: '',
        showOnHome: false,
        isShow: true,
        hasJoystick: true,
        hasSecondary: false,
        hasCustomerService: true,
        resetCall: false,
        giftDetail: '',
      },
    };
  },
  computed: {
    showPrizeConfig() {
      return this.formData.roomFeatures.includes('direct');
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm();
      }
    },
    'formData.roomFeatures': {
      handler(val) {
        if (!val.includes('direct')) {
          this.formData.prizeType = 'product';
          this.formData.selectedPrize = null;
        }
      },
      immediate: true,
    },
  },
  methods: {
    initForm() {
      const mock = this.getMockData();
      const data = { ...mock, ...this.roomData };
      this.formData = JSON.parse(JSON.stringify(data));
    },
    getMockData() {
      return {
        roomNo: 'R001',
        roomName: '一号抓娃娃房',
        siteDevice: 'park005',
        playType: 'gameplay',
        roomFeatures: ['direct', 'scraper'],
        prizeType: 'product',
        selectedPrize: { id: 1, name: '精美公仔娃娃', image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
        coverImage: 'https://img.yzcdn.cn/vant/cat.jpeg',
        ruleImage: '',
        gameCoins: '99',
        gameTime: '30',
        coinTime: '30',
        timeoutTime: '15',
        rechargeWaitTime: '60',
        roomCategory: 'gameplay',
        roomAttribute: 'hot',
        sortOrder: '100',
        roomNotice: '新人专享福利',
        showOnHome: true,
        isShow: true,
        hasJoystick: true,
        hasSecondary: false,
        hasCustomerService: true,
        resetCall: false,
        giftDetail: '',
      };
    },
    handleSelectPrize() {
      this.$message.info('打开奖品选择弹窗');
    },
    handleCoverUploadSuccess(res) {
      this.formData.coverImage = res.data?.url || '';
    },
    handleRuleUploadSuccess(res) {
      this.formData.ruleImage = res.data?.url || '';
    },
    handleClose() {
      this.$emit('close');
    },
    handleSubmit() {
      this.$message.success('保存成功');
      this.$emit('submit', this.formData);
      this.handleClose();
    },
  },
};
</script>

<style lang="scss" scoped>
.edit-room-form {
  padding: 10px 0;
  max-height: 500px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.section-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.input-with-unit {
  display: flex;
  align-items: center;
}

.input-with-unit .form-input {
  flex: 1;
}

.unit {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

.notice-input-wrap {
  display: flex;
  align-items: center;
}

.notice-input {
  flex: 1;
}

.notice-count {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.switch-wrap {
  display: flex;
  align-items: center;
}

.switch-desc {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.prize-select {
  width: 100%;
  cursor: pointer;
}

.prize-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  color: #909399;

  i {
    font-size: 24px;
    margin-right: 8px;
  }
}

.prize-selected {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.prize-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.prize-name {
  font-size: 14px;
  color: #303133;
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

.rich-text-area {
  width: 100%;
}

.rich-text-input {
  width: 100%;
  height: 120px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
