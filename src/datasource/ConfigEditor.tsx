import React, { ChangeEvent, useState } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Alert, Button, Checkbox, Field, FieldSet, InlineField, Input, TextArea } from '@grafana/ui';
import { ScomDataSourceOptions, SecureJsonData, ResolutionState, ColumnConfig } from '../shared/types';
import { DEFAULT_RESOLUTION_STATES, DEFAULT_COLUMN_CONFIG } from '../shared/constants';

interface Props extends DataSourcePluginOptionsEditorProps<ScomDataSourceOptions, SecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData, secureJsonFields } = options;

  const [resolutionStatesText, setResolutionStatesText] = useState(
    JSON.stringify(jsonData.resolutionStates || DEFAULT_RESOLUTION_STATES, null, 2)
  );
  const [columnConfigText, setColumnConfigText] = useState(
    JSON.stringify(jsonData.columnConfig || DEFAULT_COLUMN_CONFIG, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        url: event.target.value,
      },
    });
  };

  const onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        userName: event.target.value,
      },
    });
  };

  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        password: event.target.value,
      },
    });
  };

  const onResetPassword = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        password: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        password: '',
      },
    });
  };

  const onSkipTlsChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        isSkipTlsVerifyCheck: event.target.checked,
      },
    });
  };

  const onResolutionStatesChange = (value: string) => {
    setResolutionStatesText(value);
    try {
      const parsed: ResolutionState[] = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('Resolution states must be an array');
      }
      parsed.forEach((state, index) => {
        if (!state.label || !state.value) {
          throw new Error(`State at index ${index} must have both 'label' and 'value' fields`);
        }
      });
      setJsonError(null);
      onOptionsChange({
        ...options,
        jsonData: {
          ...jsonData,
          resolutionStates: parsed,
        },
      });
    } catch (e: any) {
      setJsonError(`Resolution states: ${e.message}`);
    }
  };

  const onColumnConfigChange = (value: string) => {
    setColumnConfigText(value);
    try {
      const parsed: ColumnConfig[] = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('Column configuration must be an array');
      }
      parsed.forEach((column, index) => {
        if (!column.id || !column.label || column.visible === undefined || column.order === undefined) {
          throw new Error(`Column at index ${index} must have 'id', 'label', 'visible', and 'order' fields`);
        }
      });
      setJsonError(null);
      onOptionsChange({
        ...options,
        jsonData: {
          ...jsonData,
          columnConfig: parsed,
        },
      });
    } catch (e: any) {
      setJsonError(`Column config: ${e.message}`);
    }
  };

  return (
    <div>
      <FieldSet label="SCOM Connection Settings">
        <InlineField label="SCOM URL" labelWidth={20} tooltip="The URL of your SCOM web console">
          <Input
            onChange={onUrlChange}
            value={jsonData.url || ''}
            placeholder="e.g. http://localhost"
            width={60}
          />
        </InlineField>

        <InlineField label="Username" labelWidth={20} tooltip="SCOM username (domain\username format)">
          <Input
            onChange={onUsernameChange}
            value={jsonData.userName || ''}
            placeholder="e.g. contoso\administrator"
            width={60}
          />
        </InlineField>

        <InlineField label="Password" labelWidth={20} tooltip="Password for the SCOM user">
          {secureJsonFields?.password ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input disabled value="configured" width={40} />
              <Button variant="secondary" type="button" onClick={onResetPassword}>
                Reset
              </Button>
            </div>
          ) : (
            <Input
              onChange={onPasswordChange}
              value={options.secureJsonData?.password || ''}
              type="password"
              placeholder="Enter password"
              width={60}
            />
          )}
        </InlineField>

        <br />
        <Checkbox
          value={jsonData.isSkipTlsVerifyCheck || false}
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
            onChange={(e) => onResolutionStatesChange(e.currentTarget.value)}
            rows={12}
            placeholder='[{"label": "0 - New", "value": "0"}]'
          />
        </Field>
        <div style={{ marginTop: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const defaultText = JSON.stringify(DEFAULT_RESOLUTION_STATES, null, 2);
              setResolutionStatesText(defaultText);
              onResolutionStatesChange(defaultText);
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </FieldSet>

      <FieldSet label="Column Configuration">
        <Field
          label="Column Settings"
          description="Configure which columns to display and their order in JSON format."
        >
          <TextArea
            value={columnConfigText}
            onChange={(e) => onColumnConfigChange(e.currentTarget.value)}
            rows={18}
            placeholder='[{"id": "name", "label": "Name", "visible": true, "order": 0}]'
          />
        </Field>
        <div style={{ marginTop: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const defaultText = JSON.stringify(DEFAULT_COLUMN_CONFIG, null, 2);
              setColumnConfigText(defaultText);
              onColumnConfigChange(defaultText);
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </FieldSet>

      {jsonError && (
        <Alert title="JSON Error" severity="error">
          {jsonError}
        </Alert>
      )}
    </div>
  );
}
