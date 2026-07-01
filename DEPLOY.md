# GitHub Pages 部署说明

## 自动部署配置

本项目已配置 GitHub Actions 自动部署到 GitHub Pages。

### 启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 **Settings**（设置）
2. 左侧菜单找到 **Pages**
3. 在 **Source** 部分：
   - 选择 **Deploy from a branch**
   - Branch 选择 **gh-pages**，文件夹选择 **/ (root)**
   - 点击 **Save**

### 手动触发部署

启用 GitHub Pages 后，每次推送到 master 分支都会自动触发构建和部署。

如需手动触发：
1. 进入仓库的 **Actions** 页面
2. 选择 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow**
4. 选择 master 分支并运行

### 访问地址

部署完成后，网站将可通过以下地址访问：
```
https://FungGary.github.io/saas-ui-prototype/
```

请将 `FungGary` 替换为你的 GitHub 用户名。

## 构建说明

- 构建命令：`npm run build`
- 构建产物目录：`admin/dist_prod`
- 部署分支：`gh-pages`
