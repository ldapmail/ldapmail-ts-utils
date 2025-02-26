import {IIMAPClient, IMAPFlag, ISearchCriteria} from "../interfaces";
import IMAPClientUtils from "../IMAPClientUtils";
import searchForMessagesUID from "./searchForMessagesUID";

export default async function (
    client: IIMAPClient,
    searchFor: ISearchCriteria,
    flags: IMAPFlag[]
): Promise<void> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<void> => {
        const uidList = await searchForMessagesUID(client, searchFor); // Changes current mailbox

        for (const uid of uidList) {
            const flagsToAdd = flags.map(flag => {
                return `\\${flag.charAt(0).toUpperCase()}${flag.slice(1)}`
            });

            await client.imap.messageFlagsAdd({uid: uid.toString()}, flagsToAdd, {uid: true});
        }
    });
}