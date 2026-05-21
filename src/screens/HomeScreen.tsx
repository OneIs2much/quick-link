import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLinks } from '../contexts/LinkContext';
import { LinkCard } from '../components/LinkCard';
import { EmptyState } from '../components/EmptyState';
import { PasswordDialog } from '../components/PasswordDialog';
import { openLinkInBrowser } from '../services/browserService';
import { QuickLink } from '../types';
import { useHaptics } from '../utils/haptics';

interface Props {
  navigation: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SPACING = SCREEN_WIDTH * 0.025;
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - GRID_SPACING * 2) / 3;

export function HomeScreen({ navigation }: Props) {
  const { links, loading, deleteLink, verifyPassword } = useLinks();
  const insets = useSafeAreaInsets();
  const { medium } = useHaptics();

  const [refreshing, setRefreshing] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<QuickLink | null>(null);
  const [menuVisible, setMenuVisible] = useState<QuickLink | null>(null);

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
      Alert.alert('密码错误', '请输入正确的访问密码');
    }
  };

  const handleDeleteLink = () => {
    if (!menuVisible) return;
    Alert.alert(
      '删除链接',
      `确定要删除 "${menuVisible.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteLink(menuVisible.id);
            setMenuVisible(null);
          },
        },
      ]
    );
  };

  const handlePinToHome = () => {
    if (!menuVisible) return;
    Alert.alert(
      '添加到桌面',
      '请长按应用图标，在弹出菜单中选择"添加到主屏幕"。\n\n你也可以在系统设置中将此应用的桌面小组件添加到主屏幕。',
      [{ text: '知道了' }]
    );
    setMenuVisible(null);
  };

  const renderLinkItem = ({ item }: { item: QuickLink }) => (
    <View style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
      <LinkCard
        link={item}
        onPress={handleLinkPress}
        onLongPress={handleLinkLongPress}
      />
    </View>
  );

  if (!loading && links.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
          <Text style={styles.headerTitle}>Quick Link</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <EmptyState
          icon="add-circle-outline"
          title="还没有链接"
          description="点击下方按钮创建你的第一个快捷链接，它可以添加到手机桌面哦"
        />
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + SPACING.xl }]}
          onPress={() => navigation.navigate('AddEditLink', {})}
        >
          <Ionicons name="add" size={28} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={styles.headerTitle}>Quick Link</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Tutorial')}
          >
            <Ionicons name="help-circle-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>{links.length} 个快捷链接</Text>
      </View>

      <FlatList
        data={links}
        renderItem={renderLinkItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + SPACING.xl }]}
        onPress={() => navigation.navigate('AddEditLink', {})}
      >
        <Ionicons name="add" size={28} color={COLORS.textInverse} />
      </TouchableOpacity>

      {menuVisible && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(null)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle} numberOfLines={1}>{menuVisible.name}</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const link = menuVisible;
                setMenuVisible(null);
                navigation.navigate('AddEditLink', { linkId: link.id });
              }}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handlePinToHome}>
              <Ionicons name="push-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.menuItemText}>添加到桌面</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteLink}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>删除</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  summaryBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  summaryText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: GRID_SPACING,
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    marginBottom: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  menuContainer: {
    width: '75%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  menuTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  menuItemText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },
});
