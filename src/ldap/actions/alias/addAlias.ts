import emailParser from "../../../tools/emailParser";
import {ILDAPClient} from "../../interfaces";
import LDAPClientUtils from "../../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, alias: string): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        // Check if the alias is from the same domain.
        if (!client.config.crossDomainAliases) {
            const aliasDomain = emailParser(alias).domain;

            if (aliasDomain !== domain)
                throw new Error(`Alias "${alias}" is not from the same domain as the email "${email}".`);
        }

        const aliasCheckEntries = await LDAPClientUtils.searchLDAP(client, client.config.baseDN, {
            attributes: ['mail', 'mailAlias'],
            scope: 'sub',
            filter: `(|(mailAlias=${alias})(mail=${alias}))`,
            sizeLimit: 1
        });

        // Prevents duplicate aliases across email accounts
        if (aliasCheckEntries?.searchEntries?.length && aliasCheckEntries.searchEntries.length > 0)
            throw new Error(`Alias "${alias}" is already assigned.`);

        await LDAPClientUtils.modifyLDAP(client, LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`), [
            {
                type: 'mailAlias',
                values: [alias],
            }
        ], 'add');

        return true;
    });
}