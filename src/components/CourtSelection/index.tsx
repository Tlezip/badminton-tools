import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

interface Props {
    court: number
    handleChangeCourt: (court: number) => void
}

const CourtSelection: React.FC<Props> = ({ court, handleChangeCourt }) => {
    const [show, setShow] = useState(false);

    const handleOpen = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleSelectCourt = (court: number) => {
        handleChangeCourt(court)
        handleClose()
    }
    const courts = [1, 2, 3, 4]

    return (
        <div>
            <Button onClick={handleOpen}>Court</Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Dialog>
                    <Modal.Body>
                        <div className="courts-btn-container">
                            {
                                courts.map(_court => (
                                    <Button
                                        className={`courts-btn ${_court === court ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => handleSelectCourt(_court)}
                                    >
                                        {_court}
                                    </Button>
                                ))
                            }
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal>
        </div>
    )
}

export default CourtSelection;