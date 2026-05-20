'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import {
  ExperimentSchematic,
  LiveWire,
  LiveResistor,
  LiveCapacitor,
  LiveInductor,
  LiveDiode,
  LiveTransistor,
  LiveGate,
  LiveBattery,
  LiveLamp,
  LiveSwitch,
} from '@/components/schematic';

/**
 * Visual QA surface for the LiveSchematic primitive library. Each card hosts
 * one primitive with sliders / toggles bound to its key props so the operator
 * can sweep through low/mid/high values and confirm sensible rendering.
 */
export default function SchematicGalleryPage() {
  // Wire / resistor / lamp share the same current+R sandbox at the top.
  const [current, setCurrent] = React.useState(0.25);
  const [resistance, setResistance] = React.useState(220);

  // Capacitor sandbox
  const [vCap, setVCap] = React.useState(6);

  // Inductor sandbox
  const [iL, setIL] = React.useState(0.4);

  // Diode sandbox
  const [iD, setID] = React.useState(0.02);

  // Transistor sandbox
  const [iB, setIB] = React.useState(0.001);
  const [iC, setIC] = React.useState(0.05);
  const [vCE, setVCE] = React.useState(2);

  // Gate sandbox
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(false);

  // Switch
  const [closed, setClosed] = React.useState(true);

  // Battery
  const [vBat, setVBat] = React.useState(9);

  // Interactive (bidirectional) sandbox state
  const [intR, setIntR] = React.useState(1000);
  const [intC, setIntC] = React.useState(1e-6);
  const [intInd, setIntInd] = React.useState(0.01);
  const [iBat, setIBat] = React.useState(9);
  const [iSw, setISw] = React.useState(true);
  const [gA, setGA] = React.useState(true);
  const [gB, setGB] = React.useState(false);

  return (
    <main id="main" className="container mx-auto space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Schematic primitive gallery</h1>
        <p className="text-muted-foreground">
          Visual QA surface for the LiveSchematic library. Drag the sliders / toggle the
          switches to watch each primitive react to its inputs.
        </p>
      </header>

      <Card title="LiveWire + LiveResistor + LiveLamp">
        <div className="grid gap-3 sm:grid-cols-2">
          <LabeledSlider label={`Current (A): ${current.toFixed(2)}`} min={0} max={1} step={0.01} value={current} onChange={setCurrent} />
          <LabeledSlider label={`R (Ω): ${resistance}`} min={1} max={1000} step={1} value={resistance} onChange={setResistance} />
        </div>
        <ExperimentSchematic
          vars={{ I: current, R: resistance }}
          ariaLabel="A battery driving a resistor and lamp through wires"
          legend={[
            { glyph: <span className="block h-0.5 w-full bg-current" />, text: 'wire thickness = |I|' },
            { glyph: <span className="block h-2 w-2 rounded-full bg-orange-500" />, text: 'orange glow = power' },
          ]}
          render={({ I, R }) => (
            <>
              <LiveBattery x={60} y={120} voltage={9} />
              <LiveWire from={[80, 120]} to={[160, 120]} current={I} />
              <LiveResistor x={200} y={120} value={R} current={I} />
              <LiveWire from={[240, 120]} to={[300, 120]} current={I} />
              <LiveLamp x={330} y={120} current={I} resistance={R} powerMax={5} />
              <LiveWire from={[350, 120]} to={[380, 120]} current={I} />
              <LiveWire from={[380, 120]} to={[380, 180]} current={I} />
              <LiveWire from={[380, 180]} to={[60, 180]} current={I} />
              <LiveWire from={[60, 180]} to={[60, 145]} current={I} />
            </>
          )}
        />
      </Card>

      <Card title="LiveCapacitor (RC charging snapshot)">
        <LabeledSlider label={`V across plates: ${vCap.toFixed(1)} V`} min={-12} max={12} step={0.1} value={vCap} onChange={setVCap} />
        <ExperimentSchematic
          vars={{ V: vCap }}
          ariaLabel="A capacitor with its charge fill scaling with voltage"
          render={({ V }) => (
            <>
              <LiveBattery x={80} y={120} voltage={V} />
              <LiveWire from={[100, 120]} to={[200, 120]} current={0} />
              <LiveCapacitor x={220} y={120} capacitance={1e-6} voltage={V} chargeMax={12e-6} />
              <LiveWire from={[240, 120]} to={[320, 120]} current={0} />
            </>
          )}
        />
      </Card>

      <Card title="LiveInductor (field-lines scale with current)">
        <LabeledSlider label={`Coil current (A): ${iL.toFixed(2)}`} min={0} max={1} step={0.01} value={iL} onChange={setIL} />
        <ExperimentSchematic
          vars={{ I: iL }}
          ariaLabel="Inductor with surrounding dashed field-lines"
          render={({ I }) => (
            <>
              <LiveWire from={[60, 120]} to={[140, 120]} current={I} />
              <LiveInductor x={200} y={120} inductance={0.01} current={I} />
              <LiveWire from={[260, 120]} to={[340, 120]} current={I} />
            </>
          )}
        />
      </Card>

      <Card title="LiveDiode (forward vs reverse bias)">
        <LabeledSlider label={`Forward current (A): ${iD.toFixed(3)}`} min={-0.01} max={0.05} step={0.001} value={iD} onChange={setID} />
        <ExperimentSchematic
          vars={{ I: iD }}
          ariaLabel="Diode glowing green when forward-biased, dim when reversed"
          render={({ I }) => (
            <>
              <LiveBattery x={70} y={120} voltage={3} />
              <LiveWire from={[90, 120]} to={[180, 120]} current={I} />
              <LiveDiode x={210} y={120} current={I} vF={0.7} />
              <LiveResistor x={290} y={120} value={150} current={I} />
              <LiveWire from={[330, 120]} to={[360, 120]} current={I} />
            </>
          )}
        />
      </Card>

      <Card title="LiveTransistor (NPN biasing regions)">
        <div className="grid gap-3 sm:grid-cols-3">
          <LabeledSlider label={`iB (mA): ${(iB * 1000).toFixed(2)}`} min={0} max={0.01} step={0.0001} value={iB} onChange={setIB} />
          <LabeledSlider label={`iC (A): ${iC.toFixed(3)}`} min={0} max={0.2} step={0.001} value={iC} onChange={setIC} />
          <LabeledSlider label={`vCE (V): ${vCE.toFixed(2)}`} min={0} max={10} step={0.1} value={vCE} onChange={setVCE} />
        </div>
        <ExperimentSchematic
          vars={{ iB, iC, vCE }}
          ariaLabel="NPN transistor showing cutoff / active / saturated region"
          render={(v) => <LiveTransistor x={200} y={120} kind="npn" iB={v.iB} iC={v.iC} vCE={v.vCE} />}
        />
      </Card>

      <Card title="LiveGate (every kind)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle label="A" value={a} onChange={setA} />
          <Toggle label="B" value={b} onChange={setB} />
        </div>
        <ExperimentSchematic
          vars={{ a: a ? 1 : 0, b: b ? 1 : 0 }}
          ariaLabel="Digital logic gates: AND OR NOT NAND NOR XOR XNOR"
          render={() => (
            <>
              <LiveGate x={50} y={40} kind="and" inputs={[a, b]} />
              <LiveGate x={150} y={40} kind="or" inputs={[a, b]} />
              <LiveGate x={250} y={40} kind="not" inputs={[a]} />
              <LiveGate x={350} y={40} kind="nand" inputs={[a, b]} />
              <LiveGate x={50} y={140} kind="nor" inputs={[a, b]} />
              <LiveGate x={150} y={140} kind="xor" inputs={[a, b]} />
              <LiveGate x={250} y={140} kind="xnor" inputs={[a, b]} />
            </>
          )}
        />
      </Card>

      <Card title="Interactive primitives (click / drag the SVG itself)">
        <p className="text-xs text-muted-foreground">
          These primitives accept an <code className="font-mono">onChange</code> prop, making the
          SVG bidirectionally interactive. Click switches, click gate input pins, drag
          resistors / capacitors / inductors / batteries. Keyboard: focus and use Arrow / Page /
          Home / End keys.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <InteractiveDemo label="LiveSwitch (click to toggle)" value={iSw ? 'closed' : 'open'}>
            <svg viewBox="0 0 200 80" className="w-full h-auto text-foreground/70">
              <LiveSwitch x={100} y={40} closed={iSw} onChange={setISw} testId="gallery-sw" />
            </svg>
          </InteractiveDemo>

          <InteractiveDemo label={`LiveResistor (drag vertically, log): ${intR.toFixed(0)} Ω`} value={`${intR.toFixed(0)}`}>
            <svg viewBox="0 0 200 80" className="w-full h-auto text-foreground/70">
              <LiveResistor x={100} y={40} value={intR} current={0} onChange={setIntR} min={1} max={1_000_000} testId="gallery-r" />
            </svg>
          </InteractiveDemo>

          <InteractiveDemo label={`LiveCapacitor (drag, log): ${(intC * 1e6).toFixed(3)} µF`} value={`${intC.toExponential(2)} F`}>
            <svg viewBox="0 0 200 80" className="w-full h-auto text-foreground/70">
              <LiveCapacitor x={100} y={40} capacitance={intC} voltage={5} onChange={setIntC} min={1e-12} max={1} testId="gallery-c" />
            </svg>
          </InteractiveDemo>

          <InteractiveDemo label={`LiveInductor (drag, log): ${(intInd * 1000).toFixed(3)} mH`} value={`${intInd.toExponential(2)} H`}>
            <svg viewBox="0 0 200 80" className="w-full h-auto text-foreground/70">
              <LiveInductor x={100} y={40} inductance={intInd} current={0.2} onChange={setIntInd} min={1e-6} max={10} testId="gallery-l" />
            </svg>
          </InteractiveDemo>

          <InteractiveDemo label={`LiveBattery (drag, linear): ${iBat.toFixed(1)} V`} value={`${iBat.toFixed(1)} V`}>
            <svg viewBox="0 0 200 80" className="w-full h-auto text-foreground/70">
              <LiveBattery x={100} y={40} voltage={iBat} onChange={setIBat} min={0} max={24} testId="gallery-bat" />
            </svg>
          </InteractiveDemo>

          <InteractiveDemo label={`LiveGate (click input pins)`} value={`A=${gA ? 'HI' : 'LO'} B=${gB ? 'HI' : 'LO'}`}>
            <svg viewBox="0 0 200 80" className="w-full h-auto text-foreground/70">
              <LiveGate
                x={100}
                y={40}
                kind="and"
                inputs={[gA, gB]}
                onInputChange={(i, next) => (i === 0 ? setGA(next) : setGB(next))}
                testId="gallery-gate"
              />
            </svg>
          </InteractiveDemo>
        </div>
      </Card>

      <Card title="LiveBattery + LiveSwitch">
        <div className="grid gap-3 sm:grid-cols-2">
          <LabeledSlider label={`Voltage (V): ${vBat.toFixed(1)}`} min={-12} max={12} step={0.1} value={vBat} onChange={setVBat} />
          <Toggle label="Switch closed" value={closed} onChange={setClosed} />
        </div>
        <ExperimentSchematic
          vars={{ V: vBat, closed: closed ? 1 : 0 }}
          ariaLabel="Battery and switch in series"
          render={({ V, closed: c }) => (
            <>
              <LiveBattery x={80} y={120} voltage={V} />
              <LiveWire from={[100, 120]} to={[180, 120]} current={c ? 0.1 : 0} />
              <LiveSwitch x={220} y={120} closed={!!c} />
              <LiveWire from={[260, 120]} to={[340, 120]} current={c ? 0.1 : 0} />
            </>
          )}
        />
      </Card>
    </main>
  );
}

function InteractiveDemo({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 rounded-md border bg-background/40 p-3">
      <div className="font-mono text-xs text-muted-foreground">{label}</div>
      {children}
      <div className="text-sm">
        value: <span className="font-mono font-semibold">{value}</span>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function LabeledSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-xs text-muted-foreground">{label}</div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(arr) => onChange(arr[0])}
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      <span className="font-mono">
        {label}: <span className={value ? 'text-green-600' : 'text-muted-foreground'}>{value ? 'HIGH' : 'LOW'}</span>
      </span>
    </label>
  );
}
