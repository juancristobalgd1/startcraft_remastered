//Alias
const Animation = Burst;
Animation.getAllAnimations = function () {
    const allAnimes = [];
    for (const attr in Animation) {
        if (Animation[attr].super === Animation) allAnimes.push(Animation[attr]);
    }
    return allAnimes;
};
Animation.getName = function (anime) {
    for (const attr in Animation) {
        //Should be animation constructor firstly
        if (Animation[attr].super === Animation && (anime instanceof Animation[attr])) return attr;
    }
};
