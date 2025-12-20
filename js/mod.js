let modInfo = {
	name: "The Puritree",
	id: "puritree",
	author: "PLMMJ",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3",
	name: "Buyable Update",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.3</h3><br>
		- Added Buyables.<br>
		- Added another row of achievements.<br>
		- Removed endgame for now.
	<h3>v0.2.1</h3><br>
		- Moved endgame to 1e50 points.<br>
	<h3>v0.2</h3><br>
		- Played whack-a-mole with inflation.<br>
		- Added Milestones.<br>
		- Added Achievements.<br>
	<h3>v0.1</h3><br>
		- Dealt with mod.js.<br>
		- Added Upgrades.<br>`

let winText = `Congratulations! You have reached the end of the 4-layer version. 5 more layers await in future updates...<br>Ignore what it says about Discord. I don't know how to get rid of that.`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade('u', 11)) gain = gain.times(upgradeEffect('u', 11))
	if (hasUpgrade('u', 12)) gain = gain.times(upgradeEffect('u', 12))
	if (hasUpgrade('u', 22)) gain = gain.times(upgradeEffect('u', 22))
	if (hasAchievement('a', 15)) gain = gain.times(1.1)
	if (hasAchievement('a', 25)) gain = gain.times(1.1)
	if (player.b.unlocked) gain = gain.times(buyableEffect("b", 11));
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1e5000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}