import IMAPClientUtils from "../IMAPClientUtils";
import {IIMAPClient, IMailboxResult} from "../interfaces";

export default async function (
    client: IIMAPClient
): Promise<IMailboxResult[]> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<IMailboxResult[]> => {
        return ((await client.imap.listTree())?.folders ?? []).map((mailbox) => ({
            name: mailbox.name,
            path: mailbox.path
        }));
    });
}