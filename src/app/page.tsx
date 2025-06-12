"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ControlsContainer,
  ChartTypeSelector,
  OperatorSelector,
  GranularitySelector,
} from "../components/ChartControls";
import { MetricsSummary } from "../components/MetricsSummary";
import { ChartRenderer } from "../components/ChartRenderer";
import { dataSourceConfig } from "../lib/chartConfig";
import { githubActionsData, pagerDutyData, githubPRData } from "../lib/data";
import {
  calculateAverageData,
  calculateSumData,
  groupEventsByDate,
  groupEventsByType,
  filterEventsByDate,
} from "../lib/utils";
import { Card } from "../components/Card";

export default function HomePage() {
  const [chartType, setChartType] = useState("area");
  const [granularity, setGranularity] = useState("monthly");
  const [selectedTable, setSelectedTable] = useState("githubActions");
  const [selectedMetric, setSelectedMetric] = useState("deployments");
  const [operator, setOperator] = useState("average");
  const [groupBy, setGroupBy] = useState("org");

  // Available data tables
  const dataTables = {
    githubActions: filterEventsByDate(
      githubActionsData,
      "2025-05-15",
      "2025-05-30",
      "deployed_at"
    ),
    pagerDuty: filterEventsByDate(
      pagerDutyData,
      "2025-05-15",
      "2025-05-30",
      "created_at"
    ),
    githubPR: filterEventsByDate(
      githubPRData,
      "2025-05-15",
      "2025-05-30",
      "created_at"
    ),
  };

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
  const currentData = useMemo(() => {
    if (groupBy === "org") {
      return granularity === "monthly"
        ? groupEventsByDate(data, selectedTable)
        : allTimeData;
    } else {
      return groupEventsByType(data, selectedTable, groupBy, selectedMetric);
    }
  }, [data, selectedTable, groupBy, granularity, allTimeData, selectedMetric]);

  const handleTableChange = (newTable: string) => {
    setSelectedTable(newTable);
    // Reset to first metric of new data source
    const newConfig = dataSourceConfig[newTable];
    setSelectedMetric(newConfig.metrics[0].key);
  };

  const handleGroupByChange = (newGroupBy: string) => {
    setGroupBy(newGroupBy);
    // Reset granularity when switching away from org grouping
    if (newGroupBy !== "org") {
      setGranularity("monthly");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-12">
      <div className="flex flex-col gap-8">
        <ControlsContainer
          selectedTable={selectedTable}
          onTableChange={handleTableChange}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          groupBy={groupBy}
          onGroupByChange={handleGroupByChange}
        />

        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {config.title}
          </h2>

          {/* Operator and Metrics Card */}
          <Card className="flex gap-4 justify-between">
            <MetricsSummary
              key={`${operator}-${selectedMetric}-${groupBy}`}
              selectedTable={selectedTable}
              selectedMetric={selectedMetric}
              operator={operator}
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h3 className="text-sm text-gray-600 font-medium w-full sm:w-auto">
                {config.metrics.find((m) => m.key === selectedMetric)?.label ||
                  (config.overlayMetric?.key === selectedMetric
                    ? config.overlayMetric.label
                    : selectedMetric)}{" "}
                over time
              </h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-40">
                  <GranularitySelector
                    granularity={granularity}
                    onGranularityChange={setGranularity}
                  />
                </div>
                <ChartTypeSelector
                  chartType={chartType}
                  onChartTypeChange={setChartType}
                />
              </div>
            </div>
            <ChartRenderer
              chartType={chartType}
              currentData={currentData}
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
