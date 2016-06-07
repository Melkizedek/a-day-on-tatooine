//the OpenGL context
var gl = null,
    program = null;

// camera control, set starting viewpoint here!
const camera = {
  rotation: {
    x: 90,
    y: 20
  },
  position: {
    x: 200,
    y: -200,
    z: -300
  },
  direction: {
    x: 0,
    y: 0,
    z: 0
  },
  speed: 10  // TODO choose speed
};

// scenegraph
var timePrev = 0;
var root = null;
var leiaRotNode;
var billTranNode;


// animation scenes
var volleyballCoordinates = [200.0, 0, 0];
var volleyballTranNode;
var volleyballDirection = 1.0;
var volleyballSpeed = 0;
var volleyballLocation = 0.0;

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(800 /*width*/, 600 /*height*/); // TODO which width and height?

  gl.enable(gl.DEPTH_TEST);

  //compile and link shader program
  program = createProgram(gl, resources.vs, resources.fs);

  //create scenegraph
  root = createSceneGraph(resources);

  initInteraction(gl.canvas);
}

/**
 * builds up the scenegraph and returns the root node
 */
function createSceneGraph(resources) {
  let root = new ShaderSGNode(program);
  let enableTexNode = new SetUniformSGNode('u_enableObjectTexture', true);

  // --------------------- camera test scene ------------------------
  let sphere = makeSphere();
  let sphereModelNode = new RenderSGNode(sphere);
  let sphereTexNode = new AdvancedTextureSGNode(resources.tex);
  let sphereMatNode = new MaterialSGNode();
  let sphereTranNode = new TransformationSGNode(glm.transform({translate: [0, 0, 0]}));

  let rect = makeRect(1.5, 1.3);
  let rectShaderNode = new ShaderSGNode(createProgram(gl, resources.whiteVs, resources.whiteFs));   // trying to use a different shader - how to combine shader results?
  let rectModelNode = new RenderSGNode(rect);
  let rectTexNode = new AdvancedTextureSGNode(resources.tex);
  let rectMatNode = new MaterialSGNode();
  let rectTranNode = new TransformationSGNode(glm.transform({translate: [-6, -6, -6]}));

  let lightSphere = makeSphere(0.5, 20, 20);
  let lightModelNode = new RenderSGNode(lightSphere);
  let lightTexNode = new AdvancedTextureSGNode(resources.sunTex);
  let lightMatNode = new MaterialSGNode();
  let lightNode = new LightSGNode([0, 0, -15]);

  let light2Sphere = makeSphere(100, 20, 20);
  let light2ModelNode = new RenderSGNode(lightSphere);
  let light2Node = new LightSGNode([500, -500, 500]);
  // --------------------- camera test scene ------------------------

  // billboard
  let billboard = makeRect(20, 30);
  let billShaderNode = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs));   // trying to use a different shader - how to combine shader results?
  let billModelNode = new RenderSGNode(billboard);
  let billTexNode = new AdvancedTextureSGNode(resources.tex);
  let billMatNode = new MaterialSGNode();
  billTranNode = new TransformationSGNode(glm.transform({translate: [150, -50, -100]}));

  // volleyball
  let volleyball = makeSphere(5, 0, 0);
  let volleyballShaderNode = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs));
  let volleyballModelNode = new RenderSGNode(volleyball);
  let volleyballTexNode = new AdvancedTextureSGNode(resources.sunTex);
  let volleyballMatNode = new MaterialSGNode();
  volleyballTranNode = new TransformationSGNode(glm.transform({translate: [volleyballCoordinates[0], volleyballCoordinates[1], volleyballCoordinates[2]]}));

  // tusken 1
  let tusken1 = resources.tusken;
  let tuskenShaderNode1 = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs));
  let tuskenModelNode1 = new RenderSGNode(tusken1);
  let tuskenTexNode1 = new AdvancedTextureSGNode(resources.leiaTex);   // TODO putting a texture doesn't really work here (whole texture used for every triangle?)
  let tuskenMatNode1 = new MaterialSGNode();
  let tuskenTranNode1 = new TransformationSGNode(glm.transform({translate: [volleyballCoordinates[0], volleyballCoordinates[1], volleyballCoordinates[2]], rotateX: 180, rotateY: 90}));

  // tusken 2
  let tusken2 = resources.tusken;
  let tuskenShaderNode2 = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs));
  let tuskenModelNode2 = new RenderSGNode(tusken2);
  let tuskenTexNode2 = new AdvancedTextureSGNode(resources.leiaTex);   // TODO putting a texture doesn't really work here (whole texture used for every triangle?)
  let tuskenMatNode2 = new MaterialSGNode();
  let tuskenTranNode2 = new TransformationSGNode(glm.transform({translate: [volleyballCoordinates[0] + 100, volleyballCoordinates[1], volleyballCoordinates[2]], rotateX: 180, rotateY: -90}));

  // leia
  let leia = resources.leia;
  let leiaShaderNode = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs));
  let leiaModelNode = new RenderSGNode(leia);
  let leiaTexNode = new AdvancedTextureSGNode(resources.leiaTex);   // TODO putting a texture doesn't really work here (whole texture used for every triangle?)
  let leiaMatNode = new MaterialSGNode();
  let leiaTranNode = new TransformationSGNode(glm.transform({translate: [100, -50, -100], rotateX: 180}));
  leiaRotNode = new TransformationSGNode(glm.transform({rotateY: 180}));

  // sandcrawler
  // TODO add spotlight to sandcrawler graph, to implement spotlights in a shader: www.tomdalling.com/blog/modern-opengl/08-even-more-lighting-directional-lights-spotlights-multiple-lights/
  let sandcrawlerBody = makeSandcrawlerBody();
  let sandcrawlerCrawlers = makeCrawlerQuad(1, 0.1, 0.5);
  let sandcrawlerBodyModelNode = new RenderSGNode(sandcrawlerBody);
  let sandcrawlerCrawlersModelNode = new RenderSGNode(sandcrawlerCrawlers);
  let sandcrawlerBodyTexNode = new AdvancedTextureSGNode(resources.rustyMetalTex);
  let sandcrawlerCrawlersTexNode = new AdvancedTextureSGNode(resources.crawlersTex);
  let sandcrawlerCrawlersTranNode = new TransformationSGNode(glm.transform({translate: [0, -0.1, 0]}));
  let sandcrawlerMatNode = new MaterialSGNode();
  let sandcrawlerTranNode = new TransformationSGNode(glm.transform({translate: [500, -50, 500], rotateX: 180, scale: 200}));


  // test terrain generation from heightmap
  let terrain = generateTerrain(resources.heightmap, 16, 16, 120);
  let terrainModelNode = new RenderSGNode(terrain);
  let terrainTexNode = new AdvancedTextureSGNode(resources.sandTex);
  let terrainMatNode = new MaterialSGNode();
  let terrainTranNode = new TransformationSGNode(glm.transform({translate: [0, 100, 0]}));

  // show terrain
  terrainTranNode.append(terrainMatNode);
  terrainMatNode.append(terrainTexNode);
  terrainTexNode.append(terrainModelNode);
  terrainTexNode.append(enableTexNode);
  root.append(terrainTranNode);

  // show sandcrawler
  sandcrawlerTranNode.append(sandcrawlerMatNode);
  sandcrawlerMatNode.append(sandcrawlerBodyTexNode);
  sandcrawlerMatNode.append(sandcrawlerCrawlersTranNode);
  sandcrawlerMatNode.append(enableTexNode);
  sandcrawlerCrawlersTranNode.append(sandcrawlerCrawlersTexNode)
  sandcrawlerCrawlersTexNode.append(sandcrawlerCrawlersModelNode);
  sandcrawlerBodyTexNode.append(sandcrawlerBodyModelNode);
  root.append(sandcrawlerTranNode);

  // show leia
  leiaRotNode.append(leiaMatNode);
  leiaMatNode.append(leiaTexNode);
  leiaTexNode.append(enableTexNode);
  leiaTexNode.append(leiaModelNode);
  leiaShaderNode.append(leiaTexNode);
  leiaTranNode.append(leiaRotNode);
  root.append(leiaTranNode);

  // show billboard
  billMatNode.append(billTexNode);
  billTexNode.append(enableTexNode);
  billTexNode.append(billModelNode);
  billShaderNode.append(billTexNode);
  billTranNode.append(billMatNode);
  root.append(billTranNode);

  // show volleyball
  volleyballTranNode.append(volleyballMatNode);
  volleyballMatNode.append(volleyballTexNode);
  volleyballTexNode.append(enableTexNode);
  volleyballTexNode.append(volleyballModelNode);
  volleyballShaderNode.append(volleyballTexNode);
  root.append(volleyballTranNode);

  // show tusken1
  tuskenTranNode1.append(tuskenMatNode1);
  tuskenMatNode1.append(tuskenTexNode1);
  tuskenTexNode1.append(enableTexNode);
  tuskenTexNode1.append(tuskenModelNode1);
  tuskenShaderNode1.append(tuskenTexNode1);
  root.append(tuskenTranNode1);

  // show tusken2
  tuskenTranNode2.append(tuskenMatNode2);
  tuskenMatNode2.append(tuskenTexNode2);
  tuskenTexNode2.append(enableTexNode);
  tuskenTexNode2.append(tuskenModelNode2);
  tuskenShaderNode2.append(tuskenTexNode2);
  root.append(tuskenTranNode2);

  sphereTranNode.append(sphereMatNode);
  sphereMatNode.append(sphereTexNode);
  sphereTexNode.append(enableTexNode);
  sphereTexNode.append(sphereModelNode);
  root.append(sphereTranNode);

  rectShaderNode.append(rectTranNode);
  rectTranNode.append(rectMatNode);
  rectMatNode.append(rectTexNode);
  rectTexNode.append(rectModelNode);
  rectTexNode.append(enableTexNode);
  root.append(rectShaderNode);

  lightNode.append(lightMatNode);   // TODO applying a texture to lightnode changes it's position...why? - try without lightTex/enableTex nodes
  lightMatNode.append(lightTexNode);
  lightTexNode.append(enableTexNode);
  lightTexNode.append(sphereModelNode);
  root.append(lightNode);

  light2Node.append(light2ModelNode);   // TODO how to skin a light node? even second light source to illuminate first does not make texture on first visible
  root.append(light2Node);

  return root;
}

