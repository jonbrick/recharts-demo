"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DateRange } from "../components/DatePicker";

interface DashboardState {
  chartType: string;
  granularity: string;
  selectedTable: string;
  selectedMetric: string;
  operator: string;
  groupBy: string;
  tableView: string;
  selectedDateRange: DateRange;
  overlayActive: boolean;
  overlayActiveTable: string;
  overlayActiveMetric: string;
  overlayActiveGroupBy: string;
  overlayActiveChartType: string;
}

// URL parameter keys - shortened for cleaner URLs
const URL_PARAMS = {
  selectedTable: "source",
  selectedMetric: "metric",
  dateFrom: "from",
  dateTo: "to",
  groupBy: "group",
  chartType: "chart",
  granularity: "gran",
  operator: "op",
  tableView: "table",
  overlayActiveTable: "o_source",
  overlayActiveMetric: "o_metric",
  overlayActiveGroupBy: "o_group",
  overlayActiveChartType: "o_chart",
} as const;

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse date from URL format (YYYY-MM-DD) to Date object
  const parseDate = (dateStr: string | null): Date | undefined => {
    if (!dateStr) return undefined;
    try {
      // Add time to ensure consistent date handling
      return new Date(dateStr + "T00:00:00");
    } catch (e) {
      console.warn("Failed to parse date:", dateStr, e);
      return undefined;
    }
  };

  // Format date to URL format (YYYY-MM-DD)
  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Read current state from URL
  const getStateFromUrl = useCallback((): Partial<DashboardState> => {
    console.log("[useUrlState] Reading from URL:", searchParams.toString());
    const state: Partial<DashboardState> = {};

    // Read simple string parameters
    const selectedTable = searchParams.get(URL_PARAMS.selectedTable);
    if (selectedTable) {
      state.selectedTable = selectedTable;
      console.log("[useUrlState] Found selectedTable:", selectedTable);
    }

    const selectedMetric = searchParams.get(URL_PARAMS.selectedMetric);
    if (selectedMetric) {
      state.selectedMetric = selectedMetric;
      console.log("[useUrlState] Found selectedMetric:", selectedMetric);
    }

    const groupBy = searchParams.get(URL_PARAMS.groupBy);
    if (groupBy) {
      state.groupBy = groupBy;
      console.log("[useUrlState] Found groupBy:", groupBy);
    }

    const chartType = searchParams.get(URL_PARAMS.chartType);
    if (chartType) {
      state.chartType = chartType;
      console.log("[useUrlState] Found chartType:", chartType);
    }

    const granularity = searchParams.get(URL_PARAMS.granularity);
    if (granularity) {
      state.granularity = granularity;
      console.log("[useUrlState] Found granularity:", granularity);
    }

    const operator = searchParams.get(URL_PARAMS.operator);
    if (operator) {
      state.operator = operator;
      console.log("[useUrlState] Found operator:", operator);
    }

    const tableView = searchParams.get(URL_PARAMS.tableView);
    if (tableView) {
      state.tableView = tableView;
      console.log("[useUrlState] Found tableView:", tableView);
    }

    // Read date range
    const dateFrom = parseDate(searchParams.get(URL_PARAMS.dateFrom));
    const dateTo = parseDate(searchParams.get(URL_PARAMS.dateTo));
    if (dateFrom && dateTo) {
      state.selectedDateRange = { from: dateFrom, to: dateTo };
      console.log(
        "[useUrlState] Found date range:",
        formatDate(dateFrom),
        "to",
        formatDate(dateTo)
      );
    }

    // Check if overlay is active by looking for overlay params
    const overlayTable = searchParams.get(URL_PARAMS.overlayActiveTable);
    const overlayMetric = searchParams.get(URL_PARAMS.overlayActiveMetric);

    if (overlayTable && overlayMetric) {
      state.overlayActive = true;
      state.overlayActiveTable = overlayTable;
      state.overlayActiveMetric = overlayMetric;

      const overlayGroupBy = searchParams.get(URL_PARAMS.overlayActiveGroupBy);
      if (overlayGroupBy) state.overlayActiveGroupBy = overlayGroupBy;

      const overlayChartType = searchParams.get(
        URL_PARAMS.overlayActiveChartType
      );
      if (overlayChartType) state.overlayActiveChartType = overlayChartType;

      console.log("[useUrlState] Found overlay config:", {
        table: overlayTable,
        metric: overlayMetric,
        groupBy: overlayGroupBy,
        chartType: overlayChartType,
      });
    }

    console.log("[useUrlState] Final parsed state:", state);
    return state;
  }, [searchParams]);

  // Update URL with new state
  const updateUrl = useCallback(
    (updates: Partial<DashboardState>) => {
      console.log("[useUrlState] Updating URL with:", updates);
      const params = new URLSearchParams(searchParams.toString());

      // Update simple parameters
      if (updates.selectedTable !== undefined) {
        params.set(URL_PARAMS.selectedTable, updates.selectedTable);
      }
      if (updates.selectedMetric !== undefined) {
        params.set(URL_PARAMS.selectedMetric, updates.selectedMetric);
      }
      if (updates.groupBy !== undefined) {
        params.set(URL_PARAMS.groupBy, updates.groupBy);
      }
      if (updates.chartType !== undefined) {
        params.set(URL_PARAMS.chartType, updates.chartType);
      }
      if (updates.granularity !== undefined) {
        params.set(URL_PARAMS.granularity, updates.granularity);
      }
      if (updates.operator !== undefined) {
        params.set(URL_PARAMS.operator, updates.operator);
      }
      if (updates.tableView !== undefined) {
        params.set(URL_PARAMS.tableView, updates.tableView);
      }

      // Update date range
      if (updates.selectedDateRange) {
        if (updates.selectedDateRange.from) {
          params.set(
            URL_PARAMS.dateFrom,
            formatDate(updates.selectedDateRange.from)
          );
        }
        if (updates.selectedDateRange.to) {
          params.set(
            URL_PARAMS.dateTo,
            formatDate(updates.selectedDateRange.to)
          );
        }
      }

      // Update overlay parameters
      if (updates.overlayActive !== undefined) {
        if (!updates.overlayActive) {
          // Remove all overlay params if overlay is disabled
          params.delete(URL_PARAMS.overlayActiveTable);
          params.delete(URL_PARAMS.overlayActiveMetric);
          params.delete(URL_PARAMS.overlayActiveGroupBy);
          params.delete(URL_PARAMS.overlayActiveChartType);
          console.log("[useUrlState] Removed overlay params");
        }
      }

      // Set overlay params if provided
      if (updates.overlayActiveTable !== undefined) {
        params.set(URL_PARAMS.overlayActiveTable, updates.overlayActiveTable);
      }
      if (updates.overlayActiveMetric !== undefined) {
        params.set(URL_PARAMS.overlayActiveMetric, updates.overlayActiveMetric);
      }
      if (updates.overlayActiveGroupBy !== undefined) {
        params.set(
          URL_PARAMS.overlayActiveGroupBy,
          updates.overlayActiveGroupBy
        );
      }
      if (updates.overlayActiveChartType !== undefined) {
        params.set(
          URL_PARAMS.overlayActiveChartType,
          updates.overlayActiveChartType
        );
      }

      // Update the URL without navigation
      const newUrl = `${pathname}?${params.toString()}`;
      console.log("[useUrlState] New URL:", newUrl);
      router.push(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Create a shareable URL with current state
  const getShareableUrl = useCallback(
    (state: DashboardState): string => {
      const params = new URLSearchParams();

      // Add all state to params
      params.set(URL_PARAMS.selectedTable, state.selectedTable);
      params.set(URL_PARAMS.selectedMetric, state.selectedMetric);
      params.set(URL_PARAMS.dateFrom, formatDate(state.selectedDateRange.from));
      params.set(URL_PARAMS.dateTo, formatDate(state.selectedDateRange.to));
      params.set(URL_PARAMS.groupBy, state.groupBy);
      params.set(URL_PARAMS.chartType, state.chartType);
      params.set(URL_PARAMS.granularity, state.granularity);
      params.set(URL_PARAMS.operator, state.operator);
      params.set(URL_PARAMS.tableView, state.tableView);

      // Add overlay params if active
      if (
        state.overlayActive &&
        state.overlayActiveTable &&
        state.overlayActiveMetric
      ) {
        params.set(URL_PARAMS.overlayActiveTable, state.overlayActiveTable);
        params.set(URL_PARAMS.overlayActiveMetric, state.overlayActiveMetric);
        params.set(URL_PARAMS.overlayActiveGroupBy, state.overlayActiveGroupBy);
        params.set(
          URL_PARAMS.overlayActiveChartType,
          state.overlayActiveChartType
        );
      }

      // Return full URL
      const baseUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${pathname}`
          : pathname;
      const shareableUrl = `${baseUrl}?${params.toString()}`;

      console.log("[useUrlState] Generated shareable URL:", shareableUrl);
      return shareableUrl;
    },
    [pathname]
  );

  return {
    getStateFromUrl,
    updateUrl,
    getShareableUrl,
  };
}
