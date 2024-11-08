import emailParser from "../../tools/emailParser";
import {ILDAPClient} from "../interfaces";
import LDAPClientUtils from "../LDAPClientUtils";

/**
 * Cautions: When you remove an email, you should also remove the user mailbox and all the user's data.
 * If not, the user's data will be left in the system, and it will be a security risk if the email is reused by another user.
 */
export default async function (client: ILDAPClient, email: string): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        await LDAPClientUtils.deleteLDAP(client, LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`));
        return true;
    });
}