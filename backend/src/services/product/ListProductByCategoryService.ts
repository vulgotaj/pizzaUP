import prismaClient from "../../prisma/index";

interface ListProductByCategoryServiceProps {
  category_id: string;
}

class ListProductByCategoryService {
  async execute({ category_id }: ListProductByCategoryServiceProps) {
    try {
      // Verifica se a categoria existe
      const category = await prismaClient.category.findUnique({
        where: {
          id: category_id,
        },
      });

      if (!category) {
        throw new Error("Categoria não encontrada!");
      }

      // Busca produtos da categoria (apenas produtos ativos por padrão)
      const products = await prismaClient.product.findMany({
        where: {
          category_id: category_id,
          disabled: false,
        },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          banner: true,
          disabled: true,
          category_id: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return products;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("Falha ao buscar produtos da categoria");
    }
  }
}

export { ListProductByCategoryService };
