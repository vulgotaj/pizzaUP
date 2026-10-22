import { Request, Response } from 'express';
import { ListProductsService } from '../../services/product/ListProductsService';

class ListProductsController{
  async handle(req: Request, res: Response){
    const disabled = req.query.disabled as string | undefined;

    const listProducts = new ListProductsService();

    const products = await listProducts.execute({
      disabled: disabled
    });

    return res.status(200).json(products);
  }
}

export { ListProductsController }
