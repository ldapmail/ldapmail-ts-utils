import {IIMAPClient} from "../interfaces";
import getTransport from "./getTransport";
import composeMessage from "./composeMessage";
import saveMessage from "./saveMessage";

export default async function (
    smtpClient: IIMAPClient,
    imapClient: IIMAPClient,
    to: string[], // "bar@localhost, baz@localhost"; To: field
    message: {
        subject: string, // "Hello ✔",
        text: string, // plain text body
        html: string // html body
    },
    cc: string[] = [], // "foo@localhost"; Cc: field
    bcc: string[] = [], // "baz@localhost"; Bcc: field,
    individual: boolean = true, // send individual emails to each recipient from the "to" array
): Promise<string[]> {
    const messageIds = await (async (): Promise<string[]> => {
        const transporter = await getTransport(smtpClient);

        const messageIds = [];
        if (individual) {
            for (const recipient of to) {
                const composedMail = await composeMessage(imapClient, [recipient], message, cc, bcc, undefined);
                const info = await transporter.sendMail(composedMail.mail);

                if (info.messageId && info.response.toString().toLowerCase().includes('ok')) {
                    messageIds.push(info.messageId);
                }
            }

            return messageIds;
        }

        const composedMail = await composeMessage(imapClient, to, message, cc, bcc, undefined);
        const info = await transporter.sendMail(composedMail.mail);

        if (info.messageId && info.response.toString().toLowerCase().includes('ok'))
            return [info.messageId];

        return [];
    })();

    // Add the message to the Sent mailbox
    for(const messageId of messageIds) {
        const composedMail = await composeMessage(imapClient, to, message, cc, bcc, messageId);
        const composedMailBuffer = await composedMail.compile().build();
        await saveMessage(imapClient, 'Sent', composedMailBuffer, ['\\Seen']);
    }

    return messageIds;
}