"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMealDescription = exports.courseType = void 0;
exports.courseType = {
    appetizer: '🍮',
    soup: '🥣',
    'main-dish': '🍽️',
    desert: '🧁'
};
const renderMealDescription = (stringTemplate, assets) => {
    return stringTemplate.reduce((acc, item, index) => {
        return (acc +
            item +
            (assets[index] &&
                /* html */ `<image url=${assets[index].file || assets[index].base64 || ''}></image>`) || '');
    }, '');
};
exports.renderMealDescription = renderMealDescription;
exports.default = (ctx, options) => (as) => {
    if (as === 'element') {
        return {
            meal(m) {
                if (!m)
                    return 'sth. went wrong';
                return /* html */ `
              <text>今天吃 ${m.name}</text>
              <text>${(0, exports.renderMealDescription)(m.description, m.assets)}</text>
            `;
            },
            course(c) {
                if (!c)
                    return 'sth. went wrong';
                return /* html */ `
              <p>今天吃 ${c.name}</p>
              ${c.compositions.map(course => course.meal && /* html */ `
                <p>
                  <text>${exports.courseType[course.type]} ${course.meal.name}</text>
                  <text>${(0, exports.renderMealDescription)(course.meal.description, course.meal.assets)}</text>
                </p>
              `).filter(Boolean)}
            `;
            }
        };
    }
    else if (as === 'string') {
        return {
            meal(m) {
                if (!m)
                    return 'sth. went wrong';
                return [
                    `今天吃 ${m.name}`,
                    m.description.join('\n')
                ].join('\n');
            },
            course(c) {
                if (!c)
                    return 'sth. went wrong';
                return [
                    `今天吃 ${c.name}`,
                    ...c.compositions.map(course => (course.meal && [
                        `${exports.courseType[course.type]} ${course.meal.name}`,
                        course.meal.description.join('\n')
                    ]) || [])
                ].join('\n');
            }
        };
    }
};
