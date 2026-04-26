import React, { useState } from 'react'
import { Card, Button, Dropdown } from 'react-bootstrap'
import { CourtStatus, IndependentCourt, Player } from '../../pages/board/type';

import './index.css'

interface IProps {
    handleGenerateCourt: () => void;
    handleToggleCourtStatus: () => void;
    handleSwapPlayer: (firstPlayer: string, secondPlayer: string) => void;
    handleAddPlayerToCourt: (team: 'red' | 'blue', playerName: string) => void;
    handleDeletePlayerFromCourt: (team: 'red' | 'blue', playerName: string) => void;
    handleRemoveLastRound: (courtIndex: number) => void;
    courtName: string;
    courtInfo?: IndependentCourt;
    players: Player[];
}

const CourtCard: React.FC<IProps> = ({
    handleGenerateCourt,
    handleToggleCourtStatus,
    handleSwapPlayer,
    handleAddPlayerToCourt,
    handleDeletePlayerFromCourt,
    handleRemoveLastRound,
    courtName,
    courtInfo,
    players,
}) => {
    const [isEditting, setIsEditting] = useState<boolean>(false);

    const getCourtStatusButtonStyle = (status: CourtStatus) => {
        switch (status) {
            case CourtStatus.Playing:
                return "warning"
            case CourtStatus.Finished:
                return 'success'
            default:
                return "primary"
        }
    }


    const getCourtStatusText = (status: CourtStatus | undefined) => {
        switch (status) {
            case CourtStatus.Playing:
                return "Playing"
            case CourtStatus.Finished:
                return 'Finished'
            default:
                return "Not started"
        }
    }

    const courtStatusText = getCourtStatusText(courtInfo?.status)

    const renderPlayer = (playerName: string, team: 'red' | 'blue') => {
        if (!isEditting) return <p className="court-card__player-info">{playerName}</p>
        const otherPlayers = players.filter(player => player.name !== playerName);

        const handleClickPlayer = (playerName: string, player: Player) => {
            if (playerName) handleSwapPlayer(playerName, player.name)
            else handleAddPlayerToCourt(team, player.name)
        }

        return (
            <Dropdown>
                <Dropdown.Toggle variant='success'>
                    {playerName || '-'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleDeletePlayerFromCourt(team, playerName)}>-</Dropdown.Item>
                    {
                        otherPlayers.map(player => (
                            <Dropdown.Item
                                onClick={() => handleClickPlayer(playerName, player)}
                                key={player.name}
                            >
                                {player.name}
                            </Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        )
    }

    const getPlayerScore = (playerName: string) => players.find(player => player.name === playerName)?.rank || 0

    const renderTotalScore = (playerName1: string, playerName2: string) => getPlayerScore(playerName1) + getPlayerScore(playerName2);

    return (
        <Card className="court-container">
            <Card.Header>{`Court ${courtName} (${courtStatusText})`}</Card.Header>
            <Card.Body>
                {courtInfo && courtInfo.status === CourtStatus.Playing && (
                    <>
                        <div className="court-card__player-info-container">
                            {renderPlayer(courtInfo.red[0], 'red')}
                            {renderPlayer(courtInfo.red[1], 'red')}
                            {`(${renderTotalScore(courtInfo.red[0], courtInfo.red[1])})`}
                        </div>
                        <p className="court-card__player-info">vs</p>
                        <div className="court-card__player-info-container">
                            {renderPlayer(courtInfo.blue[0], 'blue')}
                            {renderPlayer(courtInfo.blue[1], 'blue')}
                            {`(${renderTotalScore(courtInfo.blue[0], courtInfo.blue[1])})`}
                        </div>
                    </>
                )}
            </Card.Body>
            <Card.Body>
                <div className="court-actions">
                    {
                        (!courtInfo?.status || courtInfo.status === CourtStatus.Finished) && (
                            <div className="generate-court-container">
                                <Button onClick={handleGenerateCourt}>Generate</Button>
                            </div>
                        )
                    }
                    {
                        courtInfo?.status === CourtStatus.Playing && (
                            <div className="court-card__editing-container">
                                <Button onClick={() => setIsEditting(!isEditting)}>Edit</Button>
                            </div>
                        )
                    }
                    <div>
                        <Button
                            onClick={handleToggleCourtStatus}
                            disabled={!courtInfo?.status || courtInfo.status === CourtStatus.Finished}
                            variant={courtInfo?.status ? getCourtStatusButtonStyle(courtInfo.status) : 'primary'}
                        >
                            {courtStatusText}
                        </Button>
                    </div>
                </div>
            </Card.Body>
            <Card.Footer>
                <Button
                    onClick={() => handleRemoveLastRound(courtInfo?.courtIndex || 0)}
                    variant="danger"
                >
                    Remove
                </Button>
            </Card.Footer>
        </Card>
    )
}

export default CourtCard;