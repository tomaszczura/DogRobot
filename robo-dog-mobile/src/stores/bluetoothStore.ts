import { create } from 'zustand';
import { BluetoothDevice } from '../services/bluetoothService';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface BluetoothState {
  status: ConnectionStatus;
  connectedDevice: BluetoothDevice | null;
  error: string | null;
}

interface BluetoothActions {
  setStatus: (status: ConnectionStatus) => void;
  setConnectedDevice: (device: BluetoothDevice | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: BluetoothState = {
  status: 'disconnected',
  connectedDevice: null,
  error: null,
};

export const useBluetoothStore = create<BluetoothState & BluetoothActions>((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setConnectedDevice: (connectedDevice) => set({ connectedDevice }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
