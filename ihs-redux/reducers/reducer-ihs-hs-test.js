const initialHSTestReducerState = { ihs_hs_test: '' };

function ihsHSTestReducer(state = initialHSTestReducerState, action) {

    switch (action.type) {
        case FEAllActions.IHS_HS_TEST_DEFAULT:
            return {
                ...state,
                ihs_hs_test: typeof state.ihs_hs_test === 'undefined' ? 'ihs_hs_test' : state.ihs_hs_test + 'ihs_hs_test'
            };

        default:
            return state;
    }

}

// The name of the reducer function shall be enforced because the minified version (if used)
// of this js file will alter this name and this will cause errors when
// further configure the store for the reducer
Object.defineProperty(ihsHSTestReducer, "name", { value: 'ihsHSTestReducer' });

const ihsHSTestReducer_Actions = { defaultHSTestAction };
ihsHSTestReducer_redInfo = { function: ihsHSTestReducer, persist: false, actions: ihsHSTestReducer_Actions };

if (typeof FEReducersInfo === 'undefined') FEReducersInfo = [];
FEReducersInfo.push('ihsHSTestReducer_redInfo');
