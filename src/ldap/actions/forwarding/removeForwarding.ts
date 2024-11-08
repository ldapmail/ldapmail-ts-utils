import emailParser from "../../../tools/emailParser";
import {ILDAPClient} from "../../interfaces";
import LDAPClientUtils from "../../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, forwardEmail: string): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        try {
            await LDAPClientUtils.modifyLDAP(client, LDAPClientUtils.buildDN(client, `mail=${email},ou=users,dc=${domain}`), [
                {
                    type: 'mailForwardingAddress',
                    values: [forwardEmail],
                }
            ], 'delete');
        } catch (error) {
            if (error instanceof Error && error.name === 'NoSuchAttributeError') return false;

            throw error;
        }

        return true;
    });
}