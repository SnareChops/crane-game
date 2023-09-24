(() => {
  // core/trig.ts
  function translateNumberBetweenRanges(value, minA, maxA, minB, maxB) {
    return (value - minA) / (maxA - minA) * (maxB - minB) + minB;
  }
  function linearInterpolate(a, b, percent) {
    return a + (b - a) * percent;
  }

  // src/config.ts
  var config = {
    SCREEN_WIDTH: 1920,
    SCREEN_HEIGHT: 1080,
    MODEL_HEIGHT_OFFSET: 1,
    MOVE_TO_DURATION: 5e3,
    LOWERING_DURATION: 2e3,
    GRABBING_DURATION: 1e3,
    RAISING_DURATION: 2e3,
    MOVE_BACK_DURATION: 8e3,
    DROPPING_DURATION: 200,
    FALLING_DURATION: 500,
    RESTING_DURATION: 3e3
  };

  // tests/trig.ts
  function testTransalateNumberBetweenRanges() {
    let result = translateNumberBetweenRanges(-1, -1, 1, 0, 1920);
    if (result != 0)
      throw new Error("should be 0");
    result = translateNumberBetweenRanges(1, -1, 1, 0, 1920);
    if (result != 1920)
      throw new Error("should be 1920");
    result = translateNumberBetweenRanges(0.8421875238418579, -1, 1, 0, 1920);
    result = translateNumberBetweenRanges(1, 2, 0, 0, 1080);
    result = translateNumberBetweenRanges(100, 0, 1080, 1, -1);
  }
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
  function testScreenToVTSCoords() {
    let [x, y] = screenToVTSCoords(0, 0);
    if (x != -1 || y != 1)
      throw new Error("should be top left corner");
    [x, y] = screenToVTSCoords(1920, 1080);
    if (x != 1 || y != -1)
      throw new Error("should be top left corner");
    [x, y] = screenToVTSCoords(960, 540);
    if (x != 0 || y != 0)
      throw new Error("should be top left corner");
  }
  function testvtsToScreenCoords() {
    let [x, y] = vtsToScreenCoords(-1, 1);
    console.log(x, y);
    if (x != 0 || y != 0)
      throw new Error("should be top left corner");
    [x, y] = vtsToScreenCoords(1, -1);
    console.log(x, y);
    if (x != 1920 || y != 1080)
      throw new Error("should be bottom right corner");
    [x, y] = vtsToScreenCoords(0, 0);
    console.log(x, y);
    if (x != 960 || y != 540)
      throw new Error("should be center");
  }

  // tests/index.ts
  async function runTest(fn) {
    try {
      await fn();
      console.log(`Test ${fn.name} passed`);
    } catch (err) {
      console.error(`Test ${fn.name} failed`, err);
    }
  }
  runTest(testTransalateNumberBetweenRanges);
  runTest(testScreenToVTSCoords);
  runTest(testvtsToScreenCoords);
})();
