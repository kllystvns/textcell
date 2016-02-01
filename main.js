GLOBAL = {

	// ACCEL: 0.08,

	// pixels per ms
	SPEED: 0.13,

	// fast arithemetic growth
	CELL_ATTRACTION: 0.08,

	// slow geometric growth
	ORIGIN_ATTRACTION: 0.7,

	// fps
	FRAMERATE: 15,

	// ms
	DURATION: 8000,

	LERP_TIME: 800

}

var contentsNodeList = document.querySelectorAll('.content');
var contents = [];
for ( var i = 0; i < contentsNodeList.length; i++ ) {

	contents.push( contentsNodeList[ i ] );

}

var organs = [];
contents.forEach( function( content, index ) {

	if ( index === 0 ) {

		var options = {

			// framerate: 15,
			// speed: 0.13,
			// duration: 8000,
			// originAttraction: 0.7,
			// cellAttraction: 0.08,
			// lerpTime: 800

		};

	} else {

		var options = {

			// framerate: 15,
			speed: 0.3,
			duration: 2000,
			cellAttraction: 0.5,
			lerpTime: 400

		};

	}

	organs.push( new Organ( content, options ).init() );

} );

var brain = new Brain( organs ).init();

