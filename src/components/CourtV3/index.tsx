import React from 'react';
import { ButtonGroup, Button, Card, Form, ToggleButton } from 'react-bootstrap'
import CourtCardV3 from '../CourtCardV3';
import { IndependentCourtV3 } from '../../pages/board/type';
import './index.css'
import { IPlayer, Mode } from '../../types';

interface IProps {
    players: IPlayer[]
    courts: IndependentCourtV3[]
    handleChangeCourtCount: (event: React.ChangeEvent<HTMLSelectElement>) => void
    generateAllAvailableCourts: () => void
    finishAllPlayingCourts: () => void
    finishCourt: (courtIndex: number) => void
    handleSwapPlayers: (firstPlayer: string, secondPlayer: string, courts: IndependentCourtV3[]) => void
    currentMode: Mode
    handleSetMode: (mode: Mode) => void
}

const CourtV3: React.FC<IProps> = ({ players, courts, currentMode, handleChangeCourtCount, generateAllAvailableCourts, finishAllPlayingCourts, handleSwapPlayers, finishCourt, handleSetMode }) => {
    return (
        <Card>
            <Card.Body>
                <div className="court-v3__header-container">
                    <Card.Title>Court Assignments</Card.Title>
                    <div className="court-v3__court-selection-container">
                        <Form.Select onChange={handleChangeCourtCount}>
                            <option value={1}>1 Court</option>
                            <option value={2}>2 Courts</option>
                            <option value={3}>3 Courts</option>
                            <option value={4}>4 Courts</option>
                            <option value={5}>5 Courts</option>
                        </Form.Select>
                    </div>
                </div>
                <div className="court-v3__sub-header-container">
                    <ButtonGroup>
                        {[Mode.Normal, Mode.Random, Mode.Balanced].map((mode, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`radio-${idx}`}
                                type="radio"
                                variant="outline-primary"
                                name="radio"
                                value={mode}
                                checked={mode === currentMode}
                                onChange={() => handleSetMode(mode)}
                            >
                                {mode}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>
                    <div className="court-v3__generate-court">
                        <Button
                            style={{ background: '#10b981', border: 'none' }}
                            onClick={generateAllAvailableCourts}
                        >
                            Generate Courts
                        </Button>
                    </div>
                    <div className="court-v3__finish-court">
                        <Button style={{ background: '#6b7280', border: 'none' }} onClick={finishAllPlayingCourts}>Finish Courts</Button>
                    </div>
                </div>
                <div className="court-v3__court-cards-container">
                    {
                        courts.map((court, courtIndex) => (
                            <div className="court-v3__court-card-container">
                                <CourtCardV3 courtNumber={courtIndex + 1} court={court} players={players} handleSwapPlayers={(firstPlayer: string, secondPlayer: string) => handleSwapPlayers(firstPlayer, secondPlayer, courts)} finishCourt={() => finishCourt(courtIndex)} />
                            </div>
                        ))
                    }
                </div>
            </Card.Body>
        </Card>
    );
}

export default CourtV3;
