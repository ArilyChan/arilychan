import path from 'path'
import fs from 'fs'
import peggy from 'peggy'

export const parser = peggy.generate(fs.readFileSync(path.join(__dirname, 'a.pegjs'), { encoding: 'utf8' }))
