// ChartRenderer.jsx - Unified chart rendering component

import React from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  dataSourceConfig,
  formatValue,
  isMathMetric,
} from "../lib/chartConfig.js";

// Common chart colors
const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
  "#ffb347",
  "#87ceeb",
];

// Global animation settings
const DISABLE_ANIMATIONS = true;

const commonChartProps = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  isAnimationActive: false,
};

const commonTooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

function CustomTooltip({
  active,
  payload,
  label,
  selectedMetric,
  isMultiSeries,
}) {
  if (!active) {
    return null;
  }

  // Get data point - for math metrics with no data, we might not have payload
  const dataPoint = payload?.[0]?.payload || label;
  if (!dataPoint && !label) return null;

  // If we only have label (no dataPoint), create a minimal dataPoint for math metrics
  const workingDataPoint = dataPoint || { name: label, [selectedMetric]: null };

  // Determine which keys to show in the tooltip
  let keysToShow;
  if (isMultiSeries) {
    keysToShow = Object.keys(workingDataPoint)
      .filter(
        (key) =>
          key !== "name" && !key.endsWith("_hasData") && key !== selectedMetric
      )
      .sort();
  } else {
    keysToShow = [selectedMetric];
  }

  // Format value based on metric type
  const formatValue = (value, key) => {
    if (value === null || value === undefined) return "No results";

    // Format MTTR in minutes to hours and minutes
    if (key === "mttrMinutes") {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      return `${hours}h ${minutes}m`;
    }

    // Format percentage values
    if (key === "successRate" || key === "mergeRate") {
      return `${value.toFixed(1)}%`;
    }

    // Format time values
    if (key === "buildTimeMinutes" || key === "avgReviewTime") {
      return `${value.toFixed(1)} min`;
    }

    // Default number formatting
    return typeof value === "number" ? value.toFixed(1) : value;
  };

  return (
    <div style={commonTooltipStyle}>
      <p className="font-medium">{label}</p>
      {keysToShow.map((seriesKey, index) => {
        const hasDataKey = `${seriesKey}_hasData`;
        const hasData = isMultiSeries
          ? workingDataPoint[hasDataKey] !== false
          : workingDataPoint[seriesKey] !== null;
        const value = workingDataPoint[seriesKey];

        // Try to find color from payload first, fallback to index-based color
        const payloadEntry = payload?.find((p) => p.dataKey === seriesKey);
        const color =
          payloadEntry?.color || CHART_COLORS[index % CHART_COLORS.length];

        // Check if this is a math metric (should show "No results" when null)
        const isMathType = isMathMetric(selectedMetric);

        // Format the display value
        let displayValue;
        if (!hasData && isMathType) {
          displayValue = "No results";
        } else if (!hasData) {
          displayValue = "0";
        } else {
          displayValue = formatValue(value, seriesKey);
        }

        return (
          <p key={index} style={{ color }}>
            {`${isMultiSeries ? seriesKey : "Organization"}: ${displayValue}`}
          </p>
        );
      })}
    </div>
  );
}

