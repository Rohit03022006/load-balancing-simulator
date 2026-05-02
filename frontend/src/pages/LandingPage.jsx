import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Activity, 
  BarChart3, 
  GitCompare, 
  History, 
  Server, 
  Zap, 
  ArrowRight,
  TerminalSquare
} from 'lucide-react'

// Import new components
import ProblemSolution from '@/components/landing/ProblemSolution'
import Testimonials from '@/components/landing/Testimonials'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
            >
              <Badge variant="outline" className="px-4 py-1.5 text-sm text-primary border-primary/30 bg-primary/5">
                v1.0.0 Load Balancing Simulator
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Stop Guessing. <br/>
                <span className="text-primary">Start Simulating.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                The interactive sandbox for engineers to design, test, and optimize load balancing architectures before writing a single line of infrastructure code.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link 
                  to="/simulate" 
                  className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg font-semibold w-full sm:w-auto hover:scale-105 transition-transform")}
                >
                  Launch Sandbox <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  to="/compare" 
                  className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-14 px-8 text-lg font-semibold w-full sm:w-auto")}
                >
                  See How It Works
                </Link>
              </div>
            </motion.div>

            {/* Hero Visual/Animation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-2xl backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="ml-4 flex items-center text-xs text-muted-foreground font-mono">
                    <TerminalSquare className="w-3 h-3 mr-2" /> lb-sim-cluster-01
                  </div>
                </div>
                
                {/* Mock code block animation */}
                <div className="space-y-3 font-mono text-sm">
                  <div className="text-emerald-500 dark:text-emerald-400">→ Starting simulation engine...</div>
                  <div className="text-muted-foreground">  Algorithm: Weighted Round Robin</div>
                  <div className="text-muted-foreground">  Nodes: 12 active instances</div>
                  <div className="text-muted-foreground">  Traffic: 5,000 req/sec (Burst mode)</div>
                  
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="h-1 bg-primary rounded-full my-4"
                  />
                  
                  <div className="text-blue-500 dark:text-blue-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Real-time metrics streaming...</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
                    <div>P95 Latency: <span className="text-emerald-500 dark:text-emerald-400 font-medium">42ms</span></div>
                    <div>Throughput: <span className="text-foreground font-medium">4,992 rps</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* Problem -> Solution Storytelling */}
      <ProblemSolution />

      {/* Outcome-Focused Features */}
      <section className="py-24 relative overflow-hidden bg-muted/20 border-y border-border">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.05),transparent_70%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary border-primary/20 mb-2">
              Capabilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Everything you need to build <span className="text-primary">resilient systems</span></h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Go beyond simple feature lists. We give you the tools to actually prove your architecture works under pressure with high-fidelity simulation.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              index={0}
              icon={<Activity className="h-6 w-6" />}
              colorClass="bg-blue-500/10 text-blue-500"
              title="Spot Bottlenecks Instantly"
              description="Visualize P95 latency, throughput drops, and server queue buildups in real-time before they affect users."
            />
            <FeatureCard 
              index={1}
              icon={<GitCompare className="h-6 w-6" />}
              colorClass="bg-purple-500/10 text-purple-500"
              title="Prove Your Architecture Works"
              description="Run A/B comparisons of different algorithms under the exact same traffic conditions to make data-driven decisions."
            />
            <FeatureCard 
              index={2}
              icon={<Server className="h-6 w-6" />}
              colorClass="bg-emerald-500/10 text-emerald-500"
              title="Simulate Real-World Chaos"
              description="Add, remove or modify server capacities on the fly. Watch how your routing strategy handles unexpected degradation."
            />
            <FeatureCard 
              index={3}
              icon={<Zap className="h-6 w-6" />}
              colorClass="bg-orange-500/10 text-orange-500"
              title="Replicate Traffic Spikes"
              description="Create custom traffic profiles including sudden bursts and seasonal peaks to test the absolute limits of your cluster."
            />
            <FeatureCard 
              index={4}
              icon={<BarChart3 className="h-6 w-6" />}
              colorClass="bg-indigo-500/10 text-indigo-500"
              title="Exportable Analytics"
              description="Share detailed performance reports and raw metric data with your team to justify infrastructure scaling budgets."
            />
            <FeatureCard 
              index={5}
              icon={<History className="h-6 w-6" />}
              colorClass="bg-pink-500/10 text-pink-500"
              title="Historical Auditing"
              description="Keep a persistent record of all simulations to track improvements, regressions, and system behavior over time."
            />
          </div>
        </div>
      </section>

      {/* Trust Elements & Social Proof */}
      <Testimonials />

      {/* Conversion-Optimized CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),rgba(255,255,255,0))]" />
        <div className="container mx-auto px-6 relative z-10 text-center space-y-8 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ready to build resilient systems?</h2>
          <p className="text-xl text-primary-foreground/80 font-medium">
            Start your first simulation in seconds. No setup required.
          </p>
          <div className="pt-8">
            <Link 
              to="/simulate" 
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "h-14 px-10 text-xl font-bold rounded-full hover:scale-105 transition-transform text-primary")}
            >
              Launch Simulator Now
            </Link>
          </div>
          <p className="text-sm text-primary-foreground/60 pt-4">
            Free forever for individual developers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">LB Simulator</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <Link to="/simulate" className="text-muted-foreground hover:text-foreground transition-colors">Sandbox</Link>
              <Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
              <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">History</Link>
              <a href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Load Balancing Simulator.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, colorClass, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group relative h-full hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-card/50 backdrop-blur-sm border-border overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="relative z-10">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110",
            colorClass
          )}>
            {icon}
          </div>
          <CardTitle className="text-xl font-extrabold mb-3 group-hover:text-primary transition-colors">{title}</CardTitle>
          <CardDescription className="text-base leading-relaxed text-muted-foreground/90">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  )
}
