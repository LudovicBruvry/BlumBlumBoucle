let highScoresMenu = {
	//highScores: [], //PROD
	maxLevel:2,
	levelSelected: 0,
	highScores: [ //DEBUG DATA
			{
				level : 1, 
				highScores : [
					{
						playerName:"JEAN", 
						time: 7
					},
					{
						playerName:"FLOB", 
						time: 12
					}
				]
			},
			{
				level : 2, 
				highScores : [
					{
						playerName:"LUDO", 
						time: 7
					},
					{
						playerName:"JEAN", 
						time: 12
					},
					{
						playerName:"SEB", 
						time: 14
					}
				]
			}
		],
	display: function(){
		
		getHighScoresAPI();
		
		document.getElementById("homeMenu").classList.add("menuHidden");
		document.getElementById("highScoresMenu").classList.remove("menuHidden");
		highScoresMenu.levelSelected = 0;	
		highScoresMenu.getHighScoresForLevel(highScoresMenu.levelSelected);
			document.getElementById("levelSelectedText").innerHTML = 'Tutorial level';
		
	},
	previousLevel: function(){
		if(highScoresMenu.levelSelected != 0){
			highScoresMenu.levelSelected--;
			highScoresMenu.getHighScoresForLevel(highScoresMenu.levelSelected);
			if(highScoresMenu.levelSelected==0){
			document.getElementById("levelSelectedText").innerHTML = 'Tutorial level';
			}
			else{
				document.getElementById("levelSelectedText").innerHTML = 'Level -' + highScoresMenu.levelSelected + '-';
			}
		}
	},
	nextLevel: function(){
		if(highScoresMenu.levelSelected != highScoresMenu.maxLevel){
			highScoresMenu.levelSelected++;
			highScoresMenu.getHighScoresForLevel(highScoresMenu.levelSelected);
			
			document.getElementById("levelSelectedText").innerHTML = 'Level -' + highScoresMenu.levelSelected + '-';
		}
	},
	getHighScoresForLevel : function(level = 0){
		highScoresMenu.displayHighScore(level);
	},
	displayHighScore : function(level = 0){
		let highScoreTable = document.getElementById("highScoreTable");
		
		const result = highScoresMenu.highScores.filter(element => element.level == level);
		
		let content = "";
		if(result.length >= 1){
			result[0].highScores.forEach((e, i) => {
				console.log(JSON.stringify(e));
				content += 
					'<div class="highScoreTableEntry">'+
						'<div>#'+ (i+1) +'</div><div> - '+ e.playerName+'</div><div>'+ e.time +'s</div>'+
					'</div>';	
			});
		}
		
		highScoreTable.innerHTML = content;
		
	},
	getHighScoresAPI : function() {
		var request = new XMLHttpRequest();

		request.open('GET', 'https://scoreback.herokuapp.com', true);
		
		request.onload = function () {
		  var data = JSON.parse(this.response)

		  if (request.status >= 200 && request.status < 400) {
				highScores = data;
			}
		    else {
			console.log('error');
		  }
		}
		request.send();
	}

};

