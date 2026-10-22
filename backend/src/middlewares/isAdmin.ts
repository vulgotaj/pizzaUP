import { Request, Response, NextFunction } from 'express';
import prismaClient from '../prisma';

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.userId;

  if(!userId){
    res.status(401).json({
      error: "Usuário sem permissão"
    });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where:{
      id: userId
    }
  }) as object & { role: string };

  if(!userId){
    res.status(401).json({
      error: "Usuário sem permissão"
    });
    return;
  }

  if(user.role !== "ADMIN"){
    res.status(401).json({
      error: "Usuário sem permissão"
    })
    return;
  }

  next();
}