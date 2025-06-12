// ChartControls.jsx - All chart control components

import React from "react";
import { dataSourceConfig, chartTypeConfig } from "../lib/chartConfig.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

export function DataSourceSelector({ selectedTable, onTableChange }) {
  return (
    <Select value={selectedTable} onValueChange={onTableChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(dataSourceConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            {config.icon} {config.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OperatorSelector({ operator, onOperatorChange }) {
  return (
    <Select value={operator} onValueChange={onOperatorChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="average">Average</SelectItem>
        <SelectItem value="sum">Sum</SelectItem>
      </SelectContent>
    </Select>
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
    <Select value={selectedMetric} onValueChange={onMetricChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allMetrics.map((metric) => (
          <SelectItem key={metric.key} value={metric.key}>
            📊 {metric.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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

export function GranularitySelector({ granularity, onGranularityChange }) {
  return (
    <Select value={granularity} onValueChange={onGranularityChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="monthly">Daily View</SelectItem>
        <SelectItem value="all-time">All Time View</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ChartTypeSelector({ chartType, onChartTypeChange }) {
  return (
    <Select value={chartType} onValueChange={onChartTypeChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(chartTypeConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            {config.label}
          </SelectItem>
        ))}
        <SelectItem value="tremor-area">🔥 Tremor Area</SelectItem>
        <SelectItem value="tremor-line">🔥 Tremor Line</SelectItem>
      </SelectContent>
    </Select>
  );
}
export function ControlsContainer({
  selectedTable,
  onTableChange,
  selectedMetric,
  onMetricChange,
  operator,
  onOperatorChange,
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
        <OperatorSelector
          operator={operator}
          onOperatorChange={onOperatorChange}
        />
        <GranularitySelector
          granularity={granularity}
          onGranularityChange={onGranularityChange}
        />
      </div>
    </div>
  );
}