/**
  * returns a (manually composed) sandcrawler body
  */
function makeSandcrawlerBody() {
  // TODO texture coodinates and... actually find a texture to use!
  // TODO spotlights..?
  // TODO put crawlers as own scenegraph node(...composed model) and use an extern model for that

  // returns
  var vertices = [];
  var normal = [];
  var texture = [];
  var index = [];

  // every plane of the model has it's one vertices because for hard edges we want multiple normal vectors for a vertex!
  // back part of body is just a quad
  vertices.push(
    // side face
    0,0,0,  //0
    0,.75,0,  //1
    1,0,0,  //2
    1,.75,0,  //3
    // top face
    0,.75,0,  //4
    1,.75,0,  //5
    0,.75,.5, //6
    1,.75,.5, //7
    // other side face
    0,.75,.5, //8
    1,.75,.5, //9
    0,0,.5, //10
    1,0,.5, //11
    // backface
    0,0,0, //12
    0,.75,0, //13
    0,0,.5, //14
    0,.75,.5 //15
  );

  // front part of body ... trapezes
  vertices.push(
    // side face
    1,0,0, //16
    1,.75,0, //17
    1.6,.5,.1, //18
    1.6,.75,.1, //19
    // top face
    1,.75,0, //20
    1,.75,.5, //21
    1.6,.75,.1, //22
    1.6,.75,.4,   //23
    // other side face
    1,0,.5, //24
    1,.75,.5, //25
    1.6,.5,.4,  //26
    1.6,.75,.4, //27
    // top front face
    1.6,.5,.1, //28
    1.6,.75,.1, //29
    1.6,.5,.4, //30
    1.6,.75,.4, //31
    // bottom front face
    1,0,0, //32
    1.6,.5,.1, //33
    1,0,.5, //34
    1.6,.5,.4 //35
  )

  // now triangles
  index.push(
    // side face
    0,1,3,
    0,2,3,
    // top face
    4,6,7,
    7,5,4,
    // other side face
    8,9,10,
    10,11,9,
    // backface
    12,13,15,
    15,14,12
  );

  // now triangles again
  index.push(
    // side face
    16,17,19,
    19,18,16,
    // top face
    20,21,23,
    23,22,20,
    // other side face
    24,25,27,
    27,26,24,
    // top front face
    28,29,31,
    31,30,28,
    // bottom front face
    32,33,35,
    35,34,32
  )

  // now build vertex - triangle datastructure to automatically compute normals
  var vertexTriangles = [];
  // back part
  vertexTriangles.push([0,1,3,  0,2,3]);
  vertexTriangles.push([0,1,3]);
  vertexTriangles.push([0,2,3]);
  vertexTriangles.push([0,1,3,  0,2,3]);

  vertexTriangles.push([4,6,7,  7,5,4]);
  vertexTriangles.push([7,5,4]);
  vertexTriangles.push([4,6,7]);
  vertexTriangles.push([4,6,7,  7,5,4]);

  vertexTriangles.push([8,9,10]);
  vertexTriangles.push([8,9,10,  10,11,9]);
  vertexTriangles.push([8,9,10,  10,11,9]);
  vertexTriangles.push([10,11,9]);

  vertexTriangles.push([12,13,15,  15,14,12]);
  vertexTriangles.push([12,13,15]);
  vertexTriangles.push([15,14,12]);
  vertexTriangles.push([12,13,15,  15,14,12]);

  vertexTriangles.push([16,17,19,  19,18,16]);
  vertexTriangles.push([16,17,19]);
  vertexTriangles.push([19,18,16]);
  vertexTriangles.push([16,17,19,  19,18,16]);

  vertexTriangles.push([20,21,23,  23,22,20]);
  vertexTriangles.push([20,21,23]);
  vertexTriangles.push([23,22,20]);
  vertexTriangles.push([20,21,23,  23,22,20]);

  vertexTriangles.push([24,25,27,  27,26,24]);
  vertexTriangles.push([24,25,27]);
  vertexTriangles.push([27,26,24]);
  vertexTriangles.push([24,25,27,  27,26,24]);

  vertexTriangles.push([28,29,31, 31,30,28]);
  vertexTriangles.push([28,29,31]);
  vertexTriangles.push([31,30,28]);
  vertexTriangles.push([28,29,31,  31,30,28]);

  vertexTriangles.push([32,33,35,  35,34,32]);
  vertexTriangles.push([32,33,35]);
  vertexTriangles.push([35,34,32]);
  vertexTriangles.push([32,33,35,  35,34,32]);

  calculateNormals(vertexTriangles, vertices, normal, false);


  // TODO right now just putting some random texture coords
  for(var i = 0; i < index.length / 3; i++) {
    texture.push(0,0, 1,0, 0,1);
  }

  return {
    position: vertices,
    normal: normal,
    texture: texture,
    index: index
  };
}


