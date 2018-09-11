# TYPESCRIPT in SDK for Node.JS

Here is the howto TypeScript in **Rainbow-Node-SDK**

## Sources
* The typescript sources are in folder PROJECT/src folder.
* It need to be compiled to create the javascript corresponding files in projet root folder. And also before the npm deploy.  
*Note: the compiled code will be added to old javascript code, so be carefull to avoid using an already existing file in root structure for a new typescript file.*

## Compil
* to initiate typescript environment  
`npm install typescript -g`  
`npm install @types/node`
* to compil  
`tsc -p src/`  
*Note: Some GUI automùatically compil typescript (ex: WebStorm, Visual Studio Code)*
