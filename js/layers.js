addLayer("u", {
    name: "upgrades", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		essence: new Decimal(0),
    }},
    color: "#CFCFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "upgrade points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
	effBase() { // used to calculate buffs to the rate of UE gain
		let base = new Decimal(1);
        if (hasUpgrade("u", 23)) base = base.plus(upgradeEffect("u", 23));
		return base;
	},
	effect() { // calculates UE gain
        if (!hasUpgrade('u', 21)) return new Decimal(0);
        let eff = Decimal.pow(this.effBase(), player.u.points).sub(1).max(0);
        return eff;
    },
	effectDescription() { // text for UE gain
		return "which are generating "+format(tmp.u.effect)+" upgrade essence per second."
    }, 
    update(diff) { // UE gain, it has no inherent effects so no need for those calcs I hope
			if (player.u.unlocked) player.u.essence = player.u.essence.plus(tmp.u.effect.times(diff));
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('u', 13)) mult = mult.times(upgradeEffect('u', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
	tabFormat: ["main-display",
		"prestige-button",
		"blank",
		["display-text",
			function() {return 'You have ' + format(player.u.essence) + ' upgrade essence, which serves to improve certain upgrades.'},
				{}],
		"blank",
		["display-text",
			function() {return 'Your best upgrade points is ' + formatWhole(player.u.best) + '<br>You have made a total of '+formatWhole(player.u.total)+" upgrade points."},
				{}],
		"blank",
        "upgrades"],
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for upgrade points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Upgrade Boost",
            description: "Upgrade points multiply point generation.",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "Point Boost",
            description: "Points multiply their own generation.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "UP up!",
            description: "Upgrade points multiply their own generation.",
            cost: new Decimal(10),
            effect() {
                return player[this.layer].points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title: "I swear this isn't a prestige reskin",
            description: "Allows generation of upgrade essence.",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade("u", 12)&&hasUpgrade("u", 13) },
        },
        22: {
            title: "Don't you mean generator power?",
            description: "Upgrade essence multiplies point generation.",
            cost: new Decimal(25),
            unlocked() { return hasUpgrade("u", 12)&&hasUpgrade("u", 13) },
            effect() {
                return player.u.essence.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        23: {
            title: "UE ue?",
            description: "Upgrade essence adds to its own generation.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade("u", 12)&&hasUpgrade("u", 13) },
            effect() {
                let additionu23 = player.u.essence.add(1).log10.add(1)
                return additionu23
            },
            effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id)) },
        },
    },
})
