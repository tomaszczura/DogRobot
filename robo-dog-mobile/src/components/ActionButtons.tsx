import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface ActionButtonsProps {
  onPressIn: (button: 'A' | 'B' | 'X' | 'Y') => void;
  onPressOut: (button: 'A' | 'B' | 'X' | 'Y') => void;
  disabled?: boolean;
}

const BUTTON_COLORS = {
  A: { active: '#22C55E', disabled: '#666' },
  B: { active: '#EF4444', disabled: '#666' },
  X: { active: '#3B82F6', disabled: '#666' },
  Y: { active: '#EAB308', disabled: '#666' },
};

export const ActionButtons = ({ onPressIn, onPressOut, disabled = false }: ActionButtonsProps) => {
  const createHandlers = useCallback(
    (button: 'A' | 'B' | 'X' | 'Y') => ({
      onPressIn: () => !disabled && onPressIn(button),
      onPressOut: () => !disabled && onPressOut(button),
    }),
    [onPressIn, onPressOut, disabled]
  );

  const renderButton = (button: 'A' | 'B' | 'X' | 'Y') => {
    const color = disabled ? BUTTON_COLORS[button].disabled : BUTTON_COLORS[button].active;
    const buttonClass = disabled
      ? 'w-[60px] h-[60px] bg-gray-800 rounded-full items-center justify-center m-1.5'
      : 'w-[60px] h-[60px] bg-gray-700 rounded-full items-center justify-center m-1.5';

    return (
      <TouchableOpacity
        className={buttonClass}
        style={{ borderWidth: 3, borderColor: color }}
        {...createHandlers(button)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text className="text-2xl font-bold" style={{ color }}>
          {button}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="items-center justify-center">
      <View className="flex-row items-center">
        <View className="w-[60px] h-[60px] m-1.5" />
        {renderButton('Y')}
        <View className="w-[60px] h-[60px] m-1.5" />
      </View>
      <View className="flex-row items-center">
        {renderButton('X')}
        <View className="w-10 h-[60px] m-1.5" />
        {renderButton('B')}
      </View>
      <View className="flex-row items-center">
        <View className="w-[60px] h-[60px] m-1.5" />
        {renderButton('A')}
        <View className="w-[60px] h-[60px] m-1.5" />
      </View>
    </View>
  );
}
