import { sampleSize, shuffle, orderBy, last } from 'lodash'
import { Player, Court, PairMap, Pair, Round, PlayerTeam, IndependentCourt, IndependentCourtV3, CourtStatus } from './type'
import { IPlayer, Team } from '../../types'
import settings from '../../settings.json'

const buildBalanceCourtFromPlayers = (players: Player[], pairMaps: PairMap): Court => {
    const playerCount = players.length
    if (playerCount === 4) {
        const pairs = getPairPlayers(players, pairMaps)
        return {
            red: [pairs[0][0], pairs[0][1]],
            blue: [pairs[1][0], pairs[1][1]]
        }
    }
    if (playerCount === 3) {
        const alonablePlayers = players.filter(player => player.isAlonable)
        let alonePlayers = sampleSize(alonablePlayers, 1)
        if (alonePlayers.length !== 1) {
            alonePlayers = sampleSize(players, 1)
        }
        const alonePlayer = alonePlayers[0]
        const others = players.filter(player => player.name !== alonePlayer.name)
        return {
            red: [alonePlayer.name],
            blue: [others[0].name, others[1].name]
        }
    }
    return {
        red: [players[0].name],
        blue: [players[1].name]
    }
}

export const generateBalanceCourts = (players: Player[], pairMaps: PairMap) => {
    const playersL = players.filter(player => player.rank >= 8)
    const playersM = players.filter(player => player.rank >= 6 && player.rank <= 7)
    const playersS = players.filter(player => player.rank < 6)
    const playersGroup = [playersS, playersM, playersL]
    const playersEachCourt = playersGroup.reduce<Player[][]>(
        (acc, playerGroup) => {
            const shuffledPlayers = shuffle(playerGroup);

            shuffledPlayers.forEach((player) => {
                const isCourtEmpty = acc.length === 0
                const isLastCourtFull = acc.length > 0 && acc[acc.length - 1].length === 4
                if (isCourtEmpty || isLastCourtFull) {
                    acc.push([player])
                } else if (acc[acc.length - 1].length !== 4) {
                    acc[acc.length - 1].push(player)
                }
            })
            return acc;
        },
    [])
    const courts = playersEachCourt.reduce<Court[]>((acc, _playersEachCourt) => {
        return [...acc, buildBalanceCourtFromPlayers(_playersEachCourt, pairMaps)]
    }, []);

    return courts;
}

const checkIfPairRepeatly = (pairs: Pair[], pairMaps: PairMap) => {
    const vallidPairs = pairs.reduce((acc, pair) => {
      const firstPlayerOfPair = pair[0]
      const secondPlayerOfPair = pair[1]
      const leastCount = Math.min(...Object.values(pairMaps[firstPlayerOfPair]))
      const validPair = pairMaps[firstPlayerOfPair][secondPlayerOfPair] === leastCount
      if (!validPair) console.log('repeated pair', { pair })
      return acc && validPair
    }, true)
    return !vallidPairs;
}

const _getPairPlayers = (players: Player[], pairMaps: PairMap): any[] => {
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
      return [[firstPlayer.name, pair.name], ..._getPairPlayers(players.filter(player => player.name !== firstPlayer.name && player.name !== pair.name), pairMaps)]
    }

    return []
}

const getPairPlayers = (players: Player[], pairMaps: PairMap): Pair[] => {
    let pairs = _getPairPlayers(players, pairMaps)
    let count = 0
    while (checkIfPairRepeatly(pairs, pairMaps) && count < 50) {
      console.log('pair is repeated, regenerating... ', count)
      pairs = _getPairPlayers(players, pairMaps)
      count++
    }
    return pairs
}

