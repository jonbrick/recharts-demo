// ChartRenderer.tsx - Unified chart rendering component

import React, { useMemo } from "react";
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
  PieChart,
  Pie,
} from "recharts";
import { dataSourceConfig, isMathMetric } from "../lib/chartConfig.js";
import { generateDynamicLabel } from "../lib/chartUtils";

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
  dateMode?: string;
  relativeDays?: number;
  selectedDateRange?: { from: Date; to: Date };
  showLabel?: boolean;
}

interface CustomTooltipProps extends TooltipProps<any, any> {
  selectedMetric: string;
  isMultiSeries: boolean;
}

interface ChartComponentProps {
  currentData: any[];
  selectedTable: string;
  selectedMetric: string;
  granularity: string;
  groupBy: string;
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
      <div className="bg-white dark:bg-slate-800 p-2 border border-gray-200 dark:border-slate-600 rounded shadow-sm">
        <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-sm dark:text-slate-300"
            style={{ color: entry.color }}
          >
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
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-slate-700"
        />
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
            .filter((key) => key.endsWith("_display"))
            .map((key, index) => (
              <Area
                key={key.replace("_display", "")}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))
        ) : (
          <Area
            type="monotone"
            dataKey={`${selectedMetric}_display`}
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

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

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
    [`${selectedMetric}_display`]: isMathMetric(selectedMetric)
      ? point[`${selectedMetric}_display`] // Keep null for math metrics (chart will skip points)
      : point[`${selectedMetric}_display`] ?? 0, // Convert null to 0 for count metrics
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
            dataKey={
              isMultiSeries ? `${key}_display` : `${selectedMetric}_display`
            }
            stackId="team"
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.8}
            strokeWidth={2}
            name={isMultiSeries ? key : "Organization"}
            connectNulls={false}
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

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

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
      const value = point[`${key}_display`] || 0;
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
      const value = point[`${key}_display`] || 0;
      result[key] = (value / total) * 100;
      result[`${key}_hasData`] = point[`${key}_hasData`];
    });
    return result;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={percentData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
            dataKey={isMultiSeries ? key : `${selectedMetric}_display`}
            stackId="team"
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.8}
            strokeWidth={2}
            name={isMultiSeries ? key : "Organization"}
            connectNulls={false}
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

