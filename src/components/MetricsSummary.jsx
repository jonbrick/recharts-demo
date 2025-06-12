// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { githubActionsData, pagerDutyData, githubPRData } from "../lib/data.js";
import {
  calculateMetricValue,
  calculateAverageData,
  calculateSumData,
} from "../lib/utils.js";

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

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 font-medium">
        {operator === "average" ? "All Time Average" : "All Time Total"}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value.toFixed(1)}</div>
    </div>
  );
}
