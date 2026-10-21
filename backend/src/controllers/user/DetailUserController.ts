import { Request, Response } from 'express'
import { DetailUserService } from '../../services/user/DetailUserService';

class DetailUserController{
  async handle(req: Request, res: Response){
    const userId = req.userId;
    
    const detailUser = new DetailUserService();

    const user = await detailUser.execute(userId);

    return res.json(user);
  }
}

export { DetailUserController }