import React from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useLinks } from '../contexts/LinkContext';
import { LinkForm } from '../components/LinkForm';
import { Header } from '../components/Header';
import { QuickLink } from '../types';

interface Props {
  navigation: any;
  route: any;
}

export function AddEditLinkScreen({ navigation, route }: Props) {
  const { links, addLink, updateLink, getLinkById } = useLinks();
  const linkId = route.params?.linkId as string | undefined;
  const existingLink = linkId ? getLinkById(linkId) : undefined;
  const isEditing = !!existingLink;
  const insets = useSafeAreaInsets();

  const handleSubmit = async (data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isEditing && existingLink) {
        await updateLink({
          ...existingLink,
          ...data,
        });
        Alert.alert('成功', '链接已更新', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addLink(data);
        Alert.alert('成功', '链接已创建，长按链接可添加到桌面', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  return (
    <View style={styles.container}>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
