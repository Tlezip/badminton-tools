import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { orderBy, sampleSize, shuffle, cloneDeep } from 'lodash';
import { Button } from 'react-bootstrap'
import '../../App.css';
import PlayerSelection from '../../components/PlayerSelection';
import CourtSelection from '../../components/CourtSelection';
import ScoreSelection from '../../components/ScoreSelection';
import { BasePlayer } from '../../types';

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

const MAX_PLAYER_PER_COURT = 4

interface LocationState {
  players: Player[]
  court: number
}

const Board = () => {
  const location = useLocation();
  const { players: _players, court: _courtCount } = location.state as LocationState;
  const [courtCount, setCoutCount] = useState(_courtCount);
  const [players, setPlayers] = useState(_players);
  console.log({ players })

  useEffect(() => {
    if (_players.length === 0 || !courtCount) window.location.href = '/'
  }, [_players, courtCount])
  const [rounds, setRounds] = useState<Round[]>([])
  const [restPlayer, setRestPlayer] = useState<string[]>([])
  const maxPlayers = courtCount * MAX_PLAYER_PER_COURT
  const restPlayers = rounds.reduce((acc: string[], round) => [...acc, ...round.rest], [])
  const restCount = players.reduce((acc: { [key: string]: string[] }, player) => {
    const playerName = player.name
    const playerRest = `${restPlayers.filter(restPlayer => restPlayer === playerName).length}`
    return { ...acc, [playerRest]: [...(acc[playerRest] || []), playerName] }
  }, {})
  const pairMaps = rounds.reduce((acc: any, round) => {
    round.courts.forEach(court => {
      if (court.blue.length === 2) {
        acc[court.blue[0]][court.blue[1]] += 1
        acc[court.blue[1]][court.blue[0]] += 1
      }
      if (court.red.length === 2) {
        acc[court.red[0]][court.red[1]] += 1
        acc[court.red[1]][court.red[0]] += 1
      }
    })
    return acc
  }, players.reduce((acc, player) => ({ ...acc, [player.name]: { ...players.filter(p2 => p2.name !== player.name).reduce((acc2, player2) => ({ ...acc2, [player2.name]: 0 }), {}) } }), {}));

  const getPlayerToPlay = (players: Player[], playersDecidedToRest: string[]) => {
    const playersWantToPlay = players.filter(player => !playersDecidedToRest.includes(player.name))
    const isPlayerExceed = playersWantToPlay.length > maxPlayers
    if (isPlayerExceed) {
      const exceedNumber = playersWantToPlay.length - maxPlayers
      const playersForcedToRest = orderBy(Object.keys(restCount)).reduce((acc: string[], key: string) => {
        const playerNames = restCount[key]
        const playersToRandomForceRest = playerNames.filter(name => !playersDecidedToRest.includes(name))
        if (acc.length < exceedNumber) return [...acc, ...sampleSize(playersToRandomForceRest, exceedNumber - acc.length)]
        return acc
      }, [])
      const playersToPlay = playersWantToPlay.filter(player => !playersForcedToRest.includes(player.name))
      return { playersToPlay, playersForcedToRest }
    }
    return { playersToPlay: playersWantToPlay, playersForcedToRest: [] }
  }

  const _getPairPlayers = (players: Player[]): any[] => {
    if (players.length > 0) {
      const firstPlayer = players[0]
      const maybePaired = players.filter(player => {
        const matchesCount: number[] = players.filter(_player => _player.name !== firstPlayer.name).map(_player => pairMaps[firstPlayer.name][_player.name])
        const leastMatchCount = matchesCount.length > 0 ? Math.min(...matchesCount) : 0
        const playerWithLeastCount = players.filter(_player => pairMaps[firstPlayer.name][_player.name] === leastMatchCount).map(_player => _player.name)
        return playerWithLeastCount.includes(player.name)
      })
      if (maybePaired.length === 0) return []

      const pair = sampleSize(maybePaired, 1)[0]
      return [[firstPlayer.name, pair.name], ..._getPairPlayers(players.filter(player => player.name !== firstPlayer.name && player.name !== pair.name))]
    }

    return []
  }

  const getPairPlayers = (players: Player[]): any[] => {
    let pairs = _getPairPlayers(players)
    let count = 0
    while (pairs.length !== players.length / 2 && count < 500) {
      pairs = _getPairPlayers(players)
      count++
    }
    if (count === 500) {
      throw new Error('Cannot find unique pair')
    }
    return pairs
  }

  const buildCourtFromPairs = (pairs: any[]) => {
    console.log({ pairs });
    const pairWithRank = pairs.map(pair => {
      const rank = pair.reduce((acc: number, player: string) => {
        const playerInfo = players.find(p => p.name === player)
        const playerRank = playerInfo?.rank || 0
        const playerRankWithGodEnhance = playerInfo?.isGod && pair.length === 1 ? playerRank * 2 : playerRank
        return acc + playerRankWithGodEnhance
      }, 0)
      return {
        pairs: pair,
        rank
      }
    })
    let orderedPairByRank = orderBy(pairWithRank, ['rank'], ['asc'])
    let courts2: any = []
    while (orderedPairByRank.length > 0) {
      if (orderedPairByRank.length % 2 === 0) {
        courts2.push({ red: orderedPairByRank[0].pairs })
        orderedPairByRank.shift()
      } else {
        const lowestPoint = orderedPairByRank[0].rank
        const lowestPairs = orderedPairByRank.filter(pair => pair.rank === lowestPoint)
        const shuffledPairs = shuffle(lowestPairs)
        const pickedPair = shuffledPairs[0].pairs
        courts2[courts2.length - 1].blue = pickedPair
        orderedPairByRank = orderedPairByRank.filter(pair => !(pair.pairs[0] === pickedPair[0] && pair.pairs[1] === pickedPair[1]))
      }
    }
    return courts2
    // const shuffledPairs = shuffle(pairs)
    // const courts = shuffledPairs.reduce((acc, pair, index) => {
    //   if (index % 2 === 0) return [...acc, { red: pair }]
    //   if (index % 2 === 1) {
    //     acc[acc.length - 1].blue = pair
    //     return acc
    //   }
    // }, [])
    // return courts
  }

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
    const { playersToPlay, playersForcedToRest = [] } = getPlayerToPlay(players, rest)
    
    try {
      if (playersToPlay.length % 4 === 0) { // FULL ALL COURT
        const pairs = getPairPlayers(playersToPlay)
        const courts = buildCourtFromPairs(pairs)
        setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: [...rest, ...playersForcedToRest] }])
      } else {
        const alonablePlayers = playersToPlay.filter(player => player.isAlonable)

        if (playersToPlay.length % 4 === 2) {
          let alonePlayers = sampleSize(alonablePlayers, 2)
          if (alonePlayers.length < 2) {
            const notAlonablePlayer = playersToPlay.filter(player => !player.isAlonable)
            const additionalAlonePlayers = sampleSize(notAlonablePlayer, 2 - alonePlayers.length)
            alonePlayers = [...alonePlayers, ...additionalAlonePlayers]
          }
          const pairs = getPairPlayers(playersToPlay.filter(player => !alonePlayers.find(alonePlayer => alonePlayer.name === player.name)))
          const courts = [
            {
              red: [alonePlayers[0].name],
              blue: [alonePlayers[1].name]
            },
            ...buildCourtFromPairs(pairs)
          ]
          setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: [...rest, ...playersForcedToRest] }])
        }

        if (playersToPlay.length % 4 === 3) {
          let alonePlayers = sampleSize(alonablePlayers, 1)
          if (alonePlayers.length !== 1) {
            alonePlayers = sampleSize(playersToPlay, 1)
          }
          const pairs = getPairPlayers(playersToPlay.filter(player => !alonePlayers.find(alonePlayer => alonePlayer.name === player.name)))
          const courts = buildCourtFromPairs([[alonePlayers[0].name], ...pairs])
          setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: [...rest, ...playersForcedToRest] }])
        }
      }
    } catch (error: any) {
      alert(error.message)
      if (error.message === "Cannot find unique pair") {
        setRounds([])
      }
    }
    setRestPlayer([])
  }
  const removeLastRound = () => {
    setRounds(rounds.slice(0, -1))
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
        <h2>{`All ${players.length} Players : ${players.map(player => player.name).join(', ')}`}</h2>
        <h2>{`Alonable Players : ${players.filter(player => player.isAlonable).map(player => player.name).join(', ')}`}</h2>
        <div className="generate-play-container">
          <Button onClick={() => generateCourts(players, restPlayer)} className="generate-round-button">Generate Round</Button>
          <Button variant="danger" onClick={removeLastRound}>Remove Last Round</Button>
        </div>
        Player to rest:
        <PlayerSelection
          selectAll={false}
          players={players.map(player => player.name)}
          selecting={restPlayer}
          handleSelectPlayer={(_players) => setRestPlayer(_players)}
        />
        {reversedRounds.map((round, index) => (
          <div key={`round-${index}`} className="round-container">
            <h3>{`Round - ${rounds.length - index}`}</h3>
            <p>Rest: {round.rest.join(',')}</p>
            {round.courts.map((court, courtIndex) => (
              <div key={`court-${courtIndex}`}>
                <p>{`Court - ${courtIndex + 1} : ${court.red.join(',')} vs ${court.blue.join(',')}`}</p>
              </div>
            ))}
          </div>
        ))}
      </header>
    </div>
  );
}

export default Board;
