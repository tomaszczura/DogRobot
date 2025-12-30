import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { bluetoothService } from '../src/services/bluetoothService';

const RootLayout = () => {
  useEffect(() => {
    bluetoothService.tryAutoConnect();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#111827' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="controller" />
      </Stack>
    </>
  );
};

export default RootLayout;
