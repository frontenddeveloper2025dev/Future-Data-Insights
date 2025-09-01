# This file is only for editing file nodes, do not break the structure
## Project Description
ForecastPro - Advanced forecasting and analytics platform that empowers businesses to make data-driven decisions through AI-powered predictions, interactive visualizations, and precision analytics. Professional-grade forecasting tools with modern UI/UX.

## Key Features
- AI-powered forecasting with machine learning algorithms
- Interactive data visualizations and dynamic charts
- Precision analytics with forecast accuracy tracking
- Real-time data integration and updates
- Professional forecasting dashboard with advanced visualizations
- Comprehensive data visualization components (trend charts, heatmaps, scatter plots)
- Multi-tab analytics dashboard with performance metrics
- Multiple use cases: sales, demand planning, market analysis

## Devv SDK Integration
Built-in: ✅ auth (OTP login/logout), table (forecasts: evn1j5kjx62o, models: evn1jewwqy9s), data visualization
External: ✅ Export libraries (html2canvas, file-saver, jsPDF, xlsx) for comprehensive export functionality
[Future phase - OpenRouterAI for advanced ML models, TTS for voice alerts]

## Implementation Status - Phase 4 Complete
- ✅ Authentication system with OTP (email verification)
- ✅ User session management with Zustand persistence
- ✅ Protected routes for dashboard and forecast creation
- ✅ Data tables for forecasts and model configurations
- ✅ Enhanced multi-step forecast creation with validation
- ✅ Advanced interactive SVG chart visualization with toggles
- ✅ Comprehensive forecast analytics with risk assessment
- ✅ Sophisticated prediction algorithms (8 models: Linear, Exponential, Neural Network, ARIMA, Random Forest, etc.)
- ✅ Enhanced data input with CSV parsing and validation
- ✅ Model categorization and filtering interface
- ✅ Performance metrics and forecast accuracy tracking
- ✅ **Advanced Data Visualization Suite**:
  - TrendChart: Line/area charts with confidence intervals and forecast demarcation
  - ForecastDashboard: Multi-tab analytics with overview, accuracy, performance, and error analysis
  - CorrelationHeatmap: Interactive correlation matrix with color-coded relationships
  - ScatterAnalysis: Scatter plots with trend lines, category filtering, and statistical analysis
  - Complete integration with Recharts library for professional visualizations
- ✅ **Phase 3 - Forecast Comparison & Accuracy Tracking**:
  - ForecastComparison: Multi-forecast comparison with side-by-side analytics and chart visualization
  - AccuracyTracker: Real-time accuracy monitoring with outcome recording and trend analysis
  - PerformanceDashboard: Comprehensive performance analytics with model comparison, type analysis, and time-series insights
  - Interactive accuracy tracking with actual vs predicted scatter plots and cumulative accuracy trends
  - Model performance ranking and success rate analysis
  - Forecast outcome recording system with variance calculation and accuracy percentage tracking
- ✅ **Phase 4 - Advanced Interactive Chart Types & Visualizations**:
  - InteractiveLineChart: Time-series with zoom/pan, confidence intervals, brush navigation, and animated interactions
  - InteractiveScatterPlot: Multi-dimensional scatter with clustering, regression analysis, category filtering, and statistical insights
  - Surface3DChart: 3D surface visualization with rotation controls, lighting effects, and multiple color schemes
  - RadarChart: Multi-series radar analysis with rotation, series toggles, and statistical breakdowns
  - AnimatedGauge: KPI tracking gauges with thresholds, trend indicators, target lines, and smooth animations
  - Advanced Charts Showcase: Interactive demo page with 5 chart types and comprehensive feature demonstrations
- ✅ **Phase 4 - Forecast Templates & Saved Configurations**:
  - TemplateManager: Create, save, and manage reusable forecast templates with complete model configurations
  - ConfigurationManager: Comprehensive settings management with export/import, visual preferences, data handling options
  - Template categorization (sales, financial, marketing, operations, custom) with usage tracking and public sharing
  - Multi-tab settings interface covering general, visualization, data processing, and notification preferences
  - Quick Start templates with pre-configured models for common business scenarios
  - Template application with automatic configuration loading and customization options
- ✅ **Smart Template Suggestions & Analytics**:
  - TemplateSuggestions: AI-powered template recommendations based on data patterns, usage history, and user behavior
  - PatternAnalyzer: Advanced ML-style analysis of user forecasting patterns, data characteristics, and model performance
  - ForecastAnalyzer: Real-time data pattern analysis with insights, recommendations, and actionable feedback
  - UsageAnalytics: Comprehensive usage tracking with trends, popular templates, model performance, and user engagement metrics
  - Intelligent matching system that considers experience level, domain expertise, data quality, and forecasting style
  - Context-aware recommendations with confidence scores, expected accuracy predictions, and adaptation suggestions
