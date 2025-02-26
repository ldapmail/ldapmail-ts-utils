import {IIMAPClient} from "../interfaces";
import IMAPClientUtils from "../IMAPClientUtils";

export default async function (
    client: IIMAPClient,
    mailbox: string, // Mailbox to save the message to
    message: string | Buffer, // Properly formatted email message
    flags: string[] = [] // Flags to apply to the message
): Promise<boolean> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<boolean> => {
        await client.imap.mailboxOpen(mailbox);
        const result = await client.imap.append(mailbox, message, flags);
        return result?.destination === mailbox;
    });
}