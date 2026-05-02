import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { simulationService } from "@/services/simulationService";
import { ArrowRightLeft, Weight, Users, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const algorithmIcons = {
  round_robin: ArrowRightLeft,
  weighted_round_robin: Weight,
  least_connections: Users,
};

const algorithmDescriptions = {
  round_robin:
    "Distributes requests sequentially across all servers in a circular order. Simple and fair when servers have similar capacity.",
  weighted_round_robin:
    "Assigns weights to servers based on their capacity. Higher weight servers receive more requests proportionally.",
  least_connections:
    "Routes each request to the server with the fewest active connections. Best for handling variable request processing times.",
};

export const AlgorithmSelector = ({ value, onChange, disabled = false }) => {
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadAlgorithms();
  }, []);

  const loadAlgorithms = async () => {
    try {
      setLoading(true);
      const data = await simulationService.getAlgorithms();
      setAlgorithms(data.algorithms || []);
    } catch (error) {
      console.error("Failed to load algorithms:", error);
      setAlgorithms([
        {
          id: "round_robin",
          name: "Round Robin",
          description: "Sequential distribution",
        },
        {
          id: "weighted_round_robin",
          name: "Weighted Round Robin",
          description: "Weighted distribution",
        },
        {
          id: "least_connections",
          name: "Least Connections",
          description: "Connection-based routing",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectedAlgorithm = algorithms.find((a) => a.id === value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Load Balancing Algorithm</CardTitle>
        <CardDescription>
          Select the strategy for distributing requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an algorithm">
              {selectedAlgorithm && (
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = algorithmIcons[selectedAlgorithm.id] || Info;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  <span>{selectedAlgorithm.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {algorithms.map((algo) => {
              const Icon = algorithmIcons[algo.id] || Info;
              return (
                <SelectItem key={algo.id} value={algo.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{algo.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {selectedAlgorithm && (
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedAlgorithm.name}</p>
                <p className="text-sm text-muted-foreground">
                  {algorithmDescriptions[value] ||
                    selectedAlgorithm.description}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">When to use:</h4>
          <div className="grid gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help">
                    Round Robin
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Best for: Homogeneous servers with similar capacity and
                    predictable workloads
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help">
                    Weighted RR
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Best for: Heterogeneous servers with different processing
                    capabilities
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help">
                    Least Connections
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Best for: Variable request processing times and long-lived
                    connections
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
