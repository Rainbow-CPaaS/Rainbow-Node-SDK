const package = require('./package.json');
const got = require('got');

let licences_Def = {
    "MIT": "http://www.opensource.org/licenses/MIT",
    "ISC": "http://www.opensource.org/licenses/ISC",
    "Apache-2.0": "http://www.opensource.org/licenses/Apache-2.0",
    "BSD 3-Clause": "https://opensource.org/licenses/BSD-3-Clause"
};

let promises = [];
Object.keys(package.dependencies).forEach((key) => {
    if (key === "got") return;
    promises.push(got("https://registry.npmjs.org/" + key.toLowerCase())
        .then(function (data) {
            let currentPackage = require("./node_modules/" + key + "/package.json");
            let version = currentPackage.version;
            var dataParsed = JSON.parse(data.body);
            let name = dataParsed.name;
            let license = dataParsed.license || "MIT";
            let homepage = dataParsed.homepage || dataParsed.repository.url.replace('git:', 'https:').replace('.git', '');
            let licenseUrl = licences_Def[license] || "https://opensource.org/licenses";

            let result = name + " | [www](" + homepage + ") | [" + license + "](" + licenseUrl + ") | NO | " + version;
            return Promise.resolve(result);
        }));
});

Promise.all(promises).then((values) => {
    values.sort((valueA, valueB) => {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
    });
    console.log(values.join("\r\n"));
});