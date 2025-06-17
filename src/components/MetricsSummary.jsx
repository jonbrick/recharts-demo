// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { calculateMetricValue } from "../lib/dashboardUtils";
import { dataSourceConfig } from "../lib/chartConfig.js";
import clsx from "clsx";

export function MetricsSummary({
  selectedTable,
  selectedMetric,
  operator,
  granularity,
  data,
  overlayActive = false,
  className = undefined,
}) {
  // Extract group keys (exclude 'name' and '_hasData' fields)
  const groupKeys = data?.[0]
    ? Object.keys(data[0]).filter(
        (k) => k !== "name" && !k.endsWith("_hasData")
      )
    : [];

  // Check if we have grouped data (multiple columns beyond just metrics)
  const isGrouped = groupKeys.length > 1 && !groupKeys.includes(selectedMetric);

  // Get metric label from config
  const config = dataSourceConfig[selectedTable];
  const allMetrics = [...config.metrics];
  if (config.overlayMetric) {
    allMetrics.push(config.overlayMetric);
  }
  const metricConfig = allMetrics.find((m) => m.key === selectedMetric);
  const metricLabel = metricConfig?.label || selectedMetric;

  // Render a single metric value
  const renderMetricValue = (value) => (
    <div className="text-3xl font-bold text-gray-800">{value.toFixed(1)}</div>
  );

  // Render a metric label
  const renderMetricLabel = (label) => (
    <div className="text-sm text-gray-600">
      {overlayActive ? `${metricLabel} - ${label}` : label}
    </div>
  );

  if (!isGrouped) {
    // Original behavior for org view
    const value = calculateMetricValue(
      data,
      selectedMetric,
      granularity,
      operator
    );

    return (
      <div className={clsx("metrics-summary", className)}>
        {renderMetricLabel("Organization")}
        {renderMetricValue(value)}
      </div>
    );
  }

  // New behavior for grouped data
  return (
    <div className={clsx("metrics-summary flex flex-wrap gap-8", className)}>
      {groupKeys.map((groupName) => {
        // Calculate value for this specific group
        const groupValue = data.reduce((sum, row) => {
          return sum + (row[groupName] || 0);
        }, 0);

        const finalValue =
          operator === "average" && data.length > 0
            ? groupValue / data.length
            : groupValue;

        return (
          <div key={groupName}>
            {renderMetricLabel(groupName)}
            {renderMetricValue(finalValue)}
          </div>
        );
      })}
    </div>
  );
}
