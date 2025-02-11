import IMAPClientUtils from "../IMAPClientUtils";
import {IIMAPClient, IMailResult, IQuotaResult, ISearchCriteria} from "../interfaces";
import {QuotaResponse} from "imapflow";

export default async function (
    client: IIMAPClient
): Promise<IQuotaResult> {
    return await IMAPClientUtils.executeIMAPCommand(client, async (): Promise<IQuotaResult> => {
        const quotaResponse: QuotaResponse | boolean = await client.imap.getQuota('INBOX');

        if ((typeof quotaResponse === 'boolean') || !quotaResponse?.storage)
            throw new Error('Failed to get quota');

        return {
            path: quotaResponse?.path,
            // @ts-expect-error
            usage: quotaResponse?.storage?.usage || 0,
            // @ts-expect-error
            limit: quotaResponse?.storage?.limit || 0,
            // @ts-expect-error
            status: quotaResponse?.storage?.status || '0%'
        } as IQuotaResult;
    });
}

