# MBTA Map and Schedule Rodeo (Assignment 3)

This assignment displays a random MBTA line, including it's path and stations. It also uses the navigator.geolocation object to detect the users location and display it along the map along with the station nearest to the user.  

This project has been tested in the latest Chrome and Firefox on OS X and Google Chrome and Mobile Safari on iOS.  

### What has been implemented?
To my knowledge, everything has been correctly implemented. This includes requesting and parsing rodeo.json, displaying information based on user location and displaying the T line specified in rodeo.json. The occasional 500 errors from the API were handled by checking the status code of each request and retry the request if it failed (signified by a non-200 status code).    

### Who did you collaborate with?
I did not collaborate with anyone on this assignment, however I used several online resources including Stack Overflow, Mozilla Developer Network's documentation and the examples provided on the class website. 

### How much time did you spend?
I spent approximately 12 hours working on this project. (Although about half of that was spent working on the files in the data_gen/ folder - see below.)  

### What else is in here?
The data_gen/ folder contains data and scripts to generate the constants (detailed subway routes and station locations) found in transit-constants.js. See the [README](/transit/data_gen/) in the data_gen/ folder for more specifics.  
This data can be displayed using the `displayAllLines()` and `displayAllStations()` functions. 
