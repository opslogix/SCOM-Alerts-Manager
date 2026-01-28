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
  { id: 'monitoringobjectpath', label: 'Object Path', visible: false, order: 8 },
  { id: 'priority', label: 'Priority', visible: false, order: 9 },
  { id: 'timeraised', label: 'Time Raised', visible: false, order: 10 },
  { id: 'timeadded', label: 'Time Added', visible: false, order: 11 },
  { id: 'timeresolved', label: 'Time Resolved', visible: false, order: 12 },
  { id: 'maintenancemode', label: 'Maintenance Mode', visible: false, order: 13 },
  { id: 'owner', label: 'Owner', visible: false, order: 14 },
  { id: 'context', label: 'Context', visible: false, order: 15 },
  { id: 'customfield1', label: 'Custom Field 1', visible: false, order: 16 },
  { id: 'customfield2', label: 'Custom Field 2', visible: false, order: 17 },
  { id: 'customfield3', label: 'Custom Field 3', visible: false, order: 18 },
  { id: 'customfield4', label: 'Custom Field 4', visible: false, order: 19 },
  { id: 'customfield5', label: 'Custom Field 5', visible: false, order: 20 },
  { id: 'customfield6', label: 'Custom Field 6', visible: false, order: 21 },
  { id: 'customfield7', label: 'Custom Field 7', visible: false, order: 22 },
  { id: 'customfield8', label: 'Custom Field 8', visible: false, order: 23 },
  { id: 'customfield9', label: 'Custom Field 9', visible: false, order: 24 },
  { id: 'customfield10', label: 'Custom Field 10', visible: false, order: 25 },
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
