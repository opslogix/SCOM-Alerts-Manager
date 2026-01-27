import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { AlertQuery, ScomAlert, ScomDataSourceOptions, ScomQuery } from '../shared/types';

export class ScomDataSource extends DataSourceWithBackend<ScomQuery, ScomDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<ScomDataSourceOptions>) {
    super(instanceSettings);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDefaultQuery(app: CoreApp): Partial<AlertQuery> {
    return {
      type: 'alerts',
      criteria: 'ResolutionState = 0',
    };
  }

  async getAlerts(criteria: string): Promise<ScomAlert[]> {
    return this.getResource('alerts', { criteria });
  }

  async updateAlertResolutionState(alertId: string, resolutionState: string): Promise<void> {
    return this.postResource('updateAlertResolutionState', { alertId, resolutionState });
  }
}
