import emailParser from "../../../tools/emailParser";
import {ILDAPClient} from "../../interfaces";
import LDAPClientUtils from "../../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string, group: string): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async () => {
        const {
            domain
        } = emailParser(email);

        const dn = LDAPClientUtils.buildDN(client,`mail=${email},ou=users,dc=${domain}`);

        try {
            await LDAPClientUtils.modifyLDAP(client, dn, [
                {
                    type: 'mailGroupMember',
                    values: [group],
                }
            ], 'delete');
        } catch (error) {
            if (error instanceof Error && error.name === 'NoSuchAttributeError') return false;

            throw error;
        }

        return true;
    });
}