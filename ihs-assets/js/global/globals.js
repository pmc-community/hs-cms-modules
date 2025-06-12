// THESE ARE THE SUPERGLOBALS
// will be initialised in main.js with data sent by the server
// the server shall define a class named SuperGlobals and the constructor of the class shall init the values
let APP_NAME, REQUEST_REDUX_STORE, REDUX_SYNC_CHANNEL, REDUX_STORE_BROADCAST, REDUX_STATE_CHANGED;
let IHSStateChannel, IHSBEStore, IHSData, IHSUtilities;

// used for dynamic header
let dynamicHeaderPos = 0;
let dynamicHeaderLimit = 20;
let dynamicHeaderLastScrollTop = 0;
let dynamicHeaderHSelector, dynamicHeaderMSelector;

// used for Auth0
let IHS_AUTH0_EVENT;
// ----- END SUPERGLOBLAS

// THIS GUY IS DOING THE HARD WORK
// gets the redux store and injects own reducers (if available)
// the event listener is set in main.js
// the store (as object) and utilities are provided by the REDUX Store app
// the reducers info and all their actions are provided by this app/site
const _listener = (e) => {
    if (e.detail.who === APP_NAME) {
        IHSBEStore = e.detail.content;
        IHSUtilities = e.detail.utilities;
        if (IHSBEStore) {
            IHSUtilities.broadcastMessage(1, APP_NAME);
            new FrontEndReducers(IHSBEStore, IHSUtilities, FEReducersInfo, FEAllActions);
            document.removeEventListener(REDUX_STORE_BROADCAST, _listener);
        }
        else console.log("IHS Hubspot frontend is not connected to store");
    }
}

// CREATE AND INJECT OWN REDUCERS TO REDUX STORE
class FrontEndReducers {
    constructor(store, utilities, reducersInfo, actionTypes) {

        if (
            !store ||
            !utilities ||
            !reducersInfo ||
            typeof reducersInfo === 'undefined' ||
            reducersInfo.length === 0 ||
            !actionTypes ||
            typeof actionTypes === 'undefined' ||
            actionTypes.length === 0
        ) {
            IHSUtilities.broadcastMessage(5, APP_NAME);
            return;
        }
        let reducerList = [];
        Object.keys(reducersInfo).forEach((key) => {
            let reducer = reducersInfo[key];
            let reducerObject = window[reducer];
            reducerList[key] = utilities.reducerInformation(reducerObject.function, reducerObject.persist, reducerObject.actions);
        });

        if (reducerList.length > 0) {
            utilities.broadcastMessage(4, APP_NAME);
            const checkActions = this.checkDuplicateActions(store, actionTypes);
            if (checkActions.result) store.injectAsyncReducer(store, reducerList, actionTypes, true, true, APP_NAME + 'Root');
            else utilities.broadcastMessage(5, APP_NAME, '\nDUPLICATE ACTION(S): ' + checkActions.duplicateActions);
            this.cleanUpAfterReducerInjection();
        }
    }

    checkDuplicateActions(st, aL) {

        // duplicate actions identifiers are not allowed, so now we check this against existing reducers and actions
        // the store has its own protection and should not allow injecting reducers having duplicate actions identifiers
        // however, it doesn't hurt to double check this before injection because, if store protection fails, the outcome
        // can be a very impredictable behaviour since the store may not dispatch the action we expect to be dispatched
        const storeActions = st.actionTypes;
        let currentActions = [];
        Object.keys(storeActions).forEach((action) => {
            currentActions.push(storeActions[action]);
        });

        let result = true;
        let duplicates = [];

        Object.keys(aL).forEach((action) => {
            if (currentActions.includes(aL[action])) {
                result = false;
                duplicates.push(aL[action]);
            }
        });
        return { result: result, duplicateActions: duplicates.join(',') };
    }

    cleanUpAfterReducerInjection() {
        // since everything is now in the store, a little clean-up doesn't hurt
        // that will allow other frontend apps (not React Apps because these are injecting the reducers withoud global variables)
        // to inject their own reducers to the store

        const reducerSuffix = '_redInfo'.length;
        FEReducersInfo.forEach((reducerInfo) => {
            delete window[reducerInfo];
            let reducerName = reducerInfo.substring(0, reducerInfo.length - reducerSuffix);

            // delete operator doesn't work for functions, so we do what we can
            // at least this will prevent the direct access to reducers
            window[reducerName] = undefined;
        });
        delete window.FEReducersInfo;
    }
}

// THIS CLASS HOLDS THE PAGE INFORMATION
// DO SOME PAGE EXTRA SETTINGS (i.e. dynamic-header, smart go-to-top button)
// IT ALSO CALLS THE SPECIFIC PAGE CLASS THAT IS TAILORED FOR THE ENVIRONMENT
// if REDUX is available, the specific page class will be automatically connected to the store
// IMPORTANT!!!
// Although may look weird, this class is called from the environment specific js script (e.g. ihs-main-specific.js)
// the reason is the main logic of the site/app which says that 
// the specific environment is aware of the rest and uses specific and/or general tools and not the other way around
// also, the specific environment gets the settings from the server and passes them to the other tools

