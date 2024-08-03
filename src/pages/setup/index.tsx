import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
// import PlayerSelection from '../../components/PlayerSelection'
import settings from '../../settings.json'

import './index.css'

const Setup = () => {
    // const [isSelectingAll, setIsSelectingAll] = useState<boolean>(false);
    // const [selecting, setSelecting] = useState<string[]>([])
    const [playersInput, setPlayersInput] = useState<string>('');
    const [court, setCourt] = useState<number>(0)

    const getPlayersFromText = (text: string) => {
        const playerRegex = /^\d+\.( ?)([^ ]+)/
        const rankRegex = /\((\d+)\)$/
        const players = playersInput.split('\n')
            .filter(line => line.match(playerRegex))
            .map(playerText => {
                // const playerName = playerText.replace(playerRegex, '').replace(rankRegex, '').trim()
                const playerName = playerText.match(playerRegex)?.[2].replace(rankRegex, '').trim()
                const injectedRank = Number(playerText.match(rankRegex)?.[1])
                const playerConfig = settings.playersConfig.find(p => p.name === playerName)
                const rank = isNaN(injectedRank) ? playerConfig?.rank : injectedRank 
                return {
                    name: playerName,
                    rank,
                    isGod: !!playerConfig?.isGod,
                }
            })
        return players
    }

    const courts = [1, 2, 3, 4]
    const players = getPlayersFromText(playersInput)
    const defaultRank = 3;
    const playersWithDefaultRank = players.map(player => ({ ...player, rank: player.rank || defaultRank }))

    return (
        <div className="setup">
            <h2>Input player to play</h2>
            <Form className="form-container">
                <div className="player-input-container">
                    <Form.Control as="textarea" onChange={e => setPlayersInput(e.target.value)} className="setup-textarea"/>
                    <div className="arrow-container">
                        <i className="arrow right" />
                    </div>
                    <div className="player-input-describe">
                        {players.map(player => (
                                <div className="player-describe-container">
                                    <span className="player-describe-name">{player.name}</span>
                                    <span>{player.rank ? <div className="icon-circle" /> : <div className="icon-close" />}</span>
                                </div>
                            )
                        )}
                    </div>
                </div>
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
                <Link to="/alonable" state={{ players: playersWithDefaultRank, court }}>
                    <Button>Submit</Button>
                </Link>
            </div>
        </div>
    )

    // return (
    //     <div className="setup">
    //         <h2>Choose player to play</h2>
    //         <PlayerSelection selectAll={true} players={settings.players} selecting={selecting} handleSelectPlayer={(players) => setSelecting(players)} />
    //         <h2>Courts</h2>
    //         <div className="courts-btn-container">
    //             {
    //                 courts.map(_court => (
    //                     <Button
    //                         className={`courts-btn ${_court === court ? 'btn-primary' : 'btn-secondary'}`}
    //                         onClick={() => setCourt(_court)}
    //                     >
    //                         {_court}
    //                     </Button>
    //                 ))
    //             }
    //         </div>
    //         <div className="button-container">
    //             <Link to="/alonable" state={{ players: selecting, court }}>
    //                 <Button>Submit</Button>
    //             </Link>
    //         </div>
    //     </div>
    // )
}

export default Setup;
