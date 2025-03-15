import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { cloneDeep, shuffle, times } from 'lodash';
import { Button } from 'react-bootstrap'
import '../../App.css';
import PlayerSelection from '../../components/PlayerSelection';
import CourtSelection from '../../components/CourtSelection';
import ScoreSelection from '../../components/ScoreSelection';
import { BasePlayer,  CourtInfo, Team } from '../../types';
import { generatePairMaps, generateBalanceCourts, generateNormalCourts, forcePlayerToRest, getRoundAfterSwapPlayer } from './helper'
import { sendLog } from '../../services/log'
import { Round as IRound, PlayerTeam } from './type';
import Round from '../../components/Round'

import './index.css'

interface Player extends BasePlayer {
  isAlonable: boolean
}

// const MAX_PLAYER_PER_COURT = 4

interface LocationState {
  players: Player[]
  court: number
}

const Board = () => {
  const location = useLocation();
  const { players: _players, court: _courtCount } = location.state as LocationState;
  const [courtsInfo, setCourtsInfo] = useState<Array<CourtInfo>>([...Array(_courtCount).keys()].map(courtIndex => ({ name: `${courtIndex + 1}` })))
  const [players, setPlayers] = useState(_players);
  const [isBalanceMode, setIsBalanceMode] = useState(false);
  const [edittingIndex, setEdittingIndex] = useState<number>(-1);
  const courtCount = courtsInfo.length

  useEffect(() => {
    if (_players.length === 0 || !courtCount) window.location.href = '/'
  }, [_players, courtCount])
  const [rounds, setRounds] = useState<IRound[]>([])
  const [restPlayer, setRestPlayer] = useState<string[]>([])
  const maximumTeam = Math.ceil(players.length / 2);
  const initializeTeam = times(maximumTeam, index => ({
        teamId: index + 1,
        pairs: []
    }))
  const [teams, setTeams] = useState<Team[]>(initializeTeam);
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

  const generateCourts = (players: Player[], rest: string[], teams: Team[]) => {
    const playersWantToPlay = players.filter(player => !rest.includes(player.name))
    const { playersToPlay, playersForcedToRest = [] } = forcePlayerToRest(playersWantToPlay, courtCount, rounds)
    const playersRestThisRound = [...rest, ...playersForcedToRest]
    const logMessage = `Generate round - ${rounds.length + 1}`
    const currentMode = isBalanceMode ? 'balance' : 'normal'
    if (isBalanceMode) {
      const courts = shuffle(generateBalanceCourts(playersToPlay, pairMaps))
      sendLog(logMessage, 'info', { court: JSON.stringify(courts), rest: JSON.stringify(playersRestThisRound) })
      setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: playersRestThisRound, courtsInfo, mode: currentMode }])
    } else {
      const filteredTeams = teams.filter(team => {
          const isTeamFull = team.pairs.length === 2
          const teamAbleToPlay = team.pairs.every((_playerName: string) => playersToPlay.find(player => player.name === _playerName))
          return isTeamFull && teamAbleToPlay
      })
      const courts = shuffle(generateNormalCourts(playersToPlay, pairMaps, filteredTeams));
      sendLog(logMessage, 'info', { court: JSON.stringify(courts), rest: JSON.stringify(playersRestThisRound) })
      setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: playersRestThisRound, courtsInfo, mode: currentMode }])
    }
    // setRestPlayer([])
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

  const handleToggleTeam = (playerName: string) => {
      const currentTeam = teams.find(team => team.pairs.includes(playerName))
      const nextAvailableTeam = teams.find(team => {
          if (!currentTeam) return team.pairs.length < 2
          return team.pairs.length === 1 && team.teamId !== currentTeam.teamId
      }) as Team
      if (!currentTeam) {
          setTeams((prevTeam) => {
              const newTeam = [...prevTeam]
              newTeam.find(team => team.teamId === nextAvailableTeam.teamId)?.pairs.push(playerName)
              return newTeam
          })
      } else {
          if (!nextAvailableTeam) {
              setTeams((prevTeam) => {
                  const newTeam = [...prevTeam]
                  const teamIndex = newTeam.findIndex(team => team.teamId === currentTeam.teamId)
                  newTeam[teamIndex].pairs = currentTeam.pairs.filter(_playerName => _playerName !== playerName)
                  return newTeam
              })
          } else {
              setTeams((prevTeam) => {
                  const newTeam = [...prevTeam]
                  const teamIndex = newTeam.findIndex(team => team.teamId === currentTeam.teamId)
                  newTeam[teamIndex].pairs = currentTeam.pairs.filter(_playerName => _playerName !== playerName)
                  newTeam.find(team => team.teamId === nextAvailableTeam.teamId)?.pairs.push(playerName)
                  return newTeam
              })
          }
      }
  }

  const reversedRounds = cloneDeep(rounds).reverse()

  const handleSwapPlayer = (roundIndex: number, courtIndex: number, playerTeam: PlayerTeam, playerIndex: number, playerToSwapWith: string) => {
    setRounds((prevRounds) => {
      const newRound = getRoundAfterSwapPlayer(prevRounds[roundIndex], courtIndex, playerTeam, playerIndex, playerToSwapWith);
      prevRounds[roundIndex] = newRound;
      return [...prevRounds];
    })
  }

  return (
    <div className="App">
      <div className="App-header">
        <ScoreSelection players={players} handleChangeScore={handleChangeScore} teams={teams} handleToggleTeam={handleToggleTeam} />
        <div className="court-selection-container">
          <CourtSelection courtsInfo={courtsInfo} handleChangeCourtsInfo={setCourtsInfo} />
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
          <Button onClick={() => generateCourts(players, restPlayer, teams)} className="generate-round-button">Generate Round</Button>
          <Button variant="danger" onClick={removeLastRound}>Remove Last Round</Button>
          <Button
            onClick={toggleMode}
            className="mode-button"
            variant={isBalanceMode ? 'warning' : 'light'}
          >
            {isBalanceMode ? 'Balance Mode' : 'Normal mode'}
          </Button>
        </div>
        {reversedRounds.map((round, index) => {
          const roundIndex = rounds.length - index - 1;
          return (
            <Round
              players={players}
              round={round}
              roundNumber={rounds.length - index}
              key={`round-${index}`}
              handleSwapPlayer={(courtIndex, playerTeam, playerIndex, playerToSwapWith) => handleSwapPlayer(roundIndex, courtIndex, playerTeam, playerIndex, playerToSwapWith)}
            />
          )
        })}
      </div>
    </div>
  );
}

export default Board;
