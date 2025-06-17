# Dashboard Builder Demo

## Overview

This dashboard visualizes engineering metrics from multiple data sources with real-time URL synchronization. Every interaction updates the URL, making any view instantly shareable with your team.

## Mental Model

### A note on control dependencies

All of these controls can happen independent of each other. There are a few key UX concerns, but from a technical standpoint, there's no reason why any control can be in any location on the page.

### A note on control UX

However, due to the size, scope and scale of the data sets were working with we are choosing to separate out some of these controls as a way to start the app with a more manageable data set. These separated controls I am calling "page controls". They are the filters of date picker, and the filters of things like team individual or repo.

## Control Hierarchy

Understanding the control hierarchy is crucial for using the dashboard effectively:

### Page-Level Controls

Define the bounding box for looking (card agnostic). Data sets can be so huge we should start with these

- **Date Range** - Time boundaries for all data
- **Future filters** - Team, individual, repo, status, etc. boundaries for all data

### View Controls

Define the data you're analyzing (card agnostic):

- **Data Source** - What dataset
- **Metric** - What to measure
- **Group By** - How to group data
- **Granularity** - How to present data over time
- **Overlay** - What data to overlay

### Card Controls

Define the data you're analyzing (card specific):

- **Operator** - Sum/Average/etc of summaries (Metrics Summary only)
- **Chart Type** - Visualization style of chart (Chart only)
- **Table Type**: Visualization of table (Table only)

## Data Sources

### GitHub Pull Requests

Tracks development velocity and code review metrics:

- **Pull Requests**: Count of PRs created
- **Merge Rate**: Percentage of PRs merged
- **Avg Review Time**: Hours from creation to merge
- **Lines Changed**: Total lines added + removed

### PagerDuty Incidents

Monitors operational health:

- **Incidents**: Count of incidents created
- **Acknowledgments**: Incidents acknowledged
- **Avg Ack Time**: Minutes to acknowledgment
- **MTTR**: Mean time to resolution in minutes

### GitHub Actions

Measures deployment activity:

- **Deployments**: Count of deployment runs
- **Success Rate**: Percentage of successful deployments
- **Rollbacks**: Failed deployment count
- **Avg Duration**: Runtime in minutes

## How It Works

1. **Apply filters** - Set your date range to bound the data
2. **Select your data source** - Choose between GitHub PRs, PagerDuty, or GitHub Actions
3. **Pick a metric** - Each data source offers different metrics to analyze
4. **Choose your view** - Group by Organization, Team, or Individual
5. **Set granularity** - Toggle between Daily and All-time views
6. **Customize each card** - Adjust operator, chart type, or table view
7. **Add overlays** - Compare two datasets across all cards
8. **Share your view** - Click "Share View" to copy the URL

Every selection instantly updates the URL, creating a unique link to your exact configuration.

## Controls

| Control       | Level | Purpose                           | Affects       | Notes                              | Status |
| ------------- | ----- | --------------------------------- | ------------- | ---------------------------------- | ------ |
| `Date Range`  | Page  | Time boundaries                   | All cards     | Universal constraint               | ✅     |
| `Filters`     | Page  | Team, Individual, Repo boundaries | All cards     | Universal constraint               | ❌     |
| `Data Source` | View  | Choose dataset                    | All cards     | Updates available metrics          | ✅     |
| `Metric`      | View  | What to measure                   | All cards     | Auto-resets when source changes    | ✅     |
| `Group By`    | View  | Aggregation level                 | All cards     | Changes chart series               | ✅     |
| `Granularity` | View  | Time detail                       | Chart & Table | Daily vs All-time                  | ✅     |
| `Overlay`     | View  | Secondary dataset                 | All cards     | Compare two data sources           | ✅     |
| `Operator`    | Card  | Calculation method                | Metrics only  | Sum vs Average                     | ✅     |
| `Chart Type`  | Card  | Visualization style               | Chart only    | In card header; 8 types available  | ✅     |
| `Table View`  | Card  | Display mode                      | Table only    | In card header; Day vs Record view | ✅     |

## Chart Types

| Chart            | Icon | Best For                    | Stackable | Overlay Support |
| ---------------- | ---- | --------------------------- | --------- | --------------- |
| `Line`           | 📈   | Trends over time            | ❌        | ✅              |
| `Area`           | 🌊   | Volume/magnitude            | ✅        | ✅              |
| `Percent Area`   | 🌊   | Relative proportions (100%) | ✅        | ❌              |
| `Vertical Bar`   | 📊   | Daily comparisons           | ✅        | ✅              |
| `Horizontal Bar` | 📊   | Many categories             | ✅        | ❌              |

## Display Cards

Each card responds to View Controls but has its own presentation options:

| Card                | Responds To                  | Card-Specific Controls         | Key Features                              |
| ------------------- | ---------------------------- | ------------------------------ | ----------------------------------------- |
| **Metrics Summary** | All View Controls + Overlays | Operator (Sum/Average)         | Large numbers, auto-calculated totals     |
| **Chart**           | All View Controls + Overlays | Chart Type, Overlay Chart Type | Interactive tooltips, dual Y-axis support |
| **Table**           | All View Controls + Overlays | View Mode (Day/Record)         | Sortable, precise values                  |

### Card Details

**Metrics Summary**: Shows aggregated numbers for the selected metric and date range. Switch between Sum and Average to change the calculation. When overlays are active, displays both metrics side by side.

**Chart**: Visualizes data using your selected chart type. Supports overlays to compare two datasets. Hover for detailed tooltips. Granularity control switches between daily and all-time views.

