import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionStatus } from '../stores/bluetoothStore';

interface ConnectionBannerProps {
  status: ConnectionStatus;
  error: string | null;
  onReconnect: () => void;
  onDismiss: () => void;
}

export const ConnectionBanner = ({
  status,
  error,
  onReconnect,
  onDismiss,
}: ConnectionBannerProps) => {
  if (status === 'connected' && !error) {
    return null;
  }

  const isConnecting = status === 'connecting';
  const isDisconnected = status === 'disconnected';

  const containerClass = error
    ? 'flex-row items-center justify-between py-2.5 px-4 mx-4 mb-4 rounded-lg bg-red-600'
    : 'flex-row items-center justify-between py-2.5 px-4 mx-4 mb-4 rounded-lg bg-amber-600';

  return (
    <View className={containerClass}>
      <View className="flex-row items-center flex-1 gap-2">
        {isConnecting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons
            name={error ? 'alert-circle' : 'warning'}
            size={20}
            color="#fff"
          />
        )}
        <Text className="text-white text-sm font-medium flex-1">
          {error || (isConnecting ? 'Connecting...' : 'Disconnected')}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {isDisconnected && !isConnecting && (
          <TouchableOpacity
            className="flex-row items-center bg-white/20 py-1.5 px-3 rounded-md gap-1"
            onPress={onReconnect}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text className="text-white text-xs font-semibold">Reconnect</Text>
          </TouchableOpacity>
        )}
        {error && (
          <TouchableOpacity className="p-1" onPress={onDismiss}>
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
