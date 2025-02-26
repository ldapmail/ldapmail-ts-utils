import {IIMAPClient, IMAPFlag, ISearchCriteria} from "../interfaces";
import IMAPClientUtils from "../IMAPClientUtils";
import searchForMessagesUID from "./searchForMessagesUID";

export default async function (
    client: IIMAPClient,
    searchFor: ISearchCriteria,
    flags: IMAPFlag[]
): Promise<boolean> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<boolean> => {
        const uidList = await searchForMessagesUID(client, searchFor); // Changes current mailbox

        for (const uid of uidList) {
            const flagsToRemove = flags.map(flag => {
                return `\\${flag.charAt(0).toUpperCase()}${flag.slice(1)}`
            });

            await client.imap.messageFlagsRemove({uid: uid.toString()}, flagsToRemove);
        }

        return true;
    });
}