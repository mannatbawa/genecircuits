import React from "react";
import { Button, Flex, Slider, Text } from "@radix-ui/themes";
import { describeConstruct, useBrickBench } from "../brick/BrickBenchContext";

function TuneRow({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <Flex direction="column" gap="1" mb="3">
      <Flex justify="between">
        <Text size="2" color="gray">{label}</Text>
        <Text size="2">{display}</Text>
      </Flex>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
      />
    </Flex>
  );
}

const PropertiesWindow: React.FC = () => {
  const { constructs, selId, updateConstruct, discardConstruct } = useBrickBench();
  const selected = constructs.find((c) => c.id === selId) ?? null;

  if (!selected) {
    return (
      <Flex direction="column" gap="3">
        <Text size="4" weight="bold">Properties</Text>
        <Text size="2" color="gray">
          Select a construct on the bench to tune how fast it decays, where it starts, and how tightly its protein binds.
        </Text>
      </Flex>
    );
  }

  const info = describeConstruct(selected);
  const isTf = info.product?.kind === "tf";

  return (
    <Flex direction="column" gap="2">
      <Text size="4" weight="bold">Properties</Text>
      <Text size="2" className="brick-mono">{info.full}</Text>
      {info.gap && <Text size="2" color="orange">{info.gap}</Text>}

      <TuneRow
        label="Degradation rate γ"
        value={selected.gamma}
        display={`γ = ${selected.gamma.toFixed(2)}`}
        min={0.05}
        max={2}
        step={0.01}
        onChange={(v) => updateConstruct(selected.id, { gamma: v })}
      />
      <TuneRow
        label="Initial concentration"
        value={selected.init}
        display={selected.init > 0 && selected.init < 0.01 ? selected.init.toFixed(3) : selected.init.toFixed(2)}
        min={0}
        max={1.2}
        step={0.001}
        onChange={(v) => updateConstruct(selected.id, { init: v })}
      />
      {isTf && (
        <>
          <TuneRow
            label="Dissociation constant K"
            value={selected.K}
            display={`K = ${selected.K.toFixed(2)}`}
            min={0.05}
            max={1}
            step={0.01}
            onChange={(v) => updateConstruct(selected.id, { K: v })}
          />
          <TuneRow
            label="Hill coefficient n"
            value={selected.n}
            display={`n = ${Math.round(selected.n)}`}
            min={1}
            max={8}
            step={1}
            onChange={(v) => updateConstruct(selected.id, { n: Math.round(v) })}
          />
        </>
      )}
      <Button color="red" variant="soft" mt="3" onClick={() => discardConstruct(selected.id)}>
        Discard construct
      </Button>
    </Flex>
  );
};

export default PropertiesWindow;
