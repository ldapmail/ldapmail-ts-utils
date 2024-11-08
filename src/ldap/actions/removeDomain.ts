import {ILDAPClient} from "../interfaces";
import LDAPClientUtils from "../LDAPClientUtils";

export default async function (client: ILDAPClient, domain: string): Promise<boolean> {

    const deleteDN = async (dn: string) => {
        const result = await LDAPClientUtils.searchLDAP(client, dn, {
            scope: 'one',
            attributes: ['dn'],
        });

        const searchEntries = result?.searchEntries || [];

        for (const entry of searchEntries) {
            if (entry.dn) await deleteDN(entry.dn);
        }

        await LDAPClientUtils.deleteLDAP(client, dn);
        return true;
    };

    return await LDAPClientUtils.executionWrapper(client, async () => {
        return await deleteDN(`dc=${domain},dc=mail,dc=com`);
    });
}