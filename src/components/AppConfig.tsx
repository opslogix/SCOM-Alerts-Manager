import { AppPluginMeta, PluginConfigPageProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Alert, Button, Checkbox, Field, FieldSet, InlineField, Input, TextArea } from '@grafana/ui';
import React, { ChangeEvent, useState } from 'react';
import { ColumnConfig, ResolutionState, ScomDataSourceOptions } from '../types';

interface Props extends PluginConfigPageProps<AppPluginMeta<ScomDataSourceOptions>> {}

const DEFAULT_RESOLUTION_STATES: ResolutionState[] = [
  { label: '0 - New', value: '0' },
  { label: '200 - Closed', value: '200' },
  { label: '247 - Awaiting Evidence', value: '247' },
  { label: '248 - Assigned to Engineering', value: '248' },
  { label: '249 - Acknowledged', value: '249' },
  { label: '250 - Scheduled', value: '250' },
  { label: '254 - Resolved', value: '254' },
  { label: '255 - Custom', value: '255' },
];

const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = [
  { id: 'name', label: 'Name', visible: true, order: 0 },
  { id: 'time', label: 'Time', visible: true, order: 1 },
  { id: 'severity', label: 'Severity', visible: true, order: 2 },
  { id: 'object', label: 'Object', visible: true, order: 3 },
  { id: 'age', label: 'Age', visible: true, order: 4 },
  { id: 'resolutionState', label: 'Resolution State', visible: true, order: 5 },
  { id: 'id', label: 'ID', visible: true, order: 6 },
  { id: 'description', label: 'Description', visible: true, order: 7 },
];

