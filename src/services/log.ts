import axios from 'axios'
import dayjs from 'dayjs'

type logLevel = 'info' | 'warning' | 'error'

export const sendLog = (message: string, logLevel: logLevel, tags: object = {}) => {
    const serviceName = "badminton-tools"
    const timestamp = dayjs().valueOf() * 1000000
    const payload = {
        streams: [
            {
                stream: {
                    service: serviceName,
                    level: logLevel,
                    ...tags
                },
                values: [
                    [`${timestamp}`, message]
                ]
            }
        ]
    }
    return axios.post(`${process.env.REACT_APP_LOG_ENDPOINT}/loki/api/v1/push`, payload)
}
