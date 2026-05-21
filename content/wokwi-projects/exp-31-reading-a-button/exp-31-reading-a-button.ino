// Reading a Button — pushbutton toggles the on-board LED.
// Edge-detected with millis()-based debounce. INPUT_PULLUP means
// idle HIGH, pressed LOW.

const int BTN_PIN = 2;
const unsigned long DEBOUNCE_MS = 30;

int  lastReading = HIGH;
bool ledState = false;
unsigned long lastEdgeMs = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("Button-toggle: ready");
}

void loop() {
  int reading = digitalRead(BTN_PIN);
  unsigned long now = millis();

  // Falling edge: HIGH -> LOW = press starts.
  if (lastReading == HIGH && reading == LOW && (now - lastEdgeMs) > DEBOUNCE_MS) {
    ledState = !ledState;
    digitalWrite(LED_BUILTIN, ledState ? HIGH : LOW);
    lastEdgeMs = now;
    Serial.print("Toggled at ");
    Serial.print(now);
    Serial.print(" ms -> LED ");
    Serial.println(ledState ? "ON" : "OFF");
  }
  lastReading = reading;

  // Heartbeat on serial every 500ms so the captured log shows something
  // even if the button hasn't been pressed in the headless run.
  static unsigned long lastHeartbeat = 0;
  if (now - lastHeartbeat >= 500) {
    Serial.print("heartbeat t=");
    Serial.print(now);
    Serial.print("ms led=");
    Serial.println(ledState ? "ON" : "OFF");
    lastHeartbeat = now;
  }
}
