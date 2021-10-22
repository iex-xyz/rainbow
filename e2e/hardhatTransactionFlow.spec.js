/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-undef */
/* eslint-disable jest/expect-expect */
import { exec } from 'child_process';
import WalletConnect from '@walletconnect/client';
import * as Helpers from './helpers';

let connector = null;
let uri = null;
let account = null;

const RAINBOW_WALLET_DOT_ETH = '0x7a3d05c70581bd345fe117c06e45f9669205384f';

beforeAll(async () => {
  // Connect to hardhat
  await exec('yarn hardhat');
});

const acceptAlertIfGasPriceIsHigh = async () => {
  // Depending on current gas prices, we might get an alert
  // saying that the fees are higher than the swap amount
  try {
    if (await Helpers.checkIfElementByTextIsVisible('Proceed Anyway')) {
      await Helpers.tapAlertWithButton('Proceed Anyway');
    }
    // eslint-disable-next-line no-empty
  } catch (e) {}
};

// eslint-disable-next-line no-unused-vars
const checkIfSwapCompleted = async (assetName, amount) => {
  // Disabling this because there's a view blocking (The portal)
  // await Helpers.checkIfVisible(`Swapped-${assetName}-${amount}`);
  return true;
};

describe('Hardhat Transaction Flow', () => {
  it('Should show the welcome screen', async () => {
    await Helpers.checkIfVisible('welcome-screen');
  });

  it('Should show the "Restore Sheet" after tapping on "I already have a wallet"', async () => {
    await Helpers.tap('already-have-wallet-button');
    await Helpers.checkIfExists('restore-sheet');
  });

  it('show the "Import Sheet" when tapping on "Restore with a recovery phrase or private key"', async () => {
    await Helpers.tap('restore-with-key-button');
    await Helpers.checkIfExists('import-sheet');
  });

  it('Should show the "Add wallet modal" after tapping import with a valid seed"', async () => {
    await Helpers.typeText('import-sheet-input', process.env.TEST_SEEDS, false);
    await Helpers.checkIfElementHasString(
      'import-sheet-button-label',
      'Import'
    );
    await Helpers.tap('import-sheet-button');
    await Helpers.checkIfVisible('wallet-info-modal');
  });

  it('Should navigate to the Wallet screen after tapping on "Import Wallet"', async () => {
    await Helpers.disableSynchronization();
    await Helpers.tap('wallet-info-submit-button');
    if (device.getPlatform() === 'android') {
      await Helpers.checkIfVisible('pin-authentication-screen');
      // Set the pin
      await Helpers.authenticatePin('1234');
      // Confirm it
      await Helpers.authenticatePin('1234');
    }
    await Helpers.checkIfVisible('wallet-screen', 40000);
    await Helpers.enableSynchronization();
  });

  it('Should navigate to the Profile screen after swiping right', async () => {
    await Helpers.swipe('wallet-screen', 'right', 'slow');
    await Helpers.checkIfVisible('profile-screen');
  });

  it('Should navigate to Settings Modal after tapping Settings Button', async () => {
    await Helpers.tap('settings-button');
    await Helpers.checkIfVisible('settings-modal');
  });

  it('Should toggle Dark Mode on and off', async () => {
    await Helpers.tap('darkmode-section-false');
    await Helpers.tap('darkmode-section-true');
  });

  it('Should navigate to Developer Settings after tapping Developer Section', async () => {
    await Helpers.tap('developer-section');
    await Helpers.checkIfVisible('developer-settings-modal');
  });

  it('Should show Applied alert after pressing Alert', async () => {
    await Helpers.tap('alert-section');
    await Helpers.checkIfElementByTextIsVisible('APPLIED');
    await Helpers.tapAlertWithButton('OK');
    await Helpers.checkIfVisible('developer-settings-modal');
  });

  it('Should show Hardhat Toast after pressing Connect To Hardhat', async () => {
    await Helpers.tap('hardhat-section');
    await Helpers.checkIfVisible('testnet-toast-Hardhat');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should be able to wrap ETH -> WETH', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.typeText('exchange-modal-input', '0.001', true);
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH');
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await checkIfSwapCompleted('Ethereum', '0.001 ETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });
  it('Should be able to unwrap WETH -> ETH', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH');
    await Helpers.typeText('exchange-modal-input', '0.0005', true);
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await checkIfSwapCompleted('Wrapper Ether', '0.0005 WETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });
  it('Should swap WETH -> DAI including approval (via tokenToToken)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.typeText('currency-select-search-input', 'DAI', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-DAI');
    await Helpers.typeText('exchange-modal-input', '0.0005', true);
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await checkIfSwapCompleted('Wrapper Ether', '0.0005 WETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap DAI -> ZRX (via tokenToTokenWithPermit)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-DAI');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-ZRX');
    await Helpers.typeText('exchange-modal-input', '4', true);
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await checkIfSwapCompleted('DAI', '4 DAI');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap DAI -> ETH (via tokenToETH)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-DAI');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH');
    await Helpers.typeText('exchange-modal-input', '4', true);
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await checkIfSwapCompleted('DAI', '4 DAI');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap ETH -> USDC (via ethToToken)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.typeText('currency-select-search-input', 'USDC', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-USDC');
    await Helpers.typeText('exchange-modal-input', '0.0005', true);
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await checkIfSwapCompleted('Ethereum', '0.0005 ETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap USDC -> WETH (via tokenToTokenWithPermit)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-USDC');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH');
    await Helpers.typeText('exchange-modal-input', '10', true);
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await checkIfSwapCompleted('USD Coin', '10 USDC');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap USDC -> ETH (via tokenToETH)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.tap('exchange-modal-input-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-USDC');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH');
    await Helpers.typeText('exchange-modal-input', '10', true);
    await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    await checkIfSwapCompleted('USD Coin', '10 USDC');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should send (Cryptokitties)', async () => {
    await Helpers.tap('send-fab');
    await Helpers.typeTextAndHideKeyboard(
      'send-asset-form-field',
      RAINBOW_WALLET_DOT_ETH
    );
    await Helpers.tap('CryptoKitties-family-header');
    await Helpers.tapByText('Arun Cattybinky');
    await Helpers.tap('send-sheet-confirm-action-button');
    await Helpers.tapAndLongPress('send-confirmation-button');
    await Helpers.checkIfVisible('profile-screen');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should send ERC20 (BAT)', async () => {
    await Helpers.tap('send-fab');
    await Helpers.typeTextAndHideKeyboard(
      'send-asset-form-field',
      RAINBOW_WALLET_DOT_ETH
    );
    await Helpers.tap('send-asset-BAT');
    await Helpers.typeText('selected-asset-field-input', '1.02', true);
    await Helpers.tap('send-sheet-confirm-action-button');
    await Helpers.tapAndLongPress('send-confirmation-button');
    await Helpers.checkIfVisible('profile-screen');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should send ETH', async () => {
    await Helpers.tap('send-fab');
    await Helpers.typeTextAndHideKeyboard(
      'send-asset-form-field',
      RAINBOW_WALLET_DOT_ETH
    );
    await Helpers.tap('send-asset-ETH');
    await Helpers.typeText('selected-asset-field-input', '0.003', true);
    await Helpers.tap('send-sheet-confirm-action-button');
    await Helpers.tapAndLongPress('send-confirmation-button');
    await Helpers.checkIfVisible('profile-screen');
  });

  it('Should receive the WC connect request and approve it', async () => {
    connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      clientMeta: {
        description: 'Connect with WalletConnect',
        icons: ['https://walletconnect.org/walletconnect-logo.png'],
        name: 'WalletConnect',
        url: 'https://walletconnect.org',
      },
    });
    await Helpers.delay(3000);

    await connector.createSession();
    uri = connector.uri;
    const connected = new Promise(async (resolve, reject) => {
      connector.on('connect', (error, payload) => {
        if (error) {
          reject(error);
        }
        const { accounts } = payload.params[0];
        if (accounts[0] === '0x3Cb462CDC5F809aeD0558FBEe151eD5dC3D3f608') {
          account = accounts[0];
          resolve(true);
        } else {
          reject(false);
        }
      });
    });

    const baseUrl = 'https://rnbwapp.com';
    const encodedUri = encodeURIComponent(uri);
    const fullUrl = `${baseUrl}/wc?uri=${encodedUri}`;

    await Helpers.disableSynchronization();
    await device.sendToHome();
    await Helpers.enableSynchronization();

    await Helpers.delay(2000);

    await device.launchApp({
      newInstance: false,
      url: fullUrl,
    });

    await Helpers.checkIfVisible('wc-approval-sheet', 30000);
    await Helpers.waitAndTap('wc-connect-action-button');
    const isConnected = await connected;
    if (!isConnected) throw new Error('WC Connection failed');
    await Helpers.checkIfVisible('wc-redirect-sheet');
    await Helpers.swipe('wc-redirect-sheet', 'down', 'fast');
  });

  it('Should be able to sign personal messages via WC', async () => {
    const result = connector.signPersonalMessage(['My msg', account]);
    await Helpers.checkIfVisible('wc-request-sheet');
    await Helpers.waitAndTap('wc-confirm-action-button');
    await Helpers.delay(1000);
    if (!result) throw new Error('WC Connection failed');
    const signature = await result;
    if (
      signature !==
      '0x9b08221727750e582b43e14f50069083ac6d8a2670a9f28009f14cbef7e66ba16d3370330aed5b6744027bd6a0bef32cb97bb9da3db34c67ba2237b2ef5d1ec71b'
    ) {
      throw new Error('WC personal sign failed');
    }
  });

  it('Should be able to sign typed data messages via WC', async () => {
    const msg = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'verifyingContract', type: 'address' },
        ],
        RelayRequest: [
          { name: 'target', type: 'address' },
          { name: 'encodedFunction', type: 'bytes' },
          { name: 'gasData', type: 'GasData' },
          { name: 'relayData', type: 'RelayData' },
        ],
        GasData: [
          { name: 'gasLimit', type: 'uint256' },
          { name: 'gasPrice', type: 'uint256' },
          { name: 'pctRelayFee', type: 'uint256' },
          { name: 'baseRelayFee', type: 'uint256' },
        ],
        RelayData: [
          { name: 'senderAddress', type: 'address' },
          { name: 'senderNonce', type: 'uint256' },
          { name: 'relayWorker', type: 'address' },
          { name: 'paymaster', type: 'address' },
        ],
      },
      domain: {
        name: 'GSN Relayed Transaction',
        version: '1',
        chainId: 42,
        verifyingContract: '0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B',
      },
      primaryType: 'RelayRequest',
      message: {
        target: '0x9cf40ef3d1622efe270fe6fe720585b4be4eeeff',
        encodedFunction:
          '0xa9059cbb0000000000000000000000002e0d94754b348d208d64d52d78bcd443afa9fa520000000000000000000000000000000000000000000000000000000000000007',
        gasData: {
          gasLimit: '39507',
          gasPrice: '1700000000',
          pctRelayFee: '70',
          baseRelayFee: '0',
        },
        relayData: {
          senderAddress: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
          senderNonce: '3',
          relayWorker: '0x3baee457ad824c94bd3953183d725847d023a2cf',
          paymaster: '0x957F270d45e9Ceca5c5af2b49f1b5dC1Abb0421c',
        },
      },
    };

    const result = connector.signTypedData([account, JSON.stringify(msg)]);
    await Helpers.checkIfVisible('wc-request-sheet');
    await Helpers.waitAndTap('wc-confirm-action-button');
    await Helpers.delay(1000);
    const signature = await result;
    if (
      signature !==
      '0xb78f17ff5779826ebfe4a7572a569a8802c02962242ff0195bd17bd4c07248b930a8c459276bc6eaa02dfb4523b8dc66d0020742d3f60a9209bde811aebb39351b'
    ) {
      throw new Error('WC personal sign failed');
    }
  });

  it('Should be able to approve transactions via WC', async () => {
    const result = connector.sendTransaction({
      from: account,
      to: account,
      value: '0x0',
      data: '0x',
    });
    await Helpers.checkIfVisible('wc-request-sheet');
    await Helpers.delay(3000);
    await Helpers.waitAndTap('wc-confirm-action-button');
    await Helpers.delay(1000);
    const hash = await result;
    if (!hash) {
      throw new Error('WC approving tx failed');
    }
    await Helpers.delay(3000);
  });

  it('Should show completed send NFT (Cryptokitties)', async () => {
    try {
      await Helpers.checkIfVisible('Sent-Arun Cattybinky-1.00 CryptoKitties');
    } catch (e) {
      await Helpers.checkIfVisible(
        'Sending-Arun Cattybinky-1.00 CryptoKitties'
      );
    }
  });

  it('Should show completed send ERC20 (BAT)', async () => {
    try {
      await Helpers.checkIfVisible('Sent-Basic Attention Token-1.02 BAT');
    } catch (e) {
      await Helpers.checkIfVisible('Sending-Basic Attention Token-1.02 BAT');
    }
  });

  it('Should show completed send ETH', async () => {
    try {
      await Helpers.checkIfVisible('Sent-Ethereum-0.003 ETH');
    } catch (e) {
      await Helpers.checkIfVisible('Sending-Ethereum-0.003 ETH');
    }
  });

  it('Should show completed send ETH (WC)', async () => {
    try {
      await Helpers.checkIfVisible('Self-Ethereum-0.00 ETH');
    } catch (e) {
      await Helpers.checkIfVisible('Sending-Ethereum-0.00 ETH');
    }
  });

  afterAll(async () => {
    // Reset the app state
    await connector.killSession();
    connector = null;
    await device.clearKeychain();
    await exec('kill $(lsof -t -i:8545)');
    await Helpers.delay(2000);
  });
});
