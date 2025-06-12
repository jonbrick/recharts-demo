// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { dataSourceConfig } from "../lib/chartConfig.js";

export function MetricsSummary({
  selectedTable,
  currentData, // We'll ignore this for calculation
  granularity,
  selectedMetric,
  operator,
}) {
  // Always calculate from raw events - import the raw data
  const {
    githubActionsData,
    pagerDutyData,
    githubPRData,
  } = require("../lib/data.js");

  const dataTables = {
    githubActions: githubActionsData,
    pagerDuty: pagerDutyData,
    githubPR: githubPRData,
  };

  const rawEvents = dataTables[selectedTable];
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );

  // Import calculation function
  const { calculateMetricValue } = require("../lib/utils.js");

  // Calculate org-level data once
  const { calculateAverageData, calculateSumData } = require("../lib/utils.js");
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
