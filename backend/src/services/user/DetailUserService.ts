import prismaClient from "../../prisma";


class DetailUserService{
  async execute(userId: string){

    try{
      const user = await prismaClient.user.findFirst({
        where:{
          id: userId
        },
        select:{
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
      });

      if(!user){
        throw new Error("Usuário não encontrado");
      }

      return user;
    }catch(error){
      console.log(error);
      throw new Error("Usuário não encontrado");
    }

    
  }
}

export { DetailUserService }