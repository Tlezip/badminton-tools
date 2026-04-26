export interface BasePlayer {
    name: string;
    rank: number;
    isGod?: boolean;
}

export interface IPlayer extends BasePlayer {
    isAlonable: boolean
    isResting?: boolean
}

export interface CourtInfo {
    name: string
}

export interface Team {
    teamId: number;
    pairs: string[];
}

export enum Mode {
    Random = 'Random',
    Normal = 'Normal',
    Balanced = 'Balanced'
} 