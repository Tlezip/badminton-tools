import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { orderBy, sampleSize, cloneDeep, shuffle } from 'lodash';
// import logo from './logo.svg';
import Setup from './pages/setup'
import Alonable from './pages/alonable'
import Board from './pages/board'
import './App.css';

interface Player {
  name: string
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

enum Pages {
  PlayerSetup,
  AlonableSetup,
  Board
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="alonable" element={<Alonable />} />
        <Route path="board" element={<Board />} />
      </Routes>
    </BrowserRouter>
  )
  // const [currentPage, setCurrentPage] = useState<Pages>(Pages.PlayerSetup)
  // const [players, setPlayers] = useState<Player[]>([
  //   {
  //     name: "Tle",
  //     isAlonable: false
  //   },
  //   {
  //     name: "Micky",
  //     isAlonable: false
  //   },
  //   {
  //     name: "Champ",
  //     isAlonable: true
  //   },
  //   {
  //     name: "Pao",
  //     isAlonable: true
  //   },
  //   {
  //     name: "Korn",
  //     isAlonable: true
  //   },
  //   {
  //     name: "Mameaw",
  //     isAlonable: false
  //   },
  //   {
  //     name: "Opal",
  //     isAlonable: false
  //   },
  //   {
  //     name: "Fah",
  //     isAlonable: false
  //   },
  //   {
  //     name: "Aek",
  //     isAlonable: false
  //   },
  //   // {
  //   //   name: "Gem",
  //   //   isAlonable: false
  //   // },
  //   // {
  //   //   name: "Bas",
  //   //   isAlonable: false
  //   // },
  //   // {
  //   //   name: "Mock",
  //   //   isAlonable: false
  //   // },
  //   // {
  //   //   name: "Mock2",
  //   //   isAlonable: false
  //   // }
  // ])
  // const [rounds, setRounds] = useState<Round[]>([])
  // const [restPlayer, setRestPlayer] = useState('')
  // const getCourtCount = (playerCount: number) => {
  //   if (playerCount < 7) return 1
  //   if (playerCount < 10) return 2
  //   if (playerCount < 15) return 3
  //   return Math.ceil(playerCount / 4)
  // }
  // const courtCount = getCourtCount(players.length)
  // const maxPlayers = courtCount * MAX_PLAYER_PER_COURT
  // const restPlayers = rounds.reduce((acc: string[], round) => [...acc, ...round.rest], [])
  // const restCount = players.reduce((acc: { [key: string]: string[] }, player) => {
  //   const playerName = player.name
  //   const playerRest = `${restPlayers.filter(restPlayer => restPlayer === playerName).length}`
  //   return { ...acc, [playerRest]: [...(acc[playerRest] || []), playerName] }
  // }, {})
  // const pairMaps = rounds.reduce((acc: any, round) => {
  //   round.courts.forEach(court => {
  //     if (court.blue.length === 2) {
  //       acc[court.blue[0]].push(court.blue[1])
  //       acc[court.blue[1]].push(court.blue[2])
  //     }
  //     if (court.red.length === 2) {
  //       acc[court.red[0]].push(court.red[1])
  //       acc[court.red[1]].push(court.red[2])
  //     }
  //   })
  //   return acc
  // }, players.reduce((acc, player) => ({ ...acc, [player.name]: [] }), {}));
  // const getPlayerToPlay = (players: Player[], playersDecidedToRest: string[]) => {
  //   const playersWantToPlay = players.filter(player => !playersDecidedToRest.includes(player.name))
  //   const isPlayerExceed = playersWantToPlay.length > maxPlayers
  //   if (isPlayerExceed) {
  //     const exceedNumber = playersWantToPlay.length - maxPlayers
  //     const playersForcedToRest = orderBy(Object.keys(restCount)).reduce((acc: string[], key: string) => {
  //       const playerNames = restCount[key]
  //       if (acc.length < exceedNumber) return [...acc, ...sampleSize(playerNames, exceedNumber - acc.length)]
  //       return acc
  //     }, [])
  //     const playersToPlay = playersWantToPlay.filter(player => !playersForcedToRest.includes(player.name))
  //     return { playersToPlay, playersForcedToRest }
  //   }
  //   return { playersToPlay: playersWantToPlay, playersForcedToRest: [] }
  // }

  // const _getPairPlayers = (players: Player[]): any[] => {
  //   if (players.length > 0) {
  //     const firstPlayer = players[0]
  //     const maybePaired = players.filter(player => player.name !== firstPlayer.name && !pairMaps[firstPlayer.name].includes(player.name))
  //     if (maybePaired.length === 0) return []

