// This is the home of your bot.
import simulator from 'holdem-simulator';

import { createBot, events, getNameFromCommandLine, toSolverHand, tableStates } from '@cygni/poker-client-api';

// Create the bot, name it by using the command line argument (yarn play:<env>:<room> player-name)
const bot = createBot({ name: getNameFromCommandLine() });
let gameCount = -1;

// From here on you can do your magic!
// All events are described in the README
bot.on(events.PlayIsStartedEvent, (event) => {
    gameCount++;
    console.log(`${bot.getGameState().getMyPlayerName()} got a PlayIsStartedEvent, tableId: ${bot.getGameState().getTableId()}`);
    if (bot.getGameState().amIStillInGame()) {
        console.log('I got chips:', bot.getGameState().getMyChips());
    }
    console.log('Player count:', event.players.length);
    console.log('Game number:', gameCount);
    
});

bot.on(events.TableChangedStateEvent, (event) => {
    console.log('Table changed state event ', event.state);
});

bot.on(events.TableIsDoneEvent, (event) => {
    console.log(`Table is done [amIWinner=${bot.getGameState().amIWinner()}]`);
    console.log('Table is done event ', event);
});

// Register the action handler, this method is invoked by the game engine when it is 
// time for your bot to make a move.
bot.registerActionHandler(({ raiseAction, callAction, checkAction, foldAction, allInAction }) => {
    // Do magic, and return your action. 
    // Note that some of the actions may be unset.
    // Example, if a check is not possible, the checkAction is undefined
    // Each action contains the name of the action (actionType) and the amount required.

    console.log(`ActionHandler: `, { raiseAction, callAction, checkAction, foldAction, allInAction });

    const actions = { raiseAction, callAction, checkAction, foldAction, allInAction };
    const myCards = toSolverHand(bot.getGameState().getMyCards());
    const communityCards = toSolverHand(bot.getGameState().getCommunityCards());

    // [win, lose, split]
    const simulationResult = simulator(myCards, communityCards, bot.getGameState().getTablePlayers().length, 25000);

    // Pot odds
    const potValue = bot.getGameState().getPotTotal();
    const potOdds = callAction ? callAction.amount / (potValue + callAction.amount) : 0;
    const raiseOdds = raiseAction ? raiseAction.amount / (potValue + raiseAction.amount) : 0;

    // Default action
    let choosenAction = foldAction;

    console.log(`tablestate: ${bot.getGameState().getTableState()}`);
    switch (bot.getGameState().getTableState()) {
        case tableStates.preflop:
            console.log('preflop');
            choosenAction = preFlopState(actions, simulationResult, potOdds);
            break;
        case tableStates.flop:
            console.log('flop');
            choosenAction = flopState(actions, simulationResult, potOdds, raiseOdds);
            break;
        case tableStates.turn:
            console.log('turn');
            choosenAction = flopState(actions, simulationResult, potOdds, raiseOdds);
            break;
        case tableStates.river:
            console.log('river');
            choosenAction = flopState(actions, simulationResult, potOdds, raiseOdds);
            break;
      }

    console.log(`My cards: ${myCards}`);
    console.log(`Community cards: ${communityCards}`);
    console.log(simulationResult);
    console.log(potOdds);
    console.log(`action: ${JSON.stringify(choosenAction)}`);
    return choosenAction;
    /*
    const winOrSplit = simulationResult[0] + simulationResult[2];
    if (simulationResult[0] > 0.85) {
            const action =  allInAction || raiseAction || callAction || checkAction || foldAction;
            console.log(`action: ${JSON.stringify(action)}`);
            return action;
    }

    if (winOrSplit > 0.7) {
        const action = raiseAction || callAction || checkAction || foldAction;
        console.log(`action: ${JSON.stringify(action)}`);
        return action;
    }

    if (winOrSplit > 0.3) {
        const action =  checkAction || callAction;
        console.log(`action: ${JSON.stringify(action)}`);
        return action;
    }
    else {
        const action =  checkAction || foldAction;
        console.log(`action: ${JSON.stringify(action)}`);
        return action;
    }
*/    
});

const preFlopState = ({ raiseAction, callAction, checkAction, foldAction, allInAction },
    simulationResult, potOdds) => {
        
        const winChance = simulationResult[0];
        // If I am small blind and the odds are acceptable call
        if (bot.getGameState().amISmallBlindPlayer() && callAction && winChance > potOdds) {
            return callAction;
        }
        
        // Always safe to check
        if (checkAction)
            return checkAction;

        // Raise if simulation is significantly better than potOdds
        if (raiseAction && (winChance > potOdds * 1.1))
            return raiseAction || callAction;

        // fold
        return foldAction;
}

const flopState = ({ raiseAction, callAction, checkAction, foldAction, allInAction },
    simulationResult, potOdds, raiseOdds) => {
        
        const winChance = simulationResult[0];

        // Good chance for winning, lets go All in!
        if (winChance > 0.92) {
            return allInAction;
        }

        // If the odds are acceptable call
        if (callAction && winChance > potOdds*1.2) {
            return callAction;
        }
        
        // Always safe to check
        if (checkAction)
            return checkAction;

        // Raise if simulation is significantly better than potOdds
        if (raiseAction && winChance > 0.8)
            return raiseAction;

        // If the stakes are getting high and a Call costs more than half my
        // chips left. Bail
        if (callAction && 
            winChance < 0.7 && 
            bot.getGameState().getMyChips() / 2 < callAction.amount) {
            return foldAction;
        }

        // If I still have a good chance of winning and my investement in the pot
        // is large I can't just bail out now. 
        if (winChance > 0.5 && 
            bot.getGameState().getMyInvestmentInPot() > bot.getGameState().getBigBlindAmount()*3)
            return checkAction || callAction || foldAction;
        
        // fold
        return foldAction;
}

bot.connect();

