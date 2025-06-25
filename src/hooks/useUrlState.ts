"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DateRange } from "../components/DatePicker";

interface DashboardState {
  chartType: string;
  selectedTable: string;
  selectedMetric: string;
  operator: string;
  groupBy: string;
  tableView: string;
  selectedDateRange: DateRange;
  dateMode: string;
  relativeDays: number;
  summaryPreviousPeriod: boolean;
  summaryCompareDatasets: boolean;
  chartComparisonMode: string;
  listComparisonMode: string;
  overlayActive: boolean;
  overlayActiveTable: string;
  overlayActiveMetric: string;
  overlayActiveGroupBy: string;
  overlayActiveChartType: string;
  // Summary card specific state
  summaryGroupBy: string;
  summaryOverlayActive: boolean;
  summaryOverlayGroupBy: string;
  // Chart card specific state
  chartGroupBy: string;
  chartOverlayActive: boolean;
  chartOverlayGroupBy: string;
  chartGranularity: string;
  // List card specific state
  listGroupBy: string;
  listOverlayActive: boolean;
  listOverlayGroupBy: string;
  listGranularity: string;
  // Component visibility state
  showSummary: boolean;
  showChart: boolean;
  showTable: boolean;
  // Component label visibility state
  showSummaryLabel: boolean;
  showChartLabel: boolean;
  showTableLabel: boolean;
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
  operator: "op",
  tableView: "table",
  summaryPreviousPeriod: "s_prev",
  summaryCompareDatasets: "s_comp_ds",
  chartComparisonMode: "c_comp",
  listComparisonMode: "l_comp",
  overlayActive: "overlay",
  overlayActiveTable: "o_source",
  overlayActiveMetric: "o_metric",
  overlayActiveGroupBy: "o_group",
  overlayActiveChartType: "o_chart",
  // Summary card specific params
  summaryGroupBy: "s_grp",
  summaryOverlayActive: "s_overlay",
  summaryOverlayGroupBy: "s_o_grp",
  // Chart card specific params
  chartGroupBy: "c_grp",
  chartOverlayActive: "c_overlay",
  chartOverlayGroupBy: "c_o_grp",
  chartGranularity: "c_gran",
  // List card specific params
  listGroupBy: "l_grp",
  listOverlayActive: "l_overlay",
  listOverlayGroupBy: "l_o_grp",
  listGranularity: "l_gran",
  // Component visibility params
  showSummary: "show_sum",
  showChart: "show_chart",
  showTable: "show_list",
  // Component label visibility params
  showSummaryLabel: "show_sum_label",
  showChartLabel: "show_chart_label",
  showTableLabel: "show_list_label",
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

    // Read card-specific comparison modes
    const summaryPreviousPeriod = searchParams.get(
      URL_PARAMS.summaryPreviousPeriod
    );
    if (summaryPreviousPeriod) {
      state.summaryPreviousPeriod = summaryPreviousPeriod === "true";
    }

    const summaryCompareDatasets = searchParams.get(
      URL_PARAMS.summaryCompareDatasets
    );
    if (summaryCompareDatasets) {
      state.summaryCompareDatasets = summaryCompareDatasets === "true";
    }

    const chartComparisonMode = searchParams.get(
      URL_PARAMS.chartComparisonMode
    );
    if (chartComparisonMode) {
      state.chartComparisonMode = chartComparisonMode;
    }

