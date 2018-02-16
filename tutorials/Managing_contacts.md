## Managing Contacts
---


### Preamble
---

The SDK for Node.JS lets you retrieving your network's contacts as well as searching for contacts you want to interact with. 

This guide helps you understanding the API to use for managing your contacts, searching for contacts and access to your account information.


### Limitations
---

The SDK for Node.JS has a "fixed" network which means that using this SDK, you can't neither add contact to your network nor accept invitation from others users.

This limitation has been put in place to avoid misuage and abuse of the user's network. 

So if you want to populate your Node.JS application, you have to use either a Rainbow client or you can do it using a customized web application based on the SDK for Web.


### Accessing to your account
---

Once started, you can have access to your account information using the property `connectedUser` like in the following:


```js

...
nodeSDK.events.on("rainbow_onready", () => {
    
    // Get your account information
    let account = nodeSDK.connectedUser;
    
    // Do something with your information
    ...    
});

// the `account` parameter will contain the following information
{
    displayName: 'John Doe',
    companyName: 'My Rainbow Company',
    loginEmail: 'johndoe@myRainbowCompany.com',
    nickName: 'jdoe',
    title: 'Mr',
    jobTitle: 'Software Developer',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    companyId: '581b4111383b2852d37aa09a',
    jid_im: 'd29f69b505074c83a8aadc555f99a713@sandbox-all-in-one-prod-1.opentouch.cloud',
    jid_tel: 'tel_d29f69b505074c83a8aadc555f99a713@sandbox-all-in-one-prod-1.opentouch.cloud',
    jid_password: '2a581e11f2be4ac38411dc54916f5242',
    createdByAdmin: { 
        userId: '5805dd01383b2852d37a9e63',
        loginEmail: 'admint@myRainbowCompany.com' 
    },
    language: 'en',
    isTerminated: false,
    terminatedDate: null,
    timeToLive: -1,
    lastExpiredTokenRenewedDate: '2017-09-19T08:17:14.114Z',
    lastLoginFailureDate: null,
    failedLoginAttempts: 0,
    loggedSince: '2017-09-19T14:31:48.960Z',
    lastLoginDate: '2017-09-19T14:31:48.960Z',
    firstLoginDate: '2016-11-04T19:27:27.784Z',
    createdByAppId: null,
    createdBySelfRegister: false,
    lastAvatarUpdateDate: null,
    lastUpdateDate: '2017-09-19T08:17:14.118Z',
    initializationDate: '2016-12-15T10:19:29.994Z',
    isInitialized: true,
    activationDate: '2016-11-03T13:47:26.241Z',
    creationDate: '2016-11-03T13:47:26.241Z',
    siteId: null,
    organisationId: null,
    visibleBy: [ '5805e22b383b2852d37a9e65' ],
    visibility: 'private',
    profiles: [ 
        { 
            subscriptionId: '5820e7e2b57d529f61b53620',
            offerId: '5820e7e046f3ee860b2564ca',
            offerName: 'Essential',
            profileId: '5820e7e046f3ee860b2564c9',
            profileName: 'Essential',
            provisioningNeeded: [],
            assignationDate: '2017-03-05T11:06:24.160Z',
            status: 'active',
            isDefault: true 
        } 
    ],
    accountType: 'free',
    adminType: 'undefined',
    roles: [ 'user' ],
    isActive: true,
    phoneNumbers: [],
    emails: [ { email: 'johndoe@myRainbowCompany.com', type: 'work' } ],
    lastName: 'Doe',
    firstName: 'John',
    id: '581b3fee383b2852d37aa096',
    isInDefaultCompany: false }
}

```


The main information are :

- **Your identity description**: Fields `firstname`, `lastname`, `companyName` and `companyId`). Use these information to know who you are. 

- **Your profile**: Field `accountType`. Use this information to know the level of feature you have access.

- **Your role**: Fields `roles` and `adminType`. Use these information to know the right on API you have.

- **Your visibility**: Fields `visibility` and `visibleBy`. Use these information to know if you are seen from others or not

- **Your Rainbow identification**: Field `id`. Mainly used to distinguish you from others members of a Bubble.


### Accessing to contacts in your network
---

The fixed list of contacts of the connected user can be retrieved using the API `getAll()` like in the following


```js

nodeSDK.events.on("rainbow_onready", () => {

    // Get your network's list of contacts
    let contacts = nodeSDK.contacts.getAll();
    
    // Do something with this list
    ...
    
});

```


For each contact, the following information is available:

```JSON

{ 
    "displayName": 'Robert Doe',
    "companyName": 'A company',
    "loginEmail": 'rdoe@acompany.com',
    "nickName": 'rdoe',
    "title": 'Dr',
    "jobTitle": 'CEO',
    "country": 'USA',
    "timezone": 'America/Los_Angeles',
    "companyId": '5805e150383b2852d37a9e64',
    "jid_im": '8e59c1b6661641968d59e901bf8bb1ea@sandbox-all-in-one-prod-1.opentouch.cloud',
    "jid_tel": 'tel_8e59c1b6661641968d59e901bf8bb1ea@sandbox-all-in-one-prod-1.opentouch.cloud',
    "lastAvatarUpdateDate": '2016-11-04T19:34:29.292Z',
    "lastUpdateDate": '2017-09-18T11:57:31.695Z',
    "adminType": 'undefined',
    "roles": [ 'user', 'admin' ],
    "phoneNumbers": [],
    "emails": [ { "email": 'rdoe@acompany.com', "type": 'work' } ],
    "lastName": 'Doe',
    "firstName": 'Robert',
    "isTerminated": false,
    "language": 'en',
    "id": '581b405d383b2852d37aa098',
    "resources": { 
        'web_win_1.29.3_NOOILjkW': { 
            "priority": '5',
            "show": 'away',
            "delay": '',
            "status": '',
            "type": 'desktopOrWeb' 
        } 
    },
    "presence": 'online',
    "status": '' 
}

```

