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
        compressence: new Decimal(0),
    }},
    color: "#CFCFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "upgrade points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
	effBase() { // used to calculate buffs to the exponent of UE gain
		let base = new Decimal(1.25);
		return base;
	},
	effect() { // calculates UE gain
        if (!hasUpgrade('u', 21)) return new Decimal(0);
        let eff = Decimal.pow(this.effBase(), player.u.points).sub(1).max(0);
        if (player.u.essence.gte(1e1000000000000)) eff = eff.log10().add(1);
        if (hasUpgrade('u', 32)) eff = eff.pow(2);
        return eff;
    },
	effectDescription() { // text for UE gain
		return "which are generating "+format(tmp.u.effect)+" upgrade essence per second."
    }, 
    update(diff) { // UE gain, it has no inherent effects so no need for those calcs I hope
			if (player.u.unlocked) player.u.essence = player.u.essence.plus(tmp.u.effect.times(diff));
            if (hasUpgrade("u", 41)) player.u.compressence = player.u.compressence.plus(tmp.u.effect.pow(0.2).times(diff));
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('u', 13)) mult = mult.times(upgradeEffect('u', 13))
        if (hasUpgrade("u", 23)) mult = mult.times(upgradeEffect("u", 23))
        if ((hasMilestone('m', 0))&&(!hasUpgrade('u', 31))) mult = mult.times(player.m.best).add(1).times(0.5)
        if ((hasMilestone('m', 0))&&(hasUpgrade('u', 31))) mult = mult.times(player.m.best).add(1).times(upgradeEffect('u', 31))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (player.u.points.gte(1e18)) exp = exp.pow(1/3)
        return exp
    },
	tabFormat: ["main-display",
		"prestige-button",
		["display-text",
			function() {return 'You have ' + format(player.points) + ' points.'},
				{}],
		"blank",
		["display-text",
			function() {return 'Your best upgrade points is ' + formatWhole(player.u.best) + '.<br>You have made a total of '+formatWhole(player.u.total)+" upgrade points."},
				{}],
		"blank",
        ["display-text",
			function() {return 'You have ' + format(player.u.essence) + ' upgrade essence, which serves to improve certain upgrades.'},
				{}],
        ["display-text",
			function() {return 'You have ' + format(player.u.compressence) + ' upgrade compressence, which serves to improve UE effects.'},
				{}],
		"blank",
        "upgrades"],
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for upgrade points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    passiveGeneration() { return (hasUpgrade("u", 14))?0.1:0 },
    upgrades: {
        11: {
            title: "Upgrade Boost",
            description: "Upgrade points multiply point generation. (Softcap: 1500x)",
            cost: new Decimal(1),
            effect() {
                let eff_u_11 = player[this.layer].points.add(1).pow(0.5)
                if (eff_u_11.gte(1500)) eff_u_11 = eff_u_11.pow(0.5).add(1499)
                if (hasUpgrade('u', 32)) eff_u_11 = eff_u_11.pow(2).add(1)
                if (hasUpgrade('u', 15)) eff_u_11 = eff_u_11.times(upgradeEffect('u', 15))
                return eff_u_11
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "Self-Boost",
            description: "Points multiply their own generation.",
            cost: new Decimal(5),
            effect() {
                let eff_u_12 = player.points.add(1).pow(0.1)
                if (hasUpgrade('u', 15)) eff_u_12 = eff_u_12.times(upgradeEffect('u', 15))
                return eff_u_12
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "UP up!",
            description: "Upgrade points multiply their own generation.",
            cost: new Decimal(10),
            effect() {
                let eff_u_13 = player[this.layer].points.add(1).pow(0.125)
                if (hasUpgrade('u', 33)) eff_u_13 = eff_u_13.times(upgradeEffect('u', 33))
                if (hasUpgrade('u', 15)) eff_u_13 = eff_u_13.times(upgradeEffect('u', 15))
                return eff_u_13
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Automagic",
            description: "Gain 10% of the UP you would gain on reset every second.",
            cost: new Decimal(100),
            unlocked() { return player.b.buyables[21].gte(1)&&hasUpgrade("u", 13) },
        },
        15: {
            title: "Row Leader",
            description: "Upgrades to the left of this one (except <b>Automagic</b>) now also scale based on upgrade essence.",
            cost: new Decimal(1e12),
            unlocked() { return player.b.buyables[21].gte(1)&&hasUpgrade("u", 13) },
            effect() {
                let eff_u_15 = player.u.essence.add(1).log10().pow(0.2).add(1)
                if (hasUpgrade('u', 41)) eff_u_15 = eff_u_15.times(upgradeEffect('u', 41))
                return eff_u_15
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title: "I swear this isn't a prestige reskin",
            description: "Allows generation of upgrade essence.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("u", 12) && hasUpgrade("u", 13) },
        },
        22: {
            title: "Powerful Essence",
            description: "Upgrade essence multiplies point generation.",
            cost: new Decimal(25),
            unlocked() { return hasUpgrade("u", 12) && hasUpgrade("u", 13) },
            effect() {
                let eff_u_22 = player.u.essence.add(1).log10().add(1)
                if (hasUpgrade('u', 24)) eff_u_22 = eff_u_22.times(upgradeEffect('u', 24))
                if (hasUpgrade('u', 41)) eff_u_22 = eff_u_22.times(upgradeEffect('u', 41))
                return eff_u_22
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        23: {
            title: "UP ue?",
            description: "Upgrade essence multiplies upgrade point generation.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade("u", 12) && hasUpgrade("u", 13) },
            effect() {
                let eff_u_23 = player.u.essence.add(1).log10().pow(0.5).add(1)
                if (hasUpgrade('u', 41)) eff_u_23 = eff_u_23.times(upgradeEffect('u', 41))
                return eff_u_23
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        24: {
            title: "The Rich Get Richer",
            description: "<b>Powerful Essence</b>'s effect is boosted based on unspent buyabucks.",
            cost: new Decimal(1e22),
            unlocked() { return player.b.buyables[21].gte(2)&&hasUpgrade("u", 22) },
            effect() {
                let eff_u_24 = player.b.points.add(1).pow(0.25).add(1)
                return eff_u_24
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        25: {
            title: "BB Combo",
            description: "Best buyabucks now grant free Point Booster levels. (Softcap: 200 free levels)",
            cost: new Decimal(1e32),
            unlocked() { return player.b.buyables[21].gte(2)&&hasUpgrade("u", 22) },
            effect() {
                let eff_u_25 = player.b.best.add(1).pow(0.5).add(1)
                if (eff_u_25.gte(200)) eff_u_25 = eff_u_25.log(2).add(199)
                return eff_u_25
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+" free levels" },
        },
        31: {
            title: "Fueling Essence",
            description: "Upgrade essence boosts the 1st milestone effect.",
            cost: new Decimal(1000000),
            unlocked() { return hasMilestone('m', 1) },
            effect() {
                let eff_u_31 = player.u.essence.add(1).log10().pow(0.25).add(1)
                if (hasUpgrade('u', 41)) eff_u_31 = eff_u_31.times(upgradeEffect('u', 41))
                return eff_u_31
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        32: {
            title: "Softcap Assist",
            description: "Square upgrade essence gain and <b>Upgrade Boost</b>'s effect.",
            cost: new Decimal(1e12),
            unlocked() { return hasMilestone('m', 1) },
        },
        33: {
            title: "Who needs UE?",
            description: "<b>UP up!</b> is stronger based on your milestone progress.",
            cost: new Decimal(1e22),
            unlocked() { return hasMilestone('m', 1) },
            effect() {
                let eff_u_33 = player.m.points.add(1)
                return eff_u_33
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        34: {
            title: "MB Combo",
            description: "Milestone progress now grants free Work Generator levels. (Softcap: 350 free levels)",
            cost: new Decimal(1e80),
            unlocked() { return player.b.buyables[21].gte(3)&&hasMilestone("m", 1) },
            effect() {
                let eff_u_34 = player.m.points.add(1).times(5)
                if (eff_u_34.gte(350)) eff_u_34 = eff_u_34.pow(0.5).add(349)
                return eff_u_34
            },
            effectDisplay() { return formatWhole(upgradeEffect(this.layer, this.id))+" free levels" },
        },
        35: {
            title: "Dead memes",
            description: "Speed Amplifiers now scale with milestone progress. (Softcap: 10x)",
            cost: new Decimal(1e90),
            unlocked() { return player.b.buyables[21].gte(3)&&hasMilestone("m", 1) },
            effect() {
                let eff_u_35 = player.m.points.add(1).pow(0.5).add(1)
                if (eff_u_35.gte(10)) eff_u_35 = eff_u_35.pow(0.5).add(9)
                return eff_u_35
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        41: {
            title: "Essence vengeance",
            description: "Allows generation of upgrade compressence based on your UE gain.<br>UC boosts UE effects. (Softcap: 1000x)",
            cost: new Decimal(5e90),
            unlocked() { return hasUpgrade("u", 21)&&hasMilestone("m", 3) },
            effect() {
                let eff_u_41 = player.u.compressence.add(1).log10().add(1)
                if (eff_u_41.gte(1000)) eff_u_41 = eff_u_41.pow(1/3).add(999)
                return eff_u_41
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
})

addLayer("m", {
    name: "milestones", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		best: new Decimal(0),
		total: new Decimal(0),
		points: new Decimal(0),
    }},
    color: "#793784",
    requires() { return new Decimal(1e16).times((hasAchievement("a", 21)&&!player.m.unlocked)?1e44:1) },
    resource: "milestone progress", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["u", "b"],
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.b.buyables[13].gte(1)) mult = mult.sub(buyableEffect("b", 13).times(0.01))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
	tabFormat: ["main-display",
		"prestige-button",
		["display-text",
			function() {return 'You have ' + format(player.points) + ' points.'},
				{}],
		"blank",
		["display-text",
			function() {return 'Your best milestone progress is ' + formatWhole(player.m.best) + '.<br>You have made a total of '+formatWhole(player.m.total)+" milestone progress."},
				{}],
		"blank",
        "milestones"],
    canBuyMax() { return hasMilestone("m", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for milestone progress", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasAchievement('a', 13)},
    milestones: {
		0: {
			requirementDescription: "1 Milestone Progress",
			done() { return player.m.best.gte(1) },
			effectDescription: "Best milestone progress multiplies UP gain.",
		},
		1: {
			requirementDescription: "7 Milestone Progress",
			done() { return player.m.best.gte(7) },
			effectDescription: "Unlock row 3 upgrades.",
		},
		2: {
			requirementDescription: "14 Milestone Progress",
			done() { return player.m.best.gte(14) },
			effectDescription: "You can buy max milestone progress.",
		},
		3: {
			requirementDescription: "21 Milestone Progress",
			done() { return player.m.best.gte(21) },
			effectDescription: "Unlock row 4 upgrades.",
		},
    },
})

addLayer("b", {
    name: "buyables", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		best: new Decimal(0),
		total: new Decimal(0),
		points: new Decimal(0),
    }},
    color: "#ffae00",
    requires() { return new Decimal(1e16).times((hasAchievement("a", 21)&&!player.b.unlocked)?1e44:1) },
    resource: "buyabucks", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["u", "m"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.b.buyables[12].gte(1)) mult = mult.times(buyableEffect("b", 12));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
	tabFormat: ["main-display",
		"prestige-button",
		["display-text",
			function() {return 'You have ' + format(player.points) + ' points.'},
				{}],
		"blank",
		["display-text",
			function() {return 'Your best buyabucks is ' + formatWhole(player.b.best) + '.<br>You have made a total of '+formatWhole(player.b.total)+" buyabucks."},
				{}],
		"blank",
        "buyables",
        "blank",
    	["display-text",
			function() {return 'Top row buyables are unlimited, but scale much more harshly every 500 purchases.<br>If you have a lot of buyables to buy, hold left click!'},
				{}],],
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for buyabucks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasAchievement('a', 13)},
    buyables: {
    	rows: 2,
		cols: 3,
        11: {
            title: "Point Booster",
            unlocked() { return player[this.layer].unlocked }, 
            cost(x=player[this.layer].buyables[this.id]) { 
                let base = new Decimal(2)
                base = base.times(x.add(1)).pow(2)
                if (player.b.buyables[11].gte(500)) base = base.pow(2)
                if (player.b.buyables[11].gte(1000)) base = base.pow(3)
                if (player.b.buyables[11].gte(1500)) base = base.pow(4)
                if (player.b.buyables[11].gte(2000)) base = base.pow(5)
                return base
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = new Decimal(1)
                let freex = new Decimal(1)
                if (!hasUpgrade('u', 25)) eff = eff.times(x).add(x)
                if (hasUpgrade('u', 25)) freex = freex.add(upgradeEffect("u", 25))
                if (hasUpgrade('u', 25)) freex = freex.add(x)
                if (hasUpgrade('u', 25)) eff = eff.times(freex).add(freex)
                if (player.b.buyables[22].gte(1)) eff = eff.pow(buyableEffect("b", 22))
                eff = eff.pow(2).add(1)
                return eff
            },
            display() { return 'Multiplies point gain.<br>Currently: ' +  format(buyableEffect(this.layer, this.id)) + 'x<br>Cost: ' + formatWhole(this.cost()) + ' buyabucks<br>Level: ' + formatWhole(player[this.layer].buyables[this.id])},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Work Generator",
            unlocked() { return player.b.buyables[21].gte(1) }, 
            cost(x=player[this.layer].buyables[this.id]) { 
                let base = new Decimal(5)
                base = base.times(x.add(1)).add(x).pow(4)
                if (player.b.buyables[12].gte(500)) base = base.pow(2)
                if (player.b.buyables[12].gte(1000)) base = base.pow(3)
                if (player.b.buyables[12].gte(1500)) base = base.pow(4)
                if (player.b.buyables[12].gte(2000)) base = base.pow(5)
                return base
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = new Decimal(1)
                let freex = new Decimal(1)
                if (!hasUpgrade('u', 34)) eff = eff.times(x)
                if (hasUpgrade('u', 34)) freex = freex.add(upgradeEffect("u", 34))
                if (hasUpgrade('u', 34)) freex = freex.add(x)
                if (hasUpgrade('u', 34)) eff = eff.times(freex).add(freex)
                eff = eff.pow(1.25).add(1)
                return eff
            },
            display() { return 'Multiplies buyabuck gain.<br>Currently: ' +  format(buyableEffect(this.layer, this.id)) + 'x<br>Cost: ' + formatWhole(this.cost()) + ' buyabucks' + '<br>Level: ' + formatWhole(player[this.layer].buyables[this.id])},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            title: "Speed Amplifier",
            unlocked() { return player.b.buyables[21].gte(3) }, 
            cost(x=player[this.layer].buyables[this.id]) { 
                let base = new Decimal(5000)
                base = base.times(x.add(1)).add(x).pow(4.5)
                if (player.b.buyables[13].gte(500)) base = base.pow(2)
                if (player.b.buyables[13].gte(1000)) base = base.pow(3)
                if (player.b.buyables[13].gte(1500)) base = base.pow(4)
                if (player.b.buyables[13].gte(2000)) base = base.pow(5)
                return base
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = new Decimal(1)
                eff = eff.times(x).pow(0.5).add(1)
                if (hasUpgrade("u", 35)) eff = eff.times(upgradeEffect("u", 35))
                if (eff.gte(50)) eff = eff.pow(0.25).add(49)
                if (eff.gte(90)) eff = eff.times(0).add(90)
                return eff
            },
            display() { return 'Reduces milestone progress scaling.<br>Currently: -' +  format(buyableEffect(this.layer, this.id)) + '% (Softcap: 50%, hardcap: 90%)<br>Cost: ' + formatWhole(this.cost()) + ' buyabucks' + '<br>Level: ' + formatWhole(player[this.layer].buyables[this.id])},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        21: {
            title: "R&D Lab",
            purchaseLimit: new Decimal(4),
            unlocked() { return player[this.layer].unlocked }, 
            cost(x=player[this.layer].buyables[this.id]) { 
                let base = new Decimal(10)
                if (!player.b.buyables[21].gte(1)) base = base.times(x.add(1).times(10)).add(x).pow(3)
                if (player.b.buyables[21].gte(1)) base = base.times(x.add(1).times(10)).add(x).pow(4)
                if (!player.b.buyables[21].gte(2)) base = base.times(0.1)
                return base
            },
            display() { return 'Unlocks 2 more upgrades and 1 more buyable per level. Row 3 and 4 upgrades also require milestones. (level 4 is currently unimplemented)<br>Cost: ' + formatWhole(this.cost()) + ' buyabucks<br>Level: ' + formatWhole(player[this.layer].buyables[this.id]) +" / 3"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        22: {
            title: "Point Super-Booster",
            purchaseLimit: new Decimal(6),
            unlocked() { return player.b.buyables[21].gte(2) }, 
            cost(x=player[this.layer].buyables[this.id]) { 
                let base = new Decimal(30)
                base = base.times(x.add(1).times(10)).add(x).pow(4)
                return base
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = new Decimal(1)
                eff = eff.times(x)
                eff = eff.times(0.5).add(1)
                return eff
            },
            display() { return 'Raises Point Booster strength to a power based on its level.<br>Currently: ^' +  format(buyableEffect(this.layer, this.id)) + '<br>Cost: ' + formatWhole(this.cost()) + ' buyabucks<br>Level: ' + formatWhole(player[this.layer].buyables[this.id]) +" / 6"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("a", {
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked: true,
    }},
    color: "#FFFF00",
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievements: {
        rows: 3,
        cols: 5,
        11: {
            name: "The first one is always free.",
		    done() { return player.u.points.gte(1) },
		    tooltip: "Do your first row 1 reset.",
        },
        12: {
            name: "The puns have just begun!",
		    done() { return player.u.upgrades.length>=3 },
		    tooltip: "Complete the first row of upgrades.",
        },
        13: {
            name: "A Taste of Power",
		    done() { return player.u.upgrades.length>=6 },
		    tooltip: "Complete the first two rows of upgrades. Reward: Gain the ability to unlock row 2 layers.",
        },
        14: {
            name: "Slowed to a halt",
		    done() { return player.u.essence.gte(1e1000000000000) },
		    tooltip: "Hit the Upgrade Essence softcap.",
        },
        15: {
            name: "Tinkerer",
		    done() { return hasAchievement('a', 13) && hasAchievement('a', 14) },
		    tooltip: "Achieve the other row 1 achievements. Reward: Gain 10% more points.",
        },
        21: {
            name: "New layers await!",
		    done() { return player.m.points.gte(1)||player.b.points.gte(1) },
		    tooltip: "Do your first row 2 reset. Reward: Double point generation, and get +1 point/sec independent of multipliers.",
        },
        22: {
            name: "Another softcap?",
		    done() { return player.u.points.gte(1e18) },
		    tooltip: "Hit the Upgrade Points softcap.",
        },
        23: {
            name: "Evolution",
		    done() { return player.u.upgrades.length>=9 },
		    tooltip: "Have 9 upgrades at once.",
        },
        24: {
            name: "Point Hog",
		    done() { return player.points.gte(1e32) },
		    tooltip: "Reach 1e32 points.",
        },
        25: {
            name: "Mechanic",
		    done() { return hasAchievement('a', 21) && hasAchievement('a', 22) && hasAchievement('a', 23) && hasAchievement('a', 24) },
		    tooltip: "Achieve the other row 2 achievements. Reward: Gain 20% more points.",
        },
        31: {
            name: "Is this too much inflation?",
		    done() { return player.m.points.gte(1)&&player.b.points.gte(1) },
		    tooltip: "Have both row 2 layers unlocked at the same time.",
        },
        32: {
            name: "I Own the World",
		    done() { return player.b.points.gte(5e14) },
		    tooltip: "Have more money than the entirety of Earth (assuming 1 buyabuck = 1 USD).",
        },
        33: {
            name: "Marathon Medalist",
		    done() { return player.m.points.gte(26) },
		    tooltip: "Have 26 milestone progress.",
        },
        34: {
            name: "Upgrade all the way!",
		    done() { return player.u.upgrades.length>=13 },
		    tooltip: "Have 13 upgrades at once.",
        },
        35: {
            name: "Millionaire Athlete",
		    done() { return hasAchievement('a', 31) && hasAchievement('a', 32) && hasAchievement('a', 33) && hasAchievement('a', 34) },
		    tooltip: "Achieve the other row 3 achievements. Reward: Gain 30% more points.",
        },
    },
	tabFormat: [
		"blank", 
		["display-text", function() { return "Achievements: "+player.a.achievements.length+"/"+(Object.keys(tmp.a.achievements).length-2) }], 
		"blank", "blank",
		"achievements",
	],
})