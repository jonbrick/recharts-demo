"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ControlsContainer,
  ChartTypeSelector,
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
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <ControlsContainer
        selectedTable={selectedTable}
        onTableChange={handleTableChange}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        operator={operator}
        onOperatorChange={setOperator}
        granularity={granularity}
        onGranularityChange={setGranularity}
        groupBy={groupBy}
        onGroupByChange={handleGroupByChange}
      />

      <Card className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-700">
              {config.title}
            </h2>
            <p className="text-gray-600">{config.description}</p>
          </div>

          <div className="ml-4 flex flex-col gap-4">
            <ChartTypeSelector
              chartType={chartType}
              onChartTypeChange={setChartType}
            />
          </div>
        </div>

        <MetricsSummary
          key={`${operator}-${selectedMetric}-${groupBy}`}
          selectedTable={selectedTable}
          selectedMetric={selectedMetric}
          operator={operator}
        />
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
  );
}
