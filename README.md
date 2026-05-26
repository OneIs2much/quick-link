# Quick Link

Android 端快捷链接管理应用。将常用网址保存为卡片，一键跳转，支持固定为桌面独立图标。

## 功能

- **链接管理**：增删改查，支持分类筛选
- **图标**：自动抓取站点 favicon，或上传自定义图片
- **桌面快捷方式**：将链接固定到 Android 桌面（Android 8.0+）
- **浏览器选择**：全局默认 + 每条链接单独指定
- **密码保护**：为敏感链接设置访问密码
- **数据备份**：JSON 格式导入/导出
- **暗黑模式**：跟随系统或手动切换

## 技术栈

React Native 0.83.6 · Expo SDK 55 · TypeScript · React Navigation 7 · AsyncStorage 1.24

本地 native module（Kotlin）实现 Android Pinned Shortcut，不兼容 Expo Go，需要 development build。

## 开发

```bash
npm install

# 首次运行，或修改 native module 后
npx expo prebuild --platform android

# 编译并运行
npx expo run:android
```

类型检查：`npx tsc --noEmit`

## 使用

- **点击**卡片：打开链接（有密码时先验证）
- **长按**卡片：编辑 / 添加到桌面 / 删除
- **添加到桌面**：系统弹出确认对话框，确认后桌面生成独立图标，点击通过 `quicklink://open/{id}` 直接打开
- **数据备份**：设置页 → 数据管理

## 下阶段计划

- **桌面图标**：目前使用 App 默认图标（Android 机器人），计划改为使用链接自身的图标
- **数据管理**：目前通过文件导入/导出，计划改为直接编辑/粘贴 JSON，操作更轻量
- **打开方式**：目前浏览器选项为预设列表，计划改为从用户已安装的应用中选择，不再限定浏览器
- **教程**：更新使用教程内容

## License

MIT
