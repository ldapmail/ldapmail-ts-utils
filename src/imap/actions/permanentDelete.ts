import {IIMAPClient, ISearchCriteria} from "../interfaces";
import IMAPClientUtils from "../IMAPClientUtils";
import searchForMessagesUID from "./searchForMessagesUID";

export default async function (
    client: IIMAPClient,
    searchFor: ISearchCriteria
): Promise<boolean> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<boolean> => {
        const uidList = await searchForMessagesUID(client, searchFor); // Changes current mailbox

        for (const uid of uidList) {
            await client.imap.messageFlagsAdd({uid: uid.toString()}, ['\\Deleted']);
            await client.imap.messageDelete({uid: uid.toString()});
        }

        return true;
    });
}