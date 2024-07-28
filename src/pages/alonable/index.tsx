import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import PlayerSelection from '../../components/PlayerSelection'
import { BasePlayer } from '../../types'

import '../setup/index.css'

interface LocationState {
    players: BasePlayer[]
    court: number
}

const Alonable = () => {
    const location = useLocation();
    const { players, court } = location.state as LocationState;
    const [selecting, setSelecting] = useState<string[]>([])

    return (
        <div className="setup">
            <h2>Choose player who can play alone</h2>
            <PlayerSelection selectAll={false} players={players.map(p => p.name)} selecting={selecting} handleSelectPlayer={(players) => setSelecting(players)}/>
            <div className="button-container">
                <Link to="/board" state={{ players: players.map(player => ({ ...player, isAlonable: selecting.includes(player.name) })), court }}>Submit</Link>
            </div>
        </div>
    )
}

export default Alonable
