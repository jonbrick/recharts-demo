# Dashboard Builder Demo

## Overview

This dashboard visualizes engineering metrics from multiple data sources with real-time URL synchronization. Every interaction updates the URL, making any view instantly shareable with your team.

## Mental Model & Control Hierarchy

Understanding the control hierarchy is crucial for using the dashboard effectively:

### Filters (Page-Level Controls)

Universal constraints that bound all data regardless of view:

- **Date Range** - Time boundaries for all data
- **Future filters** - Team filter, Status filter, etc.

### View Controls

Define WHAT data you're analyzing (applies to all cards):

- **Data Source** - Which dataset (GitHub PRs, PagerDuty, etc.)
- **Metric** - What to measure (PR count, merge rate, etc.)
- **Group By** - How to slice data (Organization, Team, Individual)
- **Granularity** - Time aggregation (Daily vs All-time)
- **Overlay** - Secondary dataset for comparison (when active)

### Card-Specific Controls

Each card controls its own presentation:

- **Metrics Summary**: Operator (Sum/Average)
- **Chart**: Chart Type, Overlay Chart Type (visualization style)
- **Table**: View Mode (Day/Record)

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

1. **Select your data source** - Choose between GitHub PRs, PagerDuty, or GitHub Actions
2. **Pick a metric** - Each data source offers different metrics to analyze
3. **Choose your view** - Group by Organization, Team, or Individual
4. **Customize visualization** - Select chart type and date range
5. **Share your view** - Click "Share View" to copy the URL

Every selection instantly updates the URL, creating a unique link to your exact configuration.

## Controls

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
3. All cards update to show both datasets:
   - **Metrics**: Shows both values side by side
   - **Chart**: Visualizes both on same axes
   - **Table**: Adds overlay columns

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
├── Display Cards
│   ├── MetricsSummary
│   │   └── OperatorSelector (Card Control)
│   ├── ChartRenderer
│   │   └── ChartTypeSelector (Card Control)
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
