var game = {
  _DEBUG_: true,
  option: {
    cellSize: 1,
    time: 1 * 60 * 1000,
    width: 15,
    height: 15
  },
  engine: null,
  direction: {
    now: {},
    flag: {}
  },
  world: {

  },
  directionListener: function () {
    window.addEventListener('deviceorientation', function (e) {
      game.direction.now = {
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma
      };
    }, false);
  },
  deviceOrientationHandler: function () {
    // 根据基本坐标和当前偏移量计算运动方向
    var flag = game.direction.flag;
    var now = game.direction.now;
    var direction = {
      alpha: now.alpha - flag.alpha,
      beta: now.beta - flag.beta,
      gamma: now.gamma - flag.gamma
    };
    return direction;
  },
  getDirection: function () {
    // TODO: 获取当前偏移方向
    game.direction.flag = JSON.parse(JSON.stringify(game.direction.now));
  },
  getFlagDirection: function () {
    this.direction.flag = {
      alpha: this.direction.now.alpha,
      beta: this.direction.now.beta,
      gamma: this.direction.now.gamma
    };
  },
  randomWorld: function () {

  },
  init: function () {
    if (game._DEBUG_) {
      openDebug();
    }
    game.randomWorld();
    if (window.DeviceOrientationEvent) {
      // 重力感应
      game.directionListener();
    }
    game.engine = makeScene();
  },
  stopRender: function () {
    this.engine.stopRenderLoop();
  },
  finished: function () {
    this.stopRender();
    var times = new Date() - game.timer.flag;
    var msg = conform('恭喜你完成了迷宫挑战，用时：'+ times / 1000 +'s,是否再来一局？');
    if(msg){
      game.init();
    }
  },
  timer: {
    lastTime: 0,
    flag: null,
    clock: null,
    start: function () {
      var timer = game.timer;
      timer.lastTime = game.option.time;
      timer.flag = new Date();
      timer.clock = setInterval(function () {
        game.timer.lastTime -= 100;
        // console.log(game.timer.lastTime);
        if (game.timer.lastTime <= 0) {
          game.timer.timeout();
        }
      }, 100);
    },
    timeout: function () {
      var clock = game.timer.clock;
      clearInterval(clock);
      game.stopRender();
      var times = new Date() - game.timer.flag;
      var msg = conform('很遗憾你没能完成迷宫挑战，用时：'+ times / 1000 +'s,是否再来一局？');
      if(msg){
        game.init();
      }
    }
  }
};

