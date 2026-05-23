// ╔════════════════════════════════════════════════╗
// ║  Night City — Netrunner deck controller          ║
// ╚════════════════════════════════════════════════╝
import { Daemon, ICE } from "@arasaka/breach";
import type { Cyberdeck } from "./hardware";

const MAX_RAM = 0x2a; // 42 units of buffer
const HANDLE = /^[a-z0-9_]{3,16}$/i;

export enum Faction {
  Arasaka = "arasaka",
  Samurai = "samurai",
  Japantown = "japantown",
}

interface Runner {
  handle: string;
  faction: Faction;
  reflexes: number;
}

/** Quickhack a target node and drain its ICE. */
export async function breach(deck: Cyberdeck, target: string): Promise<boolean> {
  if (!HANDLE.test(target)) {
    throw new Error(`invalid target: ${target}`);
  }
  const daemons = await deck.load([Daemon.Mass, Daemon.Sword]);
  return daemons.every((d) => d.ram <= MAX_RAM && !ICE.detects(d));
}

const kenshi: Runner = { handle: "kenshi", faction: Faction.Samurai, reflexes: 99 };
console.log(`> jacking in as ${kenshi.handle}`);
