#include <Adafruit_PWMServoDriver.h>
#include "BluetoothSerial.h"
#include "dog_legs_config.h"

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
BluetoothSerial SerialBT;

#define BT_NAME "RoboDog"

#define BT_CONN_LED_PIN 13

void setup()
{
  Serial.begin(115200);
  pwm.begin();
  pwm.setPWMFreq(60);

  pinMode(BT_CONN_LED_PIN, OUTPUT);
  digitalWrite(BT_CONN_LED_PIN, LOW);

  resetAllHips();

  if (!SerialBT.begin(BT_NAME))
  {
    Serial.println("An error occurred initializing Bluetooth");
  }
  else
  {
    Serial.println("Bluetooth initialized");
  }
}

void loop()
{
  if (SerialBT.hasClient())
  {
    digitalWrite(BT_CONN_LED_PIN, HIGH);

    if (SerialBT.available())
    {
      readCommandFromBT();
    }
  }
  else
  {
    digitalWrite(BT_CONN_LED_PIN, HIGH);
    delay(2000);
    digitalWrite(BT_CONN_LED_PIN, LOW);
    delay(2000);
  }
}

int angleHIPulse(int ang)
{
  int pulse = map(ang, 0, 180, SERVO_MIN, SERVO_MAX);
  return pulse;
}

void readCommandFromBT()
{

  String command = SerialBT.readStringUntil('\n');
  Serial.print("Received command via BT: ");
  Serial.println(command);
}

void resetAllHips()
{
  // Set all Hips to 90 degrees position
  pwm.setPWM(LFL_HIP, 0, angleHIPulse(90));
  pwm.setPWM(RFL_HIP, 0, angleHIPulse(90));
  pwm.setPWM(LBL_HIP, 0, angleHIPulse(90));
  pwm.setPWM(RBL_HIP, 0, angleHIPulse(90));
}
