import {Before, Given} from "@badeball/cypress-cucumber-preprocessor";
import {apiClientInstance} from "../utils/APIClient";
import {wsClientInstance} from "../utils/WSClient";
import sha256 from "crypto-js/hmac-sha256";

Before(function () {
    apiClientInstance.getToken(Cypress.env('user'), Cypress.env('password'))
    wsClientInstance.init()
})

Given(/^a calendar$/, function () {
    return apiClientInstance.createCalendar()
});

Given(/^an mp with an api key with full permissions$/, function () {
    return apiClientInstance.createMP()
        .then(() => {
            apiClientInstance.createApiKey(apiClientInstance.testData.mp.id)
        })
});

Given(/^an instrument$/, function (table) {
    const stepInstrumentData = table.hashes()[0]

    return apiClientInstance.createInstrument({
        calendarId: apiClientInstance.testData.calendar.id,
        "quoteCurrency": stepInstrumentData['Quote Currency'],
        "pricePrecision": stepInstrumentData['Price Precision'],
        "quantityPrecision": stepInstrumentData['Quantity Precision'],
        "minQuantity": stepInstrumentData['Min Quantity'],
        "maxQuantity": stepInstrumentData['Max Quantity'],
        "activityStatus": stepInstrumentData['Status'].toUpperCase(),
        "description": stepInstrumentData['Description']
    })
});

Given(/^a session to exchange GW is created successfully$/, function () {
    const {apiKey, secret} = apiClientInstance.testData.apiKey;
    const timestamp = Date.now();
    const signature = sha256(`"apiKey":"${apiKey}","timestamp":"${String(timestamp)}"`, secret).toString()

    return wsClientInstance.sendMessage(
        {
            d: {
                apiKey,
                signature,
                timestamp
            },
            q: "exchange.market/createSession",
            sid: 1
        },
        {
            sig: 1,
            q: "exchange.market/createSession"
        }
    )
});

Given(/^the mp subscribes to the executionReports stream$/, function () {
    return wsClientInstance.sendMessage({
        d: {
            "trackingNumber": 0
        },
        q: "v1/exchange.market/executionReports",
        sid: 103
    })
});

Given(/^the mp subscribes to the trades stream$/, function () {
    return wsClientInstance.sendMessage({
        d: {
            "trackingNumber": 0
        },
        q: "v1/exchange.market/trades",
        sid: 104
    })
});