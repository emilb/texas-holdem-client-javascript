import { ranks } from '@cygni/poker-client-api';

// eslint-disable-next-line complexity
export const cardValue = (card) => {
    switch (card.rank) {
    case ranks.deuce: return 2/2;
    case ranks.three: return 3/2;
    case ranks.four:  return 4/2;
    case ranks.five:  return 5/2;
    case ranks.six:   return 6/2;
    case ranks.seven: return 7/2;
    case ranks.eight: return 8/2;
    case ranks.nine:  return 9/2;
    case ranks.ten:   return 10/2;
    case ranks.jack:  return 6;
    case ranks.queen: return 7;
    case ranks.king:  return 8;
    case ranks.ace:   return 10;
    }
};

export const scoreHighestCard = (cards) => {
    return Math.max(...cards.map(cardValue));
};

export const scorePair = (cards) => {
    if (cardValue(cards[0]) === cardValue(cards[1]))
        return Math.max(cardValue(cards[0])*2, 5);
    return 0;
};

export const scoreSuited = (cards) => {
    let unique = [...new Set(cards.map((card) => card.suit))];
    return unique.length == 1 ? 2 : 0;
};

export const subtractForGap = (cards) => {
    const rankValues = Object.values(ranks);
    const diff = Math.abs(rankValues.indexOf(cards[0].rank) - rankValues.indexOf(cards[1].rank))-1;
    
    if (diff >= 4) return -5;
    if (diff == 3) return -4;
    if (diff == 2) return -2;
    if (diff == 1) return -1;

    return 0;
};

// eslint-disable-next-line complexity
export const addForZeroOrOneGap = (cards) => {
    // If same rank no bonus
    if (cards[0].rank === cards[1].rank) {
        return 0;
    }

    // Check no card is higher than Jack
    const currentRanks = cards.map((card) => card.rank);
    if (currentRanks.indexOf(ranks.queen) >= 0 ||
        currentRanks.indexOf(ranks.king) >= 0 ||
        currentRanks.indexOf(ranks.ace) >= 0) {
        return 0;
    }

    const rankValues = Object.values(ranks);
    const diff = Math.abs(rankValues.indexOf(cards[0].rank) - rankValues.indexOf(cards[1].rank));

    return diff <= 2 ? 1 : 0;
};

export const chenValue = (cards) => {
    let chenSum = scoreHighestCard(cards);
    const scorePairValue = scorePair(cards);
    
    if (scorePairValue) {
        chenSum = scorePairValue;
    }
    
    chenSum += scoreSuited(cards);
    chenSum += subtractForGap(cards);
    chenSum += addForZeroOrOneGap(cards);
    return Math.ceil(chenSum);
};