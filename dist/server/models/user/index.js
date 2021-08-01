"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    disable: { type: Boolean, default: false },
    displayName: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isDisable: { type: Boolean, default: false },
    avatar: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7Aw08EMIINuHN2E_m6rmNBJSn9pdAUsNBKrjMc8SQKeeNjJ_rYdUUGq2QZP3R87Seg_c&usqp=CAU' },
}, { timestamps: true });
exports.default = mongoose_1.model('user', userSchema);
