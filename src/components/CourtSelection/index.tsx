import { useState } from 'react'
import { Button, Modal, InputGroup, Form } from 'react-bootstrap'
import { CourtInfo } from '../../types'

interface Props {
    courtsInfo: Array<CourtInfo>
    handleChangeCourtsInfo: React.Dispatch<React.SetStateAction<Array<CourtInfo>>>
}

const CourtSelection: React.FC<Props> = ({ courtsInfo, handleChangeCourtsInfo }) => {
    const [show, setShow] = useState(false);

    const handleOpen = () => setShow(true);
    const handleClose = () => setShow(false);
    const currentCourtCount = courtsInfo.length
    const handleSelectCourt = (court: number) => {
        const isCourtExceed = currentCourtCount > court
        if (isCourtExceed) {
            const newCourts = courtsInfo.slice(0, court)
            handleChangeCourtsInfo(newCourts)
        } else {
            const newCourts = [...Array(court).keys()].map((courtIndex) => courtsInfo[courtIndex] || { name: `${courtIndex + 1}`})
            handleChangeCourtsInfo(newCourts)
        }
    }

    const handleCourtNameChange = (courtIndex: number, courtValue: string) => {
        handleChangeCourtsInfo((prevCourtsInfo: Array<CourtInfo>) => {
           const newCourtsInfo = [...prevCourtsInfo]
           newCourtsInfo[courtIndex] = {
            ...newCourtsInfo[courtIndex],
            name: courtValue
           }
           return newCourtsInfo
        })
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
                                        className={`courts-btn ${_court === currentCourtCount ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => handleSelectCourt(_court)}
                                        key={_court}
                                    >
                                        {_court}
                                    </Button>
                                ))
                            }
                        </div>
                        <div className="courts-name-container">
                            {
                                courtsInfo.map((courtInfo, courtIndex) => (
                                    <InputGroup className="mb-3" key={courtIndex}>
                                        <InputGroup.Text id="basic-addon2">{`court ${courtIndex + 1} name`}</InputGroup.Text>
                                        <Form.Control onChange={(e) => handleCourtNameChange(courtIndex, e.target.value)} value={courtInfo.name} />
                                    </InputGroup>
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