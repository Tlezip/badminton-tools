import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { BasePlayer } from '../../types';
import bas from '../../bas.png';
import './index.css'

interface Props {
    players: BasePlayer[];
    handleChangeScore: (playerName: string, newScore: number) => void;
}

const ScoreSelection: React.FC<Props> = ({ players, handleChangeScore }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    }
    const handleClose = () => {
        setIsOpen(false);
    }
    const handleChange = (playerName: string, newScore: number) => {
        handleChangeScore(playerName, newScore)
    }

    return (
        <div>
            <a onClick={handleOpen} className="bas-container">
                <img src={bas} className="App-logo" alt="logo" />
            </a>
            <Modal show={isOpen} onHide={handleClose}>
                <Modal.Body>
                    <div className="players-container">
                        {
                            players.map(player => (
                                <div className="player-container">
                                    <div>{player.name}</div>
                                    <div className="player-rank-container">
                                        <Button variant="danger" size="sm" onClick={() => handleChange(player.name, player.rank - 1)}>-</Button>
                                        <div className="player-rank-text">
                                            {player.rank}
                                        </div>
                                        <Button variant="primary" size="sm" onClick={() => handleChange(player.name, player.rank + 1)}>+</Button>
                                    </div>
                                </div>
                            ))
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