const buildCourtFromPairs = (players: Player[], pairs: Pair[]): Court[] => {
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
    let courts: any = []
    while (orderedPairByRank.length > 0) {
      if (orderedPairByRank.length % 2 === 0) {
        courts.push({ red: orderedPairByRank[0].pairs })
        orderedPairByRank.shift()
      } else {
        const lowestPoint = orderedPairByRank[0].rank
        const lowestPairs = orderedPairByRank.filter(pair => pair.rank === lowestPoint)
        const shuffledPairs = shuffle(lowestPairs)
        const pickedPair = shuffledPairs[0].pairs
        courts[courts.length - 1].blue = pickedPair
        orderedPairByRank = orderedPairByRank.filter(pair => !(pair.pairs[0] === pickedPair[0] && pair.pairs[1] === pickedPair[1]))
      }
    }
    return courts
}

export const generateNormalCourts = (players: Player[], pairMaps: PairMap, teams: Team[]) => {
    console.log({ players })
    const filteredPlayers = players.filter(player => {
        const hasTeam = teams.find(team => team.pairs.includes(player.name))
        return !hasTeam
    })
    const remainPlayerCount = players.length % 4
    const pairsFromTeam = teams.map(team => team.pairs)
    if (remainPlayerCount === 0) {
        const pairs = getPairPlayers(filteredPlayers, pairMaps)
        const courts = buildCourtFromPairs(players, [...pairs, ...pairsFromTeam])
        return courts
    }
    const alonablePlayers = filteredPlayers.filter(player => player.isAlonable)
    if (remainPlayerCount === 3) {
        let alonePlayers = sampleSize(alonablePlayers, 1)
        if (alonePlayers.length !== 1) {
            alonePlayers = sampleSize(filteredPlayers, 1)
        }
        const alonePlayer = alonePlayers[0]
        const otherPlayers = filteredPlayers.filter(player => player.name !== alonePlayer.name)
        const pairs = [[alonePlayer.name], ...getPairPlayers(otherPlayers, pairMaps), ...pairsFromTeam]
        const courts = buildCourtFromPairs(players, pairs)
        return courts
    }
    let alonePlayers = sampleSize(alonablePlayers, 2)
    if (alonePlayers.length < 2) {
        const notAlonablePlayer = filteredPlayers.filter(player => !player.isAlonable)
        const additionalAlonePlayers = sampleSize(notAlonablePlayer, 2 - alonePlayers.length)
        alonePlayers = [...alonePlayers, ...additionalAlonePlayers]
    }
    const otherPlayers = filteredPlayers.filter(player => !alonePlayers.find(alonePlayer => alonePlayer.name === player.name))
    const pairs = getPairPlayers(otherPlayers, pairMaps)
    const courts = [
        {
        red: [alonePlayers[0].name],
        blue: [alonePlayers[1].name]
        },
        ...buildCourtFromPairs(players, [...pairs, ...pairsFromTeam]),
    ]
    return courts
}

const buildRandomCourtFromPairs = (pairs: Pair[]): Court[] => {
    const shuffled = shuffle(pairs)
    const courts = shuffled.reduce<Court[]>((acc, pair) => {
        if (acc.length === 0 || acc[acc.length-1].blue.length > 0) {
            return [...acc, { red: pair, blue: [] }]
        }
        acc[acc.length - 1].blue = pair
        return acc
    }, [])
    return courts
}

export const generateRandomCourt = (players: Player[], pairMaps: PairMap, teams: Team[]) => {
    const filteredPlayers = players.filter(player => {
        const hasTeam = teams.find(team => team.pairs.includes(player.name))
        return !hasTeam
    })
    const remainPlayerCount = players.length % 4
    const pairsFromTeam = teams.map(team => team.pairs)
    if (remainPlayerCount === 0) {
        const pairs = getPairPlayers(filteredPlayers, pairMaps)
        const courts = buildRandomCourtFromPairs([...pairs, ...pairsFromTeam])
        return courts
    }
    const alonablePlayers = filteredPlayers.filter(player => player.isAlonable)
    if (remainPlayerCount === 3) {
        let alonePlayers = sampleSize(alonablePlayers, 1)
        if (alonePlayers.length !== 1) {
            alonePlayers = sampleSize(filteredPlayers, 1)
        }
        const alonePlayer = alonePlayers[0]
        const otherPlayers = filteredPlayers.filter(player => player.name !== alonePlayer.name)
        const pairs = [[alonePlayer.name], ...getPairPlayers(otherPlayers, pairMaps), ...pairsFromTeam]
        const courts = buildRandomCourtFromPairs(pairs)
        return courts
    }
    let alonePlayers = sampleSize(alonablePlayers, 2)
    if (alonePlayers.length < 2) {
        const notAlonablePlayer = filteredPlayers.filter(player => !player.isAlonable)
        const additionalAlonePlayers = sampleSize(notAlonablePlayer, 2 - alonePlayers.length)
        alonePlayers = [...alonePlayers, ...additionalAlonePlayers]
    }
    const otherPlayers = filteredPlayers.filter(player => !alonePlayers.find(alonePlayer => alonePlayer.name === player.name))
    const pairs = getPairPlayers(otherPlayers, pairMaps)
    const courts = [
        {
        red: [alonePlayers[0].name],
        blue: [alonePlayers[1].name]
        },
        ...buildRandomCourtFromPairs([...pairs, ...pairsFromTeam]),
    ]
    return courts
}