When a contact is in your network, you have access the full vcard of that contact:

- **Identification of the contact**: you have access to all you need to identify and interact with the contact: `id`, `jid_im`, `loginEmail`, `firstName`, `lastName`, `jobTitle`, `companyName`, `phoneNumbers`, `emails`,... 

- **Role of the contact**: You know the role of the contact using the field `roles`

- **Availability of the contact**: 3 fields help you understanding the availability of a contact: `resources`, `presence` and `status`. The next paragraph will explains how to deal with these information.


### Understanding network's contacts availability
---

As seen in the previous paragraph, contacts that are in your network share their availability with the you.

The availability of a contact is computed by the SDK for Node.JS and depends on

- The use or not of one or several Rainbow based applications simultaneously (can be the official Rainbow applications or Rainbow applications based on any SDK)

- The use of the contact's phone 

- The calendar availability in case where the contacts share his calendar availability (Enterprise profile only) 


#### Presence and Status
---

According to these different kind of usage and availability, the SDK for Node.JS computes a global availability that are represented in the parameters `presence` and `status`.

Here is a table that sums-up the different values for the parameters `presence` and `status`:

| Presence | Status | Meaning |
|:---------|:-------|:--------|
| **offline** | | The contact is not connected to a Rainbow based application or is invisible |
| **online** | | The contact is connected to Rainbow using at least a desktop application |
| **online** | **mobile** | The contact is connected to Rainbow using a mobile application only |
| **away** | | The contact doesn't use the application since a while |
| **busy** | | The contact has manually asked to be not disturbed |
| **busy** | **phone** | The contact is engaging in a phone call |
| **busy** | **audio** or **video** | The contact is engaging to an audio or video call |
| **busy** | **sharing** | The contact is engaging to a screen sharing call |
| **busy** | **presentation** | The contact is using an application in full screen mode |

The calendar availability is not taken into account for computing the global availability of a contact.


#### Resources
---

Additionnaly to these parameters `presence` and `status`, there is a parameter `resources` that list all the different resources used by the contact to connect to Rainbow. Each resource represents an application used by the contact and connected to Rainbow.

Each resource is represented with a `JSON` object containing a dedicated presence and status information (e.g. I can be online with my IOS Rainbow application and engaging in a WebRTC video call using my Rainbow Web application)

The calendar availability is a specific resource that could appear in that list of resources if this contact has decided to share it.

So by using these parameters `presence`, `status` and `resources`, you will be able to decided on your own how to deals with a contact.

_Note_: Availability of a contact that is not in your network is not known. `presence` is set to `unknown` for that case. 


#### Listening when a contact availability changes
---

Each time the availability of a contact changes (in fact, each time the availability associated to a resource changes), the event `rainbow_oncontactpresencechanged` is fired and can be listen using the following code:


```js

nodeSDK.events.on("rainbow_oncontactpresencechanged", (contact) => {
    // Do something when the availability changes for this contact
    ...
});

```


### Search a contact by ID
---

Any Rainbow user can be searched by his `id` to get his associated vcard.

_Note_: Depending the visibility of this user, the vcard can be reduced to a minimal set of information. See the guide [Users visibility and privacy](/#/documentation/doc/hub/users-visibility-and-privacy) to have more information on that topic.

Use the API `getContactById()` like in the following:


```js

nodeSDK.contacts.getContactById("570e12832d768e9b52a8b7ea").then((contact) => {
    if(contact) {
        // Do something with the contact found
        ...
    }
    else {
        // Do something if the contact has not been found (id should be incorrect)
        ...
    }
}).catch((err) => {
    // Do something in case of failure
    ...
});

```


### Search a contact by JID
---

Any Rainbow user can be searched by his `jid` to get his associated vcard.

The same principle as for the `id` applies here.

Use the API `getContactByJid()` to find a user by his `jid`:


```js

nodeSDK.contacts.getContactByJid("d29f69b505074c83a8aadc555f99a713@sandbox-all-in-one-prod-1.opentouch.cloud").then((contact) => {
    if(contact) {
        // Do something with the contact found
        ...
    }
    else {
        // Do something if the contact has not been found (jid should be incorrect)
        ...
    }
}).catch((err) => {
    // Do something in case of failure
    ...
});

```


### Search a contact by loginEmail
---

Any Rainbow user can be searched by his `loginEmail` to get his associated vcard.

But as the `loginEmail` is a private information only accessible for public contact (which means contacts in the same company, same organisation or in a public company), you may have no result if the contact is private.

So take care using this API because you can have no result even is a contact with this `loginEmail` exists. See the guide [Users visibility and privacy](/#/documentation/doc/hub/users-visibility-and-privacy) to have more information on that topic.

Use the API `getContactByLoginEmail()` like in the following:


```js

nodeSDK.contacts.getContactByLoginEmail("rdoe@acompany.com").then((contact) => {
    if(contact) {
        // Do something with the contacts found
        ...
    }
    else {
        // Do something if the contact has not been found (do not exist or is private...)
        ...
    }
}).catch((err) => {
    // Do something in case of failure
    ...
});

```


---

_Last updated January, 26th 2018_
