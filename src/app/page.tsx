"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  DataSourceSelector,
  MetricSelector,
  ChartTypeSelector,
  OperatorSelector,
  GranularitySelector,
  GroupBySelector,
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
} from "../lib/dashboardUtils";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export default function HomePage() {
  const [chartType, setChartType] = useState("line");
  const [granularity, setGranularity] = useState("monthly");
  const [selectedTable, setSelectedTable] = useState("githubPR");
  const [selectedMetric, setSelectedMetric] = useState("pullRequests");
  const [operator, setOperator] = useState("sum");
  const [groupBy, setGroupBy] = useState("org");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: new Date(DEFAULT_PICKER_DATES.defaultStart + "T00:00:00"),
    to: new Date(DEFAULT_PICKER_DATES.defaultEnd + "T00:00:00"),
  });

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
  const config = dataSourceConfig[selectedTable];

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
    setSelectedMetric(newConfig.metrics[0].key);
  };

  const handleGroupByChange = (newGroupBy: string) => {
    setGroupBy(newGroupBy);
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      setSelectedDateRange(dateRange);
    }
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header row with title and date picker */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Interactive Chart Demo
          </h1>
          <div className="flex gap-2">
            <DateRangePicker
              value={selectedDateRange}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
              className="w-64 cursor-pointer"
            />
            {selectedDateRange.from?.toISOString() !==
              new Date(
                DEFAULT_PICKER_DATES.defaultStart + "T00:00:00"
              ).toISOString() ||
            selectedDateRange.to?.toISOString() !==
              new Date(
                DEFAULT_PICKER_DATES.defaultEnd + "T00:00:00"
              ).toISOString() ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedDateRange({
                    from: new Date(
                      DEFAULT_PICKER_DATES.defaultStart + "T00:00:00"
                    ),
                    to: new Date(DEFAULT_PICKER_DATES.defaultEnd + "T00:00:00"),
                  });
                }}
                className="cursor-pointer"
              >
                Reset range
              </Button>
            ) : null}
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
            onMetricChange={setSelectedMetric}
          />
          <GroupBySelector
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            selectedTable={selectedTable}
          />
          <ChartTypeSelector
            chartType={chartType}
            onChartTypeChange={setChartType}
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
            <ChartTypeSelector
              chartType={overlayConfigChartType}
              onChartTypeChange={setOverlayConfigChartType}
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
            <ChartTypeSelector
              chartType={overlayActiveChartType}
              onChartTypeChange={setOverlayActiveChartType}
            />
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" onClick={handleRemoveOverlay}>
                Remove Overlay
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {config.title}
            {overlayActive && overlayActiveTable && (
              <>
                {" × "}
                {dataSourceConfig[overlayActiveTable].title}
              </>
            )}
          </h2>

          {/* Operator and Metrics Card */}
          <Card className="flex gap-4 justify-between">
            <MetricsSummary
              key={`${operator}-${selectedMetric}-${groupBy}-${granularity}`}
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              operator={operator}
              granularity={granularity}
              data={allTimeData}
            />
            <div className="flex flex-col gap-4">
              <OperatorSelector
                operator={operator}
                onOperatorChange={setOperator}
              />
            </div>
          </Card>

          {/* Chart Card */}
          <Card className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm text-gray-600 font-medium">
                Trend card:{" "}
                {config.metrics.find((m) => m.key === selectedMetric)?.label ||
                  (config.overlayMetric?.key === selectedMetric
                    ? config.overlayMetric.label
                    : selectedMetric)}{" "}
                over time
              </h3>
              <div className="flex items-center gap-3">
                <GranularitySelector
                  granularity={granularity}
                  onGranularityChange={setGranularity}
                />
              </div>
            </div>
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
      </div>
    </div>
  );
}
