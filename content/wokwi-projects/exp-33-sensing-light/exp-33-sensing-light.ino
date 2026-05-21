// Sensing Light — LDR voltage divider + LED night-light with hysteresis.
// Layout: +5V -> 10K -> A0 -> LDR -> GND. As light falls, R_LDR rises and
// V_A0 rises with it (LDR is the lower leg). When the reading climbs past
// T_ON_DARK the LED comes on; it stays on until the reading drops below
// T_OFF_LIGHT — the gap is the hysteresis band.

const int LDR_PIN = A0;
const int LED_PIN = 9;

const int T_ON_DARK   = 600;  // ADC counts: above this = dark, light up
const int T_OFF_LIGHT = 400;  // below this = light, turn off

bool ledOn = false;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("LDR-nightlight: ready");
}

void loop() {
  int v = analogRead(LDR_PIN);
  if (!ledOn && v >= T_ON_DARK) {
    ledOn = true;
    digitalWrite(LED_PIN, HIGH);
    Serial.println("DARK -> LED ON");
  } else if (ledOn && v <= T_OFF_LIGHT) {
    ledOn = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("LIGHT -> LED OFF");
  }
  Serial.print("ldr=");
  Serial.print(v);
  Serial.print(" led=");
  Serial.println(ledOn ? "ON" : "off");
  delay(150);
}
