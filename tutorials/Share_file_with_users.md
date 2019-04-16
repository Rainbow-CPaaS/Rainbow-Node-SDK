## Sharing files

---

Using the Rainbow SDK for Node, you can share files with an other Rainbow user or you can share files within a bubble.

This tutorial will explain how to use the FileStorage service for sharing files in Rainbow.


### Preamble

---

All files shared with others Rainbow users are stored on Rainbow until you decide to remove it. To avoid bad usage and depending your profile, you have some limits.

The following table sums-up the size allowed depending on your profile:

| Profile | Quota | Details |
|---------|-------|:--------|
| Essential | 1 GB | You can share on Rainbow up to 1 GB of files |
| Business | 1 GB | You can share on Rainbow up to 1 GB of files |
| Enterprise | 20 GB | You can share on Rainbow up to 20 GB of files |


The following table shows the other specifications applied to any profile:

| Limit | Limit | Details |
|---------|-------|:--------|
| File Size | 100 MB | You can share files with size lower than 100 MB |
| Files Number | No limit | You can share as many files as your want limited to your quota |


### Knowing the file sharing quota

---

In order to know if you can share a new file, you can call the API `getUserQuotaConsumption()`


```javascript

    rainbowSDK.fileStorage.getUserQuotaConsumption().then(function(quota) {
        // Do something with the quota
        ...
    }).catch(function(err) {
        // DO something if there is an error getting the quota
        ...
    });

```


The quota is a JavaScript Object containing the following properties:


```json

    {
        "feature": "FILE_SHARING_QUOTA_GB",     // Quota associated to the feature File Sharing
        "currentValue": 120439,                 // Current total size of files uploaded
        "maxValue": 1073741824,                 // Maximum of size allowed
        "unit": "octet"                         // Unit used
    }

```


Each time you share a file with a user or within a bubble or when you remove a file from Rainbow, you can ask the API `getUserQuotaConsumption()` to have an update.


### Sharing a file with a Rainbow user

---

When in a conversation with a Rainbow user, you can share a file by calling the API `uploadFileToConversation()` like in the following example


```javascript

    let contactIdToSearch = "...";
    let fileInfos = {};
    fileInfos.path = "./path/to/my/file";
    fileInfos.size = "SizeInOctets";
    fileInfos.type = "MimeType";
    fileInfos.name = "filename";

    // Retrieve a contact by its id
    rainbowSDK.contacts.searchById(contactIdToSearch)
    .then(function(contact) {
        // Retrieve the associated conversation
        return rainbowSDK.conversations.openConversationForContact(contact);
    }).then(function(conversation) {
        // Share the file
        return rainbowSDK.fileStorage.uploadFileToConversation(conversation, fileInfos, "My message ");
    }).then(function(message) {
        // Do something once the file has been shared
        ...
    }).catch(function(err) {
        // Do somehting in case of error
        ...
    });

```


The API `uploadFileToConversation()` takes an Object describing the file.

### Sharing a file within a Bubble

---

Sharing a file within a Bubble can be done as simply as with a contact by calling the API `uploadFileToBubble()`.


```javascript

    let bubbleId = "...";
    let fileInfos = {};
    fileInfos.path = "./path/to/my/file";
    fileInfos.size = "SizeInOctets";
    fileInfos.type = "MimeType";
    fileInfos.name = "filename";

    // Retrieve the bubble
    var bubble = rainbowSDK.bubbles.getBubbleById(bubbleId);
    
    // Upload the file
    rainbowSDK.fileStorage.uploadFileToBubble(bubble, fileInfos, "My message ")
    .then(function(message) {
        // Do something once the file has been shared
        ...
    }).catch(function(err) {
        // Do somehting in case of error
        ...
    });

```


### Be notified of a new file shared

---


When you share a file, you will get in return an event `rainbow_filecreated` which contains the fileid of the file shared:


```json

    { 
        "fileid": "5bbdfde45a0b44c0c08bfa2d"
    }

```

When you updates an already shared file, you will get in return an event `rainbow_fileupdated` which contains the fileid of the file shared updated:


```json

    { 
        "fileid": "5bbdfde45a0b44c0c08bfa2d"
    }

```

When you delete a file, you will get in return an event `rainbow_filedeleted` which contains the fileid of the file deleted:


```json

    { 
        "fileid": "5bbdfde45a0b44c0c08bfa2d"
    }

```

### Downloading a file or for an image, put it in IMG Tag

---

Files are protected in Rainbow. If you want to download a file, you need to be signed and to call the API `downloadFile()` like in the following code


```javascript

    
    // Retrieve a list of files own by the current logged in user
    rainbowSDK.fileStorage.retrieveFileDescriptorsListPerOwner().then((fileDescriptorsReceived) => {
            // iter over the list of file
            for (let fileReceived of fileDescriptorsReceived) {
                // Download the current file
                rainbowSDK.fileStorage.downloadFile(fileReceived).then((file) => {
                    // Write the downloaded file to OS filesystem
                    fs.writeFile("c:\\temp\\" + fileReceived.fileName, file.buffer, "binary", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("The file was saved!");
                    }
                });
            });
        }
    });


```


In that code, the API `downloadFile()` is used to get a JavaScript  object. Then you can save it to OS Files system.


### Removing a file shared

---

File shared on Rainbow can be removed at any time. When removed, the file can't be downloaded any more by other Rainbow users. To remove a file you own, call the API `removeFile()`.


```javascript

    var shortFileDescriptor = {...};        
    
    rainbowSDK.fileStorage.removeFile(shortFileDescriptor).then(function(){
        // Do something when the file has been removed
        ...
    }).catch(function(err) {
        // Do something in case of error
    });

```


### Retrieving the files sent and received in a conversation

---

At any time, for a dedicated conversation, you can ask for retrieving the list of files sent and received. The API `getFilesSentInConversation()` and `getFilesReceivedInConversation()` have to be used like in the following


```javascript

    var conversation = {...};

    rainbowSDK.fileStorage.getFilesReceivedInConversation(conversation).then(function(files){
        // Do something with the list of files received in a conversation
        ...
    });

    rainbowSDK.fileStorage.getFilesSentInConversation(conversation).then(function(files){
        // Do something with the list of files sent in a conversation
        ...
    });

```


### Retrieving the files sent and received in a bubble

---

Use the API `getFilesSentInBubble()` and `getFilesReceivedInBubble()` if you need the same thing in a Bubble.


```javascript

    var bubble = {...};

    rainbowSDK.fileStorage.getFilesReceivedInBubble(bubble).then(function(files){
        // Do something with the list of files received in a bubble
        ...
    });

    rainbowSDK.fileStorage.getFilesSentInBubble(bubble).then(function(files){
        // Do something with the list of files sent in a bubble
        ...
    });

```


### Retrieving the whole list of files sent 

---

If you need to display the whole list of files shared in all conversations and bubbles, you can call the API `getAllFilesSent()`like in the following:


```javascript

    rainbowSDK.fileStorage.getAllFilesSent().then(function(files){
        // Do something with the full list of files sent
        ...
    });

```



You are now ready for playing with files in Rainbow!

---

_Last updated October, 10 2018_
