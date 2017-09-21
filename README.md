# Operam Test - NodeJS, MongoDB, ReactJS

A application to load the entire tree structure from the ImageNet Fall 2011 release api, save all the nodes sequentially into a DB (MongoDB), and serve the tree to a single page app in ReactJS as a json.

Copyright (c) Bhanoday Puram, 2017

## Contact

**Name:** Bhanoday Puram

**Email:** bhanoday10307@gmail.com

**Phone:** 6812859456

## User Guide
**Local Copy**  - To get a local copy, move to the parent directory you would like to hold this repository and clone the repository from your terminal as follows:

```
git clone git@github.com:bhanoday10307/OperamTest.git
```

To test the React App, first make sure you have all the dependencies installed, your local MongoDB Server is running, and start the server (i.e run node server.js) in the root of this package.

## Design 

### Step 1: Getting the data

* To get the data from the [ImageNet API
](http://image-net.org/download-API), I made use of the File System module(a core module for NodeJS), and Async Request module(a custom module for NodeJS).
* I used pre ordered Depth First Search pattern in this algorithm using Recursion to get the tree node's sequentially, and thus prefixing the parent's name to each node in the tree.
* Finally When I have all the nodes in an array (as shown below). I have streamed the list of all Javascript objects into a json file.

```
[
    {name: 'ImageNet 2011 Fall Release', size: 32326},
    {name: 'ImageNet 2011 Fall Release > plant, flora, plant life', size: 4486},
    {name: 'ImageNet 2011 Fall Release > plant, flora, plant life > phytoplankton', size: 2},
    {name: 'ImageNet 2011 Fall Release > plant, flora, plant life > phytoplankton > planktonic algae', size: 0},
    {name: 'ImageNet 2011 Fall Release > plant, flora, plant life > phytoplankton > diatom', size: 0},
    {name: 'ImageNet 2011 Fall Release > plant, flora, plant life > microflora', size: 0},
    ...
]
```

### Step 2: Storing the data into a Database

* To store the data that I obtained in step 1, I used the MongoDB database and it's associated NodeJS driver (i.e. MongoDB module).
* Creating a database (say image-net) in my local Mongo Database, then creating a collection (say wordnets) within the database. I have dumped all the documents/Javascript objects that I created in step 1, using the below command.

```
mongoimport --db <db-name> --collection <collection-name> --drop --file ~/path/to/data-dump-file.json
```

### Step 3: Converting the data into a Tree structure, by reading data sequentially from the Database.

* From steps 1 & 2, I have all the nodes each with it's name as the path from root (say a > b > c for node c).
* Here I queried the database for all the documents/javascript objects from the database collection, in the order they were inserted (which was the pre ordered DFS traversal).
* Using the same order, I created the entire tree as a single gaint object (as shown below), inserting each node's children as an array within the node.

```
{
    name: 'ImageNet 2011 Fall Release',
    size: 32326,
    children: [
        {
            name: 'plant, flora, plant life',
            size: 4486,
            children: [
                {
                    name: 'phytoplankton',
                    size: 2,
                    children: [
                        ...
                    ]
                },
                ...
            ]
        },
        ...
    ]
}
```

### Step 4: Creating an interface to present the data/tree to an end user.

* To create an interface to present the tree that I created in step 3, I chose to use React as it is great at presenting.
