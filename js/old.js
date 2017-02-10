

  // var blocks = []
// var maze = new Maze({
//   width: 15,
//   height: 15,

//   perfect: true,
//   braid: false,
//   checkOver: false,

//   onInit: function () {
//     // 是否提前终止
//     this.checkOver = false;
//     this.checkCount = {};
//     // this.traceInfo = {};
//     this.foundEndNode = false;
//   },

//   getNeighbor: function () {
//     // if (this.currentDirCount < 6 && this.neighbors[this.currentDir]) {
//     //     return this.neighbors[this.currentDir];
//     // }
//     var list = this.neighbors.list;
//     var n = list[list.length * Math.random() >> 0];
//     return n;
//   },

//   isValid: function (nearNode, node, dir) {
//     if (!nearNode || nearNode.value === null) {
//       return false;
//     }
//     if (nearNode.value === 0) {
//       return true;
//     }
//     if (this.perfect || this.braid) {
//       return false;
//     }
//     var c = nearNode.x,
//       r = nearNode.y;
//     // 用于生成一种非Perfect迷宫
//     this.checkCount[c + "-" + r] = this.checkCount[c + "-" + r] || 0;
//     var count = ++this.checkCount[c + "-" + r];
//     return Math.random() < 0.3 && count < 3;
//   },

//   beforeBacktrace: function () {
//     // if (!this.braid || Math.random() < 0.5) {
//     if (!this.braid) {
//       return;
//     }
//     var n = [];
//     var node = this.currentNode;
//     var c = node.x;
//     var r = node.y;
//     var nearNode, dir, op;

//     var first = null;
//     var currentDir = this.currentDir;
//     var updateNear = function () {
//       op = Maze.Direction.opposite[dir];
//       if (nearNode && nearNode.value !== null && (nearNode.value & op) !== op) {
//         n.push([nearNode, dir]);
//         if (dir == currentDir) {
//           first = [nearNode, dir];
//         }
//       }
//     };

//     dir = Maze.Direction.N;
//     nearNode = r > 0 ? this.grid[r - 1][c] : null;
//     updateNear();

//     if (!first) {
//       dir = Maze.Direction.E;
//       nearNode = this.grid[r][c + 1];
//       updateNear();
//     }

//     if (!first) {
//       dir = Maze.Direction.S;
//       nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
//       updateNear();
//     }

//     if (!first) {
//       dir = Maze.Direction.W;
//       nearNode = this.grid[r][c - 1];
//       updateNear();
//     }

//     n = first || n[n.length * Math.random() >> 0];
//     this.moveTo(n[0], n[1]);
//   },

//   updateCurrent: function () {
//     // this.traceInfo[this.currentNode.x + "-" + this.currentNode.y] = this.stepCount;
//     if (this.braid) {
//       return;
//     }
//     // 每步有 10% 的概率 进行回溯
//     if (Math.random() <= 0.10) {
//       this.backtrace();
//     }
//   },

//   getTraceIndex: function () {
//     var len = this.trace.length;

//     if (this.braid) {
//       return len - 1;
//     }

//     // 按一定的概率随机选择回溯策略
//     var r = Math.random();
//     var idx = 0;
//     if (r < 0.5) {
//       idx = len - 1;
//     } else if (r < 0.7) {
//       idx = len >> 1;
//     } else if (r < 0.8) {
//       idx = len * Math.random() >> 0;
//     }
//     return idx;
//   },

//   afterGenrate: function () {
//     if (this.braid && this.getRoadCount(this.startNode) < 2) {
//       this.currentDirCount = 1000;
//       this.setCurrent(this.startNode);
//       this.nextStep();
//     }
//   },

//   isOver: function () {
//     if (!this.checkOver) {
//       return false;
//     }
//     if (this.currentNode == this.endNode) {
//       this.foundEndNode = true;
//     }
//     // 当探索到迷宫终点, 且探索了至少一半的区域时,终止迷宫的生成
//     if (this.foundEndNode && this.stepCount >= this.size / 2) {
//       return true;
//     }
//     return false;
//   }
// });



// window.onload = function () {
//   start();
// }

// function createPerfectMaze() {
//   createMaze(true, false);
// }

// function createBraidMaze() {
//   createMaze(false, true);
// }

// function createMaze(perfect, braid) {
//   maze.perfect = perfect || false;
//   maze.braid = braid || false;

//   maze.init();

//   // maze.setStart(0, 0);
//   // maze.setEnd(4, 4);

