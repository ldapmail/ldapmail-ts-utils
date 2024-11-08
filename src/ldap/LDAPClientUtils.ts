import {Attribute, Change, Client} from 'ldapts';
import emailParser from "../tools/emailParser";
import {
    ILDAPClient,
    ILDAPClientUtils,
    ILDAPConfig, ILDAPEmail, ILDAPEmailRaw,
    ILDAPSearchOptions,
    LDAPAttribute
} from "./interfaces";

const createClient = (config: ILDAPConfig): ILDAPClient => {
    return {
        ldap: new Client({
            url: config.url,
            timeout: 0,
            connectTimeout: 0,
            strictDN: true,
        }),
        config
    };
}

const bindLDAP = async (client: ILDAPClient): Promise<void> => {
    await client.ldap.bind(client.config.bindDN, client.config.bindPassword);
}

const unbindLDAP = async (client: ILDAPClient): Promise<void> => {
    await client.ldap.unbind();
}

const buildDN = (client: ILDAPClient, dn: string): string => {
    return `${dn},${client.config.baseDN}`;
}

const getAccount = async (client: ILDAPClient, email: string): Promise<ILDAPEmail | null> => {
    const {
        domain
    } = emailParser(email);

    const account = await searchLDAP(client, buildDN(client, `mail=${email},ou=users,dc=${domain}`), {
        scope: 'base',
        sizeLimit: 1
    });

    return account && account.searchEntries && account.searchEntries[0]
        ? createLDAPEmailEntity(account.searchEntries[0])
        : null;
}

const createLDAPEmailEntity = (data: ILDAPEmailRaw): ILDAPEmail => {

    // @TODO Add mail forwarding support

    return {
        dn: data.dn,
        // sn: data.sn,
        // cn: data.cn,
        mail: data.mail,
        // userPassword: data.userPassword,
        mailEnabled: data.mailEnabled === 'TRUE',
        mailGidNumber: data.mailGidNumber,
        mailUidNumber: data.mailUidNumber,
        mailQuota: data.mailQuota,
        mailSendAllowed: data.mailSendAllowed === 'OK',
        mailGroupMember: Array.isArray(data.mailGroupMember) ? data.mailGroupMember : [data.mailGroupMember || ''],
        mailAlias: Array.isArray(data.mailAlias) ? data.mailAlias : [data.mailAlias || ''],
        // objectClass: data.objectClass,
    };
}

const searchLDAP = async (
    client: ILDAPClient,
    dn: string,
    options: ILDAPSearchOptions = {scope: 'base'}
): Promise<{ searchEntries: any[] } | null> => {
    try {
        const result = await client.ldap.search(dn, options);
        if (result.searchEntries.length > 0) return result;
    } catch (error) {
        if (error instanceof Error && error.name !== 'NoSuchObjectError') throw error;

        // If the error is 'NoSuchObjectError', proceed to create the entry
    }

    return null;
}

const modifyLDAP = async (
    client: ILDAPClient,
    dn: string,
    attributes: LDAPAttribute[],
    operation: string = 'replace'
): Promise<boolean> => {
    await client.ldap.modify(dn,
        attributes.map(({type, values}) =>
            new Change({
                operation: operation as 'replace' | 'add' | 'delete',
                modification: new Attribute({
                    type,
                    values
                })
            })
        ));
    return true;
}

const deleteLDAP = async (client: ILDAPClient, dn: string): Promise<boolean> => {
    try {
        await client.ldap.del(dn);
    } catch (error) {
        if (error instanceof Error && error.name === 'NoSuchObjectError') return false;

        throw error;
    }

    return true;
}

const insertLDAP = async (client: ILDAPClient, dn: string, attributes: Attribute[]): Promise<boolean> => {
    try {
        const result = await client.ldap.search(dn, {scope: 'base'});
        if (result.searchEntries.length > 0) return false;
    } catch (error) {
        if (error instanceof Error && error.name !== 'NoSuchObjectError') throw error;

        // If the error is 'NoSuchObjectError', proceed to create the entry
    }

    try {
        await client.ldap.add(dn, attributes);
    } catch (error) {
        if (error instanceof Error && error.name === 'AlreadyExistsError') return false;

        throw error;
    }

    return true;
}

const executionWrapper = async <T>(client: ILDAPClient, cb: () => Promise<T>): Promise<T | void> => {
    try {
        await bindLDAP(client);
        return await cb();
    } catch (error) {
        console.error('Error:', error);
        return;
    } finally {
        await unbindLDAP(client);
    }
}


export default {
    createClient,
    executionWrapper,
    createLDAPEmailEntity,
    buildDN,
    getAccount,
    searchLDAP,
    modifyLDAP,
    deleteLDAP,
    insertLDAP
} as ILDAPClientUtils;