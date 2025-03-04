import IMAPClientUtils from './IMAPClientUtils'
import getQuota from './actions/getQuota'
import searchForMessages from './actions/searchForMessages'
import sendMessage from './actions/sendMessage'
import getTransport from './actions/getTransport'
import syncMailbox from './actions/syncMailbox'
import getMailboxes from './actions/getMailboxes'
import addFlags from './actions/addFlags'
import composeMessage from './actions/composeMessage'
import draftMessage from './actions/draftMessage'
import getMessagesCount from './actions/getMessagesCount'
import moveMessage from './actions/moveMessage'
import permanentDelete from './actions/permanentDelete'
import removeFlags from './actions/removeFlags'
import saveMessage from './actions/saveMessage'
import searchForMessagesUID from './actions/searchForMessagesUID'

const createIMAPClient = IMAPClientUtils.createClient

export {
    createIMAPClient,
    getQuota,
    searchForMessages,
    sendMessage,
    getTransport,
    syncMailbox,
    getMailboxes,
    addFlags,
    composeMessage,
    draftMessage,
    getMessagesCount,
    moveMessage,
    permanentDelete,
    removeFlags,
    saveMessage,
    searchForMessagesUID,
}
