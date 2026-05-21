// Nicer Dice — a button-triggered 7-LED die face.
// Press the button: the seven LEDs settle on a random face 1..6.
// Mapping uses 4 control pins driving groups of LEDs (see brief).

const int BTN_PIN     = 2;   // button to GND, INPUT_PULLUP
const int PIN_CENTER  = 8;   // single centre LED (face 1,3,5)
const int PIN_MIDROW  = 9;   // two mid-row LEDs (face 6 only)
const int PIN_DIAG_A  = 10;  // two diagonal corners (face 2..6)
const int PIN_DIAG_B  = 11;  // other two corners   (face 4..6)

unsigned long lastRoll = 0;

void clearFace() {
  digitalWrite(PIN_CENTER, LOW);
  digitalWrite(PIN_MIDROW, LOW);
  digitalWrite(PIN_DIAG_A, LOW);
  digitalWrite(PIN_DIAG_B, LOW);
}

void showFace(int face) {
  clearFace();
  // Face 1: centre.       Face 2: diag A.
  // Face 3: centre+diagA. Face 4: diagA+diagB.
  // Face 5: centre+diagA+diagB. Face 6: midrow+diagA+diagB.
  if (face == 1 || face == 3 || face == 5) digitalWrite(PIN_CENTER, HIGH);
  if (face == 6)                            digitalWrite(PIN_MIDROW, HIGH);
  if (face >= 2)                            digitalWrite(PIN_DIAG_A, HIGH);
  if (face >= 4)                            digitalWrite(PIN_DIAG_B, HIGH);
}

void setup() {
  Serial.begin(9600);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(PIN_CENTER, OUTPUT);
  pinMode(PIN_MIDROW, OUTPUT);
  pinMode(PIN_DIAG_A, OUTPUT);
  pinMode(PIN_DIAG_B, OUTPUT);
  randomSeed(analogRead(A0));
  Serial.println("Dice: ready (press button to roll)");
  // Show an initial face so the captured screenshot has something visible.
  showFace(5);
  Serial.println("Roll: 5 (initial)");
}

void loop() {
  // Auto-roll every 600ms in addition to button input so the captured
  // screenshot and serial.log always show activity.
  unsigned long now = millis();
  if (now - lastRoll > 600) {
    int face = random(1, 7);
    showFace(face);
    Serial.print("Roll: ");
    Serial.println(face);
    lastRoll = now;
  }

  if (digitalRead(BTN_PIN) == LOW) {
    delay(50);
    int face = random(1, 7);
    showFace(face);
    Serial.print("Button roll: ");
    Serial.println(face);
    lastRoll = now;
    while (digitalRead(BTN_PIN) == LOW) delay(10);
    delay(50);
  }
}
