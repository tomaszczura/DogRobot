#include <Adafruit_PWMServoDriver.h>


Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_MIN 120  // this is the 'minimum' pulse length count (out of 4096)
#define SERVO_MAX 600  // this is the 'maximum' pulse length count (out of 4096)

// Left front leg
#define LFL_TOP 0
#define LFL_HIP 1
#define LFL_KNEE 2

// Right front leg
#define RFL_TOP 3
#define RFL_HIP 4
#define RFL_KNEE 5

// Left back leg
#define LBL_TOP 6
#define LBL_HIP 7
#define LBL_KNEE 8

// Right back leg
#define RBL_TOP 9
#define RBL_HIP 10
#define RBL_KNEE 11


void setup() {
  Serial.begin(115200);
  pwm.begin();
  pwm.setPWMFreq(60);
}

void loop() {
  pwm.setPWM(LFL_TOP, 0, angleToPulse(90));
}


int angleToPulse(int ang) {
  int pulse = map(ang, 0, 180, SERVO_MIN, SERVO_MAX);
  return pulse;
}