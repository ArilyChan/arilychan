export function withDefault (_def) {
  return function template (templateStr, ...args) {
    return templateStr.map((template, index) => `${template}${index <= args.length ? args[index] || _def : ''}`).join('')
  }
}
export function html (template, ...args) {
  const defaultToEmptyString = withDefault('')
  if (!Array.isArray(template)) template = [template]
  return template.map((str, i) => {
    const variable = args[i]
    if (Array.isArray(variable)) {
      return defaultToEmptyString`${str}${html(new Array(variable.length).fill(''), ...variable)}`
    }
    if (!variable?.type) return defaultToEmptyString`${str}${variable}`
    switch (variable.type) {
      case 'text':
        return defaultToEmptyString`${str}${variable.data.content}`
      case 'image':
        return defaultToEmptyString/* html */`${str}<img src="${variable.data.url}">`
      default:
        return defaultToEmptyString/* html */`${str}<!-- unknown type: ${variable.type} -->`
    }
  }).join('')
}
