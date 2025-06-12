// ChartControls.jsx - All chart control components

import React from "react";
import { dataSourceConfig, chartTypeConfig } from "../lib/chartConfig.js";
import { POC_START_DATE, POC_END_DATE } from "../lib/utils.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

export function DataSourceSelector({ selectedTable, onTableChange }) {
  return (
    <Select value={selectedTable} onValueChange={onTableChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(dataSourceConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            {config.icon} {config.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OperatorSelector({ operator, onOperatorChange }) {
  return (
    <Select value={operator} onValueChange={onOperatorChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="average">Average</SelectItem>
        <SelectItem value="sum">Sum</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function MetricSelector({
  selectedTable,
  selectedMetric,
  onMetricChange,
}) {
  const config = dataSourceConfig[selectedTable];
  const allMetrics = [...config.metrics];
  if (config.overlayMetric) {
    allMetrics.push(config.overlayMetric);
  }

  return (
    <Select value={selectedMetric} onValueChange={onMetricChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allMetrics.map((metric) => (
          <SelectItem key={metric.key} value={metric.key}>
            {metric.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function GranularitySelector({ granularity, onGranularityChange }) {
  return (
    <Select value={granularity} onValueChange={onGranularityChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="monthly">Daily View</SelectItem>
        <SelectItem value="all-time">All Time View</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function GroupBySelector({ groupBy, onGroupByChange, selectedTable }) {
  const config = dataSourceConfig[selectedTable];
  const groupByOptions = config.groupByOptions || [];

  return (
    <Select value={groupBy} onValueChange={onGroupByChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {groupByOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ChartTypeSelector({ chartType, onChartTypeChange }) {
  return (
    <Select value={chartType} onValueChange={onChartTypeChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(chartTypeConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            {config.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DatePickerSelector({ onDateChange }) {
  const startDate = new Date(POC_START_DATE).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(POC_END_DATE).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Select
      value={`${POC_START_DATE} to ${POC_END_DATE}`}
      onValueChange={onDateChange}
      disabled
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={`${POC_START_DATE} to ${POC_END_DATE}`}>
          {startDate} - {endDate}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ControlsContainer({
  selectedTable,
  onTableChange,
  selectedMetric,
  onMetricChange,
  operator,
  onOperatorChange,
  granularity,
  onGranularityChange,
  groupBy,
  onGroupByChange,
  onDateChange,
  title = "Interactive Chart Demo",
}: {
  selectedTable: string,
  onTableChange: (newTable: string) => void,
  selectedMetric: string,
  onMetricChange: (newMetric: string) => void,
  operator: string,
  onOperatorChange: (newOperator: string) => void,
  granularity: string,
  onGranularityChange: (newGranularity: string) => void,
  groupBy: string,
  onGroupByChange: (newGroupBy: string) => void,
  onDateChange?: (date: string) => void,
  title?: string,
}) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <DataSourceSelector
          selectedTable={selectedTable}
          onTableChange={onTableChange}
        />
        <MetricSelector
          selectedTable={selectedTable}
          selectedMetric={selectedMetric}
          onMetricChange={onMetricChange}
        />
        <GroupBySelector
          groupBy={groupBy}
          onGroupByChange={onGroupByChange}
          selectedTable={selectedTable}
        />
        <OperatorSelector
          operator={operator}
          onOperatorChange={onOperatorChange}
        />
        <GranularitySelector
          granularity={granularity}
          onGranularityChange={onGranularityChange}
        />
        {onDateChange && <DatePickerSelector onDateChange={onDateChange} />}
      </div>
    </div>
  );
}
