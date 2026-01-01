import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, style, ...props }: ButtonProps) {
  const getBackgroundColor = () => {
    if (variant === 'outline' || variant === 'ghost') return 'transparent';
    return Colors.primary;
  };

  const getTextColor = () => {
    if (variant === 'outline') return Colors.primary;
    if (variant === 'ghost') return Colors.textSecondary;
    return '#000000'; // Texto preto no botão dourado para contraste
  };

  const getBorderWidth = () => {
    if (variant === 'outline') return 1;
    return 0;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: Colors.primary,
          borderWidth: getBorderWidth(),
        },
        style,
      ]}
      activeOpacity={0.8}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
