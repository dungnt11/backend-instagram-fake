"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const koa_router_1 = __importDefault(require("koa-router"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
const history_1 = __importDefault(require("../models/history"));
const router = new koa_router_1.default({ prefix: '/api' });
dotenv_1.default.config();
router.post('/register', async (ctx) => {
    const { email, password, displayName, avatar, } = ctx.request.body;
    const newUser = new user_1.default({
        email,
        password,
        displayName,
        avatar,
    });
    const userCreated = await newUser.save();
    ctx.status = 200;
    ctx.body = {
        _id: userCreated._id,
        email,
        displayName,
        avatar: userCreated.avatar,
    };
});
router.post('/login', async (ctx) => {
    const { email, password, isAdmin } = ctx.request.body;
    const userDB = await user_1.default.findOne({ email }).lean();
    if (!userDB)
        ctx.throw(404);
    if (userDB.password !== password)
        ctx.throw(404);
    if (userDB.isDisable)
        ctx.throw(404);
    if (typeof isAdmin !== 'undefined' && !userDB.isAdmin)
        ctx.throw(404);
    ctx.status = 200;
    ctx.body = {
        _id: userDB._id,
        email: userDB.email,
        displayName: userDB.displayName,
        avatar: userDB.avatar,
    };
});
router.get('/users', async (ctx) => {
    const usersDB = await user_1.default.find().lean();
    if (!usersDB)
        ctx.throw(404);
    ctx.status = 200;
    ctx.body = usersDB;
});
router.get('/all-post', async (ctx) => {
    const postDB = await post_1.default.find();
    ctx.body = postDB;
});
router.get('/comments/:id', async (ctx) => {
    const { id } = ctx.params;
    const postDB = await post_1.default.findById(id).select(['comments']).lean();
    const contentComment = [];
    await Promise.all(postDB.comments.map(async (postItem) => {
        const userDBItem = await user_1.default.findById(postItem.idUser).lean();
        const commentObj = {
            from: {
                id: userDBItem._id,
                displayName: userDBItem.displayName,
                avatar: userDBItem.avatar,
            },
            text: postItem.comment,
        };
        contentComment.push(commentObj);
    }));
    ctx.body = contentComment;
});
router.get('/feeds/:idUser', async (ctx) => {
    const postUser = await post_1.default.find().lean();
    if (!postUser)
        ctx.throw(404);
    const postsCreate = [];
    await Promise.all(postUser.reverse().map(async (userItem) => {
        const userDB = await user_1.default.findById(userItem.userID).lean();
        if (userDB) {
            postsCreate.push({
                url: `${process.env.TUNNEL_URL}/${userItem.image}`,
                username: userDB.displayName,
                avatar: userDB.avatar,
                status: userItem.status,
                type: userItem.type,
                likes: userItem.likes,
                id: userItem._id,
                userID: userItem.userID,
                comments: { count: userItem.comments.length },
            });
        }
    }));
    ctx.body = postsCreate;
});
router.get('/users/self/:id', async (ctx) => {
    const { id } = ctx.params;
    const UserDB = await user_1.default.findById(id).lean();
    const postsDB = await post_1.default.find({ userID: mongoose_1.Types.ObjectId(id) }).lean();
    if (UserDB) {
        ctx.body = {
            profile_picture: UserDB.avatar,
            data: postsDB.map((postItem) => (Object.assign(Object.assign({}, postItem), { image: `${process.env.TUNNEL_URL}/${postItem.image}` }))),
        };
    }
});
router.get('/test', async (ctx) => {
    ctx.body = 'Hello world!';
});
router.post('/create-post', async (ctx) => {
    const { body, files } = ctx.request;
    if (!body._id)
        ctx.throw(404);
    const userDB = await user_1.default.findById(body._id).lean();
    if (!userDB)
        ctx.throw(404);
    if (files) {
        const dirSaveFile = path_1.default.join(__dirname, '/../../server/public');
        child_process_1.execSync(`mv ${files.file.path} ${dirSaveFile}/${files.file.name}`);
        const postContent = {
            userID: userDB._id,
            image: files.file.name,
            status: body.status,
            width: body.width,
            height: body.height,
            type: body.type,
        };
        const postDB = new post_1.default(postContent);
        const postDBCreated = await postDB.save();
        ctx.body = Object.assign(postContent, {
            _id: postDBCreated._id,
            image: `${process.env.TUNNEL_URL}/${files.file.name}`,
            updatedAt: postDBCreated.updatedAt,
        });
    }
});
router.get('/reaction/:idPost/:idUser', async (ctx) => {
    const { idPost, idUser } = ctx.params;
    const postDB = await post_1.default.findById(idPost).lean();
    if (!postDB)
        ctx.throw(404);
    if (postDB.likes.includes(idUser)) {
        // dislike
        const newPostLikeDB = postDB.likes.filter((postID) => postID !== idUser);
        await post_1.default.findByIdAndUpdate(idPost, { likes: newPostLikeDB });
    }
    else {
        const newPostLikeDB = postDB.likes.concat([idUser]);
        await post_1.default.findByIdAndUpdate(idPost, { likes: newPostLikeDB });
        // history
        await history_1.default.findOneAndUpdate({
            myID: String(idUser),
            toID: String(postDB.userID),
        }, {
            myID: idUser,
            toID: String(postDB.userID),
            messenger: 'Đã thích bài viết của bạn',
        }, { upsert: true });
    }
    ctx.status = 200;
});
router.post('/comment/:idPost/:idUser', async (ctx) => {
    const { idPost, idUser } = ctx.params;
    const { comment } = ctx.request.body;
    const commentObj = {
        comment,
        idUser,
    };
    const postDBUpdate = await post_1.default.findByIdAndUpdate(idPost, { $push: { comments: commentObj } }, { new: true });
    const contentComment = [];
    await Promise.all(postDBUpdate.comments.map(async (postItem) => {
        const userDBItem = await user_1.default.findById(postItem.idUser).lean();
        const commentObjPush = {
            from: {
                id: userDBItem._id,
                displayName: userDBItem.displayName,
                avatar: userDBItem.avatar,
            },
            text: postItem.comment,
        };
        contentComment.push(commentObjPush);
    }));
    // history
    await history_1.default.findOneAndUpdate({
        myID: String(idUser),
        toID: String(postDBUpdate.userID),
    }, {
        myID: idUser,
        toID: String(postDBUpdate.userID),
        messenger: 'Đã comment bài viết của bạn',
    }, { upsert: true });
    ctx.body = contentComment;
});
router.get('/video/:url', async (ctx) => {
    const { url } = ctx.params;
    const src = fs_1.default.createReadStream(`/home/dung/instagram-app/public/${url}`);
    const videoSize = fs_1.default.statSync(`/home/dung/instagram-app/public/${url}`);
    ctx.status = 304;
    console.log(videoSize.size);
    ctx.header['content-length'] = String(videoSize.size);
    ctx.body = src;
});
router.post('/user-admin', async (ctx) => {
    const { email, password } = ctx.request.body;
    const userDB = await user_1.default.findOne({ email, isAdmin: true, password }).lean();
    if (!userDB)
        ctx.throw(404);
    if (userDB) {
        ctx.status = 200;
    }
});
router.get('/toggle-user/:idUser', async (ctx) => {
    const { idUser } = ctx.params;
    const currentUserDB = await user_1.default.findById(idUser).lean();
    const userDB = await user_1.default.findByIdAndUpdate(idUser, { isDisable: !currentUserDB.isDisable }, { new: true });
    ctx.body = userDB;
});
router.get('/friend', async (ctx) => {
    const allUser = await user_1.default.find().select(['avatar', 'displayName']).lean();
    ctx.body = allUser;
});
router.get('/history/:id', async (ctx) => {
    const id = ctx.params.id;
    const historyByID = await history_1.default.find({
        toID: id,
    })
        .populate('myID', 'displayName avatar', user_1.default)
        .populate('toID', 'displayName avatar', user_1.default);
    ctx.body = historyByID;
});
exports.default = router;
