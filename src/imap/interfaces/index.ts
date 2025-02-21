import {ImapFlow} from "imapflow";
import {ParsedMail} from "mailparser";

export type IIMAPClientUtils = {
    createClient: (config: IIMAPConfig) => IIMAPClient;
    executeIMAPCommand: <T>(client: IIMAPClient, cb: () => Promise<T>) => Promise<T>;
}

export type IIMAPClient = {
    imap: ImapFlow;
    config: IIMAPConfig;
}

export type IIMAPConfig = {
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
    process_batch_size: number;
    process_between_batch_size_delay: number;
}

export type IMailResult = {
    page: number,
    pages: number,
    messages: ParsedMail[]
};

export type IMailboxResult = {
    name: string,
    path: string
};

export type IQuotaResult = {
    path: string,
    usage: number,
    limit: number,
    status: string
};

export type IMAPFlag = "seen" | "answered" | "flagged" | "deleted" | "draft" | "recent";

export type ISearchCriteria = {
    messageId?: string;
    contains?: string;
    mailbox?: string;
    flag?: {
        name: IMAPFlag;
        value: boolean;
        set: boolean;
    };
};