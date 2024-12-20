import axios from 'axios';

class ActionDeduplicator {
  constructor() {
    this.sentActions = [];
    this.isApiCalling = false;
    this.apiEndpoint =
      'https://f6e0-2405-201-d014-2152-71a7-5aa0-8cab-e0d7.ngrok-free.app/api/mobile-automation/actions';
    this.sequenceCounter = 1;
  }

  findNewActions(currentActions) {
    return currentActions
      .map((action, index) => ({
        ...action,
        timestamp: action.timestamp || Date.now(),
        sequenceNumber: this.sequenceCounter++,
      }))
      .filter(
        (newAction) =>
          !this.sentActions.some(
            (sentAction) => JSON.stringify(sentAction) === JSON.stringify(newAction),
          ),
      );
  }

  reset() {
    this.sentActions = [];
    this.isApiCalling = false;
    this.sequenceCounter = 1;
    console.log('ActionDeduplicator: Complete reset performed');
  }

  clearSentActions() {
    this.sentActions = [];
    console.log('ActionDeduplicator: Sent actions cleared');
  }
}

const actionDeduplicator = new ActionDeduplicator();

export function sendtonogrunt(...data) {
  let host;
  let port;
  let path;
  let https;
  let strategyMap;
  let desiredCapabilities;
  let recordedActions;

  [host, port, path, https, strategyMap, desiredCapabilities, recordedActions] = data;

  const enhancedActions = recordedActions.map((action, index) => {
    const enhancedAction = {
      ...action,
      timestamp: action.timestamp || Date.now(),
      sequenceNumber: index + 1,
    };

    if (strategyMap && Array.isArray(strategyMap)) {
      enhancedAction.strategyMap = strategyMap;
    }

    return enhancedAction;
  });

  const uniqueNewActions = actionDeduplicator.findNewActions(enhancedActions);

  console.log('Unique New Actions to Send:', uniqueNewActions);

  if (uniqueNewActions.length > 0) {
    return sendtonogruntapi(uniqueNewActions);
  }

  return Promise.resolve(false);
}

export function resetflag(resetType = 'full') {
  switch (resetType) {
    case 'full':
      actionDeduplicator.reset();
      break;
    case 'clear':
      actionDeduplicator.clearSentActions();
      break;
    default:
      console.log('Invalid reset type');
  }
}

async function sendtonogruntapi(event) {
  if (actionDeduplicator.isApiCalling) {
    console.log('API call already in progress');
    return false;
  }

  try {
    actionDeduplicator.isApiCalling = true;
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return false;
    }

    const res = await axios.post(actionDeduplicator.apiEndpoint, event, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data.status === 'ok') {
      actionDeduplicator.sentActions = [...actionDeduplicator.sentActions, ...event];
      return true;
    } else {
      console.error('API call failed', res.data);
      return false;
    }
  } catch (error) {
    console.error('Error calling API:', error);
    return false;
  } finally {
    actionDeduplicator.isApiCalling = false;
  }
}

export const deduplicator = actionDeduplicator;
