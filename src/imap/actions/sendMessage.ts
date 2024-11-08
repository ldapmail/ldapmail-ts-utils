import IMAPClientUtils from "../IMAPClientUtils";
import {IIMAPClient} from "../interfaces";

export default async function (
    client: IIMAPClient,
    message: {
        from: string,
        to: string,
        subject: string,
        text: string,
        html: string
    }
): Promise<boolean> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<boolean> => {

        // @TODO: Implement sending email

        return true;
    });
}