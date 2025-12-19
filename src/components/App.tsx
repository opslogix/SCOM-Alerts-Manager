import React, { useState, useEffect, useRef } from 'react';
import { AppRootProps, SelectableValue } from '@grafana/data';
import { Alert, Button, ContextMenu, MenuItem, Spinner, useStyles2, Select, Icon } from '@grafana/ui';
import { css } from '@emotion/css';
import { getBackendSrv } from '@grafana/runtime';
import { ResolutionState, ColumnConfig } from '../types';

interface ScomAlert {
  id: string;
  name: string;
  severity: string;
  description: string;
  objectDisplayName: string;
  age: string;
  resolutionState: string;
}

const DEFAULT_RESOLUTION_STATES: ResolutionState[] = [
  { label: '0 - New', value: '0' },
  { label: '200 - Closed', value: '200' },
  { label: '247 - Awaiting Evidence', value: '247' },
  { label: '248 - Assigned to Engineering', value: '248' },
  { label: '249 - Acknowledged', value: '249' },
  { label: '250 - Scheduled', value: '250' },
  { label: '254 - Resolved', value: '254' },
  { label: '255 - Custom', value: '255' },
];

const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = [
  { id: 'name', label: 'Name', visible: true, order: 0 },
  { id: 'time', label: 'Time', visible: true, order: 1 },
  { id: 'severity', label: 'Severity', visible: true, order: 2 },
  { id: 'object', label: 'Object', visible: true, order: 3 },
  { id: 'age', label: 'Age', visible: true, order: 4 },
  { id: 'resolutionState', label: 'Resolution State', visible: true, order: 5 },
  { id: 'id', label: 'ID', visible: true, order: 6 },
  { id: 'description', label: 'Description', visible: true, order: 7 },
];

const REFRESH_INTERVALS: Array<SelectableValue<number>> = [
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

export function App(props: AppRootProps) {
  const [alerts, setAlerts] = useState<ScomAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    alertId: string;
  } | null>(null);

  // Load criteria from localStorage, default to 'ResolutionState = 0'
  const [criteria, setCriteria] = useState(() => {
    const saved = localStorage.getItem('scom-alerts-criteria');
    return saved || 'ResolutionState = 0';
  });

  const [refreshInterval, setRefreshInterval] = useState<SelectableValue<number>>(REFRESH_INTERVALS[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const styles = useStyles2(getStyles);

  // Get resolution states from plugin configuration
  const resolutionStates: ResolutionState[] =
    props.meta.jsonData?.resolutionStates || DEFAULT_RESOLUTION_STATES;

  // Get column configuration from plugin configuration
  const columnConfig: ColumnConfig[] =
    props.meta.jsonData?.columnConfig || DEFAULT_COLUMN_CONFIG;

  // Sort and filter columns based on configuration
  const visibleColumns = columnConfig
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  // Persist criteria to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('scom-alerts-criteria', criteria);
  }, [criteria]);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getBackendSrv().get(
        `/api/plugins/opslogix-scomalerts-app/resources/alerts?criteria=${encodeURIComponent(criteria)}`
      );

      if (response && Array.isArray(response)) {
        setAlerts(response);
      } else {
        setAlerts([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const updateResolutionState = async (alertId: string, newState: string) => {
    try {
      await getBackendSrv().post(
        `/api/plugins/opslogix-scomalerts-app/resources/updateAlertResolutionState?alertId=${alertId}&resolutionState=${newState}`
      );

      // Refresh alerts
      await loadAlerts();
      setContextMenu(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to update resolution state');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, alertId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      alertId,
    });
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval if value > 0
    if (refreshInterval.value && refreshInterval.value > 0) {
      intervalRef.current = setInterval(() => {
        loadAlerts();
      }, refreshInterval.value * 1000);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval]);

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
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>SCOM Alerts</h2>
        </div>
        <div className={styles.toolbarRight}>
          <input
            type="text"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Filter criteria (e.g., ResolutionState = 0)"
            className={styles.filterInput}
          />
          <Select
            options={REFRESH_INTERVALS}
            value={refreshInterval}
            onChange={(v) => setRefreshInterval(v)}
            width={12}
            prefix={<Icon name="clock-nine" />}
          />
          <Button onClick={loadAlerts} icon="sync" disabled={loading} variant="secondary" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert title="Error" severity="error">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className={styles.loading}>
          <Spinner size="xl" />
        </div>
      ) : (
        <div className={styles.panelContainer}>
          <div className={styles.panelHeader}>New panel</div>
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
                    onContextMenu={(e) => handleContextMenu(e, alert.id)}
                    className={styles.row}
                  >
                    {visibleColumns.map((column) => (
                      <React.Fragment key={column.id}>
                        {renderCell(column.id, alert)}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {alerts.length === 0 && <div className={styles.noData}>No alerts found</div>}
          </div>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          renderMenuItems={renderMenuItems}
        />
      )}
    </div>
  );
}

const getStyles = () => ({
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--grafana-background-primary, #181b1f);
  `,
  toolbar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--grafana-background-secondary, #1f1f20);
    border-bottom: 1px solid var(--grafana-border-weak, #2a2e33);
  `,
  toolbarLeft: css`
    display: flex;
    align-items: center;
  `,
  title: css`
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--grafana-text-primary, #d8d9da);
  `,
  toolbarRight: css`
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  filterInput: css`
    padding: 6px 10px;
    background: var(--grafana-background-primary, #181b1f);
    border: 1px solid var(--grafana-border-medium, #2a2e33);
    border-radius: 2px;
    color: var(--grafana-text-primary, #d8d9da);
    font-size: 13px;
    width: 350px;

    &:focus {
      outline: none;
      border-color: var(--grafana-border-strong, #3f4448);
    }

    &::placeholder {
      color: var(--grafana-text-secondary, #6e7680);
    }
  `,
  loading: css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
  `,
  panelContainer: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 16px;
    background: var(--grafana-background-secondary, #1f1f20);
    border: 1px solid var(--grafana-border-weak, #2a2e33);
    border-radius: 2px;
    overflow: hidden;
  `,
  panelHeader: css`
    padding: 8px 12px;
    background: var(--grafana-background-secondary, #1f1f20);
    border-bottom: 1px solid var(--grafana-border-weak, #2a2e33);
    font-size: 12px;
    font-weight: 500;
    color: var(--grafana-text-secondary, #6e7680);
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
