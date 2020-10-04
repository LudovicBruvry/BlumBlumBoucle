class LevelSelectionMenu {

	menuToDisplay="levelSelectionMenu";

	static display(){

		document.getElementsByClassName("menu").forEach(element => {
			if(!element.classList.contains("menuHidden")){
				element.classList.add("menuHidden");
			}
		});

		document.getElementById(menuToDisplay).classList.remove("menuHidden");
	}
	

};

