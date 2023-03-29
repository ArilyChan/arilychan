/// <reference types="node" />
import fs from 'fs';
import { Context, Session } from 'koishi';
declare class EventsJsonUtils {
    readJson(file: fs.PathOrFileDescriptor): any;
    writeJson(file: fs.PathOrFileDescriptor, eventsJson: any): void;
    addPendingEvent(meta: Session, file: fs.PathOrFileDescriptor, pendingActivity: {
        name: string;
        good: string;
        bad: string;
    }): Promise<boolean>;
    delPendingEvent(meta: Session, file: fs.PathOrFileDescriptor, name: string): Promise<"读取活动文件失败" | "找不到任何待审核活动" | "找不到该待审核活动" | "已删除该待审核活动">;
    addEvent(meta: Session, file: fs.PathOrFileDescriptor, name: string, good: string, bad: string, fromPending?: boolean): Promise<"读取活动文件失败" | "待审核活动中找不到该活动" | "添加成功" | "修改成功">;
    delEvent(meta: Session, file: fs.PathOrFileDescriptor, name: string, fromPending?: boolean): Promise<"读取活动文件失败" | "找不到该事件" | "删除成功">;
    runAdd(meta: Session, eventPath: fs.PathOrFileDescriptor, users: any, name: string, good: string, bad: string, app: Context): Promise<any[] | "读取活动文件失败" | "待审核活动中找不到该活动" | "添加成功" | "修改成功" | "抱歉，我讨厌你">;
    runDel(meta: Session, eventPath: fs.PathOrFileDescriptor, users: any, name: string): Promise<"读取活动文件失败" | "找不到该事件" | "删除成功" | "抱歉，您没有权限，无法删除活动">;
    confirmPendingEvent(meta: Session, eventPath: fs.PathOrFileDescriptor, users: any, name: string): Promise<"读取活动文件失败" | "待审核活动中找不到该活动" | "添加成功" | "修改成功" | "抱歉，您没有审核权限">;
    refusePendingEvent(meta: Session, eventPath: fs.PathOrFileDescriptor, users: any, name: string): Promise<"读取活动文件失败" | "找不到任何待审核活动" | "找不到该待审核活动" | "已删除该待审核活动" | "抱歉，您没有审核权限">;
    showPendingEvent(meta: Session, eventPath: fs.PathOrFileDescriptor): Promise<string>;
    showEvent(meta: Session, eventPath: fs.PathOrFileDescriptor, name: string): Promise<string>;
}
export default EventsJsonUtils;
