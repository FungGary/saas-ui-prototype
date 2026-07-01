<template>
  <div class="bag-filter">
    <div class="padding-add">
      <el-form ref="bagData" :model="bagData" label-width="80px" label-position="right" inline @submit.native.prevent>
        <div class="filter-grid">
          <el-form-item label="用户：">
            <el-input :value="bagData.user_label" readonly placeholder="选择用户" class="selector-input" @focus="openSelector('user')" @click.native="openSelector('user')">
              <el-button slot="append" icon="el-icon-search" @click.stop="openSelector('user')" />
            </el-input>
          </el-form-item>

          <el-form-item label="房间信息：">
            <el-input :value="bagData.room_label" readonly placeholder="选择房间" class="selector-input" @focus="openSelector('room')" @click.native="openSelector('room')">
              <el-button slot="append" icon="el-icon-search" @click.stop="openSelector('room')" />
            </el-input>
          </el-form-item>

          <el-form-item label="奖品：">
            <el-input :value="bagData.prize_label" readonly placeholder="选择商品" class="selector-input" @focus="openSelector('prize')" @click.native="openSelector('prize')">
              <el-button slot="append" icon="el-icon-search" @click.stop="openSelector('prize')" />
            </el-input>
          </el-form-item>

          <el-form-item label="商品分类：">
            <el-select v-model="bagData.category" clearable placeholder="请选择" class="category-select">
              <el-option label="全部" value="" />
              <el-option label="潮玩周边/灯具" value="潮玩周边/灯具" />
              <el-option label="盲盒/套装" value="盲盒/套装" />
              <el-option label="数码生活/音箱" value="数码生活/音箱" />
              <el-option label="潮玩周边/积木" value="潮玩周边/积木" />
              <el-option label="周边配件/徽章" value="周边配件/徽章" />
            </el-select>
          </el-form-item>

          <el-form-item label="获得时间：" class="date-item">
            <el-date-picker
              v-model="timeVal"
              clearable
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy/MM/dd"
              value-format="yyyy-MM-dd"
              class="date-range"
            />
          </el-form-item>

          <el-form-item class="filter-actions">
            <el-button v-db-click @click="handleReset">重置</el-button>
            <el-button type="primary" v-db-click @click="bagSearch">查询</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <el-dialog :title="selectorTitle" :visible.sync="selectorVisible" width="980px" custom-class="selector-dialog" @closed="resetSelectorState">
      <div v-if="selectorType === 'user'" class="selector-query">
        <span class="query-label">用户搜索</span>
        <el-select v-model="selectorFilters.userField" class="query-select" placeholder="请选择">
          <el-option label="全部" value="all" />
          <el-option label="用户编号" value="userNo" />
          <el-option label="昵称" value="name" />
          <el-option label="手机号" value="phone" />
        </el-select>
        <el-input v-model="selectorKeyword" clearable class="query-input" placeholder="请输入" @keyup.enter.native="querySelector" />
        <el-button @click="resetSelectorSearch">重置</el-button>
        <el-button type="primary" @click="querySelector">查询</el-button>
      </div>

      <div v-else-if="selectorType === 'room'" class="selector-query room-query">
        <span class="query-label">房间号</span>
        <el-input v-model="selectorFilters.roomNo" clearable class="query-input" placeholder="请输入房间号" />
        <span class="query-label">房间名称</span>
        <el-input v-model="selectorKeyword" clearable class="query-input" placeholder="请输入房间名称" />
        <span class="query-label">玩法分类</span>
        <el-select v-model="selectorFilters.playType" clearable class="query-select" placeholder="全部">
          <el-option label="全部" value="" />
          <el-option label="转盘" value="转盘" />
          <el-option label="盲盒" value="盲盒" />
          <el-option label="派对" value="派对" />
        </el-select>
        <span class="query-label">房间状态</span>
        <el-select v-model="selectorFilters.roomStatus" clearable class="query-select" placeholder="全部">
          <el-option label="全部" value="" />
          <el-option label="开启" value="开启" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-button @click="resetSelectorSearch">重置</el-button>
        <el-button type="primary" @click="querySelector">查询</el-button>
      </div>

      <div v-else class="selector-query">
        <span class="query-label">商品分类</span>
        <el-select v-model="selectorFilters.category" clearable class="query-select" placeholder="请选择">
          <el-option label="全部" value="" />
          <el-option label="潮玩周边/灯具" value="潮玩周边/灯具" />
          <el-option label="盲盒/套装" value="盲盒/套装" />
          <el-option label="数码生活/音箱" value="数码生活/音箱" />
          <el-option label="潮玩周边/积木" value="潮玩周边/积木" />
          <el-option label="周边配件/徽章" value="周边配件/徽章" />
        </el-select>
        <span class="query-label">来源</span>
        <el-select v-model="selectorFilters.productSource" clearable class="query-select" placeholder="请选择">
          <el-option label="全部" value="" />
          <el-option label="自营" value="自营" />
          <el-option label="旗舰" value="旗舰" />
        </el-select>
        <span class="query-label">商品搜索</span>
        <el-input v-model="selectorKeyword" clearable class="query-input wide" placeholder="请输入商品名称/关键字/ID" @keyup.enter.native="querySelector" />
        <el-button @click="resetSelectorSearch">重置</el-button>
        <el-button type="primary" @click="querySelector">查询</el-button>
      </div>

      <el-table :data="selectorPagedRows" height="430" class="selector-table">
        <el-table-column width="48" align="center">
          <template slot-scope="scope"><el-radio v-model="selectorSelectedValue" :label="scope.row.value"><span></span></el-radio></template>
        </el-table-column>
        <template v-if="selectorType === 'user'">
          <el-table-column label="ID" width="90" prop="uid" />
          <el-table-column label="用户编号" width="140" prop="userNo" />
          <el-table-column label="头像" width="90"><template slot-scope="scope"><el-avatar :size="34" :src="scope.row.avatar">{{ scope.row.label.charAt(0) }}</el-avatar></template></el-table-column>
          <el-table-column label="昵称" min-width="180" prop="label" />
          <el-table-column label="手机号" width="150" prop="phone" />
          <el-table-column label="注册时间" width="180" prop="createdAt" />
        </template>
        <template v-else-if="selectorType === 'room'">
          <el-table-column label="房间ID" width="110" prop="id" />
          <el-table-column label="房间号" width="130" prop="no" />
          <el-table-column label="房间名称" min-width="180" prop="label" />
          <el-table-column label="房间分类" width="150" prop="category" />
          <el-table-column label="玩法分类" width="150" prop="playType" />
          <el-table-column label="房间状态" width="130"><template slot-scope="scope"><el-tag size="mini" :type="scope.row.status === '开启' ? 'success' : 'info'">{{ scope.row.status }}</el-tag></template></el-table-column>
        </template>
        <template v-else>
          <el-table-column label="商品ID" width="120" prop="value" />
          <el-table-column label="商品图" width="100"><template slot-scope="scope"><img class="selector-product-img" :src="scope.row.image || defaultImg" alt="" /></template></el-table-column>
          <el-table-column label="商品名称" min-width="260" prop="label" />
          <el-table-column label="商品售价" width="130" prop="price" />
          <el-table-column label="来源" width="120" prop="source" />
        </template>
      </el-table>

      <div slot="footer" class="selector-footer">
        <span>共 {{ selectorRows.length }} 条</span>
        <el-select v-model="selectorPageSize" class="page-size" size="small">
          <el-option :value="10" label="10条/页" />
          <el-option :value="20" label="20条/页" />
        </el-select>
        <el-pagination small layout="prev, pager, next" :total="selectorRows.length" :page-size="selectorPageSize" :current-page.sync="selectorPage" />
        <span>前往</span>
        <el-input v-model="selectorPage" size="small" class="page-input" />
        <span>页</span>
        <el-button @click="selectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelector">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

