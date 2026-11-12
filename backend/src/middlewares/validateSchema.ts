import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

export const validateSchema = 
  (schema: ZodType) => async (req: Request, res: Response, next: NextFunction) => {
    try{
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      }) as { body?: unknown };
      if (parsed.body !== undefined) req.body = parsed.body;

      return next();
    }catch(error){
      if(error instanceof ZodError) {
        return res.status(400).json({
          error: "Erro validação",
          details: error.issues.map( issue => ({
            message: issue.message
          }))
        })
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      })

    }
}
