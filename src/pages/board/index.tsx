import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { cloneDeep } from 'lodash';
import { Button } from 'react-bootstrap'
import '../../App.css';
import PlayerSelection from '../../components/PlayerSelection';
import CourtSelection from '../../components/CourtSelection';
import ScoreSelection from '../../components/ScoreSelection';
import { BasePlayer } from '../../types';
import { generatePairMaps, generateBalanceCourts, generateNormalCourts, forcePlayerToRest } from './helper'
import { sendLog } from '../../services/log'

import './index.css'

interface Player extends BasePlayer {
  isAlonable: boolean
}

interface Court {
  red: string[]
  blue: string[]
}

interface Round {
  courts: Court[]
  rest: string[]
}

// const MAX_PLAYER_PER_COURT = 4

interface LocationState {
  players: Player[]
  court: number
}

interface PairMap {
  [name: string]: {
    [pairName: string]: number
  }
}

const Board = () => {
  const location = useLocation();
  const { players: _players, court: _courtCount } = location.state as LocationState;
  const [courtCount, setCoutCount] = useState(_courtCount);
  const [players, setPlayers] = useState(_players);
  const [isBalanceMode, setIsBalanceMode] = useState(false);

  useEffect(() => {
    if (_players.length === 0 || !courtCount) window.location.href = '/'
  }, [_players, courtCount])
  const [rounds, setRounds] = useState<Round[]>([])
  const [restPlayer, setRestPlayer] = useState<string[]>([])
  // const maxPlayers = courtCount * MAX_PLAYER_PER_COURT
  // const restPlayers = rounds.reduce((acc: string[], round) => [...acc, ...round.rest], [])
  // const restCount = players.reduce((acc: { [key: string]: string[] }, player) => {
  //   const playerName = player.name
  //   const playerRestCount = `${restPlayers.filter(restPlayer => restPlayer === playerName).length}`
  //   return { ...acc, [playerRestCount]: [...(acc[playerRestCount] || []), playerName] }
  // }, {})
  const pairMaps = generatePairMaps(players, rounds);

  const handleChangeScore = (playerName: string, newScore: number) => {
    const newPlayers = players.reduce<Player[]>((acc, player) => {
      if (player.name === playerName) {
        return [...acc, { ...player, rank: newScore }]
      }
      return [...acc, player]
    }, [])
    setPlayers(newPlayers)
  }

  const generateCourts = (players: Player[], rest: string[]) => {
    const playersWantToPlay = players.filter(player => !rest.includes(player.name))
    // const { playersToPlay, playersForcedToRest = [] } = getPlayerToPlay(players, rest)
    const { playersToPlay, playersForcedToRest = [] } = forcePlayerToRest(playersWantToPlay, courtCount, rounds)
    const playersRestThisRound = [...rest, ...playersForcedToRest]
    const logMessage = `Generate round - ${rounds.length + 1}`
    if (isBalanceMode) {
      const courts = generateBalanceCourts(playersToPlay)
      sendLog(logMessage, 'info', { court: JSON.stringify(courts), rest: JSON.stringify(playersRestThisRound) })
      setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: playersRestThisRound }])
    } else {
      const courts = generateNormalCourts(playersToPlay, pairMaps);
      sendLog(logMessage, 'info', { court: JSON.stringify(courts), rest: JSON.stringify(playersRestThisRound) })
      setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: playersRestThisRound }])
    }
    setRestPlayer([])
  }
  const removeLastRound = () => {
    const logMessage = 'Removing last round'
    sendLog(logMessage, 'info', { lastRound: JSON.stringify(rounds[rounds.length - 1]) })
    setRounds(rounds.slice(0, -1))
  }
  const toggleMode = () => {
    const newMode = !isBalanceMode
    const logMessage = 'Toggle mode'
    sendLog(logMessage, 'info', { mode: newMode === isBalanceMode ? 'Balance Mode' : 'Normal Mode'})
    setIsBalanceMode(newMode)
  }
  const reversedRounds = cloneDeep(rounds).reverse()

  return (
    <div className="App">
      <header className="App-header">
        <ScoreSelection players={players} handleChangeScore={handleChangeScore} />
        <div className="court-selection-container">
          <CourtSelection court={courtCount} handleChangeCourt={setCoutCount} />
        </div>
        <h2>{`Courts: ${courtCount}`}</h2>
        
        Player to rest:
        <PlayerSelection
          selectAll={false}
          players={players.map(player => player.name)}
          selecting={restPlayer}
          handleSelectPlayer={(_players) => setRestPlayer(_players)}
        />
        <div className="generate-play-container">
          <Button onClick={() => generateCourts(players, restPlayer)} className="generate-round-button">Generate Round</Button>
          <Button variant="danger" onClick={removeLastRound}>Remove Last Round</Button>
          <Button
            onClick={toggleMode}
            className="mode-button"
            variant={isBalanceMode ? 'warning' : 'light'}
          >
            {isBalanceMode ? 'Balance Mode' : 'Normal mode'}
          </Button>
        </div>
        {reversedRounds.map((round, index) => (
          <div key={`round-${index}`} className="round-container">
            <h3>{`Round - ${rounds.length - index}`}</h3>
            <p>Rest: {round.rest.join(',')}</p>
            {round.courts.map((court, courtIndex) => (
              <div key={`court-${courtIndex}`}>
                <div className={`table-box-container ${courtIndex % 2 === 1 ? 'table-box-container--odd' : ''}`}>
                  <div className="table-box">{`Court ${courtIndex + 1}`}</div>
                  <div className="table-box">{court.red[0]}</div>
                  <div className="table-box">{court.red[1]}</div>
                  <div className="table-box table-box--vs">vs</div>
                  <div className="table-box">{court.blue[0]}</div>
                  <div className="table-box">{court.blue[1]}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </header>
    </div>
  );
}

export default Board;
