app.controller("SinglesMatchesCtrl", 
  ["$scope", 
  "$log",
  "$q",
  "$timeout",
  "$firebaseArray",
  "league",
  function($scope, $log, $q, $timeout, $firebaseArray, league) {
    $scope.newMatch = {};

    var ref = new Firebase("https://nashdev-pong.firebaseio.com");

    $scope.title="Singles Matches";


    $scope.user = ref.getAuth().github;

    console.log("scope.user", $scope.user);

    $scope.users = $firebaseArray(ref.child('users'));

    // Promise gets the users current league
    var currentLeague = '';
    var promise = league.getLeague();
    promise.then(function(leag) {
      $log.log("league", leag);
      setTableData(leag);
      currentLeague = leag;
    }, function(reason) {
      alert('Failed: ' + reason);
    });

    $scope.addMatch = function(){
      $scope.newMatch.date = Date.now();
      $scope.newMatch.player1 = ref.getAuth().uid;
      $scope.newMatch.league = currentLeague;
      $scope.displayedCollection.$add($scope.newMatch).then(function(ref) {
        var id = ref.key();
        console.log("added record with id " + id); // returns location in the array
        updateRanks($scope.newMatch);
        $scope.displayAddMatch = false;
        $scope.newMatch = {};   
      });   
    };

    // Toggle for add matches form
    $scope.displayAddMatch = false;
    $scope.toggleAddMatch = function(){
      $scope.displayAddMatch = $scope.displayAddMatch ? false : true;
    };

    function setTableData(league){
      $scope.displayedCollection = $firebaseArray(ref.child('singlesMatches').orderByChild('league').equalTo(league));
    }

    function updateRanks(match){
      if(match.player1pts > match.player2pts){
        addWin(match, "player1", currentLeague);
        addLoss(match, "player2", currentLeague);

        ref.child('users').child(match.player1).child(currentLeague + "-winNum").push(match.player2);
        ref.child('users').child(match.player2).child(currentLeague + "-lossNum").push(match.player1);
      } else {

        addWin(match, "player2", currentLeague);
        addLoss(match, "player1", currentLeague);

        ref.child('users').child(match.player1).child(currentLeague + "-lossNum").push(match.player2);
        ref.child('users').child(match.player2).child(currentLeague + "-winNum").push(match.player1);
      }
    }

    function addWin(match, player, league){
      // Update wins num
      ref.child('users').child(match[player]).child('winNum').transaction(function(currentData) {
        if (currentData === null) {
          console.log('user had now wins.');
          return 1;
        } else {
          console.log('Added one win.');
          return currentData += 1; // Abort the transaction.
        }
      });

      ref.child('users').child(match[player]).child(league).child('winNum').transaction(function(currentData) {
        if (currentData === null) {
          console.log('user had now wins.');
          return 1;
        } else {
          console.log('Added one win.');
          return currentData += 1; // Abort the transaction.
        }
      });
    }

    function addLoss(match, player){
      // Update wins num
      ref.child('users').child(match[player]).child('lossNum').transaction(function(currentData) {
        if (currentData === null) {
          console.log('user had now wins.');
          return 1;
        } else {
          console.log('Added one win.');
          return currentData += 1; // Abort the transaction.
        }
      });
      ref.child('users').child(match[player]).child(league).child('lossNum').transaction(function(currentData) {
        if (currentData === null) {
          console.log('user had now wins.');
          return 1;
        } else {
          console.log('Added one win.');
          return currentData += 1; // Abort the transaction.
        }
      });
    }

    // Table Logic
    $scope.query = {
      order: '-date',
      limit: 20,
      page: 1
    };
    
    
    $scope.onpagechange = function(page, limit) {
      var deferred = $q.defer();
      
      $timeout(function () {
        deferred.resolve();
      }, 2000);
      
      return deferred.promise;
    };
    
    $scope.onorderchange = function(order) {
      var deferred = $q.defer();
      
      $timeout(function () {
        deferred.resolve();
      }, 2000);
      
      return deferred.promise;
    };



}]);