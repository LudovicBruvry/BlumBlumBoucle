class HomeMenu {
	static display(){
		document.getElementById("highScoresMenu").classList.add("menuHidden");
		document.getElementById("theCrewMenu").classList.add("menuHidden");
		document.getElementById("homeMenu").classList.remove("menuHidden");
		if(!document.getElementById("preMenu").classList.contains("menuHidden")){
			document.getElementById("preMenu").classList.add("menuHidden");
		}
	}
	static launchGame(){
		console.log("Launch game");
	}

};

