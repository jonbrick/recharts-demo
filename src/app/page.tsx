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

  // Console log to verify states
  useEffect(() => {
    console.log("🔧 Overlay Config States:", {
      configuring: overlayConfiguring,
      table: overlayConfigTable,
      metric: overlayConfigMetric,
      groupBy: overlayConfigGroupBy,
      chartType: overlayConfigChartType,
    });
    console.log("✅ Overlay Active States:", {
      active: overlayActive,
      table: overlayActiveTable,
      metric: overlayActiveMetric,
      groupBy: overlayActiveGroupBy,
      chartType: overlayActiveChartType,
    });
  }, [
    overlayConfiguring,
    overlayConfigTable,
    overlayConfigMetric,
    overlayConfigGroupBy,
    overlayConfigChartType,
    overlayActive,
    overlayActiveTable,
    overlayActiveMetric,
    overlayActiveGroupBy,
    overlayActiveChartType,
  ]);

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

  // Replace your existing allTimeData calculation with this:
  const allTimeData = useMemo(() => {
    return operator === "average"
      ? calculateAverageData(data, selectedTable)
      : calculateSumData(data, selectedTable);
  }, [data, selectedTable, operator]);

  // Get the current dataset based on granularity
  const chartData = useMemo(() => {
    console.log("📊 PRIMARY chartData recalculating with groupBy:", groupBy);
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

    console.log("🔄 Processing overlay data:", {
      table: overlayActiveTable,
      metric: overlayActiveMetric,
      groupBy: overlayActiveGroupBy,
    });

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

  // Log the processed data
  useEffect(() => {
    if (overlayData) {
      console.log("📊 Overlay data processed:", overlayData);
    }
  }, [overlayData]);

  const handleTableChange = (newTable: string) => {
    setSelectedTable(newTable);
    // Reset to first metric of new data source
    const newConfig = dataSourceConfig[newTable];
    setSelectedMetric(newConfig.metrics[0].key);
  };

  const handleGroupByChange = (newGroupBy: string) => {
    console.log("🎯 PRIMARY groupBy changed from:", groupBy, "to:", newGroupBy);
    setGroupBy(newGroupBy);
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      setSelectedDateRange(dateRange);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Interactive Chart Demo
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <DataSourceSelector
              selectedTable={selectedTable}
              onTableChange={handleTableChange}
            />
            <MetricSelector
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              onMetricChange={setSelectedMetric}
            />
            {/* Add Overlay Button */}
            {!overlayConfiguring && !overlayActive && (
              <Button
                variant="secondary"
                onClick={() => {
                  console.log("🎯 Add Overlay clicked!");
                  console.log("📊 Primary chart type:", chartType);

                  // Check if overlay is supported for current chart type
                  const unsupportedTypes = [
                    "horizontal-bar",
                    "stacked-horizontal-bar",
                    "table",
                  ];
                  if (unsupportedTypes.includes(chartType)) {
                    console.log(
                      "❌ Overlay not supported for chart type:",
                      chartType
                    );
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
                  if (
                    ["vertical-bar", "stacked-vertical-bar"].includes(chartType)
                  ) {
                    setOverlayConfigChartType("line");
                  } else if (
                    ["line", "area", "stacked-area"].includes(chartType)
                  ) {
                    setOverlayConfigChartType("vertical-bar");
                  }
                }}
                className="whitespace-nowrap"
              >
                <span className="mr-1">+</span> Add Overlay
              </Button>
            )}

            {/* Overlay Configuration Controls */}
            {overlayConfiguring && (
              <>
                <DataSourceSelector
                  selectedTable={overlayConfigTable}
                  onTableChange={(value) => {
                    console.log("📊 Overlay data source changed to:", value);
                    setOverlayConfigTable(value);
                    // Reset metric to first available for new data source
                    const firstMetric =
                      dataSourceConfig[value]?.metrics[0]?.key || "";
                    setOverlayConfigMetric(firstMetric);
                  }}
                />
                <MetricSelector
                  selectedTable={overlayConfigTable}
                  selectedMetric={overlayConfigMetric}
                  onMetricChange={(value) => {
                    console.log("📈 Overlay metric changed to:", value);
                    setOverlayConfigMetric(value);
                  }}
                />
                {/* Config phase chart controls */}
                <GroupBySelector
                  groupBy={overlayConfigGroupBy}
                  onGroupByChange={(value) => {
                    console.log(
                      "🔄 Config: Overlay groupBy changed to:",
                      value
                    );
                    setOverlayConfigGroupBy(value);
                  }}
                  selectedTable={overlayConfigTable}
                />
                <ChartTypeSelector
                  chartType={overlayConfigChartType}
                  onChartTypeChange={(value) => {
                    console.log(
                      "📊 Config: Overlay chart type changed to:",
                      value
                    );

                    // Validate during config too
                    const validTypes = [
                      "vertical-bar",
                      "stacked-vertical-bar",
                    ].includes(chartType)
                      ? ["line", "area", "stacked-area"]
                      : ["line", "area", "stacked-area"].includes(chartType)
                      ? ["vertical-bar", "stacked-vertical-bar"]
                      : [];

                    if (!validTypes.includes(value)) {
                      console.log(
                        "❌ Config: Invalid overlay chart type:",
                        value
                      );
                      alert(`Cannot use ${value} as overlay with ${chartType}`);
                      return;
                    }

                    setOverlayConfigChartType(value);
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      console.log("💾 Save overlay clicked!");
                      // Copy config to active
                      setOverlayActive(true);
                      setOverlayActiveTable(overlayConfigTable);
                      setOverlayActiveMetric(overlayConfigMetric);
                      setOverlayActiveGroupBy(overlayConfigGroupBy);
                      setOverlayActiveChartType(overlayConfigChartType);
                      // Exit config mode
                      setOverlayConfiguring(false);
                    }}
                    className="px-4"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      console.log("❌ Cancel overlay clicked!");
                      // Clear config and exit
                      setOverlayConfiguring(false);
                      setOverlayConfigTable("");
                      setOverlayConfigMetric("");
                    }}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {/* Clear Overlay Button */}
            {overlayActive && !overlayConfiguring && (
              <Button
                variant="ghost"
                onClick={() => {
                  console.log("🧹 Clear overlay clicked!");
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
                }}
                className="whitespace-nowrap"
              >
                <span className="mr-1">×</span> Clear Overlay
              </Button>
            )}
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
                      to: new Date(
                        DEFAULT_PICKER_DATES.defaultEnd + "T00:00:00"
                      ),
                    });
                  }}
                  className="cursor-pointer"
                >
                  Reset range
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {config.title}
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
                <GroupBySelector
                  groupBy={groupBy}
                  onGroupByChange={handleGroupByChange}
                  selectedTable={selectedTable}
                />
                <ChartTypeSelector
                  chartType={chartType}
                  onChartTypeChange={setChartType}
                />
              </div>
            </div>
            {/* Overlay Chart Controls */}
            {overlayActive && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-gray-600 font-medium">
                  Overlay Dataset:
                </span>
                <GroupBySelector
                  groupBy={overlayActiveGroupBy}
                  onGroupByChange={(value) => {
                    console.log("🔄 Overlay groupBy changed to:", value);
                    setOverlayActiveGroupBy(value);
                  }}
                  selectedTable={overlayActiveTable}
                />
                <ChartTypeSelector
                  chartType={overlayActiveChartType}
                  onChartTypeChange={(value) => {
                    console.log("📊 Overlay chart type changed to:", value);

                    // Validate the selection against primary chart type
                    const validTypes = [
                      "vertical-bar",
                      "stacked-vertical-bar",
                    ].includes(chartType)
                      ? ["line", "area", "stacked-area"]
                      : ["line", "area", "stacked-area"].includes(chartType)
                      ? ["vertical-bar", "stacked-vertical-bar"]
                      : [];

                    if (!validTypes.includes(value)) {
                      console.log("❌ Invalid overlay chart type:", value);
                      alert(`Cannot use ${value} as overlay with ${chartType}`);
                      return;
                    }

                    setOverlayActiveChartType(value);
                  }}
                />
              </div>
            )}
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
