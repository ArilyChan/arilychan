/// <reference types="koishi/lib" />
import { Command } from 'koishi';
export default function injectOsuOptions<T extends Command>(command: T, options: Array<string | Array<string | Record<any, any>>>): T;
