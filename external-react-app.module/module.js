/*
 * IMPORTANT!!!
 * Avoid using global variables in module.js because:
 *  - may cause Javascript errors (multiple definitions of the same variable when multiple instances of the module is loaded)
 *  - may be altered when a second (third ...) instance of the module is loaded
 * 
 * For this reason, all stuff executed here are inside the function entry points that thakes the moduleInfo as argument.
 * moduleInfo is prepared in module.html and sent here through an inline script which is calling the related entry point
 * function after thw window is loaded. 
 * 
 * IMPORTANT!!!
 * All globals shall be checked before declaration to avoid Javascript error.
 * if <typeof globalX !== 'undefined'> let/const/var/function globalX ...
 */

// init client side functions which were used/called in module.html
// will not work otherwise, the functions will be unknown when used in module.html
ihs_era_do_stuff_on_client_side_edit_only = ihsERA_doStuff_edit_only;
ihs_era_do_stuff_on_client_side_frontend = ihsERA_doStuff_frontend;

// ENTRY POINT FUNCTIONS
// edit-mode entry point function executed on window.load
function ihsERA_doStuff_edit_only(moduleInfo) {
    /*
    * scroll correction is needed for the cases when the user scrolls very fast to top or, sometimes,
    * even when the page is loaded for the first time.
    * in this case there is a weird thing that makes the hidden react app container to be seen as on-screen, although is not,
    * and the open riggers doesn't work anymore. can be solved by small scroll down with 1 px which is made
    * by scrollCorrection function 
    */
    const mi = JSON.parse(moduleInfo);
    commonStuff(mi);
    handleHideApp_EditMode(mi);
}

// frontend entry point function executed on window.load
function ihsERA_doStuff_frontend(moduleInfo) {
    const mi = JSON.parse(moduleInfo);
    commonStuff(mi);
}
// END ENTRY POINT FUNCTIONS
// --------------------------------------

// COMMMON EDIT-MODE/FRONTEND SCRIPT

function commonStuff(mi) {

    scrollCorrection();
    generalInfoToConsole(mi);
    handleZIndex(mi);
    handleAppTriggers(mi);
    handleCloseBtnInFloatPosition(mi);
    handleZIndexOnFocus(mi);

    $(document).ready(function () {
        if (typeof IHSBEStore !== 'undefined' && mi.appName !== 'no_app') {
            module = new (new IHSBEStore.storeUtilities.ReduxConnectedClass(IHSERAModule))(mi);
        }
    });

    handleNoReduxHeaderButtons(mi);

}

function handleNoReduxHeaderButtons(mi) {
    handleMaximiseButton(mi);
    handleRestoreButtons(mi, '_ihs_era_set_defaults_btn');
}

function handleMaximiseButton(mi) {
    if (mi.appName === 'no_app') return;
    let containerDiv = mi.appPosition !== 'div--position--fixed' ? mi.appRootDiv : mi.appRootDiv + '_ihs_era_container';
    $('#' + mi.appRootDiv + '_ihs_era_maximise_btn').on('click', function () {
        $('#' + containerDiv).prop('style').setProperty('top', 0);
        $('#' + containerDiv).prop('style').setProperty('left', 0);
        $('#' + containerDiv).prop('style').setProperty('width', '100%');
        $('#' + containerDiv).prop('style').setProperty('height', "100%");
        $('#' + containerDiv).prop('style').setProperty('border', "none");
        $('#' + containerDiv).prop('style').setProperty('border-radius', 0);

        if (mi.appSize.type === 'div--position--size--default') $('.ui-resizable-se').hide();
    });
}

