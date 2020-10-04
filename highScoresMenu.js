class HighScoresMenu {
	highScores = [];
	maxLevel= 2;
	levelSelected= 0;

	static display(){

		this.getHighScoresAPI().then(data => {
			this.highScores = JSON.parse(data);
			this.displayHighScore(this.levelSelected);
		});


		const menuToDisplay="highScoresMenu";
		(Array.from(document.getElementsByClassName("menu"))).forEach(element => {
			if(!element.classList.contains("menuHidden")){
				element.classList.add("menuHidden");
			}
		});
		document.getElementById(menuToDisplay).classList.remove("menuHidden");

		this.levelSelected = 0;
	}
	static previousLevel(){
		if(this.levelSelected != 0){
			this.levelSelected--;
			this.displayHighScore(this.levelSelected);
			if(this.leveSelected==0){
			document.getElementById("levelSelectedText").innerHTML = 'Tutorial level';
			}
			else{
				document.getElementById("levelSelectedText").innerHTML = 'Level -' + this.levelSelected + '-';
			}
		}
	}
	static nextLevel(){
		if(this.levelSelected != this.maxLevel){
			this.levelSelected++;
			this.displayHighScore(this.levelSelected);

			document.getElementById("levelSelectedText").innerHTML = 'Level -' + this.levelSelected + '-';
		}
	}
	static displayHighScore(level = 0){
		let highScoreTable = document.getElementById("highScoreTable");

		const result = this.highScores.filter(element => element.level == level);

		let content = "";
		if(result.length >= 1){
			result[0].highScores.forEach((e, i) => {
				content +=
					'<div class="highScoreTableEntry">'+
						'<div>#'+ (i+1) +'</div><div> - '+ e.playerName+'</div><div>'+ e.time +'s</div>'+
					'</div>';
			});
		}

		highScoreTable.innerHTML = content;

	}
	static getHighScoresAPI() {

		return new Promise((resolve, reject) => {

			var request = new XMLHttpRequest();

			request.open('GET', 'https://scoreback.herokuapp.com', true);

			request.onload = () => {
				if(request.status >= 200 && request.status < 300) {
					resolve(request.response);
				}
				else
				{
					reject('Error');
				}
			}
			request.send();
		});
	}

}