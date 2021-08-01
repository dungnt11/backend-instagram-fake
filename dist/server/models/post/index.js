"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    userID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shop', required: true },
    image: { type: String, default: '' },
    status: { type: String, default: '' },
    width: { type: Number, require: true },
    height: { type: Number, require: true },
    likes: { type: Array, default: [] },
    comments: { type: Array, default: [] },
    type: String,
}, { timestamps: true });
exports.default = mongoose_1.model('post', postSchema);
