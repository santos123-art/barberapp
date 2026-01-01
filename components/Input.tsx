import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
}

export function Input({ label, icon, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: Colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 50,
  },
  iconContainer: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    color: Colors.text,
    paddingHorizontal: 12,
    height: '100%',
  },
});