const getPlayerScore = (playerName: string, players: Player[]) => {
    return players.find(player => player.name === playerName)?.rank || 0
};

export const shouldBalanceCourt = (court: Court, players: Player[]) => {
    const threshold = 6;
    const redScore = getPlayerScore(court.red[0], players) + getPlayerScore(court.red[1], players)
    const blueScore = getPlayerScore(court.blue[0], players) + getPlayerScore(court.blue[1], players)
    return Math.abs(redScore - blueScore) >= threshold;
};

export const balanceCourt = (court: Court, players: Player[]) => {
    const courtPlayerNames = [...court.red, ...court.blue]
    const courtPlayers = players.filter(player => courtPlayerNames.includes(player.name))
    const scores = courtPlayers.map(player => player.rank)
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const playerWithMaxScore = sampleSize(courtPlayers.filter(player => player.rank === maxScore), 1)[0]
    const playerWithMinScore = sampleSize(courtPlayers.filter(player => player.rank === minScore), 1)[0]
    const redTeam = [playerWithMaxScore.name, playerWithMinScore.name]
    const blueTeam = courtPlayerNames.filter(playerName => playerName !== playerWithMaxScore.name && playerName !== playerWithMinScore.name)
    return {
        ...court,
        red: redTeam,
        blue: blueTeam
    }
};

export const generatePairMapsByCourts = (players: Player[], courts: Court[]) => {
    const initialPairMaps = players.reduce(
        (acc, currentPlayer) => {
            const otherPlayers = players.filter(player => player.name !== currentPlayer.name)
            const currentPlayerPairMap = otherPlayers.reduce((pairMapAcc, otherPlayer) => ({ ...pairMapAcc, [otherPlayer.name]: 0 }), {})
            return {
                ...acc,
                [currentPlayer.name]: currentPlayerPairMap
            }
        },
        {}
    )
    return courts.reduce<PairMap>((acc, court) => {
        if (court.blue.length === 2) {
            acc[court.blue[0]][court.blue[1]] += 1
            acc[court.blue[1]][court.blue[0]] += 1
        }
        if (court.red.length === 2) {
            acc[court.red[0]][court.red[1]] += 1
            acc[court.red[1]][court.red[0]] += 1
        }
        return acc
    }, initialPairMaps);
}

export const generatePairMaps = (players: Player[], rounds: Round[]) => {
    const initialPairMaps = players.reduce(
        (acc, currentPlayer) => {
            const otherPlayers = players.filter(player => player.name !== currentPlayer.name)
            const currentPlayerPairMap = otherPlayers.reduce((pairMapAcc, otherPlayer) => ({ ...pairMapAcc, [otherPlayer.name]: 0 }), {})
            return {
                ...acc,
                [currentPlayer.name]: currentPlayerPairMap
            }
        },
        {}
    )
    return rounds.reduce<PairMap>((acc, round) => {
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
    }, initialPairMaps);
}

