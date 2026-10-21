import { compare } from 'bcryptjs';
import prismaClient from '../../prisma';
import { sign } from 'jsonwebtoken';

interface AuthUserServiceProps{
  email: string;
  password: string;
}

class AuthUserService{
  async execute({ email, password }: AuthUserServiceProps){

    // Verificar se o email está correto
    const user = await prismaClient.user.findFirst({
      where: {
        email: email
      }
    });

    if (!user) {
      throw new Error("Email ou senha incorretos!");
    }

    // Verificar se a senha está correta
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Email ou senha incorretos!");
    }

    // GERAR TOKEN JWT
    const token = sign({
      name: user.name,
      email: user.email
    }, process.env.JWT_SECRET as string, {
      subject: user.id,
      expiresIn: "30d"
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    }
  }
}

export { AuthUserService }