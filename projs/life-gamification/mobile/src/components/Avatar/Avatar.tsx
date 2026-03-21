import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface AvatarProps {
  source: { uri: string } | number; // remote URL ou local asset
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  showOnlineBadge?: boolean;
  isOnline?: boolean; // só usado se showOnlineBadge=true
}

export default function Avatar({
  source,
  size = 48,
  borderColor,
  borderWidth = 2,
  showOnlineBadge = false,
  isOnline = false,
}: AvatarProps) {
  const theme = useTheme();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor: borderColor || theme.Colors.gray600,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  };

  // Badge online (ponto verde no canto inferior direito)
  const renderOnlineBadge = () => {
    if (!showOnlineBadge) return null;

    const badgeSize = size * 0.3;
    return (
      <View
        style={[
          styles.onlineBadge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: isOnline ? theme.Colors.success : theme.Colors.gray500,
            borderWidth: 2,
            borderColor: theme.Colors.gray800,
            bottom: 0,
            right: 0,
          },
        ]}
      />
    );
  };

  return (
    <View style={containerStyle}>
      <Image
        source={source}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="cover"
      />
      {renderOnlineBadge()}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  onlineBadge: {
    position: 'absolute',
  },
});
