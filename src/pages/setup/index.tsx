import { useState } from 'react'
import { Link } from 'react-router-dom'
import settings from '../../settings.json'

import './index.css'

const Setup = () => {
    const [isSelectingAll, setIsSelectingAll] = useState<boolean>(false);
    const [selecting, setSelecting] = useState<string[]>([])
    const [court, setCourt] = useState<number>(0)

    const handleClickCheckBox = () => {
        setSelecting(isSelectingAll ? [] : settings.players)
        setIsSelectingAll(prev => !prev)
    }

    const handleSelectPlayer = (player: string) => {
        const isSelecting = selecting.includes(player)
        if (isSelecting) setSelecting(prev => prev.filter(_player => _player !== player))
        else setSelecting(prev => [...prev, player])
    }

    return (
        <div className="setup">
            <h2>Choose player to play</h2>\
            <div className="checkbox-container">
                <input type="checkbox" onChange={handleClickCheckBox} />
                <label>Select All</label>
            </div>
            {
                settings.players.map(player => {
                    const isSelecting = selecting.includes(player)
                    return (
                        <div>
                            <button style={{ width: 100 }} onClick={() => handleSelectPlayer(player)}>{player} {isSelecting ? '+' : '-'}</button>
                        </div>
                    )
                })
            }
            <h2>Courts</h2>
            <input onChange={e => setCourt(Number(e.target.value))} />
            <div className="button-container">
                <Link to="/alonable" state={{ players: selecting, court }}>Submit</Link>
            </div>
        </div>
    )
}

export default Setup;
