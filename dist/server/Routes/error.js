"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { NODE_ENV } = process.env;
exports.default = () => async (ctx, next) => {
    try {
        await next();
    }
    catch (error) {
        console.error(error);
        const errCode = error.status || 500;
        ctx.status = errCode;
        const isDev = NODE_ENV === 'development';
        const errorName = isDev ? error.toString() : 'Server error, contact: nihilism.core@gmail.com, thank you so much ♥️';
        ctx.status = errCode;
        ctx.body = { msg: errorName };
    }
};
