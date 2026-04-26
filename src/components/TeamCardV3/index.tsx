import React from 'react'
import { Card, Dropdown } from "react-bootstrap"
import { IPlayer } from '../../types';

const CustomToggle = React.forwardRef(({ children, onClick }: { children: React.ReactNode, onClick: () => void}) => (
    <div onClick={onClick}>{children}</div>
));

interface IProps {
    teamText: string
    cardBorder: string
    badgeBackground: string
    teamTextColor: string
    scoreColor: string
    score: number
    handleSwapPlayers: (firstPlayer: string, secondPlayer: string) => void
    players: IPlayer[]
    teamPlayers: string[]
}

const TeamCardV3: React.FC<IProps> = ({ teamText, cardBorder, badgeBackground, teamTextColor, scoreColor, score, handleSwapPlayers, players, teamPlayers }) => {
    return (
        <Card style={{ border: `1px solid ${cardBorder}` }}>
            <Card.Body>
                <div className="court-card-v3__tags-container">
                    <div className="court-card-v3__team-name-container" style={{ backgroundColor: badgeBackground, color: teamTextColor }}>{teamText}</div>
                    <div className="court-card-v3__rank-container" style={{ color: scoreColor }}>{`Score: ${score}`}</div>
                </div>
                {
                    teamPlayers.map(teamPlayer => {
                        const otherPlayers = players.filter(player => player.name !== teamPlayer)
                        return (
                            <Dropdown>
                                <Dropdown.Toggle as={CustomToggle}>
                                    <Card.Text as="p" style={{ margin: 0 }}>{teamPlayer}</Card.Text>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {
                                        otherPlayers.map(otherPlayer => <Dropdown.Item onClick={() => handleSwapPlayers(teamPlayer, otherPlayer.name)}>{otherPlayer.name}</Dropdown.Item>)
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        )
                    })
                }
            </Card.Body>
        </Card>
    )
}

export default TeamCardV3