#include <Adafruit_PWMServoDriver.h>
#include "BluetoothSerial.h"
#include "dog_legs_config.h"

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
BluetoothSerial SerialBT;

#define BT_NAME "RoboDog"

void setup()
{
  Serial.begin(115200);
  pwm.begin();
  pwm.setPWMFreq(60);

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
  // pwm.setPWM(LFL_HIP, 0, angleHIPulse(0));
  // delay(2000);
  // pwm.setPWM(RFL_HIP, 0, angleHIPulse(0));
  // delay(2000);
  // pwm.setPWM(LBL_HIP, 0, angleHIPulse(0));
  // delay(2000);
  // pwm.setPWM(RBL_HIP, 0, angleHIPulse(0));
  // delay(2000);

  // pwm.setPWM(LFL_HIP, 0, angleHIPulse(90));
  // delay(2000);
  // pwm.setPWM(RFL_HIP, 0, angleHIPulse(90));
  // delay(2000);
  // pwm.setPWM(LBL_HIP, 0, angleHIPulse(90));
  // delay(2000);
  // pwm.setPWM(RBL_HIP, 0, angleHIPulse(90));

  // delay(2000);

  // pwm.setPWM(LFL_HIP, 0, angleHIPulse(180));
  // delay(2000);
  // pwm.setPWM(RFL_HIP, 0, angleHIPulse(180));
  // delay(2000);
  // pwm.setPWM(LBL_HIP, 0, angleHIPulse(180));
  // delay(2000);
  // pwm.setPWM(RBL_HIP, 0, angleHIPulse(180));
  // delay(2000);
}

int angleHIPulse(int ang)
{
  int pulse = map(ang, 0, 180, SERVO_MIN, SERVO_MAX);
  return pulse;
}

void resetAllHips()
{
  // Set all Hips to 90 degrees position
  pwm.setPWM(LFL_HIP, 0, angleHIPulse(90));
  pwm.setPWM(RFL_HIP, 0, angleHIPulse(90));
  pwm.setPWM(LBL_HIP, 0, angleHIPulse(90));
  pwm.setPWM(RBL_HIP, 0, angleHIPulse(90));
}
