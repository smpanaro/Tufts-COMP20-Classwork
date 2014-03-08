# MBTA Map and Schedule Rodeo (Assignment 3)

This assignment displays a random MBTA line, including it's path and stations. It also uses the navigator.geolocation object to detect the users location and display it along the map along with the station nearest to the user.  

This project has been tested in the latest Chrome and Firefox on OS X.

### What has been implemented?
To my knowledge, everything has been correctly implemented. This includes requesting and parsing rodeo.json, displaying information based on user location and displaying the T line specified in rodeo.json.  

### Who did you collaborate with?
I did not collaborate with anyone on this assignment, however I used several online resources including Stack Overflow, Mozilla Developer Network's documentation and the examples provided on the class website. 

### How much time did you spend?
I spent approximately 12 hours working on this project. (Although about half of that was spent working on the files in the data_gen/ folder - see below.)  

### What else is in here?
The data_gen/ folder contains data and scripts to generate the constants (detailed subway routes and station locations) found in transit-constants.js. See the [README](/transit/data_gen/) in the data_gen/ folder for more specifics.  
This data can be displayed using the `displayAllLines()` and `displayAllStations()` functions. 