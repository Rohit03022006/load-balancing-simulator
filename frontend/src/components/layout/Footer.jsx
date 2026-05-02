export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="container mx-auto flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground px-4">
        <div className="flex items-center gap-2 font-medium text-foreground/70">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
          <span>Load Balancing Strategy Simulator</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase opacity-50">
          <span>&copy; {new Date().getFullYear()} </span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
