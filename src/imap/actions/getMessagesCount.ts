import IMAPClientUtils from "../IMAPClientUtils";
import {IIMAPClient, IMailResult, ISearchCriteria} from "../interfaces";

export default async function (
    client: IIMAPClient,
    searchFor: ISearchCriteria,
): Promise<number> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<number> => {
        if(searchFor.mailbox) await client.imap.mailboxOpen(searchFor.mailbox);

        let query: any = {};
        if (searchFor.messageId) query = {
            ...query,
            header: {...(query?.header || {}), 'message-id': searchFor.messageId}
        };
        if (searchFor.contains) query = {...query, body: searchFor.contains};
        if (searchFor.flag) query = {...query, [searchFor.flag.name]: searchFor.flag.value};

        let uidList = await client.imap.search(query, {
            uid: true
        });

        return uidList.length;
    });
}