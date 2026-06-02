import Burst from '../../Bursts/core/BurstBase.js';

//Alias
const Animation = Burst;

const isAnimationClass = function (ctor) {
    return ctor && (ctor.prototype instanceof Animation);
};

Animation.getAllAnimations = function () {
    const allAnimes = [];
    for (const attr in Animation) {
        if (isAnimationClass(Animation[attr])) allAnimes.push(Animation[attr]);
    }
    return allAnimes;
};

Animation.getName = function (anime) {
    for (const attr in Animation) {
        if (isAnimationClass(Animation[attr]) && (anime instanceof Animation[attr])) return attr;
    }
};

if (typeof window !== 'undefined') {
    window.Animation = Animation;
}
export default Animation;