- ✅ **Integrated Forecast Workflow Analytics**:
  - ForecastAnalyzer integrated into forecast creation workflow for real-time insights during data input and model selection
  - DataInputForm enhanced with live data preview showing quality metrics, trend analysis, and statistical summaries
  - Real-time analysis panel in model selection step with pattern recognition and template suggestions
  - Automated data quality assessment with actionable recommendations for improving forecast accuracy
  - Intelligent workflow guidance based on data characteristics, user experience level, and historical performance
  - Context-aware insights that adapt to forecast type, data size, and complexity requirements
  - ModelSelector with intelligent compatibility scoring showing how well each model fits analyzed data patterns
  - Real-time AI insights during data input with automated quality assessment and model recommendations
  - Context-aware workflow progression with smart notifications and actionable feedback throughout the creation process
- ✅ **Mobile Responsiveness Optimizations**:
  - TemplateManager: Full mobile optimization with Sheet modals, responsive grids, touch-friendly controls
  - ConfigurationManager: Comprehensive mobile redesign with touch-friendly switches, enhanced form fields, and responsive layouts
  - Mobile-first template cards with collapsible content and optimized button layouts
  - Advanced mobile filters with expandable panels and badge-based category selection
  - Touch-optimized tap targets (44px minimum) and improved mobile navigation
  - Responsive tab layouts with vertical stacking on mobile devices and enhanced visual hierarchy
  - Mobile-specific CSS utilities for line clamping, spacing, and interaction states
  - Sheet-based dialogs for full-screen mobile form experiences with contextual help and tips
  - Enhanced mobile forms with larger input fields, better spacing, and touch-friendly interactions
  - Mobile-optimized switch controls with increased size and visual feedback
  - Context-aware mobile tooltips and help text for complex configuration options
  - Responsive grid systems that adapt seamlessly from desktop to mobile layouts
- ✅ **Enhanced Forecast Results & Post-Generation Analysis**:
  - PostGenerationAnalysis: Comprehensive 5-tab analysis system with performance metrics, confidence intervals, scenario analysis, AI insights, and actionable recommendations
  - ModelPerformanceInsights: Advanced model benchmarking with error metrics (MAE, RMSE, MAPE), correlation analysis, and strength/weakness assessment
  - ResultsSummary: Executive-level results overview with key metrics, performance indicators, forecast timeline, and quality assessment
  - Enhanced ForecastAnalytics with toggle for advanced analysis integration and seamless workflow progression
  - Deep model performance comparison with industry benchmarks, complexity analysis, and interpretability scores
  - Confidence interval calculations with uncertainty analysis that increases over forecast horizon
  - Three-scenario analysis (optimistic, realistic, pessimistic) with probability weighting and outcome descriptions
  - Advanced error metrics calculation including bias analysis, consistency scoring, and model-specific insights
  - Intelligent model recommendations based on data characteristics, volatility patterns, and historical performance
  - Export functionality for comprehensive analysis data with JSON format for further processing
  - Smart recommendations engine providing immediate actions and strategic improvements based on forecast quality
- ✅ **Comprehensive Export Functionality**:
  - ExportManager: Multi-format export system supporting CSV, Excel, JSON, PDF, PNG, and SVG formats with customizable content selection
  - ChartExporter: Specialized chart export utility with high-quality image generation, custom sizing, background options, and multiple format support
  - BulkExporter: Advanced bulk export system for multiple forecasts and reports with ZIP/TAR packaging, compression options, and progress tracking
  - Export page with comprehensive interface for managing all export operations with preview and configuration options
  - Integration with html2canvas, file-saver, jsPDF, and xlsx libraries for professional export capabilities
  - Chart export buttons integrated into TrendChart and dashboard visualizations for one-click exports
  - Support for exporting forecast data, analysis reports, chart visualizations, and comprehensive analysis packages
  - Real-time export progress tracking with status indicators and error handling
  - Customizable export options including date ranges, quality settings, file naming, and content filtering
  - Professional export formats suitable for presentations, reports, data analysis, and business documentation

## Database Tables Created
- forecasts (evn1j5kjx62o): User forecasts with predictions, accuracy scores, model info
- forecast_models (evn1jewwqy9s): Available prediction models with configurations
- forecast_outcomes (evtdsghlfbb4): Actual outcomes for tracking forecast accuracy over time
- forecast_templates (ew2w7lb1sa9s): Reusable forecast templates with complete model configurations, usage tracking, and smart analytics

