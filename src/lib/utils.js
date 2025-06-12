// utils.js - Shared calculation utilities
import { dataSourceConfig } from "./chartConfig.js";

export function calculateAverageData(data, selectedTable) {
  const config = dataSourceConfig[selectedTable];
  const result = { name: "All Time" };

  [...config.metrics, config.overlayMetric].forEach((metric) => {
    const sum = data.reduce((sum, row) => sum + (row[metric.key] || 0), 0);
    result[metric.key] = sum / data.length;
  });

  return [result];
}

export function calculateSumData(data, selectedTable) {
  const config = dataSourceConfig[selectedTable];
  const result = { name: "All Time" };

  [...config.metrics, config.overlayMetric].forEach((metric) => {
    result[metric.key] = data.reduce(
      (sum, row) => sum + (row[metric.key] || 0),
      0
    );
  });

  return [result];
}

export function calculateMetricValue(
  currentData,
  selectedMetric,
  granularity,
  operator
) {
  return granularity === "monthly"
    ? operator === "average"
      ? currentData.reduce((sum, row) => sum + (row[selectedMetric] || 0), 0) /
        currentData.length
      : currentData.reduce((sum, row) => sum + (row[selectedMetric] || 0), 0)
    : currentData[0]?.[selectedMetric] || 0;
}
