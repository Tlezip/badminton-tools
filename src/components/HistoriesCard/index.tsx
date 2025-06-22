import { Card } from 'react-bootstrap';
import { IndependentCourt } from '../../pages/board/type';
import React from 'react';
import { CourtInfo } from '../../types';

interface IProps {
    courts: IndependentCourt[]
    courtsInfo: CourtInfo[]
}

const HistoriesCard: React.FC<IProps> = ({ courts, courtsInfo }) => {
    return (
        <Card>
            <Card.Header>Histories</Card.Header>
            <Card.Body>
                {
                    courts.map((court, index) => (
                        <div key={`court-${index}`}>
                            <p>{`Court - ${courtsInfo[court.courtIndex]?.name || 'None'} ${court.red} vs ${court.blue}`}</p>
                        </div>
                    ))
                }
            </Card.Body>
        </Card>
    )
}

export default HistoriesCard;