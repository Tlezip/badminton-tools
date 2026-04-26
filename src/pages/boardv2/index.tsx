import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { times, shuffle } from 'lodash';
import { useLocation } from 'react-router-dom'
import ScoreSelection from '../../components/ScoreSelection';
import CourtCard from '../../components/CourtCard';
import PlayerSelection from '../../components/PlayerSelection';
import CourtSelection from '../../components/CourtSelection';
import { BasePlayer,  CourtInfo, Team } from '../../types';
import { generateBalanceCourts, generateNormalCourts, convertCourtsToPlayedMaps, forcePlayerToRestByPlayedMaps, generatePairMapsByCourts, shouldBalanceCourt, balanceCourt } from '../board/helper'
import { IndependentCourt, CourtStatus } from '../board/type';

import './index.css'
import HistoriesCard from '../../components/HistoriesCard';

interface Player extends BasePlayer {
    isAlonable: boolean
}

interface LocationState {
    players: Player[]
    court: number
}

const BoardV2 = () => {
    const location = useLocation();
    const { players: _players, court: _courtCount } = location.state as LocationState;
    const [courtsInfo, setCourtsInfo] = useState<Array<CourtInfo>>([...Array(_courtCount).keys()].map(courtIndex => ({ name: `${courtIndex + 1}` })))
    const [players, setPlayers] = useState(_players);
    const maximumTeam = Math.ceil(players.length / 2);
    const initializeTeam = times(maximumTeam, index => ({
        teamId: index + 1,
        pairs: []
    }))
    const [teams, setTeams] = useState<Team[]>(initializeTeam);
    const [courts, setCourts] = useState<IndependentCourt[]>([]);
    const [restPlayer, setRestPlayer] = useState<string[]>([])
    const [isBalanceMode, setIsBalanceMode] = useState(false);

    const handleChangeScore = (playerName: string, newScore: number) => {
        const newPlayers = players.reduce<Player[]>((acc, player) => {
          if (player.name === playerName) {
            return [...acc, { ...player, rank: newScore }]
          }
          return [...acc, player]
        }, [])
        setPlayers(newPlayers)
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

    const pairMaps = generatePairMapsByCourts(players, courts);

    const generateCourt = (courtIndexes: number[]) => {
        const playingCourts = courts.filter(court => court.status === CourtStatus.Playing);
        const playingPlayers = playingCourts.reduce<string[]>((acc, playingCourt) => [...acc, ...playingCourt.blue, ...playingCourt.red], [])
        const playersWantToPlay = players.filter(player => ![...restPlayer, ...playingPlayers].includes(player.name))
        const playedMaps = convertCourtsToPlayedMaps(playersWantToPlay, courts)
        const courtToGenerate = courtIndexes.length
        const { playersToPlay, playersForcedToRest = [] } = forcePlayerToRestByPlayedMaps(playersWantToPlay, courtToGenerate, playedMaps)
        console.log({ playersToPlay, playersWantToPlay, playedMaps })
        if (isBalanceMode) {
            // const balanceCourts = generateBalanceCourts(playersToPlay, pairMaps)
            // const court = shuffle(balanceCourts)[0]
            // setCourts((prevCourts: IndependentCourt[]) => {
            //     const generatedCourt: IndependentCourt = {
            //         ...court,
            //         courtIndex,
            //         status: CourtStatus.Playing
            //     }
            //     return [...prevCourts, generatedCourt]
            // })
        } else {
            const filteredTeams = teams.filter(team => {
                const isTeamFull = team.pairs.length === 2
                const teamAbleToPlay = team.pairs.every((_playerName: string) => playersToPlay.find(player => player.name === _playerName))
                return isTeamFull && teamAbleToPlay
            })
            const generatedCourts = generateNormalCourts(playersToPlay, pairMaps, filteredTeams);
            const balancedCourts = generatedCourts.map(court => {
                if (shouldBalanceCourt(court, players)) return balanceCourt(court, players)
                    return court
            })
            setCourts((prevCourts: IndependentCourt[]) => {
                const _generatedCourts = balancedCourts.map((generatedCourt, index) => ({
                    ...generatedCourt,
                    courtIndex: courtIndexes[index],
                    status: CourtStatus.Playing
                }))
                return [...prevCourts, ..._generatedCourts]
            })
        }
    }

    const generateAllAvailableCourts = () => {
        const playingCourts = courts.filter(court => court.status === CourtStatus.Playing);
        const playingCourtsIndexes = playingCourts.map(playingCourt => playingCourt.courtIndex)
        const availableCourtIndexes = courtsInfo.map((_, courtIndex) => courtIndex).filter(courtIndex => !playingCourtsIndexes.includes(courtIndex))
        generateCourt(availableCourtIndexes)
    }

    const generateAllBalanceCourts = () => {
        const playersWantToPlay = players.filter(player => ![...restPlayer].includes(player.name))
        const playedMaps = convertCourtsToPlayedMaps(playersWantToPlay, courts)
        // courtsInfo.map(courtInfo => courtInfo.courtIndex)
        const courtIndexes = courtsInfo.map((_, courtIndex) => courtIndex)
        const courtToGenerate = courtsInfo.length
        // const courtToGenerate = courtIndexes.length
        const { playersToPlay, playersForcedToRest = [] } = forcePlayerToRestByPlayedMaps(playersWantToPlay, courtToGenerate, playedMaps)

        const balanceCourts = generateBalanceCourts(playersToPlay, pairMaps)
        const generatedCourts = shuffle(balanceCourts)
        const balancedCourts = generatedCourts.map(court => {
            if (shouldBalanceCourt(court, players)) return balanceCourt(court, players)
                return court
        })
        setCourts((prevCourts: IndependentCourt[]) => {
            const _generatedCourts = balancedCourts.map((generatedCourt, index) => ({
                ...generatedCourt,
                courtIndex: courtIndexes[index],
                status: CourtStatus.Playing
            }))
            return [...prevCourts, ..._generatedCourts]
        })
    }

    const getCurrentCourtIndex = (courtIndex: number) => {
        return courts.length - 1 - [...courts].reverse().findIndex(court => court.courtIndex === courtIndex);
    }

    const toggleCourtStatus = (courtIndex: number) => {
        setCourts((prevCourts) => {
            const currentCourtIndex = getCurrentCourtIndex(courtIndex)
            if (currentCourtIndex === -1) return [...prevCourts];
            const previousStatus = prevCourts[currentCourtIndex].status
            const nextStatus = previousStatus === CourtStatus.Finished ? CourtStatus.Playing : CourtStatus.Finished
            prevCourts[currentCourtIndex].status = nextStatus
            return [...prevCourts];
        })
    }

    const handleSwapPlayer = (firstPlayer: string, secondPlayer: string) => {
        const firstPlayerCourtIndex = courts.findIndex(court => court.status === CourtStatus.Playing && [...court.blue, ...court.red].includes(firstPlayer))
        const secondPlayerCourtIndex = courts.findIndex(court => court.status === CourtStatus.Playing && [...court.blue, ...court.red].includes(secondPlayer))
        const isFirstPlayerIdle = firstPlayerCourtIndex === -1
        const isSecondPlayerIdle = secondPlayerCourtIndex === -1
        const isBothPlayerPlaying = !isFirstPlayerIdle && !isSecondPlayerIdle

        if (isBothPlayerPlaying) {
            const firstPlayerTeam = courts[firstPlayerCourtIndex].blue.includes(firstPlayer) ? 'blue' : 'red'
            const secondPlayerTeam = courts[secondPlayerCourtIndex].blue.includes(secondPlayer) ? 'blue' : 'red'
            const isSameCourt = firstPlayerCourtIndex === secondPlayerCourtIndex;
            const isSameTeam = firstPlayerTeam === secondPlayerTeam;
            if (isSameCourt && isSameTeam) return
            if (isSameCourt) {
                setCourts((prevCourts) => {
                    prevCourts[firstPlayerCourtIndex][firstPlayerTeam] = prevCourts[firstPlayerCourtIndex][firstPlayerTeam].map(playerName => playerName === firstPlayer ? secondPlayer : playerName)
                    prevCourts[secondPlayerCourtIndex][secondPlayerTeam] = prevCourts[secondPlayerCourtIndex][secondPlayerTeam].map(playerName => playerName === secondPlayer ? firstPlayer : playerName)

                    return [...prevCourts]
                })
            } else {
                setCourts((prevCourts) => {
                    prevCourts[firstPlayerCourtIndex][firstPlayerTeam] = prevCourts[firstPlayerCourtIndex][firstPlayerTeam].map(playerName => playerName === firstPlayer ? secondPlayer : playerName)
                    prevCourts[secondPlayerCourtIndex][secondPlayerTeam] = prevCourts[secondPlayerCourtIndex][secondPlayerTeam].map(playerName => playerName === secondPlayer ? firstPlayer : playerName)

                    return [...prevCourts]
                })
            }
        } else if (isSecondPlayerIdle) {
            const firstPlayerTeam = courts[firstPlayerCourtIndex].blue.includes(firstPlayer) ? 'blue' : 'red'
            setCourts((prevCourts) => {
                prevCourts[firstPlayerCourtIndex][firstPlayerTeam] = prevCourts[firstPlayerCourtIndex][firstPlayerTeam].map(playerName => playerName === firstPlayer ? secondPlayer : playerName)

                return [...prevCourts]
            })
        } else {
            const secondPlayerTeam = courts[secondPlayerCourtIndex].blue.includes(secondPlayer) ? 'blue' : 'red'
            setCourts((prevCourts) => {
                prevCourts[secondPlayerCourtIndex][secondPlayerTeam] = prevCourts[secondPlayerCourtIndex][secondPlayerTeam].map(playerName => playerName === secondPlayer ? firstPlayer : playerName)

                return [...prevCourts]
            })
        }
    }

    const handleAddPlayerToCourt = (courtIndex: number, team: 'red' | 'blue', playerName: string) => {
        const playerCourtIndex = courts.findIndex(court => court.status === CourtStatus.Playing && [...court.blue, ...court.red].includes(playerName))
        const isPlayerIdle = playerCourtIndex === -1
        setCourts((prevCourts) => {
            if (!isPlayerIdle) {
                prevCourts[playerCourtIndex].red = prevCourts[playerCourtIndex].red.filter(player => player !== playerName)
                prevCourts[playerCourtIndex].blue = prevCourts[playerCourtIndex].blue.filter(player => player !== playerName)
            }

            const _courtIndex = prevCourts.findIndex(court => court.courtIndex === courtIndex && court.status === CourtStatus.Playing)
            prevCourts[_courtIndex][team] = prevCourts[_courtIndex][team].concat(playerName)
            return [...prevCourts]
        })
    }

    const handleDeletePlayerFromCourt = (courtIndex: number, team: 'red' | 'blue', playerName: string) => {
        setCourts((prevCourts) => {
            const _courtIndex = courts.findIndex(court => court.status === CourtStatus.Playing && court.courtIndex === courtIndex)
            prevCourts[_courtIndex][team] = prevCourts[_courtIndex][team].filter(player => player !== playerName)
            return [...prevCourts]
        })
    }
    
    const handleRemoveLastRound = (courtIndex: number) => {
        setCourts((prevCourts) => {
            const newCourts = prevCourts.filter(court => !(court.courtIndex === courtIndex && court.status === CourtStatus.Playing))
            return [...newCourts]
        })
    }

    const toggleMode = () => {
        const newMode = !isBalanceMode
        setIsBalanceMode(newMode)
    }

    const removeAllPlayingCourts = () => {
        const playingCourts = courts.filter(court => court.status === CourtStatus.Playing)
        const playingCourtsIndexes = playingCourts.map(playingCourt => playingCourt.courtIndex)
        playingCourtsIndexes.map(handleRemoveLastRound)
    }

    const finishAllPlayingCourts = () => {
        const playingCourts = courts.filter(court => court.status === CourtStatus.Playing)
        const playingCourtsIndexes = playingCourts.map(playingCourt => playingCourt.courtIndex)
        playingCourtsIndexes.map(toggleCourtStatus)
    }

    const playingCourts = courts.filter(court => court.status === CourtStatus.Playing);
    const playingPlayers = playingCourts.reduce<string[]>((acc, playingCourt) => [...acc, ...playingCourt.blue, ...playingCourt.red], [])
    const idlePlayers = players.filter(player => !playingPlayers.includes(player.name))

    return (
        <div className="App">
            <div className="App-header">
                <ScoreSelection players={players} handleChangeScore={handleChangeScore} teams={teams} handleToggleTeam={handleToggleTeam} />
                <div className="court-selection-container">
                    <CourtSelection courtsInfo={courtsInfo} handleChangeCourtsInfo={setCourtsInfo} />
                </div>
                Player to rest:
                <PlayerSelection
                    selectAll={false}
                    players={players.map(player => player.name)}
                    selecting={restPlayer}
                    handleSelectPlayer={(_players) => setRestPlayer(_players)}
                />
                {/* <div className="generate-play-container">
                    <Button
                    onClick={toggleMode}
                    className="mode-button"
                    variant={isBalanceMode ? 'warning' : 'light'}
                    >
                    {isBalanceMode ? 'Balance Mode' : 'Normal mode'}
                    </Button>
                </div> */}
                <div className="idle-players-container">
                    {`Idle Players: ${idlePlayers.map(player => player.name).join(', ')}`}
                </div>
                <div>
                    <Button onClick={generateAllAvailableCourts}>Generate All Available Courts</Button>
                    <Button onClick={generateAllBalanceCourts} variant='success' disabled={playingCourts.length > 0}>Generate All Balanced Courts</Button>
                </div>
                <div>
                    <Button onClick={removeAllPlayingCourts} variant='danger'>Remove All Playing Courts</Button>
                    <Button onClick={finishAllPlayingCourts} variant='success'>Finish All Playing Courts</Button>
                </div>
                <div className="courts-container">
                    {
                        courtsInfo.map((courtInfo, courtIndex) => {
                            const lastCourtInfo = [...courts].reverse().find(court => court.courtIndex === courtIndex);
                            return (
                                <CourtCard
                                    players={players}
                                    handleGenerateCourt={() => generateCourt([courtIndex])}
                                    handleToggleCourtStatus={() => toggleCourtStatus(courtIndex)}
                                    handleSwapPlayer={handleSwapPlayer}
                                    handleAddPlayerToCourt={(team, playerName) => handleAddPlayerToCourt(courtIndex, team, playerName)}
                                    handleDeletePlayerFromCourt={(team, playerName) => handleDeletePlayerFromCourt(courtIndex, team, playerName)}
                                    handleRemoveLastRound={handleRemoveLastRound}
                                    courtName={courtInfo.name}
                                    key={`${courtInfo.name}-${lastCourtInfo?.status}`}
                                    courtInfo={lastCourtInfo}
                                />
                            )
                        })
                    }
                </div>
                <div className="histories-container">
                    <HistoriesCard courts={courts} courtsInfo={courtsInfo} players={players} />
                </div>
            </div>
        </div>
    )
}

export default BoardV2
