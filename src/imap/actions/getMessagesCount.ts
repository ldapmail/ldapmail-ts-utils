import IMAPClientUtils from "../IMAPClientUtils";
import {IIMAPClient, IMailResult, ISearchCriteria} from "../interfaces";
import searchForMessagesUID from "./searchForMessagesUID";

export default async function (
    client: IIMAPClient,
    searchFor: ISearchCriteria,
): Promise<number> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<number> => {
        const uidList = await searchForMessagesUID(client, searchFor); // Changes current mailbox

        return uidList.length;
    });
}