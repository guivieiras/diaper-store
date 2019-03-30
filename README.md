# Look After - Diaper store

### How to run:

* Clone this repository
* Run npm install at /client and /server folders

##### If using NGINX:

* Run _npm run build_ at _/client_, it will create the  _/client/dist_ folder
* Copy nginx.conf file to your nginx config folder and overwrite the file inside
* Change the root folder at line #20 to the full path of /client/dist
* Run npm run start at /server
* Open http://localhost

##### If not using NGINX:

* Uncomment line #12 at _/server/app.js_
* Uncomment line #4 at _/client/.env_ and comment line #1
* Run npm run serve at _/client_
* Run npm run start at /server
* Open http://localhost:8080


## Description

It's an "e-commerce" website to view, buy and register diapers. It's front-end is made in Vue.js, the back-end uses Express as web application framework, saving it's data to a CouchDB NoSQL database.

### Assumptions

I used two algorithms to predict when the product will be unavailable. One uses a fixed time span of 24h to calculate a sales/minute variable that is used in the algorithm. The other one uses all the sales of a diaper/size to calculate the estimated time. The algorithms are inside the file /server/db/sales.js. The user can change from one to another at the front-end.

To test server side validations, there's a switch above the diapers list to turn on and off the client side validations.