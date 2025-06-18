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
  className = undefined,
  dateMode,
  relativeDays,
  selectedDateRange,
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
  const renderMetricLabel = (label) => {
    // Build the descriptive label
    const operation = operator === "sum" ? "Total" : "Average";

    // Format date range
    let range;
    if (dateMode === "relative") {
      range = `last ${relativeDays} days`;
    } else {
      const fromMonth = selectedDateRange.from.getMonth() + 1;
      const fromDay = selectedDateRange.from.getDate();
      const toMonth = selectedDateRange.to.getMonth() + 1;
      const toDay = selectedDateRange.to.getDate();
      range = `${fromMonth}/${fromDay} - ${toMonth}/${toDay}`;
    }

    // Add group suffix only for non-org views (when isGrouped is true)
    const suffix = isGrouped ? ` - ${label}` : "";

    return (
      <div className="text-sm text-gray-600">
        {operation} {metricLabel.toLowerCase()} over {range}
        {suffix}
      </div>
    );
  };

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
        // Sum all values for this group across all time periods
        const groupTotal = data.reduce((sum, row) => {
          return sum + (row[groupName] || 0);
        }, 0);

        const finalValue =
          operator === "average" && data.length > 0
            ? groupTotal / data.length
            : groupTotal;

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
