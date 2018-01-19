## Managing Groups
---

### Preamble
---

The Rainbow SDK for Node.JS allows to gather contacts into groups in order to organize them using any business logic you need. Once grouped, you can retrieve only contacts belonging to a specific group. This allows you to do actions on somes contacts and not on others.

This tutorial explains how to use these APIs.


### Creating a new group
---

A new group can be created by calling the API `createGroup()`. 

To create a new group, you need to add a name, a description and to choose if the group is a favorite group of not.

Note: Favorite groups are not different but can be filtered and retrieved separately using API `getFavoriteGroups()`.


```js

let isFavorite = true;

// Creation of a new group
nodeSDK.groups.createGroup("aFavoriteGroup", "This is a favorite group", isFavorite).then((groupCreated) => {
    // Do something once the group has been created
    ...
}).catch((err) => {
    // Do something in case of issue when creating the group
    ...
});

```

### Updating the name of a group
---

You can update the name of a group by calling the API `updateGroupName()`

```

	let aGroup = ...;
	let aNewName = ...;
	
	nodeSDK.groups.updateGroupName(aGroup, aNewName).then(group => {
		// Do something once the name of the group has been updated
	}).catch(err => {
		// Do something in case of issue
	});

```

### Adding a user to a group
---

Once you have created a group, you can add users by calling the API `addUserInGroup()`

```js

let aGroup = ...;
let aContact = ...;

nodeSDK.groups.addUserInGroup(aContact, aGroup).then((group) => {
    // Do something once the user has been added to the group
    ...
}).catch((err) => {
    // Do something in case of issue when adding a user to that group
    ...
});

```

### Querying groups
---

For retrieving the list of users in a specific group, the following API `getGroupById()` and `getGroupByName()` can be used:

```js

// Get a group by its name
let familyGroup = nodeSDK.groups.getGroupByName('familyGroup');

// Get a group by its id
let otherGroup = nodeSDK.groups.getGroupById('59e7b508de8b80386e0cfc5d');

```

Once you have a group, the property `users` let you access to the list of users of this group.


### Removing a user from a group
---

At any time, you can remove a user from a group by calling the API `removeUserFromGroup()` like in the follofing sample:

```js

let aGroup = ...;
let aContact = ...;

nodeSDK.groups.removeUserFromGroup(aContact, aGroup).then((groupUpdated) => {
    // Do something once the contact has been removed from the group
     ...
}).catch((err) => {
    // Do something in case of issue when removing a user from that group
    ...
});

```


### Retrieving groups
---

If you want to retrieve all your groups, you have to call the API `getAll()` like in the following:

```js

// Get the existing groups
let groups = nodeSDK.groups.getAll();

// Do something with the groups.
...

```


### Retrieving favorite groups
---

You can retrieve only the favorite groups by calling the API `getFavoriteGroups()`:

```js

// Get the existing groups
let favoriteGroups = nodeSDK.groups.getFavoriteGroups();

// Do something with the favorite groups.
...

```


### Deleting a group
---

A group can be deleted by calling the APi `deleteGroup()` even if there is users in that group.

```js

let aGroup = ...;

nodeSDK.groups.deleteGroup(aGroup).then((groupDeleted) => {
    // Do something once the group has been deleted
    ...
}).catch((err) => {
    // Do something in case of issue when deleting a group
    ...
});

```


### Events
---

When using the Groups API, the Rainbow SDK for Node.JS fired events each time something happens on your groups.

To subscribe to any events, just add the following lines of code:

```js

nodeSDK.events.on("<event_name>", (<parameters>) => {
    // Do something once the event has fired
    ...
});

```


Here is the list of events you can subscribe when using the Groups API:


| **Event** | **Description** |
|-----------|:----------------|
| **rainbow_ongroupcreated** | Fired when a group has been successfully created |
| **rainbow_ongroupupdated** | Fired when a modification occurs on a group |
| **rainbow_ongroupdeleted** | Fired when a group has been deleted |
| **rainbow_onuseraddedingroup** | Fired when a user has been added to a group |
| **rainbow_onuserremovedfromgroup** | Fired when a user has been removed from a group |


### Groups at a glance
---

| **Criteria** | **Description** |
|--------------|:----------------|
| **Group name** | The field `name` must be unique |
| **Group name** | The length of the field `name` is between 1 and 255 characters |
| **Group description** | The length of the field `description` field is between 1 and 255 characters |


---

_Last updated October, 19th 2017_
