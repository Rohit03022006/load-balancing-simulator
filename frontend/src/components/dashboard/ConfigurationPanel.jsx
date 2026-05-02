import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/store/simulationStore";
import { simulationService } from "@/services/simulationService";
import { Play, Settings, Zap, Server, Network, Save } from "lucide-react";
import { toast } from "sonner";

export const ConfigurationPanel = ({ onRun, isLoading }) => {
  const { config, updateConfig, algorithms } = useSimulationStore();
  const [savedConfigs, setSavedConfigs] = useState([]);

  useEffect(() => {
    loadAlgorithms();
    loadSavedConfigs();
  }, []);

  const loadAlgorithms = async () => {
    try {
      const data = await simulationService.getAlgorithms();
      useSimulationStore.setState({ algorithms: data.algorithms });
    } catch (error) {
      console.error("Failed to load algorithms:", error);
    }
  };

  const loadSavedConfigs = () => {
    const saved = localStorage.getItem("simulation-configs");
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  };

  const saveConfig = () => {
    const newConfig = {
      ...config,
      id: Date.now(),
      name: `Config ${savedConfigs.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedConfigs, newConfig];
    setSavedConfigs(updated);
    localStorage.setItem("simulation-configs", JSON.stringify(updated));
    toast.success("Configuration saved");
  };

  const loadConfig = (savedConfig) => {
    updateConfig(savedConfig);
    toast.success("Configuration loaded");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Simulation Configuration
            </CardTitle>
            <CardDescription>
              Configure load balancing simulation parameters
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={saveConfig}>
            <Save className="mr-2 h-4 w-4" />
            Save Config
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <Network className="mr-2 h-4 w-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="servers">
              <Server className="mr-2 h-4 w-4" />
              Servers
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Zap className="mr-2 h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Algorithm Selection */}
            <div className="space-y-2">
              <Label>Load Balancing Algorithm</Label>
              <Select
                value={config.algorithm}
                onValueChange={(value) => updateConfig({ algorithm: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {algorithms.map((algo) => (
                    <SelectItem key={algo.id} value={algo.id}>
                      <div className="flex flex-col">
                        <span>{algo.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {algo.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Request Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Request Rate (requests/sec)</Label>
                <Badge variant="outline">{config.requestRate} req/s</Badge>
              </div>
              <Slider
                value={config.requestRate}
                onValueChange={(value) =>
                  updateConfig({ requestRate: value })
                }
                min={1}
                max={1000}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low (1)</span>
                <span>Medium (500)</span>
                <span>High (1000)</span>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Simulation Duration (seconds)</Label>
                <Badge variant="outline">{config.duration}s</Badge>
              </div>
              <Slider
                value={config.duration}
                onValueChange={(value) => updateConfig({ duration: value })}
                min={5}
                max={300}
                step={5}
              />
            </div>
          </TabsContent>

          <TabsContent value="servers" className="space-y-4">
            {/* Number of Servers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Number of Servers</Label>
                <Badge variant="outline">{config.numServers}</Badge>
              </div>
              <Slider
                value={config.numServers}
                onValueChange={(value) => updateConfig({ numServers: value })}
                min={1}
                max={50}
                step={1}
              />
            </div>

            {/* Server Capacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Server Capacity (req/sec)</Label>
                <Badge variant="outline">{config.serverCapacity}</Badge>
              </div>
              <Slider
                value={config.serverCapacity}
                onValueChange={(value) =>
                  updateConfig({ serverCapacity: value })
                }
                min={5}
                max={200}
                step={5}
              />
            </div>

            {/* Time Step */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Time Step (seconds)</Label>
                <Badge variant="outline">{config.timeStep || 0.1}s</Badge>
              </div>
              <Slider
                value={config.timeStep || 0.1}
                onValueChange={(value) => updateConfig({ timeStep: value })}
                min={0.01}
                max={1.0}
                step={0.01}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {/* Burst Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Burst Traffic Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Simulate sudden traffic spikes
                </p>
              </div>
              <Switch
                checked={config.enableBurst || false}
                onCheckedChange={(checked) =>
                  updateConfig({ enableBurst: checked })
                }
              />
            </div>

            {config.enableBurst && (
              <>
                {/* Burst Multiplier */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Burst Multiplier</Label>
                    <Badge variant="outline">
                      {config.burstMultiplier || 3}x
                    </Badge>
                  </div>
                  <Slider
                    value={config.burstMultiplier || 3}
                    onValueChange={(value) =>
                      updateConfig({ burstMultiplier: value })
                    }
                    min={1.5}
                    max={10}
                    step={0.5}
                  />
                </div>

                {/* Burst Duration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Burst Duration (seconds)</Label>
                    <Badge variant="outline">
                      {config.burstDuration || 5}s
                    </Badge>
                  </div>
                  <Slider
                    value={config.burstDuration || 5}
                    onValueChange={(value) =>
                      updateConfig({ burstDuration: value })
                    }
                    min={1}
                    max={30}
                    step={1}
                  />
                </div>

                {/* Burst Interval */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Burst Interval (seconds)</Label>
                    <Badge variant="outline">
                      {config.burstInterval || 30}s
                    </Badge>
                  </div>
                  <Slider
                    value={config.burstInterval || 30}
                    onValueChange={(value) =>
                      updateConfig({ burstInterval: value })
                    }
                    min={10}
                    max={120}
                    step={5}
                  />
                </div>
              </>
            )}

            {/* Saved Configurations */}
            {savedConfigs.length > 0 && (
              <div className="space-y-2">
                <Label>Saved Configurations</Label>
                <div className="space-y-1">
                  {savedConfigs.slice(0, 3).map((cfg) => (
                    <Button
                      key={cfg.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => loadConfig(cfg)}
                    >
                      <Settings className="mr-2 h-3 w-3" />
                      {cfg.name} - {cfg.algorithm}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-2">
          <Button
            className="flex-1"
            size="lg"
            onClick={onRun}
            disabled={isLoading}
          >
            {isLoading ? (
              <>Running Simulation...</>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
