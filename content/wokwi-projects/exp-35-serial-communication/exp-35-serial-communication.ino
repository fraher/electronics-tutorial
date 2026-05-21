// Serial Communication — echoes input as uppercase, blinks the on-board
// LED once per received byte, and periodically self-prints a banner so the
// headless capture has interesting log content even without input.

const unsigned long BANNER_MS = 400;

unsigned long lastBanner = 0;
unsigned long byteCount  = 0;

void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("Serial-echo: ready");
  Serial.println("Send characters; I will echo them as UPPERCASE and blink the LED once per byte.");
}

void loop() {
  while (Serial.available() > 0) {
    int c = Serial.read();
    if (c < 0) break;
    // Blink for this byte (non-blocking-ish — short pulse).
    digitalWrite(LED_BUILTIN, HIGH);
    delay(10);
    digitalWrite(LED_BUILTIN, LOW);
    char upper = (char)c;
    if (upper >= 'a' && upper <= 'z') upper = upper - 'a' + 'A';
    byteCount++;
    Serial.print("rx[");
    Serial.print(byteCount);
    Serial.print("]=");
    Serial.print((char)c);
    Serial.print(" -> ");
    Serial.println(upper);
  }

  unsigned long now = millis();
  if (now - lastBanner >= BANNER_MS) {
    Serial.print("banner t=");
    Serial.print(now);
    Serial.print("ms total_rx=");
    Serial.println(byteCount);
    lastBanner = now;
  }
}
