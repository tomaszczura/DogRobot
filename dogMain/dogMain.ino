#include <Adafruit_PWMServoDriver.h>
#include "BluetoothSerial.h"
#include "dog_legs_config.h"
#include "camera_stream.h"

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
BluetoothSerial SerialBT;

#define BT_NAME "RoboDog"
#define BT_CONN_LED_PIN 13

bool cameraReady = false;

void setup()
{
  Serial.begin(115200);
  delay(1000);  // Wait for serial monitor

  initServos();
  initBluetooth();

  Serial.println("Setup complete");
  Serial.println("Send 'INIT_CAM' to initialize camera");
}

void loop()
{
  handleCameraStream();
  handleBluetooth();
  handleSerialCommands();
}

// ============ Initialization ============

void initServos()
{
  pwm.begin();
  pwm.setPWMFreq(60);
  resetAllHips();
  Serial.println("Servos initialized");
}

void initBluetooth()
{
  pinMode(BT_CONN_LED_PIN, OUTPUT);
  digitalWrite(BT_CONN_LED_PIN, LOW);

  if (!SerialBT.begin(BT_NAME))
  {
    Serial.println("Bluetooth initialization failed");
  }
  else
  {
    Serial.printf("Bluetooth initialized: %s\n", BT_NAME);
  }
}

void initCameraStream()
{
  if (!initCamera())
  {
    Serial.println("Camera initialization failed");
    return;
  }

  if (!startCameraAP())
  {
    Serial.println("WiFi AP initialization failed");
    return;
  }

  setupCameraServer();
  cameraReady = true;
  Serial.printf("Camera stream: http://%s/stream\n", WiFi.softAPIP().toString().c_str());
}

// ============ Loop Handlers ============

void handleCameraStream()
{
  if (cameraReady)
  {
    handleCameraServer();
  }
}

void handleBluetooth()
{
  if (SerialBT.hasClient())
  {
    digitalWrite(BT_CONN_LED_PIN, HIGH);

    if (SerialBT.available())
    {
      processBluetoothCommand();
    }
  }
  else
  {
    digitalWrite(BT_CONN_LED_PIN, HIGH);
    delay(200);
    digitalWrite(BT_CONN_LED_PIN, LOW);
    delay(200);
  }
}

void processBluetoothCommand()
{
  String command = SerialBT.readStringUntil('\n');
  command.trim();
  Serial.printf("BT command: %s\n", command.c_str());
  executeCommand(command);
}

void handleSerialCommands()
{
  if (Serial.available())
  {
    String command = Serial.readStringUntil('\n');
    command.trim();
    Serial.printf("Serial command: %s\n", command.c_str());
    executeCommand(command);
  }
}

void executeCommand(String command)
{
  if (command == "INIT_CAM")
  {
    if (!cameraReady)
    {
      initCameraStream();
    }
    else
    {
      Serial.println("Camera already initialized");
    }
  }
  else if (command == "GET_CAMERA_IP")
  {
    if (cameraReady)
    {
      String ip = WiFi.softAPIP().toString();
      Serial.println("CAMERA_IP:" + ip);
      SerialBT.println("CAMERA_IP:" + ip);
    }
    else
    {
      Serial.println("CAMERA_IP:NONE");
      SerialBT.println("CAMERA_IP:NONE");
    }
  }
}

// ============ Servo Helpers ============
int angleToServoPulse(int angle)
{
  return map(angle, 0, 180, SERVO_MIN, SERVO_MAX);
}

void resetAllHips()
{
  pwm.setPWM(LFL_HIP, 0, angleToServoPulse(90));
  pwm.setPWM(RFL_HIP, 0, angleToServoPulse(90));
  pwm.setPWM(LBL_HIP, 0, angleToServoPulse(90));
  pwm.setPWM(RBL_HIP, 0, angleToServoPulse(90));
}
