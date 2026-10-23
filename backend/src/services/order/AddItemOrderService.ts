import prismaClient from "../../prisma";

interface ItemProps{
    order_id: string;
    product_id: string;
    amount: number;
}

class AddItemOrderService{
  async execute({ amount, order_id, product_id }: ItemProps){
    try{

      const orderExists = await prismaClient.order.findFirst({
        where:{
          id: order_id
        }
      })

      if(!orderExists){
        throw new Error("Order não encontrada")
      }

      const productExists = await prismaClient.order.findFirst({
        where:{
          id: product_id,
          disabled: false
        }
      })

      if(!productExists){
        throw new Error("Produto não encontrado")
      }
      
      const item = await prismaClient.item.create({
        data:{
          order_id: order_id,
          product_id: product_id,
          amount: amount
        },
        select:{
          id: true,
          amount: true,
          order_id: true,
          product_id: true,
          createdAt: true,
          product:{
            select:{
              id: true,
              name: true,
              price: true,
              description: true,
              banner: true
            }
          }
        }
      })

      return item
    }catch(error){
      console.log(error);
      throw new Error("Falha ao adicionar item no pedido")
    }
  }
}

export { AddItemOrderService }