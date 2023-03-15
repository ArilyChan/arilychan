import { ReceivedMessage } from '../types';
import * as Receiver from '../cutting-edge-mail-client/receiver';
import * as Sender from '../cutting-edge-mail-client/sender';
import { Bot, Logger, SendOptions, Universal, Fragment } from 'koishi';
import { Bridge } from '../bridge-between-mail-and-message';
import MailClient from '../cutting-edge-mail-client';
import { Options } from '../';
export type Config = Bot.Config & Options;
export declare class MailBot extends Bot {
    logger: Logger;
    client: MailClient;
    bridge: Bridge;
    sender: Sender.BaseSender;
    receiver: Receiver.BaseReceiver;
    _subscriber: this['receivedMessage'];
    constructor(ctx: any, config: Config);
    subscribe(): Promise<void>;
    receivedMessage(message: ReceivedMessage): void;
    sendMessage(channelId: string, content: Fragment): Promise<string[]>;
    sendPrivateMessage(userId: string, content: Fragment, options?: SendOptions): Promise<string[]>;
    stop(): Promise<void>;
    getSelf(): Promise<{
        userId: string;
        username: string | undefined;
    }>;
    getFriendList(): Promise<Universal.User[]>;
    getGuild(guildId: string): Promise<Universal.Guild>;
    getGuildList(): Promise<Universal.Guild[]>;
    getGuildMember(): Promise<{
        userId: string;
    }>;
    getGuildMemberList(): Promise<never[]>;
    getChannel(): Promise<{
        channelId: string;
    }>;
    getChannelList(): Promise<never[]>;
    handleFriendRequest(): Promise<void>;
    handleGuildRequest(): Promise<void>;
    handleGuildMemberRequest(): Promise<void>;
}
