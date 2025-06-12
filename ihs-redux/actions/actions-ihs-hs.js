const defaultHSAction = () => (dispatch) => {
    dispatch({ type: FEAllActions.IHS_HS_DEFAULT, payload: null });
};

const updatePageSettings = (page) => (dispatch) => {
    dispatch({ type: FEAllActions.IHS_HS_UPDATE_PAGE_SETTINGS, payload: page });
};

const updateERASettings = (module) => (dispatch) => {
    dispatch({ type: FEAllActions.IHS_HS_UPDATE_ERA_SETTINGS, payload: module });
};

const updateERAPositionXY = (appPositionInfo) => (dispatch) => {
    dispatch({ type: FEAllActions.IHS_HS_UPDATE_ERA_POSITION_XY, payload: appPositionInfo });
};

const updateERASize = (appSizeInfo) => (dispatch) => {
    dispatch({ type: FEAllActions.IHS_HS_UPDATE_ERA_SIZE, payload: appSizeInfo });
};

const updateERAOpenStatus = (appOpenStatusInfo) => (dispatch) => {
    dispatch({ type: FEAllActions.IHS_HS_UPDATE_ERA_OPEN_STATUS, payload: appOpenStatusInfo });
};

const updateUserStatus = (userInfo) => (dispatch) => {
    dispatch({ type: FEAllActions.IHS_HS_UPDATE_USER_STATUS, payload: userInfo });
};
