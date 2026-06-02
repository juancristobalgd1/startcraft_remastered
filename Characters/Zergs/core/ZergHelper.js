export function recover() {
    if (this.life < this.get('HP')) this.life += 0.5;
    if (this.magic != undefined && this.magic < this.get('MP')) this.magic += 0.5;
}
