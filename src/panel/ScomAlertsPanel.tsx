import React, { useState, useMemo } from 'react';
import { PanelProps } from '@grafana/data';
import { ContextMenu, MenuItem, useStyles2 } from '@grafana/ui';
import { getDataSourceSrv } from '@grafana/runtime';
import { css } from '@emotion/css';
import { ScomAlertsPanelOptions } from './types';
import { ScomDataSource } from '../datasource/datasource';
import { ScomAlert, ColumnConfig, ResolutionState } from '../shared/types';
import { DEFAULT_COLUMN_CONFIG, DEFAULT_RESOLUTION_STATES } from '../shared/constants';

interface Props extends PanelProps<ScomAlertsPanelOptions> {}

export const ScomAlertsPanel: React.FC<Props> = ({ data, options, width, height }) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    alertId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles = useStyles2(getStyles);

  const alerts: ScomAlert[] = useMemo(() => {
    if (!data.series || data.series.length === 0) {
      return [];
    }

    const frame = data.series[0];
    const rowCount = frame.length;
    const result: ScomAlert[] = [];

    const getFieldValues = (name: string): any[] => {
      const field = frame.fields.find((f) => f.name.toLowerCase() === name.toLowerCase());
      return field ? Array.from(field.values) : [];
    };

    const ids = getFieldValues('id');
    const names = getFieldValues('name');
    const severities = getFieldValues('severity');
    const descriptions = getFieldValues('description');
    const objectDisplayNames = getFieldValues('object display name');
    const ages = getFieldValues('age');
    const resolutionStates = getFieldValues('resolution state');

    for (let i = 0; i < rowCount; i++) {
      result.push({
        id: ids[i] || '',
        name: names[i] || '',
        severity: String(severities[i] || ''),
        description: descriptions[i] || '',
        objectDisplayName: objectDisplayNames[i] || '',
        age: ages[i] || '',
        resolutionState: String(resolutionStates[i] || ''),
      });
    }

    return result;
  }, [data.series]);

  const { columnConfig, resolutionStates } = useMemo(() => {
    let columnConfig: ColumnConfig[] = DEFAULT_COLUMN_CONFIG;
    let resolutionStates: ResolutionState[] = DEFAULT_RESOLUTION_STATES;

    if (data.request?.targets?.[0]?.datasource) {
      const dsSettings = getDataSourceSrv().getInstanceSettings(data.request.targets[0].datasource);
      if (dsSettings?.jsonData) {
        const jsonData = dsSettings.jsonData as any;
        if (jsonData.columnConfig) {
          columnConfig = jsonData.columnConfig;
        }
        if (jsonData.resolutionStates) {
          resolutionStates = jsonData.resolutionStates;
        }
      }
    }

    return { columnConfig, resolutionStates };
  }, [data.request?.targets]);

  const visibleColumns = useMemo(() => {
    return columnConfig.filter((col) => col.visible).sort((a, b) => a.order - b.order);
  }, [columnConfig]);

  const handleContextMenu = (e: React.MouseEvent, alertId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      alertId,
    });
  };

  const updateResolutionState = async (alertId: string, newState: string) => {
    try {
      if (data.request?.targets?.[0]?.datasource) {
        const ds = (await getDataSourceSrv().get(data.request.targets[0].datasource)) as ScomDataSource;
        await ds.updateAlertResolutionState(alertId, newState);
      }
      setContextMenu(null);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to update resolution state');
      setContextMenu(null);
    }
  };

  const renderMenuItems = (): React.ReactNode[] => {
    if (!contextMenu) {
      return [];
    }

    return resolutionStates.map((state) => (
      <MenuItem
        key={state.value}
        label={state.label}
        onClick={() => updateResolutionState(contextMenu.alertId, state.value)}
      />
    ));
  };

  const renderCell = (columnId: string, alert: ScomAlert) => {
    switch (columnId) {
      case 'name':
        return <td className={styles.nameCell}>{alert.name}</td>;
      case 'time':
        return <td className={styles.timeCell}>{alert.age}</td>;
      case 'severity':
        return (
          <td>
            <span
              className={
                alert.severity === '0'
                  ? styles.severity0
                  : alert.severity === '1'
                    ? styles.severity1
                    : alert.severity === '2'
                      ? styles.severity2
                      : ''
              }
            >
              {alert.severity}
            </span>
          </td>
        );
      case 'object':
        return <td>{alert.objectDisplayName}</td>;
      case 'age':
        return <td>{alert.age}</td>;
      case 'resolutionState':
        return <td className={styles.stateCell}>{alert.resolutionState}</td>;
      case 'id':
        return <td className={styles.idCell}>{alert.id}</td>;
      case 'description':
        return <td className={styles.descriptionCell}>{alert.description}</td>;
      default:
        return <td></td>;
    }
  };

  return (
    <div className={styles.container} style={{ width, height }}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.id}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                onContextMenu={(e) => options.showContextMenu && handleContextMenu(e, alert.id)}
                className={styles.row}
              >
                {visibleColumns.map((column) => (
                  <React.Fragment key={column.id}>{renderCell(column.id, alert)}</React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {alerts.length === 0 && <div className={styles.noData}>No alerts found</div>}
      </div>

      {contextMenu && options.showContextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} renderMenuItems={renderMenuItems} />
      )}
    </div>
  );
};

const getStyles = () => ({
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  `,
  error: css`
    padding: 8px 12px;
    background: rgba(242, 73, 92, 0.1);
    border: 1px solid #f2495c;
    border-radius: 2px;
    color: #f2495c;
    margin-bottom: 8px;
  `,
  tableWrapper: css`
    flex: 1;
    overflow: auto;
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    font-family: 'Roboto Mono', monospace;

    th {
      padding: 6px 12px;
      text-align: left;
      background: var(--grafana-background-primary, #181b1f);
      color: var(--grafana-text-secondary, #6e7680);
      font-weight: 500;
      font-size: 11px;
      text-transform: uppercase;
      border-bottom: 1px solid var(--grafana-border-weak, #2a2e33);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    td {
      padding: 6px 12px;
      border-bottom: 1px solid var(--grafana-border-weak, #2a2e33);
      color: var(--grafana-text-primary, #d8d9da);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
  row: css`
    cursor: context-menu;

    &:hover {
      background-color: var(--grafana-background-canvas, #111217);
    }
  `,
  nameCell: css`
    font-weight: 500;
    max-width: 300px;
  `,
  timeCell: css`
    color: var(--grafana-text-secondary, #6e7680);
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
  `,
  stateCell: css`
    font-family: 'Roboto Mono', monospace;
  `,
  idCell: css`
    color: var(--grafana-text-secondary, #6e7680);
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
  `,
  descriptionCell: css`
    max-width: 400px;
    color: var(--grafana-text-secondary, #6e7680);
  `,
  severity0: css`
    padding: 2px 6px;
    border-radius: 2px;
    background-color: rgba(115, 191, 105, 0.15);
    color: #73bf69;
    font-weight: 500;
    font-size: 11px;
  `,
  severity1: css`
    padding: 2px 6px;
    border-radius: 2px;
    background-color: rgba(250, 222, 42, 0.15);
    color: #fade2a;
    font-weight: 500;
    font-size: 11px;
  `,
  severity2: css`
    padding: 2px 6px;
    border-radius: 2px;
    background-color: rgba(242, 73, 92, 0.15);
    color: #f2495c;
    font-weight: 500;
    font-size: 11px;
  `,
  noData: css`
    text-align: center;
    padding: 40px;
    color: var(--grafana-text-secondary, #6e7680);
  `,
});
