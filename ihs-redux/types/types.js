OWNActions =
{
    // actions for default reducer
    IHS_HS_DEFAULT: 'IHS_HS_DEFAULT',

    // actions for default reducer prod
    IHS_HS_UPDATE_PAGE_SETTINGS: 'IHS_HS_UPDATE_PAGE_SETTINGS',
    IHS_HS_UPDATE_ERA_SETTINGS: 'IHS_HS_UPDATE_ERA_SETTINGS',
    IHS_HS_UPDATE_ERA_POSITION_XY: 'IHS_HS_UPDATE_ERA_POSITION_XY',
    IHS_HS_UPDATE_ERA_SIZE: 'IHS_HS_UPDATE_ERA_SIZE',
    IHS_HS_UPDATE_ERA_OPEN_STATUS: 'IHS_HS_UPDATE_ERA_OPEN_STATUS',
    IHS_HS_UPDATE_USER_STATUS: 'IHS_HS_UPDATE_USER_STATUS',

    //actions for test reducer
    IHS_HS_TEST_DEFAULT: 'IHS_HS_TEST_DEFAULT'
};

// FEAllActions is a global used by all front end apps that connects to coomon store
// so, we wouldn't want to mess up what other apps needs
// because FEAllActions.<action> is later used by the reducers
if (typeof FEAllActions === 'undefined')
    FEAllActions =
    {
        ...OWNActions
    };
else
    FEAllActions =
    {
        ...FEAllActions, ...OWNActions
    };