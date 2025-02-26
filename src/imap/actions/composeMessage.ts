import {IIMAPClient} from "../interfaces";
import MailComposer from "nodemailer/lib/mail-composer";

export default async function (
    client: IIMAPClient,
    to: string[],
    message: {
        subject: string,
        text: string,
        html: string
    },
    cc: string[] = [], // "foo@localhost"; Cc: field
    bcc: string[] = [], // "baz@localhost"; Bcc: field,
    messageId?: string
): Promise<MailComposer> {
    return new MailComposer({
        messageId: messageId || undefined,
        from: client.config.user,
        to: to.join(','),
        cc: cc.length > 0 ? cc.join(',') : undefined,
        bcc: bcc.length > 0 ? bcc.join(',') : undefined,
        subject: message.subject,
        text: message.text,
        html: message.html,
    });
}