import { SelectableValue } from '@grafana/data';
import { ResolutionState, ColumnConfig, AlertQuery } from './types';

export const DEFAULT_RESOLUTION_STATES: ResolutionState[] = [
  { label: '0 - New', value: '0' },
  { label: '200 - Closed', value: '200' },
  { label: '247 - Awaiting Evidence', value: '247' },
  { label: '248 - Assigned to Engineering', value: '248' },
  { label: '249 - Acknowledged', value: '249' },
  { label: '250 - Scheduled', value: '250' },
  { label: '254 - Resolved', value: '254' },
  { label: '255 - Custom', value: '255' },
];

export const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = [
  { id: 'name', label: 'Name', visible: true, order: 0 },
  { id: 'time', label: 'Time', visible: true, order: 1 },
  { id: 'severity', label: 'Severity', visible: true, order: 2 },
  { id: 'object', label: 'Object', visible: true, order: 3 },
  { id: 'age', label: 'Age', visible: true, order: 4 },
  { id: 'resolutionState', label: 'Resolution State', visible: true, order: 5 },
  { id: 'id', label: 'ID', visible: true, order: 6 },
  { id: 'description', label: 'Description', visible: true, order: 7 },
];

export const REFRESH_INTERVALS: Array<SelectableValue<number>> = [
  { label: 'Off', value: 0 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '15m', value: 900 },
  { label: '30m', value: 1800 },
  { label: '1h', value: 3600 },
];

export const DEFAULT_QUERY: Partial<AlertQuery> = {
  type: 'alerts',
  criteria: 'Severity = 2 AND ResolutionState = 0',
};

export const PLUGIN_ID = 'opslogix-scomalerts-datasource';
