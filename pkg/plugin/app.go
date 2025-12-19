package plugin

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
)

// NewAppInstance creates a new app instance
func NewAppInstance(ctx context.Context, settings backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	// Convert app settings to datasource settings format
	dsSettings := backend.DataSourceInstanceSettings{
		ID:                      0,
		UID:                     "scom-alerts",
		Type:                    "opslogix-scomalerts-app",
		Name:                    "SCOM Alerts",
		URL:                     "",
		User:                    "",
		Database:                "",
		BasicAuthEnabled:        false,
		BasicAuthUser:           "",
		JSONData:                settings.JSONData,
		DecryptedSecureJSONData: settings.DecryptedSecureJSONData,
		Updated:                 settings.Updated,
	}

	// Reuse the existing datasource implementation
	return NewDatasource(ctx, dsSettings)
}
