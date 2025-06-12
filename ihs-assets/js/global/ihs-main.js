/*
 * GENERAL CODE TO BE USED WITH ALL TYPES OF SITES
 * SEP-2022: CAN BE USED WITH WORDPRESS OR HUBSPOT
 * XXX-YYYY: CAN BE USED WITH GATSBY.JS
 */

// REDUX INIT
// init super globals
// the values of the SuperGlobals shall be sent by the server
new SuperGlobals();

// keep the ears open to hear the message from the REDUX store
document.addEventListener(REDUX_STORE_BROADCAST, _listener, { once: true });

// ask for the REDUX store because we are already prepared to receive it
if (!IHSBEStore) document.dispatchEvent(new CustomEvent(REQUEST_REDUX_STORE, { detail: { who: APP_NAME } }));
