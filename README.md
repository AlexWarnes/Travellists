# ![Icon](/public/Assets/route-small.png?raw=true)Travellists
_Where travelers can find or create lists of their favorite places in cities around the world._

## What is Travellists?
Inspired by good and bad travel recommendations, **_Travellists_** is a platform to find recommendations for places to go from people whose travel-styles match your own. You can create lists after a trip, or prepare for an upcoming trip by finding lists from travelers whose descriptions and travel history seem like your cup of tea (or coffee, whichever you prefer). 

## How do I Use It?
1. **Create an Account.** From the home page, click the "Create an Account" button. Provide a username, password, and password confirmation. Once validated, you'll be asked to enter your new username and password once more to log in and get started!  
  (**Note:** The pilot version has no password reset capability, so choose wisely!)

2. **Navigate the App.** Once you're logged in, you should see four tabs in the navigation bar:

![Navigation Bar](/public/Assets/screenshot_nav.png?raw=true "Navigation Bar")

* **Lists.** Use the Lists tab to _find_ or _create_ lists for upcoming trips. This page provides a basic search tool you can use to search lists by city, country, or keyword. Click the "+ New List" button to create a new list!  
  
* **Travelers.** From the Travelers tab, you can browse other users to see their descriptions, countries they've visited, and lists they've created.  
  
* **Profile.** This is where you can view and edit your own profile. Use the edit icon in the upper right corner to open the Profile Edit fields. Below your profile info you can see lists you've created for quick editing. Click the "+ New List" button to create a new list!  
  
* **Log Out.** Click _Log Out_ to log out of the app and return to the home screen.  
	
## FAQs:
**How do I edit or delete my lists?**  
You can edit or delete your lists in the future by viewing them from the **Lists** or **Profile** tab and clicking the edit or delete icon in the bottom right corner.  
  
**How do I delete my account?**  
From the **Profile** tab, scroll to the very bottom of the page and click "Delete My Profile", then confirm you want to delete your profile. (**Note:** Deleting your Profile does not delete your lists. If you'd like to delete your lists, do that first, and then delete your profile)  

## Future Versions and Features
There are a lot of features I would love to add to **_Travellists_**! I'll return to the app as I learn more techniques, libraries, and concepts. Some things I have in mind:
* **Export Lists.** Still figuring out the best way to allow users to "save" a list. Either save it to their profile like a wishlist, email it to themselves, or ideally export it to My Maps (see the next feature).
  
* **Google APIs: Maps + Places.** Integrating Google APIs to list views was an original aim with the app. But as it grew in complexity, I scoped down to more essential functionality. I envision users viewing a list, seeing a Map thumbnail with pins at each place in the list (with the ability to export to My Maps). Additionally, each Place in a list would display some information from the Google Places API like rating, website, and contact info.
  
* **List Ratings.** A simple way for users to rate lists or provide feedback of some type. I considered "Likes" or a 5-star rating option. Not sure which way to go for implementing this.
  
* **List Used?** An option for users to say if and when they used a list. This would help other users get an idea as to how current the list is.
  
* **Follow Travellers.** This would allow users to see new lists created by travelers they are similar to. I'm not sure if this is necessary, but I would like some way to let users connect with each other in some way.

## Technologies Used

### Back-End
  * MongoDB
  * Express Framework  
  * Node.js
  * Mocha and Chai
  * JWT Authentication

### Front-End
  * HTML5
  * CSS3
  * JavaScript
  * jQuery

### Styles
  * Google Fonts
  * FontAwesome

## API Documentation
The **_Travellists_** API can be used by passing a JWT with each call using Bearer Auth to the Lists or Users endpoints. This will return an array of JSON data for your client to display.

### Lists Endpoint
`https://travellists.herokuapp.com/api/lists`

Calls to this endpoint will return JSON data resembling the following example:

```javascript
{
	"countriesVisited": ["Mexico", "Portugal"],
	"dateJoined": "2018-03-17T17:21:30.007Z",
	"id": "4jrd4h8kfgw91u0014c03204",
	"userDescription": "My favorite travel site is Travellists!",
	"userName": "ExampleUser"
}
```

### Users Endpoint
`https://travellists.herokuapp.com/api/users`

Calls to this endpoint will return JSON data resembling the following example:

```javascript
{
	"author": "ExampleUser",
	"authorID": "4jrd4h8kfgw91u0014c03204",
	"city": "Lisbon",
	"country": "Portugal",
	"dateCreated": "2018-04-04T13:03:16.401Z",
	"description": "A random assortment of my favorite coffee and food spots in Lisbon!",
	"id": "4rty4f8lodu91p0014p0927"
	"places": [
		{"placeDescription": "Great taco place with unique taco fillings and a cool atmosphere. A perfect spot to take a break from walking up and down the hills of Lisbon. The music is great, too!",
		"placeLocation":[],
		"placeName": "Pistola y Corazon Taqueria",
		"_id":"5pow0l8losd87u0024c0093"}
	]
	"title": "Great Food & Coffee Spots"
}
```

## Feedback?
I would love to hear what you think! Shoot me a message through GitHub or email through my personal site with constructive feedback, new ideas, or anything else you'd like to share. 

Safe travels! - A
