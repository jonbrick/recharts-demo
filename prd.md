# Dashboard Builder UX Patterns - Technical POC

## Project Status & Next Steps

### Current Implementation ✅

**Pattern 1: Single Source Time Series - COMPLETE**

- User selects: Table → Column → Operator → Granularity → Chart Type
- Flow: `[GitHub Actions] [Deployments] [Average] [Monthly] [Area Chart]`
- Data: 2 time-series tables (GitHub Actions, PagerDuty) with May 2025 data
- Charts: Area, Line, Bar (vertical/horizontal), Table
- Aggregation: `avg(column)` over time periods

**Architecture - COMPLETE**

- Clean component separation
- Configuration-driven design
- 6 files: `App.jsx`, `data.js`, `chartConfig.js`, `ChartControls.js`, `ChartRenderer.js`, `MetricsSummary.js`

### Immediate Next Steps

**Pattern 2: Multi-Source Composition**

- User flow: Select 2 tables + 1 column from each + operator for each
- UI: `[Table A] [Column A] [Operator A] + [Table B] [Column B] [Operator B] → [Granularity] [Chart]`
- Chart: ComposedChart with dual Y-axes
- Example: GitHub Actions deployments + PagerDuty incidents over time

**Pattern 3: Scatter Plot Correlations**

- Need: Raw PR data table (individual records, not time-aggregated)
- User flow: Select 1 table + 2 columns (X/Y axes)
- UI: `[Table] [X Column] [Y Column] → [Scatter Chart]`
- Example: PR size vs review time correlation

### Technical Debt

- Remove unused `MetricsSummary.js`
- Create raw GitHub PR data for Pattern 3
- Add scatter transform function
- Update `ChartRenderer` for Pattern 2/3

### Architecture Decisions Made

- Single operator (Average) for now - disabled placeholder
- Same visual weight for all controls
- Configuration-driven chart colors/labels
- Time granularity: daily vs all-time aggregation

### Data Structure

```javascript
// Time series (Patterns 1 & 2)
[{name: "May 1", deployments: 4, successRate: 100, ...}, ...]

// Scatter data (Pattern 3)
[{prSize: 45, reviewHours: 2.1, author: "Alice", date: "May 1"}, ...]
```
