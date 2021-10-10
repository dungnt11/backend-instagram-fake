"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const historySchema = new mongoose_1.Schema({
    myID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    toID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    messenger: String,
}, { timestamps: true });
exports.default = mongoose_1.model('history', historySchema);
