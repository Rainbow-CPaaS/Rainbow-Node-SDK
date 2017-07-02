## What's new
---

### SDK for Node.JS 1.27 (July 2017)

---

Welcome to the new release of the Rainbow SDK for Node.JS. There are a number of significant updates in this version that we hope you will like, some of the key highlights include:

**SDK**

- The SDK for Node.JS now accepts application key and secret for authenticating on Rainbow. Until September, applications without key and secret can continue to connect to Rainbow.

- First SDK for Node.JS ESR (extended support release) version 1.27.0 is available.

- SDK for Node.JS now manages the language of messages

**API**

 - New methods `acceptInvitationToJoinBubble()`, `declineInvitationToJoinBubble()` have been added to answer a request of joining a bubble

 - New event `rainbow_onbubbleinvitationreceived` has been added for handling invitation to join a bubble

 - New event `rainbow_onbubbleownaffiliationchanged`has been added for handling user connected affiliation changes in a bubble


### Previous versions

---

Here is the complete list of notable changes for the previous releases of the SDK for Node.JS


#### v0.10.18

---

**SDK**

- No changes

**API**

- Only bug fixing


#### v0.10.14

---

**SDK**

- No changes

**API**

- [COmpatibility Break] API `getContactByJid()` taken into account privacy concerns - Internal change

- Add parameter boolWithHistory in API `createBubble()` to offer or not full history for newcomers


#### v0.10.13

---

**SDK**

**API**

 - [Compatibility Break] Methods `getContactByJid()`, `getContactById()` or `getContactByLoginEmail()` are now Promise based functions.

 
 