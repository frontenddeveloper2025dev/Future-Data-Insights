import { TrendingUp, BarChart3, Target, Brain, ArrowRight, LineChart, PieChart, Activity, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

function HomePage() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze patterns and deliver accurate forecasts"
    },
    {
      icon: LineChart,
      title: "Interactive Visualizations",
      description: "Dynamic charts and graphs that make complex data insights easy to understand"
    },
    {
      icon: Target,
      title: "Precision Analytics",
      description: "Track forecast accuracy and performance with detailed analytical reports"
    },
    {
      icon: Activity,
      title: "Real-Time Updates",
      description: "Stay current with live data integration and automatic forecast updates"
    }
  ]

  const useCases = [
    { icon: TrendingUp, title: "Sales Forecasting", description: "Predict revenue trends and seasonal patterns" },
    { icon: BarChart3, title: "Demand Planning", description: "Optimize inventory and resource allocation" },
    { icon: PieChart, title: "Market Analysis", description: "Understand market dynamics and opportunities" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ForecastPro
            </h1>
          </div>
          
          <h2 className="text-3xl font-semibold text-foreground mb-6">
            Advanced Forecasting & Analytics Platform
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Harness the power of AI and advanced analytics to make informed decisions. 
            Transform your data into actionable insights with precision forecasting.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {isLoggedIn ? (
              <>
                <Button size="lg" className="gap-2" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/forecast')}>
                  Create Forecast
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="gap-2" onClick={() => navigate('/login')}>
                  Get Started <LogIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to create accurate forecasts and drive data-driven decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center h-full">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Use Cases</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover how ForecastPro transforms various business scenarios
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <useCase.icon className="w-8 h-8 text-accent mb-3" />
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {useCase.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Forecasting?</h3>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses making smarter decisions with accurate predictions and data-driven insights.
          </p>
          {isLoggedIn ? (
            <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate('/login')}>
              Start Your Free Trial <LogIn className="w-4 h-4" />
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage