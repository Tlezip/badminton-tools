import { useState } from 'react';
import { Button } from 'react-bootstrap'
import { Player, Round as IRound, PlayerTeam } from '../../pages/board/type';
import Court from '../Court';

interface Props {
    players: Player[]
    round: IRound;
    roundNumber: number;
    handleSwapPlayer: (courtIndex: number, playerTeam: PlayerTeam, playerIndex: number, playerToSwapWith: string) => void;
}

const Round: React.FC<Props> = ({ players, roundNumber, round, handleSwapPlayer }) => {
    console.log({ round });
    const [isEditting, setIsEditting] = useState<boolean>(false);

    const handleClickEdit = () => {
        if (isEditting) {
            setIsEditting(false);
        } else {
            setIsEditting(true);
        }
    }

    

    return (
        <div className="round-container">
            <Button
                className="edit-round-button"
                onClick={handleClickEdit}
                variant={isEditting ? 'warning' : 'primary'}
            >
                {isEditting ? 'Save' : 'Edit'}
            </Button>
              <h3>{`Round - ${roundNumber} (${round.mode})`}</h3>
              <p>Rest: {round.rest.join(',')}</p>
              {round.courts.map((court, courtIndex) => (
                  <Court
                    courtInfo={round.courtsInfo[courtIndex]}
                    isEditting={isEditting}
                    players={players}
                    court={court}
                    courtIndex={courtIndex}
                    key={`court-${courtIndex}`}
                    handleSwapPlayer={(playerTeam, playerIndex, playerToSwapWith) => handleSwapPlayer(courtIndex, playerTeam, playerIndex, playerToSwapWith)}
                  />
              ))}
        </div>
    );
};

export default Round;