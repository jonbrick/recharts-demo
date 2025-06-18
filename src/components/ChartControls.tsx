// ChartControls.jsx - All chart control components

import React from "react";
import { dataSourceConfig, chartTypeConfig } from "../lib/chartConfig.js";
import { POC_START_DATE, POC_END_DATE } from "../lib/dashboardUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

interface DataSourceSelectorProps {
  selectedTable: string;
  onTableChange: (value: string) => void;
  disabled?: boolean;
}

export function DataSourceSelector({
  selectedTable,
  onTableChange,
  disabled = false,
}: DataSourceSelectorProps) {
  return (
    <Select
      value={selectedTable}
      onValueChange={onTableChange}
      disabled={disabled}
    >
      <SelectTrigger className="cursor-pointer">
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
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="sum">Sum</SelectItem>
        <SelectItem value="average">Average</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface MetricSelectorProps {
  selectedTable: string;
  selectedMetric: string;
  onMetricChange: (value: string) => void;
  disabled?: boolean;
}

export function MetricSelector({
  selectedTable,
  selectedMetric,
  onMetricChange,
  disabled = false,
}: MetricSelectorProps) {
  const config = dataSourceConfig[selectedTable];
  const allMetrics = [...config.metrics];
  if (config.overlayMetric) {
    allMetrics.push(config.overlayMetric);
  }

  return (
    <Select
      value={selectedMetric}
      onValueChange={onMetricChange}
      disabled={disabled}
    >
      <SelectTrigger className="cursor-pointer">
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
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="monthly">Daily View</SelectItem>
        <SelectItem value="all-time">All Time View</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface GroupBySelectorProps {
  groupBy: string;
  onGroupByChange: (value: string) => void;
  selectedTable: string;
  disabled?: boolean;
}

export function GroupBySelector({
  groupBy,
  onGroupByChange,
  selectedTable,
  disabled = false,
}: GroupBySelectorProps) {
  const config = dataSourceConfig[selectedTable];
  const groupByOptions = config.groupByOptions || [];

  return (
    <Select value={groupBy} onValueChange={onGroupByChange} disabled={disabled}>
      <SelectTrigger className="cursor-pointer">
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

interface ChartTypeSelectorProps {
  chartType: string;
  onChartTypeChange: (value: string) => void;
  disabled?: boolean;
}

export function ChartTypeSelector({
  chartType,
  onChartTypeChange,
  disabled = false,
}: ChartTypeSelectorProps) {
  return (
    <Select
      value={chartType}
      onValueChange={onChartTypeChange}
      disabled={disabled}
    >
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {Object.entries(chartTypeConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            {config.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ViewSelector({ view, onViewChange }) {
  return (
    <Select value={view} onValueChange={onViewChange}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="day">X-axis View (Day)</SelectItem>
        <SelectItem value="record">Y-axis View (Records)</SelectItem>
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

export function DateModeSelector({ dateMode, onDateModeChange }) {
  return (
    <Select value={dateMode} onValueChange={onDateModeChange}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relative">Relative</SelectItem>
        <SelectItem value="custom">Datepicker</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function RelativeDaysSelector({ relativeDays, onRelativeDaysChange }) {
  return (
    <Select
      value={relativeDays.toString()}
      onValueChange={(value) => onRelativeDaysChange(parseInt(value, 10))}
    >
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 days</SelectItem>
        <SelectItem value="14">Last 14 days</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function FilterSelector() {
  return (
    <Select value="No Filter" onValueChange={() => {}}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="No Filter">Filter</SelectItem>
        <SelectItem value="Filter by Team">Filter by Team</SelectItem>
        <SelectItem value="Filter by Person">Filter by Person</SelectItem>
        <SelectItem value="Filter by Repo">Filter by Repo</SelectItem>
        <SelectItem value="Filter by Service">Filter by Service</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ComparisonModeSelector() {
  return (
    <Select value="Compare Datasets" onValueChange={() => {}}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Compare Datasets">Compare Datasets</SelectItem>
        <SelectItem value="vs Previous Period">vs Previous Period</SelectItem>
        <SelectItem value="vs Last Month">vs Last Month</SelectItem>
        <SelectItem value="vs Organization Average">
          vs Organization Average
        </SelectItem>
        <SelectItem value="vs Team Average">vs Team Average</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function DisplayLimitSelector() {
  return (
    <Select value="No clamping" onValueChange={() => {}}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="No clamping">No clamping</SelectItem>
        <SelectItem value="Top 5">Top 5</SelectItem>
        <SelectItem value="Top 10">Top 10</SelectItem>
        <SelectItem value="Bottom 5">Bottom 5</SelectItem>
        <SelectItem value="Bottom 10">Bottom 10</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function DisplaySortSelector() {
  return (
    <Select value="Sort by date" onValueChange={() => {}}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Sort by date">Sort by date</SelectItem>
        <SelectItem value="Sort by alphabetical">
          Sort by Alphabetical
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function CardSizeSelector() {
  return (
    <Select value="Medium (768px)" onValueChange={() => {}}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Small (320px)">Small (320px)</SelectItem>
        <SelectItem value="Medium (768px)">Medium (768px)</SelectItem>
        <SelectItem value="Large (1024px)">Large (1024px)</SelectItem>
        <SelectItem value="XL (1440px)">XL (1440px)</SelectItem>
      </SelectContent>
    </Select>
  );
}
