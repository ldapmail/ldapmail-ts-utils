import {IIMAPClient} from "../interfaces";
import composeMessage from "./composeMessage";
import saveMessage from "./saveMessage";

export default async function (
    imapClient: IIMAPClient,
    to: string[], // "bar@localhost, baz@localhost"; To: field
    message: {
        subject: string, // "Hello ✔",
        text: string, // plain text body
        html: string // html body
    },
    cc: string[] = [], // "foo@localhost"; Cc: field
    bcc: string[] = [], // "baz@localhost"; Bcc: field,
): Promise<void> {
    const composedMail = await composeMessage(imapClient, to, message, cc, bcc, undefined);
    const composedMailBuffer = await composedMail.compile().build();
    await saveMessage(imapClient, 'Drafts', composedMailBuffer, ['\\Seen', '\\Draft']);
}