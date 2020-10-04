class LevelSelection {

	

	static display() {
		const menuToDisplay="levelSelectionMenu";
		(Array.from(document.getElementsByClassName("menu"))).forEach(element => {
			if(!element.classList.contains("menuHidden")){
				element.classList.add("menuHidden");
			}
		});

		document.getElementById(menuToDisplay).classList.remove("menuHidden");
	}

	static launchLevel(levelToLaunch) {
		switch(levelToLaunch){
			case 0:
				document.location.href= "game_tutorial.html";
				break;
			case 1:
				document.location.href= "game_level1.html";
				break;
			case 2:
				document.location.href= "game_level2.html";
				break;
			default:
				document.location.href= "game_tutorial.html";
				break;
		}
	}
};

