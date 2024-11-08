import {ILDAPClient} from "../interfaces";
import LDAPClientUtils from "../LDAPClientUtils";

export default async function (client: ILDAPClient, email: string): Promise<any> {
    return await LDAPClientUtils.executionWrapper(client, async () => await LDAPClientUtils.getAccount(client, email));
}