var maze = new Maze({
  width: game.option.width,
  height: game.option.height,

  perfect: true,
  braid: false,
  checkOver: false,

  trace: true,
  traceInfo: null,

  onInit: function () {
    this.checkOver = false;
    this.checkCount = {};
    this.traceInfo = {};
    this.foundEndNode = false;
    game.timer.start();
  },

  getNeighbor: function () {
    // if (this.currentDirCount < 6 && this.neighbors[this.currentDir]) {
    //     return this.neighbors[this.currentDir];
    // }
    var list = this.neighbors.list;
    var n = list[list.length * Math.random() >> 0];
    return n;
  },

  isValid: function (nearNode, node, dir) {
    if (!nearNode || nearNode.value === null) {
      return false;
    }
    if (nearNode.value === 0) {
      return true;
    }
    if (this.perfect || this.braid) {
      return false;
    }
    var c = nearNode.x,
      r = nearNode.y;
    // 用于生成一种非Perfect迷宫
    this.checkCount[c + '-' + r] = this.checkCount[c + '-' + r] || 0;
    var count = ++this.checkCount[c + '-' + r];
    return Math.random() < 0.3 && count < 3;
  },

  beforeBacktrace: function () {
    // if (!this.braid || Math.random() < 0.5) {
    if (!this.braid) {
      return;
    }
    var n = [];
    var node = this.currentNode;
    var c = node.x;
    var r = node.y;
    var nearNode, dir, op;

    var first = null;
    var currentDir = this.currentDir;
    var updateNear = function () {
      op = Maze.Direction.opposite[dir];
      if (nearNode && nearNode.value !== null && (nearNode.value & op) !== op) {
        n.push([nearNode, dir]);
        if (dir == currentDir) {
          first = [nearNode, dir];
        }
      }
    };

    dir = Maze.Direction.N;
    nearNode = r > 0 ? this.grid[r - 1][c] : null;
    updateNear();

    if (!first) {
      dir = Maze.Direction.E;
      nearNode = this.grid[r][c + 1];
      updateNear();
    }

    if (!first) {
      dir = Maze.Direction.S;
      nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
      updateNear();
    }

    if (!first) {
      dir = Maze.Direction.W;
      nearNode = this.grid[r][c - 1];
      updateNear();
    }

    n = first || n[n.length * Math.random() >> 0];
    this.moveTo(n[0], n[1]);
  },

  updateCurrent: function () {
    console.info(this.currentNode);
    if (this.trace) {
      this.traceInfo[this.currentNode.x + '-' + this.currentNode.y] = this.stepCount;
    }
    if (this.braid) {
      return;
    }
    // 每步有 10% 的概率 进行回溯
    if (Math.random() <= 0.10) {
      this.backtrace();
    }
  },

  getTraceIndex: function () {
    var len = this.trace.length;

    if (this.braid) {
      return len - 1;
    }

    // 按一定的概率随机选择回溯策略
    var r = Math.random();
    var idx = 0;
    if (r < 0.5) {
      idx = len - 1;
    } else if (r < 0.7) {
      idx = len >> 1;
    } else if (r < 0.8) {
      idx = len * Math.random() >> 0;
    }
    return idx;
  },

  afterGenrate: function () {
    if (this.braid && this.getRoadCount(this.startNode) < 2) {
      this.currentDirCount = 1000;
      this.setCurrent(this.startNode);
      this.nextStep();
    }
  },

  isOver: function () {
    if (!this.checkOver) {
      return false;
    }
    if (this.currentNode == this.endNode) {
      this.foundEndNode = true;
    }
    // 当探索到迷宫终点, 且探索了至少一半的区域时,终止迷宫的生成
    if (this.foundEndNode && this.stepCount >= this.size / 2) {
      return true;
    }
    return false;
  }
});

function createMaze(canvas, perfect, braid, pathCollector) {
  maze.perfect = perfect || false;
  maze.braid = braid || false;

  maze.init();

  maze.setStart(0, 0);
  maze.setEnd(maze.width - 1, maze.height - 1);

  // maze.setBlock(15, 15, 6, 5);
  // maze.setRoom(5, 5, 6, 5);
  maze.generate();

  renderMaze(canvas, maze, pathCollector);
}

function $id(id) {
  return document.getElementById(id);
}


