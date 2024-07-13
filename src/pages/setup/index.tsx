import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import PlayerSelection from '../../components/PlayerSelection'
import settings from '../../settings.json'

import './index.css'

const Setup = () => {
    const [isSelectingAll, setIsSelectingAll] = useState<boolean>(false);
    const [selecting, setSelecting] = useState<string[]>([])
    const [court, setCourt] = useState<number>(0)

    const courts = [1, 2, 3, 4]

    return (
        <div className="setup">
            <h2>Choose player to play</h2>
            <PlayerSelection selectAll={true} players={settings.players} selecting={selecting} handleSelectPlayer={(players) => setSelecting(players)} />
            <h2>Courts</h2>
            <div className="courts-btn-container">
                {
                    courts.map(_court => (
                        <Button
                            className={`courts-btn ${_court === court ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setCourt(_court)}
                        >
                            {_court}
                        </Button>
                    ))
                }
            </div>
            <div className="button-container">
                <Link to="/alonable" state={{ players: selecting, court }}>
                    <Button>Submit</Button>
                </Link>
            </div>
        </div>
    )
}

export default Setup;
