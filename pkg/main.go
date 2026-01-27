package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/opslogix/scom-plugin-by-opslogix/pkg/plugin"
)

func main() {
	// Start listening to requests sent from Grafana for a datasource plugin
	if err := datasource.Manage("opslogix-scomalerts-datasource", plugin.NewDatasource, datasource.ManageOpts{}); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
