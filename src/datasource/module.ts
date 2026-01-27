import { DataSourcePlugin } from '@grafana/data';
import { ScomDataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { ScomDataSourceOptions, ScomQuery } from '../shared/types';

export const plugin = new DataSourcePlugin<ScomDataSource, ScomQuery, ScomDataSourceOptions>(ScomDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
