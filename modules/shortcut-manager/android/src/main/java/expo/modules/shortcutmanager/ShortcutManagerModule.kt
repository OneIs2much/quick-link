package expo.modules.shortcutmanager

import android.content.Intent
import android.net.Uri
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.graphics.drawable.IconCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * ShortcutManagerModule
 *
 * 封装 Android ShortcutManagerCompat.requestPinShortcut，
 * 允许 JS 层请求将链接固定到设备桌面（Pinned Shortcut）。
 *
 * 支持平台：Android 8.0+（API 26+）
 * 低于 Android 8.0 的设备 isRequestPinShortcutSupported 返回 false，
 * JS 层应据此向用户说明不支持。
 */
class ShortcutManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ShortcutManager")

    /**
     * 请求将链接固定到桌面，弹出系统确认对话框。
     *
     * @param id       链接唯一标识，作为 shortcut id（同一 id 会覆盖旧快捷方式）
     * @param name     快捷方式显示名称（短标签 ≤ 10 字符，长标签无限制）
     * @param linkId   用于构造 deep link 的链接 id（quicklink://open/{linkId}）
     * @return         true 表示系统支持且已发起请求；false 表示设备不支持
     */
    AsyncFunction("requestPinShortcut") { id: String, name: String, linkId: String ->
      val context = appContext.reactContext
        ?: return@AsyncFunction false

      if (!ShortcutManagerCompat.isRequestPinShortcutSupported(context)) {
        return@AsyncFunction false
      }

      // deep link intent，由 app.json 中的 intentFilters 处理
      val intent = Intent(Intent.ACTION_VIEW, Uri.parse("quicklink://open/$linkId")).apply {
        setPackage(context.packageName)
        // FLAG_ACTIVITY_NEW_TASK 确保从桌面点击时能正确启动
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      // 短标签最多 10 字符，超出截断
      val shortLabel = if (name.length > 10) name.substring(0, 10) else name

      val shortcut = ShortcutInfoCompat.Builder(context, id)
        .setShortLabel(shortLabel)
        .setLongLabel(name)
        .setIntent(intent)
        .setIcon(IconCompat.createWithResource(context, android.R.mipmap.sym_def_app_icon))
        .build()

      ShortcutManagerCompat.requestPinShortcut(context, shortcut, null)
      true
    }

    /**
     * 检查当前设备是否支持 Pinned Shortcut（Android 8.0+）。
     * 可在 UI 层用于决定是否显示"添加到桌面"按钮。
     *
     * @return true 表示支持
     */
    Function("isSupported") {
      val context = appContext.reactContext ?: return@Function false
      ShortcutManagerCompat.isRequestPinShortcutSupported(context)
    }
  }
}
