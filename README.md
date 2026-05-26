# Quick Link

Android 端快捷链接管理应用。创建自定义链接卡片，一键跳转常用网页，支持将链接固定为桌面独立图标。

## 功能

- **快捷链接管理**：自定义名称、图标（Emoji / Ionicons / 文字）、URL，增删改查
- **桌面固定图标**：将链接添加到 Android 桌面，生成独立快捷方式（Android 8.0+）
- **浏览器选择**：全局默认浏览器 + 每条链接单独指定（Chrome、Edge、Firefox、Opera 等）
- **密码保护**：为敏感链接设置访问密码
- **链接分类**：自定义分类标签，首页按分类筛选
- **数据导入/导出**：JSON 格式备份与恢复
- **暗黑模式**：跟随系统 / 手动切换浅色 / 深色
- **触觉反馈**：Android & iOS 均支持
- **ErrorBoundary**：组件崩溃时显示错误界面，不白屏

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React Native | 0.83.6 | 跨平台移动应用框架 |
| Expo SDK | 55 | 工具链和服务平台 |
| TypeScript | 5.9 | 类型安全 |
| React Navigation | 7 | 导航和路由 |
| AsyncStorage | 1.24 | 本地持久化存储 |
| expo-haptics | 55 | 触觉反馈（Android & iOS） |
| expo-sharing | 55 | 数据导出分享 |
| expo-document-picker | 55 | 数据导入文件选择 |
| expo-file-system | 55 | 文件读写 |
| Expo Modules API | — | 本地 native module（Kotlin） |

## 项目结构

```
quick-link/
├── App.tsx                          # 应用入口，Provider 组合、deep link 监听
├── app.json                         # Expo 配置（deep link scheme: quicklink://）
├── modules/
│   └── shortcut-manager/            # 本地 native module（Android Pinned Shortcut）
│       ├── package.json
│       ├── expo-module.config.json
│       ├── index.ts                 # JS 导出层
│       └── android/
│           ├── build.gradle
│           └── src/main/java/expo/modules/shortcutmanager/
│               └── ShortcutManagerModule.kt
└── src/
    ├── components/
    │   ├── BrowserPicker.tsx        # 浏览器选择底部弹窗
    │   ├── EmptyState.tsx           # 空状态占位
    │   ├── ErrorBoundary.tsx        # 错误边界，防白屏
    │   ├── Header.tsx               # 顶部导航栏
    │   ├── LinkCard.tsx             # 链接卡片（长按菜单）
    │   ├── LinkForm.tsx             # 链接创建/编辑表单
    │   └── PasswordDialog.tsx       # 密码验证对话框
    ├── constants/
    │   ├── browsers.ts              # 支持的浏览器列表
    │   └── theme.ts                 # 浅色/深色双主题 token
    ├── contexts/
    │   ├── LinkContext.tsx          # 链接数据状态管理
    │   ├── SettingsContext.tsx      # 设置状态管理
    │   └── ThemeContext.tsx         # 主题 Context（颜色 + 切换）
    ├── hooks/
    │   ├── useHaptics.ts            # 触觉反馈 hook
    │   └── useToast.ts              # 统一 Alert 提示 hook
    ├── screens/
    │   ├── AddEditLinkScreen.tsx    # 添加/编辑链接页
    │   ├── HomeScreen.tsx           # 主页（分类筛选 + 链接网格）
    │   ├── SettingsScreen.tsx       # 设置页
    │   └── TutorialScreen.tsx       # 使用教程
    ├── services/
    │   ├── browserService.ts        # 浏览器打开链接
    │   ├── shortcutService.ts       # 桌面快捷方式（调用 native module）
    │   └── storage.ts               # AsyncStorage CRUD + 导入/导出
    ├── types/
    │   └── index.ts                 # 全局类型（QuickLink、AppSettings、StorageError 等）
    └── utils/
        ├── haptics.ts               # 重导出 useHaptics（向后兼容）
        └── validators.ts            # URL 等输入验证
```

## 开发指南

### 环境要求

- Node.js >= 18
- Android Studio（模拟器 / 真机调试）
- Xcode（iOS，仅 macOS）

### 安装

```bash
git clone <repository-url>
cd quick-link
npm install
```

### 运行

项目包含本地 native module（`modules/shortcut-manager/`），**不支持 Expo Go**，需要使用 development build。

```bash
# 第一次运行，或修改了 native module 后，先生成原生工程
npx expo prebuild --platform android

# 编译并在 Android 模拟器/真机上运行
npx expo run:android
```

> **为什么不能用 Expo Go？**
> Expo Go 是预编译的沙盒应用，不包含自定义 native module。
> `modules/shortcut-manager/` 中的 Kotlin 代码需要编译进 APK 才能运行。
> 在未 prebuild 的环境中，"添加到桌面"选项仍会显示，但点击后会提示不支持，其余功能不受影响。

> **修改了 native module 后需要重新 prebuild。** 只修改 JS/TS 代码时无需重新 prebuild，Metro 热更新即可生效。

### 类型检查

```bash
npx tsc --noEmit
```

### 构建发布包

```bash
# 安装 EAS CLI
npm install -g eas-cli
eas login

# 预览版 APK
eas build -p android --profile preview

# 正式版 AAB
eas build -p android --profile production
```

## 使用说明

### 创建链接

1. 点击右下角 **+** 按钮
2. 选择图标类型，输入名称和 URL
3. 可选：指定浏览器、设置分类、设置访问密码
4. 点击「创建链接」

### 管理链接

- **点击**卡片：打开链接（有密码时先验证）
- **长按**卡片：编辑 / 添加到桌面 / 删除

### 添加到桌面

长按链接卡片 → 「添加到桌面」→ 系统弹出确认对话框 → 确认后桌面生成独立图标。

点击桌面图标会通过 `quicklink://open/{id}` deep link 直接打开对应链接。

> 需要 Android 8.0+，且设备启动器支持 Pinned Shortcut。

### 数据备份

设置页 → 数据管理 → 「导出数据」生成 JSON 文件，「导入数据」从文件恢复（按 id 合并，导入覆盖本地同 id 数据）。

## 平台支持

| 平台 | 状态 | 说明 |
|------|------|------|
| Android | ✅ 主要目标 | 完整功能，含桌面固定图标 |
| iOS | 🔜 待适配 | 基础功能可用，桌面快捷方式不支持 |
| Web | 🔜 仅调试 | 部分 native 功能不可用 |

## License

MIT
