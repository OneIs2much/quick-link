import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLinks } from '../contexts/LinkContext';
import { useToast } from '../hooks/useToast';
import { LinkForm } from '../components/LinkForm';
import { Header } from '../components/Header';
import { QuickLink } from '../types';

interface Props {
  navigation: any;
  route: any;
}

export function AddEditLinkScreen({ navigation, route }: Props) {
  const { addLink, updateLink, getLinkById } = useLinks();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const linkId = route.params?.linkId as string | undefined;
  const existingLink = linkId ? getLinkById(linkId) : undefined;
  const isEditing = !!existingLink;

  const handleSubmit = async (data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isEditing && existingLink) {
        await updateLink({ ...existingLink, ...data });
        toast.success('链接已更新', () => navigation.goBack());
      } else {
        await addLink(data);
        toast.success('链接已创建，长按链接可添加到桌面', () => navigation.goBack());
      }
    } catch {
      // StorageError 已在 LinkContext 中 toast，此处无需重复提示
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={isEditing ? '编辑链接' : '添加链接'}
          showBack
          onBack={() => navigation.goBack()}
        />
      </View>
      <LinkForm
        initialValues={existingLink}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? '保存修改' : '创建链接'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
