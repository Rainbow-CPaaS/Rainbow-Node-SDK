Developers information
======================

## Installation
---

Once the repository is cloned, open a shell and launch the following command:

```bash

$ npm install

```

It is strange, but to be sure Mermaid is correctly installed, it is better to launch the following command after `npm install`

```bash

$ npm update

```

## Development
---

Development could be done in any IDE like Studio Code.


### Code Linter
---

To have ESlint that works in background, open a shell and launch the following command:

```bash

$ grunt watch

```

## AfterBuild tests

To start the AfterBuild API Server you need previous do the install and then to run script

```bash
$ npm run startafterbuildApiServer
```

When it runs you need to call API with REST tool (postman...).
First step to start the tests call

`get http://127.0.0.1:3000/startTests`

## Production
---


### Preparation
---


#### Update version
---

Version has to be changed in file `package.json`.

Property `version` need to be updated.


#### Update Changelog (internal)
---

Update file `CHANGELOG.md` according to the list of tickets fixed in that release.

This changelog is not published.


#### Update What's new (for developers)
---

Guide `What is new` has to be updated with all the changes targetting the developers.

4 sections have to be filled:

- 3-Release SDK Breaking Changes: Put in this section, the list of SDK that are deprecated, the deprecation start release (Rainbow release) and the deprecation end date (Rainbow release). E.g. _Starting Rainbow 1.35, the SDK for Node.JS 1.27 and prior are deprecated. You need to migrate to SDK 1.35 before Rainbow release 1.38. Starting Rainbow 1.38, SDK for Node.JS 1.27 and prior will no longer be supported._

- API Breaking Changes: Put in this section, the list of API changes that the developers need to handle in order to use this version. E.g. _Starting SDK 1.35, the method closeMyBubble() has been renammed to closeBubble().

- API Changes: Put in this section, new API that have been added or changed without introducing a breaking change

- Others Changes: Put in this section all others change that are not directly linked to API (E.g. new guide)


### Production
---

There is no specific `grunt` task to launch to produce the SDK for NodeJS

SDK is served as it. Note from me: We will need to package/optimize the build for the future...


### NPM Publish
---

To publish on **NPM** which is where the SDK can be downloaded, the following command has to be launched:

```bash

npm publish

```

### Github Push
---

Source code has to be synchronized with Github (push).


### Github release note
---

Go on Github, and in the release section, edit a new release note and add the content of the changelog.

