# Quick Link - 移动端快捷链接管理工具

Quick Link 是一款移动端桌面应用，让你可以创建自定义的快捷方式卡片，一键跳转到常用网页。支持 Android 平台，后续将陆续支持 iOS 和鸿蒙系统。

## 功能特性

- **快捷链接创建**：自定义名称、图标（Emoji / 图标 / 文字）、URL，一键创建精美快捷卡片
- **链接管理**：支持对已有链接进行增删改查操作
- **桌面快捷方式**：可将链接添加到手机桌面，像原生 App 一样快速访问
- **浏览器选择**：支持为每个链接单独选择打开浏览器（Chrome、Edge、Firefox、Opera 等）
- **密码保护**：为敏感链接设置访问密码，保护隐私安全
- **美观 UI**：简洁现代的界面设计，流畅的交互动画
- **使用教程**：首次启动有引导教程，帮助用户快速上手
- **跨平台设计**：基于 React Native (Expo) 构建，技术栈天然支持多平台

## 技术栈

| 技术 | 说明 |
|------|------|
| [React Native](https://reactnative.dev/) | 跨平台移动应用框架 |
| [Expo SDK 55](https://docs.expo.dev/) | React Native 工具链和服务平台 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript 超集 |
| [React Navigation](https://reactnavigation.org/) | 导航和路由管理 |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | 本地持久化存储 |
| [Expo Intent Launcher](https://docs.expo.dev/versions/latest/sdk/intent-launcher/) | Android Intent 调用（浏览器选择） |
| [Expo Web Browser](https://docs.expo.dev/versions/latest/sdk/webbrowser/) | 浏览器打开链接 |
| [Ionicons](https://ionic.io/ionicons) | 图标库 |

## 跨平台兼容性

项目基于 Expo SDK 55 构建，天然支持以下平台：

| 平台 | 支持状态 | 说明 |
|------|----------|------|
| Android | ✅ 完全支持 | 当前主要目标平台 |
| iOS | 🔜 支持 | Expo 构建即支持，待测试适配 |
| 鸿蒙 (HarmonyOS) | 🔜 计划中 | 可通过 Expo 的 Web 目标或社区 RN-OH 方案适配 |
| Web | ✅ 支持 | 可用于开发调试和 PWA 部署 |

## 项目结构

```
quick-link/
├── App.tsx                          # 应用入口
├── index.ts                         # 注册入口
├── app.json                         # Expo 配置
├── eas.json                         # EAS Build 配置
├── tsconfig.json                    # TypeScript 配置
├── assets/                          # 应用图标和资源
└── src/
    ├── components/                  # 可复用组件
    │   ├── BrowserPicker.tsx        # 浏览器选择器
    │   ├── EmptyState.tsx           # 空状态组件
    │   ├── Header.tsx               # 头部导航栏
    │   ├── LinkCard.tsx             # 链接卡片
    │   ├── LinkForm.tsx             # 链接表单
    │   └── PasswordDialog.tsx       # 密码验证对话框
    ├── constants/                   # 常量配置
    │   ├── browsers.ts              # 浏览器列表和图标
    │   └── theme.ts                 # 主题颜色和样式
    ├── contexts/                    # React Context
    │   ├── LinkContext.tsx          # 链接数据管理
    │   └── SettingsContext.tsx      # 设置数据管理
    ├── screens/                     # 页面
    │   ├── AddEditLinkScreen.tsx    # 添加/编辑链接
    │   ├── HomeScreen.tsx           # 主页
    │   ├── SettingsScreen.tsx       # 设置
    │   └── TutorialScreen.tsx       # 使用教程
    ├── services/                    # 服务层
    │   ├── browserService.ts        # 浏览器打开服务
    │   ├── shortcutService.ts       # 快捷方式服务
    │   └── storage.ts              # 数据存储服务
    ├── types/                       # TypeScript 类型
    │   └── index.ts
    └── utils/                       # 工具函数
        ├── haptics.ts              # 触觉反馈
        └── validators.ts           # 验证工具
```

## 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9
- Expo CLI
- Android Studio（用于 Android 模拟器/构建）
- Xcode（用于 iOS 开发，仅 macOS）

### 安装和运行

```bash
# 1. 克隆项目
git clone <repository-url>
cd quick-link

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npx expo start

# 4. 在模拟器或真机上运行
# Android
npx expo start --android

# iOS
npx expo start --ios

# Web
npx expo start --web
```

### 使用 Expo Go 快速体验

1. 在手机上下载 [Expo Go](https://expo.dev/client) 应用
2. 运行 `npx expo start` 启动开发服务器
3. 用 Expo Go 扫描终端中的二维码即可运行

### 构建 APK

使用 EAS Build 云端构建 Android APK：

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 构建 Android APK（预览版）
eas build -p android --profile preview

# 构建 Android App Bundle（正式版）
eas build -p android --profile production
```

### 本地构建

```bash
# 生成原生项目
npx expo prebuild

# Android 构建
cd android
./gradlew assembleRelease

# iOS 构建（仅 macOS）
cd ios
pod install
xcodebuild -workspace quicklink.xcworkspace -scheme quicklink
```

### 代码质量

```bash
# TypeScript 类型检查
npx tsc --noEmit

# 代码格式化（如配置了 Prettier）
npx prettier --check .
```

## 使用说明

### 创建快捷链接

1. 打开应用，点击右下角 **+** 按钮
2. 选择图标类型（Emoji / 图标 / 文字）
3. 输入链接名称和 URL
4. （可选）选择指定浏览器
5. （可选）设置访问密码
6. 点击「创建链接」

### 管理链接

- **点击**链接卡片：打开对应网页
- **长按**链接卡片：弹出菜单，可以编辑、添加到桌面、删除

### 添加到桌面

长按链接卡片 → 选择「添加到桌面」→ 按照提示操作即可在手机桌面创建快捷方式。

### 浏览器选择

在创建或编辑链接时，可以点击「选择浏览器」为每个链接单独设置打开方式。

## 安全性

- 所有数据存储在设备本地，不经过任何云端服务
- 密码使用本地验证，不会上传到任何服务器
- 链接 URL 仅在你点击时才会传递到浏览器
- 应用不需要网络权限（仅打开浏览器时需要）

## 路线图

- [x] 链接创建与管理（CRUD）
- [x] 自定义图标（Emoji、Ionicons、文字）
- [x] 浏览器选择
- [x] 密码保护
- [x] 使用教程
- [x] 美观的 UI 设计
- [ ] iOS 完整适配测试
- [ ] 鸿蒙系统适配
- [ ] 桌面小组件 (Widget)
- [ ] 链接分类/分组
- [ ] 数据导入/导出
- [ ] iCloud/Google Drive 同步
- [ ] 暗黑模式

## License

MIT
