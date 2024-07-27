import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
import PlayerSelection from '../../components/PlayerSelection'
import settings from '../../settings.json'

import './index.css'

const Setup = () => {
    const [isSelectingAll, setIsSelectingAll] = useState<boolean>(false);
    const [selecting, setSelecting] = useState<string[]>([])
    const [playersInput, setPlayersInput] = useState<string>('');
    const [court, setCourt] = useState<number>(0)

    const getPlayersFromText = (text: string) => {
        const playerRegex = /^\d+./
        const players = playersInput.split('\n').filter(line => line.match(playerRegex)).map(playerText => playerText.replace(playerRegex, '').trim())
        return players
    }

    const courts = [1, 2, 3, 4]
    const players = getPlayersFromText(playersInput)

    return (
        <div className="setup">
            <h2>Input player to play</h2>
            <Form>
                <Form.Control as="textarea" onChange={e => setPlayersInput(e.target.value)} className="setup-textarea"/>
            </Form>
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
                <Link to="/alonable" state={{ players, court }}>
                    <Button>Submit</Button>
                </Link>
            </div>
        </div>
    )

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