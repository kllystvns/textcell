//need2...
//--add support for resize
//--fix or delete getBoundingRect


GLOBAL = {

	// ACCEL: null,

	// pixels per ms
	SPEED: null,

	// fast arithemetic growth
	CELL_ATTRACTION: null,

	// slow geometric growth
	ORIGIN_ATTRACTION: null,

	// fps
	FRAMERATE: null,

	// ms
	DURATION: null,

	// ms
	LERP_TIME: null

}

// PARAGRAPH level
function Organ( element, options ) {

	this.framerate = options.framerate || GLOBAL.FRAMERATE;

	this.duration = options.duration || GLOBAL.DURATION;
	this.lerpTime = options.lerpTime || GLOBAL.LERP_TIME;

	this.speed = options.speed || GLOBAL.SPEED;

	this.cellAttraction = options.cellAttraction || GLOBAL.CELL_ATTRACTION;
	this.originAttraction = options.originAttraction || GLOBAL.ORIGIN_ATTRACTION;
		
	this.timer = 0;


	this.sourceDiv = element;
	var sourceStyles = {

		position: 'absolute',

		left: this.sourceDiv.offsetLeft + 'px',
		top: this.sourceDiv.offsetTop + 'px',
		width: this.sourceDiv.offsetWidth + 'px',

		font: getComputedStyle( this.sourceDiv ).font

	};

	this.div = document.createElement( 'div' );
	this.div.classList.add( 'organ' );
	for ( style in sourceStyles ) {

		this.div.style[ style ] = sourceStyles[ style ];

	}
	this.sourceDiv.parentNode.appendChild( this.div );

	this.canvas = document.createElement('canvas');
	this.canvas.style.position = 'absolute';
	this.sourceDiv.parentNode.appendChild(this.canvas);
	this.canvasAPI = this.canvas.getContext('2d');

	this.textArray = this.filterText( this.sourceDiv.textContent );

	this.wordArray = this.filterWords( this.textArray );

	this.cells = [];

	return this;

}
Organ.prototype = {

	constructor: Organ,

	init: function() {

		this.initTissues();

		this.resetCanvas();

		this.initCells();

		this.accelerateAnimation = ( function( A, B, C ) {

			return function() {

				if ( this.timer < ( this.duration - this.lerpTime ) * 0.6 ) {

					if ( this.cellAttraction < A ) {

						this.cellAttraction *= 1.04;
						
					}

					if ( this.speed > B ) {

						this.speed *= 0.995;
						
					}

				} else if ( this.timer < this.duration - this.lerpTime ) {

					if ( this.originAttraction < 10 ) {

						this.originAttraction *= 1.07;

					}

					if ( this.speed < C ) {

						this.speed *= 1.016;

					}

				} 

			}

		} )( this.cellAttraction * 25 , this.speed * 0.77, this.speed * 1.6 ) 

		return this;

	},

	resetCanvas: function() {

		this.canvas.width = this.div.offsetWidth;
		this.canvas.height = this.div.offsetHeight + 20;
		this.canvas.style.left = this.div.offsetLeft + 'px';
		this.canvas.style.top = this.div.offsetTop + 'px';

		this.canvasAPI.font = getComputedStyle( this.sourceDiv ).font;
		this.canvasAPI.textBaseline = 'hanging';

		this.canvasFontOffset = parseFloat( getComputedStyle( this.sourceDiv ).fontSize.replace(/px/, '') ) * 0.2 ;

	},

	initTissues: function() {

		this.tissues = [];
		this.cells = [];

		var newTissue;
		for ( var i = 0; i < this.wordArray.length; i++ ) {

			if ( '\n' === this.wordArray[ i ] ) {

				this.div.appendChild( document.createElement('br') );
				this.div.appendChild( document.createElement('br') );

			} else {

				newTissue = new Tissue( this.wordArray[i], this );

				this.tissues.push( newTissue );
				for ( var j = 0; j < newTissue.cells.length; j++ ) {

					this.cells.push( newTissue.cells[ j ] );

				}

				this.div.appendChild( newTissue.div );

			}

		}

		this.boundingRect = this.getBoundingRect();

	},

	initCells: function() {

		this.cells.forEach( function( cell ) {

			cell.init();

		});

	},

	filterText: function( text ) {

		window.isSpecialChar = function( char ) {

			return [' ', '\n'].indexOf( char ) > -1

		};

		var textArray = text.split('')
			.map( function( char ) {

				if ( ['\r', '\n', '\f'].indexOf > 0 ) {

					return '\n';

				} else if ( char === '\t' ) {

					return ' ';

				} else {

					return char;

				}

			} )
			.filter( function( char, index, array ) {

				var extraChar = false;

				[' ', '\n'].forEach( function( specialChar ) {

					if ( char === specialChar ) {

						for ( var i = index; i < array.length; i++ ) {

							if ( isSpecialChar( array[ i + 1 ] ) ) {

								array[ i + 1 ] === specialChar ? extraChar = true : null;

							} else {

								break;

							}

						}

					} 

				} );

				return extraChar ? false : true;

			} )
			.filter( function( char, index, array ) {

				var extraChar = false;

				if ( char === ' ' ) {

					extraChar = isSpecialChar( array[ index - 1 ] );

				}

				return extraChar ? false : true;

			} )

		var spliceCount = 0;
		for ( var i = 0; i < textArray.length; i++ ) {

			if ( isSpecialChar( textArray[ i ] ) ) {

				spliceCount++

			} else {

				break;

			}

		}
		textArray.splice( 0, spliceCount );

		spliceCount = 0;
		for ( var i = textArray.length - 1; i > -1; i-- ) {

			if ( isSpecialChar( textArray[ i ] ) ) {

				spliceCount++

			} else {

				break;

			}

		}
		textArray.splice( textArray.length - spliceCount, spliceCount );

		return textArray;

	},

	filterWords: function( textArray ) {

		var wordArray = [];

		var word = '';
		for ( var i = 0; i < textArray.length; i++ ) {

			if ( isSpecialChar( textArray[ i ] ) ) {

				word += textArray[ i ];
				wordArray.push( word );
				word = '';

			} else {

				word += textArray[ i ];

				if ( isSpecialChar( textArray[ i + 1 ] ) || i === textArray.length - 1 ) {

					wordArray.push( word );
					word = '';

				}

			}

		}

// oops, i didnt want the spaces after all...
		return wordArray.filter(function(word){ return word !== ' ' });

	},

	getBoundingRect: function() {

		var rect = this.div.getBoundingClientRect();

		return {

			// top left, top right, bottom right, bottom left
			tl: new Vector2( rect.left, rect.top ),

			tr: new Vector2( rect.left + rect.width, rect.top ),

			br: new Vector2( rect.left + rect.width, rect.top + rect.height ),

			bl: new Vector2( rect.left, rect.top + rect.height )

		}

	},

	// setInterval is used instead of requestAnimationFrame because sadly 
	// animating lots of DOM nodes can be done @ max 20 fps
	startAnimation: function() {

		this.startTime = Date.now() - this.timer;

		!this.timerLoopId ? this.timerLoopId = 0 : null;

		var unboundFunc = (function( id ) {
			return function() {

				if (this.timerLoopId === id) {

					this.timer = Date.now() - this.startTime;

					setTimeout( timerLoop, 1 );

				}

			}
		})(this.timerLoopId);
		var timerLoop = unboundFunc.bind(this);

		timerLoop();

		var boundRenderFrame = this.renderFrame.bind( this );
		this.animationInterval = setInterval( boundRenderFrame, 1000 / this.framerate );

	},

	pauseAnimation: function() {

		this.timerLoopId++;

		clearInterval( this.animationInterval );

	},

	endAnimation: function() {

		this.pauseAnimation();
		this.isFinished = true;

		this.div.remove();
		this.canvas.remove();
		this.sourceDiv.style.color = 'initial';

	},

	renderFrame: function() {

		this.canvasAPI.save();

		this.canvasAPI.clearRect( 0, 0, this.canvas.width, this.canvas.height );

		this.canvasAPI.restore();
		// this.canvasAPI.font = this.canvasFont;
		// this.canvasAPI.font = getComputedStyle(this.sourceDiv).font;
		// this.canvasAPI.textBaseline = 'hanging';

		if ( this.timer < this.duration - this.lerpTime ) {

			this.accelerateAnimation();

			for ( var i = 0; i < this.cells.length; i++ ) {

				this.cells[ i ].onCalculationFrame();

				this.cells[ i ].renderPosition();

			}
			
		}

		else {

			var timeQuotient = 1 - (this.duration - this.timer) / this.lerpTime;

			if ( timeQuotient < 1 ) {

				for ( var i = 0; i < this.cells.length; i++ ) {

					this.cells[ i ].lerp( timeQuotient );

					this.cells[ i ].renderPosition();

				}

			} else {

				for ( var i = 0; i < this.cells.length; i++ ) {

					this.cells[ i ].renderPosition();

				}

				this.endAnimation();
				
			}

		}

	},

	isVisible: function() {

		var rect = this.sourceDiv.getBoundingClientRect();

		return ( rect.top >= 0 && rect.top < window.innerHeight ) ||
					 ( rect.bottom > 0 && rect.bottom <= window.innerHeight ); 

	},

	isMostlyVisible: function() {

		var rect = this.sourceDiv.getBoundingClientRect();

		var top = rect.top > 0 ? rect.top : 0;
		var bottom = rect.bottom < window.innerHeight ? rect.bottom : window.innerHeight;

		var visibility = ( bottom - top ) / rect.height;
		return visibility > 0.5;

	},

	isTooBigToBeVisible: function() {

		var rect = this.sourceDiv.getBoundingClientRect();

		return rect.height > window.innerHeight;

	}

} // end Organ



