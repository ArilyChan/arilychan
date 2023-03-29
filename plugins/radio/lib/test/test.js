'use strict'

import Arg from '../bin/command/arg'
import { createInterface } from 'readline'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})
rl.on('line', async (line) => {
  try {
    const command = line.trim().split(' ').filter(item => item !== '')
    if (command.length < 1) return
    if (command[0].substring(0, 1) !== '!' && command[0].substring(0, 1) !== '！') return
    if (command[0].length < 2) return
    const act = command[0].substring(1)
    if (act === 'dg') {
      const arg = command.slice(1).join(' ')
      const beatmapInfo = await new Arg(arg).getBeatmapInfo()
      console.log('sid:' + beatmapInfo.sid)
      console.log('mp3: ' + beatmapInfo.fullMp3)
    }
  } catch (ex) {
    console.log(ex)
  }
})
