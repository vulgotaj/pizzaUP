import { Router } from 'express'
import multer from 'multer'
import uploadConfig from './config/multer'
import { CreateUserController } from './controllers/user/CreateUserController'
import { AuthUserController } from './controllers/user/AuthUserController'
import { DetailUserController } from './controllers/user/DetailUserController'
import { CreateCategoryController } from './controllers/category/CreateCategoryController'
import { ListCategoryController } from './controllers/category/ListCategoryController'
import { CreateProductController } from './controllers/product/CreateProductController'
import { ListProductsController } from './controllers/product/ListProductsController'
import { DeleteProductController } from './controllers/product/DeleteProductController'
import { createUserSchema, authUserSchema } from './schemas/userSchema';
import { createProductSchema, listProductsSchema } from './schemas/productSchema'
import { createCategorySchema } from './schemas/categorySchema';
import { validateSchema } from './middlewares/validateSchema';
import { isAuthenticated } from './middlewares/isAuthenticated';
import { isAdmin } from './middlewares/isAdmin'

const router = Router();
const upload = multer(uploadConfig)

// Rotas users
router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle);

router.post("/session", validateSchema(authUserSchema), new AuthUserController().handle);

router.get("/me", isAuthenticated, new DetailUserController().handle);


// Rotas category
router.post("/category", isAuthenticated, isAdmin, validateSchema(createCategorySchema), new CreateCategoryController().handle);
router.get("/category", isAuthenticated, new ListCategoryController().handle);

// Rotas product
router.get("/products", isAuthenticated, validateSchema(listProductsSchema), new ListProductsController().handle);
router.post("/product", isAuthenticated, isAdmin, upload.single('file'), validateSchema(createProductSchema), new CreateProductController().handle)
router.delete("/product", isAuthenticated, isAdmin, new DeleteProductController().handle)
export { router };