export const AppConfig = ({ plugin }: Props) => {
  const { enabled, jsonData, secureJsonFields } = plugin.meta;
  const [passwordCopy, setPasswordCopy] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ScomDataSourceOptions>({
    url: jsonData?.url || '',
    userName: jsonData?.userName || '',
    isSkipTlsVerifyCheck: jsonData?.isSkipTlsVerifyCheck || false,
    resolutionStates: jsonData?.resolutionStates || DEFAULT_RESOLUTION_STATES,
    columnConfig: jsonData?.columnConfig || DEFAULT_COLUMN_CONFIG,
  });
  const [resolutionStatesText, setResolutionStatesText] = useState(
    JSON.stringify(settings.resolutionStates, null, 2)
  );
  const [columnConfigText, setColumnConfigText] = useState(
    JSON.stringify(settings.columnConfig || DEFAULT_COLUMN_CONFIG, null, 2)
  );

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      url: event.target.value,
    });
  };

  const onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      userName: event.target.value,
    });
  };

  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordCopy(event.target.value);
  };

  const onSkipTlsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      isSkipTlsVerifyCheck: event.target.checked,
    });
  };

  return (
    <div>
      <FieldSet label="SCOM Connection Settings">
        <InlineField label="SCOM URL" labelWidth={20} tooltip="The URL of your SCOM web console">
          <Input
            onChange={onUrlChange}
            value={settings.url}
            placeholder="e.g. http://localhost"
            width={60}
          />
        </InlineField>

        <InlineField label="Username" labelWidth={20} tooltip="SCOM username (domain\username format)">
          <Input
            onChange={onUsernameChange}
            value={settings.userName}
            placeholder="e.g. contoso\administrator"
            width={60}
          />
        </InlineField>

        <InlineField
          label="Password"
          labelWidth={20}
          tooltip="Password for the SCOM user"
        >
          <Input
            onChange={onPasswordChange}
            value={passwordCopy}
            width={60}
            type="password"
            placeholder={secureJsonFields?.password ? 'configured' : 'enter password'}
          />
        </InlineField>

        <br />
        <Checkbox
          value={settings.isSkipTlsVerifyCheck}
          onChange={onSkipTlsChange}
          label="Skip TLS cert validation"
          description="Enable if using self-signed certificates"
        />
      </FieldSet>

      <FieldSet label="Resolution States Configuration">
        <Field
          label="Resolution States"
          description="Configure available resolution states in JSON format. Each state needs a 'label' and 'value'."
        >
          <TextArea
            value={resolutionStatesText}
            onChange={(e) => setResolutionStatesText(e.currentTarget.value)}
            rows={12}
            placeholder='[{"label": "0 - New", "value": "0"}]'
          />
        </Field>
        <div style={{ marginTop: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setResolutionStatesText(JSON.stringify(DEFAULT_RESOLUTION_STATES, null, 2));
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </FieldSet>

      <FieldSet label="Column Configuration">
        <Field
          label="Column Settings"
          description="Configure which columns to display and their order in JSON format. Each column needs 'id', 'label', 'visible', and 'order'."
        >
          <TextArea
            value={columnConfigText}
            onChange={(e) => setColumnConfigText(e.currentTarget.value)}
            rows={18}
            placeholder='[{"id": "name", "label": "Name", "visible": true, "order": 0}]'
          />
        </Field>
        <div style={{ marginTop: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setColumnConfigText(JSON.stringify(DEFAULT_COLUMN_CONFIG, null, 2));
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </FieldSet>

      <FieldSet>
        {saveStatus && (
          <Alert title={saveStatus.type === 'success' ? 'Success' : 'Error'} severity={saveStatus.type}>
            {saveStatus.message}
          </Alert>
        )}

        <div style={{ marginTop: '20px' }}>
          <Button
            type="submit"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              setSaveStatus(null);

              try {
                // Validate and parse resolution states
                let parsedResolutionStates: ResolutionState[];
                try {
                  parsedResolutionStates = JSON.parse(resolutionStatesText);
                  if (!Array.isArray(parsedResolutionStates)) {
                    throw new Error('Resolution states must be an array');
                  }
                  // Validate each state has label and value
                  parsedResolutionStates.forEach((state, index) => {
                    if (!state.label || !state.value) {
                      throw new Error(`State at index ${index} must have both 'label' and 'value' fields`);
                    }
                  });
                } catch (parseError: any) {
                  setSaveStatus({
                    type: 'error',
                    message: `Invalid resolution states JSON: ${parseError.message}`,
                  });
                  setIsSaving(false);
                  return;
                }

                // Validate and parse column configuration
                let parsedColumnConfig: ColumnConfig[];
                try {
                  parsedColumnConfig = JSON.parse(columnConfigText);
                  if (!Array.isArray(parsedColumnConfig)) {
                    throw new Error('Column configuration must be an array');
                  }
                  // Validate each column has required fields
                  parsedColumnConfig.forEach((column, index) => {
                    if (!column.id || !column.label || column.visible === undefined || column.order === undefined) {
                      throw new Error(`Column at index ${index} must have 'id', 'label', 'visible', and 'order' fields`);
                    }
                    if (typeof column.visible !== 'boolean') {
                      throw new Error(`Column at index ${index}: 'visible' must be a boolean`);
                    }
                    if (typeof column.order !== 'number') {
                      throw new Error(`Column at index ${index}: 'order' must be a number`);
                    }
                  });
                } catch (parseError: any) {
                  setSaveStatus({
                    type: 'error',
                    message: `Invalid column configuration JSON: ${parseError.message}`,
                  });
                  setIsSaving(false);
                  return;
                }

                const payload: any = {
                  enabled,
                  pinned: false,
                  jsonData: {
                    ...settings,
                    resolutionStates: parsedResolutionStates,
                    columnConfig: parsedColumnConfig,
                  },
                };

                if (passwordCopy) {
                  payload.secureJsonData = { password: passwordCopy };
                }

                await getBackendSrv().post(`/api/plugins/${plugin.meta.id}/settings`, payload);

                setSaveStatus({
                  type: 'success',
                  message: 'Settings saved successfully! The plugin will reload with new settings.',
                });

                // Clear password field after successful save
                setPasswordCopy('');

                // Reload after 2 seconds to pick up new settings
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              } catch (error: any) {
                setSaveStatus({
                  type: 'error',
                  message: `Failed to save settings: ${error.message || 'Unknown error'}`,
                });
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </FieldSet>

      <FieldSet label="Plugin Information">
        <p>
          <strong>Plugin ID:</strong> {plugin.meta.id}
        </p>
        <p>
          <strong>Version:</strong> {plugin.meta.info.version}
        </p>
        <p>
          <strong>Enabled:</strong> {enabled ? 'Yes' : 'No'}
        </p>
      </FieldSet>
    </div>
  );
};
