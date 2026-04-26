import { Card } from 'react-bootstrap';
import { Court, IndependentCourt, Player } from '../../pages/board/type';
import React from 'react';
import { CourtInfo } from '../../types';

import './index.css'

interface IProps {
    courts: IndependentCourt[]
    courtsInfo: CourtInfo[]
    players: Player[]
}

const getPlayCountFromCourt = (playerName: string, courts: Court[]) => {
    return courts.filter((court: Court) => [...court.red, ...court.blue].includes(playerName)).length
}

const HistoriesCard: React.FC<IProps> = ({ courts, courtsInfo, players }) => {
    const playersWithPlayCount = players.map((player) => ({ ...player, playCount: getPlayCountFromCourt(player.name, courts) }), [])
    const orderedPlayersWithPlayCount = playersWithPlayCount.sort((a, b) => a.playCount - b.playCount)
    const playedCountsText = orderedPlayersWithPlayCount.map(player => `${player.name} - ${player.playCount}`)
    return (
        <Card>
            <Card.Header>Histories</Card.Header>
            <Card.Body>
                {/* {
                    courts.map((court, index) => (
                        <div key={`court-${index}`}>
                            <p>{`Court - ${courtsInfo[court.courtIndex]?.name || 'None'} ${court.red} vs ${court.blue}`}</p>
                        </div>
                    ))
                } */}
                {
                    <div className="player-play-text-container">
                        {playedCountsText.map(text => <div className="player-play-text">{text}</div>)}
                    </div>
                }
            </Card.Body>
        </Card>
    )
}

export default HistoriesCard;