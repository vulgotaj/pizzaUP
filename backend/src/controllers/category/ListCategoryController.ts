import { Request, Response } from 'express';
import { ListCategoryService } from '../../services/category/ListCategoryService';

class ListCategoryController{
  async handle(_req: Request, res: Response){
    const listCategory = new ListCategoryService();

    const categories = await listCategory.execute();

    return res.status(200).json(categories);
  }
}

export { ListCategoryController }
