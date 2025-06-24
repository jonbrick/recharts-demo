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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
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

// Reusable card components to reduce duplication
const MetricsSummaryCard = ({
  operator,
  onOperatorChange,
  selectedTable,
  selectedMetric,
  granularity,
  chartData,
  dateMode,
  relativeDays,
  selectedDateRange,
  overlayActive,
  overlayData,
  overlayActiveTable,
  overlayActiveMetric,
  overlayActiveGroupBy,
  groupBy,
  onGroupByChange,
  onOverlayActiveChange,
  onOverlayGroupByChange,
  summaryComparisonMode,
  setSummaryComparisonMode,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-4">
        <h2 className="text-md font-medium">Summary Card Example</h2>
        {/* Overlay toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="summary-overlay-toggle"
            checked={overlayActive}
            onCheckedChange={onOverlayActiveChange}
          />
          <label
            htmlFor="summary-overlay-toggle"
            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
          >
            Show comparison
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <GroupBySelector
          groupBy={groupBy}
          onGroupByChange={onGroupByChange}
          selectedTable={selectedTable}
        />
        <OperatorSelector
          operator={operator}
          onOperatorChange={onOperatorChange}
        />
        {overlayActive && overlayActiveTable && (
          <>
            <div className="border-l border-gray-200 h-full pl-2">
              <div className="flex items-center gap-2 w-full">
                <ComparisonModeSelector
                  comparisonMode={summaryComparisonMode}
                  onComparisonModeChange={(mode) =>
                    setSummaryComparisonMode(mode)
                  }
                />
                <GroupBySelector
                  groupBy={overlayActiveGroupBy}
                  onGroupByChange={onOverlayGroupByChange}
                  selectedTable={overlayActiveTable}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <Card className="flex flex-col gap-4">
        <MetricsSummary
          key={`${operator}-${selectedMetric}-${selectedTable}-${granularity}`}
          selectedTable={selectedTable}
          selectedMetric={selectedMetric}
          operator={operator}
          granularity={granularity}
          data={chartData}
          dateMode={dateMode}
          relativeDays={relativeDays}
          selectedDateRange={selectedDateRange}
          comparisonData={overlayData}
          comparisonMode={overlayActive ? summaryComparisonMode : null}
          comparisonMetric={
            summaryComparisonMode === "Compare Datasets"
              ? overlayActiveMetric
              : selectedMetric
          }
        />
      </Card>
    </div>
  );
};

const ChartCard = ({
  granularity,
  onGranularityChange,
  chartType,
  onChartTypeChange,
  overlayActiveChartType,
  setOverlayActiveChartType,
  chartData,
  selectedTable,
  selectedMetric,
  chartGroupBy,
  overlayData,
  overlayActiveTable,
  overlayActiveMetric,
  chartOverlayGroupBy,
  chartOverlayActive,
  onChartGroupByChange,
  onChartOverlayActiveChange,
  onChartOverlayGroupByChange,
  dateMode,
  relativeDays,
  selectedDateRange,
}) => (
  <div className="flex flex-col gap-4 pb-8">
    <div className="flex items-center gap-4">
      <h2 className="text-md font-medium">Trend Card Example</h2>
      {/* Chart-specific overlay toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="chart-overlay-toggle"
          checked={chartOverlayActive}
          onCheckedChange={onChartOverlayActiveChange}
        />
        <label
          htmlFor="chart-overlay-toggle"
          className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
        >
          Show comparison
        </label>
      </div>
    </div>
    <div className="flex gap-2 flex-wrap">
      <GroupBySelector
        groupBy={chartGroupBy}
        onGroupByChange={onChartGroupByChange}
        selectedTable={selectedTable}
      />
      <GranularitySelector
        granularity={granularity}
        onGranularityChange={onGranularityChange}
      />
      <DisplayLimitSelector />

      <div className="min-w-[120px]">
        <ChartTypeSelector
          chartType={chartType}
          onChartTypeChange={onChartTypeChange}
        />
      </div>
      {chartOverlayActive && overlayActiveTable && (
        <>
          <div className="border-l border-gray-200 h-full pl-2">
            <div className="flex items-center gap-2 w-full flex-wrap">
              <CompareDatasetsSelector />
              <GroupBySelector
                groupBy={chartOverlayGroupBy}
                onGroupByChange={onChartOverlayGroupByChange}
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
    <Card className="flex flex-col gap-4">
      <ChartRenderer
        chartType={chartType}
        currentData={chartData}
        selectedTable={selectedTable}
        selectedMetric={selectedMetric}
        granularity={granularity}
        groupBy={chartGroupBy}
        overlayActive={chartOverlayActive}
        overlayData={overlayData}
        overlayTable={overlayActiveTable}
        overlayMetric={overlayActiveMetric}
        overlayChartType={overlayActiveChartType}
        overlayGroupBy={chartOverlayGroupBy}
        dateMode={dateMode}
        relativeDays={relativeDays}
        selectedDateRange={selectedDateRange}
      />
    </Card>
  </div>
);

const ListCard = ({
  granularity,
  onGranularityChange,
  tableView,
  onTableViewChange,
  chartData,
  selectedMetric,
  selectedTable,
  groupBy,
  dataTables,
  overlayActive,
  overlayData,
  overlayActiveMetric,
  overlayActiveTable,
  overlayActiveGroupBy,
  dateMode,
  relativeDays,
  selectedDateRange,
  onGroupByChange,
  onOverlayActiveChange,
  onOverlayGroupByChange,
}) => (
  <div className="flex flex-col gap-4 pb-8">
    <div className="flex items-center gap-4">
      <h2 className="text-md font-medium">List Card Example</h2>
      {/* Overlay toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="list-overlay-toggle"
          checked={overlayActive}
          onCheckedChange={onOverlayActiveChange}
        />
        <label
          htmlFor="list-overlay-toggle"
          className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
        >
          Show comparison
        </label>
      </div>
    </div>
    <div className="flex gap-2 flex-wrap">
      <GroupBySelector
        groupBy={groupBy}
        onGroupByChange={onGroupByChange}
        selectedTable={selectedTable}
      />
      <GranularitySelector
        granularity={granularity}
        onGranularityChange={onGranularityChange}
      />
      <DisplayLimitSelector />
      <DisplaySortSelector />
      <ViewSelector view={tableView} onViewChange={onTableViewChange} />
      {overlayActive && overlayActiveTable && (
        <>
          <div className="border-l border-gray-200 h-full pl-2">
            <div className="flex items-center gap-4 w-full">
              <CompareDatasetsSelector />
              <GroupBySelector
                groupBy={overlayActiveGroupBy}
                onGroupByChange={onOverlayGroupByChange}
                selectedTable={overlayActiveTable}
              />
            </div>
          </div>
        </>
      )}
    </div>
    <Card className="flex flex-col gap-4">
      <DataTable
        currentData={chartData}
        selectedMetric={selectedMetric}
        selectedTable={selectedTable}
        granularity={granularity}
        groupBy={groupBy}
        viewMode={tableView}
        rawData={dataTables[selectedTable]}
        overlayActive={overlayActive}
        overlayData={overlayData}
        overlayMetric={overlayActiveMetric}
        overlayTable={overlayActiveTable}
        overlayGroupBy={overlayActiveGroupBy}
        dateMode={dateMode}
        relativeDays={relativeDays}
        selectedDateRange={selectedDateRange}
      />
    </Card>
  </div>
);

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
  const [summaryComparisonMode, setSummaryComparisonMode] =
    useState("vs Previous Period");
  const [chartComparisonMode, _setChartComparisonMode] =
    useState("Compare Datasets");
  const [listComparisonMode, _setListComparisonMode] =
    useState("Compare Datasets");

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

  // Process overlay data when active
  // const overlayData = useMemo(() => {
  //   if (!overlayActive || !overlayActiveTable) {
  //     return null;
  //   }

  //   const overlayDataSource = dataTables[overlayActiveTable];
  //   const startDate = selectedDateRange.from?.toISOString().split("T")[0];
  //   const endDate = selectedDateRange.to?.toISOString().split("T")[0];

  //   if (overlayActiveGroupBy === "org") {
  //     return granularity === "monthly"
  //       ? groupEventsByDate(
  //           overlayDataSource,
  //           overlayActiveTable,
  //           startDate,
  //           endDate
  //         )
  //       : operator === "average"
  //       ? calculateAverageData(overlayDataSource, overlayActiveTable)
  //       : calculateSumData(overlayDataSource, overlayActiveTable);
  //   } else {
  //     // For non-org views, always use monthly granularity
  //     return groupEventsByType(
  //       overlayDataSource,
  //       overlayActiveTable,
  //       overlayActiveGroupBy,
  //       overlayActiveMetric,
  //       granularity,
  //       startDate,
  //       endDate
  //     );
  //   }
  // }, [
  //   overlayActive,
  //   overlayActiveTable,
  //   overlayActiveMetric,
  //   overlayActiveGroupBy,
  //   dataTables,
  //   selectedDateRange,
  //   granularity,
  //   operator,
  // ]);

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

  // Process overlay data for Summary card
  const summaryOverlayData = useMemo(() => {
    if (!summaryOverlayActive) {
      return null;
    }

    // vs Previous Period mode
    if (summaryComparisonMode === "vs Previous Period") {
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
        const result =
          operator === "average"
            ? calculateAverageData(previousPeriodData, selectedTable)
            : calculateSumData(previousPeriodData, selectedTable);

        return result;
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
    }

    // Compare Datasets mode (existing logic)
    if (summaryComparisonMode === "Compare Datasets") {
      if (!overlayActiveTable) {
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
    }

    // No valid comparison mode
    return null;
  }, [
    summaryOverlayActive,
    summaryComparisonMode,
    overlayActiveTable,
    overlayActiveMetric,
    summaryOverlayGroupBy,
    summaryGroupBy,
    selectedTable,
    selectedMetric,
    dataTables,
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

    // Update URL with overlay state
    updateUrl({
      overlayActive: true,
      overlayActiveTable: overlayConfigTable,
      overlayActiveMetric: overlayConfigMetric,
      overlayActiveGroupBy: overlayConfigGroupBy,
      overlayActiveChartType: overlayConfigChartType,
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

    // Update URL with cleared overlay state
    updateUrl({
      overlayActive: false,
      overlayActiveTable: "",
      overlayActiveMetric: "",
      overlayActiveGroupBy: "org",
      overlayActiveChartType: "line",
      summaryOverlayActive: false,
      summaryOverlayGroupBy: "org",
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
      summaryComparisonMode: summaryComparisonMode,
      chartComparisonMode: chartComparisonMode,
      listComparisonMode: listComparisonMode,
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

  const handleSummaryComparisonModeChange = (mode: string) => {
    setSummaryComparisonMode(mode);
    updateUrl({ summaryComparisonMode: mode });
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
          <h1 className="text-3xl font-bold text-gray-900">
            Metrics Building UX POC
          </h1>
          <div className="flex gap-2">
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
        <div className="border-b border-gray-200" />

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
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
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
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
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

        {/* Display Controls - Tab Navigation */}
        <Tabs defaultValue="Demo" className="pt-2 w-full">
          <TabsList className="mb-6" variant="line">
            <TabsTrigger value="Demo">Demo</TabsTrigger>
            <TabsTrigger value="Summary">Summary Card Example</TabsTrigger>
            <TabsTrigger value="Chart">Chart Card Example</TabsTrigger>
            <TabsTrigger value="List">List Card Example</TabsTrigger>
          </TabsList>

          {/* Demo Tab - Shows all cards */}
          <TabsContent value="Demo">
            <div className="flex flex-col gap-8">
              {/* Metrics Summary Card */}
              <MetricsSummaryCard
                operator={operator}
                onOperatorChange={handleOperatorChange}
                selectedTable={selectedTable}
                selectedMetric={selectedMetric}
                granularity={granularity}
                chartData={summaryChartData}
                dateMode={dateMode}
                relativeDays={relativeDays}
                selectedDateRange={selectedDateRange}
                overlayActive={summaryOverlayActive}
                overlayData={summaryOverlayData}
                overlayActiveTable={overlayActiveTable}
                overlayActiveMetric={overlayActiveMetric}
                overlayActiveGroupBy={summaryOverlayGroupBy}
                groupBy={summaryGroupBy}
                onGroupByChange={handleSummaryGroupByChange}
                onOverlayActiveChange={handleSummaryOverlayActiveChange}
                onOverlayGroupByChange={handleSummaryOverlayGroupByChange}
                summaryComparisonMode={summaryComparisonMode}
                setSummaryComparisonMode={handleSummaryComparisonModeChange}
              />

              {/* Chart Card */}
              <ChartCard
                granularity={granularity}
                onGranularityChange={handleGranularityChange}
                chartType={chartType}
                onChartTypeChange={handleChartTypeChange}
                overlayActiveChartType={overlayActiveChartType}
                setOverlayActiveChartType={setOverlayActiveChartType}
                chartData={chartData}
                selectedTable={selectedTable}
                selectedMetric={selectedMetric}
                chartGroupBy={chartGroupBy}
                overlayData={chartOverlayData}
                overlayActiveTable={overlayActiveTable}
                overlayActiveMetric={overlayActiveMetric}
                chartOverlayGroupBy={chartOverlayGroupBy}
                chartOverlayActive={chartOverlayActive}
                onChartGroupByChange={handleChartGroupByChange}
                onChartOverlayActiveChange={handleChartOverlayActiveChange}
                onChartOverlayGroupByChange={handleChartOverlayGroupByChange}
                dateMode={dateMode}
                relativeDays={relativeDays}
                selectedDateRange={selectedDateRange}
              />

              {/* List Card */}
              <ListCard
                granularity={granularity}
                onGranularityChange={handleGranularityChange}
                tableView={tableView}
                onTableViewChange={handleTableViewChange}
                chartData={listChartData}
                selectedMetric={selectedMetric}
                selectedTable={selectedTable}
                groupBy={listGroupBy}
                dataTables={dataTables}
                overlayActive={listOverlayActive}
                overlayData={listOverlayData}
                overlayActiveMetric={overlayActiveMetric}
                overlayActiveTable={overlayActiveTable}
                overlayActiveGroupBy={listOverlayGroupBy}
                dateMode={dateMode}
                relativeDays={relativeDays}
                selectedDateRange={selectedDateRange}
                onGroupByChange={handleListGroupByChange}
                onOverlayActiveChange={handleListOverlayActiveChange}
                onOverlayGroupByChange={handleListOverlayGroupByChange}
              />
            </div>
          </TabsContent>

          {/* Summary Tab - Shows only metrics summary */}
          <TabsContent value="Summary">
            <MetricsSummaryCard
              operator={operator}
              onOperatorChange={handleOperatorChange}
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              granularity={granularity}
              chartData={summaryChartData}
              dateMode={dateMode}
              relativeDays={relativeDays}
              selectedDateRange={selectedDateRange}
              overlayActive={summaryOverlayActive}
              overlayData={summaryOverlayData}
              overlayActiveTable={overlayActiveTable}
              overlayActiveMetric={overlayActiveMetric}
              overlayActiveGroupBy={summaryOverlayGroupBy}
              groupBy={summaryGroupBy}
              onGroupByChange={handleSummaryGroupByChange}
              onOverlayActiveChange={handleSummaryOverlayActiveChange}
              onOverlayGroupByChange={handleSummaryOverlayGroupByChange}
              summaryComparisonMode={summaryComparisonMode}
              setSummaryComparisonMode={handleSummaryComparisonModeChange}
            />
          </TabsContent>

          {/* Chart Tab - Shows only chart */}
          <TabsContent value="Chart">
            <ChartCard
              granularity={granularity}
              onGranularityChange={handleGranularityChange}
              chartType={chartType}
              onChartTypeChange={handleChartTypeChange}
              overlayActiveChartType={overlayActiveChartType}
              setOverlayActiveChartType={setOverlayActiveChartType}
              chartData={chartData}
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              chartGroupBy={chartGroupBy}
              overlayData={chartOverlayData}
              overlayActiveTable={overlayActiveTable}
              overlayActiveMetric={overlayActiveMetric}
              chartOverlayGroupBy={chartOverlayGroupBy}
              chartOverlayActive={chartOverlayActive}
              onChartGroupByChange={handleChartGroupByChange}
              onChartOverlayActiveChange={handleChartOverlayActiveChange}
              onChartOverlayGroupByChange={handleChartOverlayGroupByChange}
              dateMode={dateMode}
              relativeDays={relativeDays}
              selectedDateRange={selectedDateRange}
            />
          </TabsContent>

          {/* List Tab - Shows only list */}
          <TabsContent value="List">
            <ListCard
              granularity={granularity}
              onGranularityChange={handleGranularityChange}
              tableView={tableView}
              onTableViewChange={handleTableViewChange}
              chartData={listChartData}
              selectedMetric={selectedMetric}
              selectedTable={selectedTable}
              groupBy={listGroupBy}
              dataTables={dataTables}
              overlayActive={listOverlayActive}
              overlayData={listOverlayData}
              overlayActiveMetric={overlayActiveMetric}
              overlayActiveTable={overlayActiveTable}
              overlayActiveGroupBy={listOverlayGroupBy}
              dateMode={dateMode}
              relativeDays={relativeDays}
              selectedDateRange={selectedDateRange}
              onGroupByChange={handleListGroupByChange}
              onOverlayActiveChange={handleListOverlayActiveChange}
              onOverlayGroupByChange={handleListOverlayGroupByChange}
            />
          </TabsContent>
        </Tabs>
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
