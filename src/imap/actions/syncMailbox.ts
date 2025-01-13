import IMAPClientUtils from "../IMAPClientUtils";
import {IIMAPClient} from "../interfaces";

// How much messages to fetch at once. The bigger the number, the faster the sync, but the more memory it consumes.
const DEFAULT_MESSAGES_BATCH_SIZE = 10;

export default async function (
    targetClient: IIMAPClient,
    sourceClient: IIMAPClient,
    messagesBatchSize: number = DEFAULT_MESSAGES_BATCH_SIZE
): Promise<boolean> {
    return await IMAPClientUtils.executeIMAPCommand(targetClient, async (): Promise<boolean> => {
        return await IMAPClientUtils.executeIMAPCommand(sourceClient, async (): Promise<boolean> => {
            const mailboxes = await sourceClient.imap.list();

            // Create mailbox in the target account if it doesn't exist
            for (const mailbox of mailboxes) {
                const path = mailbox.path;
                const createResponse = await targetClient.imap.mailboxCreate(path);
                console.log(createResponse.created ? `Created mailbox: ${path}` : `Mailbox already exists: ${path}`);
            }

            // Sync messages from source to target
            for (const mailbox of mailboxes) {
                const path = mailbox.path;

                await sourceClient.imap.mailboxOpen(path, {readOnly: true});
                await targetClient.imap.mailboxOpen(path);

                const mailboxStatus = await sourceClient.imap.status(path, {messages: true});
                if (mailboxStatus.messages === 0) {
                    console.log(`The mailbox ${path} is empty.`);
                    continue;
                }

                // Fetch all message UIDs from the source mailbox
                const sourceMessageUids: number[] = [];
                for await (const msg of sourceClient.imap.fetch('1:*', {uid: true}, {uid: true})) {
                    if (msg.uid) {
                        sourceMessageUids.push(msg.uid);
                    }
                }

                // Fetch all message IDs from the target mailbox for deduplication
                const existingMessageIds = new Set<string>();
                for await (const msg of targetClient.imap.fetch('1:*', {envelope: true}, {uid: true})) {
                    if (msg.envelope?.messageId) {
                        existingMessageIds.add(msg.envelope.messageId);
                    }
                }

                for (let i = 0; i < sourceMessageUids.length; i += messagesBatchSize) {
                    const batchUids = sourceMessageUids.slice(i, i + messagesBatchSize);
                    const fetchRange = batchUids.join(',');

                    const messages = sourceClient.imap.fetch(fetchRange, {
                        envelope: true,
                        flags: true,
                        source: true
                    }, {
                        uid: true
                    });

                    for await (const message of messages) {
                        const messageId = message.envelope?.messageId;
                        if (messageId && existingMessageIds.has(messageId)) {
                            console.log(`Skipping duplicate message ${path}: ${messageId}`);
                            continue;
                        }

                        const flagsArray: string[] = message.flags ? Array.from(message.flags) : [];
                        await targetClient.imap.append(path, message.source, flagsArray, message.internalDate);
                        console.log(`Copied message: ${messageId}`);
                    }
                }
            }

            return true;
        });
    });
}