import { BasePlayer } from "../../types";

export interface Player extends BasePlayer {
    isAlonable: boolean;
}

export interface Court {
    red: string[]
    blue: string[]
}

export interface PairMap {
    [name: string]: {
      [pairName: string]: number
    }
}

export type Pair = string[]

export interface Round {
    courts: Court[]
    rest: string[]
}
