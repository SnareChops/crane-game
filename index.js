(() => {
  // core/engine.ts
  var Engine = class {
    constructor(context) {
      this.context = context;
    }
    prev = 0;
    game;
    runGame(game) {
      this.game = game;
      window.requestAnimationFrame(this.tick.bind(this));
    }
    tick(timestamp) {
      const delta = timestamp - this.prev;
      this.prev = timestamp;
      if (delta > 0) {
        this.game.update(delta);
      }
      this.context.reset();
      this.game.draw(this.context);
      window.requestAnimationFrame(this.tick.bind(this));
    }
  };

  // core/trig.ts
  function lerp(x1, y1, x2, y2, percent) {
    return [x1 + (x2 - x1) * percent, y1 + (y2 - y1) * percent];
  }
  function linearInterpolate(a, b, percent) {
    return a + (b - a) * percent;
  }

  // core/util.ts
  function isSet(mask, state) {
    return (mask & state) === state;
  }
  function createCanvas(w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return [canvas, canvas.getContext("2d")];
  }

  // src/config.ts
  var config = {
    SCREEN_WIDTH: 1920,
    SCREEN_HEIGHT: 1080,
    MODEL_HEIGHT_OFFSET: 0.6,
    MOVE_TO_DURATION: 5e3,
    LOWERING_DURATION: 2e3,
    GRABBING_DURATION: 1e3,
    RAISING_DURATION: 2e3,
    MOVE_BACK_DURATION: 8e3,
    DROPPING_DURATION: 200,
    FALLING_DURATION: 500,
    RESTING_DURATION: 3e3
  };

  // core/vector.ts
  var RawVector = class {
    x = 0;
    y = 0;
    z = 0;
    vec2() {
      return [this.x, this.y];
    }
    setVec2(x, y) {
      this.x = x;
      this.y = y;
    }
    vec3() {
      return [this.x, this.y, this.z];
    }
    setVec3(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  };

  // core/bounds.ts
  var TOP = 0;
  var CENTER = 1;
  var BOTTOM = 2;
  var LEFT = 3;
  var RIGHT = 4;
  var BaseBounds = class {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
    vector;
    offsetX = 0;
    offsetY = 0;
    anchorX = 0;
    anchorY = 0;
    rawPos() {
      const [ox, oy] = this.offset();
      const [vx, vy] = this.vector.vec2();
      return [vx - ox, vy - oy];
    }
    setAnchor(x, y) {
      this.anchorX = x;
      this.anchorY = y;
      switch (x) {
        case LEFT:
          this.offsetX = 0;
          break;
        case CENTER:
          this.offsetX = this.width / 2;
          break;
        case RIGHT:
          this.offsetX = this.width;
          break;
      }
      switch (y) {
        case TOP:
          this.offsetY = 0;
          break;
        case CENTER:
          this.offsetY = this.height / 2;
          break;
        case BOTTOM:
          this.offsetY = this.height;
          break;
      }
    }
    vecOf(h, v) {
      let x = 0;
      let y = 0;
      const [vx, vy] = this.vector.vec2();
      switch (h) {
        case LEFT:
          x = vx - this.offsetX;
          break;
        case CENTER:
          x = vx - this.offsetX + this.width / 2;
          break;
        case RIGHT:
          x = vx - this.offsetX + this.width;
          break;
      }
      switch (v) {
        case TOP:
          y = vy - this.offsetY;
          break;
        case CENTER:
          y = vy - this.offsetY + this.height / 2;
          break;
        case BOTTOM:
          y = vy - this.offsetY + this.height;
          break;
      }
      return [x, y];
    }
    anchor() {
      return [this.anchorX, this.anchorY];
    }
    offset() {
      return [this.offsetX, this.offsetY];
    }
    size() {
      return [this.width, this.height];
    }
    setSize(w, h) {
      this.width = w;
      this.height = h;
    }
    dx() {
      return this.width;
    }
    dy() {
      return this.height;
    }
    normalVectorOf(edge) {
      switch (edge) {
        case LEFT:
          return [-1, 0];
        case TOP:
          return [0, -1];
        case RIGHT:
          return [1, 0];
        case BOTTOM:
          return [0, 1];
        default:
          throw new Error("Invalid edge");
      }
    }
    isWithin(x, y) {
      const [x1, y1] = this.rawPos();
      if (this.width == 1 && this.height == 1) {
        return x == x1 && y == y1;
      }
      const x2 = x1 + this.width;
      const y2 = y1 + this.height;
      return x > x1 && x < x2 && y > y1 && y < y2;
    }
    doesCollide(other) {
      const [w1, h1] = this.size();
      const [x1, y1] = this.rawPos();
      const [w2, h2] = other.size();
      const [x2, y2] = other.rawPos();
      return !(x2 + w2 < x1 || x2 > x1 + w1 || y2 + h2 < y1 || y2 > y1 + h1);
    }
    collisionEdges(other) {
      const [w1, h1] = this.size();
      const [x1, y1] = this.rawPos();
      const [w2, h2] = other.size();
      const [x2, y2] = other.rawPos();
      if (x1 + w1 >= x2 && x1 < x2) {
        return [LEFT, RIGHT];
      }
      if (x1 <= x2 + w2 && x1 + w1 > x2 + w2) {
        return [RIGHT, LEFT];
      }
      if (y1 + h1 >= y2 && y1 < y2) {
        return [TOP, BOTTOM];
      }
      if (y1 <= y2 + h2 && y1 + h1 > y2 + h2) {
        return [BOTTOM, TOP];
      }
      return [0, 0];
    }
  };
  var RawBounds = class extends BaseBounds {
    constructor(width = 0, height = 0) {
      super(width, height);
      this.width = width;
      this.height = height;
      this.vector = new RawVector();
    }
  };

  // src/crane.ts
  var CraneSprite = class extends RawBounds {
    image;
    top;
    left;
    right;
    closePercent = 0;
    constructor() {
      super(100, 100);
      this.setAnchor(CENTER, BOTTOM);
      this.image = createCanvas(...this.size());
      const [topCanvas, topContext] = createCanvas(100, 10);
      topContext.fillStyle = "red";
      topContext.fillRect(0, 0, 100, 10);
      this.top = topCanvas;
      const [leftCanvas, leftContext] = createCanvas(10, 100);
      leftContext.fillStyle = "red";
      leftContext.fillRect(0, 0, 10, 100);
      this.left = leftCanvas;
      this.right = leftCanvas;
      this.render();
    }
    close(percent) {
      this.closePercent = percent;
      this.render();
    }
    open(percent) {
      this.closePercent = 1 - percent;
      this.render();
    }
    render() {
      this.image[1].reset();
      this.image[1].drawImage(this.top, 0, 0);
      this.image[1].rotate(linearInterpolate(0, 7 * Math.PI / 4, this.closePercent));
      this.image[1].drawImage(this.left, 0, 0);
      this.image[1].resetTransform();
      this.image[1].rotate(linearInterpolate(0, Math.PI / 4, this.closePercent));
      this.image[1].drawImage(this.right, 90, 0);
      this.image[1].resetTransform();
    }
    Image() {
      return this.image[0];
    }
  };

  // src/vts.ts
  var VTS = class {
    socket;
    pending = /* @__PURE__ */ new Map();
    counter = 0;
    pluginName = "Crane Game";
    pluginDeveloper = "SnareChops";
    #token;
    #onopen;
    constructor() {
      this.socket = new WebSocket("ws://localhost:8001");
      this.socket.onopen = (event) => {
        console.log("connected", event);
        this.#onopen();
      };
      this.socket.onerror = (event) => console.error(event);
      this.socket.onmessage = (event) => this.#message(event.data);
    }
    onOpen(fn) {
      this.#onopen = fn;
    }
    async authorize() {
      const response = await this.request("AuthenticationTokenRequest" /* AuthenticationTokenRequest */, {
        pluginName: this.pluginName,
        pluginDeveloper: this.pluginDeveloper
      });
      if (!response.authenticationToken)
        return console.error("VTS authentication failed");
      this.#token = response.authenticationToken;
      await this.request("AuthenticationRequest" /* AuthenticationRequest */, {
        pluginName: this.pluginName,
        pluginDeveloper: this.pluginDeveloper,
        authenticationToken: this.#token
      });
    }
    async request(messageType, data) {
      return new Promise((resolve) => {
        this.socket.send(JSON.stringify({
          apiName: "VTubeStudioPublicAPI",
          apiVersion: "1.0",
          requestID: this.counter.toString(),
          messageType,
          data
        }));
        this.pending.set(this.counter.toString(), resolve);
        this.counter += 1;
      });
    }
    #message(message) {
      const response = JSON.parse(message);
      const resolve = this.pending.get(response.requestID);
      if (!!resolve)
        resolve(response.data);
    }
  };

  // src/model.ts
  var Model = class {
    constructor(vts) {
      this.vts = vts;
    }
    async Pos() {
      const response = await this.vts.request("CurrentModelRequest" /* CurrentModelRequest */);
      console.log("model position response", response);
      return [
        response.modelPosition.positionX,
        response.modelPosition.positionY,
        response.modelPosition.rotation,
        response.modelPosition.size
      ];
    }
    async SetPos(x, y, rotation, size, time = 0, relative = false) {
      console.log("Setting model position to:", x, y, rotation, size);
      await this.vts.request("MoveModelRequest" /* MoveModelRequest */, {
        timeInSeconds: time,
        valuesAreRelativeToModel: relative,
        positionX: x,
        positionY: y,
        rotation,
        size
      });
    }
  };

  // src/util.ts
  function screenToVTSCoords(sx, sy) {
    return [
      linearInterpolate(-1, 1, sx / config.SCREEN_WIDTH),
      linearInterpolate(1, -1, sy / config.SCREEN_HEIGHT)
    ];
  }
  function vtsToScreenCoords(vx, vy) {
    return [
      linearInterpolate(0, 1920, (vx + 1) / 2),
      linearInterpolate(1080, 0, (vy + 1) / 2)
    ];
  }

  // src/scene.ts
  var CraneScene = class {
    crane = new CraneSprite();
    state = 2 /* IDLE */;
    prev = 2 /* IDLE */;
    vts = new VTS();
    model;
    savedPos = [0, 0, 0, 0];
    canvasPos = [0, 0];
    cooldown = 2e3;
    constructor() {
      this.crane.vector.setVec2(100, 100);
      this.model = new Model(this.vts);
      this.vts.onOpen(async () => {
        await this.vts.authorize();
        this.savedPos = await this.model.Pos();
        this.canvasPos = vtsToScreenCoords(this.savedPos[0], this.savedPos[1] + config.MODEL_HEIGHT_OFFSET);
        console.log(this.canvasPos);
        console.log(this.savedPos, this.canvasPos);
      });
      setTimeout(() => this.trigger(), 2e3);
    }
    trigger() {
      if (!isSet(this.state, 2 /* IDLE */))
        return;
      this.cooldown = config.MOVE_TO_DURATION;
      this.state = 8 /* MOVETO */ | 4 /* ACTIVE */;
    }
    update(delta) {
      if (isSet(this.state, 8 /* MOVETO */))
        this.moveToUpdate(delta);
      if (isSet(this.state, 16 /* LOWERING */))
        this.loweringUpdate(delta);
      if (isSet(this.state, 32 /* GRABBING */))
        this.grabbingUpdate(delta);
      if (isSet(this.state, 64 /* RAISING */))
        this.raisingUpdate(delta);
      if (isSet(this.state, 128 /* MOVEBACK */))
        this.moveBackUpdate(delta);
      if (isSet(this.state, 256 /* DROPPING */))
        this.droppingUpdate(delta);
      if (isSet(this.state, 512 /* FALLING */))
        this.fallingUpdate(delta);
      if (isSet(this.state, 1024 /* RESTING */))
        this.restingUpdate(delta);
    }
    moveToUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.cooldown = config.LOWERING_DURATION + this.cooldown;
        this.state = 16 /* LOWERING */ | 4 /* ACTIVE */;
        return;
      }
      this.prev = 8 /* MOVETO */;
      const percent = 1 - this.cooldown / config.MOVE_TO_DURATION;
      this.crane.vector.setVec2(...lerp(100, 100, this.canvasPos[0], 100, percent));
    }
    loweringUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.cooldown = config.GRABBING_DURATION + this.cooldown;
        this.state = 32 /* GRABBING */ | 4 /* ACTIVE */;
        return;
      }
      this.prev = 16 /* LOWERING */;
      const percent = 1 - this.cooldown / config.LOWERING_DURATION;
      this.crane.vector.setVec2(...lerp(this.canvasPos[0], 100, ...this.canvasPos, percent));
    }
    grabbingUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.cooldown = config.RAISING_DURATION + this.cooldown;
        this.state = 64 /* RAISING */ | 4 /* ACTIVE */;
        return;
      }
      this.prev = 32 /* GRABBING */;
      this.crane.close(1 - this.cooldown / config.GRABBING_DURATION);
    }
    raisingUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.cooldown = config.MOVE_BACK_DURATION + this.cooldown;
        this.state = 128 /* MOVEBACK */ | 4 /* ACTIVE */;
        return;
      }
      this.prev = 64 /* RAISING */;
      const percent = 1 - this.cooldown / config.RAISING_DURATION;
      this.crane.vector.setVec2(...lerp(...this.canvasPos, this.canvasPos[0], 100, percent));
      const [x, y] = screenToVTSCoords(0, linearInterpolate(this.canvasPos[1], 100, percent));
      this.model.SetPos(this.savedPos[0], y - config.MODEL_HEIGHT_OFFSET, this.savedPos[2], this.savedPos[3]);
    }
    moveBackUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.cooldown = config.DROPPING_DURATION + this.cooldown;
        this.state = 256 /* DROPPING */ | 4 /* ACTIVE */;
        return;
      }
      this.prev = 128 /* MOVEBACK */;
      const percent = 1 - this.cooldown / config.MOVE_BACK_DURATION;
      this.crane.vector.setVec2(...lerp(this.canvasPos[0], 100, 100, 100, percent));
      const [x, y] = screenToVTSCoords(...this.crane.vector.vec2());
      this.model.SetPos(x, y - config.MODEL_HEIGHT_OFFSET, this.savedPos[2], this.savedPos[3]);
    }
    droppingUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.cooldown = config.FALLING_DURATION + this.cooldown;
        this.state = 512 /* FALLING */ | 4 /* ACTIVE */;
        return;
      }
      this.prev = 256 /* DROPPING */;
      this.crane.open(1 - this.cooldown / config.DROPPING_DURATION);
    }
    fallingUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.cooldown = config.RESTING_DURATION + this.cooldown;
        this.state = 1024 /* RESTING */ | 4 /* ACTIVE */;
        return;
      }
      if (this.prev != 512 /* FALLING */) {
        const [x, y] = screenToVTSCoords(...this.crane.vector.vec2());
        this.model.SetPos(x, -2, this.savedPos[2], this.savedPos[3], 0.5);
      }
      this.prev = 512 /* FALLING */;
    }
    restingUpdate(delta) {
      this.cooldown -= delta;
      if (this.cooldown <= 0) {
        this.state = 2 /* IDLE */;
        this.model.SetPos(...this.savedPos);
      }
    }
    draw(screen) {
      screen.drawImage(this.crane.Image(), ...this.crane.rawPos());
    }
  };

  // src/index.ts
  var $body = document.querySelector("body");
  var $canvas = document.createElement("canvas");
  var ctx = $canvas.getContext("2d");
  $canvas.width = 1920;
  $canvas.height = 1080;
  $body.append($canvas);
  new Engine(ctx).runGame(new CraneScene());
})();
