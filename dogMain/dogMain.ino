#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_MIN 120 // this is the 'minimum' pulse length count (out of 4096)
#define SERVO_MAX 600 // this is the 'maximum' pulse length count (out of 4096)

// Left front leg
#define LFL_HIP 0
#define LFL_KNEE 1
#define LFL_ANKLE 2

// Right front leg
#define RFL_HIP 4
#define RFL_KNEE 5
#define RFL_ANKLE 6

// Left back leg
#define LBL_HIP 8
#define LBL_KNEE 9
#define LBL_ANKLE 10

// Right back leg
#define RBL_HIP 12
#define RBL_KNEE 13
#define RBL_ANKLE 14

void setup()
{
  Serial.begin(115200);
  pwm.begin();
  pwm.setPWMFreq(60);

  resetAllHips();
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
