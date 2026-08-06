import { Request, Response, NextFunction } from "express";
import { ZodSchema  , ZodError } from "zod";

const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // In Zod v4, use .issues instead of .errors
                const errorMessages = error.issues.map((issue: any) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errorMessages,
                });
            }
            next(error);
        }
    };
};

export default validate;