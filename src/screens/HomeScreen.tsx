import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLinks } from '../contexts/LinkContext';
import { useTheme } from '../contexts/ThemeContext';
import { useHaptics } from '../hooks/useHaptics';
import { useToast } from '../hooks/useToast';
import { LinkCard } from '../components/LinkCard';
import { EmptyState } from '../components/EmptyState';
import { PasswordDialog } from '../components/PasswordDialog';
import { openLinkInBrowser } from '../services/browserService';
import { addLinkToHomeScreen, canAddToHomeScreen } from '../services/shortcutService';
import { QuickLink } from '../types';

interface Props {
  navigation: any;
  route: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = SPACING.lg;
const COLUMN_GAP = SPACING.md;
// 三列均分：总宽 - 两侧 padding - 两个列间距，再除以 3
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - COLUMN_GAP * 2) / 3;

const ALL_CATEGORY = '__all__';

export function HomeScreen({ navigation, route }: Props) {
  const { links, loading, deleteLink, verifyPassword, getCategories } = useLinks();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { medium } = useHaptics();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<QuickLink | null>(null);
  const [menuVisible, setMenuVisible] = useState<QuickLink | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);

  // 处理来自 deep link 的 openLinkId（桌面快捷方式点击）
  useEffect(() => {
    const openLinkId = route.params?.openLinkId as string | undefined;
    if (!openLinkId) return;
    const link = links.find(l => l.id === openLinkId);
    if (!link) return;
    // 清除参数，防止重复触发
    navigation.setParams({ openLinkId: undefined });
    handleLinkPress(link);
  }, [route.params?.openLinkId, links]);

  const categories = getCategories();
  const hasCategories = categories.length > 0;

  const filteredLinks =
    selectedCategory === ALL_CATEGORY
      ? links
      : links.filter(l => l.category === selectedCategory);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  }, []);

  const handleLinkPress = (link: QuickLink) => {
    if (link.password) {
      setPasswordDialog(link);
    } else {
      openLinkInBrowser(link.url, link.browserPackage);
    }
  };

  const handleLinkLongPress = (link: QuickLink) => {
    medium();
    setMenuVisible(link);
  };

  const handlePasswordVerify = (password: string) => {
    if (!passwordDialog) return;
    if (verifyPassword(passwordDialog.id, password)) {
      setPasswordDialog(null);
      openLinkInBrowser(passwordDialog.url, passwordDialog.browserPackage);
    } else {
      toast.error('密码错误，请重新输入');
    }
  };

  const handleDeleteLink = () => {
    if (!menuVisible) return;
    toast.confirm(
      '删除链接',
      `确定要删除 "${menuVisible.name}" 吗？`,
      async () => {
        await deleteLink(menuVisible.id);
        setMenuVisible(null);
      },
      '删除',
      true,
    );
  };

  const handleAddToHomeScreen = async () => {
    if (!menuVisible) return;
    setMenuVisible(null);

    const result = await addLinkToHomeScreen(menuVisible.id, menuVisible.name);
    if (result === 'success') {
      toast.success('已发起添加请求，请在系统对话框中确认');
    } else if (result === 'unsupported') {
      toast.error('添加到桌面需要 Android 8.0+ 且使用完整构建版本（非 Expo Go）');
    } else {
      toast.error('添加到桌面失败，请重试');
    }
  };

  const s = makeStyles(colors);

  const renderLinkItem = ({ item }: { item: QuickLink }) => (
    <View style={s.cardWrapper}>
      <LinkCard
        link={item}
        onPress={handleLinkPress}
        onLongPress={handleLinkLongPress}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={[s.header, { paddingTop: insets.top + SPACING.md }]}>
      <Text style={s.headerTitle}>Quick Link</Text>
      <View style={s.headerActions}>
        <TouchableOpacity
          style={s.headerButton}
          onPress={() => navigation.navigate('Tutorial')}
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.headerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!loading && links.length === 0) {
    return (
      <View style={s.container}>
        {renderHeader()}
        <EmptyState
          icon="add-circle-outline"
          title="还没有链接"
          description="点击下方按钮创建你的第一个快捷链接，长按链接可添加到手机桌面"
        />
        <TouchableOpacity
          style={[s.fab, { bottom: insets.bottom + SPACING.xl }]}
          onPress={() => navigation.navigate('AddEditLink', {})}
        >
          <Ionicons name="add" size={28} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {renderHeader()}

      {/* 分类筛选 Tab */}
      {hasCategories && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.categoryBar}
          contentContainerStyle={s.categoryBarContent}
        >
          <TouchableOpacity
            style={[s.categoryChip, selectedCategory === ALL_CATEGORY && s.categoryChipActive]}
            onPress={() => setSelectedCategory(ALL_CATEGORY)}
          >
            <Text
              style={[
                s.categoryChipText,
                selectedCategory === ALL_CATEGORY && s.categoryChipTextActive,
              ]}
            >
              全部
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.categoryChip, selectedCategory === cat && s.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  s.categoryChipText,
                  selectedCategory === cat && s.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={s.summaryBar}>
        <Text style={s.summaryText}>
          {filteredLinks.length} 个快捷链接
          {selectedCategory !== ALL_CATEGORY ? ` · ${selectedCategory}` : ''}
        </Text>
      </View>

      <FlatList
        data={filteredLinks}
        renderItem={renderLinkItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={s.listContent}
        columnWrapperStyle={s.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[s.fab, { bottom: insets.bottom + SPACING.xl }]}
        onPress={() => navigation.navigate('AddEditLink', {})}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </TouchableOpacity>

      {/* 长按菜单 */}
      {menuVisible && (
        <TouchableOpacity
          style={s.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(null)}
        >
          <View style={s.menuContainer}>
            <Text style={s.menuTitle} numberOfLines={1}>{menuVisible.name}</Text>

            <TouchableOpacity
              style={s.menuItem}
              onPress={() => {
                const link = menuVisible;
                setMenuVisible(null);
                navigation.navigate('AddEditLink', { linkId: link.id });
              }}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={s.menuItemText}>编辑</Text>
            </TouchableOpacity>

            {canAddToHomeScreen() && (
              <TouchableOpacity style={s.menuItem} onPress={handleAddToHomeScreen}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.secondary} />
                <Text style={s.menuItemText}>添加到桌面</Text>
              </TouchableOpacity>
            )}

            <View style={s.menuDivider} />

            <TouchableOpacity style={s.menuItem} onPress={handleDeleteLink}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[s.menuItemText, { color: colors.error }]}>删除</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <PasswordDialog
        visible={passwordDialog !== null}
        linkName={passwordDialog?.name || ''}
        onVerify={handlePasswordVerify}
        onCancel={() => setPasswordDialog(null)}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      backgroundColor: colors.surface,
      ...SHADOWS.sm,
    },
    headerTitle: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    headerActions: { flexDirection: 'row', gap: SPACING.xs },
    headerButton: { padding: SPACING.xs },
    categoryBar: { maxHeight: 48 },
    categoryBarContent: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      gap: SPACING.sm,
    },
    categoryChip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    categoryChipText: {
      fontSize: FONT_SIZE.sm,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    categoryChipTextActive: { color: colors.primary },
    summaryBar: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    summaryText: {
      fontSize: FONT_SIZE.sm,
      color: colors.textTertiary,
      fontWeight: '500',
    },
    listContent: { paddingHorizontal: GRID_PADDING, paddingBottom: 100 },
    columnWrapper: { gap: COLUMN_GAP },
    cardWrapper: { width: CARD_WIDTH, marginBottom: SPACING.md },
    fab: {
      position: 'absolute',
      right: SPACING.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.lg,
    },
    menuOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    menuContainer: {
      width: '75%',
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.xl,
      ...SHADOWS.lg,
    },
    menuTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: SPACING.lg,
      textAlign: 'center',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.sm,
    },
    menuItemText: { fontSize: FONT_SIZE.lg, color: colors.textPrimary },
    menuDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: SPACING.xs,
    },
  });
}
