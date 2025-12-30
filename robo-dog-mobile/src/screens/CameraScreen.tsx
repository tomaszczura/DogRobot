import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { bluetoothService } from '../services/bluetoothService';
import { useBluetoothStore } from '../stores/bluetoothStore';

// Default AP IP for ESP32 softAP mode
const DEFAULT_CAMERA_IP = '192.168.4.1';

export const CameraScreen = () => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);

  const btStatus = useBluetoothStore((s) => s.status);
  const isBtConnected = btStatus === 'connected';

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleInitCamera = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await bluetoothService.send('INIT_CAM');
      // Wait for camera to initialize and AP to start
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setCameraInitialized(true);
    } catch (e) {
      setError('Failed to send init command');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConnectStream = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch(`http://${DEFAULT_CAMERA_IP}/status`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (response.ok) {
        setStreamUrl(`http://${DEFAULT_CAMERA_IP}/stream`);
      } else {
        setError('Camera not responding');
      }
    } catch (e) {
      setError('Connect to RoboDog-Cam WiFi first');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-gray-800">
        <TouchableOpacity
          onPress={handleBack}
          className="flex-row items-center gap-2 px-3 py-2"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text className="text-white font-medium">Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          {/* Initialize Camera Button */}
          <TouchableOpacity
            onPress={handleInitCamera}
            disabled={!isBtConnected || isInitializing || cameraInitialized}
            className={`flex-row items-center gap-2 px-4 py-2 rounded-lg ${
              cameraInitialized
                ? 'bg-green-700'
                : isBtConnected
                ? 'bg-orange-600'
                : 'bg-gray-600'
            }`}
          >
            {isInitializing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons
                name={cameraInitialized ? 'checkmark-circle' : 'power'}
                size={16}
                color="white"
              />
            )}
            <Text className="text-white font-medium">
              {cameraInitialized ? 'Initialized' : 'Init Camera'}
            </Text>
          </TouchableOpacity>

          {/* Connect Stream Button */}
          <TouchableOpacity
            onPress={handleConnectStream}
            disabled={isConnecting}
            className="flex-row items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg"
          >
            {isConnecting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="videocam" size={16} color="white" />
            )}
            <Text className="text-white font-medium">Connect Stream</Text>
          </TouchableOpacity>
        </View>

        {streamUrl && (
          <TouchableOpacity
            onPress={() => setStreamUrl(null)}
            className="flex-row items-center gap-1 px-3 py-2"
          >
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Camera View */}
      <View className="flex-1">
        {streamUrl ? (
          <WebView
            source={{ uri: streamUrl }}
            style={{ flex: 1, backgroundColor: '#000' }}
            javaScriptEnabled={false}
            scalesPageToFit={true}
            onError={() => setError('Stream connection lost')}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            {error ? (
              <View className="items-center">
                <Ionicons name="warning" size={48} color="#EF4444" />
                <Text className="text-red-500 mt-4 text-lg">{error}</Text>
              </View>
            ) : (
              <View className="items-center">
                <Ionicons name="videocam-outline" size={64} color="#666" />
                <Text className="text-gray-400 mt-4 text-lg font-medium">
                  Camera Setup
                </Text>
                <View className="mt-6 gap-3">
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isBtConnected ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <Text className="text-white font-bold">1</Text>
                    </View>
                    <Text className="text-gray-400">
                      Bluetooth connected: {isBtConnected ? 'Yes' : 'No'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        cameraInitialized ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <Text className="text-white font-bold">2</Text>
                    </View>
                    <Text className="text-gray-400">
                      Press "Init Camera" button
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-600">
                      <Text className="text-white font-bold">3</Text>
                    </View>
                    <Text className="text-gray-400">
                      Connect phone to "RoboDog-Cam" WiFi
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-600">
                      <Text className="text-white font-bold">4</Text>
                    </View>
                    <Text className="text-gray-400">
                      Press "Connect Stream" button
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-600 mt-6 text-sm">
                  WiFi Password: robodog123
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
