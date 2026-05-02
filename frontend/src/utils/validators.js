import { VALIDATION_RANGES } from "./constants";

export const validateSimulationConfig = (config) => {
  const errors = [];

  if (!config.algorithm) {
    errors.push("Algorithm is required");
  }

  if (
    config.requestRate < VALIDATION_RANGES.requestRate.min ||
    config.requestRate > VALIDATION_RANGES.requestRate.max
  ) {
    errors.push(
      `Request rate must be between ${VALIDATION_RANGES.requestRate.min} and ${VALIDATION_RANGES.requestRate.max}`,
    );
  }

  if (
    config.numServers < VALIDATION_RANGES.numServers.min ||
    config.numServers > VALIDATION_RANGES.numServers.max
  ) {
    errors.push(
      `Number of servers must be between ${VALIDATION_RANGES.numServers.min} and ${VALIDATION_RANGES.numServers.max}`,
    );
  }

  if (
    config.serverCapacity < VALIDATION_RANGES.serverCapacity.min ||
    config.serverCapacity > VALIDATION_RANGES.serverCapacity.max
  ) {
    errors.push(
      `Server capacity must be between ${VALIDATION_RANGES.serverCapacity.min} and ${VALIDATION_RANGES.serverCapacity.max}`,
    );
  }

  if (
    config.duration < VALIDATION_RANGES.duration.min ||
    config.duration > VALIDATION_RANGES.duration.max
  ) {
    errors.push(
      `Duration must be between ${VALIDATION_RANGES.duration.min} and ${VALIDATION_RANGES.duration.max} seconds`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
