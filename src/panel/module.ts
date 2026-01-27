import { PanelPlugin } from '@grafana/data';
import { ScomAlertsPanel } from './ScomAlertsPanel';
import { ScomAlertsPanelOptions } from './types';

export const plugin = new PanelPlugin<ScomAlertsPanelOptions>(ScomAlertsPanel).setPanelOptions((builder) => {
  return builder.addBooleanSwitch({
    path: 'showContextMenu',
    name: 'Enable Context Menu',
    description: 'Allow right-click to update resolution states',
    defaultValue: true,
  });
});
