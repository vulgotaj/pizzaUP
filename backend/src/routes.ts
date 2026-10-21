import { Router } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController'
import { AuthUserController } from './controllers/user/AuthUserController'
import { DetailUserController } from './controllers/user/DetailUserController'
import { CreateCategoryController } from './controllers/category/CreateCategoryController'
import { createUserSchema, authUserSchema } from './schemas/userSchema';
import { validateSchema } from './middlewares/validateSchema';
import { isAuthenticated } from './middlewares/isAuthenticated';

const router = Router();

// Rotas users
router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle);

router.post("/session", validateSchema(authUserSchema), new AuthUserController().handle);

router.get("/me", isAuthenticated, new DetailUserController().handle);


// Rotas category
router.post("/category", isAuthenticated, new CreateCategoryController().handle);

export { router };

