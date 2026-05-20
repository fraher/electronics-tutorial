'use client';

import { ExperimentPage } from '@/components/ExperimentPage';

// Minimal placeholder circuit text — a single 9V source + 470Ω resistor + LED.
// CircuitJS text format. Wire coordinates are illustrative; we just need
// SOMETHING valid enough for the simulator to open and the user to edit.
const OHM_LAW_CIRCUIT = `$ 1 0.000005 10 50 5 50 5e-11
v 192 256 192 144 0 0 40 9 0 0 0.5
r 192 144 320 144 0 470
162 320 144 320 256 2 default-led 1 0 0 0.01
w 192 256 320 256 0
`;

export default function DemoPage() {
  return (
    <ExperimentPage
      chapter={1}
      number={2}
      title="Demo — Ohm's Law in action"
      objective="See how voltage, current and resistance trade off in a single loop."
      summary={
        <>
          <p>
            A battery pushes electrons around a loop; a resistor pinches the flow. The
            relationship between the three quantities is captured by Ohm&apos;s law:
            voltage equals current times resistance. The sliders below let you tune any two
            and watch the third update in real time.
          </p>
          <p>
            This page is a Sprint 2 smoke test of the four shared primitives — formula
            slider, schematic, circuit embed, and the experiment page shell. The prose
            here is placeholder; real paraphrased content lands in Sprint 3.
          </p>
        </>
      }
      schematic={
        <svg
          role="img"
          aria-label="Battery driving current through a single resistor"
          viewBox="0 0 320 120"
          className="h-32 w-full max-w-md text-foreground"
        >
          {/* battery */}
          <line x1="40" y1="30" x2="40" y2="90" stroke="currentColor" strokeWidth="2" />
          <line x1="55" y1="45" x2="55" y2="75" stroke="currentColor" strokeWidth="4" />
          <text x="20" y="20" fontSize="10" fill="currentColor">
            9V
          </text>
          {/* top wire */}
          <line x1="40" y1="30" x2="160" y2="30" stroke="currentColor" strokeWidth="2" />
          {/* resistor (zigzag) */}
          <polyline
            points="160,30 170,20 180,40 190,20 200,40 210,20 220,40 230,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text x="170" y="14" fontSize="10" fill="currentColor">
            R
          </text>
          {/* right + bottom wire */}
          <line x1="230" y1="30" x2="280" y2="30" stroke="currentColor" strokeWidth="2" />
          <line x1="280" y1="30" x2="280" y2="90" stroke="currentColor" strokeWidth="2" />
          <line x1="280" y1="90" x2="55" y2="90" stroke="currentColor" strokeWidth="2" />
        </svg>
      }
      formulas={[
        {
          id: 'ohm',
          title: "Ohm's Law",
          latex: 'V = I \\cdot R',
          evaluate: ({ I, R }) => I * R,
          vars: [
            { name: 'I', min: 0, max: 0.1, step: 0.001, default: 0.02, unit: 'A' },
            { name: 'R', min: 100, max: 10000, step: 10, default: 470, unit: 'Ω' },
          ],
          solveFor: { name: 'V', unit: 'V', precision: 3 },
        },
        {
          id: 'power',
          title: 'Power dissipated',
          latex: 'P = V \\cdot I',
          evaluate: ({ V, I }) => V * I,
          vars: [
            { name: 'V', min: 0, max: 12, step: 0.1, default: 9, unit: 'V' },
            { name: 'I', min: 0, max: 0.1, step: 0.001, default: 0.02, unit: 'A' },
          ],
          solveFor: { name: 'P', unit: 'W', precision: 3 },
        },
      ]}
      circuit={{ kind: 'circuitjs', cir: OHM_LAW_CIRCUIT }}
      parts={['9V battery (or bench supply)', '470Ω resistor (¼W)', 'Red LED', 'Hookup wire']}
      takeaways={[
        'V, I, and R are mutually constrained — fix any two and the third is forced.',
        'Doubling the resistor halves the current at fixed voltage.',
        'Power scales linearly with both V and I — watch the wattage as you slide.',
      ]}
      prev={{ href: '/', label: 'Home' }}
      next={{ href: '/chapter/1/', label: 'Chapter 1' }}
    />
  );
}
