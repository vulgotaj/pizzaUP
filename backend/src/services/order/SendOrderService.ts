import prismaClient from "../../prisma";

interface SendOrderProps{
  name: string;
  order_id: string;
}

class SendOrderService{
  async execute({ name, order_id }: SendOrderProps){
    try{
      const order = await prismaClient.order.findFirst({
        where:{
          id: order_id
        }
      })

      if(!order){
        throw new Error("Falha ao enviar pedido")
      }

      const updateOrder = await prismaClient.order.update({
        where:{
          id: order_id
        },
        data:{
          draft: false,
          name: name
        },
        select:{
          id: true,
          table: true,
          name: true,
          draft: true,
          status: true,
          createdAt: true
        }
      })

      return updateOrder
    }catch(error){
      throw new Error("Falha ao enviar pedido")
    }
  }
}

export { SendOrderService }