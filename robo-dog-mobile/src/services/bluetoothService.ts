import AsyncStorage from "@react-native-async-storage/async-storage";
import { PermissionsAndroid, Platform } from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";
import { useBluetoothStore } from "../stores/bluetoothStore";

export type { BluetoothDevice };

const STORAGE_KEY = "@robodog_device";
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000;

interface StoredDevice {
  address: string;
  name: string;
}

class BluetoothService {
  private disconnectSubscription: BluetoothEventSubscription | null = null;
  private connectedDevice: BluetoothDevice | null = null;
  private reconnectAttempts = 0;
  private isReconnecting = false;

  private get store() {
    return useBluetoothStore.getState();
  }

  async requestPermissions() {
    if (Platform.OS !== "android") return true;

    const apiLevel = Platform.Version;
    if (apiLevel >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        results["android.permission.BLUETOOTH_SCAN"] === "granted" &&
        results["android.permission.BLUETOOTH_CONNECT"] === "granted" &&
        results["android.permission.ACCESS_FINE_LOCATION"] === "granted"
      );
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return result === "granted";
  }

  async isBluetoothEnabled() {
    return RNBluetoothClassic.isBluetoothEnabled();
  }

  async getPairedDevices() {
    return RNBluetoothClassic.getBondedDevices();
  }

  async startDiscovery() {
    try {
      await RNBluetoothClassic.cancelDiscovery();
    } catch {
      // Discovery might not be in progress
    }
    return RNBluetoothClassic.startDiscovery();
  }

  async cancelDiscovery() {
    try {
      await RNBluetoothClassic.cancelDiscovery();
    } catch {
      // Discovery might not be in progress
    }
  }

  async connect(device: BluetoothDevice) {
    this.reconnectAttempts = 0;
    this.store.setStatus("connecting");
    this.store.setError(null);

    try {
      const connected = await RNBluetoothClassic.connectToDevice(
        device.address,
        {
          delimiter: "\n",
        }
      );

      this.connectedDevice = connected;
      this.setupDisconnectListener(connected);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ address: device.address, name: device.name })
      );

      this.store.setConnectedDevice(connected);
      this.store.setStatus("connected");
    } catch (err) {
      this.store.setError(
        err instanceof Error ? err.message : "Failed to connect"
      );
      this.store.setStatus("disconnected");
      throw err;
    }
  }

  private setupDisconnectListener(device: BluetoothDevice) {
    this.disconnectSubscription?.remove();
    this.disconnectSubscription = RNBluetoothClassic.onDeviceDisconnected(
      (event) => {
        if (event.device.address === device.address) {
          this.connectedDevice = null;
          this.store.setConnectedDevice(null);
          this.store.setStatus("disconnected");

          if (
            !this.isReconnecting &&
            this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS
          ) {
            this.attemptReconnect(device);
          }
        }
      }
    );
  }

  private async attemptReconnect(device: BluetoothDevice) {
    if (this.isReconnecting) return;

    this.isReconnecting = true;
    this.reconnectAttempts += 1;
    this.store.setStatus("reconnecting");
    this.store.setError("Connection lost. Reconnecting...");

    try {
      await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY));

      const connected = await RNBluetoothClassic.connectToDevice(
        device.address,
        {
          delimiter: "\n",
        }
      );

      this.connectedDevice = connected;
      this.setupDisconnectListener(connected);
      this.store.setConnectedDevice(connected);
      this.store.setStatus("connected");
      this.store.setError(null);
    } catch {
      if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        this.isReconnecting = false;
        setTimeout(() => this.attemptReconnect(device), RECONNECT_DELAY);
      } else {
        this.store.setError("Failed to reconnect. Please reconnect manually.");
        this.store.setStatus("disconnected");
      }
    } finally {
      this.isReconnecting = false;
    }
  }

  async disconnect() {
    this.reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
    this.disconnectSubscription?.remove();
    this.disconnectSubscription = null;

    if (this.connectedDevice) {
      try {
        await RNBluetoothClassic.disconnectFromDevice(
          this.connectedDevice.address
        );
      } catch {
        // Ignore
      }
      this.connectedDevice = null;
    }

    await AsyncStorage.removeItem(STORAGE_KEY);
    this.store.reset();
  }

  async send(data: string) {
    if (!this.connectedDevice) {
      return;
    }
    try {
      await RNBluetoothClassic.writeToDevice(
        this.connectedDevice.address,
        data + "\n"
      );
    } catch {
      this.store.setError("Failed to send command");
    }
  }

  async tryAutoConnect() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const storedDevice: StoredDevice = JSON.parse(stored);
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) return;

      // Check if already connected
      const connectedDevices = await RNBluetoothClassic.getConnectedDevices();
      const alreadyConnected = connectedDevices.find(
        (d) => d.address === storedDevice.address
      );

      if (alreadyConnected) {
        this.connectedDevice = alreadyConnected;
        this.setupDisconnectListener(alreadyConnected);
        this.store.setConnectedDevice(alreadyConnected);
        this.store.setStatus("connected");
        return;
      }

      // Try to connect
      this.store.setStatus("connecting");
      const device = await RNBluetoothClassic.connectToDevice(
        storedDevice.address,
        {
          delimiter: "\n",
        }
      );
      this.connectedDevice = device;
      this.setupDisconnectListener(device);
      this.store.setConnectedDevice(device);
      this.store.setStatus("connected");
    } catch {
      // Auto-connect failed silently
      this.store.setStatus("disconnected");
    }
  }
}

export const bluetoothService = new BluetoothService();
