# Dashboard Table Implementation Guide

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Current Implementation](#current-implementation)
3. [Data Flow Patterns](#data-flow-patterns)
4. [Patterns to Preserve](#patterns-to-preserve)
5. [Phase 2: Overlay Support](#phase-2-overlay-support)
6. [Phase 3: Record View](#phase-3-record-view)
7. [Technical Notes](#technical-notes)

## System Architecture Overview

### Core Components

```
page.tsx (Main Container)
  ├── Controls (Dropdowns)
  │   ├── DataSourceSelector
  │   ├── MetricSelector
  │   ├── GroupBySelector
  │   ├── ChartTypeSelector
  │   └── DateRangePicker
  ├── Cards
  │   ├── MetricsSummary Card
  │   ├── Chart Card (via ChartRenderer)
  │   └── Table Card (via DataTable)
  └── Data Processing
      ├── Raw Data (githubPRData, pagerDutyData, etc.)
      ├── Transformation Functions (groupEventsByType, etc.)
      └── Formatted Output (chartData)
```

### State Management

All state lives in `page.tsx` and flows down to components:

- `selectedTable` - Current data source
- `selectedMetric` - Which metric to display
- `groupBy` - How to group data (org/team/person)
- `chartType` - Visual representation type
- `granularity` - Time aggregation level
- `selectedDateRange` - Time filter
- `overlayActive` - Whether overlay is shown
- `overlayActiveTable`, `overlayActiveMetric`, etc. - Overlay configuration

## Current Implementation

### How Controls Work

Each control is a stateless component that:

1. Receives current value via props
2. Displays available options from config
3. Calls parent's onChange handler
4. Parent updates state → triggers re-render

Example flow:

```typescript
// User selects "By Team" in GroupBySelector
onGroupByChange("team")
  → setGroupBy("team") in page.tsx
  → groupEventsByType() recalculates with new grouping
  → chartData updates
  → All components re-render with new data
```

### Data Transformation Pipeline

#### Raw Data Structure

```javascript
// githubPRData example
{
  id: "pr-001",
  created_at: "2025-05-15T08:30:00Z",
  author: "sarah_chen",
  team: "platform",
  lines_added: 234,
  lines_removed: 45,
  // ... more fields
}
```

#### Transformed for Charts/Tables

**Org View (single series):**

```javascript
[
  { name: "May 15", pullRequests: 5, mergeRate: 100, ... },
  { name: "May 16", pullRequests: 7, mergeRate: 71.4, ... }
]
```

**Team View (multi-series):**

```javascript
[
  {
    name: "May 15",
    "Platform Team": 3, // PR count for Platform
    "Product Team": 2, // PR count for Product
    "Platform Team_hasData": true,
    "Product Team_hasData": true,
  },
];
```

## Data Flow Patterns

### Primary Data Flow

1. Raw events filtered by date range in `dataTables`
2. Transformed by `groupEventsByDate()` or `groupEventsByType()`
3. Stored in `chartData` state
4. Passed to both ChartRenderer and DataTable

### Overlay Data Flow

1. Overlay configuration stored in separate state variables
2. Overlay data calculated in `overlayData` using same transformation functions
3. ChartRenderer merges data with `overlay_` prefix
4. DataTable merges data following the same pattern

## Patterns to Preserve

### 1. Single Source of Truth

- All data transformation happens in `page.tsx`
- Components are pure renderers
- No duplicate state or logic

### 2. Configuration-Driven

```javascript
// dataSourceConfig drives available options
githubPR: {
  metrics: [...],
  groupByOptions: [
    { value: "org", label: "🏢 Org View" },
    { value: "team", label: "👥 By Team" },
    { value: "person", label: "👤 By Individual" }
  ]
}
```

### 3. Reusable Data Functions

- `groupEventsByType()` - Handles all grouping logic
- `formatValue()` - Consistent formatting across components
- `calculateMetricsFromEvents()` - Centralized metric calculation

### 4. Props Flow Pattern

```
page.tsx (state)
  → component (props)
  → user interaction
  → callback to page.tsx
  → state update
  → re-render
```

## Phase 2: Overlay Support

### Implementation Status: ✅ COMPLETE

The table now supports overlays with the same flexibility as charts:

- Overlay data merged into display data
- Column headers show "Metric - Group" format
- Supports all groupBy combinations
- Handles org/team/person views correctly

### Key Implementation Details

#### Data Merging Strategy

```javascript
// In DataTable.tsx
const mergedData = React.useMemo(() => {
  if (!overlayActive || !overlayData) return currentData;

  return currentData.map((row, index) => {
    const overlayRow = overlayData[index];
    const merged = { ...row };

    if (overlayGroupBy === "org") {
      // For org view, only add selected metric
      merged[`${overlayMetric}_overlay`] = overlayRow[overlayMetric];
    } else {
      // For team/person, add all columns
      Object.keys(overlayRow).forEach((key) => {
        if (key !== "name" && !key.endsWith("_hasData")) {
          merged[`${key}_overlay`] = overlayRow[key];
        }
      });
    }

    return merged;
  });
}, [currentData, overlayData, overlayActive, overlayGroupBy, overlayMetric]);
```

#### Column Header Format

Headers use a clean "Metric - Group" format:

- "Pull Requests - Organization"
- "Incidents - Platform Team"
- "MTTR - Product Team"

This format clearly shows what metric is being displayed for which group.

### Remaining Polish Items

1. **Null/undefined handling**: Show "N/A" for missing values
2. **Correct formatting**: Use metric-specific formats from config for overlay columns

## Phase 3: Record View

### Design Goals

- Show raw event records (not aggregated)
- Group by selected `groupBy` option
- Display all relevant columns from config
- Handle overlays as separate tables

### Implementation Strategy

1. **Add View Toggle:**

```typescript
// In page.tsx
const [tableView, setTableView] = useState<"day" | "record">("day");

// Add to table card header
<ViewSelector view={tableView} onViewChange={setTableView} />;
```

2. **Pass Raw Data to DataTable:**

```typescript
<DataTable
  currentData={tableView === "day" ? chartData : rawData}
  viewMode={tableView}
  // ... other props
/>
```

3. **Record View Rendering:**

```typescript
// In DataTable.tsx
if (viewMode === "record") {
  return <RecordTable data={currentData} groupBy={groupBy} />;
}
```

4. **RecordTable Component Structure:**

```typescript
function RecordTable({ data, groupBy }) {
  // Group records by groupBy field
  const grouped = useMemo(() => {
    return data.reduce((acc, record) => {
      const key = getGroupingKey(record, selectedTable, groupBy);
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    }, {});
  }, [data, groupBy]);

  return (
    <div>
      {Object.entries(grouped).map(([group, records]) => (
        <div key={group} className="mb-6">
          <h3 className="font-semibold bg-gray-100 p-2">{group}</h3>
          <table>{/* Render records */}</table>
        </div>
      ))}
    </div>
  );
}
```

### Column Selection

Use `dataSourceConfig[selectedTable].tableColumns` to determine which columns to show:

```javascript
// From chartConfig.js
tableColumns: [
  { key: "pullRequests", label: "Pull Requests", format: "number" },
  { key: "mergeRate", label: "Merge Rate (%)", format: "percentage" },
  { key: "avgReviewTime", label: "Review Time (hrs)", format: "decimal" },
  { key: "linesChanged", label: "Lines Changed", format: "number" },
];
```

### Overlay Handling in Record View

- Render as completely separate table below primary table
- Clear visual separation
- Each table shows its own data source and metrics

## Technical Notes

### Key Functions to Reuse

1. **`getGroupingKey()`** - Extracts grouping value from record
2. **`formatValue()`** - Consistent formatting
3. **`groupEventsByType()`** - Can adapt for record grouping
4. **`calculateMetricsFromEvents()`** - For any aggregations needed
5. **`getColumnLabel()`** - Generates "Metric - Group" format labels

### State Management Best Practices

- Keep all state in page.tsx
- Components should be stateless when possible
- Use `useMemo` for expensive calculations
- Maintain single source of truth for data

### Performance Considerations

- DataTable re-renders on any prop change
- Use React.memo if performance becomes issue
- Consider virtualization for large record sets
- Memoize column calculations

### Error Prevention

- Always filter out `_hasData` fields from display
- Handle empty data arrays gracefully
- Validate groupBy values against config
- Format values consistently using config
- Show "N/A" for null/undefined values

## Next Implementation Steps

### Immediate (Phase 2 Polish):

1. Add null/undefined handling to show "N/A"
2. Fix overlay column formatting to use correct format from config
3. Add TypeScript types for better type safety
4. Test edge cases (empty data, mismatched array lengths)

### Following (Phase 3 - Record View):

1. Add view toggle control
2. Create RecordTable component
3. Implement grouping logic for records
4. Add proper column selection from config
5. Handle overlay as separate table
6. Test with all data sources

### Future Enhancements:

1. Column sorting
2. Column filtering
3. Export functionality
4. Column resizing
5. Sticky headers for long tables

This guide should serve as your technical reference for the current state and future development of the dashboard table implementation.
