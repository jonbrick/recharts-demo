// Test for updated dynamic label generation
const dataSourceConfig = {
  githubPR: {
    metrics: [
      { key: "pullRequests", label: "Pull Requests" },
      { key: "mergeRate", label: "Merge Rate" },
      { key: "reviewTime", label: "Review Time" },
    ],
  },
};

function generateDynamicLabel({
  selectedTable,
  selectedMetric,
  dateMode,
  relativeDays,
  selectedDateRange,
  groupBy,
  dataSourceConfig,
}) {
  // Get metric label from config
  const config = dataSourceConfig[selectedTable];
  const allMetrics = [...config.metrics];
  if (config.overlayMetric) {
    allMetrics.push(config.overlayMetric);
  }
  const metricConfig = allMetrics.find((m) => m.key === selectedMetric);
  const metricLabel = metricConfig?.label || selectedMetric;

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

  // Add group suffix for non-org views with proper labels
  let suffix = "";
  if (groupBy !== "org") {
    const groupLabels = {
      team: "Team",
      person: "Individual",
      repo: "Repository",
      service: "Service",
    };
    const groupLabel =
      groupLabels[groupBy] ||
      groupBy.charAt(0).toUpperCase() + groupBy.slice(1);
    suffix = ` - By ${groupLabel}`;
  }

  return `${metricLabel} over ${range}${suffix}`;
}

// Test cases
console.log("Test 1 - Merge Rate, 14 days, org view:");
console.log(
  generateDynamicLabel({
    selectedTable: "githubPR",
    selectedMetric: "mergeRate",
    dateMode: "relative",
    relativeDays: 14,
    selectedDateRange: { from: new Date(), to: new Date() },
    groupBy: "org",
    dataSourceConfig,
  })
);

console.log("\nTest 2 - Merge Rate, 14 days, team view:");
console.log(
  generateDynamicLabel({
    selectedTable: "githubPR",
    selectedMetric: "mergeRate",
    dateMode: "relative",
    relativeDays: 14,
    selectedDateRange: { from: new Date(), to: new Date() },
    groupBy: "team",
    dataSourceConfig,
  })
);

console.log("\nTest 3 - Merge Rate, 14 days, person view:");
console.log(
  generateDynamicLabel({
    selectedTable: "githubPR",
    selectedMetric: "mergeRate",
    dateMode: "relative",
    relativeDays: 14,
    selectedDateRange: { from: new Date(), to: new Date() },
    groupBy: "person",
    dataSourceConfig,
  })
);

console.log("\nTest 4 - Pull Requests, custom date range, repo view:");
console.log(
  generateDynamicLabel({
    selectedTable: "githubPR",
    selectedMetric: "pullRequests",
    dateMode: "custom",
    relativeDays: 14,
    selectedDateRange: {
      from: new Date("2024-01-01"),
      to: new Date("2024-01-31"),
    },
    groupBy: "repo",
    dataSourceConfig,
  })
);

console.log("\nTest 5 - Incidents, 7 days, service view:");
console.log(
  generateDynamicLabel({
    selectedTable: "pagerDuty",
    selectedMetric: "incidents",
    dateMode: "relative",
    relativeDays: 7,
    selectedDateRange: { from: new Date(), to: new Date() },
    groupBy: "service",
    dataSourceConfig,
  })
);
