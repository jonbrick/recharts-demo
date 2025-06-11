// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { dataSourceConfig } from "./chartConfig.js";

export function MetricsSummary({
  selectedTable,
  currentData,
  granularity,
  selectedMetric,
  operator, // ADD THIS PARAMETER
}) {
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );

  const value =
    granularity === "monthly"
      ? operator === "average"
        ? currentData.reduce(
            (sum, row) => sum + (row[selectedMetric] || 0),
            0
          ) / currentData.length
        : currentData.reduce((sum, row) => sum + (row[selectedMetric] || 0), 0)
      : currentData[0]?.[selectedMetric] || 0;

  const label =
    granularity === "monthly"
      ? operator === "average"
        ? "Daily Average"
        : "Daily Total"
      : operator === "average"
      ? "All Time Average"
      : "All Time Total";

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 font-medium">
        {metric.label} - {label}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value.toFixed(1)}</div>
      <div className="text-xs text-gray-500">
        {operator === "average" ? "Average per day" : "Total for entire period"}
      </div>
    </div>
  );
}
