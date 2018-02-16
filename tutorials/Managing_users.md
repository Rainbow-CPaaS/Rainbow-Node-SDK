## Managing Users and Guests
---

### Preamble
---

If the Rainbow account used by the SDK for Node.JS has the right `company_admin` or `organization_admin`, the SDK for Node.JS is able to create new users for the companies managed or to invite new users to join a company.

This guide describes how to configure the SDK for Node.JS for creating or inviting new users and updating their information.


### Roles and Rights
---

Depending the right of the connected user, you can't or not manage users:

| Role | Right | Can create users | Details |
|------|-------|-------|:-------|
| `user`| | NO | Can't create or manage users | 
| `admin` | `site_admin`| NO | Can't create or manage users |
| `admin` | `company_admin`| YES | With this right, the SDK can create or invite new users in the company managed and update their information |
| `admin` | `organization_admin` | YES | with this right, the SDK can create or invite new users for all companies of the organization and update the users information |


### Creating a new Rainbow user account
---

A new Rainbow user account can be created in a company by calling the API `createUserInCompany()`.


#### Basic user creation 
---

Creating a new user can be done like in the following code sample:


```js

let userEmailAccount = "john.doe@myCompany.com";
let userPassword = "********";
let userFirstname = "John";
let userLastname = "Doe";

nodeSDK.admin.createUserInCompany(userEmailAccount, userPassword, userFirstname, userLastname).then((user) => {
    // Do something when the user has been created and added to that company
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

Once succeeded, the user John Doe is a new Rainbow user in the same company as the connected user.

If you have the `organization_admin` right which means that you manage an organization (i.e. several companies), you have the right to create a user in one of the companies you manage by using the parameter `companyId` such as in the following:

```js

let userEmailAccount = "john.doe@myCompany.com";
let userPassword = "********";
let userFirstname = "John";
let userLastname = "Doe";
let companyId = "5978e048f8abe8ad97357f06"; // The target company