    const listComparisonMode = searchParams.get(URL_PARAMS.listComparisonMode);
    if (listComparisonMode) {
      state.listComparisonMode = listComparisonMode;
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

    // Read chart card specific params
    const chartGroupBy = searchParams.get(URL_PARAMS.chartGroupBy);
    if (chartGroupBy) {
      state.chartGroupBy = chartGroupBy;
    }

    const chartOverlayActive = searchParams.get(URL_PARAMS.chartOverlayActive);
    if (chartOverlayActive !== null) {
      state.chartOverlayActive = chartOverlayActive === "true";
    }

    const chartOverlayGroupBy = searchParams.get(
      URL_PARAMS.chartOverlayGroupBy
    );
    if (chartOverlayGroupBy) {
      state.chartOverlayGroupBy = chartOverlayGroupBy;
    }

    const chartGranularity = searchParams.get(URL_PARAMS.chartGranularity);
    if (chartGranularity) {
      state.chartGranularity = chartGranularity;
    }

    // Read list card specific params
    const listGroupBy = searchParams.get(URL_PARAMS.listGroupBy);
    if (listGroupBy) {
      state.listGroupBy = listGroupBy;
    }

    const listOverlayActive = searchParams.get(URL_PARAMS.listOverlayActive);
    if (listOverlayActive !== null) {
      state.listOverlayActive = listOverlayActive === "true";
    }

    const listOverlayGroupBy = searchParams.get(URL_PARAMS.listOverlayGroupBy);
    if (listOverlayGroupBy) {
      state.listOverlayGroupBy = listOverlayGroupBy;
    }

    const listGranularity = searchParams.get(URL_PARAMS.listGranularity);
    if (listGranularity) {
      state.listGranularity = listGranularity;
    }

    // Read component visibility params
    const showSummary = searchParams.get(URL_PARAMS.showSummary);
    if (showSummary !== null) {
      state.showSummary = showSummary === "true";
    }

    const showChart = searchParams.get(URL_PARAMS.showChart);
    if (showChart !== null) {
      state.showChart = showChart === "true";
    }

    const showTable = searchParams.get(URL_PARAMS.showTable);
    if (showTable !== null) {
      state.showTable = showTable === "true";
    }

    // Read component label visibility params
    const showSummaryLabel = searchParams.get(URL_PARAMS.showSummaryLabel);
    if (showSummaryLabel !== null) {
      state.showSummaryLabel = showSummaryLabel === "true";
    }

    const showChartLabel = searchParams.get(URL_PARAMS.showChartLabel);
    if (showChartLabel !== null) {
      state.showChartLabel = showChartLabel === "true";
    }

    const showTableLabel = searchParams.get(URL_PARAMS.showTableLabel);
    if (showTableLabel !== null) {
      state.showTableLabel = showTableLabel === "true";
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

      // Update comparison mode
      if (updates.summaryPreviousPeriod !== undefined) {
        params.set(
          URL_PARAMS.summaryPreviousPeriod,
          updates.summaryPreviousPeriod.toString()
        );
      }
      if (updates.summaryCompareDatasets !== undefined) {
        params.set(
          URL_PARAMS.summaryCompareDatasets,
          updates.summaryCompareDatasets.toString()
        );
      }
      if (updates.chartComparisonMode !== undefined) {
        params.set(URL_PARAMS.chartComparisonMode, updates.chartComparisonMode);
      }
      if (updates.listComparisonMode !== undefined) {
        params.set(URL_PARAMS.listComparisonMode, updates.listComparisonMode);
      }

      // Read overlay active state explicitly
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

      // Chart card specific params
      if (updates.chartGroupBy !== undefined) {
        params.set(URL_PARAMS.chartGroupBy, updates.chartGroupBy);
      }
      if (updates.chartOverlayActive !== undefined) {
        params.set(
          URL_PARAMS.chartOverlayActive,
          updates.chartOverlayActive.toString()
        );
      }
      if (updates.chartOverlayGroupBy !== undefined) {
        params.set(URL_PARAMS.chartOverlayGroupBy, updates.chartOverlayGroupBy);
      }
      if (updates.chartGranularity !== undefined) {
        params.set(URL_PARAMS.chartGranularity, updates.chartGranularity);
      }

      // Update list card params if provided
      if (updates.listGroupBy !== undefined) {
        params.set(URL_PARAMS.listGroupBy, updates.listGroupBy);
      }
      if (updates.listOverlayActive !== undefined) {
        params.set(
          URL_PARAMS.listOverlayActive,
          updates.listOverlayActive.toString()
        );
      }
      if (updates.listOverlayGroupBy !== undefined) {
        params.set(URL_PARAMS.listOverlayGroupBy, updates.listOverlayGroupBy);
      }
      if (updates.listGranularity !== undefined) {
        params.set(URL_PARAMS.listGranularity, updates.listGranularity);
      }

      // Update component visibility params
      if (updates.showSummary !== undefined) {
        params.set(URL_PARAMS.showSummary, updates.showSummary.toString());
      }
      if (updates.showChart !== undefined) {
        params.set(URL_PARAMS.showChart, updates.showChart.toString());
      }
      if (updates.showTable !== undefined) {
        params.set(URL_PARAMS.showTable, updates.showTable.toString());
      }

      // Update component label visibility params
      if (updates.showSummaryLabel !== undefined) {
        params.set(
          URL_PARAMS.showSummaryLabel,
          updates.showSummaryLabel.toString()
        );
      }
      if (updates.showChartLabel !== undefined) {
        params.set(
          URL_PARAMS.showChartLabel,
          updates.showChartLabel.toString()
        );
      }
      if (updates.showTableLabel !== undefined) {
        params.set(
          URL_PARAMS.showTableLabel,
          updates.showTableLabel.toString()
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
      params.set(URL_PARAMS.operator, state.operator);
      params.set(URL_PARAMS.tableView, state.tableView);
      params.set(
        URL_PARAMS.summaryPreviousPeriod,
        state.summaryPreviousPeriod.toString()
      );
      params.set(
        URL_PARAMS.summaryCompareDatasets,
        state.summaryCompareDatasets.toString()
      );
      params.set(URL_PARAMS.chartComparisonMode, state.chartComparisonMode);
      params.set(URL_PARAMS.listComparisonMode, state.listComparisonMode);

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

      // Chart card specific params
      if (state.chartGroupBy) {
        params.set(URL_PARAMS.chartGroupBy, state.chartGroupBy);
      }
      if (state.chartOverlayActive) {
        params.set(
          URL_PARAMS.chartOverlayActive,
          state.chartOverlayActive.toString()
        );
      }
      if (state.chartOverlayGroupBy) {
        params.set(URL_PARAMS.chartOverlayGroupBy, state.chartOverlayGroupBy);
      }
      if (state.chartGranularity) {
        params.set(URL_PARAMS.chartGranularity, state.chartGranularity);
      }

      // Add list card params
      if (state.listGroupBy) {
        params.set(URL_PARAMS.listGroupBy, state.listGroupBy);
      }
      if (state.listOverlayActive) {
        params.set(
          URL_PARAMS.listOverlayActive,
          state.listOverlayActive.toString()
        );
      }
      if (state.listOverlayGroupBy) {
        params.set(URL_PARAMS.listOverlayGroupBy, state.listOverlayGroupBy);
      }
      if (state.listGranularity) {
        params.set(URL_PARAMS.listGranularity, state.listGranularity);
      }

      // Add component visibility params
      params.set(URL_PARAMS.showSummary, state.showSummary.toString());
      params.set(URL_PARAMS.showChart, state.showChart.toString());
      params.set(URL_PARAMS.showTable, state.showTable.toString());

      // Add component label visibility params
      params.set(
        URL_PARAMS.showSummaryLabel,
        state.showSummaryLabel.toString()
      );
      params.set(URL_PARAMS.showChartLabel, state.showChartLabel.toString());
      params.set(URL_PARAMS.showTableLabel, state.showTableLabel.toString());

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
