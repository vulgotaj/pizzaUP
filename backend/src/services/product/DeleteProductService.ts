import prismaClient from '../../prisma';

interface DeleteProductServiceProps { product_id: string; }
class DeleteProductService {
  async execute({ product_id }: DeleteProductServiceProps) {
    await prismaClient.product.update({ where: { id: product_id }, data: { disabled: true } });
    return { message: 'Produto arquivado com sucesso!' };
  }
}
export { DeleteProductService };