nodeSDK.admin.createUserInCompany(userEmailAccount, userPassword, userFirstname, userLastname, companyId).then((user) => {
    // Do something when the user has been created and added to that company
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

Once succeeded, the user John Doe is associated to the company specified by the parameter `companyId`. 

In all cases, this user account will have a `user` right and his language will be set by default to `en-US`.

The end-user is not notified about the creation of the account so you have to contact him manually.


#### Setting a user language
---

If you want to set the language associated to the user, you can use the API `createUserInCompany()` with an extra parameter like in that sample:


```js

let userEmailAccount = "jean.dupont@myCompany.com";
let userPassword = "********";
let userFirstname = "Jean";
let userLastname = "Dupont";
let companyId = null;
let language = "fr-FR";

nodeSDK.admin.createUserInCompany(userEmailAccount, userPassword, userFirstname, userLastname, null, language).then((user) => {
    // Do something when the user has been created and added to that company
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```


Language code follows the format `ll-CC` where `ll` is the language and `CC`is the culture name (using uppercase letter). 

Note: If the language used is managed by Rainbow clients, when connecting, the Rainbow graphical interface will be displayed in that language.


### Creating a new Rainbow guest account
---

The SDK for Node.JS allows to create Rainbow **Guest** users.

A Guest user is a Rainbow user 

- With restricted rights: he can call only a limited subsets of API

- With a limited time-to-live (TTL): After a pre-defined period, the Guest user account is no more accessible (can't access to Rainbow)

- Without a real identity: Guest user have a fistname/lastname to be identified, but no real email and no other private data associated. So a Guest account can't be found using the search.


#### Usage of Guest accounts
---

Guest accounts can be used when you need to interact temporarily with a end-user and you don't need that this user creates a real Rainbow user.

An example could be when a end-user visits you web site and wants to discuss with someone (in chat, audio or video). In that case, you will not create a new Rainbow account because in one hand the user is not identified and in the other hand, once the conversation is finished, the user will quit the website and perhaps never comes again.

Guest accounts have a TTL (time to live). Once expired, these accounts can connect to Rainbow anymore (requests of service will fail). 


#### Basic creation
---

For creating a new Guest user account, you need to have `company_admin` right and to call the API `createGuestUser()` like in the following sample:


```js

let guestFirstname = "Jean";
let guestLastname = "Dupont";
let language = "en-US";
let ttl = 86400 // active for a day

nodeSDK.admin.createGuestUser(guestFirstname, guestLastname, language, ttl).then((guest) => {
    // Do something when the guest has been created and added to that company
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```


Once the user has been created, the `guest` parameter received will contain the credentials needed to log-in the Guest account.


#### Anonymous guest
---

Sometime, you don't need to specify a firstname, a name and a language. Guest without these informations are called anonymous guest. 

You can create anonymous guest by calling the API `createAnonymousGuestUser()` like in the following:

```js

let ttl = 86400 // active for a day

nodeSDK.admin.createAnonymousGuestUser(ttl).then((guest) => {
    // Do something when the anonymous guest has been created and added to that company
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

#### Additionnal information around Guest usage
---

At this time of writing, it's the responsability of your Node.JS application to transmit these information to the requesting app that needs it.

Basically, the scenario is the following:

- Your front-end application requests a Guest account to your Node.JS application (This part is outside of the scope of Rainbow)

- Your Node.JS application uses the SDK for Node.JS for creating a Guest user account (anonymous or not)

- Your Node.JS transmit the credentials to the front-end application (This part is outside of the scope of Rainbow)

- The front-end application uses the SDK for Android, IOS or SDK for Web with these credentials and connects to Rainbow

Note: In order to securize more the Guest account, this scenario is subject to change in the future.

Here are some limitations for **Guest** accounts:


| A Guest can | A Guest can't |
|:------------|:--------------| 
| Send chat message to a recipient | Be searched by others Rainbow users |
| Receive chat message from a recipient | Be added to the Network of a Rainbow user |
| Be invited to a Bubble conversation | Create a Bubble |
| Send chat message to a Bubble | Have owner right in a Bubble |
| Receive chat message from a Bubble | Leave a Bubble |
| Call in audio and video call a recipient | Receive Email notification |
| Receive audio and video call from a recipient | Be associated to a PBX device and monitor it |
| Receive a file shared by a recipient | Send a file to a recipient |
| Receive a file shared in a Bubble | Send a file to a Bubble |
| | Add a Rainbow user or others Guests in his network |
| | Be added to the network of a Rainbow user |


### Inviting a new user to Rainbow
---

New users (not Guest) can be inviting to join Rainbow by sending them an email containing a link to connect to Rainbow and to join your company if you are `company_admin` or a company you manage if you are an `organization_admin`.


#### Basic invitation
---

Sending an invitation to join a company in Rainbow can be done by calling the API `inviteUserInCompany()` like in the following code sample:

```js

let userEmailAccount = "joe.smith@myCompany.com";
let companyId = "5978e048f8abe8ad97357f06";

nodeSDK.admin.inviteUserInCompany(userEmailAccount, companyId).then((inviteSent) => {
    // Do something with the invite sent
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

When calling this API, an email is sent to the recipient using the default Rainbow template and using the language by default `en-US`.


#### Setting the invitation language
---

You can choose to send the invitation using a different language. To do that, simply add an extra parameter to the API `inviteUserInCompany()`:


```js

let userEmailAccount = "paul.durand@myCompany.com";
let companyId = "5978e048f8abe8ad97357f06";
let language = "fr-FR;

nodeSDK.admin.inviteUserInCompany(userEmailAccount, companyId, language).then((inviteSent) => {
    // Do something with the invite sent
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

Using this sample, the invitation will be received in French by the recipient.


#### Adding a custom message
---

You can add an extra message that will be displayed with the default content of the email sent by doing the following:


```js

let userEmailAccount = "mark.dunkan@myCompany.com";
let companyId = "5978e048f8abe8ad97357f06";
let language = "en-US;
let customMessage = "Dear Mark, hope you will like it!, Franck";

nodeSDK.admin.inviteUserInCompany(userEmailAccount, companyId, language, customMessage).then((inviteSent) => {
    // Do something with the invite sent
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

### Updating user information
---

At any time, you can change information regarding the user or Guest created.


#### Changing the password
---

The password of a user or a Guest can be changed by calling the API `changePasswordForUser()` like in that sample:


```js

let userId = "5978e1a3f8abe8ad97357f09";
let newPassword = "************";

nodeSDK.admin.changePasswordForUser(userId, newPassword).then((user) => {
    // Do something when the password has been changed
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```


#### Setting additional information
---

Additional information can be set to user or a Guest by calling the API `updateInformationForUser()` like in the following code samples:

This first example set or update basic user information


```js

let userId = "5978e1a3f8abe8ad97357f09";
let objData = {
    "firstName": "John",
    "lastName": "Mitchell",
    "nickName": "Jo",
    "title": "Mr",         // Like Mr, Mrs, Sir, Lord, Lady, Dr, Prof...
    "jobTitle": "Software developer"
};

nodeSDK.admin.updateInformationForUser(objData, userId).then((user) => {
    // Do something when the information has been changed
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```


This second example will update the language, country and timezone:


```js

let userId = "5978e1a3f8abe8ad97357f09";
let objData = {
    "country": "USA",               // ISO 3166-1 alpha3
    "language": "en-US",            // ISO 639-1, with the regional variation using ISO 3166‑1 alpha-2 (separated by hyphen)
    "timezone": "America/New_York"  // IANA tz database based on Area/Location
};

nodeSDK.admin.updateInformationForUser(objData, userId).then((user) => {
    // Do something when the information has been changed
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```


Finally, you can update emails of the user


```js

let userId = "5978e1a3f8abe8ad97357f09";
let objData = {
    "emails": [
        {
            "email": "toto@home.com",
            "type": "home"
        },
        {
            "email": "toto@home.com",
            "type": "work"
        },
        {
            "email": "toto@home.com",
            "type": "other"
        }
    ]
};

nodeSDK.admin.updateInformationForUser(objData, userId).then((user) => {
    // Do something when the information has been changed
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```

### Deleting users
---

Users and Guests can be deleted by calling the API `deleteUser()` like in that code sample:


```js

let userId = "5978e1a3f8abe8ad97357f09";

nodeSDK.admin.deleteUser(userId).then((user) => {
    // Do something when the user has been deleted
    ...
}).catch((err) => {
    // Do something in case of error
    ...
});

```


In fact, for legal reason, the user data is kept by Rainbow for several months before being really removed. But the user is no more seen in the company nor searchable. You can check the status of a user by looking at the property `isTerminated`. If the value is `true` the user has been deleted.


---

_Last updated August, 18th 2017_