/src
├── assets/          # Static resources directory, storing static files like images and fonts
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components, avoid modifying or rewriting unless necessary
│   ├── export/     # Export functionality components
│   │   ├── ExportManager.tsx # Multi-format export system with comprehensive options and preview
│   │   ├── ChartExporter.tsx # Specialized chart export utility with quality controls and format options
│   │   ├── BulkExporter.tsx # Advanced bulk export system with progress tracking and packaging options
│   │   └── index.ts # Export component exports and type definitions
│   ├── charts/     # Advanced interactive chart components
│   │   ├── InteractiveLineChart.tsx # Time-series with zoom/pan, confidence intervals, and animations
│   │   ├── InteractiveScatterPlot.tsx # Multi-dimensional scatter with clustering and regression
│   │   ├── Surface3DChart.tsx # 3D surface visualization with rotation and lighting controls
│   │   ├── RadarChart.tsx # Multi-series radar analysis with rotation and statistics
│   │   ├── AnimatedGauge.tsx # KPI gauges with thresholds, trends, and smooth animations
│   │   ├── types.ts # TypeScript definitions for all chart components
│   │   └── index.ts # Chart component exports and type re-exports
│   ├── forecast/   # Forecast-specific components
│   │   ├── TrendChart.tsx # Advanced trend visualization with confidence intervals
│   │   ├── ForecastDashboard.tsx # Multi-tab analytics dashboard with performance metrics
│   │   ├── CorrelationHeatmap.tsx # Feature correlation matrix visualization
│   │   ├── ScatterAnalysis.tsx # Scatter plot analysis with trend lines
│   │   ├── DataInputForm.tsx # Enhanced historical data input with smart CSV parsing, live data preview, quality assessment, and integrated ForecastAnalyzer
│   │   ├── ModelSelector.tsx # AI/statistical model selection with intelligent compatibility scoring and data-driven recommendations
│   │   ├── ForecastChart.tsx # Advanced SVG chart with line/area modes and analytics
│   │   ├── TemplateManager.tsx # Template creation, management, and application interface
│   │   ├── ConfigurationManager.tsx # Settings management with export/import and preferences
│   │   ├── TemplateSuggestions.tsx # AI-powered smart template recommendations based on patterns and usage
│   │   ├── ForecastAnalyzer.tsx # Real-time data pattern analysis integrated into forecast workflow with insights and recommendations
│   │   ├── UsageAnalytics.tsx # Comprehensive usage tracking and analytics dashboard
│   │   ├── PostGenerationAnalysis.tsx # 5-tab comprehensive analysis with performance, confidence, scenarios, insights, and recommendations
│   │   ├── ModelPerformanceInsights.tsx # Advanced model benchmarking with error metrics, correlation analysis, and intelligent recommendations
│   │   ├── ResultsSummary.tsx # Executive results overview with key metrics, performance indicators, and quality assessment
│   │   └── index.ts # Component exports and type definitions
│   ├── ForecastComparison.tsx # Multi-forecast comparison with interactive charts
│   ├── AccuracyTracker.tsx # Real-time accuracy monitoring and outcome recording
│   ├── PerformanceDashboard.tsx # Comprehensive performance analytics dashboard
│   └── ProtectedRoute.tsx # Route protection for authenticated users
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Pre-installed mobile detection Hook from shadcn (import { useIsMobile } from '@/hooks/use-mobile')
│   └── use-toast.ts  # Toast notification system hook for displaying toast messages (import { useToast } from '@/hooks/use-toast')
│
├── lib/            # Utility library directory
│   ├── utils.ts    # Utility functions, including the cn function for merging Tailwind class names
│   └── patternAnalyzer.ts # Advanced ML-style pattern analysis for intelligent template suggestions
│
├── pages/          # Page components directory, based on React Router structure
│   ├── HomePage.tsx # Home page with auth-aware navigation and forecasting showcase
│   ├── DashboardPage.tsx # Multi-tab dashboard with analytics, trends, insights, and export functionality
│   ├── ForecastPage.tsx # 3-step forecast creation with enhanced results page featuring comprehensive post-generation analysis, model performance insights, and executive summaries
│   ├── PerformancePage.tsx # Dedicated performance analysis and comparison page
│   ├── AdvancedChartsPage.tsx # Interactive charts showcase with 5 advanced chart types
│   ├── TemplatesPage.tsx # Templates, smart suggestions, configurations, analytics, and quick start guide
│   ├── ExportPage.tsx # Comprehensive export center with multi-format export options, bulk export, and chart export functionality
│   ├── LoginPage.tsx # Email OTP authentication interface
│   └── NotFoundPage.tsx # 404 error page component, displays when users access non-existent routes
│
├── App.tsx         # Root component, with React Router routing system configured
│                   # Add new route configurations in this file
│                   # Includes catch-all route (*) for 404 page handling
│
├── main.tsx        # Entry file, rendering the root component and mounting to the DOM
│
├── index.css       # Global styles file, containing Tailwind configuration and custom styles
│                   # Modify theme colors and design system variables in this file
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
# Contains theme customization, plugins, and content paths
# Includes shadcn/ui theme configuration