// 渲染迷宫
function renderMaze(canvas, maze, pathCollector) {
  // var grid = JSON.parse(JSON.stringify(maze.grid));
  var grid = maze.grid;
  var canvasWidth = 600,
    canvasHeight = 600;
  var padding = 10;
  var wallWidth = 6;

  var cellSize = (canvasWidth - padding * 2) / maze.width;
  cellSize = Math.min(cellSize, (canvasHeight - padding * 2) / maze.height) >> 0;
  var x = padding,
    y = padding;

  var cellW = cellSize;
  var cellH = cellSize;

  var context;

  var renderToCanvas;
  // 搜集路径时不渲染到canvas
  if (typeof pathCollector == 'function') {
    renderToCanvas = false;
    context = {
      fillRect: function (x, y, w, h) {
        pathCollector(x, y, w, h);
      },
      fillText: function () {}
    };
    cellW = cellH = cellSize = game.option.cellSize;
    wallWidth = cellSize / 8;
    x = y = 0;
  } else {
    renderToCanvas = true;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context = canvas.getContext('2d');

    context.fillStyle = '#eeeeee';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#334466';
    context.strokeStyle = '#334466';
    context.font = '12px Arial';
    context.lineWidth = wallWidth;
  }

  var traceColors = ['#990000', '#009900', '#000099', '#999900', '#990099', '#009999'],
    traceFillBlankColor = '#999999',
    traceColorIdx = 0;


  var cellY = y;
  var mazeHeight = 0;
  for (var r = 0; r < grid.length; r++) {
    var row = grid[r];

    // cellH=cellSize-5+(Math.random()*20>>0);
    cellH = cellSize;

    for (var c = 0; c < row.length; c++) {
      var node = row[c];
      var cx = c * cellW + x;
      var cy = cellY;
      if (!node.value) {
        // ?
        context.fillRect(cx, cy, cellW, cellH);
        continue;
      }

      var nodeType = null;
      if (node == maze.startNode) {
        nodeType = 'S';
        if (renderToCanvas) {
          context.fillStyle = '#f3bbaa';
          context.fillRect(cx, cy, cellW, cellH);
          context.fillStyle = '#334466';
          context.fillText(nodeType, cx + cellW * 1 / 3, cy + cellH - 2);
        }
      } else if (node == maze.endNode) {
        nodeType = 'E';
        if (renderToCanvas) {
          context.fillStyle = '#f3bbaa';
          context.fillRect(cx, cy, cellW, cellH);
          context.fillStyle = '#334466';
          context.fillText(nodeType, cx + cellW * 1 / 3, cy + cellH - 2);
        }
      } else {
        if (renderToCanvas) {
          if (maze.trace) {
            var text = maze.traceInfo[node.x + '-' + node.y];
            context.fillText(text, cx + cellW * 1 / 3, cy + cellH - 2);
          }
          if (maze.trace) {
            context.fillStyle = traceColors[(traceColorIdx++) % traceColors.length];
          }
        }
      }

      var left = (node.value & Maze.Direction.W) !== Maze.Direction.W;
      var top = (node.value & Maze.Direction.N) !== Maze.Direction.N;
      if (left && top) {
        context.fillRect(cx, cy, wallWidth, cellH);
        context.fillRect(cx, cy, cellW, wallWidth);
      } else if (left) {
        context.fillRect(cx, cy, wallWidth, cellH);
      } else if (top) {
        context.fillRect(cx, cy, cellW, wallWidth);
      } else {
        var w = false;
        if (r > 0) {
          w = (grid[r - 1][c].value & Maze.Direction.W) !== Maze.Direction.W;
        }
        if (w && c > 0) {
          w = (grid[r][c - 1].value & Maze.Direction.N) !== Maze.Direction.N;
        }
        var ltc = w ? 1 : 0;
        if (ltc) {
          // 填充左&上单元格填充边界后留下的空缺方块
          if (maze.trace) {
            context.fillStyle = traceFillBlankColor;
          }
          context.fillRect(cx, cy, wallWidth, wallWidth);
        }
      }
    }
    cellY += cellH;
    mazeHeight += cellH;
  }

  context.fillRect(x, mazeHeight + y, cellW * maze.width, wallWidth);
  context.fillRect(cellW * maze.width + x, y, wallWidth, mazeHeight + wallWidth);
}

