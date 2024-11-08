import {Attribute, Client} from "ldapts";

export type ILDAPConfig = {
    url: string;
    bindDN: string;
    bindPassword: string;
    baseDN: string;
    crossDomainAliases: boolean;
    crossDomainGroups: boolean;
}

export type ILDAPClient = {
    ldap: Client;
    config: ILDAPConfig;
}

export type LDAPAttribute = {
    type: string;
    values: string[];
}

export type ILDAPSearchOptions = {
    scope: 'base' | 'one' | 'sub';
    attributes?: string[];
    filter?: string;
    sizeLimit?: number;
};

export type ILDAPEmail = {
    dn: string;
    //sn: string;
    //cn: string;
    mail: string;
    //userPassword: string;
    mailEnabled: boolean;
    mailGidNumber: string;
    mailUidNumber: string;
    mailQuota: string;
    mailSendAllowed: boolean;
    mailGroupMember: string[];
    mailAlias: string[];
    //objectClass: string[];
};

export type ILDAPEmailRaw = {
    dn: string;
    sn: string;
    cn: string;
    mail: string;
    userPassword: string;
    mailEnabled: 'TRUE' | 'FALSE';
    mailGidNumber: string;
    mailUidNumber: string;
    mailQuota: string;
    mailSendAllowed: 'OK' | 'REJECT';
    mailGroupMember?: string | string[];
    mailAlias?: string | string[];
    objectClass: string[];
};

export type ILDAPClientUtils = {
    createClient: (config: ILDAPConfig) => ILDAPClient;
    bindLDAP: (client: ILDAPClient) => Promise<void>;
    unbindLDAP: (client: ILDAPClient) => Promise<void>;
    buildDN: (client: ILDAPClient, dn: string) => string;
    createLDAPEmailEntity: (data: ILDAPEmailRaw) => ILDAPEmail;
    getAccount: (client: ILDAPClient, email: string) => Promise<any>;
    searchLDAP: (client: ILDAPClient, dn: string, options: ILDAPSearchOptions) => Promise<{
        searchEntries: any[]
    } | null>;
    modifyLDAP: (client: ILDAPClient, dn: string, attributes: LDAPAttribute[], operation: string) => Promise<boolean>;
    deleteLDAP: (client: ILDAPClient, dn: string) => Promise<boolean>;
    insertLDAP: (client: ILDAPClient, dn: string, attributes: Attribute[]) => Promise<boolean>;
    executionWrapper: <T>(client: ILDAPClient, cb: () => Promise<T>) => Promise<T>;
}
