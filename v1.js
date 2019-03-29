"use strict";

//// porperties for fine tuning
// distance to playing field
var camera_distance = 30;

// Move the board up and down with mouse
const min_spinX = 2; // if mouse movement < min_spinX no movement is done
const max_spinX = 300; // Maximum up down rotation
const spinX_scale = 0.1; // Speed at which the board moves up down reletive to mouse

const fovy = 60; //field of view
////

var canvas;
var gl;

var movement = false;     // Er músarhnappur niðri?
var spinX = 0;
var spinY = 0;
var wheel = 0;
var checked = false;
var origX;
var origY;

var proLoc;
var mvLoc;
var mtLoc;
var eyeLoc;


var camera  = vec4(0.0, 0.0, 15.0, 1.0); // upphafsstaðsetning myndavélar
var up      = vec4(0.0, 1.0, 0.0, 0.0); // uppvigur
var proj;


var lightPosition = vec4(0, 2.0, 3.0, 0.0 );
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.1, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ambientColor, diffuseColor, specularColor;
var ambientProduct, diffuseProduct, specularProduct;
var program;

// Create array for cubes
var arr = [], width = 4, depth = 4, height = 20;
for ( var x = 0; x < width; x++ ) {
    arr[x] = [];
    for ( var y = 0; y < height+3; y++ ){
        arr[x][y] = [];
        for ( var z = 0; z < depth; z++ ){
            arr[x][y][z] = 0;
        }
    }
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    proj = perspective( 40, canvas.width/canvas.height, 1.0, -1000.0 );


    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //lookAtLoc = gl.getUniformLocation( program, "lookAtDir" );
    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelView" );
    eyeLoc = gl.getUniformLocation( program, "eyePosition" );
    mtLoc = gl.getUniformLocation( program, "modelT" );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );


    // verticies
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticies), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);



    // Setjum ofanvarpsfylki hér í­ upphafi
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));


    // Atburföll
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    window.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;

            // only change view if greater than min_spinX
            var new_spinX = (e.offsetY - origY);
            if(Math.abs(new_spinX) > min_spinX){
                spinX += (e.offsetY - origY);
            }
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 73:	// i

                break;
            case 75:	// k

                break;
            case 76:	// l

                break;
            case 74:	// j

                break;
            case 38:	// uparrow
                p.move([-1,0])
                break;
            case 40:	// backarrow
                p.move([1,0])
                break;
            case 39:	// rightarrow
                p.move([0,1])
                break;
            case 37:	// leftarrow
                p.move([0,-1])
                break;
            case 65:	// a

                break;
            case 90:    // z

                break;
            case 83:	// s

                break;
            case 88:    // x

                break;
            case 68:	// d

                break;
            case 67:    // c

                break;
         }
     }  );
     window.addEventListener("keyup", function(e){
         switch( e.keyCode ) {
            case 73:	// i

                break;
            case 75:	// k

                break;
            case 76:	// l

                break;
            case 74:	// j

                break;
         }
     }  );

     // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             wheel -= 1;
         } else {
             wheel += 1;
         }
     }  );


     document.getElementById("x").oninput = function(){
         lightPosition[0] = document.getElementById("x").value
     }
     document.getElementById("y").oninput = function(){
         lightPosition[1] = document.getElementById("y").value
     }
     document.getElementById("z").oninput = function(){
         lightPosition[2] = document.getElementById("z").value
     }
     document.getElementById("showLight").onchange = function(){
         checked = document.getElementById("showLight").checked
     }


     gameLoop();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function Piece()
{

    this.init = function()
    {
        //// initialize piece
        this.type = getRandomInt(1,3);

        // Initialize top position
        this.yPos = height-1;
        this.xPos = width/2; //getRandomInt( 1, width-1);
        this.zPos = width/2; //getRandomInt( 1, depth-1);

        // Always make same piece the just rotate for randomness
        this.indicies = []; //+1 or -1 for each axis
        if(this.type == 1){
            this.indicies[0] = [0, 0, 0]; // should always be [0,0,0]
            this.indicies[1] = [1, 0, 0];
            this.indicies[2] = [-1, 0, 0];
        }
        if(this.type == 2){
            this.indicies[0] = [0, 0, 0]; // should always be [0,0,0]
            this.indicies[1] = [1, 0, 0];
            this.indicies[2] = [0, 1, 0];
        }

        // Random rotation
        var xRotate = getRandomInt(0,5);
        var yRotate = getRandomInt(0,5);
        var zRotate = getRandomInt(0,5);
        for(var i = 0; i<xRotate; i++){ this.rotateX(); }
        for(var i = 0; i<yRotate; i++){ this.rotateY(); }
        for(var i = 0; i<zRotate; i++){ this.rotateZ(); }

        // Put this new piece in arr
        for(var i = 0; i<3; i++){ arr[ this.xPos+this.indicies[i][0] ][ this.yPos+this.indicies[i][1] ][ this.zPos+this.indicies[i][2] ] = this.type }

        ////
    }

    // Returns the indicies of the lowest blocks... indicies
    this.getLowest = function(){
        var indicies = [];
        // Check each block
        for(var i=0; i<3; i++){
            var index = i;
            var x = this.indicies[i][0];
            var y = this.indicies[i][1];
            var z = this.indicies[i][2];
            // Then check all other blocks
            for(var j=0; j<3;j++){
                var tempx = this.indicies[i][0];
                var tempy = this.indicies[i][1];
                var tempz = this.indicies[i][2];
                // If there is another block with the same x and z values but lower y value
                if(x==tempx && y<tempy && z==tempz)
                    index = j;
            }
            indicies.push(index)
        }
        return indicies;
    }


    this.drop = function()
    {
        var nextY = this.yPos-1;
        var collision = false; // Collision flag
        var lowest = this.getLowest(); // Get indicies of the lowest blocks
        for(var i = 0; i<3; i++){
            if(lowest.includes(i)){
                var nextBlock = arr[ this.xPos+this.indicies[i][0]][ nextY+ this.indicies[i][1]][ this.zPos+this.indicies[i][2] ];
                // Only check lowest blocks
                if(this.indicies[i][1]<1){
                    // If collition, don't move and start a new block
                    if(nextBlock>0){
                        collision = true;
                        this.init();
                    }
                }
            }
        }

        // No collision
        if(!collision){
            for(var i = 0; i<3; i++){ arr[ this.xPos+this.indicies[i][0] ][ this.yPos+this.indicies[i][1] ][ this.zPos+this.indicies[i][2] ] = 0 }
            this.yPos = nextY;
            for(var i = 0; i<3; i++){ arr[ this.xPos+this.indicies[i][0] ][ this.yPos+this.indicies[i][1] ][ this.zPos+this.indicies[i][2] ] = this.type }
            // if piece hit rock bottom /placeholder
            if(this.yPos==0){
                this.init();
            }
        }
    }

    this.move = function(key)
    {
        for(var i = 0; i<3; i++)
        {
            for(var i = 0; i<3; i++){ arr[ this.xPos+this.indicies[i][0] ][ this.yPos+this.indicies[i][1] ][ this.zPos+this.indicies[i][2] ] = 0 }
            var nextX = this.xPos + key[1];
            var nextZ = this.zPos + key[0];
            var OOB = false; // OUT OF BOUNDS

            // Check if next any block is out of bound according to the next position
            for(var i = 0; i<3; i++){
                if(nextX+this.indicies[i][0] < 0 || nextX+this.indicies[i][0] >= width)
                    OOB = true;
                if(nextZ+this.indicies[i][2] < 0 || nextZ+this.indicies[i][2] >= width)
                    OOB = true;
            }
            // If not outofbounds, allow move
            if(!OOB){
                this.xPos = nextX;
                this.zPos = nextZ;
            }
            for(var i = 0; i<3; i++){ arr[ this.xPos+this.indicies[i][0] ][ this.yPos+this.indicies[i][1] ][ this.zPos+this.indicies[i][2] ] = this.type }
            render()
        }
    }

    this.rotateX = function()
    {

    }
    this.rotateY = function()
    {

    }
    this.rotateZ = function()
    {

    }

    this.init()
}

