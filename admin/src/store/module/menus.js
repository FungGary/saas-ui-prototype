// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

/**
 * 布局菜单配置
 * */
import { menusApi } from '@/api/account';
import { initLocalMenus, findMenuItem } from '@/config/menuInject';
import localMenusConfig from '@/config/localMenus';

function getMenusName() {
  let storage = window.localStorage;
  let menuList = JSON.parse(storage.getItem('menuList'));
  
  console.log('[菜单调试] localStorage中的menuList:', menuList);
  
  if (typeof menuList !== 'object' || menuList === null || menuList.length === 0) {
    // 如果本地存储中没有菜单，使用本地默认菜单
    console.log('[菜单调试] localStorage中无菜单，使用默认菜单');
    menuList = localMenusConfig.getDefaultMenus ? localMenusConfig.getDefaultMenus() : localMenusConfig.localMenus;
  }
  // 合并本地菜单配置，确保新添加的菜单能够显示
  const result = initLocalMenus(menuList);
  // 将更新后的菜单保存回localStorage
  storage.setItem('menuList', JSON.stringify(result));
  console.log('[菜单调试] 合并后的菜单:', result);
  
  // 检查背包管理新版是否在菜单中
  const bagNewMenu = findMenuItem(result, menu => menu.path === '/admin/order/bag_new');
  console.log('[菜单调试] 背包管理新版菜单:', bagNewMenu);
  
  return result;
}
export default {
  namespaced: true,
  state: {
    menusName: getMenusName(),
    openMenus: [],
    childMenuList: [],
    oneLvMenus: [],
    oneLvRoutes: [],
  },
  mutations: {
    getmenusNav(state, menuList) {
      // 注入本地菜单（包含充值套餐列表）
      state.menusName = initLocalMenus(menuList);
      // 同时更新 localStorage
      window.localStorage.setItem('menuList', JSON.stringify(state.menusName));
    },
    // getopenMenus (state, openList) {
    //   state.openMenus = openList
    // }
    setopenMenus(state, openList) {
      state.openMenus = openList;
    },
    setOneLvMenus(state, oneLvMenus) {
      state.oneLvMenus = oneLvMenus;
    },
    setOneLvRoute(state, oneLvMenus) {
      state.oneLvRoutes = oneLvMenus;
    },
    childMenuList(state, list) {
      state.childMenuList = list;
    },
  },
  actions: {
    getMenusNavList({ commit }) {
      return new Promise((resolve, reject) => {
        menusApi()
          .then(async (res) => {
            resolve(res);
            commit('getmenusNav', res.data.menus);
          })
          .catch((res) => {
            reject(res);
          });
      });
    },
  },
};

// 强制刷新菜单（在应用启动时调用）
export function forceRefreshMenus() {
  console.log('[菜单调试] 强制刷新菜单...');
  // 清除缓存
  window.localStorage.removeItem('menuList');
  // 重新获取菜单
  const defaultMenus = localMenusConfig.getDefaultMenus ? localMenusConfig.getDefaultMenus() : localMenusConfig.localMenus;
  const processedMenus = initLocalMenus(defaultMenus);
  window.localStorage.setItem('menuList', JSON.stringify(processedMenus));
  console.log('[菜单调试] 强制刷新后的菜单:', processedMenus);
  return processedMenus;
}
