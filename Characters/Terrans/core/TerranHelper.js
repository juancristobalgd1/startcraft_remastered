export function recover() {
    if (this.magic != undefined && this.magic < this.get('MP')) {
        this.magic += 0.5;
    }
}
