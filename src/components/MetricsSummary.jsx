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
}) {
  // Calculate org-level data once
  const orgData = data;

  const value = calculateMetricValue(
    orgData,
    selectedMetric,
    granularity,
    operator
  );

  // Get the metric label from config
  const config = dataSourceConfig[selectedTable];
  const allMetrics = [...config.metrics];
  if (config.overlayMetric) {
    allMetrics.push(config.overlayMetric);
  }
  const metricConfig = allMetrics.find((m) => m.key === selectedMetric);
  const metricLabel = metricConfig?.label || selectedMetric;

  // Format the operator text
  const operatorText = operator === "average" ? "average per day" : "total";

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-600 font-medium">
        {`Summary card: ${metricLabel} ${operatorText}`}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value.toFixed(1)}</div>
    </div>
  );
}
