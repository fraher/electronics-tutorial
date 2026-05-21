// Tones and Music — play a short jingle through a piezo on pin 8.
// Eight-note C major scale + a held final note.

const int SPK_PIN = 8;

const int notes[]     = { 262, 294, 330, 349, 392, 440, 494, 523 };
const int durations[] = { 200, 200, 200, 200, 200, 200, 200, 400 };
const int N_NOTES = sizeof(notes) / sizeof(notes[0]);

int idx = 0;
unsigned long noteStarted = 0;
bool resting = false;

void setup() {
  Serial.begin(9600);
  pinMode(SPK_PIN, OUTPUT);
  Serial.println("Melody: starting C-major scale");
  tone(SPK_PIN, notes[0]);
  Serial.print("note 1/");
  Serial.print(N_NOTES);
  Serial.print(" f=");
  Serial.println(notes[0]);
  noteStarted = millis();
}

void loop() {
  unsigned long now = millis();
  if (!resting) {
    if (now - noteStarted >= (unsigned long)durations[idx]) {
      noTone(SPK_PIN);
      resting = true;
      noteStarted = now;
    }
  } else {
    if (now - noteStarted >= 40) {
      idx++;
      if (idx >= N_NOTES) {
        idx = 0;
        Serial.println("Melody: looping");
      }
      tone(SPK_PIN, notes[idx]);
      Serial.print("note ");
      Serial.print(idx + 1);
      Serial.print("/");
      Serial.print(N_NOTES);
      Serial.print(" f=");
      Serial.println(notes[idx]);
      noteStarted = now;
      resting = false;
    }
  }
}
