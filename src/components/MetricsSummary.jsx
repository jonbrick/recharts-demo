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
  comparisonData = null,
  comparisonMode = null,
  comparisonMetric = null,
}) {
  // Extract group keys (only use '_display' fields)
  const groupKeys = data?.[0]
    ? Object.keys(data[0])
        .filter((k) => k.endsWith("_display") && k !== "name")
        .map((k) => k.replace("_display", "")) // Remove the suffix for the key name
    : [];

  // Check if we have grouped data (multiple columns beyond just metrics)
  const isGrouped = groupKeys.length > 1 && !groupKeys.includes(selectedMetric);

  // Get metric label from config
  const config = dataSourceConfig[selectedTable];
  if (!config) {
    console.warn(`No config found for table: ${selectedTable}`);
    return <div className="text-gray-500">No data available</div>;
  }
  const allMetrics = [...config.metrics];
  if (config.overlayMetric) {
    allMetrics.push(config.overlayMetric);
  }
  const metricConfig = allMetrics.find((m) => m.key === selectedMetric);
  const metricLabel = metricConfig?.label || selectedMetric;

  // Calculate comparison values and percent change
  const getComparisonValues = () => {
    if (!comparisonData || !comparisonMode) return null;

    const primaryValue = calculateMetricValue(
      data,
      selectedMetric,
      granularity,
      operator
    );
    const comparisonValue = calculateMetricValue(
      comparisonData,
      comparisonMetric || selectedMetric,
      granularity,
      operator
    );

    if (primaryValue === 0 || comparisonValue === 0) return null;

    const percentChange =
      ((primaryValue - comparisonValue) / comparisonValue) * 100;
    const isPositive = percentChange > 0;

    return {
      comparisonValue,
      percentChange,
      isPositive,
      displayValue:
        comparisonValue === null || comparisonValue === undefined
          ? "N/A"
          : Number(comparisonValue).toFixed(1),
    };
  };

  // Calculate comparison values for grouped data
  const getGroupComparisonValues = (groupName) => {
    if (!comparisonData || !comparisonMode) return null;

    // Calculate primary value for this specific group
    const groupTotal = data.reduce((sum, row) => {
      return sum + (row[`${groupName}_display`] || 0);
    }, 0);
    const primaryValue =
      operator === "average" && data.length > 0
        ? groupTotal / data.length
        : groupTotal;

    // Calculate comparison value for this specific group
    const comparisonGroupTotal = comparisonData.reduce((sum, row) => {
      return sum + (row[`${groupName}_display`] || 0);
    }, 0);
    const comparisonValue =
      operator === "average" && comparisonData.length > 0
        ? comparisonGroupTotal / comparisonData.length
        : comparisonGroupTotal;

    if (primaryValue === 0 || comparisonValue === 0) return null;

    const percentChange =
      ((primaryValue - comparisonValue) / comparisonValue) * 100;
    const isPositive = percentChange > 0;

    return {
      comparisonValue,
      percentChange,
      isPositive,
      displayValue:
        comparisonValue === null || comparisonValue === undefined
          ? "N/A"
          : Number(comparisonValue).toFixed(1),
    };
  };

  const comparisonValues = getComparisonValues();

  // Render a single metric value
  const renderMetricValue = (value) => {
    const displayValue =
      value === null || value === undefined ? "N/A" : Number(value).toFixed(1);
    return (
      <div>
        <div className="text-3xl font-bold text-gray-800">{displayValue}</div>
        {comparisonValues && (
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-sm font-medium ${
                comparisonValues.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {comparisonValues.isPositive ? "+" : ""}
              {comparisonValues.percentChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">
              {comparisonValues.displayValue}{" "}
              {comparisonMode === "vs Previous Period"
                ? "prev period"
                : "comparison"}
            </span>
          </div>
        )}
      </div>
    );
  };

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
          return sum + (row[`${groupName}_display`] || 0);
        }, 0);

        const finalValue =
          operator === "average" && data.length > 0
            ? groupTotal / data.length
            : groupTotal;

        // Get comparison values for this specific group
        const groupComparisonValues = getGroupComparisonValues(groupName);

        return (
          <div key={groupName}>
            {renderMetricLabel(groupName)}
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {finalValue === null || finalValue === undefined
                  ? "N/A"
                  : Number(finalValue).toFixed(1)}
              </div>
              {groupComparisonValues && (
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-sm font-medium ${
                      groupComparisonValues.isPositive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {groupComparisonValues.isPositive ? "+" : ""}
                    {groupComparisonValues.percentChange.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {groupComparisonValues.displayValue}{" "}
                    {comparisonMode === "vs Previous Period"
                      ? "prev period"
                      : "comparison"}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
