import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BluetoothDevice } from '../services/bluetoothService';

interface DeviceListItemProps {
  device: BluetoothDevice;
  isPaired?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const DeviceListItem = ({
  device,
  isPaired = false,
  disabled = false,
  onPress,
}: DeviceListItemProps) => (
  <TouchableOpacity
    className="flex-row items-center justify-between bg-gray-800 p-4 rounded-xl mb-2"
    onPress={onPress}
    disabled={disabled}
  >
    <View className="flex-row items-center flex-1 gap-3">
      <Ionicons name="bluetooth" size={24} color={isPaired ? '#10B981' : '#3B82F6'} />
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">
          {device.name || 'Unknown Device'}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">{device.address}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
  </TouchableOpacity>
);