// render
function makeScene() {
  // 构建迷宫外墙shapes
  var walls = [],
    wallFactor = 1;
  var wallPathCollector = function (x, y, w, h) {
    x *= wallFactor;
    y *= wallFactor;
    w *= wallFactor;
    h *= wallFactor;
    y *= -1;
    h *= -1;
    var wallFacePath = [
      new BABYLON.Vector3(x, 0, y),
      new BABYLON.Vector3(x + w, 0, y),
      new BABYLON.Vector3(x + w, 0, y + h),
      new BABYLON.Vector3(x, 0, y + h)
    ];
    wallFacePath.push(wallFacePath[0]);
    walls.push(wallFacePath);
  };
  createMaze(document.getElementById('renderCanvas'), true, false, wallPathCollector);
  console.info(walls);


  // get the canvas DOM element
  var canvas = document.getElementById('renderCanvas');
  // load the 3D engine
  var engine = new BABYLON.Engine(canvas, true);

  // createScene function that creates and return the scene
  var createScene = function () {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
    //      scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.OimoJSPlugin());

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    var camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 0, new BABYLON.Vector3(5, 9, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.setPosition(new BABYLON.Vector3(10, 15, -15));
    camera.attachControl(canvas, true);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    light1.diffuse = new BABYLON.Color3(1, 1, 1);
    light1.specular = new BABYLON.Color3(0.2, 0.2, 0.2);
    light1.groundColor = new BABYLON.Color3(0, 0, 0);
    // var light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(-100, 50, 100), scene);
    // var light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(100, 50, -100), scene);

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    var ground = BABYLON.Mesh.CreateGround('ground', 30, 30, 2, scene);
    ground.material = new BABYLON.StandardMaterial('TextPlaneMaterial', scene);
    ground.material.backFaceCulling = false;
    ground.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.PlaneImpostor, move: false, restitution: 0, mass: 0, friction: 0.5 });

    //      ground.material.specularColor = new BABYLON.Color3(0, 0, 0);
    //      var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
    //      dynamicTexture.hasAlpha = true;
    //      dynamicTexture.drawText("X", 5, 40, "bold 36px Arial", "red" , "transparent", true);
    //      ground.material.diffuseTexture = dynamicTexture;


    // show axis
    var showAxis = function (size) {
      var makeTextPlane = function (text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture('DynamicTexture', 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true);
        var plane = BABYLON.Mesh.CreatePlane('TextPlane', size, scene, true);
        plane.material = new BABYLON.StandardMaterial('TextPlaneMaterial', scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
      };

      var axisX = BABYLON.Mesh.CreateLines('axisX', [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ], scene);
      axisX.color = new BABYLON.Color3(1, 0, 0);
      var xChar = makeTextPlane('X', 'red', size / 10);
      xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
      var axisY = BABYLON.Mesh.CreateLines('axisY', [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
      ], scene);
      axisY.color = new BABYLON.Color3(0, 1, 0);
      var yChar = makeTextPlane('Y', 'green', size / 10);
      yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
      var axisZ = BABYLON.Mesh.CreateLines('axisZ', [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
      ], scene);
      axisZ.color = new BABYLON.Color3(0, 0, 1);
      var zChar = makeTextPlane('Z', 'blue', size / 10);
      zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    };


    // material
    // var mat = new BABYLON.StandardMaterial("mat1", scene);
    // mat.alpha = 1.0;
    // mat.diffuseColor = new BABYLON.Color3(1, 0.7, 0.7);
    // mat.backFaceCulling = false;
    // mat.wireframe = true;
    // // shape
    // var shape = [
    //   new BABYLON.Vector3(1, 0, 0),
    //   new BABYLON.Vector3(0.2, 0.3, 0),
    //   new BABYLON.Vector3(0, 1, 0),
    //   new BABYLON.Vector3(-0.2, 0.3, 0),
    //   new BABYLON.Vector3(-1, 0, 0),
    //   new BABYLON.Vector3(-0.2, -0.3, 0),
    //   new BABYLON.Vector3(0, -1, 0),
    //   new BABYLON.Vector3(0.2, -0.3, 0)
    // ];
    // shape.push(shape[0]);

    // var shapeline = BABYLON.Mesh.CreateLines("sl", shape, scene);
    // shapeline.color = BABYLON.Color3.Green();

    // var path = [
    //   new BABYLON.Vector3(0, 0, 0),
    //   new BABYLON.Vector3(0, 8, 0)
    // ];
    // var extruded = BABYLON.Mesh.ExtrudeShape("extruded", shape, path, 1, 0, 0, scene);
    // extruded.material = mat;
    // extruded.position = new BABYLON.Vector3(5, 0, 2);

    // 渲染迷宫
    if (walls.length) {
      var hSpriteNb = 1; // 6 sprites per raw
      var vSpriteNb = 1; // 4 sprite raws
      var faceUV = new Array(6);
      for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(i / hSpriteNb, i / vSpriteNb, (i + 1) / hSpriteNb, (i + 1) / vSpriteNb);
      }

      var wallHeight = 0.6;
      var createBoxOptions = function (w) {
        return {
          width: Math.abs(w[1].x - w[0].x),
          height: wallHeight,
          depth: Math.abs(w[3].z - w[0].z)
        };
      };
      // 墙体样式
      // var wallMat = new BABYLON.StandardMaterial("mat_wall", scene);
      // wallMat.diffuseColor = new BABYLON.Color3(0.5, 0.8, 0.6);
      var materialWall = new BABYLON.StandardMaterial('wood', scene);
      materialWall.diffuseTexture = new BABYLON.Texture('img/wood.jpg', scene); // wood.jpg
      var mazeShiftX = game.option.width / 2,
        mazeShiftZ = game.option.width / 2;
      for (var i = 0; i < walls.length; ++i) {
        var w = walls[i];

        // var shapeline = BABYLON.Mesh.CreateLines("wall_shape_" + i, w, scene);
        // shapeline.color = BABYLON.Color3.Green();

        var options = createBoxOptions(w);
        var box = BABYLON.MeshBuilder.CreateBox('wall_box_' + i, options, scene);
        box.position = new BABYLON.Vector3(
          w[0].x + (w[1].x - w[0].x) / 2 - mazeShiftX,
          wallHeight / 2,
          w[0].z + (w[3].z - w[0].z) / 2 + mazeShiftZ
        );
        // 设置墙体样式
        box.material = materialWall;
        box.checkCollisions = true;
        box.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move: false, restitution: 0, mass: 0, friction: 0 });

        //          var p = [
        //            new BABYLON.Vector3(1, 1, 1),
        //            new BABYLON.Vector3(1, 1.2, 1)
        //          ];
        //          BABYLON.MeshBuilder.ExtrudeShape("extruded_" + i, {shape: w, path: p}, scene);
      }


      var cellSize = game.option.cellSize;

      // 球
      var ballRadius = 0.5;
      var ball = BABYLON.Mesh.CreateSphere('ball', 16, ballRadius, scene);
      ball.position.y = ballRadius / 2 + 0.2;
      ball.position.x = (walls[0][0].x + cellSize) / 2 + (cellSize / 8) - mazeShiftX;
      ball.position.z = (walls[0][0].z - cellSize) / 2 - (cellSize / 8) + mazeShiftZ;
      // 材质
      var materialBall = new BABYLON.StandardMaterial('ball', scene);
      materialBall.diffuseTexture = new BABYLON.Texture('img/metal9.jpg', scene); // wood.jpg
      ball.material = materialBall;
      ball.material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      ball.checkCollisions = true;
      ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, move: true, restitution: 0.1, mass: 3, friction: 0.1 });
      // 相机
      // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
      var cameraAll = new BABYLON.ArcRotateCamera('cameraAll', 0, 0, 0, new BABYLON.Vector3(0, 5, 0), scene);
      cameraAll.setTarget(BABYLON.Vector3.Zero());
      cameraAll.setPosition(new BABYLON.Vector3(0, 25, -0.5));
      cameraAll.attachControl(canvas, true);
      // 跟随相机
      var cameraFollow = game.cameraFollow = new BABYLON.FollowCamera('cameraFollow', new BABYLON.Vector3(10, 10, -20), scene);
      cameraFollow.lockedTarget = ball;
      cameraFollow.radius = 0; // how far from the object to follow
      cameraFollow.heightOffset = 3; // how high above the object to place the camera
      cameraFollow.rotationOffset = 180; // the viewing angle
      cameraFollow.cameraAcceleration = 0.005; // how fast to move
      cameraFollow.maxCameraSpeed = 20; // speed limit
      // 摇杆相机
      var cameraSticks = game.sticksCamera = new BABYLON.VirtualJoysticksCamera('cameraSticks', new BABYLON.Vector3(-10, 1, 10), scene);
      cameraSticks.lockedTarget = ball;

      // 激活相机
      scene.activeCamera = cameraAll;
      // 开启多个相机
      // scene.activeCameras.push(cameraAll);
      // scene.activeCameras.push(cameraFollow);
      // 终点
      var diamondBorderSize = 0.3,
        diamondOptions = { width: diamondBorderSize, height: diamondBorderSize, depth: diamondBorderSize };
      var diamond = scene.diamond = BABYLON.MeshBuilder.CreateBox('diamond', diamondOptions, scene);
      scene.finishflagX = (walls[0][0].x - cellSize) / 2 + (cellSize / 8) - mazeShiftX + maze.width * cellSize;
      diamond.position = new BABYLON.Vector3(
        scene.finishflagX,
        diamondBorderSize * Math.sqrt(2) / 2.0,
        (walls[0][0].z + cellSize) / 2 - (cellSize / 8) + mazeShiftZ - maze.height * cellSize
      );
      diamond.material = new BABYLON.StandardMaterial('diamond_mat', scene);
      diamond.material.diffuseColor = new BABYLON.Color3(0.5, 0.75, 1);
      diamond.rotation.x = Math.PI / 4;
      diamond.rotation.z = Math.PI / 4;
      diamond.checkCollisions = true;
      diamond.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, move: true, restitution: 0, mass: 1, friction: 0 });
      scene.actionManager = new BABYLON.ActionManager(scene);

      // 旋转diamond
      // var r = 0;
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnEveryFrameTrigger,
          function () {
            // diamond.rotation.y = Math.PI / 180 * (r++);
            // if (r == 360)
            //   r = 0;
            diamond.rotation.x = Math.PI / 80;
            diamond.rotation.z = Math.PI / 80;
            diamond.refreshBoundingInfo();
          }
        ));
      // 按键移动事件
      var D_U = 8, // 方向定义，上右下左8421
        D_R = 4,
        D_D = 2,
        D_L = 1,
        D_MASK = 15,
        M_S = 0.25, // 移动速度
        KEY_VALUES = {
          'w': D_U,
          'd': D_R,
          's': D_D,
          'a': D_L
        },
        direction = 0;
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnKeyDownTrigger,
          function (e) {
            var key = (e.sourceEvent.key || '').toLowerCase(),
              keyValue = KEY_VALUES[key];
            if (keyValue)
              direction |= keyValue;
          }));
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnKeyUpTrigger,
          function (e) {
            var key = (e.sourceEvent.key || '').toLowerCase(),
              keyValue = KEY_VALUES[key];
            if (keyValue)
              direction &= D_MASK ^ keyValue;
          }));
      // 逐桢施加作用力
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnEveryFrameTrigger,
          function () {

            // 获取偏移方向
            var now = game.direction.now;
            var gammaD = now.gamma > 0 ? D_R : D_L;
            var betaD = now.beta > 0 ? D_D : D_U;

            // 动量
            M_S = 0.25 * (Math.abs(now.gamma) / 2 + Math.abs(now.beta) / 4);
            // console.info(gamma, beta, M_S);
            var x = 0,
              z = 0;
            if (direction & D_R || gammaD & D_R)
              x = M_S;
            else if (direction & D_L || gammaD & D_L)
              x = -M_S;
            if (direction & D_U || betaD & D_U)
              z = M_S;
            else if (direction & D_D || betaD & D_D)
              z = -M_S;
            var moveDirection = new BABYLON.Vector3(x, 0, z);
            ball.applyImpulse(moveDirection, ball.position);
            //ball.moveWithCollisions();
          }
        ));

    }
    // 显示坐标轴
    // showAxis(15);

    // return the created scene
    return scene;
  };

  // call the createScene function
  var scene = createScene();
  // 碰撞侦听
  function checkFinish() {
    if (scene.finishflagX != scene.diamond.position.x) {
      game.finished();
    }
  }
  // run the render loop
  engine.runRenderLoop(function () {
    scene.render();
    checkFinish();
  });

  // the canvas/window resize event handler
  window.addEventListener('resize', function () {
    engine.resize();
  });
  document.getElementById('renderCanvas');
  return engine;
}