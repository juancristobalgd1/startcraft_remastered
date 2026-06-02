
const existingProtoss = (typeof window !== 'undefined') ? window.Protoss : undefined;
const Protoss = existingProtoss || {};
if (typeof window !== 'undefined') {
    window.Protoss = Protoss;
}
export default Protoss;
