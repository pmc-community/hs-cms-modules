console.log("\nCreating REDUX info on HubSpot\n");

const fs = require('fs');
const path = require('path');

const reduxFolder = 'ihs-redux';
const reduxInfoFolder = 'ihs-redux-info';
const reducerInfoMarkup = '//@export(';
const reducerInfoEndMarkup = ')';

function checkReduxFolder(rF) {
    return !fs.existsSync(rF) ? false : true;
}

function checkReduxSubFolder(rF, rSf) {
    const fullSubFolder = rF + '/' + rSf;
    return !fs.existsSync(fullSubFolder) ? false : true;
}

function getSubFolderFiles(rF, rSf) {
    let result = [];
    const folder = rF + '/' + rSf;
    let folderItems = fs.readdirSync(folder);
    folderItems.forEach(folderItem => {
        if (!fs.lstatSync(folder + '/' + folderItem).isDirectory()) {

            if (path.extname(folderItem) === '.js') {
                result.push(folderItem);
            }
        }
    });
    return result;
}

function getReducersInfo(rFolder, rSubfolder, fileList) {
    let result = [];
    fileList.forEach(reducer => {
        let fullPath = rFolder + '/' + rSubfolder + '/' + reducer;
        try {
            const data = fs.readFileSync(fullPath, 'utf8');
            //console.log(data);
            if (data.indexOf(reducerInfoMarkup) >= 0) {
                const startPos = data.indexOf(reducerInfoMarkup);
                const endPos = data.indexOf(reducerInfoEndMarkup, startPos);
                if (endPos > 0) {
                    const redInfo = data.substring(startPos + reducerInfoMarkup.length, endPos);
                    result.push(redInfo);
                }
            }

        } catch (err) {
            console.error('Aww!!! Got some errors whe reading file - ' + fullPath + '\n' + err);
            return;
        }

    });
    return result;
}

if (checkReduxFolder(reduxFolder)) {
    console.log("Found a REDUX folder!");
    const hasActionsFolder = checkReduxSubFolder(reduxFolder, 'actions');
    const hasReducersFolder = checkReduxSubFolder(reduxFolder, 'reducers');
    const hasTypesFolder = checkReduxSubFolder(reduxFolder, 'types');

    if (!hasActionsFolder) { console.log(' * Aw!!! No actions folder! Cannot continue ...'); return; }
    console.log(' * Good!!! Actions folder found!');
    if (!hasReducersFolder) { console.log(' * Aw!!! No reducers folder! Cannot continue ...'); return; }
    console.log(' * Good!!! Reducers folder found!');
    if (!hasTypesFolder) { console.log(' * Aw!!! No types folder! Cannot continue ...'); return; }
    console.log(' * Good!!! Types folder found!');

    const actionFiles = getSubFolderFiles(reduxFolder, 'actions');
    const reducerFiles = getSubFolderFiles(reduxFolder, 'reducers');
    const typesFiles = getSubFolderFiles(reduxFolder, 'types');

    if (actionFiles.length === 0) { console.log(' * Aw!!! No actions defined! Cannot continue ...'); return; }
    if (reducerFiles.length === 0) { console.log(' * Aw!!! No reducers defined! Cannot continue ...'); return; }
    if (typesFiles.length !== 1) { console.log(' * Aw!!! Wrong action types, there should be only one types.js file! Cannot continue ...'); return; }

    if (!fs.existsSync(reduxFolder + '/' + reduxInfoFolder)) {
        fs.mkdirSync(reduxFolder + '/' + reduxInfoFolder);
    }

    let reduxInfo = {};
    reduxInfo['actions'] = actionFiles;
    reduxInfo['reducers'] = reducerFiles;
    reduxInfo['types'] = typesFiles;

    let hublResult = '{% set ihsRedux =' + JSON.stringify(reduxInfo) + ' %}';

    fs.writeFile('ihs-redux/ihs-redux-info/reduxInfo.html', hublResult, err => {
        if (err) console.log('Aww!!! Got some errors when writing redux info file - ' + err);
        else {
            try {
                const data = fs.readFileSync('ihs-redux/ihs-redux-info/reduxInfo.html', 'utf8');
                console.log("\nLook what we did:\n" + data + "\n");
                console.log('Seems to be fine and the redux info file was generated!\n');
                console.log("Job done!!! Happy coding on HubSpot!\n");

                /*
                // generating FEReducersInfo variable from the reducer files
                console.log('Now is time so set the reducers info variable!');

              
                const FEReducersInfo = getReducersInfo(reduxFolder, 'reducers', reducerFiles);

                let varRedInfo;
                if (FEReducersInfo.length > 0) {
                   varRedInfo = 'FEReducersInfo = ' + JSON.stringify(FEReducersInfo) + ';';
                }
                else {
                    varRedInfo = 'FEReducersInfo = [];';
                    console.log('There is no reducers info found! Async reducers will not be injected to the store!');
                }
              
                const varRedInfo = 'FEReducersInfo = [];';
                fs.writeFile('ihs-redux/ihs-redux-info/reducersInfo.js', varRedInfo, err => {
                    if (err) console.log('Aww!!! Got some errors when writing reducer info file - ' + err);
                    else console.log('\nMade it!!! Reducers info is ready to be used, here it is:\n' + varRedInfo + '\n');
                    console.log("Job done!!! Happy coding on HubSpot!\n");
                });
                */

            } catch (err) {
                console.error('Aww!!! Got some errors whe reading file - ' + err);
                return;
            }
        }
    });

}
else {
    console.log("Sorry!!! Nothing to do here, REDUX folder not found!");
    return;
}