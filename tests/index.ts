import { testScreenToVTSCoords, testTransalateNumberBetweenRanges, testvtsToScreenCoords } from "./trig";

async function runTest(fn: () => void | Promise<void>) {
    try {
        await fn();
        console.log(`Test ${fn.name} passed`);
    } catch (err: any) {
        console.error(`Test ${fn.name} failed`, err)
    }
}

runTest(testTransalateNumberBetweenRanges);
runTest(testScreenToVTSCoords);
runTest(testvtsToScreenCoords);