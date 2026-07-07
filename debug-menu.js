/**
 * 菜单调试工具
 * 
 * 在浏览器控制台（F12）中复制粘贴以下命令来执行调试：
 * 
 * // 1. 清除菜单缓存
 * debugMenu.clearCache()
 * 
 * // 2. 查看当前菜单配置
 * debugMenu.showCurrentMenus()
 * 
 * // 3. 检查背包管理新版是否在菜单中
 * debugMenu.checkBagNewMenu()
 * 
 * // 4. 重新加载页面
 * debugMenu.reload()
 */

window.debugMenu = {
  // 清除菜单缓存
  clearCache() {
    console.log('[调试] 清除菜单缓存...');
    localStorage.removeItem('menuList');
    console.log('✅ 已清除 localStorage 中的 menuList');
    return '缓存已清除，请执行 debugMenu.reload() 重新加载页面';
  },

  // 显示当前菜单
  showCurrentMenus() {
    console.log('[调试] 当前菜单配置:');
    const menus = JSON.parse(localStorage.getItem('menuList') || '[]');
    console.log(menus);
    
    // 查找订单管理
    const orderMenu = menus.find(m => 
      m.path === '/admin/order' || 
      m.name === '订单管理' || 
      m.title === '订单管理'
    );
    
    if (orderMenu) {
      console.log('[调试] 订单管理菜单:', orderMenu);
      console.log('[调试] 订单管理子菜单:', orderMenu.children);
    } else {
      console.warn('[调试] 未找到订单管理菜单');
    }
    
    return menus;
  },

  // 检查背包管理新版菜单
  checkBagNewMenu() {
    console.log('[调试] 检查背包管理新版菜单...');
    const menus = JSON.parse(localStorage.getItem('menuList') || '[]');
    
    // 查找背包管理新版
    let found = false;
    
    for (const menu of menus) {
      if (menu.children) {
        const bagNew = menu.children.find(c => 
          c.path === '/admin/order/bag_new' || 
          c.name === '背包管理新版' ||
          c.title === '背包管理新版'
        );
        if (bagNew) {
          console.log('✅ 找到背包管理新版菜单:', bagNew);
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      console.warn('❌ 未找到背包管理新版菜单');
      console.log('[调试] 请确保 admin/src/config/localMenus.js 中已添加此菜单项');
    }
    
    return found;
  },

  // 重新加载页面
  reload() {
    console.log('[调试] 重新加载页面...');
    setTimeout(() => {
      location.reload();
    }, 500);
  },

  // 完整调试流程
  debug() {
    console.log('=== 开始菜单调试 ===');
    this.clearCache();
    setTimeout(() => {
      this.showCurrentMenus();
      setTimeout(() => {
        this.checkBagNewMenu();
        console.log('=== 调试完成，现在重新加载页面 ===');
        this.reload();
      }, 1000);
    }, 500);
  }
};

console.log('菜单调试工具已加载！');
console.log('执行 debugMenu.debug() 开始完整调试');
console.log('或分别执行：');
console.log('  debugMenu.clearCache() - 清除缓存');
console.log('  debugMenu.showCurrentMenus() - 显示当前菜单');
console.log('  debugMenu.checkBagNewMenu() - 检查背包管理新版菜单');