export const convertCourtsToPlayedMaps = (players: Player[], courts: Court[]) => {
    const playedPlayers = courts.reduce<string[]>((acc, court) => {
        return [
            ...acc,
            ...court.blue,
            ...court.red
        ]
    }, [])
    const playedMaps = players.reduce<{ [x: string]: string[] }>((acc, player) => {
        const playerName = player.name
        const playerPlayedCount = `${playedPlayers.filter(playedPlayer => playedPlayer === playerName).length}`
        return { ...acc, [playerPlayedCount]: [...(acc[playerPlayedCount] || []), playerName] }
    }, {})
    return playedMaps;
}

export const convertRoundsToRestMaps = (players: Player[], rounds: Round[]) => {
    const restPlayers = rounds.reduce((acc: string[], round) => [...acc, ...round.rest], [])
    const restMaps = players.reduce((acc: { [key: string]: string[] }, player) => {
        const playerName = player.name
        const playerRestCount = `${restPlayers.filter(restPlayer => restPlayer === playerName).length}`
        return { ...acc, [playerRestCount]: [...(acc[playerRestCount] || []), playerName] }
    }, {})
    return restMaps;
}

export const forcePlayerToRestByPlayedMaps = (players: Player[], courtCount: number, playedMaps: { [x: string]: string[] }) => {
    const MAX_PLAYER_PER_COURT = 4
    const maxPlayersCount = courtCount * MAX_PLAYER_PER_COURT
    const isPlayerExceed = players.length > maxPlayersCount
    if (isPlayerExceed) {
        const exceedNumber = players.length - maxPlayersCount
        const orderedPlayedCounts = orderBy(Object.keys(playedMaps).map(Number), [], ['desc'])
        const playersForcedToRest = orderedPlayedCounts.reduce((acc: string[], key: number) => {
            const playersToRandomForceRest = playedMaps[key]
            if (acc.length < exceedNumber) return [...acc, ...sampleSize(playersToRandomForceRest, exceedNumber - acc.length)]
            return acc
        }, [])
        const playersToPlay = players.filter(player => !playersForcedToRest.includes(player.name))
        return { playersToPlay, playersForcedToRest }
    }
    return { playersToPlay: players, playersForcedToRest: [] }
}

export const forcePlayerToRestByPlayedMapsV3 = (players: Player[], courtCount: number, playedMaps: { [x: string]: string[] }) => {
    const MAX_PLAYER_PER_COURT = 4
    const maxPlayersCount = courtCount * MAX_PLAYER_PER_COURT
    const isPlayerExceed = players.length > maxPlayersCount;
    const isPlayerNotEnough = players.length % 4 === 1;
    if (isPlayerExceed) {
        const exceedNumber = players.length - maxPlayersCount
        const orderedPlayedCounts = orderBy(Object.keys(playedMaps).map(Number), [], ['desc'])
        const playersForcedToRest = orderedPlayedCounts.reduce((acc: string[], key: number) => {
            const playersToRandomForceRest = playedMaps[key]
            if (acc.length < exceedNumber) return [...acc, ...sampleSize(playersToRandomForceRest, exceedNumber - acc.length)]
            return acc
        }, [])
        const playersToPlay = players.filter(player => !playersForcedToRest.includes(player.name))
        return { playersToPlay, playersForcedToRest }
    }
    if (isPlayerNotEnough) {
        const exceedNumber = 1
        const orderedPlayedCounts = orderBy(Object.keys(playedMaps).map(Number), [], ['desc'])
        const playersForcedToRest = orderedPlayedCounts.reduce((acc: string[], key: number) => {
            const playersToRandomForceRest = playedMaps[key]
            if (acc.length < exceedNumber) return [...acc, ...sampleSize(playersToRandomForceRest, exceedNumber - acc.length)]
            return acc
        }, [])
        const playersToPlay = players.filter(player => !playersForcedToRest.includes(player.name))
        return { playersToPlay, playersForcedToRest }
    }
    return { playersToPlay: players, playersForcedToRest: [] }
}

