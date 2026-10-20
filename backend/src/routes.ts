import { Router } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController'
import { createUserSchema } from './schemas/userSchema';
import { validateSchema } from './middlewares/validateSchema';

const router = Router();

router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle);

export { router };

