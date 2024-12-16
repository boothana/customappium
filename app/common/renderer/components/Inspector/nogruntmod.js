import axios from 'axios';

class ActionDeduplicator {
  constructor() {
    this.sentActions = [];
    this.isApiCalling = false;
    this.apiEndpoint =
      'https://6ea3-2405-201-d014-2152-541b-9ef8-fcdf97-3e28.ngrok-free.app/api/test-steps';
  }

  findNewActions(currentActions) {
    return currentActions.filter(
      (newAction) =>
        !this.sentActions.some(
          (sentAction) => JSON.stringify(sentAction) === JSON.stringify(newAction),
        ),
    );
  }

  reset() {
    this.sentActions = [];
    this.isApiCalling = false;
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
  let desiredCapabilities;
  let recordedActions;

  [host, port, path, https, desiredCapabilities, recordedActions] = data;

  const uniqueNewActions = actionDeduplicator.findNewActions(recordedActions);

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

    const res = await axios.post(actionDeduplicator.apiEndpoint, event);

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

// import axios from 'axios';

// class ActionDeduplicator {
//   constructor() {
//     this.sentActions = [];
//     this.isApiCalling = false;
//     this.apiEndpoint = 'http://localhost:8080/api/test-steps';
//   }

//   findNewActions(currentActions) {
//     // Find actions that haven't been sent before
//     return currentActions.slice(this.sentActions.length);
//   }

//   reset() {
//     this.sentActions = [];
//     this.isApiCalling = false;
//     console.log('ActionDeduplicator: Complete reset performed');
//   }

//   clearSentActions() {
//     this.sentActions = [];
//     console.log('ActionDeduplicator: Sent actions cleared');
//   }
// }

// const actionDeduplicator = new ActionDeduplicator();

// export function sendtonogrunt(...data) {
//   let host;
//   let port;
//   let path;
//   let https;
//   let desiredCapabilities;
//   let recordedActions;

//   [host, port, path, https, desiredCapabilities, recordedActions] = data;

//   // Find only the new actions that haven't been sent before
//   const uniqueNewActions = actionDeduplicator.findNewActions(recordedActions);

//   // Log the details of the actions being sent
//   console.log('Total Recorded Actions:', recordedActions.length);
//   console.log('Actions Already Sent:', actionDeduplicator.sentActions.length);
//   console.log('New Actions to Send:', uniqueNewActions.length);
//   console.log('New Actions Details:', JSON.stringify(uniqueNewActions, null, 2));

//   if (uniqueNewActions.length > 0) {
//     // Simulated API call with logging
//     console.log('Simulating API call with new actions');

//     // Update sent actions to mark all current actions as processed
//     actionDeduplicator.sentActions = new Array(recordedActions.length).fill(true);

//     console.log(
//       'Marked all current actions as sent. Sent actions count:',
//       actionDeduplicator.sentActions.length,
//     );

//     return Promise.resolve(true);
//   }

//   return Promise.resolve(false);
// }

// export function resetflag(resetType = 'full') {
//   switch (resetType) {
//     case 'full':
//       actionDeduplicator.reset();
//       break;
//     case 'clear':
//       actionDeduplicator.clearSentActions();
//       break;
//     default:
//       console.log('Invalid reset type');
//   }
// }

// export const deduplicator = actionDeduplicator;
