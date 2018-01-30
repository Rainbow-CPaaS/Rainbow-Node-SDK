Developers information
======================

## Installation

Once the repository is cloned, open a shell and launch the following command:

```bash
$ npm install
```


## Automation lint

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