export function AreaChartComponent({ currentData, selectedMetric, groupBy }) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter((key) => key !== "name")
    : [selectedMetric];

  // Format Y-axis tick for MTTR
  const formatYTick = (value) => {
    if (selectedMetric === "mttrMinutes") {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      return `${hours}h ${minutes}m`;
    }
    return value;
  };

  // Handle null values properly - keep nulls for math metrics, convert to 0 for count metrics
  const filteredData = currentData.map((point) => ({
    ...point,
    [selectedMetric]: isMathMetric(selectedMetric)
      ? point[selectedMetric] // Keep null for math metrics (chart will skip points)
      : point[selectedMetric] ?? 0, // Convert null to 0 for count metrics
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={filteredData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          tickFormatter={formatYTick}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys
          .filter((key) => !key.endsWith("_hasData"))
          .map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={isMultiSeries ? key : selectedMetric}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.8}
              strokeWidth={2}
              name={isMultiSeries ? key : "Organization"}
              connectNulls={false}
              isAnimationActive={false}
              dot={{
                fill: CHART_COLORS[index % CHART_COLORS.length],
                strokeWidth: 2,
                r: 4,
              }}
            />
          ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StackedAreaChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0])
        .filter((key) => key !== "name" && !key.endsWith("_hasData"))
        .sort() // Sort alphabetically for consistent stacking order
    : [selectedMetric];

  // Format Y-axis tick for MTTR
  const formatYTick = (value) => {
    if (selectedMetric === "mttrMinutes") {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      return `${hours}h ${minutes}m`;
    }
    return value;
  };

  // Handle null values properly - keep nulls for math metrics, convert to 0 for count metrics
  const filteredData = currentData.map((point) => ({
    ...point,
    [selectedMetric]: isMathMetric(selectedMetric)
      ? point[selectedMetric] // Keep null for math metrics (chart will skip points)
      : point[selectedMetric] ?? 0, // Convert null to 0 for count metrics
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={filteredData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          tickFormatter={formatYTick}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={isMultiSeries ? key : selectedMetric}
            stackId="team"
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.8}
            strokeWidth={2}
            name={isMultiSeries ? key : "Organization"}
            connectNulls={false}
            isAnimationActive={false}
            dot={{
              fill: CHART_COLORS[index % CHART_COLORS.length],
              strokeWidth: 2,
              r: 4,
            }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PercentAreaChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0])
        .filter((key) => key !== "name" && !key.endsWith("_hasData"))
        .sort() // Sort alphabetically for consistent stacking order
    : [selectedMetric];

  // Format Y-axis tick for percentages
  const formatYTick = (value) => {
    return `${value}%`;
  };

  // Convert data to percentages
  const percentData = currentData.map((point) => {
    if (!isMultiSeries) {
      return point; // Single series, no percentage conversion needed
    }

    // Calculate total for this data point
    const total = seriesKeys.reduce((sum, key) => {
      const value = point[key] || 0;
      return sum + value;
    }, 0);

    if (total === 0) {
      // If total is 0, set all percentages to 0
      const result = { name: point.name };
      seriesKeys.forEach((key) => {
        result[key] = 0;
        result[`${key}_hasData`] = point[`${key}_hasData`];
      });
      return result;
    }

    // Convert each value to percentage
    const result = { name: point.name };
    seriesKeys.forEach((key) => {
      const value = point[key] || 0;
      result[key] = (value / total) * 100;
      result[`${key}_hasData`] = point[`${key}_hasData`];
    });
    return result;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={percentData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          tickFormatter={formatYTick}
          domain={[0, 100]}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={isMultiSeries ? key : selectedMetric}
            stackId="team"
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.8}
            strokeWidth={2}
            name={isMultiSeries ? key : "Organization"}
            connectNulls={false}
            isAnimationActive={false}
            dot={{
              fill: CHART_COLORS[index % CHART_COLORS.length],
              strokeWidth: 2,
              r: 4,
            }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineChartComponent({ currentData, selectedMetric, groupBy }) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter((key) => key !== "name")
    : [selectedMetric];

  // Format Y-axis tick for MTTR
  const formatYTick = (value) => {
    if (selectedMetric === "mttrMinutes") {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      return `${hours}h ${minutes}m`;
    }
    return value;
  };

  // Handle null values properly - keep nulls for math metrics, convert to 0 for count metrics
  const filteredData = currentData.map((point) => ({
    ...point,
    [selectedMetric]: isMathMetric(selectedMetric)
      ? point[selectedMetric] // Keep null for math metrics (chart will skip points)
      : point[selectedMetric] ?? 0, // Convert null to 0 for count metrics
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={filteredData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          tickFormatter={formatYTick}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys
          .filter((key) => !key.endsWith("_hasData"))
          .map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={isMultiSeries ? key : selectedMetric}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={3}
              isAnimationActive={false}
              dot={{
                fill: CHART_COLORS[index % CHART_COLORS.length],
                strokeWidth: 2,
                r: 4,
              }}
              name={isMultiSeries ? key : "Organization"}
              connectNulls={false}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function VerticalBarChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter((key) => key !== "name")
    : [selectedMetric];

  // Format Y-axis tick for MTTR
  const formatYTick = (value) => {
    if (selectedMetric === "mttrMinutes") {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      return `${hours}h ${minutes}m`;
    }
    return value;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={currentData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          tickFormatter={formatYTick}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys
          .filter((key) => !key.endsWith("_hasData"))
          .map((key, index) => {
            const dataKey = isMultiSeries ? key : selectedMetric;
            return (
              <Bar
                key={key}
                dataKey={dataKey}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                isAnimationActive={false}
              />
            );
          })}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StackedVerticalBarChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0])
        .filter((key) => key !== "name" && !key.endsWith("_hasData"))
        .sort() // Sort alphabetically for consistent stacking order
    : [selectedMetric];

  // Format Y-axis tick for MTTR
  const formatYTick = (value) => {
    if (selectedMetric === "mttrMinutes") {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      return `${hours}h ${minutes}m`;
    }
    return value;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={currentData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          tickFormatter={formatYTick}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys.map((key, index) => {
          const dataKey = isMultiSeries ? key : selectedMetric;
          return (
            <Bar
              key={key}
              dataKey={dataKey}
              stackId="team"
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              isAnimationActive={false}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter((key) => key !== "name")
    : [selectedMetric];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={currentData}
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        isAnimationActive={false}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          type="number"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          width={70}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys
          .filter((key) => !key.endsWith("_hasData"))
          .map((key, index) => {
            const dataKey = isMultiSeries ? key : selectedMetric;
            return (
              <Bar
                key={key}
                dataKey={dataKey}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                isAnimationActive={false}
              />
            );
          })}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StackedHorizontalBarChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0])
        .filter((key) => key !== "name" && !key.endsWith("_hasData"))
        .sort() // Sort alphabetically for consistent stacking order
    : [selectedMetric];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={currentData}
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        isAnimationActive={false}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          type="number"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          width={70}
        />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />

        {seriesKeys.map((key, index) => {
          const dataKey = isMultiSeries ? key : selectedMetric;
          return (
            <Bar
              key={key}
              dataKey={dataKey}
              stackId="team"
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              isAnimationActive={false}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TableComponent({
  currentData,
  selectedTable,
  selectedMetric,
  granularity,
}) {
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );
  const column = config.tableColumns.find((c) => c.key === selectedMetric);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              {granularity === "monthly" ? "Date" : "Period"}
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              {column ? column.label : metric.label}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, index) => (
            <tr
              key={row.name}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                {row.name}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-gray-700">
                {formatValue(
                  row[selectedMetric],
                  column ? column.format : "number"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-sm text-gray-600 text-center">
        💡 Pattern 1: Single metric ({metric.label}) over time
      </div>
    </div>
  );
}

export function ChartRenderer({
  chartType,
  currentData,
  selectedTable,
  selectedMetric,
  granularity,
  groupBy,
}) {
  const chartComponents = {
    area: AreaChartComponent,
    line: AreaChartComponent,
    "vertical-bar": VerticalBarChartComponent,
    "horizontal-bar": HorizontalBarChartComponent,
    "stacked-area": StackedAreaChartComponent,
    "percent-area": PercentAreaChartComponent,
    "stacked-vertical-bar": StackedVerticalBarChartComponent,
    "stacked-horizontal-bar": StackedHorizontalBarChartComponent,
    table: TableComponent,
  };
  const Component = chartComponents[chartType];

  if (!Component) {
    return <div>Chart type not supported</div>;
  }

  return (
    <Component
      currentData={currentData}
      selectedTable={selectedTable}
      selectedMetric={selectedMetric}
      granularity={granularity}
      groupBy={groupBy}
    />
  );
}
