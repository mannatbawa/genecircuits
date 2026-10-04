import React from 'react';
import {
    Box,
    Text,
    Flex,
    Grid,
    Button,
    Tooltip
} from '@radix-ui/themes';
import { Layers, Plus } from 'lucide-react';
import { PRESETS, PresetKey } from '../../brick/presets';
import { useBrickBench } from '../../brick/BrickBenchContext';

const PrebuiltCircuits: React.FC = () => {
    const { loadPreset, presetKey } = useBrickBench();

    return (
        <Flex direction="column" gap="4">
            <Text size="4" weight="bold">Example circuits</Text>
            <Text size="2" color="gray">
                Load a preset onto the bench. These use the same snap-together parts as the toolbox.
            </Text>

            <Grid columns="1" gap="3" mt="2">
                {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
                    const preset = PRESETS[key];
                    const n = preset.count;
                    return (
                        <Box
                            key={key}
                            style={{
                                border: presetKey === key ? '1px solid var(--accent-a8)' : '1px solid var(--gray-a6)',
                                borderRadius: 'var(--radius-3)',
                                padding: '1rem',
                                backgroundColor: 'var(--color-surface)',
                            }}
                        >
                            <Flex direction="row" justify="between" align="center">
                                <Flex direction="column" gap="1">
                                    <Text weight="medium" size="3">{preset.label}</Text>
                                    <Flex gap="2" mt="2">
                                        <Text size="1" color="gray">
                                            <Layers size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {n} constructs
                                        </Text>
                                    </Flex>
                                </Flex>
                                <Tooltip content="Load onto bench">
                                    <Button variant="soft" onClick={() => loadPreset(key)}>
                                        <Plus size={16} />
                                        Load
                                    </Button>
                                </Tooltip>
                            </Flex>
                        </Box>
                    );
                })}
            </Grid>
        </Flex>
    );
};

export default PrebuiltCircuits;
