import {IIMAPClient} from "../interfaces";
import getTransport from "./getTransport";

export default async function (
    client: IIMAPClient,
    to: string[], // "bar@localhost, baz@localhost"; To: field
    message: {
        subject: string, // "Hello ✔",
        text: string, // plain text body
        html: string // html body
    },
    individual: boolean = true // send individual emails to each recipient from the "to" array
): Promise<string[]> {
    const transporter = await getTransport(client);

    const messageIds = [];
    if (individual) {
        for (const recipient of to) {
            const info = await transporter.sendMail({
                from: client.config.user,
                to: recipient,
                subject: message.subject,
                text: message.text,
                html: message.html,
            });

            messageIds.push(info.messageId);
        }

        return messageIds;
    }

    const info = await transporter.sendMail({
        from: client.config.user,
        to: to.join(','),
        subject: message.subject,
        text: message.text,
        html: message.html,
    });

    return [info.messageId];
}