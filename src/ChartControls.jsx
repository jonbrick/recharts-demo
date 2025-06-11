// ChartControls.jsx - All chart control components

import React from "react";
import { dataSourceConfig, chartTypeConfig } from "./chartConfig.js";

export function DataSourceSelector({ selectedTable, onTableChange }) {
  return (
    <select
      value={selectedTable}
      onChange={(e) => onTableChange(e.target.value)}
      className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
    >
      {Object.entries(dataSourceConfig).map(([key, config]) => (
        <option key={key} value={key}>
          {config.icon} {config.name}
        </option>
      ))}
    </select>
  );
}

export function OperatorSelector() {
  return (
    <select
      value="average"
      disabled
      className="bg-gray-100 border border-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed transition-colors duration-200 shadow-sm"
    >
      <option value="average">Average</option>
    </select>
  );
}

export function MetricSelector({
  selectedTable,
  selectedMetric,
  onMetricChange,
}) {
  const config = dataSourceConfig[selectedTable];
  const allMetrics = [...config.metrics];
  if (config.overlayMetric) {
    allMetrics.push(config.overlayMetric);
  }

  return (
    <select
      value={selectedMetric}
      onChange={(e) => onMetricChange(e.target.value)}
      className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 shadow-sm"
    >
      {allMetrics.map((metric) => (
        <option key={metric.key} value={metric.key}>
          📊 {metric.label}
        </option>
      ))}
    </select>
  );
}

export function StackingToggle({ isStacked, onStackingChange }) {
  return (
    <button
      onClick={() => onStackingChange(!isStacked)}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
    >
      Switch to {isStacked ? "Overlapping" : "Stacked"} View
    </button>
  );
}

export function GranularityToggle({ granularity, onGranularityChange }) {
  return (
    <button
      onClick={() =>
        onGranularityChange(granularity === "monthly" ? "all-time" : "monthly")
      }
      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
    >
      Switch to {granularity === "monthly" ? "All Time" : "Monthly"} View
    </button>
  );
}

export function ChartTypeSelector({ chartType, onChartTypeChange }) {
  return (
    <select
      value={chartType}
      onChange={(e) => onChartTypeChange(e.target.value)}
      className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 shadow-sm"
    >
      {Object.entries(chartTypeConfig).map(([key, config]) => (
        <option key={key} value={key}>
          {config.label}
        </option>
      ))}
    </select>
  );
}

export function ControlsContainer({
  selectedTable,
  onTableChange,
  selectedMetric,
  onMetricChange,
  granularity,
  onGranularityChange,
  title = "Interactive Chart Demo",
}) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <DataSourceSelector
          selectedTable={selectedTable}
          onTableChange={onTableChange}
        />
        <MetricSelector
          selectedTable={selectedTable}
          selectedMetric={selectedMetric}
          onMetricChange={onMetricChange}
        />
        <GranularityToggle
          granularity={granularity}
          onGranularityChange={onGranularityChange}
        />
      </div>
    </div>
  );
}
