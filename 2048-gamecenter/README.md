#2048 Gamecenter Server

Submit and retrieve 2048 scores.  
Live at: http://cryptic-falls-3284.herokuapp.com/

## What has been correctly implemented?
The API has been implemented with `/submit.json`, `/scores.json` and `/` endpoints as specified in the project specification.  

## Collaborators
I did not collaborate with anyone on this project, but referenced a lot of documentation (node.js, Express, Handlebars, Mongo) and StackOverflow posts.  

## Time Spent
I spent approximately 8 hours working on this project.  

## How are score and grid stored in the 2048 game?
Both score and grid are properties of the GameManager object. The definition of this object can be found in `js/game_manager.js`. A GameManager instance is instantiated in `application.js`.  

## What modifications were made to the 2048 game client?
A new file, remote_leaderboard_manager.js, was added that defines a RemoteLeaderboardManager object that, given a score and a grid, submits them to the leaderboard API. Then the GameManager object was updated to include a leaderboardManager property, set to a RemoteLeaderboardManager instance in `application.js`. When the game is set to over (when ` this.over = true;`) the final score and grid are submitted to the leaderboard manager.  

## Database
Mongo 

### Schema
Collection: scoresCollection  
Document format: 
```json
{
	"username": string,
	"score": number,
	"grid": json_string,
	"created_at": time_stamp_in_millis
}
```
