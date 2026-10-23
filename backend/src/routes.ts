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
import { CreateOrderController } from './controllers/order/CreateOrderController'
import { createUserSchema, authUserSchema } from './schemas/userSchema';
import { createProductSchema, listProductByCategorySchema, listProductsSchema } from './schemas/productSchema'
import { createCategorySchema } from './schemas/categorySchema';
import { addItemSchema, createOrderSchema, deleteOrderSchema, detailOrderSchema, finishOrderSchema, removeItemSchema, sendOrderSchema } from './schemas/orderSchema'
import { validateSchema } from './middlewares/validateSchema';
import { isAuthenticated } from './middlewares/isAuthenticated';
import { isAdmin } from './middlewares/isAdmin'
import { ListOrdersController } from './controllers/order/ListOrdersController'
import { AddItemController } from './controllers/order/AddItemController'
import { RemoveItemController } from './controllers/order/RemoveItemController'
import { DetailOrderController } from './controllers/order/DetailOrderController'
import { SendOrderController } from './controllers/order/SendOrderController'
import { FinishOrderController } from './controllers/order/FinishOrderController'
import { DeleteOrderController } from './controllers/order/DeleteOrderController'

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
router.get("/category/product", isAuthenticated, validateSchema(listProductByCategorySchema), new ListProductsController().handle)

// Rotas order
router.post("/order", isAuthenticated, validateSchema(createOrderSchema), new CreateOrderController().handle)
router.get("/orders", isAuthenticated, new ListOrdersController().handle)
router.get("/order/detail", isAuthenticated, validateSchema(detailOrderSchema), new DetailOrderController().handle)
router.put("/order/send", isAuthenticated, validateSchema(sendOrderSchema), new SendOrderController().handle)
router.put("/order/finish", isAuthenticated, validateSchema(finishOrderSchema), new FinishOrderController().handle)
router.delete("/order", isAuthenticated, validateSchema(deleteOrderSchema), new DeleteOrderController().handle)

// Adicionar item a order

router.post("/order/add", isAuthenticated, validateSchema(addItemSchema), new AddItemController().handle)

// Remover item da order

router.delete("/order/remove", isAuthenticated, validateSchema(removeItemSchema), new RemoveItemController().handle)

export { router };
