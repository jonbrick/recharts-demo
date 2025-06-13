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
    from: new Date(DEFAULT_PICKER_DATES.defaultStart),
    to: new Date(DEFAULT_PICKER_DATES.defaultEnd),
  });

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
            <div className="flex gap-2">
              <DateRangePicker
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                placeholder="Select date range"
                className="w-64 cursor-pointer"
              />
              {selectedDateRange.from?.toISOString() !==
                new Date(DEFAULT_PICKER_DATES.defaultStart).toISOString() ||
              selectedDateRange.to?.toISOString() !==
                new Date(DEFAULT_PICKER_DATES.defaultEnd).toISOString() ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedDateRange({
                      from: new Date(DEFAULT_PICKER_DATES.defaultStart),
                      to: new Date(DEFAULT_PICKER_DATES.defaultEnd),
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
            <ChartRenderer
              chartType={chartType}
              currentData={chartData}
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              granularity={granularity}
              groupBy={groupBy}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
