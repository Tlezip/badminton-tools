import { Button, Card, Table } from "react-bootstrap";
import { IPlayer } from "../../types";
import { CourtStatus, IndependentCourtV3 } from "../../pages/board/type";
import { convertCourtsToPlayedMaps, mergeCourtWithCourtHistory } from "../../pages/board/helper";
import './index.css'

interface IProps {
    players: IPlayer[]
    courts: IndependentCourtV3[]
    courtHistory: IndependentCourtV3[]
    handleUpdateScore: (playerName: string, rank: number) => void
    handleUpdateResting: (playerName: string, isResting: boolean) => void
}

const PlayerManagement: React.FC<IProps> = ({ players, courts, courtHistory, handleUpdateScore, handleUpdateResting }) => {
    const playedMaps = convertCourtsToPlayedMaps(players, mergeCourtWithCourtHistory(courts, courtHistory))
    return (
        <Card>
            <Card.Body>
                <Card.Title>Player Management</Card.Title>
                <Table hover size="sm">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Played</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            players.map(player => {
                                const playedCount = Object.keys(playedMaps).find(playCount => playedMaps[playCount].includes(player.name))
                                const isPlaying = courts.find(court => court.status === CourtStatus.Playing && (court.red.includes(player.name) || court.blue.includes(player.name)))
                                return (
                                    <tr>
                                        <td>{player.name}</td>
                                        <td>
                                            <div className="player-management__rank-container">
                                                <Button variant="danger" size="sm" onClick={() => handleUpdateScore(player.name, player.rank - 1)}>-</Button>
                                                <div className="player-management__rank">
                                                    {player.rank}
                                                </div>
                                                <Button variant="primary" size="sm" onClick={() => handleUpdateScore(player.name, player.rank + 1)}>+</Button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="player-management__played">
                                                {playedCount}
                                            </div>
                                        </td>
                                        <td style={{ minWidth: 60 }}>{isPlaying ? 'Playing' : 'Idle'}</td>
                                        <td>
                                            <div className="player-management__actions-container">
                                                <Button
                                                    variant={player.isResting ? 'danger' : 'primary'}
                                                    onClick={() => handleUpdateResting(player.name, !player.isResting)}
                                                    style={{ minWidth: 70 }}
                                                >
                                                    {player.isResting ? 'Rest' : 'Ready'}
                                                </Button>
                                                {/* {player.isAlonable ? 'Alonable' : 'Not-Alonable'} */}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    )
}

export default PlayerManagement;
