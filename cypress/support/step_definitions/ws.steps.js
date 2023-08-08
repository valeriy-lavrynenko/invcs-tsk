const {Then, When} = require("@badeball/cypress-cucumber-preprocessor");
const {wsClientInstance} = require("../utils/WSClient");
const {apiClientInstance} = require("../utils/APIClient");

const orders = []
function getOrderByStringParam(s) {
    return  orders[s.match(/\d+/)[0] - 1]
}

When(/^the mp requested to place the following order$/, function (table) {
    const stepOrderData = table.hashes()[0]
    const {side, orderType, quantity, price, timeInForce} = stepOrderData
    let orderData = {
        orderType,
        instrument: apiClientInstance.testData.instrument.symbol,
        side,
        quantity,
        price,
        timeInForce,
        mpOrderId: Date.now(),
        userId: "UATUserTest1"
    };
    return wsClientInstance.sendMessage(
        {
            "d": orderData,
            "q": "v1/exchange.market/placeOrder",
            "sid": 1
        },
        {
            "q": "v1/exchange.market/placeOrder",
            "d": {
                "orderStatus": "Pending"
            }
        }
    ).then((orderMsg) => {
        expect(orderMsg).to.have.nested.property('d.orderId')
        orders.push({r: orderMsg.d, s: orderData})
    })
});

Then(/^the following messages should be published from executionReports stream$/, function (table) {
    const stepMsgsData = table.hashes()
    const msgQueries = stepMsgsData.map((stepMsgData) => {
        return {
            "q": "v1/exchange.market/executionReports",
            "d": {
                "messageType": stepMsgData.messageType,
                "orderId": getOrderByStringParam(stepMsgData.orderId).r.orderId,
            }
        }
    })

    return Cypress.Promise.all(msgQueries.map((msgQ) => wsClientInstance.waitForMessage(msgQ, true)))
        .then((actualMsgs) => {
            stepMsgsData.forEach((stepMsgData, index) => {
                let actualMsgData = actualMsgs[index].d;
                const storedOrderData = getOrderByStringParam(stepMsgData.orderId)
                expect(actualMsgData.messageType).to.eq(stepMsgData.messageType)
                expect(actualMsgData.orderId).to.eq(storedOrderData.r.orderId)
                expect(actualMsgData.mpOrderId).to.eq(storedOrderData.s.mpOrderId)
                expect(actualMsgData.mpId).to.eq(parseInt(apiClientInstance.testData.mp.id))
                expect(actualMsgData.mpName).to.eq(apiClientInstance.testData.mp.name)
                expect(actualMsgData.instrument).to.eq(apiClientInstance.testData.instrument.symbol)
                expect(actualMsgData.side).to.eq(stepMsgData.side)
                expect(actualMsgData.price).to.eq(parseFloat(stepMsgData.price))
                expect(actualMsgData.quantity).to.eq(parseFloat(stepMsgData.quantity))

                expect(actualMsgData.orderType).to.eq(stepMsgData.orderType)
                expect(actualMsgData.timeInForce).to.eq(stepMsgData.timeInForce)
                expect(actualMsgData.filledQuantity).to.eq(parseFloat(stepMsgData.filledQuantity))
                expect(actualMsgData.remainingOpenQuantity).to.eq(parseFloat(stepMsgData.remainingOpenQuantity))
                expect(actualMsgData.removedQuantity).to.eq(parseFloat(stepMsgData.removedQuantity))
                expect(actualMsgData.marketModel).to.eq(stepMsgData.marketModel)
            })
        })
});

Then(/^the following messages should be published from trades stream$/, function (table) {
    const stepMsgsData = table.hashes()
    const msgQueries = stepMsgsData.map((stepMsgData) => {
        return {
            "q": "v1/exchange.market/trades",
            "d": {
                actionType: stepMsgData.actionType,
                orderId: getOrderByStringParam(stepMsgData.orderId).r.orderId,
            }
        }
    })

    return Cypress.Promise.all(msgQueries.map((msgQ) => wsClientInstance.waitForMessage(msgQ, true)))
        .then((actualMsgs) => {
            stepMsgsData.forEach((stepMsgData, index) => {
                let actualMsgData = actualMsgs[index].d;
                const storedOrderData = getOrderByStringParam(stepMsgData.orderId)
                expect(actualMsgData.actionType).to.eq(stepMsgData.actionType)
                expect(actualMsgData.orderId).to.eq(storedOrderData.r.orderId)
                expect(actualMsgData.mpOrderId).to.eq(storedOrderData.s.mpOrderId)
                expect(actualMsgData.mpId).to.eq(parseInt(apiClientInstance.testData.mp.id))
                expect(actualMsgData.mpName).to.eq(apiClientInstance.testData.mp.name)
                expect(actualMsgData.instrumentId).to.eq(parseInt(apiClientInstance.testData.instrument.id))
                expect(actualMsgData.instrument).to.eq(apiClientInstance.testData.instrument.symbol)
                expect(actualMsgData.side).to.eq(stepMsgData.side)
                expect(actualMsgData.price).to.eq(parseFloat(stepMsgData.price))
                expect(actualMsgData.quantity).to.eq(parseFloat(stepMsgData.quantity))
                expect(actualMsgData.tradingMode).to.eq(stepMsgData.tradingMode)
                expect(actualMsgData.makerTaker).to.eq(stepMsgData.makerTaker)
            })
        })
});