export const forcePlayerToRest = (players: Player[], courtCount: number, restMaps: { [x: string]: string[] }) => {
    const MAX_PLAYER_PER_COURT = 4
    const maxPlayersCount = courtCount * MAX_PLAYER_PER_COURT
    const isPlayerExceed = players.length > maxPlayersCount
    if (isPlayerExceed) {
        const exceedNumber = players.length - maxPlayersCount
        const playersForcedToRest = orderBy(Object.keys(restMaps)).reduce((acc: string[], key: string) => {
            const playersToRandomForceRest = restMaps[key]
            if (acc.length < exceedNumber) return [...acc, ...sampleSize(playersToRandomForceRest, exceedNumber - acc.length)]
            return acc
        }, [])
        const playersToPlay = players.filter(player => !playersForcedToRest.includes(player.name))
        return { playersToPlay, playersForcedToRest }
    }
    return { playersToPlay: players, playersForcedToRest: [] }
}

interface PlayerSeatInformation {
  courtIndex: number;
  team: PlayerTeam;
  playerIndex: number;
}

export const getRoundAfterSwapPlayer = (round: Round, swapToCourtIndex: number, swapToPlayerTeam: PlayerTeam, swapToPlayerIndex: number, playerToSwapWith: string): Round => {
    const clonedRound = { ...round };
    const isTargetResting = clonedRound.rest.includes(playerToSwapWith);
    const playerInCurrentSeat = clonedRound.courts[swapToCourtIndex][swapToPlayerTeam][swapToPlayerIndex];
    const isEmptySeat = !playerInCurrentSeat;

    if (!playerToSwapWith) {
        if (!playerInCurrentSeat) return round;
        clonedRound.courts[swapToCourtIndex][swapToPlayerTeam] = clonedRound.courts[swapToCourtIndex][swapToPlayerTeam].filter(player => player !== playerInCurrentSeat);
        clonedRound.rest = [...clonedRound.rest, playerInCurrentSeat];
        return clonedRound;
    }

    if (isTargetResting) {
        clonedRound.courts[swapToCourtIndex][swapToPlayerTeam][swapToPlayerIndex] = playerToSwapWith;
        const restWithoutTargetPlayer = clonedRound.rest.filter(restPlayer => restPlayer !== playerToSwapWith);
        clonedRound.rest = isEmptySeat ? restWithoutTargetPlayer : [...restWithoutTargetPlayer, playerInCurrentSeat];
        return clonedRound;
    }
    const formattedPlayerInformation = clonedRound.courts.reduce<{ [k: string]: PlayerSeatInformation }>((acc, court, _courtIndex) => {
    const formattedPlayerInformationRedTeam = court.red.reduce((accRed, player, _playerIndex) => ({
        ...accRed,
        [player]: {
        courtIndex: _courtIndex,
        team: 'red',
        playerIndex: _playerIndex,
        },
    }), {});
    const formattedPlayerInformationBlueTeam = court.blue.reduce((accBlue, player, _playerIndex) => ({
        ...accBlue,
        [player]: {
        courtIndex: _courtIndex,
        team: 'blue',
        playerIndex: _playerIndex,
        },
    }), {});
    return {
        ...acc,
        ...formattedPlayerInformationRedTeam,
        ...formattedPlayerInformationBlueTeam,
    }
    }, {});
    const previousTargetSeat = formattedPlayerInformation[playerToSwapWith];

    if (isEmptySeat) {
        clonedRound.courts[previousTargetSeat.courtIndex][previousTargetSeat.team] = clonedRound.courts[previousTargetSeat.courtIndex][previousTargetSeat.team].filter(playerName => playerName !== playerToSwapWith);
    } else {
        clonedRound.courts[previousTargetSeat.courtIndex][previousTargetSeat.team][previousTargetSeat.playerIndex] = playerInCurrentSeat;
    }
    clonedRound.courts[swapToCourtIndex][swapToPlayerTeam][swapToPlayerIndex] = playerToSwapWith;
    return clonedRound;
}

