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

  // core/renderer.ts
  var Renderer = class {
    background = [];
    effects = [];
    screen = [];
    addToBackground(sprite) {
      if (this.background.includes(sprite))
        return;
      this.screen.push(sprite);
    }
    removeFromBackground(sprite) {
      const i = this.background.indexOf(sprite);
      if (i > -1)
        this.background.splice(i, 1);
    }
    addEffect(effect) {
      if (this.effects.includes(effect))
        return;
      this.effects.push(effect);
    }
    removeEffect(effect) {
      const i = this.effects.indexOf(effect);
      if (i > -1)
        this.effects.splice(i, 1);
    }
    addToScreen(sprite) {
      if (this.screen.includes(sprite))
        return;
      this.screen.push(sprite);
    }
    removeFromScreen(sprite) {
      const i = this.screen.indexOf(sprite);
      if (i > -1)
        this.screen.splice(i, 1);
    }
    draw(ctx2) {
      for (let effect of this.effects) {
        for (let particle of effect.particles) {
          const image = particle.Image();
          if (!!image) {
            ctx2.drawImage(image, ...particle.bounds.rawPos());
          }
        }
      }
      this.screen.sort((a, b) => {
        const [ax, ay, az] = a.vector.vec3();
        const [bx, by, bz] = b.vector.vec3();
        return az - bz;
      });
      for (const item of this.screen) {
        const image = item.Image();
        if (!!image) {
          ctx2.drawImage(image, ...item.rawPos());
        }
      }
    }
  };

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
    constructor() {
      super(100, 100);
      const [canvas, context] = createCanvas(...this.size());
      context.fillStyle = "red";
      context.fillRect(0, 0, 10, 100);
      context.fillRect(90, 0, 10, 100);
      context.fillRect(0, 0, 100, 10);
      this.image = canvas;
    }
    Image() {
      return this.image;
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

  // src/scene.ts
  var CraneScene = class {
    renderer = new Renderer();
    crane = new CraneSprite();
    state = 2 /* IDLE */;
    vts = new VTS();
    model;
    savedPos = [0, 0, 0, 0];
    cooldown = 2e3;
    constructor() {
      this.renderer.addToScreen(this.crane);
      this.model = new Model(this.vts);
      this.vts.onOpen(async () => {
        await this.vts.authorize();
        this.savedPos = await this.model.Pos();
        console.log(this.savedPos);
      });
    }
    update(delta) {
      if (isSet(this.state, 2 /* IDLE */)) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
          this.state = 4 /* ACTIVE */;
          this.cooldown = 2e3;
          const [x, y, r, s] = this.savedPos;
          console.log("centering");
          this.model.SetPos(0, 0, 0, s);
        }
        return;
      }
      if (isSet(this.state, 4 /* ACTIVE */)) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
          this.state = 2 /* IDLE */;
          this.cooldown = 2e3;
          console.log("resetting");
          this.model.SetPos(...this.savedPos);
        }
      }
    }
    draw(screen) {
      this.renderer.draw(screen);
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
