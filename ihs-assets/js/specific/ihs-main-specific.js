/*
 * SPECIFIC CODE TO BE USED WITH HUBSPOT SITES
 */

// assign the proper entry point for client script
// ihs_site_main is temporary used in load-global-scripts.html
ihs_site_main = ihsSiteMain_doStuff;

// ---- ENTRY POINT FUNCTIONS
function ihsSiteMain_doStuff(envInfo) {
    const eI = envInfo || {};
    var page;

    // if we have the REDUX store available, let's connect the Page class to the store so we could have all actions available inside the class
    // if the REDUX store is not available, we use the original Page class defined in globals
    // one general page object is created (IHSCSitePage, from global.js) which do apply some general stuff, 
    // then that object creates the specific page object (IHSCSpecificHSSitePage, defined in this script)
    // may look weird but the logic is that the specific script knows what should be done with this specific environment 
    // and uses both general and specific objects do the job
    if (typeof IHSBEStore !== 'undefined ')
        page = new (new IHSBEStore.storeUtilities.ReduxConnectedClass(IHSCSitePage))(
            JSON.parse(eI),
            {
                stateChangeProcessor: IHSCSpecificHSSitePage.processStateChange,
                auth0EventProcessor: IHSCSpecificHSSitePage.handleAuthEvent
            }
        );
    else
        page = new IHSCSitePage(JSON.parse(eI), {});

    page.updatedEnvInfo.editMode ? ihsSiteMain_doStuff_editMode(page) : ihsSiteMain_doStuff_frontend(page);
}

function ihsSiteMain_doStuff_editMode(p) {
    generalInfoToConsole(p);
    handleSiteSettingsInfoHide_editMode();
}

function ihsSiteMain_doStuff_frontend(p) {
    generalInfoToConsole(p);
}
// ---- END ENTRY POINT FUNCTIONS

// ---- EDIT-MODE SCRIPT
function handleSiteSettingsInfoHide_editMode() {
    $(document).ready(() => {
        $('#ihs_site_info_edit_mode_hide').change(function () {
            const selector = [
                '.ihs_site_info_edit_mode_message',
                '.ihs_site_info_edit_mode_title',
                '.ihs_site_info_edit_mode_info_name',
                '.ihs_site_info_edit_mode_info',
                '.ihs_site_info_edit_mode_info_details',
                '.ihs_site_info_edit_mode_separator',
                '.ihs_site_info_edit_mode_info_container',
                '.ihs_site_info_edit_mode_search_in_settings',
                '.ihs_site_info_edit_mode_title_row'
            ];
            if (!this.checked) {
                $(selector.join(',')).hide();
                $('.ihs_site_info_edit_mode').css('height', "auto");
                $('.ihs_site_info_edit_mode').css('padding-top', "20px");
                $('.ihs_site_info_edit_mode_hide_container').removeClass('span1');
                $('#ihs_site_info_edit_mode_hide_label').text("Show site settings applicable to all pages (don't panic!!! this section is not visible in frontend)");
                $('.ihs_site_info_edit_mode').resizable("disable");
            }
            else {
                let heightToSet = minSiteInfoEditModeContainerHeight <= 300 ? 300 : minSiteInfoEditModeContainerHeight;
                $(selector.join(',')).show();
                $('.ihs_site_info_edit_mode').css('height', heightToSet + "px");
                $('.ihs_site_info_edit_mode').css('padding-top', "0px");
                $('#ihs_site_info_edit_mode_hide_label').text("");
                $('.ihs_site_info_edit_mode_hide_container').addClass('span1');
                $('.ihs_site_info_edit_mode').resizable("enable");
            }
        });
        $('#ihs_site_info_edit_mode_hide').trigger('change');
        $('#ihs_site_info_edit_mode_hide').prop('checked', false);

    });
}
// ---- END EDIT-MODE SCRIPT

// ---- COMMMON EDIT-MODE/FRONTEND SCRIPT
function generalInfoToConsole(p) {
    if (p.updatedEnvInfo.siteSettings.throwToConsole) {
        toConsole(
            p.updatedEnvInfo.editMode ?
                '\n' + getTimestamp() + 'Executing HS Page client script/edit mode' :
                '\n' + getTimestamp() + 'Executing HS Page client script/frontend',
            "font-weight:700; color:#000000");
        toConsole('Site and page info:')
        toConsole(p.updatedEnvInfo, '');
        toConsole('\n', '');
    }
}
// ---- END COMMMON EDIT-MODE/FRONTEND SCRIPT

