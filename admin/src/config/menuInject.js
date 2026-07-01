/**
 * 菜单注入工具
 * 用于在运行时将本地菜单项注入到后端菜单中
 */

import localMenusConfig from './localMenus';
const ONE_LEVEL_MENU_ICON_MAP = {
  home: 's-home',
  index: 's-home',
  user: 'user',
  product: 'goods',
  order: 's-order',
  marketing: 'present',
  finance: 'money',
  setting: 'setting',
  system: 's-tools',
  statistic: 'data-analysis',
  app: 'mobile-phone',
  agent: 's-custom',
  cms: 'document',
  division: 'connection',
  game: 'trophy',
  crud: 'menu',
  echarts: 'pie-chart',
};

function applyOneLevelMenuIcons(menus) {
  if (!Array.isArray(menus)) return menus;

  menus.forEach((menu) => {
    if (menu && !menu.icon) {
      const pathKey = String(menu.path || '')
        .split('?')[0]
        .replace(/\/$/, '')
        .split('/')
        .filter(Boolean)
        .pop();
      menu.icon = ONE_LEVEL_MENU_ICON_MAP[pathKey] || 'menu';
    }
  });

  return menus;
}

/**
 * 递归查找菜单项
 * @param {Array} menus 菜单列表
 * @param {Function} predicate 查找条件
 * @returns {Object|null} 找到的菜单项
 */
export function findMenuItem(menus, predicate) {
  for (const menu of menus) {
    if (predicate(menu)) {
      return menu;
    }
    if (menu.children && menu.children.length) {
      const found = findMenuItem(menu.children, predicate);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 递归查找菜单项的父级
 * @param {Array} menus 菜单列表
 * @param {String} path 要查找的菜单路径
 * @returns {Object|null} 父级菜单项
 */
export function findMenuParent(menus, path) {
  for (const menu of menus) {
    if (menu.children && menu.children.length) {
      for (const child of menu.children) {
        if (child.path === path || (child.children && child.children.some(c => c.path === path))) {
          return menu;
        }
      }
      const found = findMenuParent(menu.children, path);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 递归向菜单中添加子菜单
 * @param {Array} menus 菜单列表
 * @param {String} parentPath 父级菜单路径
 * @param {Object} childMenu 子菜单
 */
export function addChildMenu(menus, parentPath, childMenu) {
  for (const menu of menus) {
    if (menu.path === parentPath) {
      if (!menu.children) {
        menu.children = [];
      }
      // 检查是否已存在
      const exists = menu.children.some(c => c.path === childMenu.path);
      if (!exists) {
        menu.children.push(childMenu);
      }
      return true;
    }
    if (menu.children && menu.children.length) {
      if (addChildMenu(menu.children, parentPath, childMenu)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 注入充值套餐列表到营销二级菜单
 * @param {Array} menus 菜单列表
 */
export function injectRechargePackageMenu(menus) {
  const rechargePackageMenu = {
    path: '/admin/marketing/recharge_package',
    name: '充值套餐列表',
    title: '充值套餐列表',
    pid: 0,
    is_show: 1,
    icon: 'el-icon-coin',
  };

  // 查找营销菜单（一级菜单）
  const marketingMenu = findMenuItem(menus, menu => 
    menu.name === '营销' || 
    menu.title === '营销' ||
    menu.path === '/admin/marketing'
  );

  if (marketingMenu) {
    // 如果营销菜单存在，向其添加二级子菜单
    if (!marketingMenu.children) {
      marketingMenu.children = [];
    }
    
    // 检查是否已存在充值套餐列表
    const exists = marketingMenu.children.some(
      child => child.path === '/admin/marketing/recharge_package'
    );
    
    if (!exists) {
      rechargePackageMenu.pid = marketingMenu.id || 0;
      marketingMenu.children.push(rechargePackageMenu);
    }
  }

  return menus;
}

/**
 * 深度更新菜单属性
 * @param {Array} menus 要更新的菜单列表
 * @param {Array} localMenus 本地菜单配置
 */
function deepUpdateMenus(menus, localMenus) {
  for (const localMenu of localMenus) {
    // 查找匹配的菜单
    let targetIndex = menus.findIndex(m => m.path === localMenu.path);

    if (targetIndex === -1 && !localMenu.path) {
      targetIndex = menus.findIndex(m =>
        (m.name && localMenu.name && m.name === localMenu.name) ||
        (m.title && localMenu.title && m.title === localMenu.title)
      );
    }

    if (targetIndex !== -1) {
      // 菜单已存在，更新属性
      const target = menus[targetIndex];
      const existingChildren = target.children;
      Object.assign(target, localMenu);
      target.children = existingChildren;

      // 递归更新子菜单
      if (localMenu.children && localMenu.children.length && target.children && target.children.length) {
        deepUpdateMenus(target.children, localMenu.children);
      }
    } else {
      // 菜单不存在，添加
      menus.push(JSON.parse(JSON.stringify(localMenu)));
    }
  }
}

/**
 * 初始化本地菜单
 * @param {Array} menus 原始菜单列表
 * @returns {Array} 处理后的菜单列表
 */
export function initLocalMenus(menus) {
  // 如果没有启用本地菜单配置，直接返回原始菜单
  if (!localMenusConfig.enabled) {
    return menus;
  }

  // 深拷贝原始菜单
  let processedMenus = JSON.parse(JSON.stringify(menus));

  // 如果原始菜单为空或无效，使用本地菜单
  if (!processedMenus || processedMenus.length === 0) {
    return applyOneLevelMenuIcons(JSON.parse(JSON.stringify(localMenusConfig.localMenus)));
  }

  // 深度更新菜单属性
  deepUpdateMenus(processedMenus, localMenusConfig.localMenus);

  // 注入充值套餐列表
  processedMenus = injectRechargePackageMenu(processedMenus);
  processedMenus = applyOneLevelMenuIcons(processedMenus);

  // 过滤掉隐藏菜单和旧版背包入口（递归处理所有层级）
  function isLegacyBagMenu(menu) {
    return menu && (menu.path === '/admin/order/bag' || menu.path === 'bag');
  }

  function filterHiddenMenus(menus) {
    return menus.filter(menu => {
      if (isLegacyBagMenu(menu) || menu.hidden === true || menu.is_show === 0 || menu.isShow === false || (menu.meta && menu.meta.isHide)) {
        return false;
      }
      if (menu.children && menu.children.length) {
        menu.children = filterHiddenMenus(menu.children);
      }
      return true;
    });
  }
  processedMenus = filterHiddenMenus(processedMenus);

  return processedMenus;
}

/**
 * 获取本地存储的菜单并注入本地菜单
 * @returns {Array} 处理后的菜单列表
 */
export function getLocalStoredMenus() {
  try {
    const storedMenus = JSON.parse(localStorage.getItem('menuList') || '[]');
    return initLocalMenus(storedMenus);
  } catch (e) {
    console.error('Failed to parse stored menus:', e);
    return [];
  }
}

/**
 * 保存菜单到本地存储
 * @param {Array} menus 菜单列表
 */
export function saveMenusToStorage(menus) {
  const processedMenus = initLocalMenus(menus);
  localStorage.setItem('menuList', JSON.stringify(processedMenus));
  return processedMenus;
}
