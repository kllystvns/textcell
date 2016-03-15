// EXECUTION

  GLOBAL = {

    FRAMERATE: 14

  }

// (function() {
  
  var contentsNodeList = document.querySelectorAll('.textcell');
  var contents = [];
  for ( var i = 0; i < contentsNodeList.length; i++ ) {

    contents.push( contentsNodeList[ i ] );

  }

  var organs = [];
  contents.forEach( function( content, index ) {

    if ( index === 0 ) {

      var options = {

        speed: 0.13,
        duration: 8000,
        lerpTime: 800,
        cellAttraction: 0.08,
        originAttraction: 0.7

      };

    } else {

      var options = {

        speed: 0.3,
        duration: 2000,
        lerpTime: 400,
        cellAttraction: 0.5,
        originAttraction: 0.7

      };

    }

    organs.push( new Organ( content, options ).init() );

  } );

  var brain = new Brain( organs ).init();

// })();