// Check if any slices of array are full
function checkArr(){
    var flag;
    for(var i=0; i<depth; i++){
        flag = true;
        for(var j=0; j<width; j++){
            for(var k=0; k<width; k++){
            if(arr[j][i][k] == 0)
                flag = false;
            }
        }
        if(flag)
            delSlice(i);
        flag = true;
    }
}

// Delete slice of array and move slices down accordingly
function delSlice(ind){
    for(var i=ind; i<depth; i++){
        for(var j=0; j<width; j++){
            for(var k=0; k<width; k++){
                arr[j][i][k] = arr[j][i+1][k];
            }
        }
    }
}

var p = new Piece();
var time = 0;

function gameLoop()
{
    if(time%40==0){
        p.drop();
        checkArr();
    }
    time++;
    render();
    requestAnimFrame(gameLoop);
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(spinX > max_spinX){
        spinX = max_spinX;
    }
    if(spinX < -max_spinX){
        spinX = -max_spinX;
    }
    camera[1] = spinX*spinX_scale;

    //var distance = camera_distance - wheel;

    camera = scale(camera_distance/length(camera), camera)
    var mv = lookAt( vec3(camera), vec3(0,wheel,0), vec3(up) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv) );
    gl.uniform4fv(eyeLoc, flatten(camera) );


    var materialAmbient = vec4( 0.1, 0.0, 0.0, 1.0 );
    var materialDiffuse = vec4( 1.0, 0.0, 0.0, 1.0 );
    var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    var redAmbientProduct = mult(lightAmbient, materialAmbient);
    var redDiffuseProduct = mult(lightDiffuse, materialDiffuse);
    var redSpecularProduct = mult(lightSpecular, materialSpecular);

    materialAmbient = vec4( 0.0, 0.0, 0.1, 1.0 );
    materialDiffuse = vec4( 0.0, 0.0, 1.0, 1.0 );
    materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    var blueAmbientProduct = mult(lightAmbient, materialAmbient);
    var blueDiffuseProduct = mult(lightDiffuse, materialDiffuse);
    var blueSpecularProduct = mult(lightSpecular, materialSpecular);


    //var field_rotation = mult(rotateX(spinX), rotateY(spinY));
    var field_rotation = rotateY(spinY);

    var field_translation = translate(-(width-1)/2, -(height-1)/2, -(depth-1)/2)
    var field_mt = mult(field_rotation, field_translation)

    var s = scalem(15/32, 15/32, 15/32);
    var t;

    for ( var x = 0; x < width; x++ ) {
        for ( var y = 0; y < height; y++ ){
            for ( var z = 0; z < depth; z++ ){
                var type = arr[x][y][z];
                if(type == 1){
                    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct" ), flatten(redAmbientProduct) );
                    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct" ), flatten(redDiffuseProduct) );
                    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(redSpecularProduct) );
                }
                else if (type == 2) {
                    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct" ), flatten(blueAmbientProduct) );
                    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct" ), flatten(blueDiffuseProduct) );
                    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(blueSpecularProduct) );
                } else continue;

                var t = translate(x, y, z);
                var mt = mult(t,s);
                mt = mult(field_mt, mt)
                gl.uniformMatrix4fv(mtLoc, false, flatten(mt) );
                gl.drawArrays( gl.TRIANGLES, 0, numVerts );
            }
        }
    }

    // light
    var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
    var materialDiffuse = vec4( 0.0, 0.0, 0.0, 1.0 );
    var materialSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );

    // Line box
    gl.uniformMatrix4fv(mtLoc, false, flatten(mult(field_mt, translate(-0.5,-0.5,-0.5))) );
    gl.drawArrays( gl.LINES, numVerts, 24 );

    if(checked){
        mt =  mult(translate(lightPosition[0],lightPosition[1],lightPosition[2]), scalem(0.1,0.1,0.1));
        gl.uniformMatrix4fv(mtLoc, false, flatten(mt) );
        gl.drawArrays( gl.TRIANGLES, 0, numVerts );
    }
}

