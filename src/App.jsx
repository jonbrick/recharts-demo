import React, { useState } from "react";
import { ControlsContainer, ChartTypeSelector } from "./ChartControls.jsx";
import { MetricsSummary } from "./MetricsSummary.jsx";
import { ChartRenderer } from "./ChartRenderer.jsx";
import { dataSourceConfig } from "./chartConfig.js";
import { githubActionsData, pagerDutyData, githubPRData } from "./data.js";

export default function App() {
  const [chartType, setChartType] = useState("area");
  const [granularity, setGranularity] = useState("monthly");
  const [selectedTable, setSelectedTable] = useState("githubActions");
  const [selectedMetric, setSelectedMetric] = useState("deployments");
  const [operator, setOperator] = useState("average");

  // Available data tables
  const dataTables = {
    githubActions: githubActionsData,
    pagerDuty: pagerDutyData,
    githubPR: githubPRData,
  };

  const data = dataTables[selectedTable];
  const config = dataSourceConfig[selectedTable];

  // Replace your existing allTimeData calculation with this:
  const allTimeData =
    operator === "average"
      ? calculateAverageData(data, selectedTable)
      : calculateSumData(data, selectedTable);

  console.log("Operator:", operator);
  console.log("AllTimeData:", allTimeData);
  console.log("Selected metric:", selectedMetric);
  console.log("Value:", allTimeData[0][selectedMetric]);

  // REPLACE the calculateAverageData and calculateSumData functions with this:
  function calculateAverageData(data, selectedTable) {
    console.log("CALCULATING AVERAGE"); // ADD THIS

    const config = dataSourceConfig[selectedTable];
    const result = { name: "All Time" };

    [...config.metrics, config.overlayMetric].forEach((metric) => {
      const sum = data.reduce((sum, row) => sum + (row[metric.key] || 0), 0);
      result[metric.key] = sum / data.length; // Always average
    });

    return [result];
  }

  function calculateSumData(data, selectedTable) {
    console.log("CALCULATING SUM"); // ADD THIS

    const config = dataSourceConfig[selectedTable];
    const result = { name: "All Time" };

    [...config.metrics, config.overlayMetric].forEach((metric) => {
      result[metric.key] = data.reduce(
        // Always sum
        (sum, row) => sum + (row[metric.key] || 0),
        0
      );
    });

    return [result];
  }

  // Get the current dataset based on granularity
  const currentData = granularity === "monthly" ? data : allTimeData;

  const handleTableChange = (newTable) => {
    setSelectedTable(newTable);
    // Reset to first metric of new data source
    const newConfig = dataSourceConfig[newTable];
    setSelectedMetric(newConfig.metrics[0].key);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <ControlsContainer
        selectedTable={selectedTable}
        onTableChange={handleTableChange}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        operator={operator}
        onOperatorChange={setOperator}
        granularity={granularity}
        onGranularityChange={setGranularity}
      />

      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-700">
              {config.title}
            </h2>
            <p className="text-gray-600">{config.description}</p>
          </div>

          <div className="ml-4 flex flex-col gap-4">
            <ChartTypeSelector
              chartType={chartType}
              onChartTypeChange={setChartType}
            />
          </div>
        </div>

        <MetricsSummary
          key={`${operator}-${selectedMetric}`} // ADD THIS LINE
          selectedTable={selectedTable}
          currentData={currentData}
          granularity={granularity}
          selectedMetric={selectedMetric}
          operator={operator}
        />
        <ChartRenderer
          chartType={chartType}
          currentData={currentData}
          selectedTable={selectedTable}
          selectedMetric={selectedMetric}
          granularity={granularity}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Data Source: {config.name}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-blue-600">
              {config.icon} {config.name} Metrics:
            </h4>
            <ul className="flex flex-col gap-2 text-gray-700 text-sm">
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

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-green-600">📊 Pattern 1 Demo:</h4>
            <ul className="flex flex-col gap-2 text-gray-700 text-sm">
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
