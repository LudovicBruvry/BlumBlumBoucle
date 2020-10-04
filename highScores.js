class HighScores {
  // highScores: [], //PROD
  maxLevel = 2;

  levelSelected = 0;

  highScores = [ // DEBUG DATA
    {
      level: 1,
      highScores: [
        {
          playerName: 'JEAN',
          time: 7,
        },
        {
          playerName: 'FLOB',
          time: 12,
        },
      ],
    },
    {
      level: 2,
      highScores: [
        {
          playerName: 'LUDO',
          time: 7,
        },
        {
          playerName: 'JEAN',
          time: 12,
        },
        {
          playerName: 'SEB',
          time: 14,
        },
      ],
    },
  ];

  static display() {
    this.getHighScoresAPI().then((data) => {
      console.log(data);

      HighScores.highScores = JSON.parse(data);

      document.getElementById('homeMenu').classList.add('menuHidden');
      document.getElementById('highScoresMenu').classList.remove('menuHidden');
      HighScores.levelSelected = 0;
      HighScores.getHighScoresForLevel(HighScores.levelSelected);
      document.getElementById('levelSelectedText').innerHTML = 'Tutorial level';
    });
  }

  static previousLevel() {
    if (HighScores.levelSelected !== 0) {
      HighScores.levelSelected -= 1;
      HighScores.getHighScoresForLevel(HighScores.levelSelected);
      if (HighScores.levelSelected === 0) {
        document.getElementById('levelSelectedText').innerHTML = 'Tutorial level';
      } else {
        document.getElementById('levelSelectedText').innerHTML = `Level -${HighScores.levelSelected}-`;
      }
    }
  }

  static nextLevel() {
    if (HighScores.levelSelected !== HighScores.maxLevel) {
      HighScores.levelSelected += 1;
      HighScores.getHighScoresForLevel(HighScores.levelSelected);

      document.getElementById('levelSelectedText').innerHTML = `Level -${HighScores.levelSelected}-`;
    }
  }

  static getHighScoresForLevel(level = 0) {
    HighScores.displayHighScore(level);
  }

  static displayHighScore(level = 0) {
    const highScoreTable = document.getElementById('highScoreTable');

    const result = HighScores.highScores.filter((element) => element.level === level);

    let content = '';
    if (result.length >= 1) {
      result[0].highScores.forEach((e, i) => {
        content
          += `${'<div class="highScoreTableEntry">'
          + '<div>#'}${i + 1}</div><div> - ${e.playerName}</div><div>${e.time}s</div>`
          + '</div>';
      });
    }

    highScoreTable.innerHTML = content;
  }

  static getHighScoresAPI() {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();

      request.open('GET', 'https://scoreback.herokuapp.com', true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(request.response);
        } else {
          reject('Error');
        }
      };
      request.send();
    });
  }
}