/**
  * Returns the model of a quad with given dimensions and texture coordinates for crawler texture
  * @param w: width
  * @param h: height
  * @param d: depth
  */
function makeCrawlerQuad(w, h, d) {

  // returns
  var vertices = [];
  var normal = [];
  var texture = [];
  var index = [];

  vertices.push(
    0,0,0,
    w,0,0,
    0,h,0,
    w,h,0,
    0,0,d,
    w,0,d,
    0,h,d,
    w,h,d
  )

  index.push(
    0,2,3,  3,1,0,
    0,2,6,  6,4,0,
    1,3,7,  7,5,1,
    0,4,5,  5,1,0,
    4,6,7,  7,5,4
  )

  texture.push(
    0,0, 0,.5, 1,.5,  0,0, 1,0, 1,.5,   // crawlers side view
    0,.5, 0,1, 1,1,  0,.5, 1,.5, 1,1,
    0,.5, 0,1, 1,1,  0,.5, 1,.5, 1,1,
    0,.5, 0,1, 1,1,  0,.5, 1,.5, 1,1,
    0,0, 0,.5, 1,.5,  0,0, 1,0, 1,.5    // crawlers side view
  )

  var vertexTriangles = [];
  vertexTriangles.push([0,2,3,  3,1,0,  0,2,6,  6,4,0, 0,4,5,  5,1,0]);
  vertexTriangles.push([3,1,0,  1,3,7,  7,5,1,  5,1,0]);
  vertexTriangles.push([0,2,3,  0,2,6]);
  vertexTriangles.push([0,2,3,  3,1,0,  1,3,7]);
  vertexTriangles.push([6,4,0,  0,4,5,  4,6,7,  7,5,4]);
  vertexTriangles.push([7,5,1,  0,4,5,  5,1,0,  7,5,4]);
  vertexTriangles.push([7,5,1,  0,4,5,  5,1,0,  7,5,4]);
  vertexTriangles.push([1,3,7,  7,5,1,  4,6,7,  7,5,4]);

  calculateNormals(vertexTriangles, vertices, normal, false);

  return {
    position: vertices,
    normal: normal,
    texture: texture,
    index: index
  };
}

