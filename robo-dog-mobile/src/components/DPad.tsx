import React, { useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DPadProps {
  onPressIn: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onPressOut: (direction: 'up' | 'down' | 'left' | 'right') => void;
  disabled?: boolean;
}

export const DPad = ({ onPressIn, onPressOut, disabled = false }: DPadProps) => {
  const createHandlers = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => ({
      onPressIn: () => !disabled && onPressIn(direction),
      onPressOut: () => !disabled && onPressOut(direction),
    }),
    [onPressIn, onPressOut, disabled]
  );

  const buttonClass = disabled
    ? 'w-[70px] h-[70px] bg-gray-800 rounded-xl items-center justify-center m-1 border-2 border-gray-700'
    : 'w-[70px] h-[70px] bg-gray-700 rounded-xl items-center justify-center m-1 border-2 border-gray-600';

  const iconColor = disabled ? '#666' : '#fff';

  return (
    <View className="items-center justify-center">
      <View className="flex-row items-center">
        <View className="w-[70px] h-[70px] m-1" />
        <TouchableOpacity
          className={buttonClass}
          {...createHandlers('up')}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Ionicons name="chevron-up" size={40} color={iconColor} />
        </TouchableOpacity>
        <View className="w-[70px] h-[70px] m-1" />
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity
          className={buttonClass}
          {...createHandlers('left')}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Ionicons name="chevron-back" size={40} color={iconColor} />
        </TouchableOpacity>
        <View className="w-[70px] h-[70px] m-1 items-center justify-center bg-gray-800 rounded-xl">
          <View className="w-5 h-5 rounded-full bg-gray-700" />
        </View>
        <TouchableOpacity
          className={buttonClass}
          {...createHandlers('right')}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Ionicons name="chevron-forward" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center">
        <View className="w-[70px] h-[70px] m-1" />
        <TouchableOpacity
          className={buttonClass}
          {...createHandlers('down')}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Ionicons name="chevron-down" size={40} color={iconColor} />
        </TouchableOpacity>
        <View className="w-[70px] h-[70px] m-1" />
      </View>
    </View>
  );
}
