import { DataSourcePlugin } from '@grafana/data';
import { ScomDataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { ScomDataSourceOptions, ScomQuery, SecureJsonData } from '../shared/types';

export const plugin = new DataSourcePlugin<ScomDataSource, ScomQuery, ScomDataSourceOptions, SecureJsonData>(
  ScomDataSource
)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
