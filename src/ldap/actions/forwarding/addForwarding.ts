import emailParser from "../../../tools/emailParser";
import {ILDAPClient} from "../../interfaces";
import LDAPClientUtils from "../../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, forwardEmail: string): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        const dn = LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`);

        const forwardCheckEntries = await LDAPClientUtils.searchLDAP(client, dn, {
            attributes: ['mail', 'mailForwardingAddress'],
            scope: 'sub',
            filter: `(&(mailForwardingAddress=${forwardEmail})(mail=${email}))`,
            sizeLimit: 1
        });

        // Prevents duplicate
        if (forwardCheckEntries?.searchEntries?.length && forwardCheckEntries.searchEntries.length > 0)
            throw new Error(`Forward email "${forwardEmail}" is already assigned to email "${email}".`);

        await LDAPClientUtils.modifyLDAP(client, dn, [
            {
                type: 'mailForwardingAddress',
                values: [forwardEmail],
            }
        ], 'add');

        return true;
    });
}