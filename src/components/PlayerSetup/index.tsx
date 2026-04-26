import { Card, Form, Button } from "react-bootstrap";
import './index.css'
import { getPlayersFromText } from '../../pages/board/helper';
import { IPlayer } from "../../types";

interface IProps {
    onExtractPlayers: (players: IPlayer[]) => void
}

const PlayerSetup: React.FC<IProps> = ({ onExtractPlayers }) => {
    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const eventTarget = event.target;
        const targetKey = Object.keys(eventTarget).find((targetKey) => (eventTarget as any)[targetKey].id === 'playersText') || ''
        const playersText = (eventTarget as any)[targetKey].value
        const players = getPlayersFromText(playersText)

        onExtractPlayers(players)
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title>Add Players</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="playersText">
                        <Form.Label>Enter player names from line app</Form.Label>
                        <Form.Control as="textarea" rows={3} />
                    </Form.Group>
                    <div className="player-setup__extract-player-button d-grid">
                        <Button variant="primary" type="submit">Extract Players</Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default PlayerSetup;