function handleRestoreButtons(mi, button) {
    if (mi.appName === 'no_app') return;
    let containerDiv = mi.appPosition !== 'div--position--fixed' ? mi.appRootDiv : mi.appRootDiv + '_ihs_era_container';
    $('#' + mi.appRootDiv + button).on('click', function () {
        let appTop, appLeft, posUnit, appWidth, appWidthUnit, appHeight, appHeightUnit;

        if (button === '_ihs_era_set_defaults_btn') {
            appTop = mi.appPositionXY.default.top;
            appLeft = mi.appPositionXY.default.left;
            posUnit = mi.appPositionXY.default.unit;

            appWidth = mi.appSize.default.width.value < 600 ? 600 : mi.appSize.default.width.value;
            appWidthUnit = mi.appSize.default.width.value < 600 ? 'px' : mi.appSize.default.width.unit;
            appHeight = mi.appSize.default.height.value < 500 ? 500 : mi.appSize.default.height.value;
            appHeightUnit = mi.appSize.default.height.value < 500 ? 'px' : mi.appSize.default.height.unit;
        }
        else {
            appTop = mi.appPositionXY.lastSaved.top;
            appLeft = mi.appPositionXY.lastSaved.left;
            posUnit = mi.appPositionXY.lastSaved.unit;

            appWidth = mi.appSize.lastSaved.width.value < 600 ? 600 : mi.appSize.lastSaved.width.value;
            appWidthUnit = mi.appSize.lastSaved.width.value < 600 ? 'px' : mi.appSize.lastSaved.width.unit;
            appHeight = mi.appSize.lastSaved.height.value < 500 ? 500 : mi.appSize.lastSaved.height.value;
            appHeightUnit = mi.appSize.lastSaved.height.value < 500 ? 'px' : mi.appSize.lastSaved.height.unit;

        }

        const appBorder = mi.appStyle.border.style;
        const appBorderRadius = mi.appStyle.border.radius;

        const appEntranceFromTop = mi.appEntrance.fromTop;
        const appEntranceFromLeft = mi.appEntrance.fromLeft;

        if (mi.appSize.type === 'div--position--size--default') {
            $('#' + containerDiv).prop('style').setProperty('top', appTop + posUnit);
            $('#' + containerDiv).prop('style').setProperty('left', appLeft + posUnit);
            $('#' + containerDiv).prop('style').setProperty('width', appWidth + appWidthUnit);
            $('#' + containerDiv).prop('style').setProperty('height', appHeight + appHeightUnit);
            $('#' + containerDiv).prop('style').setProperty('border', appBorder);
            $('#' + containerDiv).prop('style').setProperty('border-radius', appBorderRadius);
            $('.ui-resizable-se').show();
        }

        if (mi.appSize.type === 'div--position--size--full--height') {
            if (appEntranceFromLeft) {
                $('#' + containerDiv).prop('style').setProperty('top', 0);
                $('#' + containerDiv).prop('style').setProperty('left', 0);
                $('#' + containerDiv).prop('style').setProperty('width', appWidth + appWidthUnit);
                $('#' + containerDiv).prop('style').setProperty('height', "100%");
                $('#' + containerDiv).prop('style').setProperty('border-right', 'solid 1px #eaeaea');
            }
            else {
                $('#' + containerDiv).prop('style').setProperty('top', 0);
                $('#' + containerDiv).css('left', '');
                $('#' + containerDiv).prop('style').setProperty('right', 0);
                $('#' + containerDiv).prop('style').setProperty('width', appWidth + appWidthUnit);
                $('#' + containerDiv).prop('style').setProperty('height', "100%");
                $('#' + containerDiv).prop('style').setProperty('border-left', 'solid 1px #eaeaea');
            }
        }

        if (mi.appSize.type === 'div--position--size--full--width') {
            if (appEntranceFromTop) {
                $('#' + containerDiv).prop('style').setProperty('top', 0);
                $('#' + containerDiv).prop('style').setProperty('left', 0);
                $('#' + containerDiv).prop('style').setProperty('width', "100%");
                $('#' + containerDiv).prop('style').setProperty('height', appHeight + appHeightUnit);
                $('#' + containerDiv).prop('style').setProperty('border-bottom', 'solid 1px #eaeaea');
            }
            else {
                $('#' + containerDiv).prop('style').setProperty('bottom', 0);
                $('#' + containerDiv).css('top', '');
                $('#' + containerDiv).prop('style').setProperty('left', 0);
                $('#' + containerDiv).prop('style').setProperty('width', "100%");
                $('#' + containerDiv).prop('style').setProperty('height', appHeight + appHeightUnit);
                $('#' + containerDiv).prop('style').setProperty('border-top', 'solid 1px #eaeaea');
            }
        }
    });
}

