import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface ScomQuery extends DataQuery {
  type: 'state' | 'alerts' | 'performance';
}

export interface StateQuery extends ScomQuery {
  type: 'state';
  classes?: MonitoringClass[];
  groups?: MonitoringGroup[];
  instances?: MonitoringObject[];
}

export interface AlertQuery extends ScomQuery {
  type: 'alerts';
  criteria?: string;
}

export interface PerformanceQuery extends ScomQuery {
  type: 'performance';
  classes?: MonitoringClass[];
  counters?: PerformanceCounter[];
  groups?: MonitoringGroup[];
  instances?: MonitoringObject[];
}

export interface ResolutionState {
  label: string;
  value: string;
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface ScomDataSourceOptions extends DataSourceJsonData {
  url?: string;
  userName?: string;
  password?: string;
  isSkipTlsVerifyCheck?: boolean;
  resolutionStates?: ResolutionState[];
  columnConfig?: ColumnConfig[];
}

export interface SecureJsonData {
  password: string;
}

export interface PerformanceCounter {
  objectName: string;
  counterName: string;
  instanceName: string;
}

export interface MonitoringClass {
  id: string;
  displayName: string;
  className: string;
  path: string | null;
  fullName: string;
}

export type MonitoringObject = {
  id: string;
  displayName: string;
  path: null | string;
  fullname: string;
  classname: string;
};

export type MonitoringGroup = {
  id: string;
  displayName: string;
  className: string;
  path: null | string;
  fullname: string;
};

export interface ScomAlert {
  id: string;
  name: string;
  severity: string;
  description: string;
  objectDisplayName: string;
  age: string;
  resolutionState: string;
}