const numVerts = 36;
const cubeVerts= [
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0, -1.0,  1.0,
  // Back face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
  // Top face
  -1.0, 1.0, -1.0,
   1.0, 1.0, -1.0,
   1.0, 1.0,  1.0,
  -1.0, 1.0, -1.0,
  -1.0, 1.0,  1.0,
   1.0, 1.0,  1.0,
  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  // Left face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0
];
const cubeNorms = [
  // Front face
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
  // Back face
   0.0,  0.0,  -1.0,
   0.0,  0.0,  -1.0,
   0.0,  0.0,  -1.0,
   0.0,  0.0,  -1.0,
   0.0,  0.0,  -1.0,
   0.0,  0.0,  -1.0,
  // Top face
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
  // Bottom face
   0.0,  -1.0,  0.0,
   0.0,  -1.0,  0.0,
   0.0,  -1.0,  0.0,
   0.0,  -1.0,  0.0,
   0.0,  -1.0,  0.0,
   0.0,  -1.0,  0.0,
  // Right face
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
  // Left face
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0
];

//create lines
const LineVerts = [
    // Bottom
    0.0,   0.0,   0.0,
    width, 0.0,   0.0,

    width, 0.0,   0.0,
    width, height, 0.0,

    width, height, 0.0,
    0.0,   height, 0.0,

    0.0,   height, 0.0,
    0.0,   0.0,   0.0,

    // Top
    0.0,   0.0,   depth,
    width, 0.0,   depth,

    width, 0.0,   depth,
    width, height, depth,

    width, height, depth,
    0.0,   height, depth,

    0.0,   height, depth,
    0.0,   0.0,   depth,

    // Connect
    0.0,   0.0,   0.0,
    0.0,   0.0,   depth,

    width, 0.0,   0.0,
    width, 0.0,   depth,

    width, height, 0.0,
    width, height, depth,

    0.0,   height, 0.0,
    0.0,   height, depth
]

var verticies = cubeVerts.concat(LineVerts);
// don't care about the normals for the line but they have to be in the buffer
var normals = cubeNorms.concat(LineVerts);
