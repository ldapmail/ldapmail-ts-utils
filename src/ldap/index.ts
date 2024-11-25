import LDAPClientUtils from './LDAPClientUtils'
import addEmail from './actions/addEmail'
import getEmail from './actions/getEmail'
import getEmailsByDomain from './actions/getEmailsByDomain'
import modifyEnable from './actions/modifyEnable'
import modifyMailSending from './actions/modifyMailSending'
import modifyPassword from './actions/modifyPassword'
import modifyQuota from './actions/modifyQuota'
import removeDomain from './actions/removeDomain'
import removeEmail from './actions/removeEmail'
import addAlias from './actions/alias/addAlias'
import removeAlias from './actions/alias/removeAlias'
import addForwarding from './actions/forwarding/addForwarding'
import removeForwarding from './actions/forwarding/removeForwarding'
import addGroup from './actions/groups/addGroup'
import removeGroup from './actions/groups/removeGroup'
const createLDAPClient = LDAPClientUtils.createClient
export {
    createLDAPClient, addEmail,
    getEmail,
    getEmailsByDomain,
    modifyEnable,
    modifyMailSending,
    modifyPassword,
    modifyQuota,
    removeDomain,
    removeEmail,
    addAlias,
    removeAlias,
    addForwarding,
    removeForwarding,
    addGroup,
    removeGroup
}