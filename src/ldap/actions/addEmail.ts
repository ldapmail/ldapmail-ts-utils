import generateHash from "../../tools/generateHash";
import LDAPClientUtils from "../LDAPClientUtils";
import {Attribute} from "ldapts";
import emailParser from "../../tools/emailParser";
import {ILDAPClient} from "../interfaces";

export default async function (
    client: ILDAPClient,
    email: string,
    password: string = 'pwd$0000',
    quota: number = 1048576, // 1GB
    sendAllowed: boolean = true,
    homeDirectory: string = '/var/mail/vol_1',
    storageDirectory: string = '/var/mail/vol_1'
): Promise<boolean> {
    return await LDAPClientUtils.executionWrapper(client, async (): Promise<boolean> => {
        const {
            name,
            domain
        } = emailParser(email);

        let dn = client.config.baseDN

        dn = await createBaseDnIfNotExists(client, dn, domain);
        dn = await createOuUsersIfNotExists(client, dn);
        dn = await createEmailIfNotExists(
            client,
            dn,
            name,
            email,
            password,
            quota,
            sendAllowed,
            homeDirectory,
            storageDirectory
        );

        return true;
    });
}

async function createBaseDnIfNotExists(client: ILDAPClient, dn: string, dcValue: string): Promise<string> {
    dn = `dc=${dcValue}, ${dn}`;

    await LDAPClientUtils.insertLDAP(client, dn, [
        new Attribute({
            type: 'objectClass',
            values: ['top', 'domain']
        }),
        new Attribute({
            type: 'dc',
            values: [dcValue]
        }),
    ]);

    return dn;
}

async function createOuUsersIfNotExists(client: ILDAPClient, dn: string): Promise<string> {
    dn = `ou=users, ${dn}`;

    await LDAPClientUtils.insertLDAP(client, dn, [
        new Attribute({
            type: 'objectClass',
            values: ['top', 'organizationalUnit']
        }),
        new Attribute({
            type: 'ou',
            values: ['users']
        }),
    ]);

    return dn;
}

async function createEmailIfNotExists(
    client: ILDAPClient,
    dn: string,
    name: string,
    email: string,
    password: string,
    quota: number,
    sendAllowed: boolean,
    homeDirectory: string,
    storageDirectory: string
): Promise<string> {

    const aliasCheckEntries = await LDAPClientUtils.searchLDAP(client, client.config.baseDN, {
        attributes: ['mail', 'mailAlias'],
        scope: 'sub',
        filter: `(|(mailAlias=${email})(mail=${email}))`,
        sizeLimit: 1
    });

    // Prevents duplicate aliases across email accounts
    if (aliasCheckEntries?.searchEntries?.length && aliasCheckEntries.searchEntries.length > 0)
        throw new Error(`Email "${email}" is already registered or assigned as alias.`);

    dn = `mail=${email}, ${dn}`;

    const {
        domain
    } = emailParser(email);

    await LDAPClientUtils.insertLDAP(client, dn, [
            new Attribute({
                type: 'sn',
                values: [name]
            }),
            new Attribute({
                type: 'cn',
                values: [email]
            }),
            new Attribute({
                type: 'mail',
                values: [email]
            }),
            new Attribute({
                type: 'userPassword',
                values: [`{SHA}${generateHash(password)}`]
            }),
            new Attribute({
                type: 'mailEnabled',
                values: ['TRUE']
            }),

            new Attribute({
                type: 'mailHomeDirectory',
                values: [`${homeDirectory}/${domain}/${name}`]
            }),

            new Attribute({
                type: 'mailStorageDirectory',
                values: [`maildir:${storageDirectory}/${domain}/${name}`]
            }),

            new Attribute({
                type: 'mailGidNumber',
                values: ['5000']
            }),
            new Attribute({
                type: 'mailUidNumber',
                values: ['5000']
            }),
            new Attribute({
                type: 'mailQuota',
                values: [quota.toString()]
            }),
            new Attribute({
                type: 'mailSendAllowed',
                values: [sendAllowed ? 'OK' : 'REJECT']
            }),
            new Attribute({
                type: 'objectClass',
                values: ['inetOrgPerson', 'PostfixBookMailAccount', 'top']
            }),
        ]
    );

    return dn;
}