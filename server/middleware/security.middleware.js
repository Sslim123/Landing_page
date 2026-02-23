import  helmet from "helmet";
import rateLimit from "express-rate-limit";

export const securityMiddleware = 
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  });



export const applyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});
