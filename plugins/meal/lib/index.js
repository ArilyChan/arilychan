"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const koishi_1 = require("koishi");
const declares_1 = require("./declares");
exports.name = 'meal';
exports.schema = koishi_1.Schema.object({});
function apply(ctx, options) {
    ctx.model.extend('meal', {
        id: declares_1.idType,
        name: 'string',
        assets: 'list',
        description: 'list',
        'source.user': 'char',
        'source.channel': 'char',
        'source.platform': 'char',
        flags: 'list',
        sectionId: declares_1.idType
    }, {
        foreign: {
            sectionId: ['section', 'id']
            // source: {
            //   user: ['user', 'id']
            // },
            // 'source.user': ['user', 'id']
        }
    });
    ctx.model.extend('section', {
        id: declares_1.idType,
        name: 'string',
        assets: 'list',
        description: 'list',
        flags: 'list'
    });
    ctx.model.extend('course', {
        id: declares_1.idType,
        name: 'string',
        flags: 'list'
    });
    ctx.model.extend('meal-asset', {
        id: declares_1.idType,
        file: 'string',
        base64: 'string'
    });
    ctx.model.extend('course-item', {
        id: declares_1.idType,
        courseId: declares_1.idType,
        type: 'char',
        mealId: declares_1.idType
    }, {
        foreign: {
            courseId: ['course', 'id'],
            mealId: ['meal', 'id']
        }
    });
}
exports.apply = apply;
