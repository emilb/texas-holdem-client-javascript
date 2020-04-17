// eslint-disable-next-line no-undef
const esmImport = require('esm')(module);
const { scoreHighestCard, scoreSuited, scorePair, subtractForGap, addForZeroOrOneGap, chenValue } = esmImport('./chen.mjs');
const { suits, ranks } = esmImport('../../poker-client-api/src/protocol.mjs');

describe('Test chen functions', () => {
    it('Verify score highest card is correct', () => {
        const cardsAceHigh = [
            { suit: suits.hearts, rank: ranks.ace },
            { suit: suits.diamonds, rank: ranks.deuce },
        ];
        expect(scoreHighestCard(cardsAceHigh)).toBe(10);

        const cardsFiveHigh = [
            { suit: suits.hearts, rank: ranks.three },
            { suit: suits.diamonds, rank: ranks.five },
        ];
        expect(scoreHighestCard(cardsFiveHigh)).toBe(2.5);

        const suitedOneGap = [
            { suit: suits.hearts, rank: ranks.five },
            { suit: suits.hearts, rank: ranks.seven },
        ];
        expect(scoreHighestCard(suitedOneGap)).toBe(3.5);
    });

    it('Verify score for same suit', () => {
        const cardsAceHigh = [
            { suit: suits.hearts, rank: ranks.ace },
            { suit: suits.diamonds, rank: ranks.deuce },
        ];
        expect(scoreSuited(cardsAceHigh)).toBe(0);

        const cardsFiveHigh = [
            { suit: suits.hearts, rank: ranks.three },
            { suit: suits.hearts, rank: ranks.five },
        ];
        expect(scoreSuited(cardsFiveHigh)).toBe(2);
    });

    it('Verify score for pair', () => {
        const cardsAceHigh = [
            { suit: suits.hearts, rank: ranks.ace },
            { suit: suits.diamonds, rank: ranks.deuce },
        ];
        expect(scorePair(cardsAceHigh)).toBe(0);

        const cardsThreePair = [
            { suit: suits.hearts, rank: ranks.three },
            { suit: suits.diamond, rank: ranks.three },
        ];
        expect(scorePair(cardsThreePair)).toBe(5);

        const cardsAcePair = [
            { suit: suits.hearts, rank: ranks.ace },
            { suit: suits.diamonds, rank: ranks.ace },
        ];
        expect(scorePair(cardsAcePair)).toBe(20);
    });

    it('Verify subtractForGap', () => {
        const cardsAceHigh = [
            { suit: suits.hearts, rank: ranks.ace },
            { suit: suits.diamonds, rank: ranks.deuce },
        ];
        expect(subtractForGap(cardsAceHigh)).toBe(-5);

        const cardsThreePair = [
            { suit: suits.hearts, rank: ranks.three },
            { suit: suits.diamond, rank: ranks.three },
        ];
        expect(subtractForGap(cardsThreePair)).toBe(0);

        const cardsNoGap = [
            { suit: suits.hearts, rank: ranks.ace },
            { suit: suits.diamonds, rank: ranks.king },
        ];
        expect(subtractForGap(cardsNoGap)).toBe(0);

        const suitedOneGap = [
            { suit: suits.hearts, rank: ranks.five },
            { suit: suits.hearts, rank: ranks.seven },
        ];
        expect(subtractForGap(suitedOneGap)).toBe(-1);
    });
    
    it('Verify addForZeroOrOneGap', () => {
        const cardsAceHigh = [
            { suit: suits.hearts, rank: ranks.ace },
            { suit: suits.diamonds, rank: ranks.king },
        ];
        expect(addForZeroOrOneGap(cardsAceHigh)).toBe(0);

        const cardsThreeFive = [
            { suit: suits.hearts, rank: ranks.three },
            { suit: suits.diamond, rank: ranks.five },
        ];
        expect(addForZeroOrOneGap(cardsThreeFive)).toBe(1);

        const cardsNoGapBelowQueen = [
            { suit: suits.hearts, rank: ranks.jack },
            { suit: suits.diamonds, rank: ranks.ten },
        ];
        expect(addForZeroOrOneGap(cardsNoGapBelowQueen)).toBe(1);
    });

    it('Verify chenValue calculation', () => {
        const cardsAceHigh = [
            { suit: suits.spades, rank: ranks.ace },
            { suit: suits.spades, rank: ranks.king },
        ];
        expect(chenValue(cardsAceHigh)).toBe(12);

        const cardsTenPair = [
            { suit: suits.clubs, rank: ranks.ten },
            { suit: suits.diamond, rank: ranks.ten },
        ];
        expect(chenValue(cardsTenPair)).toBe(10);

        const suitedOneGap = [
            { suit: suits.hearts, rank: ranks.five },
            { suit: suits.hearts, rank: ranks.seven },
        ];
        expect(chenValue(suitedOneGap)).toBe(6);

        const notSuitedFiveGap = [
            { suit: suits.clubs, rank: ranks.deuce },
            { suit: suits.hearts, rank: ranks.seven },
        ];
        expect(chenValue(notSuitedFiveGap)).toBe(-1);

        const acesPair = [
            { suit: suits.clubs, rank: ranks.ace },
            { suit: suits.hearts, rank: ranks.ace },
        ];
        expect(chenValue(acesPair)).toBe(20);
    });
    
});