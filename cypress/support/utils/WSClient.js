import chai from 'chai'
import chaiSubset from 'chai-subset'
import {APIClient} from "./APIClient";
chai.use(chaiSubset);
const {expect: chaiExpect} = chai

export class WSClient {
    #wsSubject
    #cache = []
    constructor(config) {
        this.config = config
    }

    waitForMessage(msg, checkInCacheFirst = false) {
        if(!this.#wsSubject) {
            throw Error('WS Client did not initialized')
        }
        return new Cypress.Promise((resolve, reject) => {
            if(checkInCacheFirst) {
                this.#cache.forEach((cachedMsg) => {
                    try {
                        chaiExpect(cachedMsg).to.containSubset(msg)
                        resolve(cachedMsg)
                    } catch {
                    }
                })
            }
            const subscription = this.#wsSubject
                .subscribe( (result) => {
                    try {
                        chaiExpect(result).to.containSubset(msg)
                        subscription.unsubscribe()
                        resolve(result)
                    } catch {
                    }
                });
        })
    }

    sendMessage(msg, expectingMsg) {
        if(!this.#wsSubject) {
            throw Error('WS Client did not initialized')
        }
        this.#wsSubject.next(msg)
        if(expectingMsg !== undefined) {
            return this.waitForMessage(expectingMsg)
        }
    }

    init() {
        return cy.stream(this.config).then(subject => {
            this.#wsSubject = subject

            // creating at least one subscriber to keep connection open
            subject.subscribe( (result) => {
                this.#cache.push(result)
                console.log('r1', result)
            })
        })
    }

    close() {
        this.#wsSubject?.unsubscribe()
    }
}

export const wsClientInstance = new WSClient({url: Cypress.env('wsUrl')})
