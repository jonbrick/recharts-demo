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
  dateMode: string;
  relativeDays: number;
  overlayActive: boolean;
  overlayActiveTable: string;
  overlayActiveMetric: string;
  overlayActiveGroupBy: string;
  overlayActiveChartType: string;
  // Summary card specific state
  summaryGroupBy: string;
  summaryOverlayActive: boolean;
  summaryOverlayGroupBy: string;
}

// URL parameter keys - shortened for cleaner URLs
const URL_PARAMS = {
  selectedTable: "source",
  selectedMetric: "metric",
  dateFrom: "from",
  dateTo: "to",
  dateMode: "dateMode",
  relativeDays: "days",
  groupBy: "group",
  chartType: "chart",
  granularity: "gran",
  operator: "op",
  tableView: "table",
  overlayActive: "overlay",
  overlayActiveTable: "o_source",
  overlayActiveMetric: "o_metric",
  overlayActiveGroupBy: "o_group",
  overlayActiveChartType: "o_chart",
  // Summary card specific params
  summaryGroupBy: "s_grp",
  summaryOverlayActive: "s_overlay",
  summaryOverlayGroupBy: "s_o_grp",
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
    const state: Partial<DashboardState> = {};

    // Read simple string parameters
    const selectedTable = searchParams.get(URL_PARAMS.selectedTable);
    if (selectedTable) {
      state.selectedTable = selectedTable;
    }

    const selectedMetric = searchParams.get(URL_PARAMS.selectedMetric);
    if (selectedMetric) {
      state.selectedMetric = selectedMetric;
    }

    const groupBy = searchParams.get(URL_PARAMS.groupBy);
    if (groupBy) {
      state.groupBy = groupBy;
    }

    const chartType = searchParams.get(URL_PARAMS.chartType);
    if (chartType) {
      state.chartType = chartType;
    }

    const granularity = searchParams.get(URL_PARAMS.granularity);
    if (granularity) {
      state.granularity = granularity;
    }

    const operator = searchParams.get(URL_PARAMS.operator);
    if (operator) {
      state.operator = operator;
    }

    const tableView = searchParams.get(URL_PARAMS.tableView);
    if (tableView) {
      state.tableView = tableView;
    }

    // Read date range
    const dateFrom = parseDate(searchParams.get(URL_PARAMS.dateFrom));
    const dateTo = parseDate(searchParams.get(URL_PARAMS.dateTo));
    if (dateFrom && dateTo) {
      state.selectedDateRange = { from: dateFrom, to: dateTo };
    }

    // Read date mode and relative days
    const dateMode = searchParams.get(URL_PARAMS.dateMode);
    if (dateMode) {
      state.dateMode = dateMode;
    }

    const relativeDays = searchParams.get(URL_PARAMS.relativeDays);
    if (relativeDays) {
      state.relativeDays = parseInt(relativeDays, 10);
    }

    // Read overlay active state explicitly
    const overlayActive = searchParams.get(URL_PARAMS.overlayActive);
    if (overlayActive !== null) {
      state.overlayActive = overlayActive === "true";
    }

    // Read other overlay params
    const overlayTable = searchParams.get(URL_PARAMS.overlayActiveTable);
    if (overlayTable) {
      state.overlayActiveTable = overlayTable;
    }

    const overlayMetric = searchParams.get(URL_PARAMS.overlayActiveMetric);
    if (overlayMetric) {
      state.overlayActiveMetric = overlayMetric;
    }

    const overlayGroupBy = searchParams.get(URL_PARAMS.overlayActiveGroupBy);
    if (overlayGroupBy) {
      state.overlayActiveGroupBy = overlayGroupBy;
    }

    const overlayChartType = searchParams.get(
      URL_PARAMS.overlayActiveChartType
    );
    if (overlayChartType) {
      state.overlayActiveChartType = overlayChartType;
    }

    // Read summary card specific params
    const summaryGroupBy = searchParams.get(URL_PARAMS.summaryGroupBy);
    if (summaryGroupBy) {
      state.summaryGroupBy = summaryGroupBy;
    }

    const summaryOverlayActive = searchParams.get(
      URL_PARAMS.summaryOverlayActive
    );
    if (summaryOverlayActive !== null) {
      state.summaryOverlayActive = summaryOverlayActive === "true";
    }

    const summaryOverlayGroupBy = searchParams.get(
      URL_PARAMS.summaryOverlayGroupBy
    );
    if (summaryOverlayGroupBy) {
      state.summaryOverlayGroupBy = summaryOverlayGroupBy;
    }

    return state;
  }, [searchParams]);

  // Update URL with new state
  const updateUrl = useCallback(
    (updates: Partial<DashboardState>) => {
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

      // Update date mode and relative days
      if (updates.dateMode !== undefined) {
        params.set(URL_PARAMS.dateMode, updates.dateMode);
      }
      if (updates.relativeDays !== undefined) {
        params.set(URL_PARAMS.relativeDays, updates.relativeDays.toString());
      }

      // Update overlay active parameter explicitly
      if (updates.overlayActive !== undefined) {
        params.set(URL_PARAMS.overlayActive, updates.overlayActive.toString());

        if (!updates.overlayActive) {
          // Remove all overlay params if overlay is disabled
          params.delete(URL_PARAMS.overlayActiveTable);
          params.delete(URL_PARAMS.overlayActiveMetric);
          params.delete(URL_PARAMS.overlayActiveGroupBy);
          params.delete(URL_PARAMS.overlayActiveChartType);
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

      // Update summary card params if provided
      if (updates.summaryGroupBy !== undefined) {
        params.set(URL_PARAMS.summaryGroupBy, updates.summaryGroupBy);
      }
      if (updates.summaryOverlayActive !== undefined) {
        params.set(
          URL_PARAMS.summaryOverlayActive,
          updates.summaryOverlayActive.toString()
        );
      }
      if (updates.summaryOverlayGroupBy !== undefined) {
        params.set(
          URL_PARAMS.summaryOverlayGroupBy,
          updates.summaryOverlayGroupBy
        );
      }

      // Update the URL without navigation
      const newUrl = `${pathname}?${params.toString()}`;
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
      params.set(URL_PARAMS.dateMode, state.dateMode);
      params.set(URL_PARAMS.relativeDays, state.relativeDays.toString());
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

      // Add summary card params
      params.set(URL_PARAMS.summaryGroupBy, state.summaryGroupBy);
      params.set(
        URL_PARAMS.summaryOverlayActive,
        state.summaryOverlayActive.toString()
      );
      params.set(URL_PARAMS.summaryOverlayGroupBy, state.summaryOverlayGroupBy);

      // Return full URL
      const baseUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${pathname}`
          : pathname;
      return `${baseUrl}?${params.toString()}`;
    },
    [pathname]
  );

  return {
    getStateFromUrl,
    updateUrl,
    getShareableUrl,
  };
}