export function PercentBarChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

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
      const value = point[`${key}_display`] || 0;
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
      const value = point[`${key}_display`] || 0;
      result[key] = (value / total) * 100;
      result[`${key}_hasData`] = point[`${key}_hasData`];
    });
    return result;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={percentData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
          <Bar
            key={key}
            dataKey={isMultiSeries ? key : `${selectedMetric}_display`}
            stackId="team"
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            name={isMultiSeries ? key : "Organization"}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChartComponent({
  currentData,
  selectedMetric,
  groupBy,
}: ChartComponentProps) {
  // Check if this is multi-series data
  const isMultiSeries = groupBy !== "org" && currentData.length > 0;

  // For donut chart, we need to aggregate the data across all time periods
  const aggregatedData = useMemo(() => {
    // Calculate seriesKeys inside useMemo to avoid dependency changes
    const seriesKeys = isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];

    if (!isMultiSeries) {
      // Single series - sum all values
      const total = currentData.reduce((sum, point) => {
        return sum + (point[`${selectedMetric}_display`] || 0);
      }, 0);
      return [{ name: "Total", value: total, fill: CHART_COLORS[0] }];
    }

    // Multi-series - aggregate each series
    const seriesTotals: { [key: string]: number } = {};

    // Initialize totals for each series
    seriesKeys.forEach((key) => {
      seriesTotals[key] = 0;
    });

    // Sum up all values for each series
    currentData.forEach((point) => {
      seriesKeys.forEach((key) => {
        seriesTotals[key] += point[`${key}_display`] || 0;
      });
    });

    // Convert to array format for PieChart
    return seriesKeys.map((key, index) => ({
      name: key,
      value: seriesTotals[key],
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [currentData, selectedMetric, isMultiSeries]);

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = aggregatedData.reduce(
        (sum, item) => sum + (item.value as number),
        0
      );
      const percentage =
        total > 0 ? (((data.value as number) / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-gray-200 dark:border-slate-600 rounded shadow-sm">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
            {data.name}
          </p>
          <p
            className="text-sm dark:text-slate-300"
            style={{ color: data.fill }}
          >
            {(data.value as number).toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={aggregatedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        />
        <Tooltip content={<CustomPieTooltip />} />
        <Legend />
      </PieChart>
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

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

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
    [`${selectedMetric}_display`]: isMathMetric(selectedMetric)
      ? point[`${selectedMetric}_display`] // Keep null for math metrics (chart will skip points)
      : point[`${selectedMetric}_display`] ?? 0, // Convert null to 0 for count metrics
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
          <Line
            key={key}
            type="monotone"
            dataKey={
              isMultiSeries ? `${key}_display` : `${selectedMetric}_display`
            }
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={3}
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

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

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
      <BarChart
        data={currentData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
          const dataKey = isMultiSeries
            ? `${key}_display`
            : `${selectedMetric}_display`;
          return (
            <Bar
              key={key}
              dataKey={dataKey}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              name={isMultiSeries ? key : "Organization"}
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

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

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
      <BarChart
        data={currentData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
          <Bar
            key={key}
            dataKey={
              isMultiSeries ? `${key}_display` : `${selectedMetric}_display`
            }
            stackId="team"
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            name={isMultiSeries ? key : "Organization"}
          />
        ))}
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

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={currentData}
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
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
          const dataKey = isMultiSeries
            ? `${key}_display`
            : `${selectedMetric}_display`;
          return (
            <Bar
              key={key}
              dataKey={dataKey}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              name={isMultiSeries ? key : "Organization"}
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

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(currentData[0])
          .filter((key) => key.endsWith("_display"))
          .map((key) => key.replace("_display", ""))
      : [selectedMetric];
  }, [isMultiSeries, currentData, selectedMetric]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={currentData}
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
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
          const dataKey = isMultiSeries
            ? `${key}_display`
            : `${selectedMetric}_display`;
          return (
            <Bar
              key={key}
              dataKey={dataKey}
              stackId="team"
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              name={isMultiSeries ? key : "Organization"}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
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
  // Get colors from config
  const primaryConfig = dataSourceConfig[selectedTable];
  const overlayConfig = dataSourceConfig[overlayTable];

  const overlayColor =
    overlayConfig?.metrics?.find((m) => m.key === overlayMetric)?.color ||
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

  // Check if primary chart is multi-series
  const isMultiSeries = groupBy !== "org" && mergedData.length > 0;

  // Calculate seriesKeys - moved outside useMemo to avoid dependency issues
  const seriesKeys = useMemo(() => {
    return isMultiSeries
      ? Object.keys(mergedData[0])
          .filter(
            (key) => key.endsWith("_display") && !key.startsWith("overlay_")
          )
          .map((key) => key.replace("_display", "")) // Remove suffix for clean names
      : [selectedMetric]; // Remove the _display here since we add it later
  }, [isMultiSeries, mergedData, selectedMetric]);

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

  // Helper function to render chart components
  const renderChartComponent = (
    type,
    dataKey,
    color,
    name,
    yAxisId,
    stackId
  ) => {
    const baseProps = {
      yAxisId,
      dataKey,
      name,
    };

    switch (type) {
      case "vertical-bar":
      case "stacked-vertical-bar":
        return (
          <Bar
            key={dataKey}
            {...baseProps}
            fill={color}
            opacity={yAxisId === "right" ? 0.7 : 1}
            stackId={type === "stacked-vertical-bar" ? stackId : undefined}
          />
        );
      case "percent-bar":
        return (
          <Bar
            key={dataKey}
            {...baseProps}
            fill={color}
            opacity={yAxisId === "right" ? 0.7 : 1}
            stackId="team"
          />
        );
      case "donut":
        // Donut charts don't work well with overlays, so return null
        return null;
      case "line":
        return (
          <Line
            key={dataKey}
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
            key={dataKey}
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
      <ComposedChart
        data={mergedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
          const dataKey = isMultiSeries
            ? `${key}_display`
            : `${selectedMetric}_display`;
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
            "primary"
          );
        })}

        {/* Overlay dataset */}
        {overlaySeriesKeys.map((key, index) => {
          const overlayDataKey = isOverlayMultiSeries
            ? `overlay_${key}`
            : `overlay_${overlayMetric}`;
          const overlayName = isOverlayMultiSeries
            ? `${key} (${
                overlayConfig?.metrics?.find((m) => m.key === overlayMetric)
                  ?.label || overlayMetric
              })`
            : overlayConfig?.metrics?.find((m) => m.key === overlayMetric)
                ?.label || overlayMetric;

          return renderChartComponent(
            overlayChartType,
            overlayDataKey,
            getOverlayColor(index),
            overlayName,
            "right",
            "overlay"
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
  dateMode,
  relativeDays,
  selectedDateRange,
  showLabel = true,
}: ChartRendererProps) {
  // Generate dynamic label
  const dynamicLabel = generateDynamicLabel({
    selectedTable,
    selectedMetric,
    dateMode: dateMode || "relative",
    relativeDays: relativeDays || 14,
    selectedDateRange: selectedDateRange || {
      from: new Date(),
      to: new Date(),
    },
    groupBy,
    dataSourceConfig,
  });

  // Merge primary and overlay data for ComposedChart
  const mergedData = useMemo(() => {
    if (!overlayActive || !overlayData || !currentData) {
      return currentData;
    }

    // Create a map of dates to merged data points
    const dataMap = new Map();

    // Add primary data
    currentData.forEach((point) => {
      // Filter out _hasData properties to prevent React DOM warnings
      const cleanPoint = Object.fromEntries(
        Object.entries(point).filter(([key]) => !key.endsWith("_hasData"))
      );
      dataMap.set(point.name, cleanPoint);
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
      <div className="flex flex-col">
        {showLabel && (
          <div className="text-sm text-gray-600 dark:text-slate-300 mb-2">
            {dynamicLabel}
          </div>
        )}
        <div>
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
        </div>
      </div>
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
    "percent-bar": PercentBarChartComponent,
    donut: DonutChartComponent,
    "stacked-vertical-bar": StackedVerticalBarChartComponent,
    "stacked-horizontal-bar": StackedHorizontalBarChartComponent,
  };
  const Component = chartComponents[chartType];

  if (!Component) {
    return <div>Chart type not supported</div>;
  }

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className="text-sm text-gray-600 dark:text-slate-300 mb-2">
          {dynamicLabel}
        </div>
      )}
      <div>
        <Component
          currentData={currentData}
          selectedTable={selectedTable}
          selectedMetric={selectedMetric}
          granularity={granularity}
          groupBy={groupBy}
        />
      </div>
    </div>
  );
}
