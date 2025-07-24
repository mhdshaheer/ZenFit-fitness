import { Container } from "inversify";
import { TYPES } from "./types/inversify.types";

import { AdminController } from "./controllers/implimentation/admin.controller";
import { AdminService } from "./services/implimentation/admin.service";
import { AuthService } from "./services/implimentation/auth.service";
import { AuthController } from "./controllers/implimentation/auth.controller";

const container = new Container();

container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

container.bind<AdminService>(TYPES.AdminService).to(AdminService);
container.bind<AdminController>(TYPES.AdminController).to(AdminController);

export { container };
