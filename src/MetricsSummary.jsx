// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { dataSourceConfig } from "./chartConfig.js";

export function MetricsSummary({
  selectedTable,
  currentData,
  granularity,
  selectedMetric,
}) {
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );

  // Calculate based on granularity
  const sum = currentData.reduce((sum, row) => {
    return sum + (row[selectedMetric] || 0);
  }, 0);

  const displayValue =
    granularity === "monthly"
      ? sum / currentData.length // Daily average: 45.1 per day
      : sum; // All time total: 1354.7

  const label = granularity === "monthly" ? "Daily Average" : "All Time Total";

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 font-medium">
        {metric.label} - {label}
      </div>
      <div className="text-3xl font-bold text-gray-800">
        {displayValue.toFixed(1)}
      </div>
      <div className="text-xs text-gray-500">
        {granularity === "monthly"
          ? "Average per day"
          : "Total for entire period"}
      </div>
    </div>
  );
}