//   maze.startNode = maze.getRandomNode();
//   do {
//     maze.endNode = maze.getRandomNode();
//   } while (maze.startNode == maze.endNode);

//   // maze.setBlock(15, 15, 6, 5);
//   // maze.setRoom(5, 5, 6, 5);
//   maze.generate();


//   renderMaze(context, maze);
//   // 简单封装3d
//   render();
// }

// function $id(id) {
//   return document.getElementById(id);
// }

// var canvas, context;

// function start() {
//   canvas = $id("canvas");
//   context = canvas.getContext("2d");
//   createPerfectMaze();
// }

// function renderMaze(context, maze) {

//   // var grid = JSON.parse(JSON.stringify(maze.grid));
//   var grid = maze.grid;
//   var canvasWidth = 800,
//     canvasHeight = 800;
//   var padding = 25;
//   var wallWidth = 20;

//   var cellSize = (canvasWidth - padding * 2) / maze.width;
//   cellSize = Math.min(cellSize, (canvasHeight - padding * 2) / maze.height) >> 0;
//   var x = padding,
//     y = padding;

//   var cellW = cellSize;
//   var cellH = cellSize;

//   canvas.width = canvasWidth;
//   canvas.height = canvasHeight;

//   context.fillStyle = "#eeeeee";
//   context.fillRect(0, 0, canvas.width, canvas.height);
//   context.fillStyle = "#334466";
//   context.strokeStyle = "#334466";
//   context.font = "12px Arial";
//   context.lineWidth = wallWidth;

//   var cellY = y;
//   var mazeHeight = 0;
//   for (var r = 0; r < grid.length; r++) {
//     var row = grid[r];

//     // cellH=cellSize-5+(Math.random()*20>>0);
//     cellH = cellSize;

//     for (var c = 0; c < row.length; c++) {
//       var node = row[c];
//       var cx = c * cellW + x;
//       var cy = cellY;
//       if (!node.value) {
//         context.fillRect(cx, cy, cellW, cellH);
//         continue;
//       }

//       if (node == maze.startNode) {
//         context.fillStyle = "#f3bbaa";
//         context.fillRect(cx, cy, cellW, cellH);
//         context.fillStyle = "#334466";
//         context.fillText("S", cx + cellW * 1 / 3, cy + cellH - 2);
//       } else if (node == maze.endNode) {
//         context.fillStyle = "#f3bbaa";
//         context.fillRect(cx, cy, cellW, cellH);
//         context.fillStyle = "#334466";
//         context.fillText("E", cx + cellW * 1 / 3, cy + cellH - 2);
//       } else {
//         // var text = maze.traceInfo[node.x + "-" + node.y];
//         // context.fillText(text, cx + cellW * 1 / 3, cy + cellH - 2);
//       }

//       var left = (node.value & Maze.Direction.W) !== Maze.Direction.W;
//       var top = (node.value & Maze.Direction.N) !== Maze.Direction.N;
//       if (left && top) {
//         // 从左上顺时针勾勒
//         blocks.push([
//           [cx, cy],
//           [cx + cellW + wallWidth, cy],
//           [cx + cellW + wallWidth, cy + wallWidth],
//           [cx, cy + wallWidth],
//           [cx, cy]
//         ], [
//           [cx, cy],
//           [cx + wallWidth, cy],
//           [cx + wallWidth, cy + cellH + wallWidth],
//           [cx, cy + cellH + wallWidth],
//           [cx, cy]
//         ]);
//         context.fillRect(cx, cy, wallWidth, cellH);
//         context.fillRect(cx, cy, cellW, wallWidth);
//       } else if (left) {
//         blocks.push([
//           [cx, cy],
//           [cx + cellW + wallWidth, cy],
//           [cx + cellW + wallWidth, cy + wallWidth],
//           [cx, cy + wallWidth],
//           [cx, cy]
//         ]);
//         context.fillRect(cx, cy, wallWidth, cellH);
//       } else if (top) {
//         blocks.push([
//           [cx, cy],
//           [cx + wallWidth, cy],
//           [cx + wallWidth, cy + cellH + wallWidth],
//           [cx, cy + cellH + wallWidth],
//           [cx, cy]
//         ]);
//         context.fillRect(cx, cy, cellW, wallWidth);
//       } else {
//         // blocks.push([]);
//         var w = false;
//         if (r > 0) {
//           w = (grid[r - 1][c].value & Maze.Direction.W) !== Maze.Direction.W;
//         }
//         if (w && c > 0) {
//           w = (grid[r][c - 1].value & Maze.Direction.N) !== Maze.Direction.N;
//         }
//         var ltc = w ? 1 : 0;
//         if (ltc) {
//           context.fillRect(cx, cy, wallWidth, wallWidth);
//         }
//       }
//     }
//     cellY += cellH;
//     mazeHeight += cellH;
//   }

