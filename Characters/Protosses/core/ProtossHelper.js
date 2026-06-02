/**
 * Shared recover function for Protoss units
 * Replaces ProtossBuilding.prototype.recover
 */
export function recover() {
    // Protoss units recover shields and magic over time
    // Note: Units typically don't require power (unlike buildings), so isPowered check is skipped
    // unless requiresPower property is explicitly set.
    if (this.requiresPower && !this.isPowered()) return;

    if (this.shield < this.get('SP')) {
        this.shield += 0.5;
    }
    
    if (this.magic != undefined && this.magic < this.get('MP')) {
        this.magic += 0.5;
    }
}
