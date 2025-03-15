import { BasePlayer, CourtInfo } from "../../types";

export interface Player extends BasePlayer {
    isAlonable: boolean;
}

export enum PlayerTeam {
    red = "red",
    blue = "blue"
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
    mode: string
    courtsInfo: CourtInfo[]
}
