let homeMenu = {
	display: function(){
		document.getElementById("highScoresMenu").classList.add("menuHidden");
		document.getElementById("theCrewMenu").classList.add("menuHidden");
		document.getElementById("homeMenu").classList.remove("menuHidden");
		if(!document.getElementById("preMenu").classList.contains("menuHidden")){
			document.getElementById("preMenu").classList.add("menuHidden");
		}
	},
	launchGame: function(){
		console.log("Launch game");
	}

};

