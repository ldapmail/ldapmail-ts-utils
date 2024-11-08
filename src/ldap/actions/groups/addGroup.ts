import emailParser from "../../../tools/emailParser";
import {ILDAPClient} from "../../interfaces";
import LDAPClientUtils from "../../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, group: string): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        // Check if the alias is from the same domain.
        if (!client.config.crossDomainGroups) {
            const groupDomain = emailParser(group).domain;

            if (groupDomain !== domain)
                throw new Error(`Group "${group}" is not from the same domain as the email "${email}".`);
        }

        const groupCheckEntries = await LDAPClientUtils.searchLDAP(client, client.config.baseDN, {
            attributes: ['mail', 'mailGroupMember'],
            scope: 'sub',
            filter: `(|(mailGroupMember=${group})(mail=${group}))`,
            sizeLimit: 1
        });

        // Prevents duplicate aliases across email accounts
        if (groupCheckEntries?.searchEntries?.length && groupCheckEntries.searchEntries.length > 0)
            throw new Error(`Group "${group}" is already assigned.`);

        await LDAPClientUtils.modifyLDAP(client, LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`), [
            {
                type: 'mailGroupMember',
                values: [group],
            }
        ], 'add');

        return true;
    });
}