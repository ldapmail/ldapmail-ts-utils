import emailParser from "../../tools/emailParser";
import {ILDAPClient} from "../interfaces";
import LDAPClientUtils from "../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, enabled: boolean): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        await LDAPClientUtils.modifyLDAP(client, LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`), [
            {
                type: 'mailEnabled',
                values: enabled ? ['TRUE'] : ['FALSE'],
            }
        ], 'replace');

        return true;
    });
}