// WORD level
function Tissue( string, organ ) {

	this.parentOrgan = organ;

	this.cells = [];

	if ( !isSpecialChar( string ) ) {

		this.div = document.createElement('div');
		this.div.style.display = 'inline-block';


		var newCell;
		for ( var i = 0; i < string.length; i++ ) {

			newCell = new Cell( string[ i ], this );
			this.cells.push( newCell );	

			if ( i === string.length - 1 ) {

				newCell.sourceDiv.innerHTML += '&nbsp;';

			}
			this.div.appendChild( newCell.sourceDiv );

		}

	} else {

		console.warn('tissue() input cant be special character');

	}

}
Tissue.prototype = {

	constructor: Tissue

}




// LETTER level
function Cell( text, tissue ) {

	// this.isActive = true;

	this.parentTissue = tissue || null;
	this.parentOrgan = tissue ? tissue.parentOrgan : null;

	this.canvasAPI = this.parentOrgan.canvasAPI;

	if ( isSpecialChar( text ) ) {

		console.warn('cell() input cant be special character');

	}

	this.text = text;

	this.sourceDiv = document.createElement('span');
	this.sourceDiv.innerHTML = this.text;
	this.sourceDiv.style.visibility = 'hidden';
	this.sourceDiv.classList.add( 'cell' );
	this.sourceDiv.classList.add( 'static' );

// if (this.text === '\n') {
// 	this.sourceDiv = document.createElement('br');

// 	this.isActive = false;
// }

	this.timer = 0;

	this.position = new Vector2();

	this.trajectory = new Vector2();

}
Cell.prototype = {

	constructor: Cell,

	init: function() {

		this.bounds = this.setBounds();

		this.calcInitPosition();

		// this.div = document.createElement('div');
		// this.div.innerHTML = this.text;
		// this.div.style.display = 'inline-block';
		// this.div.style.visibility = 'hidden';
		// this.div.classList.add( 'cell' );
		// this.div.classList.add( 'animated' );

		// this.positionAbsolute();

		this.positionRandom();

		this.showAnimationText();

	},

	calcInitPosition: function() {

		this.origin = new Vector2( this.sourceDiv.offsetLeft, this.sourceDiv.offsetTop );

	},

	setBounds: function() {

		var rect = this.parentTissue.parentOrgan.boundingRect;

		return {

			width: rect.tr.x - rect.tl.x,

			height: rect.bl.y - rect.tl.y

		}

	},

	positionRandom: function() { 

		var center = new Vector2( this.bounds.width / 2, this.bounds.height / 2 );
		center.add( new Vector2().random().multiplyScalar( Math.random() * this.bounds.height / 2 ) ); 

		this.position.copy( center );
		this.position.x < 0 ? this.position.x = 0 : null;
		this.position.x > this.bounds.width ? this.position.x = this.bounds.width : null;

		this.renderPosition();
		
		this.trajectory.random();

	},

	// positionAbsolute: function() {

	// 	this.div.style.position = 'absolute';

	// 	this.parentOrgan.div.appendChild( this.div );

	// },


	showAnimationText: function() {

		this.sourceDiv.style.visibility = 'hidden';

		// this.div.style.visibility = 'visible';

	},

	showStaticText: function() {

		// this.div.style.visibility = 'hidden';

		this.sourceDiv.style.visibility = 'visible';

	},

	setPosition: function( vec ) {

		this.position.x = vec.x;
		this.position.y = vec.y;

	},

	renderPosition: function() {

		this.canvasAPI.fillText( this.text, this.position.x, this.position.y + this.parentOrgan.canvasFontOffset );

		// this.div.style.left = this.position.x + 'px';
		// this.div.style.top = this.position.y + 'px';

	},

	onCalculationFrame: function( lerpTime ) {

		var dTime = this.parentTissue.parentOrgan.timer - this.timer;
		this.timer = this.parentTissue.parentOrgan.timer;

		if ( !lerpTime ) {

			this.gravitate();

			this.moveAlongTrajectory( dTime );

			this.bounceOffEdge();

		} else {

			this.lerp( lerpTime );

		}

	},

	gravitate: function() {

		var attractor = new Vector2();

		var vec;
		var dist;
		for ( var i = 0; i < this.parentTissue.cells.length; i++ ) {

			vec = this.parentTissue.cells[ i ].position.clone();
			vec.sub( this.position );

			dist = vec.length();

			if ( dist > 15 ) {

				vec.normalize();
				vec.multiplyScalar( 1 / (dist * dist) );

				attractor.add( vec );
				
			}

		} 
		vec = this.origin.clone();
		vec.sub( this.position );

		dist = vec.length();
		vec.normalize();
		vec.multiplyScalar( 1 / (dist * dist) );
		vec.multiplyScalar( this.parentOrgan.originAttraction );

		attractor.add( vec );

		attractor.setLength( this.parentOrgan.cellAttraction );

		this.trajectory.add( attractor );
		this.trajectory.normalize();

	},

	lerp: function( time ) {

		if ( !this.lerpPosition ) {

			this.lerpVector = new Vector2();
			this.lerpVector.subVectors( this.origin, this.position );

		}

		var interval = this.lerpVector.clone();
		interval.multiplyScalar( time );

		this.position.add( interval );

	},

	moveAlongTrajectory: function( dTime ) {

		var distance = dTime * this.parentOrgan.speed;

		var tr = this.trajectory.clone();
		tr.multiplyScalar( distance );

		this.position.add( tr );

	},

	bounceOffEdge: function() {

		if ( this.position.x < 0 ) {

			this.trajectory.x *= -1;

			this.position.x = 0;

		} else if ( this.position.x > this.bounds.width ) {

			this.trajectory.x *= -1;

			this.position.x = this.bounds.width;

		}

		if ( this.position.y < 0 ) {

			this.trajectory.y *= -1;

			this.position.y = 0;

		} else if ( this.position.y > this.bounds.height ) {

			this.trajectory.y *= -1;

			this.position.y = this.bounds.height;

		}

	}

}
// Cell.prototype.translateLogarithmic = function(currFrameNum) {
// 	var dLeft = this.logDLeft * Math.pow(Math.E, this.accel * currFrameNum);
// 	var dTop = this.logDTop * Math.pow(Math.E, this.accel * currFrameNum);
// 	this.posLeft = this.origLeft - dLeft + this.logDLeft;
// 	this.posTop = this.origTop - dTop + this.logDTop;
// }
// Cell.prototype.calcLogarithmicPts = function(frameNumber) {

