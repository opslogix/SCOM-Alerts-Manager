package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend/app"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/opslogix/scom-plugin-by-opslogix/pkg/plugin"
)

func main() {
	// Start listening to requests sent from Grafana for an app plugin
	if err := app.Manage("opslogix-scomalerts-app", plugin.NewAppInstance, app.ManageOpts{}); err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}
