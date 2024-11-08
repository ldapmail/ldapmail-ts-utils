import {ImapFlow} from 'imapflow';
import {IIMAPClient, IIMAPClientUtils, IIMAPConfig} from "./interfaces";

const createClient = (config: IIMAPConfig): IIMAPClient => {
    return {
        imap: new ImapFlow({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.password
            }
        }),
        config: config
    };
};

const executeIMAPCommand = async <T>(client: IIMAPClient, cb: () => Promise<T>): Promise<T> => {
    await client.imap.connect();

    let lock = await client.imap.getMailboxLock('INBOX');
    try {
        return await cb();
    } finally {
        lock.release();
        await client.imap.logout();
    }
}

export default {
    createClient,
    executeIMAPCommand,
} as IIMAPClientUtils;