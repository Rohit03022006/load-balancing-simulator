import { motion } from "framer-motion";
import {
  ServerCrash,
  Server,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

export default function ProblemSolution() {
  return (
    <section className="py-24 bg-background overflow-hidden border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            One bad config can take down your{" "}
            <span className="text-destructive">entire cluster.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop guessing how your load balancer will handle a traffic spike.
            Test it in a risk-free environment.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 max-w-5xl mx-auto">
          {/* Problem Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex-1 w-full max-w-md bg-muted/30 border border-destructive/20 rounded-2xl p-8 relative"
          >
            <div className="absolute top-4 right-4 bg-destructive/10 text-destructive text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-destructive/20">
              <XCircle className="w-3 h-3" /> Failing System
            </div>

            <div className="flex flex-col items-center justify-center space-y-6 pt-4">
              <div className="relative">
                <ServerCrash className="w-20 h-20 text-destructive animate-pulse" />
                <div className="absolute inset-0 bg-destructive blur-2xl opacity-10" />
              </div>
              <ul className="space-y-3 w-full">
                {[
                  "Traffic spikes cause cascade failures",
                  "Uneven server utilization",
                  "Latency spikes in P95",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <XCircle className="w-5 h-5 text-destructive/60 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Transition Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden md:flex shrink-0 w-12 h-12 bg-muted rounded-full items-center justify-center z-10 shadow-sm border border-border"
          >
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </motion.div>

          {/* Solution Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex-1 w-full max-w-md bg-card border border-primary/20 rounded-2xl p-8 shadow-xl shadow-primary/5 relative"
          >
            <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20">
              <CheckCircle2 className="w-3 h-3" /> Balanced System
            </div>

            <div className="flex flex-col items-center justify-center space-y-6 pt-4">
              <div className="relative">
                <Server className="w-20 h-20 text-primary" />
                <div className="absolute inset-0 bg-primary blur-2xl opacity-10" />

                {/* Simulated balanced traffic */}
                <motion.div
                  className="absolute -top-4 -left-4 w-4 h-4 bg-primary/40 rounded-full"
                  animate={{ y: [0, 20, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -top-2 right-0 w-3 h-3 bg-primary/40 rounded-full"
                  animate={{ y: [0, 15, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <ul className="space-y-3 w-full">
                {[
                  "Test algorithms before deployment",
                  "Visualize capacity limits perfectly",
                  "Predictable low latency",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-foreground font-medium"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
