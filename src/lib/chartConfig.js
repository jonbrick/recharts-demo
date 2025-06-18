// chartConfig.js - Configuration for charts and data sources

export const dataSourceConfig = {
  githubPR: {
    name: "GitHub PRs",
    title: "Pull requests created",
    groupByOptions: [
      { value: "org", label: "🏢 Org View", icon: "🏢" },
      { value: "team", label: "👥 By Team", icon: "👥" },
      { value: "person", label: "👤 By Individual", icon: "👤" },
    ],
    metrics: [
      {
        key: "pullRequests",
        label: "Pull requests created",
        color: "#8884d8",
        description: "Daily PR count",
      },
      {
        key: "mergeRate",
        label: "Merge rate",
        color: "#82ca9d",
        description: "Percentage of PRs merged",
      },
      {
        key: "avgReviewTime",
        label: "Review time",
        color: "#ffc658",
        description: "Average review time in hours",
      },
    ],
    overlayMetric: {
      key: "linesChanged",
      label: "Lines changed",
      color: "#1e40af",
      description: "Total lines of code changed",
    },
    tableColumns: [
      { key: "pullRequests", label: "Pull requests created", format: "number" },
      { key: "mergeRate", label: "Merge rate (%)", format: "percentage" },
      { key: "avgReviewTime", label: "Review time (hrs)", format: "decimal" },
      { key: "linesChanged", label: "Lines changed", format: "number" },
    ],
  },

  githubActions: {
    name: "GitHub Actions",
    title: "Deployments",
    groupByOptions: [
      { value: "org", label: "🏢 Org View", icon: "🏢" },
      { value: "team", label: "👥 By Team", icon: "👥" },
      { value: "repo", label: "📦 By Repository", icon: "📦" },
    ],
    metrics: [
      {
        key: "deployments",
        label: "Deployments",
        color: "#8884d8",
        description: "Daily deployment count",
      },
      {
        key: "successRate",
        label: "Success rate",
        color: "#82ca9d",
        description: "Percentage of successful deployments",
      },
      {
        key: "buildTimeMinutes",
        label: "Build time",
        color: "#ffc658",
        description: "Average build duration in minutes",
      },
    ],
    overlayMetric: {
      key: "testsRun",
      label: "Tests run",
      color: "#1e40af",
      description: "Total number of tests executed",
    },
    tableColumns: [
      { key: "deployments", label: "Deployments", format: "number" },
      { key: "successRate", label: "Success rate (%)", format: "percentage" },
      { key: "buildTimeMinutes", label: "Build time (min)", format: "decimal" },
      { key: "testsRun", label: "Tests run", format: "number" },
    ],
  },

  pagerDuty: {
    name: "PagerDuty",
    title: "Incidents",
    groupByOptions: [
      { value: "org", label: "🏢 Org View", icon: "🏢" },
      { value: "team", label: "👥 By Team", icon: "👥" },
      { value: "service", label: "🔧 By Service", icon: "🔧" },
    ],
    metrics: [
      {
        key: "incidents",
        label: "Incidents",
        color: "#ff7c7c",
        description: "Daily incident count",
      },
      {
        key: "mttrMinutes",
        label: "MTTR",
        color: "#8884d8",
        description: "Mean Time to Recovery in minutes",
      },
      {
        key: "criticalIncidents",
        label: "Critical incidents",
        color: "#ffc658",
        description: "High-severity incidents",
      },
    ],
    overlayMetric: {
      key: "usersAffected",
      label: "Users affected",
      color: "#1e40af",
      description: "Total users impacted",
    },
    tableColumns: [
      { key: "incidents", label: "Incidents", format: "number" },
      { key: "mttrMinutes", label: "MTTR (min)", format: "integer" },
      {
        key: "criticalIncidents",
        label: "Critical incidents",
        format: "number",
      },
      { key: "usersAffected", label: "Users affected", format: "number" },
    ],
  },
};

export const chartTypeConfig = {
  line: { label: "📈 Line Chart", icon: "📈" },
  area: { label: "🌊 Area Chart", icon: "🌊" },
  "stacked-area": { label: "🌊 Stacked Area Chart", icon: "🌊" },
  "percent-area": { label: "🌊 Percent Area Chart", icon: "🌊" },
  "vertical-bar": { label: "📊 Vertical Bar Chart", icon: "📊" },
  "stacked-vertical-bar": {
    label: "📊 Stacked Vertical Bar Chart",
    icon: "📊",
  },
  "horizontal-bar": {
    label: "📊 Horizontal Bar Chart",
    icon: "📊",
  },
  "stacked-horizontal-bar": {
    label: "📊 Stacked Horizontal Bar Chart",
    icon: "📊",
  },
};

// Helper functions
export const formatValue = (value, format) => {
  if (!value && value !== 0) return "0";

  switch (format) {
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "decimal":
      return value.toFixed(1);
    case "integer":
      return Math.round(value).toString();
    case "number":
    default:
      return value.toLocaleString();
  }
};

// Math metrics that should show "No results" when no data available
export const mathMetrics = [
  "mergeRate",
  "successRate",
  "mttrMinutes",
  "avgReviewTime",
  "buildTimeMinutes",
];

// Count metrics that should show 0 when no data available
export const countMetrics = [
  "deployments",
  "pullRequests",
  "incidents",
  "criticalIncidents",
  "testsRun",
  "usersAffected",
  "linesChanged",
];

// Helper function to determine if a metric is math-based
export const isMathMetric = (metricKey) => mathMetrics.includes(metricKey);
