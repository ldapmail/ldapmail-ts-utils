import emailParser from "../../tools/emailParser";
import LDAPClientUtils from "../LDAPClientUtils";
import {ILDAPClient} from "../interfaces";

export default async function (client: ILDAPClient, email: string, enabled: boolean): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        await LDAPClientUtils.modifyLDAP(client, LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`), [
            {
                type: 'mailSendAllowed',
                values: enabled ? ['OK'] : ['REJECT'],
            }
        ], 'replace');

        return true;
    });
}