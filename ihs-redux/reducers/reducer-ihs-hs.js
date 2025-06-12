const initialHSReducerState = {
    ihs_hs_test: 0,
    page_settings: [],
    global_settings: {},
    user_status: {}
};

function ihsHSReducer(state = initialHSReducerState, action) {

    switch (action.type) {
        case FEAllActions.IHS_HS_DEFAULT:
            return {
                ...state,
                ihs_hs_test: typeof state.ihs_hs_test === 'undefined' ? 0 : state.ihs_hs_test + 1
            };

        case FEAllActions.IHS_HS_UPDATE_PAGE_SETTINGS:
            let pageSet = action.payload;
            let currentSettings = state.page_settings;

            let thisPageArray = [];
            let thisPage = {};

            // remove old page settings (if exists), to avoid duplicates by filtering the array and keep everything for other pages
            if (currentSettings.length > 0) {
                thisPageArray = currentSettings.filter(data => data.currentPage === pageSet.currentPage);
                if (thisPageArray.length === 1) thisPage = thisPageArray[0];
                currentSettings = currentSettings.filter(data => data.currentPage !== pageSet.currentPage);
            }

            // check the active react apps on page to see if any app is there already
            // in order to preserve the lastSaved position and size
            if (thisPageArray.length === 1) {
                let pageSetActiveReactApps = pageSet.activeReactApps;
                let thisPageActiveReactApps = thisPage.activeReactApps;
                pageSetActiveReactApps.forEach(app => {
                    let appExists = thisPageActiveReactApps.filter(data => data.appRootDiv === app.appRootDiv);
                    if (appExists.length === 1) {
                        pageSetActiveReactApps = pageSetActiveReactApps.filter(data => data.appRootDiv !== appExists[0].appRootDiv);
                        pageSetActiveReactApps.push(appExists[0]);
                    }
                });
                pageSet.activeReactApps = pageSetActiveReactApps;
            }

            // create global_settings by copying the global information from page settings
            let globalSettings = {};
            globalSettings.appName = pageSet.appName;
            globalSettings.editMode = pageSet.editMode;
            globalSettings.portalId = pageSet.portalId;
            globalSettings.siteSettings = pageSet.siteSettings;
            globalSettings.globalReactApps = pageSet.globalReactApps;

            // removing redundant information (global_settings) from the page settings
            delete pageSet.editMode;
            delete pageSet.portalId;
            delete pageSet.globalReactApps;
            delete pageSet.siteSettings;
            delete pageSet.appName;

            currentSettings.push(pageSet);

            return {
                ...state,
                page_settings: currentSettings,
                global_settings: globalSettings
            };

        case FEAllActions.IHS_HS_UPDATE_ERA_SETTINGS:
            const module = action.payload;
            let pageSettings = state.page_settings;
            if (pageSettings.length === 0) return state;
            let currentPageSettings = pageSettings.filter(data => data.currentPage === module.appPage);
            if (currentPageSettings.length !== 1) return state;

            let activeReactApps = typeof currentPageSettings[0].activeReactApps === 'undefined' ? [] : currentPageSettings[0].activeReactApps;

            let thisAppArray = [];
            let thisApp = {};

            if (activeReactApps.length > 0) {
                thisAppArray = activeReactApps.filter(data => data.appRootDiv === module.appRootDiv);
                thisApp = thisAppArray[0];
                activeReactApps = activeReactApps.filter(data => data.appRootDiv !== module.appRootDiv);
            }

            // load lastSaved position if available
            // this will make module.js to apply lastSaved position instead of default postion set by the module fields
            if (
                typeof thisApp.appPositionXY === 'object' &&
                typeof thisApp.appPositionXY.default === 'object' &&
                typeof thisApp.appPositionXY.lastSaved === 'object'
            ) {
                const savedTop = thisApp.appPositionXY.lastSaved.top;
                const savedLeft = thisApp.appPositionXY.lastSaved.left;
                const savedUnit = thisApp.appPositionXY.lastSaved.unit;

                if (
                    module.appPositionXY.default.top !== savedTop ||
                    module.appPositionXY.default.left !== savedLeft ||
                    module.appPositionXY.default.unit !== savedUnit
                ) {
                    module.appPositionXY.lastSaved.top = savedTop;
                    module.appPositionXY.lastSaved.left = savedLeft;
                    module.appPositionXY.lastSaved.unit = savedUnit;
                }
            }

            // load lastSaved size if available
            // this will make module.js to apply lastSaved size instead of the default size which is the max-content of the app

            if (
                typeof thisApp.appSize === 'object' &&
                typeof thisApp.appSize.lastSaved === 'object' &&
                typeof thisApp.appSize.lastSaved.width === 'object' &&
                typeof thisApp.appSize.lastSaved.height === 'object'

            ) {
                const savedWidth = thisApp.appSize.lastSaved.width;
                const savedHeight = thisApp.appSize.lastSaved.height;
                module.appSize.lastSaved.width = savedWidth;
                module.appSize.lastSaved.height = savedHeight;
            }

            // loading appOpenStatus
            if (typeof thisApp.appOpenStatus !== 'undefined') {
                const savedOpenStatus = thisApp.appOpenStatus;
                module.appOpenStatus = savedOpenStatus;
            }

            activeReactApps.push(module);

            currentPageSettings[0].activeReactApps = activeReactApps;
            pageSettings = pageSettings.filter(data => data.currentPage !== module.appPage);
            pageSettings.push(currentPageSettings[0]);

            return {
                ...state,
                page_settings: pageSettings
            };

        case FEAllActions.IHS_HS_UPDATE_ERA_POSITION_XY:
            const updatedPagesSettings_posXY = new IHSERAModuleReduxHelper(state, action.payload);
            return updatedPagesSettings_posXY
                ? {
                    ...state,
                    page_settings: updatedPagesSettings_posXY
                }
                : state;

        case FEAllActions.IHS_HS_UPDATE_ERA_SIZE:
            const updatedPagesSettings_size = new IHSERAModuleReduxHelper(state, action.payload);
            return updatedPagesSettings_size
                ? {
                    ...state,
                    page_settings: updatedPagesSettings_size
                }
                : state;

        case FEAllActions.IHS_HS_UPDATE_ERA_OPEN_STATUS:
            const updatedPagesSettings_openStatus = new IHSERAModuleReduxHelper(state, action.payload);
            return updatedPagesSettings_openStatus
                ? {
                    ...state,
                    page_settings: updatedPagesSettings_openStatus
                }
                : state;

        case FEAllActions.IHS_HS_UPDATE_USER_STATUS:
            return {
                ...state,
                user_status: action.payload
            };

        default:
            return state;
    }

}

