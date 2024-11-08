import addEmail from "../src/ldap/actions/addEmail";
import modifyEnable from "../src/ldap/actions/modifyEnable";
import modifyMailSending from "../src/ldap/actions/modifyMailSending";
import modifyPassword from "../src/ldap/actions/modifyPassword";
import modifyQuota from "../src/ldap/actions/modifyQuota";
import removeEmail from "../src/ldap/actions/removeEmail";
import getEmail from "../src/ldap/actions/getEmail";
import addAlias from "../src/ldap/actions/alias/addAlias";
import removeAlias from "../src/ldap/actions/alias/removeAlias";
import removeDomain from "../src/ldap/actions/removeDomain";
import addGroup from "../src/ldap/actions/groups/addGroup";
import removeGroup from "../src/ldap/actions/groups/removeGroup";
import LDAPClientUtils from "../src/ldap/LDAPClientUtils";
import {ILDAPClient, ILDAPEmail} from "../src/ldap/interfaces";
import getEmailsByDomain from "../src/ldap/actions/getEmailsByDomain";
import addForwarding from "../src/ldap/actions/forwarding/addForwarding";

const TEST_DOMAIN = 'test_vjkei52312lgfjs9BNfWq5553419dfqmnzqpm777nzbuqrdi3.test';

const generateTestEmail = (): string => {
    const timestamp = Date.now();
    const randomChars = Math.random().toString(36).substring(2, 8);
    return `test_${randomChars}-${timestamp}@${TEST_DOMAIN}`;
};

let client: ILDAPClient;
let testEmail: string;
let testAliasEmail: string;
let testGroup: string;
let testForward: string;

beforeAll(async () => {

    // @TODO Mock LDAP Server
    client = LDAPClientUtils.createClient({
        url: 'ldap://127.0.0.1:389',
        bindDN: 'cn=admin,dc=mail,dc=com',
        bindPassword: 'admin$',
        baseDN: 'dc=mail,dc=com',
        crossDomainAliases: true,
        crossDomainGroups: true,
    });

    await removeDomain(client, TEST_DOMAIN);
});

afterAll(async () => {
    await removeDomain(client, TEST_DOMAIN);
});

beforeEach(() => {
    testEmail = generateTestEmail();
    testAliasEmail = generateTestEmail();
    testGroup = generateTestEmail();
    testForward = generateTestEmail();
});

afterEach(async () => {
    await removeDomain(client, TEST_DOMAIN);
});

describe("Integration Tests for LDAP Actions", () => {
    it("should add an email successfully", async () => {
        const result = await addEmail(client, testEmail);
        expect(result).toBeTruthy();

        const email = await getEmail(client, testEmail);
        expect(email.mail).toEqual(testEmail);
        expect(email.mailSendAllowed).toEqual(true);
    });

    it("should get all emails from a domain", async () => {
        await addEmail(client, generateTestEmail());
        await addEmail(client, generateTestEmail());
        await addEmail(client, generateTestEmail());
        const result: ILDAPEmail[] = await getEmailsByDomain(client, TEST_DOMAIN);

        expect(result).toBeTruthy();
        expect(result.length).toEqual(3);
    });

    it("should enable a user email", async () => {
        await addEmail(client, testEmail);
        const result = await modifyEnable(client, testEmail, true);
        expect(result).toBeTruthy();
    });

    it("should modify mail sending permissions", async () => {
        await addEmail(client, testEmail);
        const result = await modifyMailSending(client, testEmail, true);
        expect(result).toBeTruthy();
    });

    it("should change the password for an email", async () => {
        await addEmail(client, testEmail);
        const result = await modifyPassword(client, testEmail, 'newPassword');
        expect(result).toBeTruthy();
    });

    it("should modify the quota for an email", async () => {
        await addEmail(client, testEmail);
        const result = await modifyQuota(client, testEmail, 2048);
        expect(result).toBeTruthy();
    });

    it("should get email details", async () => {
        await addEmail(client, testEmail);
        const email = await getEmail(client, testEmail);
        expect(email).toBeDefined();
        expect(email).toMatchObject({
            mail: testEmail,
        });
    });

    it("should add an alias to an email", async () => {
        await addEmail(client, testEmail);
        const result = await addAlias(client, testEmail, testAliasEmail);

        expect((await getEmail(client, testEmail))?.mailAlias).toEqual([testAliasEmail]);
        expect(result).toBeTruthy();
    });

    it("should remove an alias from an email", async () => {
        await addEmail(client, testEmail);
        await addAlias(client, testEmail, testAliasEmail);
        const result = await removeAlias(client, testEmail, testAliasEmail);
        expect(result).toBeTruthy();
    });

    it("should add a group to an email", async () => {
        await addEmail(client, testEmail);
        const result = await addGroup(client, testEmail, testGroup);

        expect((await getEmail(client, testEmail))?.mailGroupMember).toEqual([testGroup]);
        expect(result).toBeTruthy();
    });

    it("should remove a group from an email", async () => {
        await addEmail(client, testEmail);
        await addGroup(client, testEmail, testGroup);
        const result = await removeGroup(client, testEmail, testGroup);
        expect(result).toBeTruthy();
    });

    it("should add a forward to an email", async () => {
        await addEmail(client, testEmail);

        // @TODO Fix this test after forwarding is implemented

        // const result = await addForwarding(client, testEmail, testForward);
        // expect(result).toBeTruthy();
    });

    it("should remove an email successfully", async () => {
        await addEmail(client, testEmail);
        const result = await removeEmail(client, testEmail);
        expect(result).toBeTruthy();
    });
});
