import React from "react";
import { Card, Button } from "react-bootstrap";
import { CourtStatus, IndependentCourtV3 } from "../../pages/board/type";
import './index.css'
import { IPlayer } from "../../types";
import { getPlayerRank } from "../../pages/board/helper";
import TeamCardV3 from "../TeamCardV3";

interface CourtCardProps {
    courtNumber: number
    court: IndependentCourtV3
    players: IPlayer[]
    handleSwapPlayers: (firstPlayer: string, secondPlayer: string) => void
    finishCourt: () => void
}

const getCourtStyleByCourtNumber = (courtNumber: number) => {
    const moderatedCourtNumber = courtNumber % 2;
    switch (moderatedCourtNumber) {
        case 1:
            return {
                titleColor: '#1E40AF',
                cardBackground: '#E2EFFF',
                cardBorder: '#d5e4fd',
                badgeBackground: '#DBEAFE',
                teamTextColor: '#1D4ED8',
                editButtonBackground: '#3b82f6',
            }
        case 0:
        default:
            return {
                titleColor: '#166534',
                cardBackground: '#E9FCF0',
                cardBorder: '#d1f1e7',
                badgeBackground: '#DCFCE7',
                teamTextColor: '#15803D'
            }
    }
}

const CourtCardV3: React.FC<CourtCardProps> = ({ courtNumber, court, players, handleSwapPlayers, finishCourt }) => {
    const styleByCourtNumber = getCourtStyleByCourtNumber(courtNumber);
    const isCourtEmpty = court.status === CourtStatus.NotStarted || court.status === CourtStatus.Finished;

    const getRedTeamRank = () => court.red.reduce((acc, redPlayerName) => acc + getPlayerRank(players, redPlayerName), 0)
    const getBlueTeamRank = () => court.blue.reduce((acc, bluePlayerName) => acc + getPlayerRank(players, bluePlayerName), 0)

    return (
        <Card style={{ backgroundColor: styleByCourtNumber.cardBackground, border: `2px solid ${styleByCourtNumber.cardBorder}` }}>
            <Card.Body>
                <div className="court-card-v3__title-container">
                    <Card.Title style={{ color: styleByCourtNumber.titleColor }}>{`Court ${courtNumber}`}</Card.Title>
                </div>
                <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
                {
                    isCourtEmpty ? (
                        <div className="court-card-v3__waiting-player-container">
                            Waiting for players...
                        </div>
                    ) : (
                        <>
                            <TeamCardV3
                                teamText="TEAM A"
                                cardBorder={styleByCourtNumber.cardBorder}
                                badgeBackground={styleByCourtNumber.badgeBackground}
                                teamTextColor={styleByCourtNumber.teamTextColor}
                                scoreColor={styleByCourtNumber.teamTextColor}
                                score={getRedTeamRank()}
                                handleSwapPlayers={handleSwapPlayers}
                                teamPlayers={court.red}
                                players={players}
                            />
                            <Card.Text style={{ margin: "8px 0", textAlign: "center" }}>
                                vs
                            </Card.Text>
                            <TeamCardV3
                                teamText="TEAM B"
                                cardBorder={styleByCourtNumber.cardBorder}
                                badgeBackground="#FEE2E2"
                                teamTextColor="#B91C1C"
                                scoreColor={styleByCourtNumber.teamTextColor}
                                score={getBlueTeamRank()}
                                handleSwapPlayers={handleSwapPlayers}
                                teamPlayers={court.blue}
                                players={players}
                            />
                            <div className="court-card-v3__button-footer-container">
                                <Button style={{ background: '#22c55e', border: 'none' }} onClick={finishCourt}>Finish Game</Button>
                            </div>
                        </>
                    )
                }
            </Card.Body>
        </Card>
    )
}

export default CourtCardV3;
