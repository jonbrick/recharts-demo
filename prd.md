Dashboard Chart Rendering & Multi-Series Implementation - PRD v2
Current State & Context
We have a working dashboard builder with solid data processing architecture. The core data flow from raw events → grouped data → chart display is functional, but we're hitting specific rendering issues when displaying multi-series data (team/individual/repo breakdowns).
What's Working ✅

Data Processing Pipeline: groupEventsByType() correctly generates both single-series (org view) and multi-series (team/repo/individual) data structures
State Management: Control flow from data source → metric → grouping → chart type is stable
Summary Component: Always shows org-level totals regardless of grouping selection
Single-Series Charts: Org view works perfectly across all chart types
AreaChart & LineChart: Now handle multi-series data with dynamic legend and proper "no results" tooltip handling

Current Critical Issues 🚨

1. Chart Rendering Inconsistency
   Problem: VerticalBarChart and HorizontalBarChart still only render single-series data, even when receiving multi-series input.
   Root Cause: These components haven't been updated to use the same dynamic rendering pattern as AreaChart/LineChart.
   Expected Behavior:

Org View: Single bar per date showing org totals
Team View: Multiple bars per date (grouped or stacked) showing team breakdown
Repo View: Multiple bars per date showing repo breakdown

2. Tooltip Data vs Chart Data Mismatch
   Problem: We need different data structures for chart rendering (with undefined gaps) vs tooltip display (with all series present).
   Current Hack: Using sentinel values (-999999) that break chart display.
   Target Solution: Implement dual data structure approach:

Chart data: undefined values for clean Recharts line gaps
Tooltip data: Complete series with "no results" labels for missing data

Immediate Action Items
P0: Fix Bar Chart Components
Task: Update VerticalBarChart and HorizontalBarChart to handle multi-series data.
Implementation Pattern: Copy the dynamic rendering approach from LineChart:
javascript// Instead of single <Bar>
<Bar dataKey={selectedMetric} fill={metric.color} name={metric.label} />

// Use dynamic <Bar> elements
{seriesKeys.map((key, index) => (
<Bar key={key} dataKey={isMultiSeries ? key : selectedMetric} fill={colors[index]} name={key} />
))}
Acceptance Criteria:

Team view shows multiple bars per date (one per team)
Repo view shows multiple bars per date (one per repo)
Individual view shows multiple bars per date (one per person)
Colors cycle through predefined palette
Legend shows appropriate labels (team names, repo names, etc.)

P0: Implement Dual Data Structure for Tooltips
Task: Separate chart data (with gaps) from tooltip data (complete series).
Implementation Approach:

Create two data processing functions:

generateChartData() - returns data with undefined for missing values
generateTooltipData() - returns complete data with all series present

Pass both to chart components
Chart uses chartData for rendering, tooltipData for CustomTooltip

Acceptance Criteria:

Chart lines have clean gaps where teams have no data
Tooltips always show all teams/repos with "no results" for missing data
No visual artifacts or scale distortion

Next Development Phase
Bar Chart Grouping Strategy
Decision Point: For multi-series bar charts, should bars be:

Grouped: Side-by-side bars for each team/repo per date
Stacked: Single bar per date with team/repo segments

Recommendation: Start with grouped bars (easier implementation), add stacked as option later.
Table Component Implementation
Scope: Table view should show raw events grouped by team/repo/individual, not aggregated chart data.
Expected Structure:
Platform Team
├── Deployment #1: API Service - 8.5min - Success - Sarah Chen
├── Deployment #2: Data Pipeline - 12.3min - Success - Mike Johnson

Product Team
├── Deployment #3: Frontend App - 10.4min - Success - David Wilson
Implementation: Separate from chart data - directly process raw events with visual grouping.
Long-term Roadmap
Phase 2: Enhanced Chart Types

ComposedChart Integration: Combine multiple data sources (e.g., deployments + incidents)
ScatterChart Correlations: Plot relationships between metrics (PR size vs review time)
Advanced Tremor Charts: Multi-series support for Tremor components

Phase 3: Interactive Features

Date Range Filtering: Time period selection
Dynamic Grouping: Switch between groupings without page reload
Export Capabilities: Chart and data export

Phase 4: Data Integration

Real API Connections: Replace mock data with live APIs
Calculated Metrics: Backend-computed composite metrics (Change Failure Rate, Lead Time)
Real-time Updates: Live data refresh

Technical Debt & Cleanup
Code Quality

Remove debug console.log statements
Standardize prop passing patterns
Add consistent error boundaries
Clean up unused component parameters

Performance

Optimize data processing for large datasets
Implement proper memoization for expensive calculations
Add loading states for data transitions

Success Criteria
Immediate (Next Session)

✅ All chart types handle multi-series data correctly
✅ Tooltips show complete information with proper "no results" handling
✅ No visual artifacts or rendering bugs
✅ Consistent color scheme across all chart types

Medium Term

✅ Table view implemented with raw event grouping
✅ Tremor charts support multi-series data
✅ Code is clean and maintainable

Long Term

✅ Full dashboard builder functionality
✅ Real data integration
✅ Production-ready architecture

Current File Architecture
Core Files:

page.tsx - State management and data flow orchestration
ChartRenderer.jsx - Chart component rendering (needs bar chart fixes)
utils.js - Data processing (working correctly, needs dual structure)
ChartControls.jsx - Control components (stable)
MetricsSummary.jsx - Summary calculations (working correctly)

Next Developer Focus: Start with VerticalBarChart multi-series implementation, then implement dual data structure for clean tooltip handling.
