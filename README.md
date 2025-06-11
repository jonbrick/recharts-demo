# Recharts Demo Dashboard

A comprehensive, interactive data visualization dashboard built with React and Recharts. This project demonstrates advanced charting capabilities, smart UI controls, and real-world data visualization patterns.

## 🚀 Live Demo

**[View Live Dashboard →](https://recharts-demo-phi.vercel.app/)**

## ✨ Features

### 📊 **Multiple Chart Types**

- **Area Charts** - Stacked and overlapping filled regions
- **Line Charts** - Clean trend visualization with multiple series
- **Vertical Bar Charts** - Traditional column charts with stacking support
- **Horizontal Bar Charts** - Perfect for categorical data and rankings
- **Table View** - Raw data with conditional totals and formatting

### 🎛️ **Interactive Controls**

- **Stacked vs Overlapping Toggle** - Switch between composition and comparison views
- **Granularity Control** - Toggle between detailed daily data and aggregated summaries
- **Chart Type Selector** - Dropdown menu for seamless chart switching
- **Smart Disabling** - Intelligent UI that prevents invalid combinations

### 🧠 **Smart Features**

- **Total Line Overlay** - Dashed line showing cumulative trends on stacked charts
- **Grand Total Display** - Contextual total values when in stacked mode
- **Auto-switching Logic** - Prevents incompatible view combinations
- **Responsive Design** - Works seamlessly across all device sizes

## 🛠️ Tech Stack

- **Frontend**: React 18 with Hooks (useState, useEffect)
- **Charts**: Recharts 2.8+ (Area, Line, Bar, ComposedChart components)
- **Styling**: Tailwind CSS (CDN for rapid development)
- **Build Tool**: Vite
- **Deployment**: Vercel with automatic CI/CD
- **Language**: JavaScript/JSX

## 📈 Current Dataset

The dashboard currently visualizes **engineering team activity metrics**:

- **Pull Requests** - Merged PRs and active development work
- **Releases** - Deployments and release activities
- **Bug Fixes** - Bug-related development work
- **Features** - New feature development

_Sample data covers June 2-9, 2025, showing realistic development team patterns including a major release day spike._

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/jonbrick/recharts-demo.git
cd recharts-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview
```

## 🎯 Usage Examples

### Stacked vs Overlapping Views

- **Stacked Mode**: See how different activities contribute to total team output
- **Overlapping Mode**: Compare individual activity levels across time periods

### Granularity Analysis

- **Daily View**: Analyze day-to-day patterns and identify busy periods
- **All Time View**: Get high-level summaries and total metrics

### Chart Type Selection

- **Area Charts**: Best for showing volume and part-to-whole relationships
- **Line Charts**: Ideal for trend analysis and pattern identification
- **Vertical Bars**: Perfect for time series categorical data
- **Horizontal Bars**: Great for rankings and long category names
- **Table View**: Exact values and detailed breakdowns

## 🔧 Architecture

### Component Structure

```
App.jsx
├── State Management (3 useState hooks)
├── Data Processing (monthly vs allTime)
├── Smart Logic (supportsAllTime validation)
├── UI Controls (toggle buttons + dropdown)
├── Chart Rendering (conditional chart components)
└── Documentation Section
```

### Key Design Patterns

- **Conditional Rendering** - Charts render based on current state
- **Smart Component Selection** - ComposedChart vs BarChart based on requirements
- **State-Driven UI** - All interactions update through centralized state
- **Responsive Charts** - ResponsiveContainer ensures mobile compatibility

## 🎨 Customization

### Adding New Chart Types

1. Import the chart component from Recharts
2. Add option to chart type selector
3. Create conditional rendering block
4. Configure chart-specific props and styling

### Modifying Data Structure

Update the `data` array with your metrics:

```javascript
const data = [
  { name: "Period 1", metric1: 100, metric2: 200, total: 300 },
  // ... more data points
];
```

### Styling Changes

- Modify Tailwind classes for design updates
- Adjust chart colors in the component props
- Customize responsive breakpoints and spacing

## 🌟 Advanced Features

### Smart UI Behavior

- **Auto-disabling**: All Time view automatically disables for Line/Area charts
- **Auto-switching**: Automatically switches to Monthly when incompatible combinations are selected
- **Contextual totals**: Grand total only appears when meaningful (stacked mode)

### Performance Optimizations

- **Pre-calculated totals**: Total values computed once and stored in data
- **Conditional rendering**: Only renders active chart type
- **Responsive containers**: Efficient chart resizing

## 🔮 Roadmap

_Planning to expand with additional scope and features:_

- [ ] Additional chart types (Pie, Scatter, Radar)
- [ ] Data filtering and date range selection
- [ ] Export functionality (PNG, PDF, CSV)
- [ ] Multiple dataset comparison
- [ ] Real-time data integration
- [ ] Custom color themes
- [ ] Animation controls
- [ ] Advanced analytics features

## 📄 License

MIT License - feel free to use this project as a foundation for your own data visualization needs.

## 🤝 Contributing

Contributions welcome! This project serves as a comprehensive example of React + Recharts integration patterns.

## 📞 Contact

Built by [@jonbrick](https://github.com/jonbrick)

---

**[🚀 View Live Demo](https://recharts-demo-phi.vercel.app/)** | **[📊 Explore the Code](https://github.com/jonbrick/recharts-demo)**
