/*
 * GENERAL CODE TO BE USED WITH ALL TYPES OF SITES
 * SEP-2022: CAN BE USED WITH WORDPRESS OR HUBSPOT
 * XXX-YYYY: CAN BE USED WITH GATSBY.JS
 */

// REDUX INIT
// init super globals
// the values of the SuperGlobals shall be sent by the server
new SuperGlobals();

const MAX_STORE_REQUEST_ATTEMPTS = 5;
const STORE_REQUEST_RETRY_MS = 300;

// Requests the backend Redux store from the store-provider app.
// Retries with backoff if the reply is a non-store sentinel (e.g. 'exiting'),
// which happens when the store app is mid-unmount/remount at request time.
function requestBackendStore(attempt = 1) {
    const uuid = crypto.randomUUID();
    const replyEvent = `ihs-store-reply-${uuid}`;

    // keep the ears open to hear the message from the REDUX store
    document.addEventListener(replyEvent, (e) => _listener(e, replyEvent, attempt), { once: true });

    const event = new CustomEvent(
        REQUEST_REDUX_STORE,
        {
            detail: {
                who: APP_NAME,
                sessionToken: document.getElementById('ihs_admin_backend_store_app')?.getAttribute('data-session-token'),
                replyEvent: replyEvent
            }
        }
    );

    // ask for the REDUX store because we are already prepared to receive it
    document.dispatchEvent(event);
}

// ask for the REDUX store because we are already prepared to receive it
if (!IHSBEStore) requestBackendStore();