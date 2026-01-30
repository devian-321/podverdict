import rateLimit from 'express-rate-limit';

export const submissionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        message: "Too many submissions. Please wait a minute before trying again."
    },
    standardHeaders: true,
    legacyHeaders: false,
});