// CLASS USED ONLY IF REDUX STORE IS AVAILABLE
class IHSERAModule {
    constructor(mi) {
        this.mi = mi;
        if (this.reduxConnected) this.updateERAStatusInStore(this.mi);

        if (
            this.reduxConnected &&
            mi.appPosition === 'div--position--fixed' &&
            mi.appSize.type !== 'div--position--size--full--screen' &&
            !window.matchMedia("only screen and (max-width: 768px)").matches
        ) {
            this.setXYPosition(this.mi);
            this.setSize(mi);
        }

        if (this.reduxConnected) this.saveOpenStatus(this);
        if (this.reduxConnected) this.handleOpenStatus(this);

        if (!this.reduxConnected) this.handleHeaderButtonsDisplay(mi);
        if (this.reduxConnected) this.handleRestoreLastSavedButton(mi);

    }

    handleRestoreLastSavedButton(mi) {
        if (mi.appName === 'no_app') return;
        const era = this.getAppSettings(mi);
        handleRestoreButtons(era, '_ihs_era_set_last_saved_btn');
    }

    handleHeaderButtonsDisplay(mi) {
        $('#' + mi.appRootDiv + '_ihs_era_set_last_saved_btn').hide();
    }

    handleOpenStatus(parentObject) {
        const era = this.getAppSettings(parentObject.mi);
        $(document).ready(function () {
            if (!$('#' + era.appRootDiv).is_on_screen() && era.appOpenStatus) eval('toggle_ihs_era_' + era.appRootDiv + '()');
        });
    }

    saveOpenStatus(parentObject) {
        if (parentObject.mi.appName === 'no_app') return;
        $('#' + parentObject.mi.appRootDiv + '_ihs_era_close_btn').on('click', function () {
            let appInfo = {
                callType: 'open_status',
                appPage: parentObject.mi.appPage,
                appRootDiv: parentObject.mi.appRootDiv,
                appOpenStatus: false
            };
            parentObject.ihsHSActions.updateERAOpenStatus(appInfo)(parentObject.store.dispatch);
        });

        let cssValidSelector = [];
        parentObject.mi.appTriggers.cssTriggers.forEach((trigger) => {
            if ($(trigger.app_dom_element_trigger_name).length > 0) cssValidSelector.push(trigger.app_dom_element_trigger_name);
        });

        let cssSelector = cssValidSelector.join(',');
        $(cssSelector).on('click', function () {
            let appInfo = {
                callType: 'open_status',
                appPage: parentObject.mi.appPage,
                appRootDiv: parentObject.mi.appRootDiv,
                appOpenStatus: true
            };
            parentObject.ihsHSActions.updateERAOpenStatus(appInfo)(parentObject.store.dispatch);
        });

        $('.ihs_era_text_trigger').on('click', function () {
            const appRootDivReference = $(this).attr('ihs_text_trigger_reference');
            if (parentObject.mi.appRootDiv === appRootDivReference) {
                let appInfo = {
                    callType: 'open_status',
                    appPage: parentObject.mi.appPage,
                    appRootDiv: parentObject.mi.appRootDiv,
                    appOpenStatus: true
                };
                parentObject.ihsHSActions.updateERAOpenStatus(appInfo)(parentObject.store.dispatch);
            }
        });
    }

    updateERAStatusInStore(mi) {
        this.ihsHSActions.updateERASettings(mi)(this.store.dispatch);
    }

    getAppSettings(mi) {
        const pageName = mi.appPage;
        let pages = this.data.ihsHubspotFrontEndRoot.ihsHS.page_settings;
        if (pages.length === 0) return false;
        const pageArray = pages.filter(data => data.currentPage === pageName);
        if (pageArray.length !== 1) return false;
        const page = pageArray[0];
        const activeReactApps = page.activeReactApps;
        if (activeReactApps.length === 0) return false;
        const eraArray = activeReactApps.filter(data => data.appRootDiv === mi.appRootDiv);
        if (eraArray.length !== 1) return false;
        const era = eraArray[0];
        return era;
    }

