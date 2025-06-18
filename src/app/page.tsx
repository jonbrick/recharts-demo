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
} from "../lib/dashboardUtils";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { DataTable } from "../components/DataTable";

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

    if (groupBy === "org") {
      return granularity === "monthly"
        ? groupEventsByDate(data, selectedTable, startDate, endDate)
        : allTimeData;
    } else {
      // For non-org views, always use monthly granularity
      return groupEventsByType(
        data,
        selectedTable,
        groupBy,
        selectedMetric,
        granularity,
        startDate,
        endDate
      );
    }
  }, [
    data,
    selectedTable,
    groupBy,
    selectedMetric,
    granularity,
    allTimeData,
    selectedDateRange,
  ]);

  // Process overlay data when active
  const overlayData = useMemo(() => {
    if (!overlayActive || !overlayActiveTable) {
      return null;
    }

    const overlayDataSource = dataTables[overlayActiveTable];
    const startDate = selectedDateRange.from?.toISOString().split("T")[0];
    const endDate = selectedDateRange.to?.toISOString().split("T")[0];

    if (overlayActiveGroupBy === "org") {
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
        overlayActiveGroupBy,
        overlayActiveMetric,
        granularity,
        startDate,
        endDate
      );
    }
  }, [
    overlayActive,
    overlayActiveTable,
    overlayActiveMetric,
    overlayActiveGroupBy,
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

  const handleGroupByChange = (newGroupBy: string) => {
    setGroupBy(newGroupBy);
    updateUrl({ groupBy: newGroupBy });
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

  const handleRemoveOverlay = () => {
    // Clear all overlay states
    setOverlayActive(false);
    setOverlayActiveTable("");
    setOverlayActiveMetric("");
    setOverlayActiveGroupBy("org");
    setOverlayActiveChartType("line");
    // Also clear config states
    setOverlayConfigTable("");
    setOverlayConfigMetric("");
    setOverlayConfigGroupBy("org");
    setOverlayConfigChartType("line");

    // Update URL to remove overlay
    updateUrl({ overlayActive: false });
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
      overlayActive,
      overlayActiveTable,
      overlayActiveMetric,
      overlayActiveGroupBy,
      overlayActiveChartType,
    };

    const shareUrl = getShareableUrl(currentState);

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("Dashboard URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        alert("Failed to copy URL. Check console for details.");
      });
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
            <Button variant="primary" onClick={handleShare}>
              Share View
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200" />

        {/* Controls row */}
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
          <GroupBySelector
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            selectedTable={selectedTable}
          />

          <div className="flex items-center gap-2 ml-auto">
            {!overlayActive && (
              <Button variant="secondary" onClick={handleAddOverlay}>
                Add Overlay
              </Button>
            )}
          </div>
        </div>

        {/* Overlay Configuration Controls */}
        {overlayConfiguring && (
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Overlay:</span>
            <DataSourceSelector
              selectedTable={overlayConfigTable}
              onTableChange={setOverlayConfigTable}
            />
            <MetricSelector
              selectedTable={overlayConfigTable}
              selectedMetric={overlayConfigMetric}
              onMetricChange={setOverlayConfigMetric}
            />
            <GroupBySelector
              groupBy={overlayConfigGroupBy}
              onGroupByChange={setOverlayConfigGroupBy}
              selectedTable={overlayConfigTable}
            />
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="primary" onClick={handleSaveOverlay}>
                Add Overlay
              </Button>
              <Button variant="secondary" onClick={handleCancelOverlay}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Active Overlay Controls */}
        {overlayActive && !overlayConfiguring && (
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Overlay:</span>
            <DataSourceSelector
              selectedTable={overlayActiveTable}
              onTableChange={setOverlayActiveTable}
            />
            <MetricSelector
              selectedTable={overlayActiveTable}
              selectedMetric={overlayActiveMetric}
              onMetricChange={setOverlayActiveMetric}
            />
            <GroupBySelector
              groupBy={overlayActiveGroupBy}
              onGroupByChange={setOverlayActiveGroupBy}
              selectedTable={overlayActiveTable}
            />
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" onClick={handleRemoveOverlay}>
                Remove Overlay
              </Button>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200" />

        <div className="flex flex-col gap-8">
          {/* Metrics Summary Card */}
          <div className="flex flex-col gap-6 border-b  border-gray-200  pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-md text-gray-600 font-medium">
                Summary card controls
              </h2>
              <OperatorSelector
                operator={operator}
                onOperatorChange={handleOperatorChange}
              />
            </div>
            <Card className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <MetricsSummary
                  key={`${operator}-${selectedMetric}-${groupBy}-${granularity}`}
                  selectedTable={selectedTable}
                  selectedMetric={selectedMetric}
                  operator={operator}
                  granularity={granularity}
                  data={chartData}
                  dateMode={dateMode}
                  relativeDays={relativeDays}
                  selectedDateRange={selectedDateRange}
                />
                {overlayActive && overlayData && (
                  <>
                    <MetricsSummary
                      className="border-l border-gray-200 dark:border-gray-700 pl-8"
                      key={`overlay-${operator}-${overlayActiveMetric}-${overlayActiveGroupBy}-${granularity}`}
                      selectedTable={overlayActiveTable}
                      selectedMetric={overlayActiveMetric}
                      operator={operator}
                      granularity={granularity}
                      data={overlayData}
                      dateMode={dateMode}
                      relativeDays={relativeDays}
                      selectedDateRange={selectedDateRange}
                    />
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Chart Card */}
          <div className="flex flex-col gap-6 border-b  border-gray-200  pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-md text-gray-600 font-medium">
                Trend controls
              </h2>
              <div className="flex items-center gap-3">
                <GranularitySelector
                  granularity={granularity}
                  onGranularityChange={handleGranularityChange}
                />
                <ChartTypeSelector
                  chartType={chartType}
                  onChartTypeChange={handleChartTypeChange}
                />
                {overlayActive && !overlayConfiguring && (
                  <>
                    <span className="text-sm text-gray-500">|</span>
                    <span className="text-sm text-gray-600">Overlay:</span>
                    <ChartTypeSelector
                      chartType={overlayActiveChartType}
                      onChartTypeChange={setOverlayActiveChartType}
                    />
                  </>
                )}
              </div>
            </div>
            <Card className="flex flex-col gap-4">
              <ChartRenderer
                chartType={chartType}
                currentData={chartData}
                selectedTable={selectedTable}
                selectedMetric={selectedMetric}
                granularity={granularity}
                groupBy={groupBy}
                // Overlay props
                overlayActive={overlayActive}
                overlayData={overlayData}
                overlayTable={overlayActiveTable}
                overlayMetric={overlayActiveMetric}
                overlayChartType={overlayActiveChartType}
                overlayGroupBy={overlayActiveGroupBy}
              />
            </Card>
          </div>

          {/* List Card */}
          <div className="flex flex-col gap-6 border-b  border-gray-200  pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-md text-gray-600 font-medium">
                List card controls
              </h2>
              <div className="flex items-center gap-3">
                <GranularitySelector
                  granularity={granularity}
                  onGranularityChange={handleGranularityChange}
                />
                <ViewSelector
                  view={tableView}
                  onViewChange={handleTableViewChange}
                />
              </div>
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
              />
            </Card>
          </div>
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
