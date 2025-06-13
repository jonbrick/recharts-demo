// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { githubActionsData, pagerDutyData, githubPRData } from "../lib/data.js";
import {
  calculateMetricValue,
  calculateAverageData,
  calculateSumData,
} from "../lib/utils.js";
import { dataSourceConfig } from "../lib/chartConfig.js";

export function MetricsSummary({ selectedTable, selectedMetric, operator }) {
  // Always calculate from raw events - import the raw data
  const dataTables = {
    githubActions: githubActionsData,
    pagerDuty: pagerDutyData,
    githubPR: githubPRData,
  };

  const rawEvents = dataTables[selectedTable];

  // Calculate org-level data once
  const orgData =
    operator === "average"
      ? calculateAverageData(rawEvents, selectedTable)
      : calculateSumData(rawEvents, selectedTable);

  const value = calculateMetricValue(
    orgData,
    selectedMetric,
    "all-time", // Always use all-time since orgData is already aggregated
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