class IHSCSitePage {
    constructor(initialEnvInfo, config) {
        this.initialEnvInfo = initialEnvInfo || {};
        this.updatedEnvInfo = this.updateSettings(this.initialEnvInfo);
        if (typeof this.initialEnvInfo.siteSettings === 'undefined') return;
        if (typeof this.initialEnvInfo.siteSettings.specificPageClass === 'undefined') return;

        // create an instance of the specific page class, based on the siteSettings.specificPageClass definition
        // if IHSCSitePage is connected to REDUX store, the specific page class will be also connected to the REDUX store
        // specific page class is defined (usually) in ihs-main-specific.js and handle things that are specific to the implementation
        // e.g.: specific page class may be working with HubSpot or Gatsby or Wordpress environment
        // IMPORTANT!!!!
        // THE SPECIFIC CLASS PAGE WILL BE NOT AVAILABLE IF NOT SENT THROUGH SITE SETTINGS  

        // using "..." operator because a delete operation will follow and this will remove the prop from the original object too
        let envTemp = { ...this.updatedEnvInfo };

        // no need to carry the store all over the place
        delete envTemp.reduxStore;

        let envString = JSON.stringify(envTemp);

        this.specificPageSettings = typeof this.reduxConnected !== 'undefined' && this.reduxConnected
            ? new Function(`return new (new IHSBEStore.storeUtilities.ReduxConnectedClass(${this.initialEnvInfo.siteSettings.specificPageClass}))('${envString}')`)
            : new Function(`return new ${this.initialEnvInfo.siteSettings.specificPageClass}('${envString}')`);

        if (typeof this.specificPageSettings === 'function') new this.specificPageSettings;

        // set dynamic header
        if (this.initialEnvInfo.siteSettings.dynamicPageHeader.active) this.setDynamicHeader(this.initialEnvInfo);

        // set go-to-top-btn
        if (this.initialEnvInfo.siteSettings.goToTopBtn.active) this.setGoToTopBtn(this.initialEnvInfo);

        // Auth0 can be used only if REDUX is available and the own reducers were injected
        // Auth0 works only in frontend, in edit mode it may raise cross-domain authentication errors and wrong redirects
        // in edit mode Auth0 is deactivated
        if (
            this.initialEnvInfo.siteSettings.auth0.available &&
            this.reduxConnected &&
            this.initialEnvInfo.siteSettings.enableAsyncReducers &&
            !this.initialEnvInfo.editMode
        ) {
            this.setAuth0(this.initialEnvInfo);
            this.setHandleAuth0Event(this.initialEnvInfo, this.initialEnvInfo.siteSettings, config.auth0EventProcessor, this);
        }

        if (this.reduxConnected) {
            this.store.storeUtilities.setObserveStore();
            this.setHandleStateChange(this.initialEnvInfo, this.initialEnvInfo.siteSettings, config.stateChangeProcessor, this);
        }

        if (this.reduxConnected) this.updatePageSettingsInReduxStore(envTemp);
    }

    setHandleStateChange(ei, site, processor, parent) {
        document.addEventListener(REDUX_STATE_CHANGED, (e) => {
            processor(ei, site, e.detail, parent);
        });
    }

    setAuth0(ei) {
        authSetInit(ei);
        authSetCheckSession(ei);
        authSetLoginLogout(ei);
    }

    setHandleAuth0Event(ei, site, processor, parent) {
        document.addEventListener(IHS_AUTH0_EVENT, (e) => { processor(e, ei, site, parent); });
    }

    updatePageSettingsInReduxStore(ei) {
        if (this.reduxConnected) this.ihsHSActions.updatePageSettings(ei)(this.store.dispatch);
    }