const defaultBagData = () => ({
  keyword: '',
  field_key: 'all',
  user_no: '',
  user_label: '',
  room_id: '',
  room_label: '',
  prize_id: '',
  prize_label: '',
  category: '',
  data: '',
  date_range: [],
});

const userOptions = [
  { value: 'USR-73001', userNo: 'USR-73001', uid: '71001', label: '雾眠', phone: '139****4201', createdAt: '2026-06-01 10:12:31', avatar: defaultAvatar },
  { value: 'USR-73002', userNo: 'USR-73002', uid: '71002', label: '山栀', phone: '138****7712', createdAt: '2026-06-03 09:40:18', avatar: defaultAvatar },
  { value: 'USR-73003', userNo: 'USR-73003', uid: '71003', label: '鲸落', phone: '137****6050', createdAt: '2026-06-04 20:05:11', avatar: defaultAvatar },
  { value: 'USR-73004', userNo: 'USR-73004', uid: '71004', label: '白露', phone: '136****8820', createdAt: '2026-06-05 13:55:45', avatar: defaultAvatar },
];
const roomOptions = [
  { value: 'r-sky-01', id: '31', no: 'R-SKY-01', label: '星空转盘房', category: '主题房', playType: '转盘', status: '开启' },
  { value: 'r-luck-09', id: '42', no: 'R-LUCK-09', label: '九号幸运屋', category: '活动房', playType: '盲盒', status: '开启' },
  { value: 'r-tech-18', id: '58', no: 'R-TECH-18', label: '十八号体验台', category: '测试房', playType: '派对', status: '停用' },
  { value: 'r-pop-26', id: '76', no: 'R-POP-26', label: '潮玩快闪间', category: '活动房', playType: '转盘', status: '开启' },
];
const prizeOptions = [
  { value: 'sku-901', label: '草莓熊夜灯', category: '潮玩周边/灯具', price: '129.00', source: '自营' },
  { value: 'sku-902', label: '星球杯盲盒套装', category: '盲盒/套装', price: '89.00', source: '旗舰' },
  { value: 'sku-903', label: '蓝牙复古音箱', category: '数码生活/音箱', price: '239.00', source: '自营' },
  { value: 'sku-904', label: '限定徽章礼盒', category: '周边配件/徽章', price: '59.00', source: '旗舰' },
  { value: 'sku-905', label: '迷你积木花束', category: '潮玩周边/积木', price: '79.00', source: '自营' },
];

