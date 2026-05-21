// Capstone — LDR + LED + button.
// Two modes: AUTO (LDR brightness controls LED) and MANUAL (button toggles
// the LED on/off). Press the button briefly to TOGGLE in MANUAL mode; hold
// the button (>500ms) to SWITCH MODES. Serial logs every state change.

#define LDR_PIN A0
#define LED_PIN 9
#define BTN_PIN 2
#define HOLD_MS 500UL
#define LOG_PERIOD_MS 500UL

enum Mode { AUTO, MANUAL };
Mode mode = AUTO;
bool manualLedOn = false;

int lastBtnReading = HIGH;
unsigned long pressStarted = 0;
bool modeSwitchedThisPress = false;
unsigned long lastLog = 0;

void applyOutput(int adcReading) {
  if (mode == AUTO) {
    // Brighter when darker. ADC reading rises with darkness in this divider.
    int pwm = map(adcReading, 0, 1023, 0, 255);
    analogWrite(LED_PIN, pwm);
  } else {
    digitalWrite(LED_PIN, manualLedOn ? HIGH : LOW);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  Serial.println("Capstone: starting in AUTO mode");
}

void loop() {
  unsigned long now = millis();
  int btn = digitalRead(BTN_PIN);
  int adc = analogRead(LDR_PIN);

  // Falling edge -> press started.
  if (lastBtnReading == HIGH && btn == LOW) {
    pressStarted = now;
    modeSwitchedThisPress = false;
  }
  // Long-press while held -> switch modes (once per press).
  if (btn == LOW && !modeSwitchedThisPress && (now - pressStarted) >= HOLD_MS) {
    mode = (mode == AUTO) ? MANUAL : AUTO;
    modeSwitchedThisPress = true;
    Serial.print("Mode -> ");
    Serial.println(mode == AUTO ? "AUTO" : "MANUAL");
  }
  // Rising edge -> press released; treat as short-press if no mode switch.
  if (lastBtnReading == LOW && btn == HIGH) {
    if (!modeSwitchedThisPress && (now - pressStarted) < HOLD_MS) {
      if (mode == MANUAL) {
        manualLedOn = !manualLedOn;
        Serial.print("Manual LED -> ");
        Serial.println(manualLedOn ? "ON" : "OFF");
      } else {
        Serial.println("Short press ignored in AUTO mode");
      }
    }
  }
  lastBtnReading = btn;

  applyOutput(adc);

  if (now - lastLog >= LOG_PERIOD_MS) {
    Serial.print("t=");
    Serial.print(now);
    Serial.print("ms mode=");
    Serial.print(mode == AUTO ? "AUTO" : "MANUAL");
    Serial.print(" adc=");
    Serial.print(adc);
    Serial.print(" led=");
    Serial.println((mode == MANUAL && !manualLedOn) ? "OFF" : "ON/PWM");
    lastLog = now;
  }
}
