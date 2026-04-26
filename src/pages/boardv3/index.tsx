import { useState } from 'react'
import Header from '../../components/Header';
import PlayerSetup from '../../components/PlayerSetup';
import PlayerManagement from '../../components/PlayerManagement';
import CourtV3 from '../../components/CourtV3';
import Footer from '../../components/Footer';
import { IPlayer, Mode } from '../../types';
import './index.css';
import { CourtStatus, IndependentCourtV3 } from '../board/type';
import { balanceCourt, convertCourtsToPlayedMaps, convertNormalCourtsToIndependentCourts, createIndependentCourt, forcePlayerToRestByPlayedMaps, forcePlayerToRestByPlayedMapsV3, generateBalanceCourts, generateNormalCourts, generatePairMapsByCourts, generateRandomCourt, getCourtsWithSwappedPlayers, getPlayingCourts, mergeCourtWithCourtHistory, shouldBalanceCourt } from '../../pages/board/helper';
import { shuffle } from 'lodash';


const BoardV3 = () => {
    const [mode, setMode] = useState<Mode>(Mode.Normal)
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [courts, setCourts] = useState<IndependentCourtV3[]>([createIndependentCourt()]);
    const [courtHistory, setCourtHistory] = useState<IndependentCourtV3[]>([]);

    const handleChangeCourtCount = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const courtCount = Number(event.target.value);
        if (courtCount > courts.length) {
            const differenceCourtCount = courtCount - courts.length
            const newCourts = [...Array(differenceCourtCount)].map(createIndependentCourt)
            setCourts([...courts, ...newCourts])
        }
        else if (courtCount < courts.length) {
            setCourts((prevCourts) => {
                return prevCourts.slice(0, courtCount)
            })
        }
    }

    const generateAllAvailableCourts = () => {
        const availableCourtIndexes = courts.reduce<number[]>((acc, court, courtIndex) => {
            if (court.status === CourtStatus.NotStarted || court.status === CourtStatus.Finished) {
                return [...acc, courtIndex];
            }
            return acc;
        }, []);
        const availableCourtCount = availableCourtIndexes.length
        const playingPlayers = getPlayingCourts(courts).reduce<string[]>((acc, court) => [...acc, ...court.red, ...court.blue], [])
        const restPlayers: string[] = players.filter(player => player.isResting).map(player => player.name)
        const unAvailablePlayers = [...restPlayers, ...playingPlayers];
        const availablePlayers = players.filter(player => !unAvailablePlayers.includes(player.name))
        const playedMaps = convertCourtsToPlayedMaps(availablePlayers, mergeCourtWithCourtHistory(courts, courtHistory))
        const { playersToPlay, playersForcedToRest = [] } = forcePlayerToRestByPlayedMapsV3(availablePlayers, availableCourtCount, playedMaps)

        const courtsWithHistory = [...courts, ...courtHistory]
        const pairMaps = generatePairMapsByCourts(players, courtsWithHistory);

        if (mode === Mode.Normal) {
            const generatedCourts = generateNormalCourts(playersToPlay, pairMaps, []);
            const balancedCourts = convertNormalCourtsToIndependentCourts(generatedCourts.map(court => {
                if (shouldBalanceCourt(court, players)) return balanceCourt(court, players)
                    return court
            }))
            setCourts((prevCourts) => {
                balancedCourts.forEach((court, index) => {
                    const courtIndex = availableCourtIndexes[index]
                    prevCourts[courtIndex] = court
                })
                return [...prevCourts]
            })
        }
        if (mode === Mode.Random) {
            const generatedCourts = convertNormalCourtsToIndependentCourts(generateRandomCourt(playersToPlay, pairMaps, []))
            setCourts((prevCourts) => {
                generatedCourts.forEach((court, index) => {
                    const courtIndex = availableCourtIndexes[index]
                    prevCourts[courtIndex] = court
                })
                return [...prevCourts]
            })
        }
        if (mode === Mode.Balanced) {
            const balanceCourts = generateBalanceCourts(playersToPlay, pairMaps)
            const generatedCourts = shuffle(balanceCourts)
            const balancedCourts = convertNormalCourtsToIndependentCourts(generatedCourts.map(court => {
                if (shouldBalanceCourt(court, players)) return balanceCourt(court, players)
                    return court
            }))
            setCourts((prevCourts: IndependentCourtV3[]) => {
                balancedCourts.forEach((court, index) => {
                    const courtIndex = availableCourtIndexes[index]
                    prevCourts[courtIndex] = court
                })
                return [...prevCourts]
            })
        }
    }

    const finishAllPlayingCourts = () => {
        const playingCourts = getPlayingCourts(courts)
        setCourts((prevCourts) => {
            const newCourts = prevCourts.map(court => {
                if (court.status === CourtStatus.Playing) {
                    return createIndependentCourt()
                }
                return court
            })
            return [...newCourts]
        })
        setCourtHistory([...courtHistory, ...playingCourts])
    }

    const finishCourt = (courtIndex: number) => {
        const courtToFinish = courts[courtIndex]
        setCourts((prevCourts) => {
            prevCourts[courtIndex] = createIndependentCourt();
            return [...prevCourts]
        })
        setCourtHistory([...courtHistory, courtToFinish])
    }

    const handleSwapPlayers = (firstPlayer: string, secondPlayer: string, courts: IndependentCourtV3[]) => {
        const newCourts = getCourtsWithSwappedPlayers(firstPlayer, secondPlayer, courts)
        setCourts(newCourts)
    }

    const handleExtractPlayers = (players: IPlayer[]) => setPlayers(players)

    const handleUpdateScore = (playerName: string, rank: number) => {
        setPlayers((prevPlayers) => {
            const newPlayers = prevPlayers.map(player => ({
                ...player,
                rank: player.name === playerName ? rank : player.rank
            }))
            return [...newPlayers];
        })
    }

    const handleUpdateResting = (playerName: string, isResting: boolean) => {
        setPlayers((prevPlayers) => {
            const newPlayers = prevPlayers.map(player => ({
                ...player,
                isResting: player.name === playerName ? isResting : player.isResting
            }))
            return [...newPlayers];
        })
    }

    return (
        <div className="board-v3">
            <Header />
            <div className="board-v3__content-container">
                <div className="board-v3__left-content-container">
                    <PlayerSetup onExtractPlayers={handleExtractPlayers} />
                </div>
                <div className="board-v3__right-content-container">
                    <div className="board-v3__player-management-container">
                        <PlayerManagement players={players} courts={courts} courtHistory={courtHistory} handleUpdateScore={handleUpdateScore} handleUpdateResting={handleUpdateResting} />
                    </div>
                    <CourtV3
                        currentMode={mode}
                        players={players}
                        courts={courts}
                        handleChangeCourtCount={handleChangeCourtCount}
                        generateAllAvailableCourts={generateAllAvailableCourts}
                        finishAllPlayingCourts={finishAllPlayingCourts}
                        handleSwapPlayers={handleSwapPlayers}
                        finishCourt={finishCourt}
                        handleSetMode={setMode}
                    />
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default BoardV3;