export default {
  name: 'bag_table_from',
  data() {
    return {
      defaultImg: require('@/assets/images/noPictrue.png'),
      bagData: defaultBagData(),
      timeVal: [],
      selectorVisible: false,
      selectorType: 'user',
      selectorKeyword: '',
      selectorSelectedValue: '',
      selectorPage: 1,
      selectorPageSize: 10,
      selectorFilters: { userField: 'all', roomNo: '', playType: '', roomStatus: '', category: '', productSource: '' },
    };
  },
  computed: {
    selectorTitle() {
      return ({ user: '用户搜索', room: '选择房间', prize: '选择商品' })[this.selectorType];
    },
    selectorRows() {
      const map = { user: userOptions, room: roomOptions, prize: prizeOptions };
      const keyword = this.selectorKeyword.trim().toLowerCase();
      return (map[this.selectorType] || []).filter(item => {
        if (this.selectorType === 'user' && keyword) {
          if (this.selectorFilters.userField === 'userNo') return item.userNo.toLowerCase().includes(keyword);
          if (this.selectorFilters.userField === 'name') return item.label.toLowerCase().includes(keyword);
          if (this.selectorFilters.userField === 'phone') return item.phone.toLowerCase().includes(keyword);
        }
        if (this.selectorType === 'room') {
          if (this.selectorFilters.roomNo && !item.no.toLowerCase().includes(this.selectorFilters.roomNo.toLowerCase())) return false;
          if (this.selectorFilters.playType && item.playType !== this.selectorFilters.playType) return false;
          if (this.selectorFilters.roomStatus && item.status !== this.selectorFilters.roomStatus) return false;
        }
        if (this.selectorType === 'prize') {
          if (this.selectorFilters.category && item.category !== this.selectorFilters.category) return false;
          if (this.selectorFilters.productSource && item.source !== this.selectorFilters.productSource) return false;
        }
        return !keyword || [item.label, item.value, item.userNo, item.phone, item.no].some(value => String(value || '').toLowerCase().includes(keyword));
      });
    },
    selectorPagedRows() {
      const page = Number(this.selectorPage) || 1;
      const start = (page - 1) * this.selectorPageSize;
      return this.selectorRows.slice(start, start + this.selectorPageSize);
    },
  },
  methods: {
    openSelector(type) {
      this.selectorType = type;
      this.selectorKeyword = '';
      this.selectorSelectedValue = ({ user: this.bagData.user_no, room: this.bagData.room_id, prize: this.bagData.prize_id })[type] || '';
      this.selectorPage = 1;
      this.selectorVisible = true;
    },
    querySelector() {
      this.selectorPage = 1;
    },
    resetSelectorSearch() {
      this.selectorKeyword = '';
      this.selectorFilters = { userField: 'all', roomNo: '', playType: '', roomStatus: '', category: '', productSource: '' };
      this.selectorPage = 1;
    },
    resetSelectorState() {
      this.selectorSelectedValue = '';
      this.resetSelectorSearch();
    },
    confirmSelector() {
      const item = this.selectorRows.find(row => row.value === this.selectorSelectedValue);
      if (!item) return this.$message.warning('请选择数据');
      this.selectOption(item);
    },
    selectOption(item) {
      if (this.selectorType === 'user') {
        this.bagData.user_no = item.value;
        this.bagData.user_label = item.label;
        this.bagData.keyword = item.value;
        this.bagData.field_key = 'user_no';
      }
      if (this.selectorType === 'room') {
        this.bagData.room_id = item.value;
        this.bagData.room_label = item.label;
      }
      if (this.selectorType === 'prize') {
        this.bagData.prize_id = item.value;
        this.bagData.prize_label = item.label;
      }
      this.selectorVisible = false;
    },
    clearSelection(type) {
      if (type === 'user') {
        this.bagData.user_no = '';
        this.bagData.user_label = '';
        this.bagData.keyword = '';
        this.bagData.field_key = 'all';
      }
      if (type === 'room') {
        this.bagData.room_id = '';
        this.bagData.room_label = '';
      }
      if (type === 'prize') {
        this.bagData.prize_id = '';
        this.bagData.prize_label = '';
      }
    },
    buildSearchPayload() {
      this.bagData.data = this.timeVal && this.timeVal.length ? this.timeVal.join('-') : '';
      this.bagData.date_range = this.timeVal && this.timeVal.length ? [...this.timeVal] : [];
      return { ...this.bagData };
    },
    bagSearch() {
      this.$emit('getList', { page: 1, filters: this.buildSearchPayload() });
    },
    handleReset() {
      this.bagData = defaultBagData();
      this.timeVal = [];
      this.$emit('getList', { page: 1, filters: this.buildSearchPayload() });
    },
  },
};
</script>