//   context.fillRect(x, mazeHeight + y, cellW * maze.width, wallWidth);
//   // 底边
//   blocks.push([
//     [x, mazeHeight + y],
//     [cellW * maze.width + x, mazeHeight + y],
//     [cellW * maze.width + x, mazeHeight + y + wallWidth],
//     [x, mazeHeight + y + wallWidth],
//     [x, mazeHeight + y]
//   ])
//   context.fillRect(cellW * maze.width + x, y, wallWidth, mazeHeight + wallWidth);
//   // 右边
//  blocks.push([
//     [cellW * maze.width + x, y],
//     [cellW * maze.width + x + wallWidth, y],
//     [cellW * maze.width + x + wallWidth, mazeHeight + y + wallWidth],
//     [cellW * maze.width + x , mazeHeight + y + wallWidth],
//     [cellW * maze.width + x, y]
//   ])
// }
// 
 var maze = new Maze({
    width: 20,
    height: 20,

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
      this.checkCount[c + "-" + r] = this.checkCount[c + "-" + r] || 0;
      var count = ++this.checkCount[c + "-" + r];
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
        this.traceInfo[this.currentNode.x + "-" + this.currentNode.y] = this.stepCount;
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
    if (typeof pathCollector == "function") {
      renderToCanvas = false;
      context = {
        fillRect: function (x, y, w, h) {
          pathCollector(x, y, w, h);
        },
        fillText: function () {
        }
      };
      cellW = cellH = cellSize = 1;
      wallWidth = cellSize / 8;
      x = y = 0;
    } else {
      renderToCanvas = true;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      context = canvas.getContext("2d");

      context.fillStyle = "#eeeeee";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#334466";
      context.strokeStyle = "#334466";
      context.font = "12px Arial";
      context.lineWidth = wallWidth;
    }

    var traceColors = ["#990000", "#009900", "#000099", "#999900", "#990099", "#009999"],
        traceFillBlankColor = "#999999",
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
          nodeType = "S";
          if (renderToCanvas) {
            context.fillStyle = "#f3bbaa";
            context.fillRect(cx, cy, cellW, cellH);
            context.fillStyle = "#334466";
            context.fillText(nodeType, cx + cellW * 1 / 3, cy + cellH - 2);
          }
        } else if (node == maze.endNode) {
          nodeType = "E";
          if (renderToCanvas) {
            context.fillStyle = "#f3bbaa";
            context.fillRect(cx, cy, cellW, cellH);
            context.fillStyle = "#334466";
            context.fillText(nodeType, cx + cellW * 1 / 3, cy + cellH - 2);
          }
        } else {
          if (renderToCanvas) {
            if (maze.trace) {
              var text = maze.traceInfo[node.x + "-" + node.y];
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

// //////
  window.addEventListener('DOMContentLoaded', function () {
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
      // Physics
      scene.enablePhysics();
      // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
      var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(5, 5, -10), scene);
      // target the camera to scene origin
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.setPosition(new BABYLON.Vector3(15, 15, -25));
      // attach the camera to the canvas
      camera.attachControl(canvas, true);

      // create a basic light, aiming 0,1,0 - meaning, to the sky
      var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
      // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
//      var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);
//      // move the sphere upward 1/2 of its height
//      sphere.position.y = 1;
//      sphere.material = new BABYLON.StandardMaterial("sphere_mat", scene);
//      sphere.material.diffuseColor = new BABYLON.Color3(.5, .9, .5);

      // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
      var ground = BABYLON.Mesh.CreateGround('ground1', 30, 30, 2, scene);
      ground.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
      ground.material.backFaceCulling = false;
      ground.material.diffuseColor = new BABYLON.Color3(.7, .7, .7);
//      ground.material.specularColor = new BABYLON.Color3(0, 0, 0);
//      var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
//      dynamicTexture.hasAlpha = true;
//      dynamicTexture.drawText("X", 5, 40, "bold 36px Arial", "red" , "transparent", true);
//      ground.material.diffuseTexture = dynamicTexture;
 // Physics
    ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.7 });


      // show axis
      var showAxis = function (size) {
        var makeTextPlane = function (text, color, size) {
          var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
          dynamicTexture.hasAlpha = true;
          dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
          var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
          plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
          plane.material.backFaceCulling = false;
          plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
          plane.material.diffuseTexture = dynamicTexture;
          return plane;
        };

        var axisX = BABYLON.Mesh.CreateLines("axisX", [
          BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
          new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var xChar = makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
          BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
          new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var yChar = makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
          BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
          new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        var zChar = makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
      };


      // material
//       var mat = new BABYLON.StandardMaterial("mat1", scene);
//       mat.alpha = 1.0;
//       mat.diffuseColor = new BABYLON.Color3(0, 0.5, .5);
//       mat.backFaceCulling = false;
//       //mat.wireframe = true;
//       // shape
//       var shape = [
//         new BABYLON.Vector3(1, 0, 0),
// //        new BABYLON.Vector3(0.2, 0.3, 0),
//         new BABYLON.Vector3(0, 1, 0),
// //        new BABYLON.Vector3(-0.2, 0.3, 0),
//         new BABYLON.Vector3(-1, 0, 0),
// //        new BABYLON.Vector3(-0.2, -0.3, 0),
//         new BABYLON.Vector3(0, -1, 0),
// //        new BABYLON.Vector3(0.2, -0.3, 0)
//       ];
//       shape.push(shape[0]);

//       for (var i = 0; i < shape.length; ++i) {
//         var sv = shape[i];
//         sv.x *= 1.5;
//         sv.y *= 1.5;
//         sv.z *= 1.5;
//       }

//       //var shapeline = BABYLON.Mesh.CreateLines("sl", shape, scene);
//       //shapeline.color = BABYLON.Color3.Green();

//       var path = [
//         new BABYLON.Vector3(0, 0, 0),
//         new BABYLON.Vector3(0, 8, 0)
//       ];

//       var extruded = BABYLON.Mesh.ExtrudeShape("extruded", shape, path, 1, 0, 0, scene);
//       extruded.material = mat;
//       extruded.position = new BABYLON.Vector3(5, 0, 2);

      // 渲染迷宫
      if (walls.length) {

        var hSpriteNb = 1;  // 6 sprites per raw
        var vSpriteNb = 1;  // 4 sprite raws
        var faceUV = new Array(6);
        for (var i = 0; i < 6; i++) {
          faceUV[i] = new BABYLON.Vector4(i / hSpriteNb, i / vSpriteNb, (i + 1) / hSpriteNb, (i + 1) / vSpriteNb);
        }

        var wallHeight = 1;
        var createBoxOptions = function(w) {
          return {
            width : Math.abs(w[1].x - w[0].x),
            height : wallHeight,
            depth : Math.abs(w[3].z - w[0].z)
          };
        };

        for (var i = 0; i < walls.length; ++i) {
          var w = walls[i];

          // var shapeline = BABYLON.Mesh.CreateLines("wall_shape_" + i, w, scene);
          // shapeline.color = BABYLON.Color3.Green();

          var options = createBoxOptions(w);
          var box = BABYLON.MeshBuilder.CreateBox("wall_box_" + i, options, scene);
          box.position = new BABYLON.Vector3(w[0].x + (w[1].x - w[0].x) / 2 - 10, wallHeight / 2, w[0].z + (w[3].z - w[0].z) / 2 + 10);
          box.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0 });
//          var p = [
//            new BABYLON.Vector3(1, 1, 1),
//            new BABYLON.Vector3(1, 1.2, 1)
//          ];
//          BABYLON.MeshBuilder.ExtrudeShape("extruded_" + i, {shape: w, path: p}, scene);
        }
      }
      // 增加小球
    var ball_size = 0.8;

            var ball = BABYLON.Mesh.CreateSphere("Sphere", 0, ball_size, scene);
            var x1 = ball_size;
            var y1 = ball_size + 5;
            var z1 = 5;
            ball.position = new BABYLON.Vector3(x1, y1, z1);
            console.log("[ball] x1 = " + x1 + ", y1 = " + y1 + ", z1 = " + z1);
            var materialWood = new BABYLON.StandardMaterial("wood", scene);
            materialWood.diffuseTexture = new BABYLON.Texture("img/wood.jpg", scene); // wood.jpg
            // 混合颜色
            // var rgbColor = getRgbColor(dataSet[i]);
            // materialWood.emissiveColor = new BABYLON.Color3(rgbColor[0], rgbColor[1], rgbColor[2]);
            ball.material = materialWood;
            ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 1 });
 

      showAxis(15);

      // return the created scene
      return scene;
    };

    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function () {
      scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
      engine.resize();
    });
  });