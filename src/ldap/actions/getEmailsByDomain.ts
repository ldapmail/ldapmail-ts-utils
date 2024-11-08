import {ILDAPClient, ILDAPEmail} from "../interfaces";
import LDAPClientUtils from "../LDAPClientUtils";

export default async function (client: ILDAPClient, domain: string): Promise<ILDAPEmail[] | []> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const accounts = await LDAPClientUtils.searchLDAP(client, LDAPClientUtils.buildDN(client, `ou=users,dc=${domain}`), {
            scope: 'sub',
            filter: `(|(objectClass=PostfixBookMailAccount)(objectClass=PostfixBookMailForward))`,
        });

        return (accounts?.searchEntries || []).map((entry) => LDAPClientUtils.createLDAPEmailEntity(entry)) as ILDAPEmail[] | [];
    });
}