/**
 * generates a planar terrain model generated from a given heightmap
 * @param heightmap: a greyscale image where darker == lower and lighter == higher terrain
 * @param stepX|Y: how many pixels to skip in x|y direction when parsing the heightmap (must divide heightmap width|height)
 * @param heightModifier: resulting height is [0, 1] * heightScaling
 */
function generateTerrain(heightmap, stepX, stepY, heightScaling) {
  // TODO fix stepX|Y == (1,4,?) does not work! (incorrect triangle indices most likely)

  if(heightmap.width % stepX != 0 || heightmap.height % stepY != 0) {
    return null;
  }

  // Create a Canvas element
  var canvas = document.createElement('canvas');

  // Size the canvas to the element
  canvas.width = heightmap.width;
  canvas.height = heightmap.height;

  // Draw image onto the canvas
  var ctx = canvas.getContext('2d');
  ctx.drawImage(heightmap, 0, 0);

  // Finally, get the image data
  // ('data' is an array of RGBA pixel values for each pixel) ... 1 pixel is 4 sequential values in the array
  var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // to calculate vertex normals later
  var vertexTriangles = [];
  // returns
  var vertices = [];
  var normal = [];
  var texture = [];  // TODO set texture coordinates properly?
  var index = [];


  // iterate through image data, skipping according to resolution
  var meshWidth = heightmap.width / stepX + 1;
  var vertexIndex = 0;
  var y = 0, x = 0;
  var lastLine = false;
  while(y < heightmap.height) {
    if(x >= heightmap.width) {
      y += stepY;
      x = 0;

      // to always incorporate the last line of the heightmap into our mesh
      if(y == heightmap.height && stepY != 1) {
        lastLine = true;
        y--;
      }
    } else {

      var i = y * heightmap.width * 4 + x * 4;
      var z = data[i] / 255 * heightScaling;  // deduct z-Value [0, 1] from R-value of pixel (G and B-values in data[i+1..3] are assumed to be equal in greyscale heightmap!);
      //console.log(i + ": (" + data[i] + ", " + data[i+1] + ", " + data[i+2] + ", " + data[i+3] + ")");
      //console.log(z);
      // save vertex
      vertices.push(x, -z, y);   // height of image is height (y) of terrain

      // now the harder part: building triangles:
      // from every vertex start 2 triangles: type A = {i, i+1, i+meshWidth} and type B = {i, i+width, i+meshWidth-1}   (meshWidth == vertices in a line)
      // but: no type B triangle from first vertex in line, not type A triangle from last vertex in line, no triangles from vertices in last line
      // this is because we build a plane and not something voluminous
      if(!lastLine) {
        // not in last line

        if(x > 0) {
          // not first vertex in line
          // push type B
          index.push(vertexIndex, vertexIndex + meshWidth, vertexIndex + meshWidth - 1);
          // add texture coordinates
          texture.push( 0, 0,
                        1, 0,
                        1, 1);
          // keep track of all triangles adjacent to a vertex to compute normals later
          if(!vertexTriangles[vertexIndex]) {
            vertexTriangles[vertexIndex] = [];
          }
          vertexTriangles[vertexIndex].push(vertexIndex, vertexIndex + meshWidth, vertexIndex + meshWidth - 1);
          if(!vertexTriangles[vertexIndex+meshWidth]) {
            vertexTriangles[vertexIndex+meshWidth] = [];
          }
          vertexTriangles[vertexIndex+meshWidth].push(vertexIndex, vertexIndex + meshWidth, vertexIndex + meshWidth - 1);
          if(!vertexTriangles[vertexIndex+meshWidth-1]) {
            vertexTriangles[vertexIndex+meshWidth-1] = [];
          }
          vertexTriangles[vertexIndex+meshWidth-1].push(vertexIndex, vertexIndex + meshWidth, vertexIndex + meshWidth - 1);
        }

        if(x < heightmap.width - 1) {
          // not last vertex in line
          // push type A
          index.push(vertexIndex, vertexIndex + 1, vertexIndex + meshWidth);
          // add texture coordinates
          texture.push( 0, 0,
                        0, 1,
                        1, 1);
          // keep track of all triangles adjacent to a vertex to compute normals later
          if(!vertexTriangles[vertexIndex]) {
            vertexTriangles[vertexIndex] = [];
          }
          vertexTriangles[vertexIndex].push(vertexIndex, vertexIndex + meshWidth, vertexIndex + meshWidth - 1);
          if(!vertexTriangles[vertexIndex+meshWidth]) {
            vertexTriangles[vertexIndex+meshWidth] = [];
          }
          vertexTriangles[vertexIndex+meshWidth].push(vertexIndex, vertexIndex + meshWidth, vertexIndex + meshWidth - 1);
          if(!vertexTriangles[vertexIndex+meshWidth-1]) {
            vertexTriangles[vertexIndex+meshWidth-1] = [];
          }
          vertexTriangles[vertexIndex+meshWidth-1].push(vertexIndex, vertexIndex + meshWidth, vertexIndex + meshWidth - 1);
        }
      }

      vertexIndex++;
      x += stepX;

      // to always incorporate the last column of the heightmap into our mesh
      if(x == heightmap.width && stepX != 1) {
        x--;
      }
    }
  }

  // calculate terrain normals
  calculateNormals(vertexTriangles, vertices, normal, true);

  return {
    position: vertices,
    normal: normal,
    texture: texture,
    index: index
  };
}

