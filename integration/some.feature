Feature: Some feature

  Background:
    Given a calendar
      | Name       | TimeZone  | MarketOpen | MarketClose | TradingDays | Holidays |
      | <calendar> | UTC+01:00 |            |             | smtwtfs     |          |
    And an mp with an api key with full permissions
    And an instrument
      | symbol   | Description | Calendar   | Status | Quote Currency | Price Precision | Quantity Precision | Min Quantity | Max Quantity |
      | <symbol> | Instrument  | <calendar> | Active | USD            | 6               | 2                  | 1            | 100000       |
    And a session to exchange GW is created successfully
    And the mp subscribes to the executionReports stream
    And the mp subscribes to the trades stream

  Scenario: creating a match between limit GTC and limit GTC
    When  the mp requested to place the following order
      | mpOrderId    | orderType | side | price   | quantity | instrument | timeInForce |
      | <mpOrderId1> | Limit     | Buy  | 10.1234 | 76.55    | <symbol>   | GTC         |
    And  the mp requested to place the following order
      | mpOrderId    | orderType | side | price   | quantity | instrument | timeInForce |
      | <mpOrderId2> | Limit     | Sell | 10.1234 | 77.55    | <symbol>   | GTC         |

    And the following messages should be published from executionReports stream
      | eventId    | messageType | orderId    | mpOrderId    | orderType | side | instrument | quantity | price   | timeInForce | orderTimestamp | filledQuantity | remainingOpenQuantity | removedQuantity | marketModel | eventTimestamp | eventId    | trackingNumber    | mpId    | mpName    |
      | <eventId1> | Add         | <orderId1> | <mpOrderId1> | Limit     | Buy  | <symbol>   | 76.55    | 10.1234 | GTC         | t0             | 0              | 76.55                 | 0               | T           | t0             | <eventId1> | <trackingNumber1> | <mpId1> | <mpName1> |
      | <eventId2> | Executed    | <orderId1> | <mpOrderId1> | Limit     | Buy  | <symbol>   | 76.55    | 10.1234 | GTC         | t0             | 76.55          | 0                     | 0               | T           | t1             | <eventId2> | <trackingNumber2> | <mpId1> | <mpName1> |
      | <eventId3> | Executed    | <orderId2> | <mpOrderId2> | Limit     | Sell | <symbol>   | 77.55    | 10.1234 | GTC         | t1             | 76.55          | 1                     | 0               | T           | t1             | <eventId2> | <trackingNumber2> | <mpId1> | <mpName1> |
      | <eventId4> | Add         | <orderId2> | <mpOrderId2> | Limit     | Sell | <symbol>   | 77.55    | 10.1234 | GTC         | t1             | 76.55          | 1                     | 0               | T           | t1             | <eventId2> | <trackingNumber3> | <mpId1> | <mpName1> |

    And the following messages should be published from trades stream
      | actionType   | timestamp | trackingNumber    | eventId    | orderId    | mpOrderId    | mpId    | mpName    | instrumentId    | instrument | side | price   | quantity | tradeId    | tradingMode | makerTaker | tradeDate  |
      | MatchedTrade | t1        | <trackingNumber3> | <eventId3> | <orderId1> | <mpOrderId1> | <mpId1> | <mpName1> | <instrumentId1> | <symbol>   | Buy  | 10.1234 | 76.55    | <tradeId1> | CT          | Maker      | tradeDate1 |
      | MatchedTrade | t1        | <trackingNumber3> | <eventId3> | <orderId2> | <mpOrderId2> | <mpId1> | <mpName1> | <instrumentId1> | <symbol>   | Sell | 10.1234 | 76.55    | <tradeId1> | CT          | Taker      | tradeDate1 |