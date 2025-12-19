import React, { useEffect } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { ScomDataSource } from '../datasource';
import { ScomDataSourceOptions, ScomQuery, AlertQuery } from '../types';
import { DsProvider } from './providers/ds.provider';
import { QueryEditor } from './QueryEditor';

type Props = QueryEditorProps<ScomDataSource, ScomQuery, ScomDataSourceOptions>;

// onRunQuery calls 'query' in the backend.
// datasource calls 'CallResource' in the backend.
export function QueryEditorLayout({ query, onChange, onRunQuery, datasource }: Props) {
  // Automatically trigger query on mount
  useEffect(() => {
    if (!query.type) {
      const alertQuery: AlertQuery = {
        refId: query.refId,
        type: 'alerts',
        criteria: 'Severity = 2 AND ResolutionState = 0'
      };
      onChange(alertQuery);
      setTimeout(() => onRunQuery(), 100);
    } else if (query.type === 'alerts') {
      // Ensure the query runs even if type is already set
      setTimeout(() => onRunQuery(), 100);
    }
  }, []);

  return (
    <DsProvider datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery}>
      <QueryEditor />
    </DsProvider>
  );
}
