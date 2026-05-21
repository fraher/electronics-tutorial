// Analog Input — potentiometer on A0 controls LED brightness on D9 via PWM.
// Reads the 10-bit ADC, scales to 8-bit PWM with map().

const int POT_PIN = A0;
const int LED_PIN = 9;   // PWM-capable

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Pot-PWM: ready");
}

void loop() {
  int raw = analogRead(POT_PIN);
  int duty = map(raw, 0, 1023, 0, 255);
  analogWrite(LED_PIN, duty);
  Serial.print("adc=");
  Serial.print(raw);
  Serial.print(" duty=");
  Serial.println(duty);
  delay(100);
}
