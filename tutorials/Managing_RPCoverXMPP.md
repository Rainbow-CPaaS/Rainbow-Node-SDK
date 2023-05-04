## Managing Remote Procedure Call over XMPP
---


### Preamble
---

The SDK for Node.JS lets you share RPC methods to other XMPP client. It also lets you build a RPC client over XMPP to call method on RPC Server.  

This guide helps you understanding the API for managing and to use the SDK's RPC Service.

<img src="/doc/sdk/node/imgs/RPCoverXMPPFlow1.mmd.png">

### RPC Server
---

Once started, you can manage the RPC Service. You can add or remove RPC methods in the RPC engine.
The methods shared by the server are qualified by properties :
- **`methodName`** {string} The name of the method to be added in RPC server. This is the name used by the RPC Client to call it.
- **`methodCallback`** {string} The callback of the method to be added in RPC server. </BR>It is this method which is called when the SDK receives an RPC request for the linked methodName.
- **`methodSignature`** {string} The method signature. It is auto built from the callback parameter.
- **`methodDescription`** {string} The description of the method to be added in RPC server.
- **`methodHelp`** {string} The help of the method to be added in RPC server. It is return to client when it requires the **system.methodHelp** of it.

The RPC Server provide already shared methods :

- **system.listMethods** This method returns a list of the methods the server has, by name. There are no parameters. 
- **system.methodSignature** This method returns a description of the argument format a particular method expects.  </BR>The method takes one parameter, an XML-RPC string. Its value is the name of the XML-RPC method about which information is being requested.
- **system.methodHelp** This method returns a text description of a particular method.  </BR>The method takes one parameter, an XML-RPC string. Its value is the name of the XML-RPC method about which information is being requested.


### Manage RPC Service
---

- To add methods in the RPC Server Manager to share it you must provide **`methodName`**, **`methodCallback`**, **`methodDescription`**, **`methodHelp`** parameters.
 
```js

rainbowSDK.events.on("rainbow_onready", async () => {
    
    // Add method to RPC Server
    let resultOfAdd = await rainbowSDK.rpcoverxmpp.addRPCMethod("example.trace", (arg1, arg2, arg3, arg4, arg5, arg6, arg7) => {
           let result = undefined;
            // code to be done on server which will return the result to RPC Client.
           ... 
           return result;
    }, "example.trace description", "example.trace help");
    ...    
});

```

- To remove a method from the RPC Server Manager :
 
```js

rainbowSDK.events.on("rainbow_onready", async () => {
    ...
    // Remove method from RPC Server    
    let resultOfAdd = await rainbowSDK.rpcoverxmpp.removeRPCMethod("example.trace");
    ...    
});

```

### RPC Client features
---

Once started, you can use SDK has a RPC client. 

- To call a method on the RPC Server and receiv the result of run you have to provide the **`methodName`** shared by the RPC Server, and an **Array** with the parameters use by the RPC method run.
 
```js

rainbowSDK.events.on("rainbow_onready", async () => {
   ... 
   // Build an Array of parameters for the RPC method on RPC Server.
   let rpcParams = [];

   let obj = {
    "firstName":"Alice",
    "lastName":"Garner",
    "age":20,
    "isEmployed":true,
   };
   rpcParams.push("hello array of number and array of string");
   rpcParams.push([1,2,["arg1", "arg2", {"propertyOfObjInTab1":"mypropertyOfObjInTab1", "propertyOfObjInTab2" : "mypropertyOfObjInTab2"}]]);
   rpcParams.push("param3");
   rpcParams.push(undefined);
   rpcParams.push(obj);
   rpcParams.push({"propertyOne":"valueproperty"});
   rpcParams.push(["valArrayOne"]);
            
   let rpcoverxmppserver_jid="JID OF RPC Server BOT"; // Warning : You need to spot on a resource, so the full jid must be used.

    // Request the run of the method on RPC Server
   let resultOfRpcMethodRun = await rainbowSDK.rpcoverxmpp.callRPCMethod(rpcoverxmppserver_jid,"example.trace", rpcParams);
   ...    
});

```

---

_Last updated January, 26th 2018_
