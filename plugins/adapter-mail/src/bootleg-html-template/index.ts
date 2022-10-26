export function html (template, ...args) {
  if (!Array.isArray(template)) template = [template]
  return template.map((str, i) => {
    const variable = args[i]
    if (Array.isArray(variable)) {
      return `${str}${html(new Array(variable.length).fill(''), ...variable)}`
    }
    if (!variable?.type) return `${str}${variable}`
    switch (variable.type) {
      case 'text':
        return `${str}${variable.data.content}`
      case 'image':
        return /* html */`${str}<img src="${variable.data.url}">`
      default:
        return /* html */`${str}<!-- unknown type: ${variable.type} -->`
    }
  }).join('')
}
