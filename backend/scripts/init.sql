-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS server_metrics_time_series CASCADE;
DROP TABLE IF EXISTS simulation_results CASCADE;
DROP TABLE IF EXISTS simulations CASCADE;
DROP VIEW IF EXISTS simulation_summaries CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Simulations table
CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Create indexes for simulations
CREATE INDEX idx_simulations_status ON simulations(status);
CREATE INDEX idx_simulations_created_at ON simulations(created_at DESC);

-- Comment on table
COMMENT ON TABLE simulations IS 'Stores simulation configurations and status';

-- Simulation results table
CREATE TABLE simulation_results (
    id BIGSERIAL PRIMARY KEY,
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    
    -- Aggregate metrics
    avg_latency DECIMAL(10, 3) NOT NULL,
    p95_latency DECIMAL(10, 3) NOT NULL,
    p99_latency DECIMAL(10, 3) NOT NULL,
    avg_throughput DECIMAL(10, 2) NOT NULL,
    peak_throughput DECIMAL(10, 2) NOT NULL,
    total_requests INTEGER NOT NULL,
    total_processed INTEGER NOT NULL,
    failed_requests INTEGER DEFAULT 0,
    
    -- Server metrics
    server_utilization JSONB NOT NULL,
    avg_queue_length DECIMAL(10, 2) NOT NULL,
    
    -- Time series data
    time_series_data JSONB NOT NULL,
    
    -- Additional metrics
    additional_metrics JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for simulation results
CREATE INDEX idx_results_simulation_id ON simulation_results(simulation_id);
CREATE INDEX idx_results_created_at ON simulation_results(created_at DESC);

COMMENT ON TABLE simulation_results IS 'Stores aggregated simulation results';

-- Server metrics time series table (for detailed analysis)
CREATE TABLE server_metrics_time_series (
    id BIGSERIAL PRIMARY KEY,
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    timestamp INTEGER NOT NULL,
    server_id INTEGER NOT NULL,
    queue_length INTEGER NOT NULL,
    utilization DECIMAL(5, 2) NOT NULL,
    active_connections INTEGER NOT NULL,
    requests_processed INTEGER NOT NULL,
    avg_response_time DECIMAL(10, 3),
    
    CONSTRAINT unique_server_metric UNIQUE(simulation_id, timestamp, server_id)
);

-- Create indexes for time series
CREATE INDEX idx_server_metrics_sim_time ON server_metrics_time_series(simulation_id, timestamp);
CREATE INDEX idx_server_metrics_server ON server_metrics_time_series(server_id);

COMMENT ON TABLE server_metrics_time_series IS 'Stores detailed per-server time series metrics';

-- Create a view for simulation summaries
CREATE OR REPLACE VIEW simulation_summaries AS
SELECT 
    s.id,
    s.config->>'algorithm' as algorithm,
    s.status,
    s.created_at,
    s.completed_at,
    EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) as execution_time_seconds,
    r.avg_latency,
    r.p95_latency,
    r.p99_latency,
    r.avg_throughput,
    r.total_requests,
    r.total_processed,
    CASE 
        WHEN r.total_requests > 0 THEN 
            ROUND((r.total_processed::DECIMAL / r.total_requests * 100)::DECIMAL, 2)
        ELSE 0 
    END as success_rate
FROM simulations s
LEFT JOIN simulation_results r ON s.id = r.simulation_id
WHERE s.status = 'completed';

COMMENT ON VIEW simulation_summaries IS 'Provides a summary view of completed simulations';

-- Create a function to clean old simulations
CREATE OR REPLACE FUNCTION cleanup_old_simulations(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM simulations 
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND status IN ('completed', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_simulations IS 'Deletes simulations older than specified days';

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;