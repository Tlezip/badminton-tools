import { sampleSize, shuffle, orderBy } from 'lodash'
import { Player, Court, PairMap, Pair, Round } from './type'
import { Team } from '../../types'

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
    const filteredTeams = teams.filter(team => {
        const isTeamFull = team.pairs.length === 2
        const teamAbleToPlay = team.pairs.every((_playerName: string) => players.find(player => player.name === _playerName))
        return isTeamFull && teamAbleToPlay
    })
    const filteredPlayers = players.filter(player => {
        const hasTeam = filteredTeams.find(team => team.pairs.includes(player.name))
        return !hasTeam
    })
    const remainPlayerCount = players.length % 4
    const pairsFromTeam = filteredTeams.map(team => team.pairs)
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

export const forcePlayerToRest = (players: Player[], courtCount: number, rounds: Round[]) => {
    const MAX_PLAYER_PER_COURT = 4
    const maxPlayersCount = courtCount * MAX_PLAYER_PER_COURT
    const isPlayerExceed = players.length > maxPlayersCount
    if (isPlayerExceed) {
        const restPlayers = rounds.reduce((acc: string[], round) => [...acc, ...round.rest], [])
        const restMaps = players.reduce((acc: { [key: string]: string[] }, player) => {
            const playerName = player.name
            const playerRestCount = `${restPlayers.filter(restPlayer => restPlayer === playerName).length}`
            return { ...acc, [playerRestCount]: [...(acc[playerRestCount] || []), playerName] }
        }, {})

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