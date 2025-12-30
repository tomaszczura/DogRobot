import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DeviceListItem } from "../components/DeviceListItem";
import { useDeviceScan } from "../hooks/useDeviceScan";
import { bluetoothService } from "../services/bluetoothService";
import { useBluetoothStore } from "../stores/bluetoothStore";

export const ConnectionScreen = () => {
  const {
    isScanning,
    pairedDevices,
    discoveredDevices,
    error: scanError,
    startScan,
    stopScan,
    clearError: clearScanError,
  } = useDeviceScan();

  const status = useBluetoothStore((s) => s.status);
  const connectedDevice = useBluetoothStore((s) => s.connectedDevice);
  const connectionError = useBluetoothStore((s) => s.error);

  const error = scanError || connectionError;
  const isConnecting = status === "connecting";

  useEffect(() => {
    if (status === "connected" && connectedDevice) {
      router.replace({ pathname: "/controller" });
    }
  }, [status, connectedDevice]);

  const clearError = () => {
    clearScanError();
    useBluetoothStore.getState().setError(null);
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View className="items-center pt-16 pb-8">
        <Ionicons name="paw" size={64} color="#3B82F6" />
        <Text className="text-3xl font-bold text-white mt-4">RoboDog</Text>
        <Text className="text-base text-gray-400 mt-2">
          Connect to your robot
        </Text>
      </View>

      {error && (
        <View className="flex-row items-center bg-red-600 mx-4 p-3 rounded-lg gap-2 mb-4">
          <Ionicons name="alert-circle" size={20} color="#fff" />
          <Text className="flex-1 text-white text-sm">{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View className="px-4 pb-4">
        <TouchableOpacity
          className={`flex-row items-center justify-center py-4 rounded-xl gap-2 ${
            isScanning ? "bg-blue-700" : "bg-blue-500"
          }`}
          onPress={isScanning ? stopScan : startScan}
          disabled={isConnecting}
        >
          {isScanning ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white text-base font-semibold">
                Scanning...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text className="text-white text-base font-semibold">
                Scan for Devices
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isConnecting && (
        <View className="absolute inset-0 bg-gray-900/90 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-white text-lg mt-4">Connecting...</Text>
        </View>
      )}

      <ScrollView className="flex-1 px-4">
        {pairedDevices.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Paired Devices ({pairedDevices.length})
            </Text>
            {pairedDevices.map((device) => (
              <DeviceListItem
                key={device.address}
                device={device}
                isPaired
                disabled={isConnecting}
                onPress={() => bluetoothService.connect(device)}
              />
            ))}
          </View>
        )}

        {discoveredDevices.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Other Devices ({discoveredDevices.length})
            </Text>
            {discoveredDevices.map((device) => (
              <DeviceListItem
                key={device.address}
                device={device}
                disabled={isConnecting}
                onPress={() => bluetoothService.connect(device)}
              />
            ))}
          </View>
        )}

        {pairedDevices.length === 0 &&
          discoveredDevices.length === 0 &&
          !isScanning && (
            <View className="items-center justify-center py-10">
              <Ionicons name="bluetooth-outline" size={48} color="#4B5563" />
              <Text className="text-gray-500 text-sm text-center mt-3">
                Press &quot;Scan for Devices&quot; to find your ESP32
              </Text>
            </View>
          )}
      </ScrollView>

      <View className="px-4 py-5 items-center">
        <Text className="text-gray-500 text-xs text-center">
          Pair your ESP32 in system Bluetooth settings first for best results
        </Text>
      </View>
    </View>
  );
};