    setXYPosition(mi) {
        if (mi.appName === 'no_app') return;
        const era = this.getAppSettings(mi);
        if (!era) return;
        if (typeof era.appPositionXY !== 'object') return;
        if (typeof era.appPositionXY.lastSaved !== 'object') return;
        if (typeof era.appEntrance !== 'object') return;
        if (typeof era.appSize !== 'object') return;

        const lastPosition = era.appPositionXY.lastSaved;
        const sizeType = era.appSize.type;
        const entranceFromTop = era.appEntrance.fromTop;
        const entranceFromLeft = era.appEntrance.fromLeft;

        let containerDiv = mi.appPosition !== 'div--position--fixed' ? mi.appRootDiv : mi.appRootDiv + '_ihs_era_container';

        if (sizeType !== 'div--position--size--full--height' && sizeType !== 'div--position--size--full--width') {
            $('#' + containerDiv).prop('style').setProperty('top', lastPosition.top + lastPosition.unit);
            $('#' + containerDiv).prop('style').setProperty('left', lastPosition.left + lastPosition.unit);
        }

        if (sizeType === 'div--position--size--full--height') {
            if (entranceFromLeft) {
                $('#' + containerDiv).prop('style').setProperty('top', 0);
                $('#' + containerDiv).prop('style').setProperty('left', 0);
            }
            else {
                $('#' + containerDiv).prop('style').setProperty('top', 0);
                $('#' + containerDiv).prop('style').setProperty('right', 0);
            }
        }

        if (sizeType === 'div--position--size--full--width') {
            if (entranceFromTop) {
                $('#' + containerDiv).prop('style').setProperty('top', 0);
                $('#' + containerDiv).prop('style').setProperty('left', 0);
            }
            else {
                $('#' + containerDiv).prop('style').setProperty('left', 0);
                $('#' + containerDiv).prop('style').setProperty('bottom', 0);
            }
        }
    }

    setSize(mi) {
        if (mi.appName === 'no_app') return;
        const era = this.getAppSettings(mi);
        if (!era) return;
        if (typeof era.appSize !== 'object') return;
        if (typeof era.appSize.lastSaved !== 'object') return;
        if (typeof era.appEntrance !== 'object') return;

        const lastSize = era.appSize.lastSaved;
        const sizeType = era.appSize.type;

        let containerDiv = mi.appPosition !== 'div--position--fixed' ? mi.appRootDiv : mi.appRootDiv + '_ihs_era_container';

        if (sizeType !== 'div--position--size--full--height' && sizeType !== 'div--position--size--full--width') {
            $('#' + containerDiv).prop('style').setProperty('width', lastSize.width.value < 500 ? '500px' : lastSize.width.value + lastSize.width.unit);
            $('#' + containerDiv).prop('style').setProperty('height', lastSize.height.value < 500 ? '500px' : lastSize.height.value + lastSize.height.unit);
        }

        if (sizeType === 'div--position--size--full--height') {
            $('#' + containerDiv).prop('style').setProperty('width', lastSize.width.value < 500 ? '500px' : lastSize.width.value + lastSize.width.unit);
            $('#' + containerDiv).prop('style').setProperty('height', "100%");
        }

        if (sizeType === 'div--position--size--full--width') {
            $('#' + containerDiv).prop('style').setProperty('height', lastSize.height.value < 500 ? '500px' : lastSize.height.value + lastSize.height.unit);
            $('#' + containerDiv).prop('style').setProperty('width', "100%");
        }

        if (sizeType !== 'div--position--size--full--height' && sizeType !== 'div--position--size--full--width') {
            if (lastSize.width.value === 0 || lastSize.height.value === 0) {
                $('#' + containerDiv).prop('style').setProperty('height', 'max-content');
                $('#' + containerDiv).prop('style').setProperty('width', 'max-content');
            }
        }

        if (sizeType === 'div--position--size--full--height') {
            if (lastSize.width.value === 0) {
                $('#' + containerDiv).prop('style').setProperty('height', '100%');
                $('#' + containerDiv).prop('style').setProperty('width', 'max-content');
            }
        }

        if (sizeType === 'div--position--size--full--width') {
            if (lastSize.height.value === 0) {
                $('#' + containerDiv).prop('style').setProperty('height', 'max-content');
                $('#' + containerDiv).prop('style').setProperty('width', '100%');
            }
        }

    }
}
// END CALSS USED ONLY IF REDUX STORE IS AVAILABLE
// --------------------------------------