export const getPlayersFromText = (text: string): IPlayer[] => {
    const playerRegex = /^\d+\.( ?)+(.*)/
    const rankRegex = /\((\d+)\)$/
    const metadataSeparatorRegex = /-+\n/
    const formattedPlayersInput = last(text.split(metadataSeparatorRegex)) || ''
    const defaultRank = 5;
    const players = formattedPlayersInput.split('\n')
        .filter(line => line.match(playerRegex)?.[2])
        .map(playerText => {
            // const playerName = playerText.replace(playerRegex, '').replace(rankRegex, '').trim()
            const playerName = playerText.match(playerRegex)?.[2].replace(rankRegex, '').trim()
            const injectedRank = Number(playerText.match(rankRegex)?.[1])
            const playerConfig = settings.playersConfig.find(p => p.name === playerName)
            const rank = isNaN(injectedRank) ? playerConfig?.rank : injectedRank 
            return {
                name: playerName || '',
                rank: rank || defaultRank,
                isGod: !!playerConfig?.isGod,
                isAlonable: false,
            }
        })
    return players
}

export const createIndependentCourt = (): IndependentCourtV3 => {
    return {
        status: CourtStatus.NotStarted,
        red: [],
        blue: []
    }
}

export const getPlayingCourts = (courts: IndependentCourtV3[]) => {
    return courts.filter(court => court.status === CourtStatus.Playing)
}

export const convertNormalCourtsToIndependentCourts = (courts: Court[]): IndependentCourtV3[] => {
    return courts.map(court => ({ ...court, status: CourtStatus.Playing }))
}

export const mergeCourtWithCourtHistory = (courts: IndependentCourtV3[], courtHistory: IndependentCourtV3[]) => [...courts, ...courtHistory]

export const getPlayerRank = (players: IPlayer[], playerName: string) => players.find(_player => _player.name === playerName)?.rank || 0

export const getCourtsWithSwappedPlayers = (firstPlayer: string, secondPlayer: string, courts: IndependentCourtV3[]): IndependentCourtV3[] => {
    const isFirstPlayerPlaying = courts.find(court => court.status === CourtStatus.Playing && (court.red.includes(firstPlayer) || court.blue.includes(firstPlayer)))
    const isSecondPlayerPlaying = courts.find(court => court.status === CourtStatus.Playing && (court.red.includes(secondPlayer) || court.blue.includes(secondPlayer)))

    if (!isFirstPlayerPlaying && !isSecondPlayerPlaying) return courts
    if (!isFirstPlayerPlaying && isSecondPlayerPlaying) {
        return courts.map(court => {
            if (court.red.includes(secondPlayer) || court.blue.includes(secondPlayer)) {
                return {
                    ...court,
                    red: court.red.map(redPlayer => redPlayer === secondPlayer ? firstPlayer : redPlayer),
                    blue: court.blue.map(bluePlayer => bluePlayer === secondPlayer ? firstPlayer : bluePlayer)
                }
            }
            return court
        })
    }
    if (isFirstPlayerPlaying && !isSecondPlayerPlaying) {
        return courts.map(court => {
            if (court.red.includes(firstPlayer) || court.blue.includes(firstPlayer)) {
                return {
                    ...court,
                    red: court.red.map(redPlayer => redPlayer === firstPlayer ? secondPlayer : redPlayer),
                    blue: court.blue.map(bluePlayer => bluePlayer === firstPlayer ? secondPlayer : bluePlayer)
                }
            }
            return court
        })
    }
    if (isFirstPlayerPlaying && isSecondPlayerPlaying) {
        const isSameTeam = courts.find(court => (court.red.includes(firstPlayer) && court.red.includes(secondPlayer)) || (court.blue.includes(firstPlayer) && court.blue.includes(secondPlayer)))
        if (isSameTeam) return courts

        return courts.map(court => {
            return {
                ...court,
                red: court.red.map(redPlayer => {
                    if (redPlayer === firstPlayer) return secondPlayer
                    if (redPlayer === secondPlayer) return firstPlayer
                    return redPlayer
                }),
                blue: court.blue.map(bluePlayer => {
                    if (bluePlayer === firstPlayer) return secondPlayer
                    if (bluePlayer === secondPlayer) return firstPlayer
                    return bluePlayer
                })
            }
        })
    }
    return courts
}