**Table**:

- _Day View_: Shows aggregated metrics by date
- _Record View_: Shows individual events grouped by your selection (org/team/person)
- _With Overlays_: Adds columns for overlay data

## Advanced Feature: Overlays

Overlays are a **View Control** that affects all three cards simultaneously, enabling powerful comparisons across your entire dashboard.

### How Overlays Work

1. Click "Add Overlay" to configure a secondary dataset
2. Select overlay source, metric, and group by
3. Click "Add Overlay" to save configuration
4. The system auto-selects a complementary chart type
5. All cards update to show both datasets:
   - **Metrics**: Shows both values side by side
   - **Chart**: Visualizes both on same axes with overlay chart type selector in header
   - **Table**: Adds overlay columns
6. Adjust overlay visualization using the chart type selector in the Chart card header

### Why Overlays are View Controls

Unlike card-specific controls, overlays fundamentally change what data is being analyzed across the entire dashboard. When you add an overlay:

- The Metrics card shows comparative KPIs
- The Chart displays both datasets with dual Y-axes
- The Table includes columns for both primary and overlay data

### Example Use Cases

- **PRs vs Incidents**: Do more code changes lead to more incidents?
- **Deployments vs MTTR**: Does deployment frequency affect recovery time?
- **Team comparisons**: Platform team PRs vs Product team incidents

### Technical Implementation

Overlays use Recharts' `ComposedChart` component:

- Primary data uses left Y-axis
- Overlay data uses right Y-axis
- Data series prefixed with `overlay_` to prevent conflicts
- Automatic scale adjustment for different value ranges

### Supported Overlays

✅ **Any combination of**: Line, Area, Vertical Bar (including stacked variants)
❌ **Not supported**: Horizontal Bar charts, Table views

**Popular combinations**:

- Line + Vertical Bar: Great for trends vs discrete events
- Area + Line: Layer continuous metrics
- Vertical Bar + Vertical Bar: Compare two bar datasets
- Stacked Area + Line: See composition with trend overlay

## URL Sharing & Persistence

Every dashboard state is captured in the URL, enabling powerful sharing workflows.

### URL Parameters

| Parameter    | Description        | Example                                 |
| ------------ | ------------------ | --------------------------------------- |
| `source`     | Data source        | `source=githubPR`                       |
| `metric`     | Selected metric    | `metric=pullRequests`                   |
| `from`, `to` | Date range         | `from=2025-05-15&to=2025-05-30`         |
| `group`      | Grouping level     | `group=team`                            |
| `chart`      | Chart type         | `chart=line`                            |
| `gran`       | Granularity        | `gran=monthly`                          |
| `op`         | Operator           | `op=sum`                                |
| `table`      | Table view mode    | `table=record`                          |
| `o_*`        | Overlay parameters | `o_source=pagerDuty&o_metric=incidents` |

### Sharing Workflows

- **Daily Standup**: Bookmark "Yesterday's deployment success rate"
- **Weekly Review**: Share "Team PR velocity over past week"
- **Incident Analysis**: Link "Deployments vs incidents correlation"
- **Performance Reviews**: Save "Individual contributions by quarter"

### Default Behavior

- Loading the bare URL redirects to a sensible default view
- Invalid parameters fall back to defaults
- Bookmarks always load the exact saved state

## Coming Soon: Single Card Mode

A new display mode is being added where you can focus on one card at a time:

- **Dashboard Mode** (current) - All 3 cards visible
- **Single Card Mode** (upcoming) - Tab through individual cards

This reinforces the control hierarchy:

- Filters and View Controls remain constant
- Only the card display changes
- Each card maintains its specific controls

## Architecture Notes

### Component Structure

```
page.tsx (Main Container)
├── Filters (Page Controls)
│   └── DateRangePicker
├── View Controls
│   ├── DataSourceSelector
│   ├── MetricSelector
│   ├── GroupBySelector
│   ├── GranularitySelector
│   └── Overlay Configuration (when active)
│       ├── DataSourceSelector
│       ├── MetricSelector
│       └── GroupBySelector
├── Display Cards
│   ├── MetricsSummary
│   │   └── OperatorSelector (Card Control)
│   ├── ChartRenderer
│   │   └── Chart Header
│   │       ├── ChartTypeSelector (Primary)
│   │       └── ChartTypeSelector (Overlay - when active)
│   └── DataTable
│       └── ViewSelector (Card Control)
└── URL State Management
    └── useUrlState hook
```

### Data Flow

1. **Raw data** → Filtered by date range
2. **Transform functions** → Group by date/type
3. **State updates** → Trigger re-renders
4. **URL sync** → Update browser location
5. **Components** → Display formatted data

### Key Design Patterns

- **Single source of truth**: All state in page.tsx
- **Derived state**: Use useMemo for calculations
- **Pure components**: Display only, no business logic
- **URL as state**: Shareable, bookmarkable views
- **Config-driven**: Data sources define available options
- **Control hierarchy**: Clear separation between filter/view/card controls

### Recharts Implementation

This dashboard uses Recharts for all visualizations:

- **Single charts**: LineChart, AreaChart, BarChart components
- **Overlays**: ComposedChart allows mixing chart types
- **Responsive**: Charts resize automatically
- **Interactive**: Built-in tooltips and hover states
- **Customizable**: Colors, axes, and formatting options

This dashboard demonstrates modern React patterns with Next.js App Router, showcasing how URL state management enables powerful sharing and collaboration features while maintaining a clear control hierarchy for intuitive user interaction.
