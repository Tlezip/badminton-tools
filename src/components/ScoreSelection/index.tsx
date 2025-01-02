import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { times } from 'lodash'
import { BasePlayer, Team } from '../../types';
import bas from '../../bas.png';
import './index.css'

interface Props {
    players: BasePlayer[];
    teams: Team[];
    handleChangeScore: (playerName: string, newScore: number) => void;
    handleToggleTeam: (playerName: string) => void;
}

const ScoreSelection: React.FC<Props> = ({ players, teams, handleChangeScore, handleToggleTeam }) => {
    // const maximumTeam = Math.ceil(players.length / 2);
    // const initializeTeam = times(maximumTeam, index => ({
    //     teamId: index + 1,
    //     pairs: []
    // }))
    const [isOpen, setIsOpen] = useState(false);
    // const [teams, setTeams] = useState<Team[]>(initializeTeam);

    const handleOpen = () => {
        setIsOpen(true);
    }
    const handleClose = () => {
        setIsOpen(false);
    }
    const handleChange = (playerName: string, newScore: number) => {
        handleChangeScore(playerName, newScore)
    }
    // const handleToggleTeam = (playerName: string) => {
    //     const currentTeam = teams.find(team => team.pairs.includes(playerName))
    //     const nextAvailableTeam = teams.find(team => {
    //         if (!currentTeam) return team.pairs.length < 2
    //         return team.pairs.length === 1 && team.teamId !== currentTeam.teamId
    //     }) as Team
    //     if (!currentTeam) {
    //         setTeams((prevTeam) => {
    //             const newTeam = [...prevTeam]
    //             newTeam.find(team => team.teamId === nextAvailableTeam.teamId)?.pairs.push(playerName)
    //             return newTeam
    //         })
    //     } else {
    //         if (!nextAvailableTeam) {
    //             setTeams((prevTeam) => {
    //                 const newTeam = [...prevTeam]
    //                 const teamIndex = newTeam.findIndex(team => team.teamId === currentTeam.teamId)
    //                 newTeam[teamIndex].pairs = currentTeam.pairs.filter(_playerName => _playerName !== playerName)
    //                 return newTeam
    //             })
    //         } else {
    //             setTeams((prevTeam) => {
    //                 const newTeam = [...prevTeam]
    //                 const teamIndex = newTeam.findIndex(team => team.teamId === currentTeam.teamId)
    //                 newTeam[teamIndex].pairs = currentTeam.pairs.filter(_playerName => _playerName !== playerName)
    //                 newTeam.find(team => team.teamId === nextAvailableTeam.teamId)?.pairs.push(playerName)
    //                 return newTeam
    //             })
    //         }
    //     }
    // }

    return (
        <div>
            <a onClick={handleOpen} className="bas-container">
                <img src={bas} className="App-logo" alt="logo" />
            </a>
            <Modal show={isOpen} onHide={handleClose}>
                <Modal.Body>
                    <div className="players-container">
                        {
                            players.map(player => {
                                const currentTeam = teams.find(team => team.pairs.includes(player.name))?.teamId
                                return (
                                    <div className="player-container" key={player.name}>
                                        <div>{player.name}</div>
                                        <div className="player-rank-container">
                                            <Button variant={currentTeam ? 'success' : 'secondary'} size="sm" onClick={() => handleToggleTeam(player.name)} className="team-selection">{currentTeam ? `Team ${currentTeam}` : 'No Team'}</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleChange(player.name, player.rank - 1)}>-</Button>
                                            <div className="player-rank-text">
                                                {player.rank}
                                            </div>
                                            <Button variant="primary" size="sm" onClick={() => handleChange(player.name, player.rank + 1)}>+</Button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose} variant="danger">Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ScoreSelection;