import { Box, Button, Field, FieldSet, Input, Select, InlineFieldRow } from '@grafana/ui';
import React, { useState } from 'react';
import { useDs } from './providers/ds.provider';
import { AlertQuery } from 'types';
import { SelectableValue } from '@grafana/data';

const RESOLUTION_STATES = [
    { label: '0 - New', value: '0' },
    { label: '200 - Closed', value: '200' },
    { label: '247 - Awaiting Evidence', value: '247' },
    { label: '248 - Assigned to Engineering', value: '248' },
    { label: '249 - Acknowledged', value: '249' },
    { label: '250 - Scheduled', value: '250' },
    { label: '254 - Resolved', value: '254' },
    { label: '255 - Custom', value: '255' },
];

export default function AlertsSection() {
    const { getAlerts, query, updateAlertResolutionState } = useDs();

    const alertQuery = query as AlertQuery;

    const [criteria, setCriteria] = useState(alertQuery.criteria || 'Severity = 2 AND ResolutionState = 0');
    const [alertId, setAlertId] = useState('');
    const [resolutionState, setResolutionState] = useState<SelectableValue<string>>(RESOLUTION_STATES[0]);
    const [updateMessage, setUpdateMessage] = useState('');

    const handleUpdateResolutionState = async () => {
        if (!alertId || !resolutionState?.value) {
            setUpdateMessage('⚠️ Alert ID and Resolution State are required');
            return;
        }

        try {
            await updateAlertResolutionState(alertId, resolutionState.value);
            setUpdateMessage('✓ Resolution state updated successfully');
            setAlertId('');
            // Refresh the alerts list
            await getAlerts(criteria ?? '');

            // Clear message after 3 seconds
            setTimeout(() => setUpdateMessage(''), 3000);
        } catch (error) {
            setUpdateMessage('✗ Failed to update: ' + error);
        }
    };

    return (
        <Box padding={1} paddingTop={2}>
            <FieldSet label="Alerts">
                <div style={{ marginBottom: '12px' }}>
                    <Button variant="primary" icon="sync" onClick={() => getAlerts(criteria ?? '')}>
                        Load Alerts
                    </Button>
                    <span style={{ marginLeft: '12px', color: '#888' }}>
                        Click to load SCOM alerts
                    </span>
                </div>
                <InlineFieldRow>
                    <Field label="Filter Criteria">
                        <Input
                            width={60}
                            onChange={(v) => setCriteria(v.currentTarget.value)}
                            value={criteria}
                            placeholder="E.g. Severity = 2 and ResolutionState = 0"
                        />
                    </Field>
                </InlineFieldRow>
            </FieldSet>

            <FieldSet label="Update Alert Resolution State">
                <InlineFieldRow>
                    <Field label="Alert ID">
                        <Input
                            width={40}
                            onChange={(v) => setAlertId(v.currentTarget.value)}
                            value={alertId}
                            placeholder="Paste Alert ID from table"
                        />
                    </Field>
                    <Field label="Resolution State">
                        <Select
                            width={30}
                            options={RESOLUTION_STATES}
                            value={resolutionState}
                            onChange={(v) => setResolutionState(v)}
                        />
                    </Field>
                    <Button variant="primary" onClick={handleUpdateResolutionState} style={{ marginTop: '28px' }}>
                        Update
                    </Button>
                </InlineFieldRow>
                {updateMessage && (
                    <div style={{ marginTop: '8px', padding: '8px', background: updateMessage.includes('✓') ? '#28a745' : updateMessage.includes('⚠️') ? '#ffc107' : '#dc3545', color: 'white', borderRadius: '4px' }}>
                        {updateMessage}
                    </div>
                )}
            </FieldSet>
        </Box>
    );
}