function toConsole(mess, format) {
    if (typeof mess === 'string') typeof consolePrint !== 'undefined' ? consolePrint('%c' + mess, format) : console.log(mess);
    else typeof consolePrint !== 'undefined' ? consolePrint(mess) : console.log(mess);
}

let now = new Date();
const timestamp = now.toDateString() + ' ' + now.toTimeString().substring(0, 8) + ':' + now.getMilliseconds() + ': ';

function generalInfoToConsole(mi) {
    if (mi.throwToConsole) {
        toConsole(
            mi.editMode ?
                '\n' + timestamp + 'Executing ERA HS module client script/edit mode' :
                '\n' + timestamp + 'Executing ERA HS module client script/frontend',
            "font-weight:700; color:#000000");
        toConsole('External React App - module instance info:')
        toConsole(mi, '');
        toConsole('\n', '');
    }
}

// get the maximum z-index on page
// useful when needed to be sure that a fixed/floating react app div is always on top when is opened
function getMaxZIndex() {
    return Math.max.apply(null, $('body *').map(function () {
        var z;
        return isNaN(z = parseInt($(this).css("z-index"), 10)) ? 0 : z;
    }));

}

/*
* force scroll down with 1 px when reaching the top of page to avoid the weird error of seeing the
* hidden apps as on-screen.
* but only on desktop, not on mobile, because this will prevent refresh page gesture on mobile
*/
function scrollCorrection() {

    $(window).on('scroll', function () {
        if ($(window).scrollTop() === 0 && !window.matchMedia("only screen and (max-width: 768px)").matches) $(window).scrollTop($(window).scrollTop() + 1);
    });

}

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

function handleZIndex(mi) {
    if (mi.appName === 'no_app') return;
    let containerDiv = mi.appPosition !== 'div--position--fixed' ? mi.appRootDiv : mi.appRootDiv + '_ihs_era_container';

    $(document).ready(function () {
        const maxZIndex = parseInt(getMaxZIndex(), 10);
        $('#' + containerDiv).prop('style').setProperty('z-index', maxZIndex + 1);

        /*
         * because on mobile the app div header is fixed, we need to play around a bit with the z-index
         * if not mobile, we leave as they are, otherwise resizable when entrance is from bottom will not work
         * since the sizable div will go behind (lower z-index). that's because of some differences of the top margin of the app div header
        */
        if (window.matchMedia("only screen and (max-width: 768px)").matches) {
            $('#' + mi.appRootDiv + '_ihs_era_container_header').prop('style').setProperty('z-index', maxZIndex + 2);
            $('#' + mi.appRootDiv + '_ihs_era_container_close_btn').prop('style').setProperty('z-index', maxZIndex + 3);
        }
    });
}

function handleZIndexOnFocus(mi) {
    if (mi.appName === 'no_app') return;
    let containerDiv = mi.appPosition !== 'div--position--fixed' ? mi.appRootDiv : mi.appRootDiv + '_ihs_era_container';
    $(document).ready(function () {
        $('#' + containerDiv).on('click', function () {

            let arrayZ = [];
            $('.ihs_era_container').each(function () {
                arrayZ.push(parseInt($(this).css('z-index'), 10));
            });

            const maxZIndex = Math.max.apply(Math, arrayZ);
            $('#' + containerDiv).prop('style').setProperty('z-index', maxZIndex + 1);
            if (window.matchMedia("only screen and (max-width: 768px)").matches) {
                $('#' + mi.appRootDiv + '_ihs_era_container_header').prop('style').setProperty('z-index', maxZIndex + 2);
                $('#' + mi.appRootDiv + '_ihs_era_container_close_btn').prop('style').setProperty('z-index', maxZIndex + 3);
            }
        });
    });
}

