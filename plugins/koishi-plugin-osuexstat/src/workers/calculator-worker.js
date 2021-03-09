/* eslint-disable new-cap */
const { expose } = require("threads/worker");
const ojsama = require("ojsama");
const fs = require("fs");

expose({
    async init(vm) {
        const rawBeatmap = new Promise((resolve) => {
            fs.readFile(vm.beatmapFile, "utf-8", (err, data) => {
                if (err) throw err;
                resolve(data);
            });
        });
        const { map } = new ojsama.parser().feed(await rawBeatmap);
        vm.map = map;
        vm.maxcombo = vm.map.max_combo();
        if (!vm.combo) vm.combo = vm.maxcombo;
        vm.stars = new ojsama.diff().calc({ map: vm.map, mods: vm.mods });
        const firstTime = vm.stars.objects[0].obj.time;
        const lastTime = vm.stars.objects[vm.stars.objects.length - 1].obj.time;
        vm.rawApproximateLength = Math.ceil((lastTime - firstTime) / 1000);
        vm.pp = ojsama.ppv2({
            stars: vm.stars,
            combo: vm.combo,
            nmiss: vm.nmiss,
            acc_percent: vm.acc,
        });
        vm.fcpp = ojsama.ppv2({
            stars: vm.stars,
            combo: vm.maxcombo,
            nmiss: 0,
            acc_percent: vm.acc,
        });
        vm.sspp = ojsama.ppv2({
            stars: vm.stars,
            combo: vm.maxcombo,
            nmiss: 0,
            acc_percent: 100,
        });
        return vm;
    },
    calculateStatWithMods({ values, mods }) {
        return new ojsama.std_beatmap_stats(values).with_mods(mods);
    }
});