/**
 * calculates the normal vector of every vertex by weighting in the surface normals of all adjacent triangles!
 * @param: vertexTriangles: two-dimensional array that contains triangles in form of vertex indices in the vertices parameter such that: vertexTriangles[123] == triangles adjacent to vertices[123]
 * @param: vertices: array of vertices where 3 sequential numbers constitute a vertex
 * @param: normal: the array where normals should be pushed into
 * @param: forcePointUpwards: if true, normals with a negative y component are inverted
 */
function calculateNormals(vertexTriangles, vertices, normal, forcePointUpwards) {
  // TODO some outer vertices still have flipped normals but I don't know how to detect them (or no normals at all?)
  // TODO remove dirty fix for terrain (wouldn't work for non planar models - vertexTriangles datastructure must have triangles ordered in a constant way (clockwise/counterclockwise))
  vertexTriangles.forEach(function(adjacentTriangles) {
    var sum = vec3.create();

    for(var i = 0; i < adjacentTriangles.length; i += 3) { // a triangle consists of 3 vertices
      var p0 = vec3.fromValues(vertices[3*adjacentTriangles[i]], vertices[3*adjacentTriangles[i]+1], vertices[3*adjacentTriangles[i]+2]);
      var p1 = vec3.fromValues(vertices[3*adjacentTriangles[i+1]], vertices[3*adjacentTriangles[i+1]+1], vertices[3*adjacentTriangles[i+1]+2]);
      var p2 = vec3.fromValues(vertices[3*adjacentTriangles[i+2]], vertices[3*adjacentTriangles[i+2]+1], vertices[3*adjacentTriangles[i+2]+2]);

      // calculate surface normal of triangle as cross product of two lines of the triangle
      var surfaceNormal = vec3.cross(vec3.create(), vec3.subtract(vec3.create(), p0, p1), vec3.subtract(vec3.create(), p0, p2));
      // TODO dirty fix: if surface normal has negative y component, it's pointing the wrong direction
      if(forcePointUpwards && surfaceNormal[1] > 0) {
        vec3.inverse(surfaceNormal, surfaceNormal);
      }

      // sum up all surface normals
      // note that the magnitude of the just calculated surface normal is directly proportional to the area of it's triangle
      // thus summing up all surface normals and normalizing the sum is essentially weighting in surface normals according to the area of their triangles
      vec3.add(sum, sum, surfaceNormal);
    }

    // and normalize the sum
    vec3.normalize(sum, sum);

    // we now have the normal vector of one vertex!
    normal.push(sum[0], sum[1], sum[2]);
  });
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {
  //calculate delta time for animation
  //convert timeInMilliseconds in seconds
  var timeNow = timeInMilliseconds / 1000;
  var timeDelta = timeNow - timePrev;
  timePrev = timeNow;

  renderVolleyballScene(timeDelta);



  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //setup context and camera matrices
  const context = createSGContext(gl);

  // TODO which Field of view/other parameters?
  context.projectionMatrix = mat4.perspective(mat4.create(), 50, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 10000);

  // free moving camera: https://sidvind.com/wiki/Yaw,_pitch,_roll_camera
  // gl-matrix doc: http://glmatrix.net/docs/mat4.html
  let center = [camera.position.x + Math.cos(camera.rotation.x) * Math.sin(camera.rotation.y), camera.position.y + Math.cos(camera.rotation.y), camera.position.z + Math.sin(camera.rotation.y) * Math.sin(camera.rotation.x)];
  // camera orientation
  let up = [0, 1, 0];
  // generate view matrix from position, center and up
  let lookAtMatrix = mat4.lookAt(mat4.create(), [camera.position.x, camera.position.y, camera.position.z], center, up);
  context.viewMatrix = lookAtMatrix;

  // extract normalized direction vector generated by lookAt - used to move in pointed direction
  camera.direction.x = lookAtMatrix[2];
  camera.direction.y = lookAtMatrix[6];
  camera.direction.z = lookAtMatrix[10];

  //console.log("rotationx: " + camera.rotation.x.toFixed(2) + "  |  rotationy: " + camera.rotation.y.toFixed(2) + "  |  x:" + camera.position.x.toFixed(2) + " y:" + camera.position.y.toFixed(2) + " z:" + camera.position.z.toFixed(2) + "  |  dirx:" + camera.direction.x.toFixed(2) + " diry:" + camera.direction.y.toFixed(2) + " dirz:" + camera.direction.z.toFixed(2));

  renderBillboard(context);

  //render scenegraph
  root.render(context);

  //request another call as soon as possible
  requestAnimationFrame(render);
}

function renderVolleyballScene(timeDelta){
  //translate volleyball between two tusken
  if(volleyballLocation <= 0){
    volleyballDirection = 1.0;
  } else if(volleyballLocation >= 100){
    volleyballDirection = -1.0;
  }
  volleyballSpeed = 60.0 * timeDelta * volleyballDirection;
  var y = -Math.sin(Math.PI/100 * volleyballLocation) * 100;
  volleyballTranNode.matrix = glm.translate(volleyballCoordinates[0] + volleyballLocation, volleyballCoordinates[1] + y, volleyballCoordinates[2] + 20);
  volleyballLocation += volleyballSpeed;
}

function renderBillboard(context){
  //billboard
  //https://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/
  var billTransformation =
  [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
  ];
  billTransformation[0] = context.viewMatrix[0];
  billTransformation[1] = context.viewMatrix[4];
  billTransformation[2] = context.viewMatrix[8];
  billTransformation[4] = context.viewMatrix[1];
  billTransformation[5] = context.viewMatrix[5];
  billTransformation[6] = context.viewMatrix[9];
  billTransformation[8] = context.viewMatrix[2];
  billTransformation[9] = context.viewMatrix[6];
  billTransformation[10] = context.viewMatrix[10];
  billTransformation[12] = billTranNode.matrix[12];
  billTransformation[13] = billTranNode.matrix[13];
  billTransformation[14] = billTranNode.matrix[14];
  billTranNode.matrix = billTransformation;
}

//load the shader resources using a utility function
loadResources({
  // TODO shaders - copied from lab
  vs: 'shader/shadow.vs.glsl',
  fs: 'shader/shadow.fs.glsl',

  // test different shader
  whiteVs : 'shader/white.vs.glsl',
  whiteFs : 'shader/white.fs.glsl',

  // terrain
  heightmap: 'assets/terrain/heightmap.png',
  tex: 'assets/lava.jpg',
  sunTex: 'assets/sun.jpg',
  sandTex: 'assets/sand.jpg',

  // models
  leia: 'assets/models/leia/Leia/Leia.obj',
  tusken: 'assets/models/leia/Leia/Leia.obj',
  leiaTex: 'assets/models/leia/Leia/Leia Textures/Leia_Diff.png',
  rustyMetalTex: 'assets/rusty_metal.jpg',
  crawlersTex: 'assets/crawlers.jpg'

}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render(0);
});

