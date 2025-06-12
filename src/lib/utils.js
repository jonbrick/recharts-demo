// utils.js - Shared calculation utilities for raw event data
import { dataSourceConfig } from "./chartConfig.js";

// Helper function to extract date from different timestamp fields
function getEventDate(event, dataSource) {
  let timestamp;
  switch (dataSource) {
    case "githubPR":
      timestamp = event.created_at;
      break;
    case "githubActions":
      timestamp = event.deployed_at;
      break;
    case "pagerDuty":
      timestamp = event.created_at;
      break;
    default:
      timestamp = event.created_at;
  }
  return new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD format
}

// Helper function to get grouping key from event
function getGroupingKey(event, dataSource, groupBy) {
  switch (groupBy) {
    case "time":
      return getEventDate(event, dataSource);
    case "person":
      return event.author;
    case "team":
      return dataSource === "pagerDuty" ? event.assigned_team : event.team;
    case "repo":
      return event.repo;
    case "service":
      return event.service;
    default:
      return "all";
  }
}

// Helper function to get display name for grouping key
function getDisplayName(key, dataSource, groupBy) {
  // Convert author ID to display name
  const nameMap = {
    sarah_chen: "Sarah Chen",
    mike_johnson: "Mike Johnson",
    priya_patel: "Priya Patel",
    alex_kim: "Alex Kim",
    jordan_smith: "Jordan Smith",
    maya_rodriguez: "Maya Rodriguez",
    david_wilson: "David Wilson",
    lisa_taylor: "Lisa Taylor",
  };

  switch (groupBy) {
    case "time":
      return new Date(key).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "person":
      return nameMap[key] || key;
    case "team":
      return key === "platform" ? "Platform Team" : "Product Team";
    case "repo":
    case "service":
      return key;
    default:
      return key;
  }
}

// Helper function to calculate metrics from raw events
function calculateMetricsFromEvents(events, dataSource) {
  if (events.length === 0) {
    // Return null for all metrics when no events
    switch (dataSource) {
      case "githubPR": {
        return {
          pullRequests: 0,
          mergeRate: null,
          avgReviewTime: null,
          linesChanged: 0,
        };
      }

      case "githubActions": {
        return {
          deployments: 0,
          successRate: null,
          buildTimeMinutes: null,
          testsRun: null,
        };
      }

      case "pagerDuty": {
        return {
          incidents: 0,
          mttrMinutes: null,
          criticalIncidents: 0,
          usersAffected: 0,
        };
      }

      default:
        return {};
    }
  }

  switch (dataSource) {
    case "githubPR": {
      const mergedPRs = events.filter((pr) => pr.merged_at !== null);
      return {
        pullRequests: events.length,
        mergeRate: (mergedPRs.length / events.length) * 100,
        avgReviewTime:
          mergedPRs.length > 0
            ? mergedPRs.reduce(
                (sum, pr) => sum + (pr.review_time_hours || 0),
                0
              ) / mergedPRs.length
            : null,
        linesChanged: events.reduce(
          (sum, pr) => sum + (pr.lines_added || 0) + (pr.lines_removed || 0),
          0
        ),
      };
    }

    case "githubActions": {
      const successfulDeployments = events.filter(
        (deploy) => deploy.status === "success"
      );
      return {
        deployments: events.length,
        successRate: (successfulDeployments.length / events.length) * 100,
        buildTimeMinutes:
          events.reduce(
            (sum, deploy) => sum + (deploy.duration_minutes || 0),
            0
          ) / events.length,
        testsRun:
          events.reduce((sum, deploy) => sum + (deploy.tests_run || 0), 0) /
          events.length,
      };
    }

    case "pagerDuty": {
      const resolvedIncidents = events.filter(
        (inc) => inc.resolved_at !== null
      );
      const mttrMinutes =
        resolvedIncidents.length > 0
          ? resolvedIncidents.reduce((sum, inc) => {
              const created = new Date(inc.created_at);
              const resolved = new Date(inc.resolved_at);
              return sum + (resolved - created) / (1000 * 60); // Convert to minutes
            }, 0) / resolvedIncidents.length
          : null;

      return {
        incidents: events.length,
        mttrMinutes: mttrMinutes,
        criticalIncidents: events.filter((inc) => inc.severity === "critical")
          .length,
        usersAffected: events.reduce(
          (sum, inc) => sum + (inc.users_affected || 0),
          0
        ),
      };
    }

    default:
      return {};
  }
}

