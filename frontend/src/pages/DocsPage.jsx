import React from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Server, 
  Activity, 
  Zap, 
  Clock, 
  BarChart3, 
  ShieldCheck, 
  ArrowRightLeft,
  Info,
  ChevronRight,
  Target,
  User
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const ConceptCard = ({ title, description, icon: Icon, color }) => (
  <Card className="border-primary/10 hover:border-primary/30 transition-all duration-300 group">
    <CardHeader className="pb-3">
      <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </CardContent>
  </Card>
)

const AlgorithmDetail = ({ name, concept, analogy, pros, cons, icon: Icon }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-xl font-bold">{name}</h3>
    </div>
    
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">The Concept</h4>
          <p className="text-sm leading-relaxed">{concept}</p>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Analogy
          </h4>
          <p className="text-sm italic text-muted-foreground">"{analogy}"</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
          <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Strengths</h4>
          <ul className="text-xs space-y-1 text-emerald-700/80">
            {pros.map((p, i) => <li key={i} className="flex items-start gap-1"><span>•</span> {p}</li>)}
          </ul>
        </div>
        <div className="bg-orange-500/5 p-4 rounded-lg border border-orange-500/10">
          <h4 className="text-xs font-bold text-orange-600 uppercase mb-2">Weaknesses</h4>
          <ul className="text-xs space-y-1 text-orange-700/80">
            {cons.map((c, i) => <li key={i} className="flex items-start gap-1"><span>•</span> {c}</li>)}
          </ul>
        </div>
      </div>
    </div>
  </div>
)

const DocsPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Learning Center
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          Understanding <span className="text-primary">Load Balancing</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Discover how modern systems handle millions of users by distributing work efficiently across multiple servers.
        </motion.p>
      </section>

      {/* Core Concept */}
      <section className="grid gap-8 md:grid-cols-3">
        <ConceptCard 
          title="What is it?"
          description="A load balancer acts as a traffic cop sitting in front of your servers, routing client requests to all servers capable of fulfilling those requests."
          icon={ArrowRightLeft}
          color="bg-blue-500"
        />
        <ConceptCard 
          title="Why do we need it?"
          description="Without it, one server might crash from too many users while others sit idle. It ensures high availability and reliability by preventing any single point of failure."
          icon={ShieldCheck}
          color="bg-purple-500"
        />
        <ConceptCard 
          title="How it scales?"
          description="As your traffic grows, you can simply add more servers. The load balancer will automatically include them in the rotation, scaling your system infinitely."
          icon={Zap}
          color="bg-orange-500"
        />
      </section>

      {/* Algorithms */}
      <section className="space-y-8">
        <Tabs defaultValue="rr" className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">The Algorithms</h2>
              <p className="text-muted-foreground">The "Brain" behind the distribution decisions.</p>
            </div>
            <div className="hidden md:flex">
              <Badge variant="outline" className="text-xs font-mono">Select a strategy below to learn more</Badge>
            </div>
          </div>

          <Card className="border-primary/10 shadow-lg overflow-hidden">
            <div className="border-b bg-muted/20">
              <TabsList className="h-14 w-full justify-start rounded-none bg-transparent px-4">
                <TabsTrigger value="rr" className="data-[state=active]:bg-background">Round Robin</TabsTrigger>
                <TabsTrigger value="wrr" className="data-[state=active]:bg-background">Weighted RR</TabsTrigger>
                <TabsTrigger value="lc" className="data-[state=active]:bg-background">Least Connections</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-8">
              <TabsContent value="rr" className="mt-0 outline-none">
                <AlgorithmDetail 
                  name="Round Robin"
                  icon={ArrowRightLeft}
                  concept="Requests are distributed sequentially across the list of servers. When it reaches the end of the list, it starts over from the first server."
                  analogy="A card dealer giving one card to each player at the table in order until everyone has their hand."
                  pros={["Very simple to implement", "Perfect for identical servers", "No state tracking needed"]}
                  cons={["Assumes all servers have same power", "Doesn't account for busy servers", "No priority support"]}
                />
              </TabsContent>
              <TabsContent value="wrr" className="mt-0 outline-none">
                <AlgorithmDetail 
                  name="Weighted Round Robin"
                  icon={Server}
                  concept="Similar to Round Robin, but each server is assigned a weight based on its capacity. Servers with higher weights receive more requests."
                  analogy="A manager assigning 10 tasks: 7 go to the senior developer and 3 go to the intern."
                  pros={["Handles mixed server power", "Predictable distribution", "Cost-effective scaling"]}
                  cons={["Requires manual weighting", "Static: doesn't react to live load", "Needs reconfiguration as hardware changes"]}
                />
              </TabsContent>
              <TabsContent value="lc" className="mt-0 outline-none">
                <AlgorithmDetail 
                  name="Least Connections"
                  icon={Activity}
                  concept="The load balancer tracks how many active connections each server has and sends the next request to the server with the fewest active tasks."
                  analogy="Looking at supermarket checkout lines and choosing the one with the fewest people."
                  pros={["Highly dynamic and adaptive", "Prevents server overload", "Best for long-running tasks"]}
                  cons={["More CPU-intensive for LB", "Requires state tracking", "Can be tricky with sticky sessions"]}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </section>

      {/* Advanced Concepts Deep Dive */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary bg-primary/5">
            Deep Dive
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">System Architecture Concepts</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Load balancing isn't just about routing; it's about maintaining a healthy, persistent, and secure ecosystem.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Health Checks */}
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Health Checks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The "Pulse" of your infrastructure. Load balancers continuously monitor server health to avoid sending traffic to failed nodes.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Passive: Monitoring actual traffic patterns.
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Active: Sending synthetic "pings" to a health endpoint.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sticky Sessions */}
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <User className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Sticky Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ensures a client is always routed to the same backend server. Crucial for apps that store state (like a shopping cart) in local memory.
              </p>
              <div className="bg-muted/50 p-2 rounded text-[10px] font-mono text-muted-foreground">
                SET-COOKIE: SERVERID=app-01; path=/
              </div>
            </CardContent>
          </Card>

          {/* OSI Layers */}
          <Card className="relative overflow-hidden group md:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Server className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                L4 vs L7 Routing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase text-orange-600 mb-1">Layer 4 (Transport)</h4>
                  <p className="text-[11px] text-muted-foreground">Routes based on IP and Port. Extremely fast but "blind" to the data content.</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-xs font-bold uppercase text-blue-600 mb-1">Layer 7 (Application)</h4>
                  <p className="text-[11px] text-muted-foreground">Routes based on URLs, Cookies, or Headers. Smart but requires more CPU power.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* OSI Model Comparison Table */}
      <section className="bg-muted/20 rounded-2xl p-8 border border-border">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">The OSI Model Perspective</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In the world of Operating Systems and Networking, we visualize communication in layers. 
              Load balancing typically happens at two critical points:
            </p>
            <div className="space-y-2">
              {[
                { l: 'Layer 7', n: 'Application', d: 'HTTP, HTTPS, FTP, DNS' },
                { l: 'Layer 4', n: 'Transport', d: 'TCP, UDP' },
                { l: 'Layer 3', n: 'Network', d: 'IP, ICMP' },
              ].map((layer, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-background rounded-lg border border-border/50">
                  <div className="font-bold text-primary w-16">{layer.l}</div>
                  <div>
                    <div className="text-xs font-bold">{layer.n}</div>
                    <div className="text-[10px] text-muted-foreground">{layer.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-background p-6 rounded-xl border shadow-xl space-y-4">
              <h4 className="font-bold text-center border-b pb-2">Why Layer 7 is Winning?</h4>
              <ul className="space-y-3">
                {[
                  'SSL Termination: Offloading encryption from servers.',
                  'URL Switching: /api goes to Server A, /images to Server B.',
                  'WAF Integration: Filtering malicious requests at the edge.',
                  'Content Caching: Serving static files directly from the LB.'
                ].map((text, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 h-12 w-12 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-12 w-12 bg-blue-500/10 rounded-full blur-xl" />
          </div>
        </div>
      </section>

      {/* The Mathematics Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">The Mathematical Foundations</h2>
          <p className="text-muted-foreground">The logic that powers the simulator's brain.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Modulo Arithmetic */}
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-primary flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-[10px]">MOD</div>
                Index Rotation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/80 p-4 rounded-lg font-mono text-center text-sm border shadow-inner">
                i = (i + 1) mod N
              </div>
              <p className="text-[11px] text-muted-foreground">
                Used in <strong>Round Robin</strong> to ensure we cycle through N servers and return to 0 when the end is reached.
              </p>
            </CardContent>
          </Card>

          {/* Probability Distribution */}
          <Card className="bg-blue-500/5 border-blue-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-blue-600 flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center text-[10px]">Σ</div>
                Weighted Probability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/80 p-4 rounded-lg font-mono text-center text-sm border shadow-inner">
                P(sᵢ) = wᵢ / Σ(wⱼ)
              </div>
              <p className="text-[11px] text-muted-foreground">
                In <strong>Weighted RR</strong>, the probability of choosing server <em>i</em> is its weight divided by the sum of all weights.
              </p>
            </CardContent>
          </Card>

          {/* Little's Law */}
          <Card className="bg-purple-500/5 border-purple-500/10 md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-purple-600 flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-purple-500/20 flex items-center justify-center text-[10px]">L</div>
                Little's Law
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/80 p-4 rounded-lg font-mono text-center text-sm border shadow-inner">
                L = λ × W
              </div>
              <p className="text-[11px] text-muted-foreground">
                Determines system capacity. The number of concurrent users (L) equals the arrival rate (λ) times the time spent in system (W).
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Scalability Section */}
      <section className="space-y-8 bg-muted/5 p-10 rounded-3xl border border-dashed border-border/50">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">The Scaling Philosophy</h2>
          <p className="text-muted-foreground">How systems grow to meet modern demand.</p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 mt-8">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ArrowRightLeft className="h-6 w-6 rotate-90" />
            </div>
            <h3 className="text-xl font-bold italic tracking-tight">Vertical Scaling (Scale Up)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Making a single server more powerful by adding faster CPUs, more RAM, or larger disks. 
              Think of it as <strong>upgrading your family car</strong> to a high-speed sports car.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-medium">
                <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5">Limit</Badge>
                <span>Hardware has physical ceilings. You can only buy the "best" CPU once.</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-medium">
                <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5">Cost</Badge>
                <span>High-end hardware cost grows exponentially, not linearly.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold italic tracking-tight">Horizontal Scaling (Scale Out)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting multiple independent servers together to act as one. 
              Think of it as <strong>building a fleet of cars</strong> to transport a whole city. 
              This is the foundation of the modern Cloud.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-medium">
                <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5">Infinite</Badge>
                <span>Theoretically no limit. Just add more commodity hardware.</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-medium">
                <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5">Resilient</Badge>
                <span>If one server fails, the others keep the system alive.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Metrics Explained */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Understanding the Metrics</h2>
          <p className="text-muted-foreground">How we measure 'Good' performance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              title: 'Avg Latency', 
              unit: 'ms', 
              desc: 'The time it takes for a request to be completed.',
              icon: Clock,
              tip: 'Lower is better. High latency feels "laggy".'
            },
            { 
              title: 'Throughput', 
              unit: 'req/s', 
              desc: 'How many requests the system handles per second.',
              icon: Zap,
              tip: 'Higher is better. Measures raw capacity.'
            },
            { 
              title: 'Utilization', 
              unit: '%', 
              desc: 'How much of a server\'s capacity is currently used.',
              icon: BarChart3,
              tip: 'Sweet spot is 60-80%. 100% means overload.'
            },
            { 
              title: 'Success Rate', 
              unit: '%', 
              desc: 'The percentage of requests completed without error.',
              icon: ShieldCheck,
              tip: 'Should be 100%. Dropped requests mean lost business.'
            }
          ].map((m, i) => (
            <Card key={i} className="bg-muted/30 border-none shadow-none">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">{m.title}</CardTitle>
                <m.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{m.desc}</p>
                <Badge variant="secondary" className="text-[10px] bg-background/50">{m.tip}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary rounded-3xl p-10 text-primary-foreground text-center space-y-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-64 w-64 bg-black/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold">Ready to see it in action?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Head over to the Simulation Studio to build your own infrastructure and test these algorithms under stress.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button className="px-6 py-3 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors shadow-lg">
              Start Simulating
            </button>
            <button className="px-6 py-3 bg-primary-foreground/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/10 transition-colors">
              Compare Algorithms
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DocsPage
