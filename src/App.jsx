import React, { useState } from "react";
import { githubActionsData, pagerDutyData } from "./data.js";
import { ControlsContainer, ChartTypeSelector } from "./ChartControls.jsx";
import { MetricsSummary } from "./MetricsSummary.jsx";
import { ChartRenderer } from "./ChartRenderer.jsx";
import { dataSourceConfig } from "./chartConfig.js";

export default function App() {
  const [chartType, setChartType] = useState("area");
  const [granularity, setGranularity] = useState("monthly");
  const [selectedTable, setSelectedTable] = useState("githubActions");
  const [selectedMetric, setSelectedMetric] = useState("deployments");

  // Available data tables
  const dataTables = {
    githubActions: githubActionsData,
    pagerDuty: pagerDutyData,
  };

  const data = dataTables[selectedTable];
  const config = dataSourceConfig[selectedTable];

  // Calculate all-time aggregated data
  const allTimeData = [
    {
      name: "All Time",
      deployments: data.reduce((sum, row) => sum + (row.deployments || 0), 0),
      successRate:
        data.reduce((sum, row) => sum + (row.successRate || 0), 0) /
        data.length,
      buildTimeMinutes:
        data.reduce((sum, row) => sum + (row.buildTimeMinutes || 0), 0) /
        data.length,
      testsRun: data.reduce((sum, row) => sum + (row.testsRun || 0), 0),
      incidents: data.reduce((sum, row) => sum + (row.incidents || 0), 0),
      mttrMinutes:
        data.reduce((sum, row) => sum + (row.mttrMinutes || 0), 0) /
        data.length,
      criticalIncidents: data.reduce(
        (sum, row) => sum + (row.criticalIncidents || 0),
        0
      ),
      usersAffected: data.reduce(
        (sum, row) => sum + (row.usersAffected || 0),
        0
      ),
    },
  ];

  // Get the current dataset based on granularity
  const currentData = granularity === "monthly" ? data : allTimeData;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <ControlsContainer
        selectedTable={selectedTable}
        onTableChange={setSelectedTable}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        granularity={granularity}
        onGranularityChange={setGranularity}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />

      <MetricsSummary
        selectedTable={selectedTable}
        currentData={currentData}
        granularity={granularity}
        isStacked={chartType === "area"}
      />

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {config.title}
            </h2>
            <p className="text-gray-600 mb-6">{config.description}</p>
          </div>

          <div className="ml-4">
            <ChartTypeSelector
              chartType={chartType}
              onChartTypeChange={setChartType}
            />
          </div>
        </div>

        <ChartRenderer
          chartType={chartType}
          currentData={currentData}
          selectedTable={selectedTable}
          selectedMetric={selectedMetric}
          granularity={granularity}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Data Source: {config.name}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-600">
              {config.icon} {config.name} Metrics:
            </h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              {config.metrics.map((metric) => (
                <li key={metric.key}>
                  • <strong>{metric.label}:</strong> {metric.description}
                </li>
              ))}
              {config.overlayMetric && (
                <li>
                  • <strong>{config.overlayMetric.label}:</strong>{" "}
                  {config.overlayMetric.description}
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-green-600">📊 Pattern 1 Demo:</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Switch between data sources using the dropdown</li>
              <li>• Toggle between stacked and overlapping views</li>
              <li>• Try different chart types for the same data</li>
              <li>• Observe correlations in the data patterns</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>💡 Next Steps:</strong> This demonstrates Pattern 1 (Single
            Source Time Series). Pattern 2 will combine multiple sources, and
            Pattern 3 will add scatter plot correlations.
          </p>
        </div>
      </div>
    </div>
  );
}
