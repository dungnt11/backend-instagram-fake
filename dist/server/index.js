"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_1 = __importDefault(require("next"));
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa2_formidable_1 = __importDefault(require("koa2-formidable"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./Routes/user"));
dotenv_1.default.config();
const { MONGO_USER, MONGO_PASSWORD, MONGO_CONNECTSTRING, PORT, } = process.env;
const staticDirPath = path_1.default.join(__dirname, 'public');
const server = new koa_1.default();
const router = new koa_router_1.default();
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next_1.default({ dev });
const handler = nextApp.getRequestHandler();
/** middleware */
server.use(koa2_formidable_1.default());
server.use(koa_bodyparser_1.default());
server.use(koa_static_1.default(staticDirPath));
(async () => {
    try {
        await nextApp.prepare();
        server
            .use(user_1.default.routes())
            .use(user_1.default.allowedMethods());
        router.get('(.*)', async (ctx) => {
            await handler(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });
        server.use(router.routes());
        await mongoose_1.default
            .connect(MONGO_CONNECTSTRING, {
            user: MONGO_USER,
            pass: MONGO_PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });
        server.listen(PORT, () => {
            console.log(`> Ready on http://localhost:${PORT}`);
        });
    }
    catch (e) {
        console.error(e);
        process.exit();
    }
})();