  //     const pair = sampleSize(maybePaired, 1)[0]
  //     return [[firstPlayer.name, pair.name], ..._getPairPlayers(players.filter(player => player.name !== firstPlayer.name && player.name !== pair.name))]
  //   }

  //   return []
  // }

  // const getPairPlayers = (players: Player[]): any[] => {
  //   let pairs = _getPairPlayers(players)
  //   let count = 0
  //   while (pairs.length !== players.length / 2 && count < 500) {
  //     console.log('regenerating pair ', count)
  //     pairs = _getPairPlayers(players)
  //     count++
  //   }
  //   if (count === 500) {
  //     throw new Error('Cannot find unique pair')
  //   }
  //   return pairs
  // }

  // const buildCourtFromPairs = (pairs: any[]) => {
  //   const shuffledPairs = shuffle(pairs)
  //   const courts = shuffledPairs.reduce((acc, pair, index) => {
  //     if (index % 2 === 0) return [...acc, { red: pair }]
  //     if (index % 2 === 1) {
  //       acc[acc.length - 1].blue = pair
  //       return acc
  //     }
  //   }, [])
  //   return courts
  // }

  // const generateCourts = (players: Player[], rest: string[]) => {
  //   const { playersToPlay, playersForcedToRest = [] } = getPlayerToPlay(players, rest)
    
  //   try {
  //     if (playersToPlay.length % 4 === 0) { // FULL ALL COURT
  //       const pairs = getPairPlayers(playersToPlay)
  //       const courts = buildCourtFromPairs(pairs)
  //       setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: [...rest, ...playersForcedToRest] }])
  //     } else {
  //       const alonablePlayers = playersToPlay.filter(player => player.isAlonable)

  //       if (playersToPlay.length % 4 === 2) {
  //         let alonePlayers = sampleSize(alonablePlayers, 2)
  //         if (alonePlayers.length < 2) {
  //           const notAlonablePlayer = playersToPlay.filter(player => !player.isAlonable)
  //           const additionalAlonePlayers = sampleSize(notAlonablePlayer, 2 - alonePlayers.length)
  //           alonePlayers = [...alonePlayers, ...additionalAlonePlayers]
  //         }
  //         const pairs = getPairPlayers(playersToPlay.filter(player => !alonePlayers.find(alonePlayer => alonePlayer.name === player.name)))
  //         const courts = [
  //           {
  //             red: [alonePlayers[0].name],
  //             blue: [alonePlayers[1].name]
  //           },
  //           ...buildCourtFromPairs(pairs)
  //         ]
  //         setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: [...rest, ...playersForcedToRest] }])
  //       }

  //       if (playersToPlay.length % 4 === 3) {
  //         let alonePlayers = sampleSize(alonablePlayers, 1)
  //         if (alonePlayers.length !== 1) {
  //           alonePlayers = sampleSize(playersToPlay, 1)
  //         }
  //         const pairs = getPairPlayers(playersToPlay.filter(player => !alonePlayers.find(alonePlayer => alonePlayer.name === player.name)))
  //         const [firstPair, ...restPairs] = pairs
  //         const courts = [
  //           {
  //             red: [alonePlayers[0].name],
  //             blue: [firstPair[0], firstPair[1]]
  //           },
  //           ...buildCourtFromPairs(restPairs)
  //         ]
  //         setRounds((prevRounds) => [...prevRounds, { courts: courts, rest: [...rest, ...playersForcedToRest] }])
  //       }
  //     }
  //   } catch (error: any) {
  //     alert(error.message)
  //     if (error.message === "Cannot find unique pair") {
  //       setRounds([])
  //     }
  //   }
  // }

  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <h2>{`Courts: ${courtCount}`}</h2>
  //       <h2>{`All ${players.length} Players : ${players.map(player => player.name).join(', ')}`}</h2>
  //       <h2>{`Alonable Players : ${players.filter(player => player.isAlonable).map(player => player.name).join(', ')}`}</h2>
  //       <button onClick={() => generateCourts(players, restPlayer.length > 0 ? restPlayer.split(',') : [])}>Generate Round</button>
  //       Player to rest: <input onChange={(e) => setRestPlayer(e.target.value)}></input>
  //       {rounds.reverse().map((round, index) => (
  //         <div>
  //           <h3>{`Round - ${rounds.length - index}`}</h3>
  //           <p>Rest: {round.rest.join(',')}</p>
  //           {round.courts.map((court, courtIndex) => (
  //             <div>
  //               <p>{`Court - ${courtIndex + 1} : ${court.red.join(',')} vs ${court.blue.join(',')}`}</p>
  //             </div>
  //           ))}
  //         </div>
  //       ))}
  //       <p>
  //         Edit <code>src/App.tsx</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );
}

export default App;
