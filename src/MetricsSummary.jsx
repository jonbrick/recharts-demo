// MetricsSummary.jsx - Metrics summary display

import React from "react";
import { dataSourceConfig } from "./chartConfig.js";

export function MetricsSummary({
  selectedTable,
  currentData,
  granularity,
  isStacked,
}) {
  if (!isStacked) return null;

  const config = dataSourceConfig[selectedTable];

  // Calculate total based on data source
  const total = currentData.reduce((sum, row) => {
    if (selectedTable === "githubActions") {
      return sum + (row.deployments || 0) + (row.testsRun || 0) / 100;
    } else {
      return sum + (row.incidents || 0) + (row.usersAffected || 0) / 100;
    }
  }, 0);

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 font-medium">
        {config.name} - Total Activity
      </div>
      <div className="text-3xl font-bold text-gray-800">
        {total.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">
        {granularity === "monthly"
          ? "Sum of all metrics across all days"
          : "Sum of all metrics for the full period"}
      </div>
    </div>
  );
}
