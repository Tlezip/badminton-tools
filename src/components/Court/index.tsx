import { Dropdown } from 'react-bootstrap'
import { Court as ICourt, Player, PlayerTeam } from '../../pages/board/type';
import { CourtInfo } from '../../types';

interface Props {
    isEditting: boolean;
    players: Player[];
    courtInfo: CourtInfo;
    court: ICourt;
    courtIndex: number;
    handleSwapPlayer: (playerTeam: PlayerTeam, playerIndex: number, playerToSwapWith: string) => void
}

const Court: React.FC<Props> = ({ isEditting, players, courtInfo, court, courtIndex, handleSwapPlayer }) => {
    const renderCourtPlayer = (isEditting: boolean, playerName: string, playerTeam: PlayerTeam, playerIndex: number) => {
        if (!isEditting) return playerName
        const otherPlayers = players.filter(player => player.name !== playerName);

        return (
          <Dropdown>
            <Dropdown.Toggle variant='success'>
              {playerName || '-'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {
                otherPlayers.map(player => (
                  <Dropdown.Item onClick={() => handleSwapPlayer(playerTeam, playerIndex, player.name)}>{player.name}</Dropdown.Item>
                ))
              }
            </Dropdown.Menu>
          </Dropdown>
        )
    }

    return (
        <div className={`table-box-container ${courtIndex % 2 === 1 ? 'table-box-container--odd' : ''}`}>
            <div className="table-box">{`C.${courtInfo?.name || ''}`}</div>
            <div className="table-box">{renderCourtPlayer(isEditting, court.red[0], PlayerTeam.red, 0)}</div>
            <div className="table-box">{renderCourtPlayer(isEditting, court.red[1], PlayerTeam.red, 1)}</div>
            <div className="table-box table-box--vs">vs</div>
            <div className="table-box">{renderCourtPlayer(isEditting, court.blue[0], PlayerTeam.blue, 0)}</div>
            <div className="table-box">{renderCourtPlayer(isEditting, court.blue[1], PlayerTeam.blue, 1)}</div>
        </div>
    )
}

export default Court;