// The name of the reducer function shall be enforced because the minified version (if used)
// of this js file will alter this name and this will cause errors when
// further configure the store for the reducer
Object.defineProperty(ihsHSReducer, "name", { value: 'ihsHSReducer' });

const ihsHSReducer_Actions = {
    defaultHSAction,
    updatePageSettings,
    updateERASettings,
    updateERAPositionXY,
    updateERASize,
    updateERAOpenStatus,
    updateUserStatus
};

ihsHSReducer_redInfo = { function: ihsHSReducer, persist: true, actions: ihsHSReducer_Actions };

if (typeof FEReducersInfo === 'undefined') FEReducersInfo = [];
FEReducersInfo.push('ihsHSReducer_redInfo');

// END STANDARD REDUCER CODE
// --------------------------------------

// CUSTOM CODE NEEDED IN THIS REDUCER ONLY

class IHSERAModuleReduxHelper {

    constructor(state, appInfo) {
        this.state = state;
        this.appInfo = appInfo;
        this.era = this.getAppSettings(this.state, this.appInfo);
        if (!this.era) return false;
        this.era = this.updateAppSettings(this.era, this.appInfo);
        if (!this.era) return false;
        this.activeReactApps = this.updateActiveReactApps(this.state, this.era, this.appInfo);
        if (!this.activeReactApps) return false;
        this.currentPageSettings = this.updateCurrentPageSettings(this.state, this.activeReactApps, this.appInfo);
        if (!this.currentPageSettings) return false;
        this.allPagesSettings = this.updateAllPageSettings(this.state, this.currentPageSettings, this.appInfo);
        return this.allPagesSettings;
    }

    updateAllPageSettings(state, currentPageSettings, appInfo) {
        const pageName = appInfo.appPage;
        const pages = state.page_settings;
        const pageArray = pages.filter(data => data.currentPage !== pageName);
        pageArray.push(currentPageSettings);
        return pageArray;
    }

    updateCurrentPageSettings(state, activeReactApps, appInfo) {
        const pageName = appInfo.appPage;
        const pages = state.page_settings;
        if (pages.length === 0) return false;
        const pageArray = pages.filter(data => data.currentPage === pageName);
        if (pageArray.length !== 1) return false;
        const page = pageArray[0];
        page.activeReactApps = activeReactApps;
        return page;
    }

    updateActiveReactApps(state, era, appInfo) {
        const pageName = appInfo.appPage;
        const pages = state.page_settings;
        if (pages.length === 0) return false;
        const pageArray = pages.filter(data => data.currentPage === pageName);
        if (pageArray.length !== 1) return false;
        const page = pageArray[0];
        let activeReactApps = page.activeReactApps;
        if (activeReactApps.length === 0) return false;
        activeReactApps = activeReactApps.filter(data => data.appRootDiv !== appInfo.appRootDiv);
        activeReactApps.push(era);
        return activeReactApps;
    }

    updateAppSettings(appSettings, appInfo) {
        if (appInfo.callType === 'position') {
            if (typeof appSettings.appPositionXY !== 'object') return false;
            const appPositionXY = appSettings.appPositionXY;
            if (typeof appPositionXY.lastSaved !== 'object') return false;
            const lastSaved = appPositionXY.lastSaved;
            lastSaved.top = appInfo.top;
            lastSaved.left = appInfo.left;
            lastSaved.unit = 'px';
            appPositionXY.lastSaved = lastSaved;
            appSettings.appPositionXY = appPositionXY;
            return appSettings;
        }

        if (appInfo.callType === 'size') {
            if (typeof appSettings.appSize !== 'object') return false;
            const appSize = appSettings.appSize;
            if (typeof appSize.lastSaved !== 'object') return false;
            const lastSaved = appSize.lastSaved;
            lastSaved.width = { unit: "px", value: appInfo.width };
            lastSaved.height = { unit: "px", value: appInfo.height };
            appSize.lastSaved = lastSaved;
            appSettings.appSize = appSize;
            return appSettings;
        }

        if (appInfo.callType === 'open_status') {
            if (typeof appSettings.appOpenStatus === 'undefined') return false;
            appSettings.appOpenStatus = appInfo.appOpenStatus;
            return appSettings;
        }
    }

    getAppSettings(state, appInfo) {
        const pageName = appInfo.appPage;
        const pages = state.page_settings;
        if (pages.length === 0) return false;
        const pageArray = pages.filter(data => data.currentPage === pageName);
        if (pageArray.length !== 1) return false;
        const page = pageArray[0];
        const activeReactApps = page.activeReactApps;
        if (activeReactApps.length === 0) return false;
        const eraArray = activeReactApps.filter(data => data.appRootDiv === appInfo.appRootDiv);
        if (eraArray.length !== 1) return false;
        const era = eraArray[0];
        return era;
    }

}