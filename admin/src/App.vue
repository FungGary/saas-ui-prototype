<template>
  <div id="app">
    <router-view />
    <Setings ref="setingsRef" />

    <!-- 检测版本更新 -->
    <!-- <Upgrade v-if="isVersion" /> -->
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import Setings from '@/layout/navBars/breadcrumb/setings.vue';
import Upgrade from '@/layout/upgrade/index.vue';
import setting from './setting';
import { Local } from '@/utils/storage.js';
import config from '../package.json';

const mockMenus = [
  {
    id: 2,
    pid: 0,
    name: '房间',
    title: '房间',
    path: '/admin/game',
    icon: 'el-icon-gamepad',
    component: '',
    is_show: true,
    children: [
      {
        id: 200,
        pid: 2,
        name: '房间列表',
        title: '房间列表',
        path: '/admin/game/room/roomList',
        icon: '',
        component: 'game/room/roomList',
        is_show: true,
      },
      {
        id: 201,
        pid: 2,
        name: '审核管理',
        title: '审核管理',
        path: '/admin/game/review/list',
        icon: 'el-icon-circle-check',
        component: 'game/review/index',
        is_show: true,
      },
      {
        id: 202,
        pid: 2,
        name: '申诉管理',
        title: '申诉管理',
        path: '/admin/game/appeal',
        icon: 'el-icon-warning-outline',
        component: '',
        is_show: true,
        children: [
          {
            id: 2021,
            pid: 202,
            name: '申诉列表',
            title: '申诉列表',
            path: '/admin/game/appeal/list',
            icon: '',
            component: 'game/appeal/list',
            is_show: true,
          },
          {
            id: 2022,
            pid: 202,
            name: '申诉黑名单',
            title: '申诉黑名单',
            path: '/admin/game/appeal/blacklist',
            icon: '',
            component: 'game/appeal/blacklist',
            is_show: true,
          },
        ],
      },
      {
        id: 203,
        pid: 2,
        name: '配置管理',
        title: '配置管理',
        path: '/admin/game/config',
        icon: 'el-icon-setting',
        component: 'game/config',
        is_show: true,
        children: [
          {
            id: 2031,
            pid: 203,
            name: '背包配置',
            title: '背包配置',
            path: '/admin/game/config/backpack',
            icon: '',
            component: 'game/config/backpack',
            is_show: true,
          },
          {
            id: 2032,
            pid: 203,
            name: '娃娃机配置',
            title: '娃娃机配置',
            path: '/admin/game/config/clawMachine',
            icon: '',
            component: 'game/config/clawMachine',
            is_show: true,
          },
          {
            id: 2033,
            pid: 203,
            name: '充值配置',
            title: '充值配置',
            path: '/admin/game/config/recharge',
            icon: '',
            component: 'game/config/recharge',
            is_show: true,
          },
          {
            id: 2034,
            pid: 203,
            name: 'icon配置',
            title: 'icon配置',
            path: '/admin/game/config/icon',
            icon: '',
            component: 'game/config/icon',
            is_show: true,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    pid: 0,
    name: '商品管理',
    title: '商品管理',
    path: '/admin/product',
    icon: 'icon-shangpin',
    component: '',
    is_show: true,
    children: [
      {
        id: 30,
        pid: 2,
        name: '商品列表',
        title: '商品列表',
        path: '/admin/product/product_list_new',
        icon: '',
        component: 'product/product_list_new',
        is_show: true,
      },
    ],
  },
  {
    id: 5,
    pid: 0,
    name: '订单管理',
    title: '订单管理',
    path: '/admin/order',
    icon: 'icon-dingdan',
    component: '',
    is_show: true,
    children: [
      {
        id: 61,
        pid: 5,
        name: '背包管理',
        title: '背包管理',
        path: '/admin/order/bag',
        icon: '',
        component: 'order/bag',
        is_show: true,
      },
      {
        id: 62,
        pid: 5,
        name: '发货管理',
        title: '发货管理',
        path: '/admin/order/shipping',
        icon: '',
        component: 'order/shipping',
        is_show: true,
      },
      {
        id: 63,
        pid: 5,
        name: '背包管理',
        title: '背包管理',
        path: '/admin/order/bag_new',
        icon: '',
        component: 'order/bag_new',
        is_show: true,
      },
    ],
  },
  {
    id: 7,
    pid: 0,
    name: '用户管理',
    title: '用户管理',
    path: '/admin/user',
    icon: 'icon-yonghu',
    component: '',
    is_show: true,
    children: [
      {
        id: 9,
        pid: 7,
        name: '用户列表',
        title: '用户列表',
        path: '/admin/user/list_new',
        icon: '',
        component: 'user/list_new',
        is_show: true,
      },
      {
        id: 10,
        pid: 7,
        name: '用户等级',
        title: '用户等级',
        path: '/admin/user/level_new',
        icon: '',
        component: 'user/level_new',
        is_show: true,
      },
    ],
  },
  {
    id: 12,
    pid: 0,
    name: '营销',
    title: '营销',
    path: '/admin/marketing',
    icon: 'icon-yx',
    component: '',
    is_show: true,
    children: [
      {
        id: 13,
        pid: 12,
        name: '自营积分商城',
        title: '自营积分商城',
        path: '/admin/marketing/store_integral',
        icon: '',
        component: '',
        is_show: true,
        children: [
          {
            id: 14,
            pid: 13,
            name: '积分商品',
            title: '积分商品',
            path: '/admin/marketing/store_integral/list_new',
            icon: '',
            component: 'marketing/storeIntegral/list_new',
            is_show: true,
          },
          {
            id: 15,
            pid: 13,
            name: '积分订单',
            title: '积分订单',
            path: '/admin/marketing/store_integral/order_list',
            icon: '',
            component: 'marketing/storeIntegralOrder',
            is_show: true,
          },
        ],
      },
      {
        id: 16,
        pid: 12,
        name: '兑换口令',
        title: '兑换口令',
        path: '/admin/marketing/exchange_code',
        icon: 'el-icon-tickets',
        component: '',
        is_show: true,
        children: [
          {
            id: 17,
            pid: 16,
            name: '兑换口令列表',
            title: '兑换口令列表',
            path: '/admin/marketing/exchange_code/list',
            icon: '',
            component: 'marketing/exchangeCode',
            is_show: true,
          },
        ],
      },
      {
        id: 18,
        pid: 12,
        name: '充值套餐列表',
        title: '充值套餐列表',
        path: '/admin/marketing/recharge_package',
        icon: '',
        component: 'marketing/rechargePackage',
        is_show: true,
      },
    ],
  },
  {
    id: 25,
    pid: 0,
    name: '财务',
    title: '财务管理',
    path: '/admin/finance',
    icon: 'el-icon-money',
    component: '',
    is_show: true,
    children: [
      {
        id: 2501,
        pid: 25,
        name: '充值记录',
        title: '充值记录',
        path: '/admin/finance/user_recharge/index',
        icon: '',
        component: 'finance/financialRecords/recharge',
        is_show: true,
      },
      {
        id: 2508,
        pid: 25,
        name: '退款记录',
        title: '退款记录',
        path: '/admin/finance/finance/refundRecord',
        icon: '',
        component: 'finance/financialRecords/refundRecord',
        is_show: true,
      },
    ],
  },
  {
    id: 19,
    pid: 0,
    name: '设置',
    title: '设置',
    path: '/admin/setting',
    icon: 'el-icon-setting',
    component: '',
    is_show: true,
    children: [
      {
        id: 1903,
        pid: 19,
        name: '网站设置',
        title: '网站设置',
        path: '/admin/setting/copyright',
        icon: 'el-icon-monitor',
        component: '',
        is_show: true,
        children: [
          {
            id: 19032,
            pid: 1903,
            name: '版权设置',
            title: '版权设置',
            path: '/admin/setting/copyright',
            icon: '',
            component: 'setting/copyright',
            is_show: true,
          },
        ],
      },
      {
        id: 1901,
        pid: 19,
        name: '协议管理',
        title: '协议管理',
        path: '/admin/setting/agreement',
        icon: '',
        component: 'setting/agreement',
        is_show: true,
      },
      {
        id: 1902,
        pid: 19,
        name: '协议类型管理',
        title: '协议类型管理',
        path: '/admin/setting/agreement_category/index',
        icon: '',
        component: 'setting/agreementCategory',
        is_show: true,
      },
    ],
  },
  {
    id: 26,
    pid: 0,
    name: '商户管理',
    title: '商户管理',
    path: '/admin/merchant',
    icon: 'el-icon-shop',
    component: '',
    is_show: true,
    children: [
      {
        id: 2601,
        pid: 26,
        name: '参数配置',
        title: '参数配置',
        path: '/admin/merchant/param_config',
        icon: '',
        component: 'merchant/paramConfig',
        is_show: true,
      },
    ],
  },
];

export default {
  name: 'app',
  components: { Setings, Upgrade },
  provide() {
    return {
      reload: this.reload,
    };
  },
  data() {
    return {
      isVersion: false,
    };
  },
  methods: {
    ...mapMutations('media', ['setDevice']),
    handleWindowResize() {
      this.handleMatchMedia();
    },
    handleMatchMedia() {
      const matchMedia = window.matchMedia;

      if (matchMedia('(max-width: 600px)').matches) {
        var deviceWidth = document.documentElement.clientWidth || window.innerWidth;
        let css = 'calc(100vw/7.5)';
        document.documentElement.style.fontSize = css;
        this.setDevice('Mobile');
      } else if (matchMedia('(max-width: 992px)').matches) {
        this.setDevice('Tablet');
      } else {
        this.setDevice('Desktop');
      }
    },
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => {
        this.isRouterAlive = true;
      });
    },
    // 布局配置弹窗打开
    openSetingsDrawer() {
      this.bus.$on('openSetingsDrawer', () => {
        this.$refs.setingsRef.openDrawer();
      });
    },
    // 获取缓存中的布局配置
    getLayoutThemeConfig() {
      if (Local.get('themeConfigPrev')) {
        this.$store.dispatch('themeConfig/setThemeConfig', Local.get('themeConfigPrev'));
        document.documentElement.style.cssText = Local.get('themeConfigStyle');
      } else {
        Local.set('themeConfigPrev', this.$store.state.themeConfig.themeConfig);
      }
    },
    getVersion() {
      this.isVersion = false;
      if (this.$route.path !== `${setting.routePre}/login` && this.$route.path !== '/') {
        if ((Local.get('version') && Local.get('version') !== config.version) || !Local.get('version'))
          this.isVersion = true;
      }
    },
    initMenuData() {
      this.$store.dispatch('routesList/setRoutesList', mockMenus);
      this.$store.commit('menus/getmenusNav', mockMenus);
      // 触发菜单刷新事件，通知侧边栏更新菜单列表
      this.$nextTick(() => {
        this.bus.$emit('routesListChange');
      });
    },
  },
  mounted() {
    this.handleMatchMedia();
    this.openSetingsDrawer();
    this.getLayoutThemeConfig();
    this.initMenuData();
    this.$nextTick((e) => {
      // this.getVersion();
    });
  },
  destroyed() {
    this.bus.$off('openSetingsDrawer');
  },
};
</script>
<style type="text/css">
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  font-family: PingFang SC, Arial, Microsoft YaHei, sans-serif;
}
.right-box .ivu-color-picker .ivu-select-dropdown {
  position: absolute;
  // width: 300px !important;
  left: -73px !important;
}
</style>


