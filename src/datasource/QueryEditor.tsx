import React, { ChangeEvent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InlineField, Input } from '@grafana/ui';
import { ScomDataSource } from './datasource';
import { ScomDataSourceOptions, AlertQuery } from '../shared/types';

type Props = QueryEditorProps<ScomDataSource, AlertQuery, ScomDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onCriteriaChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, type: 'alerts', criteria: event.target.value });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onRunQuery();
    }
  };

  return (
    <div className="gf-form">
      <InlineField
        label="Criteria"
        labelWidth={12}
        tooltip="WMI filter criteria for alerts (e.g., 'Severity = 2 AND ResolutionState = 0')"
        grow
      >
        <Input
          value={query.criteria || ''}
          onChange={onCriteriaChange}
          onKeyDown={onKeyDown}
          onBlur={onRunQuery}
          placeholder="e.g., Severity = 2 AND ResolutionState = 0"
        />
      </InlineField>
    </div>
  );
}
