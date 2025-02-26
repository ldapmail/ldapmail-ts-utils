import {simpleParser} from "mailparser";
import IMAPClientUtils from "../IMAPClientUtils";
import {IIMAPClient, IMailResult, ISearchCriteria} from "../interfaces";
import delay from "../../tools/delay";
import searchForMessagesUID from "./searchForMessagesUID";

export default async function (
    client: IIMAPClient,
    searchFor: ISearchCriteria,
    page: number = 1,
    pageSize: number = 20,
    order: "asc" | "desc" = "desc"
): Promise<IMailResult> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<IMailResult> => {
        if (searchFor.mailbox) await client.imap.mailboxOpen(searchFor.mailbox);

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

        uidList = !uidList ? [] : uidList.sort((a, b) => order === 'asc' ? a - b : b - a);

        const pages: number = Math.ceil(uidList.length / pageSize) || 1;

        if (page == 0) {
            throw new Error('Page number must be 1 or greater');
        }

        if (page > pages) {
            return {
                page,
                pages,
                messages: []
            }
        }

        const start = (page - 1) * pageSize;
        const uidRange = order === 'asc' ? uidList.slice(start, start + pageSize) : uidList.slice(start, start + pageSize).reverse();

        const messages = (await client.imap.fetchAll({
            ...query,
            uid: uidRange.join(','),
        }, {
            uid: true,
            source: true
        }, {
            uid: true
        }));

        if (messages.length === 0) return {
            page,
            pages,
            messages: []
        };

        const parsedMessages = (await processInBatches(client, searchFor, messages, client.config.process_batch_size));

        return {
            page,
            pages,
            messages: order === 'asc' ? parsedMessages : parsedMessages.reverse()
        }
    });
}

async function processInBatches(client: IIMAPClient, searchFor: ISearchCriteria, messages: any[], batchSize: number): Promise<any[]> {
    const results: any[] = [];
    for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (message) => {

                const parsedMessage = await simpleParser(message.source);

                if (searchFor?.flag?.name && searchFor?.flag?.set === true) {
                    await client.imap.messageFlagsAdd(
                        message.uid.toString(),
                        [`\\${searchFor.flag.name.charAt(0).toUpperCase()}${searchFor.flag.name.slice(1)}`],
                        {uid: true}
                    );
                }

                if (searchFor?.flag?.name && searchFor?.flag?.set === false) {
                    await client.imap.messageFlagsRemove(
                        message.uid.toString(),
                        [`\\${searchFor.flag.name.charAt(0).toUpperCase()}${searchFor.flag.name.slice(1)}`],
                        {uid: true}
                    );
                }

                return parsedMessage;
            })
        );
        results.push(...batchResults);

        await delay(client.config.process_between_batch_size_delay);
    }

    return results;
}