// 	this.endLeft = this.div.offsetLeft;
// 	this.endTop = this.div.offsetTop;
	
// 	this.linDLeft = (this.left - this.currLeft) / frameNumber;
// 	this.linDTop = (this.top - this.currTop) / frameNumber;
	
// 	this.logDLeft = (this.left - this.endLeft) / (Math.pow(Math.E, this.accel * frameNumber) - 1);
// 	this.logDTop = (this.top - this.endTop) / (Math.pow(Math.E, this.accel * frameNumber) - 1);

// }



function Brain( organArray ) {

	this.organs = organArray;

	for ( var i = 0; i < this.organs.length; i++ ) {

		this.organs[ i ].brain = this;

	}

	return this;

}
Brain.prototype = {

	constructor: Brain,

	init: function() {

		var animate = (function() { 

			this.choose();

			var boundChoose = this.choose.bind( this );
			window.addEventListener( 'scroll', boundChoose );

		}).bind( this )

		requestAnimationFrame( function() { setTimeout( animate, 500 ) } );


		return this;

	},

	choose: function() {

		var choices = this.whichHighest( this.whichVisible( this.organs ) );

		var chosen = false;
		for ( var i = 0; i < choices.length; i++ ) {

			if ( chosen ) {

				if ( choices[ i ].isActive ) {

					choices[ i ].pauseAnimation();
					choices[ i ].isActive = false;

				}

			} else if ( choices[ i ].isActive ) {

				chosen = true;

			} else {

				if ( choices[ i ].isMostlyVisible() || choices[ i ].isTooBigToBeVisible() ) {

					choices[ i ].startAnimation();
					choices[ i ].isActive = true;

					chosen = true;
					
				}

			}

		}

		var rejects = this.organs.filter( function( organ ) {

			return choices.indexOf( organ ) === -1;

		} );

		rejects.forEach( function( reject ) {

			if ( reject.isActive ) {

				reject.pauseAnimation();
				reject.isActive = false;

			}

		} );

	},

	whichVisible: function( organArray ) {

		return organArray.filter( function( organ ) {

			return organ.isVisible() && !organ.isFinished;

		} );

	},

	whichHighest: function( organArray ) {

		return organArray.sort( function( a, b ) {

			return a.sourceDiv.offsetTop > b.sourceDiv.offsetTop;

		} );

	}

}