    setGoToTopBtn(ei) {
        if (typeof ei.siteSettings.goToTopBtn !== 'object') return;
        const btnSettings = ei.siteSettings.goToTopBtn;
        if (!btnSettings.smart) return;

        let editMode = typeof ei.editMode === 'undefined' ? false : ei.editMode;
        if (!editMode) $('#ihs_go_to_top_btn').hide();

        let mainContentSelector = $('main').length > 0 ? 'main' : btnSettings.mainSelector;

        if ($('#ihs_top_of_page').length === 0) $(mainContentSelector).prepend('<div id="ihs_top_of_page"></div>');

        if (!editMode) {
            $(window).on('scroll', handleHideGoToTopBtn.bind(this, btnSettings.toHideSelector));

            function handleHideGoToTopBtn(selector) {
                if ($("#ihs_top_of_page").is_on_screen() || $(selector).is_on_screen()) $('#ihs_go_to_top_btn').fadeOut("slow");
                else $('#ihs_go_to_top_btn').fadeIn("slow");
            }
        }

        $('#ihs_go_to_top_btn').click(() => {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#ihs_top_of_page").offset().top
            }, 500);
        });
    }

    setDynamicHeader(ei) {
        if ($('#ihs_top_of_page').length === 0) $(dynamicHeaderMSelector).prepend('<div id="ihs_top_of_page"></div>');

        let editMode = typeof ei.editMode === 'undefined' ? false : ei.editMode;
        if (!editMode) {
            $(window).on('scroll', function () {
                let st = $(this).scrollTop();
                if (st < dynamicHeaderLastScrollTop) {
                    dynamicHeaderPos--;
                    if (dynamicHeaderPos < 0) {
                        dynamicHeaderPos = 0;
                        $(dynamicHeaderHSelector).slideDown('slow');
                    }
                }
                else {
                    dynamicHeaderPos++;
                }
                dynamicHeaderLastScrollTop = st;

                if (dynamicHeaderPos > dynamicHeaderLimit) $(dynamicHeaderHSelector).slideUp('slow');
                else $(dynamicHeaderHSelector).slideDown('slow');

                if ($("#ihs_top_of_page").is_on_screen()) {
                    dynamicHeaderPos = 0;
                    $(dynamicHeaderHSelector).slideDown('slow');
                }
            });
        }
    }

    updateSettings(is) {
        is['appName'] = is.siteSettings.APP_NAME;
        is['activeReactApps'] = this.getActiveReactApps();
        is['globalReactApps'] = this.getGlobalReactApps();
        if (typeof IHSBEStore !== 'undefined') is['reduxStore'] = IHSBEStore;
        else is['reduxStore'] = "not_found";
        return is;
    }

    getGlobalReactApps() {
        let allGlobalAra = [];
        let divId = '';
        let appName = '';
        let appType = '';
        $('.ihs-era-app').each(function () {
            let ara = {};
            divId = $(this).attr("id");

            if (document.querySelector('#' + divId).hasOwnProperty('_reactRootContainer')) {
                appName = $(this).attr("ihs-era-app-name");
                appType = $(this).attr("ihs-era-app-type");
                if (appType === 'global') {
                    ara['appName'] = appName;
                    ara['appRootDiv'] = divId;
                    ara['appStatus'] = true;
                    ara['appType'] = appType;
                    allGlobalAra.push(ara);
                }
            }
        });
        return allGlobalAra;
    }

    getActiveReactApps() {
        let allAra = [];
        let divId = '';
        let appName = '';
        let appType = '';
        $('.ihs-era-app').each(function () {
            let ara = {};
            divId = $(this).attr("id");

            if (document.querySelector('#' + divId).hasOwnProperty('_reactRootContainer')) {
                appName = $(this).attr("ihs-era-app-name");
                appType = $(this).attr("ihs-era-app-type");
                if (appType !== 'global') {
                    ara['appName'] = appName;
                    ara['appRootDiv'] = divId;
                    ara['appStatus'] = true;
                    ara['appType'] = appType;
                    allAra.push(ara);
                }
            }
            else {
                appName = $(this).attr("ihs-era-app-name");
                appType = $(this).attr("ihs-era-app-type");
                if (appType !== 'global') {
                    ara['appName'] = appName;
                    ara['appRootDiv'] = divId;
                    ara['appStatus'] = false;
                    ara['appType'] = appType;
                    allAra.push(ara);
                }
            }
        });
        return allAra;
    }
}

// SOME USEFUL GENERAL FUNCTIONS

// get a good looking timestamp in string format
function getTimestamp() {
    let now = new Date();
    return now.toDateString() + ' ' + now.toTimeString().substring(0, 8) + ':' + now.getMilliseconds() + ': ';
}

// get rid of script information from console messages since is useless anyway in this case
if (typeof consolePrint === 'undefined') consolePrint = function (...args) { queueMicrotask(console.log.bind(console, ...args)); }

// send custom format strings to console; doesn't apply for other types
function toConsole(mess, format) {
    if (typeof mess === 'string') typeof consolePrint !== 'undefined' ? consolePrint('%c' + mess, format) : console.log(mess);
    else typeof consolePrint !== 'undefined' ? consolePrint(mess) : console.log(mess);
}

// get the maximum z-index on page, useful when needed to be sure that an element is always on top 
function getMaxZIndex() {
    return Math.max(
        ...Array.from(document.querySelectorAll('body *'), el =>
            parseFloat(window.getComputedStyle(el).zIndex),
        ).filter(zIndex => !Number.isNaN(zIndex)),
        0,
    );
}

// check if an element is on screen
$.fn.is_on_screen = function () {
    var win = $(window);
    var viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds;
    bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};
