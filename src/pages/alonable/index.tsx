import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
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
    const [boardVersion, setBoardVersion] = useState<number>(1);

    const triggerBoardVersion = () => {
        setBoardVersion((previousBoardVersion) => previousBoardVersion === 1 ? 2 : 1);
    }

    return (
        <div className="setup">
            <h2>Choose player who can play alone</h2>
            <PlayerSelection selectAll={false} players={players.map(p => p.name)} selecting={selecting} handleSelectPlayer={(players) => setSelecting(players)}/>
            <Button onClick={triggerBoardVersion}>{`Board V.${boardVersion}`}</Button>
            <div className="button-container">
                <Link to={boardVersion === 1 ? "/board" : "/board/v2"} state={{ players: players.map(player => ({ ...player, isAlonable: selecting.includes(player.name) })), court }}>Submit</Link>
            </div>
        </div>
    )
}

export default Alonable
