"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useUrlState } from "../hooks/useUrlState";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  DataSourceSelector,
  MetricSelector,
  ChartTypeSelector,
  OperatorSelector,
  GranularitySelector,
  GroupBySelector,
  ViewSelector,
  DateModeSelector,
  RelativeDaysSelector,
  FilterSelector,
  ComparisonModeSelector,
  DisplayLimitSelector,
  DisplaySortSelector,
  CompareDatasetsSelector,
} from "../components/ChartControls";
import { MetricsSummary } from "../components/MetricsSummary";
import { ChartRenderer } from "../components/ChartRenderer";
import { DateRangePicker, type DateRange } from "../components/DatePicker";
import { dataSourceConfig } from "../lib/chartConfig";
import { githubActionsData, pagerDutyData, githubPRData } from "../lib/data";
import {
  calculateAverageData,
  calculateSumData,
  groupEventsByDate,
  groupEventsByType,
  filterEventsByDate,
  DISABLED_DAYS_RANGE,
  DEFAULT_PICKER_DATES,
  POC_START_DATE,
  POC_END_DATE,
  POC_START_DATE_UTC,
  POC_END_DATE_UTC,
  TODAY,
  getRelativeDateRange,
  getPreviousPeriodRange,
} from "../lib/dashboardUtils";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { DataTable } from "../components/DataTable";
import { Switch } from "../components/Switch";
import { ThemeToggle } from "../components/ThemeToggle";