class IHSCSpecificHSSitePage {
    constructor(envInfo) {
        this.envInfo = JSON.parse(envInfo);

        // saving siteSettings in a dedicated class property to prevent potential losing it on the way
        // if needed, it is safe to pass this.siteSettings as argument to methods instead of this.envInfo (then used as this.envInfo.siteSettings)
        // because siteSettings may be undefined. if siteSettings is saved in its own property, then will always be defined and available
        this.siteSettings = this.envInfo.siteSettings;

        if (this.siteSettings.applyDOMCorrections && !this.envInfo.editMode) this.applyDOMCorrections();
        if (this.siteSettings.customiseHSCookieSettings && !this.envInfo.editMode) this.customiseHSCookieSettings();
        if (this.siteSettings.clearWeirdTags && !this.envInfo.editMode) this.clearWeirdTags();
        if (this.siteSettings.openFooterLinksInNewTab) this.openFooterLinksInNewTab();
        if (this.siteSettings.openSocialLinksInNewTab) this.openSocialLinksInNewTab();
        if (this.envInfo.editMode) this.setSearchInSettings();
    }

    // using the parent class (IHSCSitePage) as parameter to this method
    // because it is declared as static, the reference to "this" class/object is no longer available
    // so we cannot access this.store.dispatch and we need to use another REDUX connected class/object
    // to have access to the store methods
    static processStateChange(ei, site, stateChanges, parent) {
        console.log(stateChanges);
    }

    static handleAuthEvent(e, ei, site, parent) {
        parent.ihsHSActions.updateUserStatus(e.detail.auth0data)(parent.store.dispatch);
    }

    setSearchInSettings() {
        $(document).ready(() => {
            const selector = [
                '.ihs_site_info_edit_mode_info_name',
                '.ihs_site_info_edit_mode_info',
                '.ihs_site_info_edit_mode_info_details'
            ];

            let $input = $("input[name='ihs_site_info_edit_mode_keyword']"),
                $clearBtn = $("#ihs_site_info_edit_mode_search_nav_clear_search_btn"),
                $prevBtn = $("#ihs_site_info_edit_mode_search_nav_prev_btn"),
                $nextBtn = $("#ihs_site_info_edit_mode_search_nav_next_btn"),
                $content = $(selector.join(',')),
                $results = [],
                currentClass = "current",
                offsetTop = 70,
                currentIndex = 0;

            function jumpTo() {
                if ($results.length) {
                    let position,
                        $current = $results.eq(currentIndex);
                    $results.removeClass(currentClass);
                    if ($current.length) {
                        $current.addClass(currentClass);
                        position = $current.offset().top - offsetTop;
                        $('#ihs_site_info_edit_mode').animate({
                            scrollTop: position
                        }, 100);
                    }
                }
            }

            $input.on("input", function () {
                let searchVal = this.value;
                $content.unmark({
                    done: function () {
                        $content.mark(searchVal, {
                            // the markup element must be dynamic if we have in page more than one search
                            // element: "<custom_element>",
                            wildcards: "enabled",
                            ignoreJoiners: true,
                            separateWordSearch: false,
                            diacritics: false,
                            done: function () {
                                $results = $content.find("mark");
                                currentIndex = 0;
                                jumpTo();
                            }
                        });
                    }
                });
            });

            $clearBtn.on("click", function () {
                $content.unmark();
                $input.val("").focus();
            });

            $nextBtn.add($prevBtn).on("click", function () {
                if ($results.length) {
                    currentIndex += $(this).is($prevBtn) ? -1 : 1;
                    if (currentIndex < 0) {
                        currentIndex = $results.length - 1;
                    }
                    if (currentIndex > $results.length - 1) {
                        currentIndex = 0;
                    }
                    jumpTo();
                }
            });
        });
    }

    openSocialLinksInNewTab() {
        let socialLinkSelector = '.kl-footer__info a';
        if ($(socialLinkSelector).length > 0) {
            $(socialLinkSelector).each(function () {
                $(this).attr('target', '_blank');
            });
        }
    }

    openFooterLinksInNewTab() {
        let footerLinkSelector = '.kl-footer__group li a';
        if ($(footerLinkSelector).length > 0) {
            $(footerLinkSelector).each(function () {
                $(this).attr('target', '_blank');
            });
        }
    }

    clearWeirdTags() {
        let weirdTags = [
            'img[src="https://hub.innohub.space/hubfs/raw_assets/public/@marketplace/kalungicom/atlas-theme/images/Logo-White.svg"]'
        ];

        weirdTags.forEach(tag => function () {
            $(tag).each(function () {
                $(this).remove()
            });
        });
    }

