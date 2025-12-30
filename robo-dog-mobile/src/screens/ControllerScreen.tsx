import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { bluetoothService } from '../services/bluetoothService';
import { useBluetoothStore } from '../stores/bluetoothStore';
import { DPad } from '../components/DPad';
import { ActionButtons } from '../components/ActionButtons';
import { ConnectionBanner } from '../components/ConnectionBanner';

type Direction = 'up' | 'down' | 'left' | 'right';
type ActionButton = 'A' | 'B' | 'X' | 'Y';

const DIRECTION_COMMANDS: Record<Direction, { start: string; stop: string }> = {
  up: { start: 'FORWARD', stop: 'STOP' },
  down: { start: 'BACKWARD', stop: 'STOP' },
  left: { start: 'LEFT', stop: 'STOP' },
  right: { start: 'RIGHT', stop: 'STOP' },
};

const ACTION_COMMANDS: Record<ActionButton, { start: string; stop: string }> = {
  A: { start: 'BTN_A_ON', stop: 'BTN_A_OFF' },
  B: { start: 'BTN_B_ON', stop: 'BTN_B_OFF' },
  X: { start: 'BTN_X_ON', stop: 'BTN_X_OFF' },
  Y: { start: 'BTN_Y_ON', stop: 'BTN_Y_OFF' },
};

export const ControllerScreen = () => {
  const status = useBluetoothStore((s) => s.status);
  const connectedDevice = useBluetoothStore((s) => s.connectedDevice);
  const error = useBluetoothStore((s) => s.error);

  const isConnected = status === 'connected';

  useEffect(() => {
    // Lock to landscape
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      // Unlock on unmount
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (status === 'disconnected' && !error) {
      router.replace({ pathname: '/' });
    }
  }, [status, error]);

  const handleDPadPressIn = async (direction: Direction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await bluetoothService.send(DIRECTION_COMMANDS[direction].start);
  };

  const handleDPadPressOut = async (direction: Direction) => {
    await bluetoothService.send(DIRECTION_COMMANDS[direction].stop);
  };

  const handleActionPressIn = async (button: ActionButton) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await bluetoothService.send(ACTION_COMMANDS[button].start);
  };

  const handleActionPressOut = async (button: ActionButton) => {
    await bluetoothService.send(ACTION_COMMANDS[button].stop);
  };

  const handleDisconnect = async () => {
    await bluetoothService.disconnect();
    router.replace({ pathname: '/' });
  };

  const handleReconnect = () => {
    router.replace({ pathname: '/' });
  };

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar hidden />

      <ConnectionBanner
        status={status}
        error={error}
        onReconnect={handleReconnect}
        onDismiss={() => useBluetoothStore.getState().setError(null)}
      />

      <View className="flex-1 flex-row items-center justify-between px-10">
        <View className="items-center">
          <DPad
            onPressIn={handleDPadPressIn}
            onPressOut={handleDPadPressOut}
            disabled={!isConnected}
          />
        </View>

        <View className="items-center">
          <ActionButtons
            onPressIn={handleActionPressIn}
            onPressOut={handleActionPressOut}
            disabled={!isConnected}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-4 py-2 bg-gray-800/50">
        <View className="flex-row items-center gap-2">
          <View
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-500'
            }`}
          />
          <Text className="text-sm text-white">
            {connectedDevice?.name || 'RoboDog'}
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-1 px-3 py-1 bg-gray-700 rounded-lg"
          onPress={handleDisconnect}
        >
          <Ionicons name="power" size={14} color="#EF4444" />
          <Text className="text-red-500 text-xs font-medium">Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
