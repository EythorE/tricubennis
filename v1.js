"use strict";

var canvas;
var gl;


var movement = false;     // Er músarhnappur niðri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var proLoc;
var mvLoc;
var mtLoc;
var eyeLoc;


var camera  = vec4(0.0, 0.0, 15.0, 1.0); // staðsetning myndavélar
var lookDir = vec4(0.0, 0.0, -1.0, 0.0); // áhorfs vigur
var up      = vec4(0.0, 1.0, 0.0, 0.0); // uppvigur
var proj = perspective( 60, 9.0/16.0, 1.0, -1000.0 ); //fovy, aspect, near, far


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

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVerts), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeNorms), gl.STATIC_DRAW );

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
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 87:	// w
                moveFB = 1;
                break;
            case 83:	// s
                moveFB = -1;
                break;
            case 68:	// d
                moveLR = 1;
                break;
            case 65:	// a
                moveLR = -1;
                break;
         }
     }  );
     window.addEventListener("keyup", function(e){
         switch( e.keyCode ) {
            case 87:	// w
                moveFB = 0;
                break;
            case 83:	// s
                moveFB = 0;
                break;
            case 68:	// d
                moveLR = 0;
                break;
            case 65:	// a
                moveLR = 0;
                break;
         }
     }  );

     // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             camera[1] -= 0.2;
         } else {
             camera[1] += 0.2;
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


     document.getElementById("freeView").onchange = function(){
         checked = document.getElementById("freeView").checked

         if(checked){
             spinX=spinX2;
             spinY=spinY2;
         } if(!checked) {
             spinX=spinX1;
             spinY=spinY1;
         }
     }

     gameLoop();
}
var checked = false;
const moveSpeed = 1.0;
var moveFB = 0;
var moveLR = 0;
var spinX2 = 0;
var spinY2 = 0;
var spinX1 = 0;
var spinY1 = 0;


var arr = [], width = 6, depth = 6, height = 7;
for ( var x = 0; x < width; x++ ) {
    arr[x] = [];
    for ( var y = 0; y < height+3; y++ ){
        arr[x][y] = [];
        for ( var z = 0; z < depth; z++ ){
            arr[x][y][z] = 0;
        }
    }
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

        // random top position
        this.yPos = height+1;
        this.xPos = getRandomInt( 1, width-1);
        this.zPos = getRandomInt( 1, depth-1);


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

    this.drop = function()
    {
        for(var i = 0; i<3; i++){ arr[ this.xPos+this.indicies[i][0] ][ this.yPos+this.indicies[i][1] ][ this.zPos+this.indicies[i][2] ] = 0 }
        this.yPos = this.yPos-1;
        for(var i = 0; i<3; i++){ arr[ this.xPos+this.indicies[i][0] ][ this.yPos+this.indicies[i][1] ][ this.zPos+this.indicies[i][2] ] = this.type }
        // if piece hit rock bottom /placeholder
        if(this.yPos==0){
            this.init();
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

var p = new Piece();
var time = 0;

function gameLoop()
{
    if(time%40==0){
        p.drop();
    }
    time++;
    render();
    requestAnimFrame(gameLoop);
}




function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(checked){
        spinX2 = spinX;
        spinY2 = spinY;

        var maxLookUp = 89;
        if(spinX>maxLookUp) spinX2 = maxLookUp;
        if(spinX<-maxLookUp) spinX2 = -maxLookUp;
    }
    lookDir = mult( rotateY(-spinY2), vec4(0.0, 0.0, -1.0, 1.0) );
    lookDir = mult( rotate(-spinX2, cross(lookDir, up)), lookDir );

    camera = add( camera, scale(moveFB*moveSpeed, lookDir) );
    var dir = vec4(cross(lookDir, up));
    dir = scale(1/length(dir), dir);
    camera = add( camera, scale(moveLR*moveSpeed, dir) );



    var mv = lookAt( vec3(camera), vec3(add(camera, lookDir)), vec3(up) );
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



    if(!checked) {
        spinX1 = spinX;
        spinY1 = spinY;
    }
    //var field_rotation = mult(rotateY(spinY1), rotateX(spinX1));
    var field_rotation = rotateY(spinY1);
    var field_translation = translate(-(width-1)/2, -(height-1)/2, -(depth-1)/2)
    var field_mt = mult(field_rotation, field_translation)

    var s = scalem(15/32, 15/32, 15/32);
    var t;

    for ( var x = 0; x < width; x++ ) {
        for ( var y = 0; y < height+3; y++ ){
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


    mt =  mult(translate(lightPosition[0],lightPosition[1],lightPosition[2]), scalem(0.1,0.1,0.1));
    gl.uniformMatrix4fv(mtLoc, false, flatten(mt) );
    gl.drawArrays( gl.TRIANGLES, 0, numVerts );
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
