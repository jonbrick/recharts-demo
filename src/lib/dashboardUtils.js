// utils.js - Shared calculation utilities for raw event data
import { dataSourceConfig, isMathMetric } from "./chartConfig.js";

// Date range for POC data
export const POC_START_DATE = "2025-05-15";
export const POC_END_DATE = "2025-05-30";

// Current date for relative calculations
export const TODAY = new Date("2025-05-25T00:00:00");

// Helper function to calculate relative date ranges
export const getRelativeDateRange = (days) => {
  const to = new Date(TODAY);
  const from = new Date(TODAY);
  from.setDate(from.getDate() - (days - 1)); // -6 for 7 days to include today

  return { from, to };
};

// Default dates for the date picker
export const DEFAULT_PICKER_DATES = {
  defaultStart: POC_START_DATE,
  defaultEnd: POC_END_DATE,
};

// UTC-adjusted versions for consistent initialization
export const POC_START_DATE_UTC = new Date(POC_START_DATE).toISOString();
export const POC_END_DATE_UTC = new Date(POC_END_DATE).toISOString();

// Specific values for disabled days in the date picker
export const DISABLED_DAYS_RANGE = {
  before: new Date("2025-05-16"),
  after: new Date("2025-05-31"),
};

/**
 * Generates an array of dates between start and end (inclusive)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string[]} Array of date strings in YYYY-MM-DD format
 */
function generateDateRange(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getUTCDate()).padStart(2, "0")}`
    );
  }

  return dates;
}

/**
 * Generates an array of all dates in the POC range
 * @returns {string[]} Array of date strings in YYYY-MM-DD format
 */
export function getFullDateRange() {
  const dates = [];
  const start = new Date(POC_START_DATE + "T00:00:00Z");
  const end = new Date(POC_END_DATE + "T00:00:00Z");

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getUTCDate()).padStart(2, "0")}`
    );
  }

  return dates;
}

/**
 * Extracts the event date in YYYY-MM-DD format based on the data source.
 * @param {Object} event - The event object.
 * @param {string} dataSource - The data source type (e.g., 'githubPR', 'githubActions', 'pagerDuty').
 * @returns {string} The event date in YYYY-MM-DD format.
 */
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
  // Use UTC date to avoid timezone issues
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Returns the grouping key for an event based on the groupBy type.
 * @param {Object} event - The event object.
 * @param {string} dataSource - The data source type.
 * @param {string} groupBy - The grouping type ('time', 'person', 'team', etc.).
 * @returns {string} The grouping key value.
 */
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

