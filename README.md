# SIMPLE-BLOG-WITH-GraphQL-EXPRESS

## Table of content 

* General info
* Technologies
* Setup

## Introduction 

Simple API created using GraphQL on top of Express.JS and MongoDB.

## Technologies

* Node.js
* GraphQL
* Express.js
* MongoDB

## Perequisite

Before launching this project you must ensure that you have NodeJs and MongoDB installed locally
Bellow are the links to help you installing it:

 —> https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

 —> https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

 —> https://docs.mongodb.com/manual/administration/install-on-linux/

## Launch

*  git clone git@github.com:JordyBukondaTshibangu/SIMPLE-BLOG-WITH-GraphQL-EXPRESS.git
* cd SIMPLE-BLOG-WITH-GraphQL-EXPRESS
* npm install 
* npm run dev
* Visit localhost:8080/graphql



## APP STRUCTURE AND KEY POINTS


- [x] API ==> Server
			
In the server we import 
    1.  express (The framework on which will be built the app)
    2.  body-parser (It helps sending POST and PUT requests as it enables you to take JSON body data )
    3.  multer (It enables you to upload images)
    4.  jsonwebtoken ( for user authentication and routes protection) with the isAuth middleware used globally
    5. We Used ES6 for a better syntax ( in the package.json "type": "module”)
    6. We also used the graphqlHTTP middleware which takes (schema : graphqlSchema , rootValue : graphqlResolver , graphiql)



- [x] Database  => Database
    * Import mongoose 
    * Import models
    * Create a connection url
    * Create the connect method 	

- [x] API ==> Models

We use the Mongoose schema to create a schema for the entities in our app
A document schema is a JSON object that allows you to define the shape and content of documents and embedded documents in a collection

We have : 
    * USER schema (name, email, status, password, posts )
    *  POST schema (title, content, imageUrl, creator)
- [x] API ==> graphql

### Schema 

    - type (Post, User, AuthData, PostData)

    - input (userDataInput, postInputData, postInputDataUpdate)

    - RootMutation 

* createUser(userInput : userDataInput) : User!
* createPost(postInput : postInputData) : Post!
* updatePost(id : ID!, postInput : postInputDataUpdate) : Post!
* deletePost(id:ID!): Boolean
* updateStatus(status: String!): User!

    - RootQuery

* login(email : String!, password : String!): AuthData!
* posts(page : Int) : PostData!
* post(id: ID!): Post!
* user: User!

    - schema 

* query : RootQuery
* mutation : RootMutation

### Resolver 

The resolver acts like a controller with all the logic and actions
It has the following keys :

* createUser
* Login
* CreatePost
* Posts
* Post
* updatePost
* deletePost
* User
* updateStatus

Inside a graphQLResolver object which is exported to the graphQLHTTP middleware 


- [x] API ==> Routes
	In graphQL we only have two method (GET and POST)
	which are request to “/graphql”


- [x] MIDDLEWARE ==> Auth
	
	We used JWT(jsonwebtoken) sign and verify method to create a token to authenticate the 
	user and give me access to certain routes where he/she could perform operations


For more information, visit : 
https://graphql.org/graphql-js/running-an-express-graphql-server/



