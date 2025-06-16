// ChartRenderer.tsx - Unified chart rendering component

import React, { useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  ComposedChart,
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

// Add type definitions
interface ChartRendererProps {
  chartType: string;
  currentData: any[];
  selectedTable: string;
  selectedMetric: string;
  granularity: string;
  groupBy: string;
  overlayActive?: boolean;
  overlayData?: any[] | null;
  overlayTable?: string;
  overlayMetric?: string;
  overlayChartType?: string;
  overlayGroupBy?: string;
}

interface CustomTooltipProps extends TooltipProps<any, any> {
  selectedMetric: string;
  isMultiSeries: boolean;
}

interface ChartComponentProps {
  currentData: any[];
  selectedMetric: string;
  groupBy: string;
}

interface TableChartComponentProps {
  currentData: any[];
  selectedMetric: string;
  selectedTable: string;
  granularity: string;
}

// Custom tooltip component with proper types
const CustomTooltip = ({
  active,
  payload,
  label,
  selectedMetric,
  isMultiSeries,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {isMultiSeries ? entry.name : selectedMetric}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AreaChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}: ChartComponentProps) {
  const isMultiSeries = groupBy !== "org";
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={currentData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          content={
            <CustomTooltip
              selectedMetric={selectedMetric}
              isMultiSeries={isMultiSeries}
            />
          }
        />
        <Legend />
        {isMultiSeries ? (
          Object.keys(currentData[0] || {})
            .filter((key) => key !== "name" && !key.endsWith("_hasData"))
            .map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))
        ) : (
          <Area
            type="monotone"
            dataKey={selectedMetric}
            stroke="#8884d8"
            fill="#8884d8"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StackedAreaChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter(
        (key) => key !== "name" && !key.endsWith("_hasData")
      )
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
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter(
        (key) => key !== "name" && !key.endsWith("_hasData")
      )
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

export function LineChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter(
        (key) => key !== "name" && !key.endsWith("_hasData")
      )
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
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter(
        (key) => key !== "name" && !key.endsWith("_hasData")
      )
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
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter(
        (key) => key !== "name" && !key.endsWith("_hasData")
      )
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
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter(
        (key) => key !== "name" && !key.endsWith("_hasData")
      )
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
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(currentData[0]).filter(
        (key) => key !== "name" && !key.endsWith("_hasData")
      )
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

export function TableChartComponent({
  currentData,
  selectedMetric,
  selectedTable,
  granularity,
}: TableChartComponentProps) {
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

// ComposedChart component for overlay mode
function ComposedChartComponent({
  mergedData,
  selectedMetric,
  overlayMetric,
  chartType,
  overlayChartType,
  selectedTable,
  overlayTable,
  groupBy,
  overlayGroupBy,
}: {
  mergedData: any[];
  selectedMetric: string;
  overlayMetric: string;
  chartType: string;
  overlayChartType: string;
  selectedTable: string;
  overlayTable: string;
  groupBy: string;
  overlayGroupBy?: string;
}) {
  console.log("🎯 ComposedChart received overlayGroupBy:", overlayGroupBy);
  // Get colors from config
  const primaryConfig = dataSourceConfig[selectedTable];
  const overlayConfig = dataSourceConfig[overlayTable];

  const overlayColor =
    overlayConfig.metrics.find((m) => m.key === overlayMetric)?.color ||
    "#82ca9d";

  // Create a color palette for multi-series overlays
  const OVERLAY_COLORS = [
    "#82ca9d",
    "#8dd1e1",
    "#d084d0",
    "#ffb347",
    "#87ceeb",
  ];

  const getOverlayColor = (index) => {
    if (!isOverlayMultiSeries) return overlayColor;
    return OVERLAY_COLORS[index % OVERLAY_COLORS.length];
  };

  console.log("🎨 ComposedChart rendering:", {
    primaryMetric: selectedMetric,
    overlayMetric: overlayMetric,
    primaryType: chartType,
    overlayType: overlayChartType,
  });

  // Check if primary chart is multi-series
  const isMultiSeries = groupBy !== "org" && mergedData.length > 0;
  const seriesKeys = isMultiSeries
    ? Object.keys(mergedData[0]).filter(
        (key) =>
          key !== "name" &&
          !key.startsWith("overlay_") &&
          !key.endsWith("_hasData")
      )
    : [selectedMetric];

  console.log("📊 ComposedChart series detection:", {
    isMultiSeries,
    seriesKeys,
    groupBy,
  });

  // Detect overlay series
  const isOverlayMultiSeries =
    overlayGroupBy !== "org" && mergedData.length > 0;
  let overlaySeriesKeys = [];

  if (isOverlayMultiSeries) {
    // Find all keys that start with "overlay_" and don't end with "_hasData"
    overlaySeriesKeys = Object.keys(mergedData[0])
      .filter((key) => key.startsWith("overlay_") && !key.endsWith("_hasData"))
      .map((key) => key.replace("overlay_", ""));
  } else {
    overlaySeriesKeys = [overlayMetric];
  }

  console.log("🔍 Overlay series detection:", {
    isOverlayMultiSeries,
    overlaySeriesKeys,
    overlayGroupBy,
    sampleData: mergedData[0],
  });

  // Helper function to render chart components
  const renderChartComponent = (
    type,
    dataKey,
    color,
    name,
    yAxisId,
    stackId,
    index
  ) => {
    const baseProps = {
      key: dataKey,
      yAxisId,
      dataKey,
      name,
    };

    switch (type) {
      case "vertical-bar":
      case "stacked-vertical-bar":
        return (
          <Bar
            {...baseProps}
            fill={color}
            opacity={yAxisId === "right" ? 0.7 : 1}
            stackId={type === "stacked-vertical-bar" ? stackId : undefined}
          />
        );
      case "line":
        return (
          <Line
            {...baseProps}
            type="monotone"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4 }}
          />
        );
      case "area":
      case "stacked-area":
        return (
          <Area
            {...baseProps}
            type="monotone"
            fill={color}
            stroke={color}
            opacity={yAxisId === "right" ? 0.5 : 0.8}
            stackId={type === "stacked-area" ? stackId : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={mergedData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <Tooltip />
        <Legend />

        {/* Primary dataset */}
        {seriesKeys.map((key, index) => {
          const dataKey = isMultiSeries ? key : selectedMetric;
          const color = CHART_COLORS[index % CHART_COLORS.length];
          const name = isMultiSeries
            ? key
            : primaryConfig.metrics.find((m) => m.key === selectedMetric)
                ?.label || selectedMetric;

          return renderChartComponent(
            chartType,
            dataKey,
            color,
            name,
            "left",
            "primary",
            index
          );
        })}

        {/* Overlay dataset */}
        {overlaySeriesKeys.map((key, index) => {
          const overlayDataKey = isOverlayMultiSeries
            ? `overlay_${key}`
            : `overlay_${overlayMetric}`;
          const overlayName = isOverlayMultiSeries
            ? `${key} (${
                overlayConfig.metrics.find((m) => m.key === overlayMetric)
                  ?.label || overlayMetric
              })`
            : overlayConfig.metrics.find((m) => m.key === overlayMetric)
                ?.label || overlayMetric;

          return renderChartComponent(
            overlayChartType,
            overlayDataKey,
            getOverlayColor(index),
            overlayName,
            "right",
            "overlay",
            index
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ChartRenderer({
  chartType,
  currentData,
  selectedTable,
  selectedMetric,
  granularity,
  groupBy,
  overlayActive = false,
  overlayData = null,
  overlayTable = "",
  overlayMetric = "",
  overlayChartType = "",
  overlayGroupBy,
}: ChartRendererProps) {
  // Log overlay props
  useEffect(() => {
    if (overlayActive) {
      console.log("📈 ChartRenderer received overlay:", {
        active: overlayActive,
        hasData: !!overlayData,
        dataLength: overlayData?.length,
        metric: overlayMetric,
        chartType: overlayChartType,
      });
    }
  }, [overlayActive, overlayData, overlayMetric, overlayChartType]);

  // Merge primary and overlay data for ComposedChart
  const mergedData = useMemo(() => {
    if (!overlayActive || !overlayData || !currentData) {
      return currentData;
    }

    console.log("🔀 Merging data for ComposedChart");

    // Create a map of dates to merged data points
    const dataMap = new Map();

    // Add primary data
    currentData.forEach((point) => {
      dataMap.set(point.name, { ...point });
    });

    // Merge overlay data
    overlayData.forEach((point) => {
      const existing = dataMap.get(point.name);
      if (existing) {
        // Merge overlay data into existing point
        Object.keys(point).forEach((key) => {
          if (key !== "name") {
            // Prefix overlay keys to avoid conflicts
            existing[`overlay_${key}`] = point[key];
          }
        });
      } else {
        // Add new point with overlay prefix
        const newPoint = { name: point.name };
        Object.keys(point).forEach((key) => {
          if (key !== "name") {
            newPoint[`overlay_${key}`] = point[key];
          }
        });
        dataMap.set(point.name, newPoint);
      }
    });

    // Convert back to array and sort by date
    const merged = Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()
    );

    console.log("📊 Merged data sample:", merged[0]);
    return merged;
  }, [currentData, overlayData, overlayActive]);

  // If overlay is active and it's not a table view, use ComposedChart
  if (
    overlayActive &&
    chartType !== "table" &&
    overlayChartType &&
    mergedData
  ) {
    return (
      <ComposedChartComponent
        mergedData={mergedData}
        selectedMetric={selectedMetric}
        overlayMetric={overlayMetric}
        chartType={chartType}
        overlayChartType={overlayChartType}
        selectedTable={selectedTable}
        overlayTable={overlayTable}
        groupBy={groupBy}
        overlayGroupBy={overlayGroupBy}
      />
    );
  }

  // Otherwise use the regular chart rendering
  const chartComponents = {
    area: AreaChartComponent,
    line: LineChartComponent,
    "vertical-bar": VerticalBarChartComponent,
    "horizontal-bar": HorizontalBarChartComponent,
    "stacked-area": StackedAreaChartComponent,
    "percent-area": PercentAreaChartComponent,
    "stacked-vertical-bar": StackedVerticalBarChartComponent,
    "stacked-horizontal-bar": StackedHorizontalBarChartComponent,
    table: TableChartComponent,
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
