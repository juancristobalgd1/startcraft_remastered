export const Hero = {};
// Global assignment for legacy compatibility
if (typeof window !== 'undefined') {
    window.Hero = Hero;
}
export default Hero;
