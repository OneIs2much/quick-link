import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';

interface Props {
  navigation?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    icon: 'link' as keyof typeof Ionicons.glyphMap,
    title: '创建快捷链接',
    description: '点击 「+」 按钮添加链接，输入网址、自定义名称和图标，即可创建一个精美的快捷链接卡片。',
    color: COLORS.primary,
  },
  {
    icon: 'grid' as keyof typeof Ionicons.glyphMap,
    title: '管理链接',
    description: '长按任意链接卡片可以进行编辑、添加到桌面或删除。所有链接都展示在精美的网格视图中。',
    color: COLORS.secondary,
  },
  {
    icon: 'compass' as keyof typeof Ionicons.glyphMap,
    title: '浏览器选择',
    description: '可以为每个链接单独指定使用哪个浏览器打开，也可以为所有链接设置默认浏览器。支持 Chrome、Edge、Firefox 等主流浏览器。',
    color: COLORS.success,
  },
  {
    icon: 'lock-closed' as keyof typeof Ionicons.glyphMap,
    title: '密码保护',
    description: '为敏感链接设置访问密码，确保只有你知道密码才能打开。创建链接时可以设置，也可后续编辑时添加。',
    color: COLORS.warning,
  },
  {
    icon: 'push' as keyof typeof Ionicons.glyphMap,
    title: '添加到桌面',
    description: '长按链接选择「添加到桌面」，即可在手机桌面生成快捷方式。也可以将应用的小组件添加到主屏幕，快速访问常用链接。',
    color: COLORS.accent,
  },
];

export function TutorialScreen({ navigation }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const insets = useSafeAreaInsets();
  const { completeTutorial } = useSettings();
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;
  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = async () => {
    if (isLast) {
      await completeTutorial();
      if (navigation) {
        navigation.goBack();
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = async () => {
    await completeTutorial();
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>跳过</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconOuter}>
          <View style={[styles.iconInner, { backgroundColor: step.color + '15' }]}>
            <Ionicons name={step.icon} size={56} color={step.color} />
          </View>
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        <View style={styles.dots}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {isLast ? '开始使用' : '下一步'}
          </Text>
          <Ionicons
            name={isLast ? 'checkmark-circle' : 'arrow-forward'}
            size={20}
            color={COLORS.textInverse}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: SPACING.xxxl * 2,
  },
  iconOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl,
    ...SHADOWS.md,
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxxl,
  },
  dots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xxxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  nextText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