    // this will customise the cookie banner and cookie settings modal
    // by default, these are inheriting HubSpot styles and may not look and feel like the site
    // also HubSpot doesn't allow too much styling except for the colors of the buttons
    customiseHSCookieSettings() {
        if ($('#hs-eu-cookie-confirmation').length > 0) $('#hs-eu-cookie-confirmation').prop('style').setProperty('font-family', 'inherit', 'important');

        if ($('#hs-eu-close-button-container').length > 0)
            $('#hs-eu-close-button-container')
                .css('width', 'fit-content')
                .css('position', 'absolute')
                .css('float', 'right')
                .css('display', 'contents');

        if ($('#hs-eu-close-button').length > 0) {
            $('#hs-eu-close-button').prop('style').setProperty('color', '#ff6200', 'important');
            $('#hs-eu-close-button').prop('style').setProperty('font-size', '60px', 'important');
        }

        let triggerCookieSettings = ['hs-eu-cookie-settings-button'];
        triggerCookieSettings.forEach(trigger => {
            $('#' + trigger).click(function () {
                IHSCSpecificHSSitePage.applyHSCookieSettingsStyles();
            });
        });
    }

    static applyHSCookieSettingsStyles() {
        if ($('.hs-category-description-header').length > 0) $('.hs-category-description-header').css('height', '20px');
        if ($('.hs-category-description-header h3').length > 0) $('.hs-category-description-header h3').remove();
        if ($('body #hs-modal #hs-modal-content').length > 0) $('body #hs-modal #hs-modal-content').prop('style').setProperty('font-family', 'inherit', 'important');
        if ($('.hs-category-label span').length > 0) {
            $('.hs-category-label span').each(function () {
                $(this).prop('style').setProperty('font-family', 'inherit', 'important');
            });
        }
        if ($('#hs-modal-close-button').length > 0) {
            $('#hs-modal-close-button').prop('style').setProperty('color', '#ff6200', 'important');
            $('#hs-modal-close-button').css('font-size', '60px', 'important');
        }
    }

    // clean-up the dom a little bit
    // there are no errors or warnings but the performance tests (on webpagetest.org or wev.dev)
    // shows some opportunities to improve - may increase SEO ranking
    applyDOMCorrections() {

        // g tag id is useless so it can be removed since HubSpot is giving the same id for all g tags in a module
        // in this case we are talking about the circle buttons for fixed position div's
        // because of this, duplicate id warnings are shown by webpagetest.org or web.dev
        $("g").removeAttr("id");
        $(".hs_cos_wrapper_type_icon").removeAttr("id");

        // for some reason, Notify Snack component used in ihs-message-hub gives the same id to all message snacks
        // the id is anyway useless so we can get rid of it
        // because duplicate id warnings may be shown by webpagetest.org or web.dev
        $(".SnackbarItem-message").removeAttr("id");

        // for some reason, both mobile and desktop #hs_cos_wrapper_Navbar_with_Menu_language_switcher
        // are always on page although they are shown accordingly
        // one of them must be removed so no duplicate id warnings to be shown by webpagetest.org or web.dev
        $("#hs_cos_wrapper_Navbar_with_Menu_language_switcher").each(function () {
            if (window.matchMedia("only screen and (max-width: 768px)").matches) {
                if ($(this).parent().attr("class") === "kl-navbar__end") $(this).remove();
            }
            else {
                if ($(this).parent().attr("class") === "kl-navbar__mobile") $(this).remove();
            }
        });

        // some links must be re-styled to meet best practices
        // otherwise webpagetest.org or web.dev will report accessibility issues
        let linksToBeReStyled = [
            'https://innohub.space/eng/privacy/',
            'https://innohub.space/eng/cookie-policy/'
        ];

        let linksToBeExcluded = [
            'hs-modal-save-settings',
            'hs-modal-accept-all'
        ];

        let linkSelector = '';
        linksToBeReStyled.forEach(link => {
            linkSelector = 'a[href="' + link + '"]';
            if ($(linkSelector).length > 0) {
                $(linkSelector).prop('style').setProperty('font-weight', 700, 'important');
                $(linkSelector).prop('style').setProperty('color', '#000', 'important');
            }
        });

        // some links are hidden and shown only when a modal is open after a click on something
        let triggerHiddenLinksToBeStyled = ['hs-eu-cookie-settings-button'];
        triggerHiddenLinksToBeStyled.forEach(trigger => {
            $('#' + trigger).click(function () {
                $('#hs-modal a').each(function () {
                    if ($(this).length > 0) {
                        if (linksToBeExcluded.indexOf($(this).attr('id')) === -1) {
                            $(this).prop('style').setProperty('font-weight', 700, 'important');
                            $(this).prop('style').setProperty('color', '#000', 'important');
                        }
                    }
                });
            });

        });

    }
}