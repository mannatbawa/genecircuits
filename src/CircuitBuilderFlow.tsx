import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import './index.css';
import {
    Toolbox,
    PropertiesWindow,
    Ribbon,
    HillCoefficientMatrix,
    PrebuiltCircuits,
} from './components';
import {
    Tabs,
    Box,
    ScrollArea
} from '@radix-ui/themes';
import { useHillCoefficientContext, useWindowStateContext } from "./hooks";
import { BrickWorkspace } from "./brick/ui/BrickWorkspace";

export default function CircuitBuilderFlow() {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 800px)').matches);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 800px)');
        const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const {
        hillCoefficients,
        setHillCoefficients
    } = useHillCoefficientContext();

    const {
        showHillCoeffMatrix,
        setShowHillCoeffMatrix,
        activeTab,
        setActiveTab,
    } = useWindowStateContext();

    return (
        <>
            <Ribbon />

            <HillCoefficientMatrix
                open={showHillCoeffMatrix}
                onOpenChange={setShowHillCoeffMatrix}
                usedProteins={new Set()}
                hillCoefficients={hillCoefficients}
                setHillCoefficients={setHillCoefficients}
            />

            <div className="bottom-container">
                <PanelGroup
                    key={isMobile ? 'mobile-layout' : 'desktop-layout'}
                    className="circuit-builder-container"
                    direction={isMobile ? 'vertical' : 'horizontal'}
                >
                    <Panel
                        className="left-pane min-w-128"
                        defaultSize={isMobile ? 42 : 30}
                        minSize={isMobile ? 28 : 27}
                        maxSize={isMobile ? 65 : 50}
                    >
                        <div className="circuit-sidebar">
                            <Tabs.Root
                                defaultValue="toolbox"
                                value={activeTab}
                                onValueChange={setActiveTab as (value: string) => void}
                                className="circuit-sidebar-tabs"
                            >
                                <Tabs.List style={{ width: '100%', display: 'flex' }}>
                                    <Tabs.Trigger style={{ flex: '1 1 0%', textAlign: 'center' }} value="toolbox">Toolbox</Tabs.Trigger>
                                    <Tabs.Trigger style={{ flex: '1 1 0%', textAlign: 'center' }} value="properties">Properties</Tabs.Trigger>
                                    <Tabs.Trigger style={{ flex: '1 1 0%', textAlign: 'center' }} value="circuits">Circuits</Tabs.Trigger>
                                </Tabs.List>

                                <ScrollArea className="circuit-sidebar-scroll" type="scroll" scrollbars="vertical">
                                    <Box px="4" mt="6" className="circuit-sidebar-content">
                                        <Tabs.Content value="toolbox">
                                            <Toolbox />
                                        </Tabs.Content>
                                        <Tabs.Content value="properties">
                                            <PropertiesWindow />
                                        </Tabs.Content>
                                        <Tabs.Content value="circuits">
                                            <PrebuiltCircuits />
                                        </Tabs.Content>
                                    </Box>
                                </ScrollArea>
                            </Tabs.Root>
                        </div>
                    </Panel>

                    <PanelResizeHandle className={isMobile ? "resize-handle-horizontal" : "resize-handle-vertical"} />

                    <Panel
                        className="flow-wrapper"
                        defaultSize={isMobile ? 58 : 70}
                        minSize={isMobile ? 35 : 50}
                        maxSize={isMobile ? 72 : 90}
                    >
                        <BrickWorkspace />
                    </Panel>
                </PanelGroup>
            </div>
        </>
    );
}
