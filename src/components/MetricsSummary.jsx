// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { calculateMetricValue } from "../lib/dashboardUtils";
import { dataSourceConfig } from "../lib/chartConfig.js";

export function MetricsSummary({
  selectedTable,
  selectedMetric,
  operator,
  granularity,
  data,
  overlayActive = false,
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

  if (!isGrouped) {
    // Original behavior for org view
    const value = calculateMetricValue(
      data,
      selectedMetric,
      granularity,
      operator
    );

    return (
      <div>
        <div className="text-sm text-gray-600">
          {overlayActive ? `${metricLabel} - Organization` : "Organization"}
        </div>
        <div className="text-3xl font-bold text-gray-800">
          {value.toFixed(1)}
        </div>
      </div>
    );
  }

  // New behavior for grouped data
  return (
    <div className="flex flex-wrap gap-8">
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
            <div className="text-sm text-gray-600">
              {overlayActive ? `${metricLabel} - ${groupName}` : groupName}
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {finalValue.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
