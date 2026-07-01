// 清除菜单缓存并验证
console.log('=== 清除菜单缓存 ===');

// 清除 menuList
localStorage.removeItem('menuList');
console.log('✓ 已清除 localStorage 中的 menuList');

// 验证 localMenus.js 配置
console.log('\n=== 验证本地菜单配置 ===');
console.log('请检查 admin/src/config/localMenus.js 中是否包含以下配置：');
console.log({
  path: '/admin/order/bag_new',
  name: '背包管理新版',
  title: '背包管理新版',
  icon: 'el-icon-backpack',
  pid: 1,
  is_show: 1,
});

// 重新加载页面
console.log('\n=== 重新加载页面 ===');
setTimeout(() => {
  location.reload();
}, 1000);
