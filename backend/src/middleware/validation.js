const Joi = require("joi");
const {
  LOAD_BALANCING_ALGORITHMS,
  VALIDATION,
} = require("../config/constants");

const simulationConfigSchema = Joi.object({
  algorithm: Joi.string()
    .valid(...Object.values(LOAD_BALANCING_ALGORITHMS))
    .required()
    .messages({
      "any.required": "Algorithm is required",
      "any.only": `Algorithm must be one of: ${Object.values(LOAD_BALANCING_ALGORITHMS).join(", ")}`,
    }),

  requestRate: Joi.number()
    .min(VALIDATION.MIN_REQUEST_RATE)
    .max(VALIDATION.MAX_REQUEST_RATE)
    .required()
    .messages({
      "number.min": `Request rate must be at least ${VALIDATION.MIN_REQUEST_RATE}`,
      "number.max": `Request rate cannot exceed ${VALIDATION.MAX_REQUEST_RATE}`,
    }),

  numServers: Joi.number()
    .integer()
    .min(VALIDATION.MIN_SERVERS)
    .max(VALIDATION.MAX_SERVERS)
    .required()
    .messages({
      "number.min": `Number of servers must be at least ${VALIDATION.MIN_SERVERS}`,
      "number.max": `Number of servers cannot exceed ${VALIDATION.MAX_SERVERS}`,
    }),

  serverCapacity: Joi.number()
    .min(VALIDATION.MIN_CAPACITY)
    .max(VALIDATION.MAX_CAPACITY)
    .required()
    .messages({
      "number.min": `Server capacity must be at least ${VALIDATION.MIN_CAPACITY}`,
      "number.max": `Server capacity cannot exceed ${VALIDATION.MAX_CAPACITY}`,
    }),

  duration: Joi.number()
    .min(VALIDATION.MIN_DURATION)
    .max(VALIDATION.MAX_DURATION)
    .required()
    .messages({
      "number.min": `Duration must be at least ${VALIDATION.MIN_DURATION} second`,
      "number.max": `Duration cannot exceed ${VALIDATION.MAX_DURATION} seconds`,
    }),

  timeStep: Joi.number().min(0.01).max(1.0).default(0.1),

  enableBurst: Joi.boolean().default(false),

  burstMultiplier: Joi.number().min(1).max(10).default(3),

  burstDuration: Joi.number().min(1).max(60).default(5),

  burstInterval: Joi.number().min(10).max(120).default(30),

  serverWeights: Joi.array().items(Joi.number().min(1)).optional(),

  test: Joi.boolean().optional(),
}).unknown(true);

const validateSimulationConfig = (req, res, next) => {
  const { error } = simulationConfigSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateSimulationConfig,
};
