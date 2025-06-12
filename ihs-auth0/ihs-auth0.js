
function authSetInit(ei) {
    let authLinks = (ei.siteSettings.auth0.authLinks.selector).join(',');
    $(authLinks).text('');
    $(authLinks).append('<img class="ihs-auth-spinner" src="https://hub.innohub.space/hubfs/hub-ihs/eq-loader.gif" alt="Checking...">');
    $(authLinks).removeAttr('href');
}

function authSetCheckSession(ei) {
    // remove the hash and everything else such as query strings (not good always)
    //history.replaceState({}, document.title, '/');

    // remove the hash and keep everything else
    history.replaceState({}, document.title, location.pathname + location.search);

    webAuth.checkSession({ scope: 'openid email profile' }, (err, authResult) => {
        if (err) { needLogin(err, ei); return; }
        userProfile(authResult, ei);
    });

    const needLogin = (err, ei) => {
        let authLinks = (ei.siteSettings.auth0.authLinks.selector).join(',');
        $(authLinks).text(`${ei.siteSettings.auth0.loginLinkText}`);
        $(authLinks).parent().prepend(`<a style="margin-right:20px" href = "${ei.siteSettings.auth0.registrationLink}" target="_blank">${ei.siteSettings.auth0.registrationLinkText}</a>`);
        $(authLinks).attr('ihs_auth', 'ihs-login');
        document.dispatchEvent(new CustomEvent(IHS_AUTH0_EVENT, { detail: { auth0data: { status: false, data: err } } }));
    }

    const userProfile = (authResult, ei) => {
        let authLinks = (ei.siteSettings.auth0.authLinks.selector).join(',');
        $(authLinks).text(`${ei.siteSettings.auth0.logoutLinkText}`);
        $(authLinks).attr('ihs_auth', 'ihs-logout');

        const profile = (...args) => {
            return new Promise((resolve, reject) => {
                webAuth.client.userInfo(...args, (err, user) => {
                    if (err) return reject(err);
                    resolve(user);
                });
            });
        };

        profile(authResult.accessToken)
            .then((user) => { document.dispatchEvent(new CustomEvent(IHS_AUTH0_EVENT, { detail: { auth0data: { status: true, data: user } } })); })
            .catch((err) => { document.dispatchEvent(new CustomEvent(IHS_AUTH0_EVENT, { detail: { auth0data: { status: false, data: err } } })); });
    }
};

function authSetLoginLogout(ei) {
    let authLinks = (ei.siteSettings.auth0.authLinks.selector).join(',');
    $(authLinks).click(() => {
        let ihsAuth = $(authLinks).attr('ihs_auth');
        if (ihsAuth === 'ihs-login') webAuth.authorize();
        else webAuth.logout({
            returnTo: window.location.href
        });
    });
}
