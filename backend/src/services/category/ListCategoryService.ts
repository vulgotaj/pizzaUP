import prismaClient from "../../prisma";

class ListCategoryService{
  async execute(){

    try{
      const categories = await prismaClient.category.findMany({
        select:{
          id: true,
          name: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return categories;
    }catch(error){
      throw new Error("Falha ao buscar categorias")
    }
    
  }
}

export { ListCategoryService }