// Group events by specified grouping and aggregate metrics
function groupEventsByKey(events, dataSource, groupBy) {
  const grouped = {};

  events.forEach((event) => {
    const key = getGroupingKey(event, dataSource, groupBy);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(event);
  });

  // Convert to array format with calculated metrics
  return Object.entries(grouped)
    .map(([key, groupEvents]) => ({
      name: getDisplayName(key, dataSource, groupBy),
      ...calculateMetricsFromEvents(groupEvents, dataSource),
    }))
    .sort((a, b) => {
      // Sort by time for time grouping, alphabetically for others
      if (groupBy === "time") {
        return new Date(a.name) - new Date(b.name);
      }
      return a.name.localeCompare(b.name);
    });
}

// Group events by date and aggregate metrics for daily view
export function groupEventsByDate(events, dataSource) {
  return groupEventsByKey(events, dataSource, "time");
}

// New function to handle all grouping types including multi-series
export function groupEventsByType(events, dataSource, groupBy, selectedMetric) {
  if (groupBy === "org") {
    // Org view - single series, same as groupEventsByDate
    return groupEventsByKey(events, dataSource, "time");
  } else {
    // Multi-series view - group by the specified key, then by date within each group
    const grouped = {};

    // First pass: discover ALL possible series from the entire dataset
    const allSeries = new Set();
    events.forEach((event) => {
      const groupKey = getGroupingKey(event, dataSource, groupBy);
      allSeries.add(groupKey);
    });

    events.forEach((event) => {
      const groupKey = getGroupingKey(event, dataSource, groupBy);
      const dateKey = getEventDate(event, dataSource);

      if (!grouped[groupKey]) {
        grouped[groupKey] = {};
      }
      if (!grouped[groupKey][dateKey]) {
        grouped[groupKey][dateKey] = [];
      }
      grouped[groupKey][dateKey].push(event);
    });

    // Get all unique dates across all groups
    const allDates = [
      ...new Set(events.map((event) => getEventDate(event, dataSource))),
    ].sort();

    // Create time series data with multiple series
    return allDates.map((date) => {
      const dayData = {
        name: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };

      // Add data for EVERY possible series (not just ones with data)
      allSeries.forEach((groupKey) => {
        const displayName = getDisplayName(groupKey, dataSource, groupBy);
        const eventsForDate = grouped[groupKey]?.[date] || [];
        const metrics = calculateMetricsFromEvents(eventsForDate, dataSource);

        // Use undefined for missing data (clean chart gaps)
        dayData[displayName] =
          metrics[selectedMetric] === null
            ? undefined
            : metrics[selectedMetric] || 0;

        // Add flag for tooltip logic
        dayData[`${displayName}_hasData`] =
          metrics[selectedMetric] !== null && eventsForDate.length > 0;
      });

      return dayData;
    });
  }
}

export function calculateAverageData(events, selectedTable) {
  const metrics = calculateMetricsFromEvents(events, selectedTable);
  const config = dataSourceConfig[selectedTable];

  // Calculate averages per day over the time period
  const uniqueDates = [
    ...new Set(events.map((event) => getEventDate(event, selectedTable))),
  ];
  const dayCount = uniqueDates.length || 1;

  const result = { name: "All Time" };
  [...config.metrics, config.overlayMetric].forEach((metric) => {
    result[metric.key] = (metrics[metric.key] || 0) / dayCount;
  });

  return [result];
}

export function calculateSumData(events, selectedTable) {
  const metrics = calculateMetricsFromEvents(events, selectedTable);
  const config = dataSourceConfig[selectedTable];

  const result = { name: "All Time" };
  [...config.metrics, config.overlayMetric].forEach((metric) => {
    result[metric.key] = metrics[metric.key] || 0;
  });

  return [result];
}

export function calculateMetricValue(
  currentData,
  selectedMetric,
  granularity,
  operator
) {
  if (granularity === "monthly") {
    const total = currentData.reduce(
      (sum, row) => sum + (row[selectedMetric] || 0),
      0
    );
    return operator === "average" ? total / currentData.length : total;
  } else {
    return currentData[0]?.[selectedMetric] || 0;
  }
}
