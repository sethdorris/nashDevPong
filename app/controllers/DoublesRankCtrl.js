app.controller("DoublesRankCtrl", 
  [  "$scope", 
  "$log",
  "$firebaseArray",
  "league",
  "tableUI",
  function($scope, $log, $firebaseArray, league, tableUI) {

    var ref = new Firebase("https://nashdev-pong.firebaseio.com/");

    // Promise gets the users current league
    // Only teams with matches in the current league context will be displayed
    var currentLeague = '';
    var promise = league.getLeague();
    promise.then(function(leag) {
      $log.log("league", leag);
      loadLeagueTeams(leag);
      currentLeague = leag;
    }, function(reason) {
      alert('Failed: ' + reason);
    });

    function loadLeagueTeams(league){
      var teams = $firebaseArray(ref.child('doublesTeams').orderByChild('league').equalTo(league));
      teams.$loaded().then(function(teams){
        // $log.log('teams', teams);
        // Teams need to be sorted by eloRating so that when the rank 
        // is assigned below in the for loop, the correct rank is assigned
        teams = _.sortBy(teams, function(team){
          if(team[league]){
            return parseInt(team[league].eloRating);
          } else {
            return 1300;
          }
        });

        for(var i = 0; i < teams.length; i++){
          teams[i].rank = teams.length - i;
          teams[i].winNum = teams[i][league].winNum || 0;
          teams[i].lossNum = teams[i][league].lossNum || 0;
          teams[i].eloRating = teams[i][league].eloRating || 1300;
          teams[i].winPercent = (teams[i].winNum / (teams[i].winNum + teams[i].lossNum));
        }
        $scope.displayedCollection = teams;
      });
    }

    //Table Logic 
    $scope.query = {
      order: '-eloRating',
      limit: 5,
      page: 1
    };
    $scope.onpagechange = tableUI.onpagechange;
    $scope.onorderchange = tableUI.onorderchange;

  }
]);