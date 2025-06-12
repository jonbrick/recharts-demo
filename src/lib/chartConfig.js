// chartConfig.js - Configuration for charts and data sources

export const dataSourceConfig = {
  githubActions: {
    name: "GitHub Actions",
    icon: "📊",
    title: "GitHub Actions CI/CD Pipeline",
    description: "Deployment and build metrics for May 2025",
    metrics: [
      {
        key: "deployments",
        label: "Deployments",
        color: "#8884d8",
        description: "Daily deployment count",
      },
      {
        key: "successRate",
        label: "Success Rate",
        color: "#82ca9d",
        description: "Percentage of successful deployments",
      },
      {
        key: "buildTimeMinutes",
        label: "Build Time",
        color: "#ffc658",
        description: "Average build duration in minutes",
      },
    ],
    overlayMetric: {
      key: "testsRun",
      label: "Tests Run",
      color: "#1e40af",
      description: "Total number of tests executed",
    },
    tableColumns: [
      { key: "deployments", label: "Deployments", format: "number" },
      { key: "successRate", label: "Success Rate (%)", format: "percentage" },
      { key: "buildTimeMinutes", label: "Build Time (min)", format: "decimal" },
      { key: "testsRun", label: "Tests Run", format: "number" },
    ],
  },

  pagerDuty: {
    name: "PagerDuty",
    icon: "🚨",
    title: "PagerDuty Incident Management",
    description: "Incident response and reliability metrics for May 2025",
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
        label: "Critical Incidents",
        color: "#ffc658",
        description: "High-severity incidents",
      },
    ],
    overlayMetric: {
      key: "usersAffected",
      label: "Users Affected",
      color: "#1e40af",
      description: "Total users impacted",
    },
    tableColumns: [
      { key: "incidents", label: "Incidents", format: "number" },
      { key: "mttrMinutes", label: "MTTR (min)", format: "integer" },
      {
        key: "criticalIncidents",
        label: "Critical Incidents",
        format: "number",
      },
      { key: "usersAffected", label: "Users Affected", format: "number" },
    ],
  },

  githubPR: {
    name: "GitHub PRs",
    icon: "🔀",
    title: "GitHub Pull Request Activity",
    description: "Pull request and code review metrics for May 2025",
    metrics: [
      {
        key: "pullRequests",
        label: "Pull Requests",
        color: "#8884d8",
        description: "Daily PR count",
      },
      {
        key: "mergeRate",
        label: "Merge Rate",
        color: "#82ca9d",
        description: "Percentage of PRs merged",
      },
      {
        key: "avgReviewTime",
        label: "Review Time",
        color: "#ffc658",
        description: "Average review time in hours",
      },
    ],
    overlayMetric: {
      key: "linesChanged",
      label: "Lines Changed",
      color: "#1e40af",
      description: "Total lines of code changed",
    },
    tableColumns: [
      { key: "pullRequests", label: "Pull Requests", format: "number" },
      { key: "mergeRate", label: "Merge Rate (%)", format: "percentage" },
      { key: "avgReviewTime", label: "Review Time (hrs)", format: "decimal" },
      { key: "linesChanged", label: "Lines Changed", format: "number" },
    ],
  },
};

export const chartTypeConfig = {
  area: { label: "📈 Area Chart", icon: "📈" },
  line: { label: "📊 Line Chart", icon: "📊" },
  "vertical-bar": { label: "📊 Vertical Bars", icon: "📊" },
  "horizontal-bar": { label: "📊 Horizontal Bars", icon: "📊" },
  table: { label: "📋 Table View", icon: "📋" },
  "tremor-area": { label: "🔥 Tremor Area", icon: "🔥" },
  "tremor-line": { label: "🔥 Tremor Line", icon: "🔥" },
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