// from THREE.js
/**
 * @author mrdoob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 * @author egraether / http://egraether.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */
Vector2 = function ( x, y ) {

	this.x = x || 0;
	this.y = y || 0;

};

Vector2.prototype = {

	constructor: Vector2,

	get width() { return this.x },
	set width( value ) { this.x = value },

	get height() { return this.y },
	set height( value ) { this.y = value },

	//
	set: function ( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	},

	setX: function ( x ) {

		this.x = x;

		return this;

	},

	setY: function ( y ) {

		this.y = y;

		return this;

	},

	setComponent: function ( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	getComponent: function ( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	clone: function () {

		return new this.constructor( this.x, this.y );

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	},

	add: function ( v, w ) {

		this.x += v.x;
		this.y += v.y;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;

		return this;

	},

	addVectors: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;

	},

	addScaledVector: function ( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;

		return this;

	},

	sub: function ( v, w ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	},

	subScalar: function ( s ) {

		this.x -= s;
		this.y -= s;

		return this;

	},

	subVectors: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	},

	multiply: function ( v ) {

		this.x *= v.x;
		this.y *= v.y;

		return this;

	},

	multiplyScalar: function ( scalar ) {

		if ( isFinite( scalar ) ) {
			this.x *= scalar;
			this.y *= scalar;
		} else {
			this.x = 0;
			this.y = 0;
		}

		return this;

	},

	divide: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;

		return this;

	},

	divideScalar: function ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	},

	min: function ( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );

		return this;

	},

	max: function ( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );

		return this;

	},

	clamp: function ( min, max ) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );

		return this;

	},

	clampScalar: function () {

		var min, max;

		return function clampScalar( minVal, maxVal ) {

			if ( min === undefined ) {

				min = new Vector2();
				max = new Vector2();

			}

			min.set( minVal, minVal );
			max.set( maxVal, maxVal );

			return this.clamp( min, max );

		};

	}(),

	clampLength: function ( min, max ) {

		var length = this.length();

		this.multiplyScalar( Math.max( min, Math.min( max, length ) ) / length );

		return this;

	},

	floor: function () {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );

		return this;

	},

	ceil: function () {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );

		return this;

	},

	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );

		return this;

	},

	negate: function () {

		this.x = - this.x;
		this.y = - this.y;

		return this;

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	},

	lengthManhattan: function() {

		return Math.abs( this.x ) + Math.abs( this.y );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	},

	setLength: function ( length ) {

		return this.multiplyScalar( length / this.length() );

	},

	lerp: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	},

	lerpVectors: function ( v1, v2, alpha ) {

		this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

		return this;

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	},

	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];

		return this;

	},

	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;

		return array;

	},

	fromAttribute: function ( attribute, index, offset ) {

		if ( offset === undefined ) offset = 0;

		index = index * attribute.itemSize + offset;

		this.x = attribute.array[ index ];
		this.y = attribute.array[ index + 1 ];

		return this;

	},

	rotateAround: function ( center, angle ) {

		var c = Math.cos( angle ), s = Math.sin( angle );

		var x = this.x - center.x;
		var y = this.y - center.y;

		this.x = x * c - y * s + center.x;
		this.y = x * s + y * c + center.y;

		return this;

	},

	random: function () {

		this.x = Math.random() - 0.5; 
		this.y = Math.random() - 0.5;

		this.normalize();

		return this;

	}

};





function init() {

	GLOBAL = {

		FRAMERATE: 14

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

}
init();



