import prismaClient from "../../prisma"

interface RemoveItemProps {
  item_id: string
}

class RemoveItemOrderService {
  async execute({ item_id }: RemoveItemProps) {
    try{
      const itemExists = await prismaClient.item.findFirst({
        where: {
          id: item_id,
        },
      });

      if (!itemExists) {
        throw new Error("Item não encontrado")
      }

      await prismaClient.item.delete({
        where: {
          id: item_id,
        },
      });

      return { message: "Item removido com sucesso!" }

    }catch(error){
      throw new Error("Falha ao remover item do pedido")
    }
  }
}

export { RemoveItemOrderService }