// Reusable card components to reduce duplication
const UnifiedCard = ({
  // Summary props
  operator,
  selectedTable,
  selectedMetric,
  granularity,
  summaryChartData,
  dateMode,
  relativeDays,
  selectedDateRange,
  overlayActiveTable,
  overlayActiveMetric,
  summaryPreviousPeriod,
  summaryOverlayActive,
  summaryPreviousPeriodData,
  summaryOverlayCurrentData,
  // Chart props
  chartType,
  overlayActiveChartType,
  chartData,
  chartGroupBy,
  chartOverlayData,
  chartOverlayGroupBy,
  chartOverlayActive,
  // List props
  tableView,
  listChartData,
  listGroupBy,
  dataTables,
  listOverlayActive,
  listOverlayData,
  listOverlayGroupBy,
  // Visibility props
  showSummary,
  showChart,
  showTable,
  showSummaryLabel,
  showChartLabel,
  showTableLabel,
}) => {
  // Safety check for selectedTable
  if (!selectedTable || !dataSourceConfig[selectedTable]) {
    return (
      <Card className="flex flex-col gap-6 p-6">
        <div className="text-gray-500 dark:text-slate-400">Loading...</div>
      </Card>
    );
  }

  // Check if any component is visible
  const hasVisibleComponents = showSummary || showChart || showTable;
  if (!hasVisibleComponents) {
    return (
      <Card className="flex flex-col gap-6 p-6">
        <div className="text-gray-500 dark:text-slate-400">
          No components selected
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6 p-6">
      {/* Metrics Summary Section */}
      {showSummary && (
        <div className="flex flex-col gap-4">
          <div className={summaryOverlayActive ? "flex gap-4" : ""}>
            <MetricsSummary
              key={`${operator}-${selectedMetric}-${selectedTable}-${granularity}`}
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              operator={operator}
              granularity={granularity}
              data={summaryChartData}
              dateMode={dateMode}
              relativeDays={relativeDays}
              selectedDateRange={selectedDateRange}
              comparisonData={summaryPreviousPeriodData}
              comparisonMode={
                summaryPreviousPeriod ? "vs Previous Period" : null
              }
              comparisonMetric={selectedMetric}
              showLabel={showSummaryLabel}
            />

            {summaryOverlayActive && (
              <MetricsSummary
                key={`overlay-${operator}-${overlayActiveMetric}-${overlayActiveTable}-${granularity}`}
                selectedTable={overlayActiveTable}
                selectedMetric={overlayActiveMetric}
                operator={operator}
                granularity={granularity}
                data={summaryOverlayCurrentData}
                dateMode={dateMode}
                relativeDays={relativeDays}
                selectedDateRange={selectedDateRange}
                comparisonData={
                  summaryPreviousPeriod ? summaryOverlayCurrentData : null
                } // TODO: This should be overlay's previous period
                comparisonMode={
                  summaryPreviousPeriod ? "vs Previous Period" : null
                }
                comparisonMetric={overlayActiveMetric}
                showLabel={showSummaryLabel}
              />
            )}
          </div>
        </div>
      )}

      {/* Chart Section */}
      {showChart && (
        <div className="flex flex-col gap-4">
          <ChartRenderer
            chartType={chartType}
            currentData={chartData}
            selectedTable={selectedTable}
            selectedMetric={selectedMetric}
            granularity={granularity}
            groupBy={chartGroupBy}
            overlayActive={chartOverlayActive}
            overlayData={chartOverlayData}
            overlayTable={overlayActiveTable}
            overlayMetric={overlayActiveMetric}
            overlayChartType={overlayActiveChartType}
            overlayGroupBy={chartOverlayGroupBy}
            dateMode={dateMode}
            relativeDays={relativeDays}
            selectedDateRange={selectedDateRange}
            showLabel={showChartLabel}
          />
        </div>
      )}

      {/* Data Table Section */}
      {showTable && (
        <div className="flex flex-col gap-4">
          <DataTable
            currentData={listChartData}
            selectedMetric={selectedMetric}
            selectedTable={selectedTable}
            groupBy={listGroupBy}
            viewMode={tableView}
            rawData={dataTables[selectedTable]}
            overlayActive={listOverlayActive}
            overlayData={listOverlayData}
            overlayMetric={overlayActiveMetric}
            overlayTable={overlayActiveTable}
            overlayGroupBy={listOverlayGroupBy}
            dateMode={dateMode}
            relativeDays={relativeDays}
            selectedDateRange={selectedDateRange}
            showLabel={showTableLabel}
          />
        </div>
      )}
    </Card>
  );
};

function DashboardContent() {
  const [chartType, setChartType] = useState("line");
  const [granularity, setGranularity] = useState("monthly");
  const [selectedTable, setSelectedTable] = useState("githubPR");
  const [selectedMetric, setSelectedMetric] = useState("pullRequests");
  const [operator, setOperator] = useState("sum");
  const [groupBy, setGroupBy] = useState("org");
  const [tableView, setTableView] = useState("day"); // Default to "day" view
  const [dateMode, setDateMode] = useState("relative");
  const [relativeDays, setRelativeDays] = useState(7);
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: new Date(DEFAULT_PICKER_DATES.defaultStart + "T00:00:00"),
    to: new Date(DEFAULT_PICKER_DATES.defaultEnd + "T00:00:00"),
  });
  const selectedDateRange = useMemo(() => {
    if (dateMode === "relative") {
      return getRelativeDateRange(relativeDays);
    }
    return customDateRange;
  }, [dateMode, relativeDays, customDateRange]);

  // Overlay Configuration State (what user is building)
  const [overlayConfiguring, setOverlayConfiguring] = useState(false);
  const [overlayConfigTable, setOverlayConfigTable] = useState("");
  const [overlayConfigMetric, setOverlayConfigMetric] = useState("");
  const [overlayConfigGroupBy, setOverlayConfigGroupBy] = useState("org");
  const [overlayConfigChartType, setOverlayConfigChartType] = useState("line");

  // Overlay Active State (what's displayed on chart)
  const [overlayActive, setOverlayActive] = useState(false);
  const [overlayActiveTable, setOverlayActiveTable] = useState("");
  const [overlayActiveMetric, setOverlayActiveMetric] = useState("");
  const [overlayActiveGroupBy, setOverlayActiveGroupBy] = useState("org");
  const [overlayActiveChartType, setOverlayActiveChartType] = useState("line");

  // Summary Card Independent State
  const [summaryGroupBy, setSummaryGroupBy] = useState("org");
  const [summaryOverlayActive, setSummaryOverlayActive] = useState(false);
  const [summaryOverlayGroupBy, setSummaryOverlayGroupBy] = useState("org");

  // Chart card specific state
  const [chartGroupBy, setChartGroupBy] = useState("org");
  const [chartOverlayActive, setChartOverlayActive] = useState(false);
  const [chartOverlayGroupBy, setChartOverlayGroupBy] = useState("org");

  // List card specific state
  const [listGroupBy, setListGroupBy] = useState("org");
  const [listOverlayActive, setListOverlayActive] = useState(false);
  const [listOverlayGroupBy, setListOverlayGroupBy] = useState("org");

  // Card-specific comparison mode states
  const [summaryPreviousPeriod, setSummaryPreviousPeriod] = useState(false);
  const [chartComparisonMode, _setChartComparisonMode] =
    useState("Compare Datasets");
  const [listComparisonMode, _setListComparisonMode] =
    useState("Compare Datasets");

  // Component visibility states
  const [showSummary, setShowSummary] = useState(true);
  const [showChart, setShowChart] = useState(true);
  const [showTable, setShowTable] = useState(true);

  // Label visibility states
  const [showSummaryLabel, setShowSummaryLabel] = useState(true);
  const [showChartLabel, setShowChartLabel] = useState(true);
  const [showTableLabel, setShowTableLabel] = useState(true);

  // Initialize URL state management
  const { getStateFromUrl, updateUrl, getShareableUrl } = useUrlState();
  const searchParams = useSearchParams();

  // Load state from URL on mount
  useEffect(() => {
    const state = getStateFromUrl();
    if (state && Object.keys(state).length > 0) {
      // Apply state from URL
      setSelectedTable(state.selectedTable || "githubPR");
      setSelectedMetric(state.selectedMetric || "pullRequests");
      setGroupBy(state.groupBy || "org");
      setChartType(state.chartType || "line");
      setGranularity(state.granularity || "monthly");
      setOperator(state.operator || "sum");
      setTableView(state.tableView || "day");
      setDateMode(state.dateMode || "relative");
      setRelativeDays(state.relativeDays || 7);

      // Apply overlay state from URL
      if (state.overlayActive !== undefined)
        setOverlayActive(state.overlayActive);
      if (state.overlayActiveTable)
        setOverlayActiveTable(state.overlayActiveTable);
      if (state.overlayActiveMetric)
        setOverlayActiveMetric(state.overlayActiveMetric);
      if (state.overlayActiveGroupBy)
        setOverlayActiveGroupBy(state.overlayActiveGroupBy);
      if (state.overlayActiveChartType)
        setOverlayActiveChartType(state.overlayActiveChartType);

      // Load summary card state
      setSummaryGroupBy(state.summaryGroupBy || "org");
      setSummaryOverlayActive(state.summaryOverlayActive || false);
      setSummaryOverlayGroupBy(state.summaryOverlayGroupBy || "org");

      // Initialize chart-specific state from URL
      setChartGroupBy(state.chartGroupBy || "org");
      setChartOverlayActive(state.chartOverlayActive || false);
      setChartOverlayGroupBy(state.chartOverlayGroupBy || "org");

      // Initialize list-specific state from URL
      setListGroupBy(state.listGroupBy || "org");
      setListOverlayActive(state.listOverlayActive || false);
      setListOverlayGroupBy(state.listOverlayGroupBy || "org");
    } else {
      // Set default state and update URL with ALL parameters
      updateUrl({
        selectedTable: "githubPR",
        selectedMetric: "pullRequests",
        selectedDateRange: {
          from: new Date(DEFAULT_PICKER_DATES.defaultStart + "T00:00:00"),
          to: new Date(DEFAULT_PICKER_DATES.defaultEnd + "T00:00:00"),
        },
        groupBy: "org",
        chartType: "line",
        granularity: "monthly",
        operator: "sum",
        tableView: "day",
        dateMode: "relative",
        relativeDays: 7,
        // Include all overlay parameters with defaults
        overlayActive: false,
        overlayActiveTable: "",
        overlayActiveMetric: "",
        overlayActiveGroupBy: "org",
        overlayActiveChartType: "line",
        // Include all summary card parameters with defaults
        summaryGroupBy: "org",
        summaryOverlayActive: false,
        summaryOverlayGroupBy: "org",
        // Include all chart card parameters with defaults
        chartGroupBy: "org",
        chartOverlayActive: false,
        chartOverlayGroupBy: "org",
        // Include all list card parameters with defaults
        listGroupBy: "org",
        listOverlayActive: false,
        listOverlayGroupBy: "org",
      });
    }
  }, [searchParams, getStateFromUrl, updateUrl]);

  // Available data tables - filtered by selected date range
  const dataTables = useMemo(() => {
    const startDate =
      selectedDateRange.from?.toISOString().split("T")[0] ??
      DEFAULT_PICKER_DATES.defaultStart;
    const endDate =
      selectedDateRange.to?.toISOString().split("T")[0] ??
      DEFAULT_PICKER_DATES.defaultEnd;

    return {
      githubActions: filterEventsByDate(
        githubActionsData,
        startDate,
        endDate,
        "deployed_at"
      ),
      pagerDuty: filterEventsByDate(
        pagerDutyData,
        startDate,
        endDate,
        "created_at"
      ),
      githubPR: filterEventsByDate(
        githubPRData,
        startDate,
        endDate,
        "created_at"
      ),
    };
  }, [selectedDateRange]);

  const data = dataTables[selectedTable];

  // Ensure groupBy is valid for the selectedTable, otherwise default to 'org'
  useEffect(() => {
    const validGroupBys = (
      dataSourceConfig[selectedTable]?.groupByOptions || []
    ).map((opt) => opt.value);
    if (!validGroupBys.includes(groupBy)) {
      setGroupBy("org");
    }
  }, [selectedTable, groupBy]);

  // Ensure overlay groupBy is valid for the overlayActiveTable
  useEffect(() => {
    if (overlayActiveTable) {
      const validGroupBys = (
        dataSourceConfig[overlayActiveTable]?.groupByOptions || []
      ).map((opt) => opt.value);
      if (!validGroupBys.includes(overlayActiveGroupBy)) {
        setOverlayActiveGroupBy("org");
      }
    }
  }, [overlayActiveTable, overlayActiveGroupBy]);

  // Ensure overlay metric is valid for the overlayActiveTable
  useEffect(() => {
    if (overlayActiveTable) {
      const config = dataSourceConfig[overlayActiveTable];
      const allMetrics = [...config.metrics];
      if (config.overlayMetric) {
        allMetrics.push(config.overlayMetric);
      }
      const validMetrics = allMetrics.map((m) => m.key);

      if (!validMetrics.includes(overlayActiveMetric)) {
        setOverlayActiveMetric(config.metrics[0].key);
      }
    }
  }, [overlayActiveTable, overlayActiveMetric]);

  // Ensure summary overlay groupBy is valid for the overlayActiveTable
  useEffect(() => {
    if (overlayActiveTable) {
      const validGroupBys = (
        dataSourceConfig[overlayActiveTable]?.groupByOptions || []
      ).map((opt) => opt.value);
      if (!validGroupBys.includes(summaryOverlayGroupBy)) {
        setSummaryOverlayGroupBy("org");
      }
    } else {
      // If no overlay table is selected, reset summary overlay group by
      setSummaryOverlayGroupBy("org");
    }
  }, [overlayActiveTable, summaryOverlayGroupBy]);

  // Reset summary overlay when overlay metric is removed
  useEffect(() => {
    if (!overlayActiveMetric && summaryOverlayActive) {
      setSummaryOverlayActive(false);
      setSummaryOverlayGroupBy("org");
    }
  }, [overlayActiveMetric, summaryOverlayActive]);

  // Replace your existing allTimeData calculation with this:
  const allTimeData = useMemo(() => {
    return operator === "average"
      ? calculateAverageData(data, selectedTable)
      : calculateSumData(data, selectedTable);
  }, [data, selectedTable, operator]);

  // Get the current dataset based on granularity
  const chartData = useMemo(() => {
    const startDate = selectedDateRange.from?.toISOString().split("T")[0];
    const endDate = selectedDateRange.to?.toISOString().split("T")[0];

    let result;
    if (chartGroupBy === "org") {
      result =
        granularity === "monthly"
          ? groupEventsByDate(data, selectedTable, startDate, endDate)
          : allTimeData;
    } else {
      result = groupEventsByType(
        data,
        selectedTable,
        chartGroupBy,
        selectedMetric,
        granularity,
        startDate,
        endDate
      );
    }

    return result;
  }, [
    data,
    selectedTable,
    chartGroupBy,
    selectedMetric,
    granularity,
    allTimeData,
    selectedDateRange,
  ]);

  // Chart-specific overlay data processing
  const chartOverlayData = useMemo(() => {
    if (!chartOverlayActive || !overlayActiveTable) {
      return null;
    }

    const overlayDataSource = dataTables[overlayActiveTable];
    const startDate = selectedDateRange.from?.toISOString().split("T")[0];
    const endDate = selectedDateRange.to?.toISOString().split("T")[0];

    if (chartOverlayGroupBy === "org") {
      return granularity === "monthly"
        ? groupEventsByDate(
            overlayDataSource,
            overlayActiveTable,
            startDate,
            endDate
          )
        : operator === "average"
        ? calculateAverageData(overlayDataSource, overlayActiveTable)
        : calculateSumData(overlayDataSource, overlayActiveTable);
    } else {
      // For non-org views, always use monthly granularity
      return groupEventsByType(
        overlayDataSource,
        overlayActiveTable,
        chartOverlayGroupBy,
        overlayActiveMetric,
        granularity,
        startDate,
        endDate
      );
    }
  }, [
    chartOverlayActive,
    overlayActiveTable,
    chartOverlayGroupBy,
    overlayActiveMetric,
    dataTables,
    selectedDateRange,
    granularity,
    operator,
  ]);

  // Process data specifically for Summary card
  const summaryChartData = useMemo(() => {
    const data = dataTables[selectedTable];
    const startDate = selectedDateRange.from?.toISOString().split("T")[0];
    const endDate = selectedDateRange.to?.toISOString().split("T")[0];

    // Summary card always uses all-time view
    if (summaryGroupBy === "org") {
      return operator === "average"
        ? calculateAverageData(data, selectedTable)
        : calculateSumData(data, selectedTable);
    } else {
      return groupEventsByType(
        data,
        selectedTable,
        summaryGroupBy,
        selectedMetric,
        "all-time", // Summary always shows totals
        startDate,
        endDate
      );
    }
  }, [
    dataTables,
    selectedTable,
    summaryGroupBy,
    selectedMetric,
    selectedDateRange,
    operator,
  ]);

  // Previous period data for first card comparison lines
  const summaryPreviousPeriodData = useMemo(() => {
    if (!summaryPreviousPeriod) {
      return null;
    }

    const previousRange = getPreviousPeriodRange(selectedDateRange);
    const prevStartDate = previousRange.from.toISOString().split("T")[0];
    const prevEndDate = previousRange.to.toISOString().split("T")[0];

    // Filter data for previous period using same table as primary
    const previousPeriodData = filterEventsByDate(
      dataTables[selectedTable],
      prevStartDate,
      prevEndDate,
      selectedTable === "githubActions" ? "deployed_at" : "created_at"
    );

    if (summaryGroupBy === "org") {
      return operator === "average"
        ? calculateAverageData(previousPeriodData, selectedTable)
        : calculateSumData(previousPeriodData, selectedTable);
    } else {
      return groupEventsByType(
        previousPeriodData,
        selectedTable,
        summaryGroupBy,
        selectedMetric,
        "all-time",
        prevStartDate,
        prevEndDate
      );
    }
  }, [
    summaryPreviousPeriod,
    selectedDateRange,
    dataTables,
    selectedTable,
    summaryGroupBy,
    selectedMetric,
    operator,
  ]);

  // Current overlay data for second card
  const summaryOverlayCurrentData = useMemo(() => {
    if (!summaryOverlayActive || !overlayActiveTable) {
      return null;
    }

    const overlayDataSource = dataTables[overlayActiveTable];
    const startDate = selectedDateRange.from?.toISOString().split("T")[0];
    const endDate = selectedDateRange.to?.toISOString().split("T")[0];

    if (summaryOverlayGroupBy === "org") {
      return operator === "average"
        ? calculateAverageData(overlayDataSource, overlayActiveTable)
        : calculateSumData(overlayDataSource, overlayActiveTable);
    } else {
      return groupEventsByType(
        overlayDataSource,
        overlayActiveTable,
        summaryOverlayGroupBy,
        overlayActiveMetric,
        "all-time",
        startDate,
        endDate
      );
    }
  }, [
    summaryOverlayActive,
    overlayActiveTable,
    dataTables,
    summaryOverlayGroupBy,
    overlayActiveMetric,
    selectedDateRange,
    operator,
  ]);

  // Process data specifically for List card
  const listChartData = useMemo(() => {
    const data = dataTables[selectedTable];
    const startDate = selectedDateRange.from?.toISOString().split("T")[0];
    const endDate = selectedDateRange.to?.toISOString().split("T")[0];

    if (listGroupBy === "org") {
      return granularity === "monthly"
        ? groupEventsByDate(data, selectedTable, startDate, endDate)
        : allTimeData;
    } else {
      return groupEventsByType(
        data,
        selectedTable,
        listGroupBy,
        selectedMetric,
        granularity,
        startDate,
        endDate
      );
    }
  }, [
    dataTables,
    selectedTable,
    listGroupBy,
    selectedMetric,
    granularity,
    allTimeData,
    selectedDateRange,
  ]);

  // Process overlay data for List card
  const listOverlayData = useMemo(() => {
    if (!listOverlayActive || !overlayActiveTable) {
      return null;
    }

    const overlayDataSource = dataTables[overlayActiveTable];
    const startDate = selectedDateRange.from?.toISOString().split("T")[0];
    const endDate = selectedDateRange.to?.toISOString().split("T")[0];

    if (listOverlayGroupBy === "org") {
      return granularity === "monthly"
        ? groupEventsByDate(
            overlayDataSource,
            overlayActiveTable,
            startDate,
            endDate
          )
        : operator === "average"
        ? calculateAverageData(overlayDataSource, overlayActiveTable)
        : calculateSumData(overlayDataSource, overlayActiveTable);
    } else {
      return groupEventsByType(
        overlayDataSource,
        overlayActiveTable,
        listOverlayGroupBy,
        overlayActiveMetric,
        granularity,
        startDate,
        endDate
      );
    }
  }, [
    listOverlayActive,
    overlayActiveTable,
    overlayActiveMetric,
    listOverlayGroupBy,
    dataTables,
    selectedDateRange,
    granularity,
    operator,
  ]);

  const handleTableChange = (newTable: string) => {
    setSelectedTable(newTable);
    // Reset to first metric of new data source
    const newConfig = dataSourceConfig[newTable];
    const newMetric = newConfig.metrics[0].key;
    setSelectedMetric(newMetric);

    // Update URL
    updateUrl({
      selectedTable: newTable,
      selectedMetric: newMetric,
    });
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      setCustomDateRange(dateRange);
      setDateMode("custom");
      updateUrl({
        dateMode: "custom",
        selectedDateRange: dateRange,
      });
    }
  };

  const handleChartTypeChange = (newType: string) => {
    setChartType(newType);
    updateUrl({ chartType: newType });
  };

  const handleMetricChange = (newMetric: string) => {
    setSelectedMetric(newMetric);
    updateUrl({ selectedMetric: newMetric });
  };

  const handleGranularityChange = (newGranularity: string) => {
    setGranularity(newGranularity);
    updateUrl({ granularity: newGranularity });
  };

  const handleOperatorChange = (newOperator: string) => {
    setOperator(newOperator);
    updateUrl({
      operator: newOperator,
      // Preserve current overlay state
      overlayActive,
      overlayActiveTable,
      overlayActiveMetric,
      overlayActiveGroupBy,
      overlayActiveChartType,
    });
  };

  const handleTableViewChange = (newView: string) => {
    setTableView(newView);
    updateUrl({ tableView: newView });
  };

  const handleDateModeChange = (newDateMode: string) => {
    if (newDateMode === "custom") {
      // Preserve current relative date range when switching to custom
      const currentRelativeRange = getRelativeDateRange(relativeDays);
      setCustomDateRange(currentRelativeRange);
      setDateMode(newDateMode);
      updateUrl({
        dateMode: newDateMode,
        selectedDateRange: currentRelativeRange,
      });
    } else {
      // Switch to relative mode, default to 7 days
      setDateMode(newDateMode);
      setRelativeDays(7);
      updateUrl({
        dateMode: newDateMode,
        relativeDays: 7,
      });
    }
  };

  const handleRelativeDaysChange = (newRelativeDays: number) => {
    setRelativeDays(newRelativeDays);
    updateUrl({ relativeDays: newRelativeDays });
  };

  const handleAddOverlay = () => {
    // Check if overlay is supported for current chart type
    const unsupportedTypes = [
      "horizontal-bar",
      "stacked-horizontal-bar",
      "table",
    ];
    if (unsupportedTypes.includes(chartType)) {
      alert(
        `Overlay not supported for ${chartType}. Please select a different chart type.`
      );
      return;
    }

    setOverlayConfiguring(true);
    // Initialize config with defaults
    setOverlayConfigTable("pagerDuty"); // Default to different data source
    setOverlayConfigMetric("incidents"); // Default first metric
    setOverlayConfigGroupBy("org");

    // Set compatible default chart type based on primary
    if (["vertical-bar", "stacked-vertical-bar"].includes(chartType)) {
      setOverlayConfigChartType("line");
    } else if (["line", "area", "stacked-area"].includes(chartType)) {
      setOverlayConfigChartType("vertical-bar");
    }
  };

  const handleSaveOverlay = () => {
    // Copy config to active
    setOverlayActive(true);
    setOverlayActiveTable(overlayConfigTable);
    setOverlayActiveMetric(overlayConfigMetric);
    setOverlayActiveGroupBy(overlayConfigGroupBy);
    setOverlayActiveChartType(overlayConfigChartType);
    // Exit config mode
    setOverlayConfiguring(false);

    // Automatically turn ON all comparison switches
    setSummaryOverlayActive(true);
    setChartOverlayActive(true);
    setListOverlayActive(true);

    // Update URL with overlay state
    updateUrl({
      overlayActive: true,
      overlayActiveTable: overlayConfigTable,
      overlayActiveMetric: overlayConfigMetric,
      overlayActiveGroupBy: overlayConfigGroupBy,
      overlayActiveChartType: overlayConfigChartType,
      summaryOverlayActive: true,
      chartOverlayActive: true,
      listOverlayActive: true,
    });
  };

  const handleCancelOverlay = () => {
    // Clear config and exit
    setOverlayConfiguring(false);
    setOverlayConfigTable("");
    setOverlayConfigMetric("");
  };

  const handleRemoveComparison = () => {
    // Clear all overlay states
    setOverlayActive(false);
    setOverlayActiveTable("");
    setOverlayActiveMetric("");
    setOverlayActiveGroupBy("org");
    setOverlayActiveChartType("line");
    // Also clear config states
    setOverlayConfigTable("");
    setOverlayConfigMetric("");

    // Clear summary overlay states
    setSummaryOverlayActive(false);
    setSummaryOverlayGroupBy("org");

    // Clear chart overlay states
    setChartOverlayActive(false);
    setChartOverlayGroupBy("org");

    // Clear list overlay states
    setListOverlayActive(false);
    setListOverlayGroupBy("org");

    // Update URL with cleared overlay state
    updateUrl({
      overlayActive: false,
      overlayActiveTable: "",
      overlayActiveMetric: "",
      overlayActiveGroupBy: "org",
      overlayActiveChartType: "line",
      summaryOverlayActive: false,
      summaryOverlayGroupBy: "org",
      chartOverlayActive: false,
      chartOverlayGroupBy: "org",
      listOverlayActive: false,
      listOverlayGroupBy: "org",
    });
  };

  const handleShare = () => {
    const currentState = {
      chartType,
      granularity,
      selectedTable,
      selectedMetric,
      operator,
      groupBy,
      tableView,
      selectedDateRange,
      dateMode,
      relativeDays,
      summaryPreviousPeriod,
      summaryCompareDatasets: summaryOverlayActive,
      chartComparisonMode,
      listComparisonMode,
      overlayActive,
      overlayActiveTable,
      overlayActiveMetric,
      overlayActiveGroupBy,
      overlayActiveChartType,
      summaryGroupBy,
      summaryOverlayActive,
      summaryOverlayGroupBy,
      chartGroupBy,
      chartOverlayActive,
      chartOverlayGroupBy,
      listGroupBy,
      listOverlayActive,
      listOverlayGroupBy,
    };

    const shareUrl = getShareableUrl(currentState);

    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Copy to clipboard using modern API
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert("Dashboard URL copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy URL:", err);
          // Fallback to manual copy
          fallbackCopyToClipboard(shareUrl);
        });
    } else {
      // Fallback for environments without clipboard API
      fallbackCopyToClipboard(shareUrl);
    }
  };

  // Fallback clipboard function
  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        alert("Dashboard URL copied to clipboard!");
      } else {
        alert("Failed to copy URL. Please copy manually: " + text);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      alert("Failed to copy URL. Please copy manually: " + text);
    }
  };

  const handleSummaryGroupByChange = (newGroupBy: string) => {
    setSummaryGroupBy(newGroupBy);
    updateUrl({ summaryGroupBy: newGroupBy });
  };

  const handleSummaryOverlayActiveChange = (newActive: boolean) => {
    setSummaryOverlayActive(newActive);
    updateUrl({ summaryOverlayActive: newActive });
  };

  const handleSummaryOverlayGroupByChange = (newGroupBy: string) => {
    setSummaryOverlayGroupBy(newGroupBy);
    updateUrl({ summaryOverlayGroupBy: newGroupBy });
  };

  // Chart card specific handlers
  const handleChartGroupByChange = (newGroupBy: string) => {
    setChartGroupBy(newGroupBy);
    updateUrl({ chartGroupBy: newGroupBy });
  };

  const handleChartOverlayActiveChange = (active: boolean) => {
    setChartOverlayActive(active);
    updateUrl({ chartOverlayActive: active });
  };

  const handleChartOverlayGroupByChange = (newGroupBy: string) => {
    setChartOverlayGroupBy(newGroupBy);
    updateUrl({ chartOverlayGroupBy: newGroupBy });
  };

  // List card handlers
  const handleListGroupByChange = (newGroupBy: string) => {
    setListGroupBy(newGroupBy);
    updateUrl({ listGroupBy: newGroupBy });
  };

  const handleListOverlayActiveChange = (active: boolean) => {
    setListOverlayActive(active);
    updateUrl({ listOverlayActive: active });
  };

  const handleListOverlayGroupByChange = (newGroupBy: string) => {
    setListOverlayGroupBy(newGroupBy);
    updateUrl({ listOverlayGroupBy: newGroupBy });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header row with title and date picker */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Module Building UX POC
          </h1>
          <div className="flex gap-2">
            <ThemeToggle />
            {(dateMode !== "relative" || relativeDays !== 7) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDateMode("relative");
                  setRelativeDays(7);
                  updateUrl({ dateMode: "relative", relativeDays: 7 });
                }}
                className="cursor-pointer"
              >
                Reset range
              </Button>
            )}
            <DateModeSelector
              dateMode={dateMode}
              onDateModeChange={handleDateModeChange}
            />
            {dateMode === "custom" ? (
              <DateRangePicker
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                placeholder="Select date range"
                className="w-64 cursor-pointer"
              />
            ) : (
              <RelativeDaysSelector
                relativeDays={relativeDays}
                onRelativeDaysChange={handleRelativeDaysChange}
              />
            )}
            <div className="flex items-center gap-4">
              <FilterSelector />
            </div>
            <Button variant="primary" onClick={handleShare}>
              Save View
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200 dark:border-slate-700" />

        <div className="flex flex-col gap-4">
          {/* Data controls row */}
          <div className="flex items-center gap-4">
            <DataSourceSelector
              selectedTable={selectedTable}
              onTableChange={handleTableChange}
            />
            <MetricSelector
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              onMetricChange={handleMetricChange}
            />

            <div className="flex items-center gap-2 ml-auto">
              {!overlayActive && (
                <Button variant="secondary" onClick={handleAddOverlay}>
                  Add Comparison
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Overlay Configuration Controls */}
        {overlayConfiguring && (
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <DataSourceSelector
              selectedTable={overlayConfigTable}
              onTableChange={setOverlayConfigTable}
            />
            <MetricSelector
              selectedTable={overlayConfigTable}
              selectedMetric={overlayConfigMetric}
              onMetricChange={setOverlayConfigMetric}
            />
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="secondary" onClick={handleCancelOverlay}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveOverlay}>
                Add Comparison
              </Button>
            </div>
          </div>
        )}

        {/* Active Overlay Controls */}
        {overlayActive && !overlayConfiguring && (
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <DataSourceSelector
              selectedTable={overlayActiveTable}
              onTableChange={setOverlayActiveTable}
            />
            <MetricSelector
              selectedTable={overlayActiveTable}
              selectedMetric={overlayActiveMetric}
              onMetricChange={setOverlayActiveMetric}
            />
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" onClick={handleRemoveComparison}>
                Remove Comparison
              </Button>
            </div>
          </div>
        )}

        {/* Component Visibility Controls */}
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-slate-700 pb-6">
          <div className="flex items-center gap-2">
            <Switch
              id="show-summary-toggle"
              checked={showSummary}
              onCheckedChange={setShowSummary}
            />
            <label
              htmlFor="show-summary-toggle"
              className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
            >
              Show Summary
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-chart-toggle"
              checked={showChart}
              onCheckedChange={setShowChart}
            />
            <label
              htmlFor="show-chart-toggle"
              className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
            >
              Show Chart
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-table-toggle"
              checked={showTable}
              onCheckedChange={setShowTable}
            />
            <label
              htmlFor="show-table-toggle"
              className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
            >
              Show Table
            </label>
          </div>
        </div>

        {/* Display Controls - Tab Navigation */}
        <div className="flex flex-col gap-8">
          {/* Summary Controls */}
          {showSummary && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-md font-medium">Summary Controls</h2>

                {/* Show label toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="summary-label-toggle"
                    checked={showSummaryLabel}
                    onCheckedChange={setShowSummaryLabel}
                  />
                  <label
                    htmlFor="summary-label-toggle"
                    className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                  >
                    Show label
                  </label>
                </div>
              </div>
              {/* Overlay toggle - only show when there's a comparison available */}
              {overlayActiveTable && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="summary-overlay-toggle"
                    checked={summaryOverlayActive}
                    onCheckedChange={handleSummaryOverlayActiveChange}
                  />
                  <label
                    htmlFor="summary-overlay-toggle"
                    className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                  >
                    Show comparison
                  </label>
                </div>
              )}
              <div className="flex gap-2">
                <GroupBySelector
                  groupBy={summaryGroupBy}
                  onGroupByChange={handleSummaryGroupByChange}
                  selectedTable={selectedTable}
                />
                <OperatorSelector
                  operator={operator}
                  onOperatorChange={handleOperatorChange}
                />
                {/* Vs Previous Period toggle - always visible */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="prev-period-toggle"
                    checked={summaryPreviousPeriod}
                    onCheckedChange={setSummaryPreviousPeriod}
                  />
                  <label
                    htmlFor="prev-period-toggle"
                    className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                  >
                    vs Previous Period
                  </label>
                </div>
                {summaryOverlayActive && overlayActiveTable && (
                  <>
                    <div className="border-l border-gray-200 dark:border-slate-700 h-full pl-3 ml-1">
                      <div className="flex items-center gap-2 w-full">
                        <GroupBySelector
                          groupBy={summaryOverlayGroupBy}
                          onGroupByChange={handleSummaryOverlayGroupByChange}
                          selectedTable={overlayActiveTable}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chart Controls */}
          {showChart && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-md font-medium">Trend Controls</h2>
                {/* Chart-specific overlay toggle - only show when there's a comparison available */}
                {overlayActiveTable && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="chart-overlay-toggle"
                      checked={chartOverlayActive}
                      onCheckedChange={handleChartOverlayActiveChange}
                    />
                    <label
                      htmlFor="chart-overlay-toggle"
                      className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                    >
                      Show comparison
                    </label>
                  </div>
                )}
                {/* Show label toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="chart-label-toggle"
                    checked={showChartLabel}
                    onCheckedChange={setShowChartLabel}
                  />
                  <label
                    htmlFor="chart-label-toggle"
                    className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                  >
                    Show label
                  </label>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <GroupBySelector
                  groupBy={chartGroupBy}
                  onGroupByChange={handleChartGroupByChange}
                  selectedTable={selectedTable}
                />
                <GranularitySelector
                  granularity={granularity}
                  onGranularityChange={handleGranularityChange}
                />
                <DisplayLimitSelector />

                <div className="min-w-[120px]">
                  <ChartTypeSelector
                    chartType={chartType}
                    onChartTypeChange={handleChartTypeChange}
                  />
                </div>
                {chartOverlayActive && overlayActiveTable && (
                  <>
                    <div className="border-l border-gray-200 dark:border-slate-700 h-full pl-3 ml-1">
                      <div className="flex items-center gap-2 w-full flex-wrap">
                        <CompareDatasetsSelector />
                        <GroupBySelector
                          groupBy={chartOverlayGroupBy}
                          onGroupByChange={handleChartOverlayGroupByChange}
                          selectedTable={overlayActiveTable}
                        />
                        <ChartTypeSelector
                          chartType={overlayActiveChartType}
                          onChartTypeChange={setOverlayActiveChartType}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* List Controls */}
          {showTable && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-md font-medium">List Controls</h2>
                {/* Overlay toggle - only show when there's a comparison available */}
                {overlayActiveTable && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="list-overlay-toggle"
                      checked={listOverlayActive}
                      onCheckedChange={handleListOverlayActiveChange}
                    />
                    <label
                      htmlFor="list-overlay-toggle"
                      className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                    >
                      Show comparison
                    </label>
                  </div>
                )}
                {/* Show label toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="list-label-toggle"
                    checked={showTableLabel}
                    onCheckedChange={setShowTableLabel}
                  />
                  <label
                    htmlFor="list-label-toggle"
                    className="text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                  >
                    Show label
                  </label>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <GroupBySelector
                  groupBy={listGroupBy}
                  onGroupByChange={handleListGroupByChange}
                  selectedTable={selectedTable}
                />
                <GranularitySelector
                  granularity={granularity}
                  onGranularityChange={handleGranularityChange}
                />
                <DisplayLimitSelector />
                <DisplaySortSelector />
                <ViewSelector
                  view={tableView}
                  onViewChange={handleTableViewChange}
                />
                {listOverlayActive && overlayActiveTable && (
                  <>
                    <div className="border-l border-gray-200 dark:border-slate-700 h-full pl-3 ml-1">
                      <div className="flex items-center gap-4 w-full">
                        <CompareDatasetsSelector />
                        <GroupBySelector
                          groupBy={listOverlayGroupBy}
                          onGroupByChange={handleListOverlayGroupByChange}
                          selectedTable={overlayActiveTable}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Unified Card */}
          <UnifiedCard
            operator={operator}
            selectedTable={selectedTable}
            selectedMetric={selectedMetric}
            granularity={granularity}
            summaryChartData={summaryChartData}
            dateMode={dateMode}
            relativeDays={relativeDays}
            selectedDateRange={selectedDateRange}
            overlayActiveTable={overlayActiveTable}
            overlayActiveMetric={overlayActiveMetric}
            summaryPreviousPeriod={summaryPreviousPeriod}
            summaryOverlayActive={summaryOverlayActive}
            summaryPreviousPeriodData={summaryPreviousPeriodData}
            summaryOverlayCurrentData={summaryOverlayCurrentData}
            chartType={chartType}
            overlayActiveChartType={overlayActiveChartType}
            chartData={chartData}
            chartGroupBy={chartGroupBy}
            chartOverlayData={chartOverlayData}
            chartOverlayGroupBy={chartOverlayGroupBy}
            chartOverlayActive={chartOverlayActive}
            tableView={tableView}
            listChartData={listChartData}
            listGroupBy={listGroupBy}
            dataTables={dataTables}
            listOverlayActive={listOverlayActive}
            listOverlayData={listOverlayData}
            listOverlayGroupBy={listOverlayGroupBy}
            showSummary={showSummary}
            showChart={showChart}
            showTable={showTable}
            showSummaryLabel={showSummaryLabel}
            showChartLabel={showChartLabel}
            showTableLabel={showTableLabel}
          />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">Loading dashboard...</div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
