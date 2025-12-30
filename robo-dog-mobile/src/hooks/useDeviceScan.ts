import { useRef, useState } from "react";
import {
  BluetoothDevice,
  bluetoothService,
} from "../services/bluetoothService";

const SCAN_TIMEOUT = 15000;

export const useDeviceScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScan = async () => {
    const hasPermissions = await bluetoothService.requestPermissions();
    if (!hasPermissions) {
      setError("Bluetooth permissions not granted");
      return;
    }

    const enabled = await bluetoothService.isBluetoothEnabled();
    if (!enabled) {
      setError("Bluetooth is not enabled");
      return;
    }

    setIsScanning(true);
    setError(null);
    setPairedDevices([]);
    setDiscoveredDevices([]);

    try {
      const paired = await bluetoothService.getPairedDevices();
      setPairedDevices(paired);

      const discovered = await bluetoothService.startDiscovery();
      const pairedAddresses = new Set(paired.map((d) => d.address));
      const newDevices = discovered.filter(
        (d) => !pairedAddresses.has(d.address)
      );
      setDiscoveredDevices(newDevices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setIsScanning(false);
    }

    // Auto-stop timeout
    scanTimeout.current = setTimeout(stopScan, SCAN_TIMEOUT);
  };

  const stopScan = () => {
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
    bluetoothService.cancelDiscovery();
    setIsScanning(false);
  };

  const clearError = () => setError(null);

  return {
    isScanning,
    pairedDevices,
    discoveredDevices,
    error,
    startScan,
    stopScan,
    clearError,
  };
};
