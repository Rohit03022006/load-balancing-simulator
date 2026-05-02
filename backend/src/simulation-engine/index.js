const SimulationEngine = require('./SimulationEngine');
const TrafficGenerator = require('./TrafficGenerator');
const Server = require('./Server');
const Request = require('./Request');
const MetricsCollector = require('./MetricsCollector');
const RoundRobinBalancer = require('./load-balancers/RoundRobinBalancer');
const WeightedRoundRobinBalancer = require('./load-balancers/WeightedRoundRobinBalancer');
const LeastConnectionsBalancer = require('./load-balancers/LeastConnectionsBalancer');

module.exports = {
    SimulationEngine,
    TrafficGenerator,
    Server,
    Request,
    MetricsCollector,
    loadBalancers: {
        RoundRobinBalancer,
        WeightedRoundRobinBalancer,
        LeastConnectionsBalancer
    }
};