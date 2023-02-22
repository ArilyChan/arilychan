"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useUtils_1 = require("./useUtils");
const createScope = (ctx, options) => async (disabledFlags = ['nsfw', 'disabled'], section) => {
    const _int = parseInt(section);
    const or = [
        !isNaN(_int) && {
            id: _int
        },
        {
            name: section?.toString()
        }
    ].filter(Boolean);
    const selectedSection = (section && await ctx.database.get('section', {
        $or: or
    }, { limit: 1 }).then(res => res[0])) || false;
    const meals = await ctx.database.get('meal', {
        sectionId: (selectedSection && selectedSection.id) || undefined
    }, ['id', 'flags']);
    const filtered = meals.filter((item) => item.flags.every(flag => !disabledFlags.includes(flag)));
    if (!meals.length)
        return null;
    const randomMeal = (0, useUtils_1.random)(filtered);
    const meal = await ctx.database.get('meal', { id: randomMeal.id }).then(res => res[0]);
    const assets = await ctx.database.get('meal-asset', {
        id: {
            $in: meal.assets.map(parseInt)
        }
    });
    const _section = selectedSection || (meal.sectionId && await ctx.database.get('section', { id: meal.sectionId }).then(res => res[0])) || undefined;
    return {
        ...meal,
        assets: meal.assets.map(aid => assets.find(a => aid === a.id.toString())),
        section: _section
    };
};
exports.default = createScope;
