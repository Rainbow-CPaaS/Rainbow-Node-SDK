## Managing Favorites
---

Rainbow Node SDK allows you to store links to conversations with Users and Bubbles in a handy list called Favorites.

Favorites are essentially a JavaScript array containing objects. Each of those objects the following properties:

-	`type` - describing a type of a Favorite. Can be set either to `user` or `bubble`	
-	`id` - representing an ID of a **Favorite**
-	`peerId` - a dbId property of a Bubble or User that is linked to Favorite object
-	`contact` or `room` - essentially a `contact` or `bubble` object that is linked to Favorite item

With those four you will have a good peak on what Users or Bubbles are the most used and essential for the application.


### Retrieving Favorites List
---

You can retrieve Favorites List from the server by calling `fetchAllFavorites()` method that returns an Array. Favorites Array can be empty when no User or Bubble has been added to Favorites.
It is an asynchronous method, therefore it returns a Promise containing the Favorites Array.

```javascript

// somewhere in your code

	rainbowSDK.favorites.fetchAllFavorites()
		.then(function (favorites) {
			// do something with the Favorites Array retrieved from the server
		})
		.catch(function (err) { console.log (err) })

```

### Creating a Favorite
---

To create a Favorite (add a new object to the Favorites list), use the `favorites.createFavorite()` method which accepts a Bubble or User dbId and type as arguments. `createFavorite()` returns a Promise due to its asynchronous nature.

A snippet below shows how to create a Favorite of each of the types:

```javascript

let user = UserObject;
let bubble = BubbleObject;

// Create a new Favorite from an User:

rainbowSDK.favorites.createFavorite(user.id, "user")
	.then( /* do something once the Favorite has been created */)
	.catch( /* do something in case of an error */)

	
// Create a new Favorite from a Bubble:

rainbowSDK.favorites.createFavorite(bubble.id, "bubble")
	.then( /* do something once the Favorite has been created */)
	.catch( /* do something in case of an error */)

```

Once a new Favorite is created, an event is going to be sent. Think of it as a confirmation of the successful Favorite creation process.

```javascript

// somewhere in your code:

    rainbowSDK.events.on('rainbow_onfavoritecreated', (data) => {
        logger.log("debug", "rainbow_onfavoritecreated - rainbow event received.", data);
    });

```

### Deleting a Favorite
---

Analogically, it is possible to delete a Favorite from the Favorites list by calling the `favorites.deleteFavorite()` method which accepts a Favorite ID string. It is asynchronous and it returns a Promise.

```javascript

let favorite = FavoriteObject; // Favorite Object

	// Delete a Favorite
	rainbowSDK.favorites.deleteFavorite(favorite.id)
		.then(/* do something once the Favorite has been deleted */)
		.catch(/* do something in case of an error */)

```

Similarly to creating a Favorite, while deleting one, an event will be dispatched. It is a definite confirmation that a Favorite has been deleted.

```javascript

		rainbowSDK.events.on('rainbow_onfavoritedeleted', (data) => {
                logger.log("debug", "rainbow_onfavoritedeleted - rainbow event received.", data);
		});

```


_Last updated july, 8 2019_