//camera control
function initInteraction(canvas) {
  const mouse = {
    pos: { x : 0, y : 0},
    leftButtonDown: false
  };
  function toPos(event) {
    //convert to local coordinates
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  canvas.addEventListener('mousedown', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
  });
  canvas.addEventListener('mousemove', function(event) {
    const pos = toPos(event);
    const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
    if (mouse.leftButtonDown) {
      //add the relative movement of the mouse to the rotation variables
  		camera.rotation.x -= delta.x / 1000;
  		camera.rotation.y -= delta.y / 1000;
    }
    mouse.pos = pos;
  });
  canvas.addEventListener('mouseup', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = false;
  });
  //register globally
  document.addEventListener('keypress', function(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    if (event.code === 'KeyR') {
      camera.rotation.x = 0;
  		camera.rotation.y = 0;
    }
  });

  // forward/backward movement
  // TODO not sure if working correctly (passing through some axis)
  document.addEventListener('keydown', function(event) {
    if(event.code === 'ArrowUp') {
      camera.position.x -= camera.direction.x * camera.speed;
      camera.position.y -= camera.direction.y * camera.speed;
      camera.position.z -= camera.direction.z * camera.speed;

    } else if(event.code === 'ArrowDown') {
      camera.position.x += camera.direction.x * camera.speed;
      camera.position.y += camera.direction.y * camera.speed;
      camera.position.z += camera.direction.z * camera.speed;
    }
  })
}
