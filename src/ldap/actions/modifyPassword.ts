import emailParser from "../../tools/emailParser";
import generateHash from "../../tools/generateHash";
import {ILDAPClient} from "../interfaces";
import LDAPClientUtils from "../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, password: string): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        await LDAPClientUtils.modifyLDAP(client, LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`), [
            {
                type: 'userPassword',
                values: [`{SHA}${generateHash(password)}`]
            }
        ], 'replace');

        return true;
    });
}