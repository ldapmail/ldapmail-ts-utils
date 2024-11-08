import emailParser from "../../tools/emailParser";
import {ILDAPClient} from "../interfaces";
import LDAPClientUtils from "../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, quota: number): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        await LDAPClientUtils.modifyLDAP(client, LDAPClientUtils.buildDN(client,`mail=${email},ou=users,dc=${domain}`), [
            {
                type: 'mailQuota',
                values: [quota.toString()],
            }
        ], 'replace');

        return true;
    });
}