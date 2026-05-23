// Night City grid bootstrap
import { Grid } from "night-city";

class District {
  readonly name: string;
  power = 0xfcee0a;
  constructor(name: string) {
    this.name = name;
  }
  glow(level = 5): string {
    return `${this.name}: ${level > 0 ? "online" : "offline"}`;
  }
}

const tygers = new District("japantown");
console.log(tygers.glow());