<style lang="scss" scoped>
.padding-add { padding: 20px; }
.filter-grid { display: flex; flex-wrap: wrap; align-items: flex-start; column-gap: 18px; row-gap: 2px; }
.form-content-width, .category-select { width: 220px; }
.selector-input { width: 220px; }
::v-deep .selector-input .el-input__inner { cursor: pointer; background: #fff; }
::v-deep .selector-input .el-input-group__append { padding: 0; width: 44px; text-align: center; }
::v-deep .selector-input .el-input-group__append .el-button { width: 44px; padding: 0; }
.date-range { width: 380px; }
.filter-actions { margin-left: auto; }
.selector-query { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
.query-label { color: #303133; white-space: nowrap; }
.query-select { width: 150px; }
.query-input { width: 190px; }
.query-input.wide { width: 240px; }
.selector-table { border-top: 1px solid #ebeef5; }
.selector-product-img { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; }
.selector-footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.page-size { width: 120px; }
.page-input { width: 56px; }
::v-deep .selector-dialog .el-dialog__body { padding: 18px 16px 0; }
::v-deep .selector-dialog .el-dialog__footer { border-top: 1px solid #ebeef5; padding: 12px 16px; }
::v-deep .el-form-item { margin-right: 0; margin-bottom: 14px; }
::v-deep .el-form-item__label { color: #303133; }
::v-deep .selector-table th { background: #f5f7fa; color: #303133; font-weight: 500; }
</style>
