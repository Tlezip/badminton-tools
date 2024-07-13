import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap'

import './index.css'

interface PlayerSelection {
    selectAll: boolean
    players: string[]
    selecting: string[]
    handleSelectPlayer: React.Dispatch<React.SetStateAction<string[]>>
}

const PlayerSelection: React.FC<PlayerSelection> = ({ selectAll, players, selecting, handleSelectPlayer }) => {
    const [isSelectingAll, setIsSelectingAll] = useState<boolean>(false);

    const handleClickCheckBox = () => {
        handleSelectPlayer(isSelectingAll ? [] : players)
        setIsSelectingAll(prev => !prev)
    }

    const handleClickButton = (player: string) => {
        const isSelecting = selecting.includes(player)
        if (isSelecting) handleSelectPlayer(prev => prev.filter(_player => _player !== player))
        else handleSelectPlayer(prev => [...prev, player])
    }

    return (
        <div>
            {
                selectAll && (
                    <div className="checkbox-container">
                        <Form.Check type="checkbox" label="Select All" onChange={handleClickCheckBox}/>
                    </div>
                )
            }
            <div className="player-selection">
                {
                    players.map(player => {
                        const isSelecting = selecting.includes(player)
                        return (
                            <div key={player} className="palyer-container">
                                <Button
                                    style={{ width: 100 }}
                                    onClick={() => handleClickButton(player)}
                                    className={`player ${isSelecting ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {player}
                                </Button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default PlayerSelection