/**
 * Returns a display-friendly name for a grouping key.
 * @param {string} key - The grouping key value.
 * @param {string} dataSource - The data source type.
 * @param {string} groupBy - The grouping type.
 * @returns {string} The display name for the key.
 */
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

  let date;
  switch (groupBy) {
    case "time":
      // Use UTC date to avoid timezone issues
      date = new Date(key + "T00:00:00Z");
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
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

/**
 * Calculates metrics from an array of raw event objects for a given data source.
 * @param {Object[]} events - Array of event objects.
 * @param {string} dataSource - The data source type.
 * @returns {Object} An object containing calculated metrics for the data source.
 */
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

/**
 * Groups events by date, supporting multi-series data for charts.
 * Shows all dates in POC range for all series.
 * @param {Object[]} events - Array of event objects.
 * @param {string} dataSource - The data source type.
 * @param {string} startDate - Optional start date in YYYY-MM-DD format
 * @param {string} endDate - Optional end date in YYYY-MM-DD format
 * @returns {Object[]} Array of objects representing time series data.
 */
export function groupEventsByDate(
  events,
  dataSource,
  startDate = null,
  endDate = null
) {
  const fullDateRange =
    startDate && endDate
      ? generateDateRange(startDate, endDate)
      : getFullDateRange();

  const grouped = {};

  // Group existing events by date
  events.forEach((event) => {
    const key = getEventDate(event, dataSource);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(event);
  });

  // Create entry for every date in range
  return fullDateRange.map((date) => {
    const eventsForDate = grouped[date] || [];
    const metrics = calculateMetricsFromEvents(eventsForDate, dataSource);

    return {
      name: getDisplayName(date, dataSource, "time"),
      ...metrics,
    };
  });
}

/**
 * Groups events by a specified type (e.g., person, team) and by date within each group, supporting multi-series data for charts.
 * Shows all dates in POC range for all series.
 * @param {Object[]} events - Array of event objects.
 * @param {string} dataSource - The data source type.
 * @param {string} groupBy - The grouping type ('org', 'person', 'team', etc.).
 * @param {string} selectedMetric - The metric key to extract for each group/date.
 * @param {string} granularity - The granularity ('monthly', 'all-time').
 * @param {string} startDate - Optional start date in YYYY-MM-DD format
 * @param {string} endDate - Optional end date in YYYY-MM-DD format
 * @returns {Object[]} Array of objects representing time series data for each group.
 */
export function groupEventsByType(
  events,
  dataSource,
  groupBy,
  selectedMetric,
  granularity,
  startDate = null,
  endDate = null
) {
  if (groupBy === "org") {
    // Org view - single series, same as groupEventsByDate
    return groupEventsByDate(events, dataSource, startDate, endDate);
  }

  // For non-org views, use all-time data if specified
  if (granularity === "all-time") {
    const allSeries = new Set();
    events.forEach((event) => {
      const groupKey = getGroupingKey(event, dataSource, groupBy);
      allSeries.add(groupKey);
    });

    const result = {
      name: "All Time",
    };

    allSeries.forEach((groupKey) => {
      const displayName = getDisplayName(groupKey, dataSource, groupBy);
      const groupEvents = events.filter(
        (event) => getGroupingKey(event, dataSource, groupBy) === groupKey
      );
      const metrics = calculateMetricsFromEvents(groupEvents, dataSource);
      result[displayName] = metrics[selectedMetric];
      result[`${displayName}_hasData`] = groupEvents.length > 0;
    });

    return [result];
  }

  // Monthly view - show time series
  const fullDateRange =
    startDate && endDate
      ? generateDateRange(startDate, endDate)
      : getFullDateRange();
  const grouped = {};

  // First pass: discover ALL possible series from the entire dataset
  const allSeries = new Set();
  events.forEach((event) => {
    const groupKey = getGroupingKey(event, dataSource, groupBy);
    allSeries.add(groupKey);
  });

  // Group events by series and date
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

  // Create time series data with ALL dates for ALL series
  return fullDateRange.map((date) => {
    // Use UTC date to avoid timezone issues and ensure consistent formatting
    const utcDate = new Date(date + "T00:00:00Z");
    const dayData = {
      name: utcDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
    };

    // Add data for EVERY possible series for EVERY date
    allSeries.forEach((groupKey) => {
      const displayName = getDisplayName(groupKey, dataSource, groupBy);
      const eventsForDate = grouped[groupKey]?.[date] || [];
      const metrics = calculateMetricsFromEvents(eventsForDate, dataSource);

      // For math metrics with no data, use null; for count metrics, use 0
      if (eventsForDate.length === 0) {
        dayData[displayName] = isMathMetric(selectedMetric) ? null : 0;
      } else {
        dayData[displayName] = metrics[selectedMetric];
      }

      // Add flag for tooltip logic
      dayData[`${displayName}_hasData`] = eventsForDate.length > 0;
    });

    return dayData;
  });
}

/**
 * Calculates average values for all metrics over the time period, normalized per day.
 * @param {Object[]} events - Array of event objects.
 * @param {string} selectedTable - The data source type.
 * @returns {Object[]} Array with a single object containing average metrics per day.
 */
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

/**
 * Calculates the sum of all metrics over the time period.
 * @param {Object[]} events - Array of event objects.
 * @param {string} selectedTable - The data source type.
 * @returns {Object[]} Array with a single object containing summed metrics.
 */
export function calculateSumData(events, selectedTable) {
  const metrics = calculateMetricsFromEvents(events, selectedTable);
  const config = dataSourceConfig[selectedTable];

  const result = { name: "All Time" };
  [...config.metrics, config.overlayMetric].forEach((metric) => {
    result[metric.key] = metrics[metric.key] || 0;
  });

  return [result];
}

/**
 * Calculates a metric value from aggregated data, supporting different granularities and operators.
 * @param {Object[]} currentData - Array of aggregated data objects (e.g., per month).
 * @param {string} selectedMetric - The metric key to extract.
 * @param {string} granularity - The granularity ('monthly', 'all-time').
 * @param {string} operator - The operator to use ('average', 'sum', etc.).
 * @returns {number} The calculated metric value.
 */
export function calculateMetricValue(
  currentData,
  selectedMetric,
  granularity,
  operator
) {
  // For all-time view, we already have the aggregated value
  if (granularity === "all-time") {
    return currentData[0]?.[selectedMetric] || 0;
  }

  // For monthly view, we need to aggregate the daily values
  const total = currentData.reduce(
    (sum, row) => sum + (row[selectedMetric] || 0),
    0
  );
  return operator === "average" ? total / currentData.length : total;
}

/**
 * Filters events to only those within the given date range (inclusive).
 * @param {Array} events - The array of event objects (must have a date field).
 * @param {string} start - Start date in YYYY-MM-DD format.
 * @param {string} end - End date in YYYY-MM-DD format.
 * @param {string} dateField - The field to use for date comparison.
 * @returns {Array} Filtered array.
 */
export function filterEventsByDate(events, start, end, dateField) {
  const startDate = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T23:59:59Z");
  return events.filter((event) => {
    const eventDate = new Date(event[dateField]);
    return eventDate >= startDate && eventDate <= endDate;
  });
}
