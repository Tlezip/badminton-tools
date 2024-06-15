import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'

import '../setup/index.css'

interface LocationState {
    players: string[]
    court: number
}

const Alonable = () => {
    const location = useLocation();
    const { players, court } = location.state as LocationState;

    const [selecting, setSelecting] = useState<string[]>([])

    const handleSelectPlayer = (player: string) => {
        const isSelecting = selecting.includes(player)
        if (isSelecting) setSelecting(prev => prev.filter(_player => _player !== player))
        else setSelecting(prev => [...prev, player])
    }

    return (
        <div className="setup">
            <h2>Choose player who can play alone</h2>
            {
                players.map(player => {
                    const isSelecting = selecting.includes(player)
                    return (
                        <div>
                            <button style={{ width: 100 }} onClick={() => handleSelectPlayer(player)}>{player} {isSelecting ? '+' : '-'}</button>
                        </div>
                    )
                })
            }
            <div className="button-container">
                <Link to="/board" state={{ players: players.map(player => ({ name: player, isAlonable: selecting.includes(player) })), court }}>Submit</Link>
            </div>
        </div>
    )
}

export default Alonable
