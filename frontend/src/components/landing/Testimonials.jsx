import { motion } from "framer-motion";
import { Star, ShieldCheck, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Before this simulator, we just guessed our auto-scaling thresholds. Now we test exact traffic spikes before they happen in production.",
      author: "Sarah Chen",
      role: "Lead Site Reliability Engineer",
      company: "CloudScale Inc.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      quote:
        "Being able to visually compare Weighted Round Robin against Least Connections for our specific workloads has been a game changer for our latency.",
      author: "Marcus Johnson",
      role: "Senior Backend Developer",
      company: "DataFlow Tech",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      quote:
        "The visualizer makes it incredibly easy to explain infrastructure needs to our non-technical stakeholders. It paid for itself in one meeting.",
      author: "Elena Rodriguez",
      role: "VP of Engineering",
      company: "FinStream",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    },
  ];

  return (
    <section className="py-24 bg-muted/30 border-y border-border relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.03),transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Metric Banner */}
        <div className="max-w-4xl mx-auto mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20"
          >
            <ShieldCheck className="w-4 h-4" /> Trusted by engineering teams
            worldwide
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-foreground">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                10k+
              </div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-2">
                Architectures Simulated
              </div>
            </motion.div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                99.9%
              </div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-2">
                Prediction Accuracy
              </div>
            </motion.div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Zero
              </div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-2">
                Unexpected Outages
              </div>
            </motion.div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card hover:bg-card/80 transition-colors p-8 rounded-3xl shadow-sm border border-border flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Quote icon background */}
              <Quote className="absolute -top-4 -right-4 w-24 h-24 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />

              <div className="relative z-10 space-y-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-foreground/90 font-medium italic leading-relaxed text-lg">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="mt-10 pt-8 border-t border-border relative z-10">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 ring-4 ring-primary/5">
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.author}
                    />
                    <AvatarFallback>
                      {testimonial.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-foreground leading-tight">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {testimonial.role}
                    </div>
                    <div className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
