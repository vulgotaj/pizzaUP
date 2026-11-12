import { hash } from 'bcryptjs';
import { z } from 'zod';
import prismaClient from '../prisma';
import { passwordSchema } from '../schemas/userSchema';

async function main() {
  const input = z.object({
    ACCOUNT_EMAIL: z.email().transform(value => value.toLowerCase()),
    ACCOUNT_PASSWORD: passwordSchema,
    ACCOUNT_NAME: z.string().trim().min(3).max(100).default('Administrador'),
  }).safeParse(process.env);
  if (!input.success) throw new Error('Configure ACCOUNT_EMAIL, ACCOUNT_PASSWORD (12 caracteres, até 72 bytes) e ACCOUNT_NAME.');
  const { ACCOUNT_EMAIL: email, ACCOUNT_PASSWORD: password, ACCOUNT_NAME: name } = input.data;
  const command = process.argv[2];
  if (command === 'create-admin') {
    // The advisory lock serializes concurrent first-admin bootstrap commands.
    await prismaClient.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(71648042)`;
      if (await tx.user.count({ where: { role: 'ADMIN' } })) throw new Error('Já existe um administrador. Bootstrap recusado.');
      await tx.user.create({ data: { name, email, password: await hash(password, 12), role: 'ADMIN' } });
    });
    console.log('Administrador inicial criado.');
  } else if (command === 'reset-password') {
    const user = await prismaClient.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
    if (!user) throw new Error('Usuário não encontrado.');
    await prismaClient.user.update({ where: { id: user.id }, data: { password: await hash(password, 12) } });
    console.log('Senha atualizada.');
  } else throw new Error('Comando inválido.');
}
void main().catch(() => {
  // Avoid dumping Prisma errors, input or credentials from administrative commands.
  console.error('Operação recusada. Confira as variáveis ACCOUNT_*, o comando, o banco e a existência do usuário/administrador.');
  process.exitCode = 1;
}).finally(() => { void prismaClient.$disconnect(); });