function handleCloseBtnInFloatPosition(mi) {
    if (mi.appName === 'no_app') return;
    $('#' + mi.appRootDiv + '_ihs_era_close_btn').on('click', function () {
        if (mi.appSize.type === 'div--position--size--default') $('#' + mi.appRootDiv + '_ihs_era_container').fadeOut('slow');

        if (mi.appSize.type === 'div--position--size--full--width') {
            if (mi.appEntrance.fromTop) $('#' + mi.appRootDiv + '_ihs_era_container').toggle('slide', { direction: "up" });
            else $('#' + mi.appRootDiv + '_ihs_era_container').toggle('slide', { direction: "down" });
        }

        if (mi.appSize.type === 'div--position--size--full--height') {
            if (mi.appEntrance.fromLeft) $('#' + mi.appRootDiv + '_ihs_era_container').toggle('slide');
            else $('#' + mi.appRootDiv + '_ihs_era_container').toggle('slide', { direction: "right" });
        }

        if (mi.appSize.type === 'div--position--size--full--screen') $('#' + mi.appRootDiv + '_ihs_era_container').fadeOut('slow');
    });
}


function handleAppTriggers(mi) {

    if (!window.matchMedia("only screen and (max-width: 768px)").matches) $(window).scrollTop($(window).scrollTop() + 1);
    handleAppCSSTriggers(mi);
    handleAppTextTriggers(mi);

}

function handleAppCSSTriggers(module) {
    if (module.appName === 'no_app') return;
    if (module.appTriggers.cssTriggers.length === 0) return;
    if (module.appPosition === 'div--position--default') {
        module.appTriggers.cssTriggers.forEach((trigger) => {
            if (trigger.app_dom_element_trigger_type) $(trigger.app_dom_element_trigger_name).hide();
        });
        return;
    }

    let cssValidSelector = [];
    module.appTriggers.cssTriggers.forEach((trigger) => {
        if ($(trigger.app_dom_element_trigger_name).length > 0) cssValidSelector.push(trigger.app_dom_element_trigger_name);
    });
    const selector = cssValidSelector.join(',');
    $(selector).css("cursor", "pointer");
    $(selector).attr("title", "Click to open " + module.appTitle);
    $(selector).on('click', function () {
        if (!$('#' + module.appRootDiv).is_on_screen()) eval('toggle_ihs_era_' + module.appRootDiv + '()');
    });
}

function handleAppTextTriggers(module) {
    if (module.appName === 'no_app' || module.appTriggers.textTriggers.length === 0 || module.appPosition === 'div--position--default') return;
    const textTriggers = module.appTriggers.textTriggers;
    const triggerID = module.appRootDiv + '_ihs_era_text_trigger';
    textTriggers.forEach((trigger) => {
        $('p:contains("' + trigger + '")').each(function () {
            $(this).html($(this).html().replaceAll(trigger, `<span ihs_text_trigger_reference = "${module.appRootDiv}" class="${triggerID} ihs_era_text_trigger" title = "Click to open ${module.appTitle}">${trigger}</span>`));
        });


    });

    $(document).ready(function () {
        $('.' + triggerID).on('click', () => {
            if (!$('#' + module.appRootDiv).is_on_screen()) eval('toggle_ihs_era_' + module.appRootDiv + '()');
        });
    });

}

// END COMMMON EDIT-MODE/FRONTEND SCRIPT
// --------------------------------------

// EDIT-MODE SCRIPT
// handle show/hide app from the checkbox shown in module info when in edit mode
// it is not used in frontend
function handleHideApp_EditMode(mi) {
    if (mi.appName === 'no_app') {
        $('#ihs-era-toggle-app-visible-edit-mode_' + mi.instanceId).hide();
        $('#ihs-era-toggle-app-visible-edit-mode-helper_' + mi.instanceId).hide();
        $('#ihs-era-toggle-app-visible-edit-mode-label_' + mi.instanceId).hide();
    }
    else {
        let containerDiv = mi.appPosition !== 'div--position--fixed' ? mi.appRootDiv : mi.appRootDiv + '_ihs_era_container';
        $('#ihs-era-toggle-app-visible-edit-mode_' + mi.instanceId).change(function () {
            if (this.checked) $('#' + containerDiv).hide();
            else $('#' + containerDiv).show();
        });
    }
}
// END EDIT-MODE SCRIPT
// --------------------------------------