(function(){
  'user strict';
  angular
    .module("MatchApp")
    .factory("elo", elo);

    elo.$inject = ["REF","$firebaseArray"];

    function elo(fbref, $firebaseArray) {
      var ref = new Firebase(fbref);
      var users = $firebaseArray(ref.child('users'));

      function updateLeagueElo(winner, loser, league){
        if(typeof loser[league].eloRating === 'undefined'){
          loser[league].eloRating = 1300;
        }
        if(typeof winner[league].eloRating === 'undefined'){
          winner[league].eloRating = 1300;
        }
        var rankDiff = loser[league].eloRating - winner[league].eloRating;
        var winnerExpected = 1 / (1 + Math.pow(10, (rankDiff) / 400));
        var loserExpected = 1 - winnerExpected;

        var winnerNewRank = winner[league].eloRating + 32 * (1 - winnerExpected);
        var loserNewRank = loser[league].eloRating - 32 * (loserExpected);

        ref.child('users/' + winner.uid).child(league).child('eloRating').set(winnerNewRank);
        ref.child('users/' + loser.uid).child(league).child('eloRating').set(loserNewRank);
      }

      return function(winnerUid, loserUid){
        users.$loaded().then(function(){
          var winner = _.find(users, 'uid', winnerUid);
          var loser = _.find(users, 'uid', loserUid);
          var league = winner.league;
          var rankDiff = loser.eloRating - winner.eloRating;

          var winnerExpected = 1 / (1 + Math.pow(10, (rankDiff) / 400));
          var loserExpected = 1 - winnerExpected;

          var winnerNewRank = winner.eloRating + 32 * (1 - winnerExpected);
          var loserNewRank = loser.eloRating - 32 * (loserExpected); 

          ref.child('users/' + winnerUid).child('eloRating').set(winnerNewRank);
          ref.child('users/' + loserUid).child('eloRating').set(loserNewRank);
          updateLeagueElo(winner, loser, league);
        });
      };
    }

})();
