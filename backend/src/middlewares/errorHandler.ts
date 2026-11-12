import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { AppError } from '../errors/AppError';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (error instanceof MulterError) {
    res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: 'Upload inválido ou acima do limite permitido.' });
    return;
  }
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  if (code === 'P2002') { res.status(409).json({ error: 'Já existe um registro com esses dados.' }); return; }
  if (code === 'P2025') { res.status(404).json({ error: 'Registro não encontrado.' }); return; }
  const type = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined;
  if (type === 'entity.parse.failed' || type === 'encoding.unsupported' || type === 'entity.too.large') {
    res.status(type === 'entity.too.large' ? 413 : type === 'encoding.unsupported' ? 415 : 400)
      .json({ error: 'Corpo da requisição inválido ou não suportado.' });
    return;
  }
  // Messages/stacks can contain connection strings, query parameters or tokens.
  console.error(JSON.stringify({ event: 'request_failed', type: error instanceof Error ? error.name : 'UnknownError' }));
  res.status(500).json({ error: 'Erro interno do servidor.' });
};
