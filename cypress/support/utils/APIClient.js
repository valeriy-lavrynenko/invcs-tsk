
export class APIClient {
    #token
    testData = {
        calendar: {},
        instrument: {},
        mp: {},
        apiKey: {},
    }
    constructor(config) {
        this.config = config
        this.dataMark = Math.floor(Math.random() * 1000 + 1000)
    }

    getToken(email, password) {
        console.log(email)
        console.log(password)
        return  cy.request({
            url:`${this.config.url}/api/auth/token`,
            method: 'POST',
            body: {
                email,
                password
            }
        }).then((res) => {
            expect(res.status).to.be.eq(200)
            expect(res.body).to.have.property('token')
            this.#token = res.body.token
        })
    }

    createCalendar() {
        return  cy.request({
            url:`${this.config.url}/api/v2/calendars`,
            method: 'POST',
            auth: { bearer: this.#token },
            body: {
                "tradingDays": [
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY"
                ],
                "name": `UK-valeriy-testing-${this.dataMark}`,
                "timeZone": "+02:00",
                "marketOpen": "00:00",
                "marketClose": "23:55",
                "holidays": [
                    {
                        "date": "2022-01-01",
                        "closeTime": "13:00",
                        "name": "New Year"
                    }
                ]
            }
        }).then((res) => {
            expect(res.status).to.be.eq(200)
            this.testData.calendar = res.body
        })
    }

    createInstrument(data) {
        return  cy.request({
            url:`${this.config.url}/api/v2/instruments`,
            method: 'POST',
            auth: { bearer: this.#token },
            body: {
                "symbol": `TstVL${this.dataMark}`,
                "quoteCurrency": "USD",
                "pricePrecision": "6",
                "quantityPrecision": "4",
                "minQuantity": "0.0001",
                "maxQuantity": "10000000",
                "activityStatus": "ACTIVE",
                "description": "Testing instrument",
                ...data,
            }
        }).then((res) => {
            expect(res.status).to.be.eq(200)
            this.testData.instrument = res.body
        })
    }

    createMP() {
        return  cy.request({
            url:`${this.config.url}/api/mps`,
            method: 'POST',
            auth: { bearer: this.#token },
            body: {
                "name": `MP2 Valeriy Test${this.dataMark}`,
                "compId": `compIdVL${this.dataMark}`,
                "Status": "Active"
            }
        }).then((res) => {
            expect(res.status).to.be.eq(200)
            this.testData.mp = res.body
        })
    }

    createApiKey(mpId) {
        return  cy.request({
            url:`${this.config.url}/api/mps/${mpId}/api-keys`,
            method: 'POST',
            auth: { bearer: this.#token },
            body: {
                "label": "label1",
                "permissions": ["market-service:market:order_book_depth",
                    "market-service:market:order_book_state",
                    "market-service:market:place_order",
                    "market-service:market:cancel_order",
                    "market-service:market:modify_order",
                    "market-service:market:replace_order",
                    "market-service:market:mass_cancel",
                    "market-service:market:execution_reports",
                    "market-service:market:mass_order_status",
                    "market-service:market:trades",
                    "reporting:mp:orders",
                    "reporting:mp:trades"
                ],
                "cancelOnDisconnect": false
            }
        }).then((res) => {
            expect(res.status).to.be.eq(200)
            this.testData.apiKey = res.body
        })
    }
}

export const apiClientInstance = new APIClient({url: Cypress.env('apiUrl')})