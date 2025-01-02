export interface BasePlayer {
    name: string;
    rank: number;
    isGod?: boolean;
}

export interface CourtInfo {
    name: string
}

export interface Team {
    teamId: number;
    pairs: string[];
}